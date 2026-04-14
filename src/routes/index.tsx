import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import { fetchMatchesByDate, fetchLiveMatches } from "@/lib/api.functions";
import type { ApiFixture } from "@/lib/api-types";
import { LeagueSection } from "@/components/LeagueSection";
import { DateSelector } from "@/components/DateSelector";
import { LiveIndicator } from "@/components/LiveIndicator";
import { Loader2 } from "lucide-react";

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
    if (!groups[key]) {
      groups[key] = { league: f.league, matches: [] };
    }
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
      if (result.error) {
        setError(result.error);
      } else {
        setFixtures(result.fixtures);
      }
    } catch {
      setError("Failed to load matches");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(date);
  }, [date, load]);

  // Auto-refresh live matches every 60s
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const result = await fetchLiveMatches();
        if (result.fixtures.length > 0) {
          setFixtures(prev => {
            const liveIds = new Set(result.fixtures.map((f: ApiFixture) => f.fixture.id));
            const nonLive = prev.filter(f => !liveIds.has(f.fixture.id));
            return [...result.fixtures, ...nonLive];
          });
        }
      } catch {
        // silent fail on auto-refresh
      }
    }, 60000);
    return () => clearInterval(interval);
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
    <div className="mx-auto max-w-5xl px-4 py-4">
      <DateSelector
        label={formatDateLabel(date)}
        onPrev={() => changeDate(-1)}
        onNext={() => changeDate(1)}
        onToday={() => setDate(getToday())}
        isToday={date === getToday()}
      />

      {liveCount > 0 && (
        <div className="mb-4 flex items-center gap-2 rounded-lg bg-live/10 px-4 py-2.5">
          <LiveIndicator size="md" />
          <span className="text-sm font-medium text-foreground">
            {liveCount} match{liveCount > 1 ? "es" : ""} in progress
          </span>
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
          <button onClick={() => load(date)} className="mt-2 text-xs text-primary hover:underline">
            Try again
          </button>
        </div>
      )}

      {!loading && !error && fixtures.length === 0 && (
        <div className="py-20 text-center">
          <p className="text-muted-foreground">No matches on this date</p>
        </div>
      )}

      {!loading && !error && (
        <div className="space-y-4">
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
