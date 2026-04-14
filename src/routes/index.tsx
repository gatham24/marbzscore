import { createFileRoute } from "@tanstack/react-router";
import { matches } from "@/lib/mock-data";
import { LeagueSection } from "@/components/LeagueSection";
import { DateSelector } from "@/components/DateSelector";
import { LiveIndicator } from "@/components/LiveIndicator";

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

function HomePage() {
  const matchesByLeague = matches.reduce<Record<string, typeof matches>>((acc, match) => {
    if (!acc[match.league]) acc[match.league] = [];
    acc[match.league].push(match);
    return acc;
  }, {});

  const liveCount = matches.filter(m => m.status === "live" || m.status === "halftime").length;

  return (
    <div className="mx-auto max-w-5xl px-4 py-4">
      <DateSelector />

      {liveCount > 0 && (
        <div className="mb-4 flex items-center gap-2 rounded-lg bg-live/10 px-4 py-2.5">
          <LiveIndicator size="md" />
          <span className="text-sm font-medium text-foreground">
            {liveCount} match{liveCount > 1 ? "es" : ""} in progress
          </span>
        </div>
      )}

      <div className="space-y-4">
        {Object.entries(matchesByLeague).map(([league, leagueMatches]) => (
          <LeagueSection key={league} league={league} matches={leagueMatches} />
        ))}
      </div>
    </div>
  );
}
