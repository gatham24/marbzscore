import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import { fetchMatchesByDate, fetchLiveMatches } from "@/lib/api.functions";
import type { ApiFixture } from "@/lib/api-types";
import { LeagueSection } from "@/components/LeagueSection";
import { LiveIndicator } from "@/components/LiveIndicator";
import { RefreshCountdown } from "@/components/RefreshCountdown";
import { Loader2, ChevronLeft, ChevronRight, Calendar } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MarbzScore — Live Scores & Results" },
      { name: "description", content: "Follow live football scores, results, and match details in real-time." },
      { property: "og:title", content: "MarbzScore — Live Scores & Results" },
      { property: "og:description", content: "Follow live football scores, results, and match details in real-time." },
    ],
  }),
  component: HomePage,
});

function getToday() {
  return new Date().toISOString().split("T")[0];
}

function formatDateLabel(dateStr: string) {
  const today = getToday();
  const d = new Date(dateStr + "T12:00:00");
  const t = new Date(today + "T12:00:00");
  const diff = Math.round((d.getTime() - t.getTime()) / 86400000);
  if (diff === 0) return "Today";
  if (diff === -1) return "Yesterday";
  if (diff === 1) return "Tomorrow";
  return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
}

function groupByLeague(fixtures: ApiFixture[]) {
  const groups: Record<string, { league: ApiFixture["league"]; matches: ApiFixture[] }> = {};
  for (const f of fixtures) {
    const key = `${f.league.id}`;
    if (!groups[key]) groups[key] = { league: f.league, matches: [] };
    groups[key].matches.push(f);
  }
  return Object.values(groups);
}

function HomePage() {
  const [date, setDate] = useState(getToday);
  const [fixtures, setFixtures] = useState<ApiFixture[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (d: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchMatchesByDate({ data: { date: d } });
      if (result.error) setError(result.error);
      else setFixtures(result.fixtures);
    } catch {
      setError("Failed to load matches");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(date); }, [date, load]);

  const refreshLive = useCallback(async () => {
    try {
      const result = await fetchLiveMatches();
      if (result.fixtures.length > 0) {
        setFixtures(prev => {
          const liveIds = new Set(result.fixtures.map((f: ApiFixture) => f.fixture.id));
          const nonLive = prev.filter(f => !liveIds.has(f.fixture.id));
          return [...result.fixtures, ...nonLive];
        });
      }
    } catch { /* silent */ }
  }, []);

  const liveCount = fixtures.filter(f => {
    const s = f.fixture.status.short;
    return ["1H", "2H", "ET", "BT", "P", "LIVE", "INT", "HT"].includes(s);
  }).length;

  const leagueGroups = groupByLeague(fixtures);

  const changeDate = (offset: number) => {
    const d = new Date(date + "T12:00:00");
    d.setDate(d.getDate() + offset);
    setDate(d.toISOString().split("T")[0]);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-3">
      {/* Date selector - LiveScore style */}
      <div className="mb-4 flex items-center gap-2">
        {/* LIVE button */}
        <button
          onClick={() => setDate(getToday())}
          className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-colors ${
            liveCount > 0
              ? "bg-live text-live-foreground"
              : "bg-secondary text-muted-foreground"
          }`}
        >
          {liveCount > 0 && <span className="h-1.5 w-1.5 rounded-full bg-live-foreground animate-live-pulse" />}
          LIVE
        </button>

        <div className="flex flex-1 items-center justify-center gap-2">
          <button onClick={() => changeDate(-1)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="min-w-[8rem] text-center text-sm font-semibold text-foreground">
            {formatDateLabel(date)}
          </span>
          <button onClick={() => changeDate(1)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <button className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground">
          <Calendar className="h-4 w-4" />
        </button>
      </div>

      {/* Live banner */}
      {liveCount > 0 && (
        <div className="mb-3 flex items-center justify-between rounded-lg bg-live/10 px-4 py-2">
          <div className="flex items-center gap-2">
            <LiveIndicator size="md" />
            <span className="text-sm font-medium text-foreground">
              {liveCount} match{liveCount > 1 ? "es" : ""} live
            </span>
          </div>
          <RefreshCountdown onRefresh={refreshLive} hasLive={liveCount > 0} />
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      )}

      {error && !loading && (
        <div className="rounded-lg bg-destructive/10 px-4 py-8 text-center">
          <p className="text-sm text-destructive">{error}</p>
          <button onClick={() => load(date)} className="mt-2 text-xs text-primary hover:underline">Try again</button>
        </div>
      )}

      {!loading && !error && fixtures.length === 0 && (
        <div className="py-20 text-center">
          <p className="text-muted-foreground">No matches on this date</p>
        </div>
      )}

      {!loading && !error && (
        <div className="space-y-3">
          {leagueGroups.map(({ league, matches }) => (
            <LeagueSection
              key={league.id}
              leagueName={league.name}
              leagueCountry={league.country}
              leagueLogo={league.logo}
              leagueFlag={league.flag}
              matches={matches}
            />
          ))}
        </div>
      )}
    </div>
  );
}
