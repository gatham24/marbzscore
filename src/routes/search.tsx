import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Search } from "lucide-react";

const popularLeagues = [
  { id: 39, name: "Premier League", country: "England" },
  { id: 140, name: "La Liga", country: "Spain" },
  { id: 135, name: "Serie A", country: "Italy" },
  { id: 78, name: "Bundesliga", country: "Germany" },
  { id: 61, name: "Ligue 1", country: "France" },
  { id: 2, name: "Champions League", country: "Europe" },
];

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

  const filtered = q
    ? popularLeagues.filter(l => l.name.toLowerCase().includes(q) || l.country.toLowerCase().includes(q))
    : [];

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search leagues..."
          className="w-full rounded-xl border border-border bg-card py-3 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          autoFocus
        />
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground">
          {q ? "Results" : "Popular Leagues"}
        </h2>
        {(q ? filtered : popularLeagues).map(league => (
          <div key={league.id} className="flex items-center gap-3 rounded-lg bg-card px-4 py-3">
            <div>
              <p className="text-sm font-medium text-foreground">{league.name}</p>
              <p className="text-xs text-muted-foreground">{league.country}</p>
            </div>
          </div>
        ))}
        {q && filtered.length === 0 && (
          <p className="py-12 text-center text-sm text-muted-foreground">No results for "{query}"</p>
        )}
      </div>
    </div>
  );
}
