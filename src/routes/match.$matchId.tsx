import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { getMatchById, getStatusLabel, getStatusColor } from "@/lib/mock-data";
import { LiveIndicator } from "@/components/LiveIndicator";
import { MatchTimeline } from "@/components/MatchTimeline";
import { MatchStatsView } from "@/components/MatchStatsView";

export const Route = createFileRoute("/match/$matchId")({
  head: ({ params }) => {
    const match = getMatchById(params.matchId);
    const title = match
      ? `${match.homeTeam} vs ${match.awayTeam} — MarbzScore`
      : "Match — MarbzScore";
    return {
      meta: [
        { title },
        { name: "description", content: title },
        { property: "og:title", content: title },
      ],
    };
  },
  component: MatchDetailPage,
  notFoundComponent: () => (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-foreground">Match not found</h1>
        <Link to="/" className="mt-4 inline-block text-sm text-primary hover:underline">
          Back to scores
        </Link>
      </div>
    </div>
  ),
});

type Tab = "events" | "stats" | "lineups";

function MatchDetailPage() {
  const { matchId } = Route.useParams();
  const match = getMatchById(matchId);
  const [activeTab, setActiveTab] = useState<Tab>("events");

  if (!match) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-muted-foreground">Match not found</p>
      </div>
    );
  }

  const isLive = match.status === "live" || match.status === "halftime";

  return (
    <div className="mx-auto max-w-5xl">
      {/* Match Header */}
      <div className="border-b border-border bg-card px-4 py-6">
        <Link to="/" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>

        <div className="mb-2 text-center">
          <span className="text-xs text-muted-foreground">{match.league}</span>
        </div>

        <div className="flex items-center justify-center gap-6">
          <div className="flex-1 text-right">
            <h2 className="text-lg font-bold text-foreground sm:text-xl">{match.homeTeam}</h2>
          </div>

          <div className="flex flex-col items-center gap-1">
            {isLive && <LiveIndicator size="md" />}
            <div className="flex items-center gap-2">
              <span className="font-mono text-3xl font-black text-foreground sm:text-4xl">
                {match.homeScore}
              </span>
              <span className="text-xl text-muted-foreground">-</span>
              <span className="font-mono text-3xl font-black text-foreground sm:text-4xl">
                {match.awayScore}
              </span>
            </div>
            <span className={`text-xs font-semibold ${getStatusColor(match.status)}`}>
              {match.status === "upcoming" ? match.startTime : getStatusLabel(match.status, match.minute)}
            </span>
          </div>

          <div className="flex-1">
            <h2 className="text-lg font-bold text-foreground sm:text-xl">{match.awayTeam}</h2>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border bg-card">
        {(["events", "stats", "lineups"] as Tab[]).map((tab) => (
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
        {activeTab === "events" && <MatchTimeline match={match} />}
        {activeTab === "stats" && match.stats && <MatchStatsView stats={match.stats} />}
        {activeTab === "stats" && !match.stats && (
          <p className="p-8 text-center text-sm text-muted-foreground">No stats available yet</p>
        )}
        {activeTab === "lineups" && (
          <p className="p-8 text-center text-sm text-muted-foreground">Lineups not available yet</p>
        )}
      </div>
    </div>
  );
}
