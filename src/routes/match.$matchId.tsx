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

type Tab = "events" | "stats";

function MatchDetailPage() {
  const { matchId } = Route.useParams();
  const [fixture, setFixture] = useState<ApiFixture | null>(null);
  const [events, setEvents] = useState<ApiEvent[]>([]);
  const [statistics, setStatistics] = useState<ApiStatistic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("events");

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const result = await fetchMatchDetails({ data: { fixtureId: parseInt(matchId, 10) } });
        if (result.error) {
          setError(result.error);
        } else {
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
    <div className="mx-auto max-w-5xl">
      {/* Match Header */}
      <div className="border-b border-border bg-card px-4 py-6">
        <Link to="/" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>

        <div className="mb-2 text-center">
          <span className="text-xs text-muted-foreground">{fixture.league.name} — {fixture.league.round}</span>
        </div>

        <div className="flex items-center justify-center gap-6">
          <div className="flex flex-1 flex-col items-end gap-1">
            <img src={fixture.teams.home.logo} alt={fixture.teams.home.name} className="h-10 w-10 object-contain" />
            <h2 className="text-sm font-bold text-foreground sm:text-base">{fixture.teams.home.name}</h2>
          </div>

          <div className="flex flex-col items-center gap-1">
            {(status.isLive || status.isHalftime) && <LiveIndicator size="md" />}
            <div className="flex items-center gap-2">
              <span className="font-mono text-3xl font-black text-foreground sm:text-4xl">
                {fixture.goals.home ?? 0}
              </span>
              <span className="text-xl text-muted-foreground">-</span>
              <span className="font-mono text-3xl font-black text-foreground sm:text-4xl">
                {fixture.goals.away ?? 0}
              </span>
            </div>
            <span className={`text-xs font-semibold ${status.colorClass}`}>{status.label}</span>
          </div>

          <div className="flex flex-1 flex-col items-start gap-1">
            <img src={fixture.teams.away.logo} alt={fixture.teams.away.name} className="h-10 w-10 object-contain" />
            <h2 className="text-sm font-bold text-foreground sm:text-base">{fixture.teams.away.name}</h2>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border bg-card">
        {(["events", "stats"] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3 text-center text-sm font-medium capitalize transition-colors ${
              activeTab === tab
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-card">
        {activeTab === "events" && <EventsList events={events} fixture={fixture} />}
        {activeTab === "stats" && <StatsView statistics={statistics} />}
      </div>
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
    return <p className="p-8 text-center text-sm text-muted-foreground">No events yet</p>;
  }

  const sorted = [...events].sort((a, b) => b.time.elapsed - a.time.elapsed);

  return (
    <div>
      {sorted.map((event, i) => {
        const eventType = getEventType(event);
        const isHome = event.team.id === fixture.teams.home.id;
        return (
          <div
            key={i}
            className={`flex items-start gap-3 border-b border-border/50 px-4 py-2.5 ${
              eventType === "goal" ? "bg-primary/5" : ""
            }`}
          >
            <span className="w-8 pt-0.5 text-right font-mono text-xs font-semibold text-muted-foreground">
              {event.time.elapsed}'{event.time.extra ? `+${event.time.extra}` : ""}
            </span>
            <div className="flex w-5 items-center justify-center pt-0.5">
              <EventIcon type={eventType} />
            </div>
            <div className="flex-1">
              <span className={`text-sm ${eventType === "goal" ? "font-semibold text-foreground" : "text-surface-foreground"}`}>
                {event.player.name}
                {event.assist.name && eventType === "goal" && (
                  <span className="text-muted-foreground"> ({event.assist.name})</span>
                )}
                {eventType === "substitution" && event.assist.name && (
                  <span className="text-muted-foreground"> ↔ {event.assist.name}</span>
                )}
              </span>
              {eventType === "goal" && <span className="ml-2 text-xs font-medium text-primary">GOAL</span>}
            </div>
            <span className="text-xs text-muted-foreground">{isHome ? fixture.teams.home.name : fixture.teams.away.name}</span>
          </div>
        );
      })}
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
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className={homeWins ? "font-semibold text-foreground" : "text-muted-foreground"}>
          {home}{isPercentage ? "%" : ""}
        </span>
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className={awayWins ? "font-semibold text-foreground" : "text-muted-foreground"}>
          {away}{isPercentage ? "%" : ""}
        </span>
      </div>
      <div className="flex h-1.5 gap-1 overflow-hidden rounded-full">
        <div className={`rounded-full transition-all ${homeWins ? "bg-primary" : "bg-muted"}`} style={{ width: `${homePercent}%` }} />
        <div className={`rounded-full transition-all ${awayWins ? "bg-primary" : "bg-muted"}`} style={{ width: `${awayPercent}%` }} />
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
    { label: "Possession", key: "Ball Possession", pct: true },
    { label: "Shots", key: "Total Shots" },
    { label: "Shots on Target", key: "Shots on Goal" },
    { label: "Corners", key: "Corner Kicks" },
    { label: "Fouls", key: "Fouls" },
    { label: "Passes", key: "Total passes" },
    { label: "Pass Accuracy", key: "Passes %", pct: true },
    { label: "Yellow Cards", key: "Yellow Cards" },
    { label: "Red Cards", key: "Red Cards" },
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
