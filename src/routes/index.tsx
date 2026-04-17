import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useCallback, useMemo } from "react";
import { fetchMatchesByDate, fetchLiveMatches } from "@/lib/api.functions";
import type { ApiFixture } from "@/lib/api-types";
import { LeagueSection } from "@/components/LeagueSection";
import { LiveIndicator } from "@/components/LiveIndicator";
import { RefreshCountdown } from "@/components/RefreshCountdown";
import { useFavoriteTeams } from "@/hooks/useFavorites";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComp } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { Loader2, ChevronLeft, ChevronRight, Calendar, X, Star } from "lucide-react";

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>) => ({
    league: search.league ? Number(search.league) : undefined,
    leagueName: typeof search.leagueName === "string" ? search.leagueName : undefined,
    team: search.team ? Number(search.team) : undefined,
    teamName: typeof search.teamName === "string" ? search.teamName : undefined,
    country: typeof search.country === "string" ? search.country : undefined,
  }),
  head: () => ({
    meta: [
      { title: "MarbzScore — Live Scores & Results" },
      { name: "description", content: "Follow live football scores, results, and match details in real-time." },
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
  const { league, leagueName, team, teamName, country } = Route.useSearch();
  const navigate = useNavigate({ from: "/" });
  const { teams: favoriteTeams } = useFavoriteTeams();
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

  // Apply filters
  const filteredFixtures = useMemo(() => {
    return fixtures.filter(f => {
      if (league && f.league.id !== league) return false;
      if (team && f.teams.home.id !== team && f.teams.away.id !== team) return false;
      if (country && f.league.country?.toLowerCase() !== country.toLowerCase()) return false;
      return true;
    });
  }, [fixtures, league, team, country]);

  const activeFilterLabel = leagueName || teamName || country;
  const hasFilter = !!(league || team || country);

  // Split favorites vs others
  const favoriteIds = useMemo(() => new Set(favoriteTeams.map(t => t.team_id)), [favoriteTeams]);
  const { favoriteFixtures, otherFixtures } = useMemo(() => {
    if (favoriteIds.size === 0) return { favoriteFixtures: [], otherFixtures: filteredFixtures };
    const fav: ApiFixture[] = [];
    const other: ApiFixture[] = [];
    for (const f of filteredFixtures) {
      if (favoriteIds.has(f.teams.home.id) || favoriteIds.has(f.teams.away.id)) fav.push(f);
      else other.push(f);
    }
    return { favoriteFixtures: fav, otherFixtures: other };
  }, [filteredFixtures, favoriteIds]);

  const leagueGroups = groupByLeague(otherFixtures);

  const changeDate = (offset: number) => {
    const d = new Date(date + "T12:00:00");
    d.setDate(d.getDate() + offset);
    setDate(d.toISOString().split("T")[0]);
  };

  const clearFilter = () => {
    navigate({ search: () => ({ league: undefined, leagueName: undefined, team: undefined, teamName: undefined, country: undefined }) });
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-3">
      {/* Active filter chip */}
      {hasFilter && (
        <div className="mb-3 flex items-center justify-between rounded-lg bg-primary/10 px-3 py-2">
          <span className="text-sm text-foreground">
            Filtering: <span className="font-semibold">{activeFilterLabel}</span>
          </span>
          <button onClick={clearFilter} className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-primary hover:bg-primary/10">
            <X className="h-3 w-3" /> Clear
          </button>
        </div>
      )}

      {/* Date selector */}
      <div className="mb-4 flex items-center gap-2">
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

        <Popover>
          <PopoverTrigger asChild>
            <button className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground">
              <Calendar className="h-4 w-4" />
            </button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-auto p-0">
            <CalendarComp
              mode="single"
              selected={new Date(date + "T12:00:00")}
              onSelect={(d) => { if (d) setDate(d.toISOString().split("T")[0]); }}
              initialFocus
              className={cn("p-3 pointer-events-auto")}
            />
          </PopoverContent>
        </Popover>
      </div>

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

      {!loading && !error && filteredFixtures.length === 0 && (
        <div className="py-20 text-center">
          <p className="text-muted-foreground">
            {hasFilter ? "No matches for this filter on this date" : "No matches on this date"}
          </p>
          {hasFilter && (
            <button onClick={clearFilter} className="mt-3 text-xs text-primary hover:underline">
              Show all matches
            </button>
          )}
        </div>
      )}

      {!loading && !error && filteredFixtures.length > 0 && (
        <div className="space-y-3">
          {favoriteFixtures.length > 0 && (
            <div className="overflow-hidden rounded-xl border border-primary/30 bg-card">
              <div className="flex items-center gap-2 border-b border-border bg-primary/10 px-4 py-2">
                <Star className="h-4 w-4 fill-primary text-primary" />
                <h3 className="text-sm font-semibold text-foreground">Your Teams</h3>
                <span className="text-xs text-muted-foreground">({favoriteFixtures.length})</span>
              </div>
              <div>
                {favoriteFixtures.map(match => (
                  <FavoriteMatchRow key={match.fixture.id} match={match} />
                ))}
              </div>
            </div>
          )}

          {leagueGroups.map(({ league: lg, matches }) => (
            <LeagueSection
              key={lg.id}
              leagueName={lg.name}
              leagueCountry={lg.country}
              leagueLogo={lg.logo}
              leagueFlag={lg.flag}
              matches={matches}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Lightweight row reusing MatchCard pattern via Link
import { MatchCard } from "@/components/MatchCard";
function FavoriteMatchRow({ match }: { match: ApiFixture }) {
  return <MatchCard match={match} />;
}
