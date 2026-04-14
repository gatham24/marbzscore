import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { fetchStandings } from "@/lib/api.functions";
import type { ApiStanding } from "@/lib/api-types";

const TOP_LEAGUES = [
  { id: 39, name: "Premier League", country: "England", season: 2024 },
  { id: 140, name: "La Liga", country: "Spain", season: 2024 },
  { id: 135, name: "Serie A", country: "Italy", season: 2024 },
  { id: 78, name: "Bundesliga", country: "Germany", season: 2024 },
  { id: 61, name: "Ligue 1", country: "France", season: 2024 },
];

export const Route = createFileRoute("/standings")({
  head: () => ({
    meta: [
      { title: "Standings — MarbzScore" },
      { name: "description", content: "League standings for top football leagues." },
      { property: "og:title", content: "Standings — MarbzScore" },
    ],
  }),
  component: StandingsPage,
});

function FormBadge({ result }: { result: string }) {
  const colors: Record<string, string> = {
    W: "bg-primary text-primary-foreground",
    D: "bg-muted text-muted-foreground",
    L: "bg-destructive text-destructive-foreground",
  };
  return (
    <span className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${colors[result] || "bg-muted text-muted-foreground"}`}>
      {result}
    </span>
  );
}

function StandingsPage() {
  const [selectedLeague, setSelectedLeague] = useState(TOP_LEAGUES[0]);
  const [standings, setStandings] = useState<ApiStanding[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const result = await fetchStandings({
          data: { leagueId: selectedLeague.id, season: selectedLeague.season },
        });
        if (result.error) {
          setError(result.error);
        } else {
          setStandings(result.standings);
        }
      } catch {
        setError("Failed to load standings");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [selectedLeague]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      {/* League selector */}
      <div className="mb-4 flex flex-wrap gap-2">
        {TOP_LEAGUES.map(league => (
          <button
            key={league.id}
            onClick={() => setSelectedLeague(league)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              selectedLeague.id === league.id
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            {league.name}
          </button>
        ))}
      </div>

      <h1 className="mb-4 text-xl font-bold text-foreground">{selectedLeague.name}</h1>

      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      )}

      {error && !loading && (
        <div className="rounded-lg bg-destructive/10 px-4 py-8 text-center">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {!loading && !error && (
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/30 text-xs text-muted-foreground">
                  <th className="w-8 px-3 py-2.5 text-center">#</th>
                  <th className="px-3 py-2.5 text-left">Team</th>
                  <th className="w-8 px-2 py-2.5 text-center">P</th>
                  <th className="w-8 px-2 py-2.5 text-center">W</th>
                  <th className="w-8 px-2 py-2.5 text-center">D</th>
                  <th className="w-8 px-2 py-2.5 text-center">L</th>
                  <th className="hidden w-10 px-2 py-2.5 text-center sm:table-cell">GF</th>
                  <th className="hidden w-10 px-2 py-2.5 text-center sm:table-cell">GA</th>
                  <th className="w-10 px-2 py-2.5 text-center">GD</th>
                  <th className="w-10 px-2 py-2.5 text-center font-semibold">Pts</th>
                  <th className="hidden px-3 py-2.5 text-center md:table-cell">Form</th>
                </tr>
              </thead>
              <tbody>
                {standings.map((row) => (
                  <tr key={row.team.id} className="border-b border-border/50 transition-colors hover:bg-secondary/30">
                    <td className="px-3 py-2.5 text-center text-xs font-medium">
                      <span className={row.rank <= 4 ? "font-bold text-primary" : "text-muted-foreground"}>
                        {row.rank}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        <img src={row.team.logo} alt={row.team.name} className="h-4 w-4 object-contain" />
                        <span className="font-medium text-foreground">{row.team.name}</span>
                      </div>
                    </td>
                    <td className="px-2 py-2.5 text-center text-muted-foreground">{row.all.played}</td>
                    <td className="px-2 py-2.5 text-center text-muted-foreground">{row.all.win}</td>
                    <td className="px-2 py-2.5 text-center text-muted-foreground">{row.all.draw}</td>
                    <td className="px-2 py-2.5 text-center text-muted-foreground">{row.all.lose}</td>
                    <td className="hidden px-2 py-2.5 text-center text-muted-foreground sm:table-cell">{row.all.goals.for}</td>
                    <td className="hidden px-2 py-2.5 text-center text-muted-foreground sm:table-cell">{row.all.goals.against}</td>
                    <td className="px-2 py-2.5 text-center font-medium text-foreground">
                      {row.goalsDiff > 0 ? `+${row.goalsDiff}` : row.goalsDiff}
                    </td>
                    <td className="px-2 py-2.5 text-center font-bold text-foreground">{row.points}</td>
                    <td className="hidden px-3 py-2.5 md:table-cell">
                      <div className="flex justify-center gap-0.5">
                        {row.form?.split("").map((r, i) => (
                          <FormBadge key={i} result={r} />
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
