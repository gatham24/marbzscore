import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { fetchMatchDetails } from "@/lib/api.functions";
import type { ApiFixture, ApiEvent, ApiStatistic } from "@/lib/api-types";
import { getApiStatusInfo, getEventType, getStatValue } from "@/lib/api-types";
import { LiveIndicator } from "@/components/LiveIndicator";

export const Route = createFileRoute("/match/$matchId")({
  head: () => ({
    meta: [
      { title: "Match Details — MarbzScore" },
      { name: "description", content: "Live match details, events, and statistics." },
    ],
  }),
  component: MatchDetailPage,
  notFoundComponent: () => (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-foreground">Match not found</h1>
        <Link to="/" className="mt-4 inline-block text-sm text-primary hover:underline">Back to scores</Link>
      </div>
    </div>
  ),
});

type Tab = "info" | "summary" | "stats";

function MatchDetailPage() {
  const { matchId } = Route.useParams();
  const [fixture, setFixture] = useState<ApiFixture | null>(null);
  const [events, setEvents] = useState<ApiEvent[]>([]);
  const [statistics, setStatistics] = useState<ApiStatistic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("summary");

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const result = await fetchMatchDetails({ data: { fixtureId: parseInt(matchId, 10) } });
        if (result.error) setError(result.error);
        else {
          setFixture(result.fixture);
          setEvents(result.events);
          setStatistics(result.statistics);
        }
      } catch {
        setError("Failed to load match");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [matchId]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !fixture) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-destructive">{error || "Match not found"}</p>
          <Link to="/" className="mt-4 inline-block text-sm text-primary hover:underline">Back to scores</Link>
        </div>
      </div>
    );
  }

  const status = getApiStatusInfo(fixture.fixture.status);

  return (
    <div className="mx-auto max-w-4xl">
      {/* League header */}
      <div className="flex items-center gap-2 border-b border-border bg-card px-4 py-2">
        <Link to="/" className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        {fixture.league.logo && (
          <img src={fixture.league.logo} alt={fixture.league.name} className="h-5 w-5 object-contain" />
        )}
        <div>
          <span className="text-sm font-semibold text-foreground">{fixture.league.name}</span>
          <span className="ml-2 text-xs text-muted-foreground">{fixture.league.round}</span>
        </div>
      </div>

      {/* Score header */}
      <div className="bg-card px-4 py-6">
        <div className="flex items-center justify-center gap-8">
          <div className="flex flex-col items-center gap-2">
            <img src={fixture.teams.home.logo} alt={fixture.teams.home.name} className="h-14 w-14 object-contain" />
            <h2 className="text-sm font-bold text-foreground">{fixture.teams.home.name}</h2>
          </div>

          <div className="flex flex-col items-center gap-1">
            {(status.isLive || status.isHalftime) && <LiveIndicator size="md" />}
            <div className="flex items-center gap-3">
              <span className="font-mono text-4xl font-black text-foreground">
                {fixture.goals.home ?? 0}
              </span>
              <span className="text-2xl text-muted-foreground">–</span>
              <span className="font-mono text-4xl font-black text-foreground">
                {fixture.goals.away ?? 0}
              </span>
            </div>
            <span className={`text-xs font-semibold ${status.colorClass}`}>{status.label}</span>
            {fixture.score.halftime.home !== null && (
              <span className="text-xs text-muted-foreground">
                HT: {fixture.score.halftime.home} - {fixture.score.halftime.away}
              </span>
            )}
          </div>

          <div className="flex flex-col items-center gap-2">
            <img src={fixture.teams.away.logo} alt={fixture.teams.away.name} className="h-14 w-14 object-contain" />
            <h2 className="text-sm font-bold text-foreground">{fixture.teams.away.name}</h2>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border bg-card">
        {(["info", "summary", "stats"] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3 text-center text-sm font-medium capitalize transition-colors ${
              activeTab === tab
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab === "summary" ? "Summary" : tab === "stats" ? "Stats" : "Info"}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-card">
        {activeTab === "info" && <InfoTab fixture={fixture} />}
        {activeTab === "summary" && <EventsList events={events} fixture={fixture} />}
        {activeTab === "stats" && <StatsView statistics={statistics} />}
      </div>
    </div>
  );
}

function InfoTab({ fixture }: { fixture: ApiFixture }) {
  const matchDate = new Date(fixture.fixture.date);
  return (
    <div className="space-y-4 p-4">
      <div className="space-y-3">
        <InfoRow label="Competition" value={`${fixture.league.name} — ${fixture.league.round}`} />
        <InfoRow label="Date" value={matchDate.toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" })} />
        <InfoRow label="Kick-off" value={matchDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} />
        {fixture.fixture.referee && <InfoRow label="Referee" value={fixture.fixture.referee} />}
        <InfoRow label="Country" value={fixture.league.country} />
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border/50 py-2">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm text-foreground">{value}</span>
    </div>
  );
}

function EventIcon({ type }: { type: string }) {
  switch (type) {
    case "goal": return <span className="text-base">⚽</span>;
    case "yellow_card": return <span className="inline-block h-4 w-3 rounded-sm bg-score-highlight" />;
    case "red_card": return <span className="inline-block h-4 w-3 rounded-sm bg-destructive" />;
    case "substitution": return <span className="text-base">🔄</span>;
    case "var": return <span className="text-xs font-bold text-muted-foreground">VAR</span>;
    default: return null;
  }
}

function EventsList({ events, fixture }: { events: ApiEvent[]; fixture: ApiFixture }) {
  if (events.length === 0) {
    return <p className="p-8 text-center text-sm text-muted-foreground">No events available</p>;
  }

  const sorted = [...events].sort((a, b) => a.time.elapsed - b.time.elapsed);

  // Group by half
  const firstHalf = sorted.filter(e => e.time.elapsed <= 45);
  const secondHalf = sorted.filter(e => e.time.elapsed > 45);

  return (
    <div>
      {/* HT marker */}
      <div className="flex items-center justify-center gap-4 border-b border-border/50 py-2">
        <span className="text-xs font-semibold text-primary">HT</span>
        <span className="font-mono text-sm font-bold text-foreground">
          {fixture.score.halftime.home ?? 0} - {fixture.score.halftime.away ?? 0}
        </span>
      </div>

      {firstHalf.map((event, i) => (
        <EventRow key={`1h-${i}`} event={event} fixture={fixture} />
      ))}

      {secondHalf.length > 0 && (
        <>
          {secondHalf.map((event, i) => (
            <EventRow key={`2h-${i}`} event={event} fixture={fixture} />
          ))}
        </>
      )}

      {/* FT marker */}
      <div className="flex items-center justify-center gap-4 border-t border-border/50 py-2">
        <span className="text-xs font-semibold text-primary">FT</span>
        <span className="font-mono text-sm font-bold text-foreground">
          {fixture.goals.home ?? 0} - {fixture.goals.away ?? 0}
        </span>
      </div>
    </div>
  );
}

function EventRow({ event, fixture }: { event: ApiEvent; fixture: ApiFixture }) {
  const eventType = getEventType(event);
  const isHome = event.team.id === fixture.teams.home.id;

  return (
    <div className={`flex items-center gap-3 border-b border-border/30 px-4 py-2 ${
      eventType === "goal" ? "bg-primary/5" : ""
    }`}>
      <span className="w-10 text-center font-mono text-xs font-semibold text-muted-foreground">
        {event.time.elapsed}'{event.time.extra ? `+${event.time.extra}` : ""}
      </span>

      {/* Home side */}
      <div className="flex flex-1 items-center justify-end gap-2">
        {isHome && (
          <>
            <span className={`text-sm ${eventType === "goal" ? "font-semibold text-foreground" : "text-surface-foreground"}`}>
              {event.player.name}
              {eventType === "substitution" && event.assist.name && (
                <span className="text-muted-foreground"> ↔ {event.assist.name}</span>
              )}
            </span>
            <EventIcon type={eventType} />
          </>
        )}
      </div>

      {/* Away side */}
      <div className="flex flex-1 items-center gap-2">
        {!isHome && (
          <>
            <EventIcon type={eventType} />
            <span className={`text-sm ${eventType === "goal" ? "font-semibold text-foreground" : "text-surface-foreground"}`}>
              {event.player.name}
              {eventType === "substitution" && event.assist.name && (
                <span className="text-muted-foreground"> ↔ {event.assist.name}</span>
              )}
            </span>
          </>
        )}
      </div>
    </div>
  );
}

function StatBar({ label, home, away, isPercentage }: { label: string; home: number; away: number; isPercentage?: boolean }) {
  const total = home + away || 1;
  const homePercent = (home / total) * 100;
  const awayPercent = (away / total) * 100;
  const homeWins = home > away;
  const awayWins = away > home;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className={homeWins ? "font-bold text-foreground" : "text-muted-foreground"}>
          {home}{isPercentage ? "%" : ""}
        </span>
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className={awayWins ? "font-bold text-foreground" : "text-muted-foreground"}>
          {away}{isPercentage ? "%" : ""}
        </span>
      </div>
      <div className="flex h-1.5 gap-1 overflow-hidden rounded-full">
        <div
          className={`rounded-full transition-all ${homeWins ? "bg-primary" : "bg-muted"}`}
          style={{ width: `${homePercent}%` }}
        />
        <div
          className={`rounded-full transition-all ${awayWins ? "bg-primary" : "bg-muted"}`}
          style={{ width: `${awayPercent}%` }}
        />
      </div>
    </div>
  );
}

function StatsView({ statistics }: { statistics: ApiStatistic[] }) {
  if (statistics.length < 2) {
    return <p className="p-8 text-center text-sm text-muted-foreground">No statistics available</p>;
  }

  const home = statistics[0].statistics;
  const away = statistics[1].statistics;

  const stats = [
    { label: "Possession (%)", key: "Ball Possession", pct: true },
    { label: "Shots on target", key: "Shots on Goal" },
    { label: "Shots off target", key: "Shots off Goal" },
    { label: "Blocked Shots", key: "Blocked Shots" },
    { label: "Corner Kicks", key: "Corner Kicks" },
    { label: "Offsides", key: "Offsides" },
    { label: "Fouls", key: "Fouls" },
    { label: "Throw ins", key: "Throw-in" },
    { label: "Yellow cards", key: "Yellow Cards" },
    { label: "Red cards", key: "Red Cards" },
    { label: "Crosses", key: "Crosses total" },
    { label: "Goalkeeper saves", key: "Goalkeeper Saves" },
    { label: "Goal kicks", key: "Goal Kicks" },
  ];

  return (
    <div className="space-y-4 p-4">
      {stats.map(s => (
        <StatBar
          key={s.key}
          label={s.label}
          home={getStatValue(home, s.key)}
          away={getStatValue(away, s.key)}
          isPercentage={s.pct}
        />
      ))}
    </div>
  );
}
