import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { matches, leagues } from "@/lib/mock-data";

export const Route = createFileRoute("/search")({
  head: () => ({
    meta: [
      { title: "Search — MarbzScore" },
      { name: "description", content: "Search for teams, leagues, and matches." },
    ],
  }),
  component: SearchPage,
});

function SearchPage() {
  const [query, setQuery] = useState("");

  const q = query.toLowerCase().trim();
  const filteredMatches = q
    ? matches.filter(
        m =>
          m.homeTeam.toLowerCase().includes(q) ||
          m.awayTeam.toLowerCase().includes(q) ||
          m.league.toLowerCase().includes(q)
      )
    : [];

  const filteredLeagues = q
    ? leagues.filter(l => l.name.toLowerCase().includes(q) || l.country.toLowerCase().includes(q))
    : [];

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search teams, leagues..."
          className="w-full rounded-xl border border-border bg-card py-3 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          autoFocus
        />
      </div>

      {!q && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground">Popular Leagues</h2>
          {leagues.map(league => (
            <div key={league.id} className="flex items-center gap-3 rounded-lg bg-card px-4 py-3">
              <span className="text-lg">{league.flag}</span>
              <div>
                <p className="text-sm font-medium text-foreground">{league.name}</p>
                <p className="text-xs text-muted-foreground">{league.country}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {q && filteredLeagues.length > 0 && (
        <div className="mb-6 space-y-2">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Leagues</h2>
          {filteredLeagues.map(league => (
            <div key={league.id} className="flex items-center gap-3 rounded-lg bg-card px-4 py-3">
              <span>{league.flag}</span>
              <span className="text-sm font-medium text-foreground">{league.name}</span>
            </div>
          ))}
        </div>
      )}

      {q && filteredMatches.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Matches</h2>
          {filteredMatches.map(match => (
            <Link
              key={match.id}
              to="/match/$matchId"
              params={{ matchId: match.id }}
              className="flex items-center justify-between rounded-lg bg-card px-4 py-3 transition-colors hover:bg-secondary/50"
            >
              <span className="text-sm text-foreground">
                {match.homeTeam} vs {match.awayTeam}
              </span>
              <span className="text-xs text-muted-foreground">{match.league}</span>
            </Link>
          ))}
        </div>
      )}

      {q && filteredMatches.length === 0 && filteredLeagues.length === 0 && (
        <p className="py-12 text-center text-sm text-muted-foreground">
          No results for "{query}"
        </p>
      )}
    </div>
  );
}
