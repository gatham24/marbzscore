import { Link } from "@tanstack/react-router";
import type { Match } from "@/lib/mock-data";
import { getStatusLabel, getStatusColor } from "@/lib/mock-data";
import { LiveIndicator } from "./LiveIndicator";

export function MatchCard({ match }: { match: Match }) {
  const isLive = match.status === "live" || match.status === "halftime";
  const isUpcoming = match.status === "upcoming";

  return (
    <Link
      to="/match/$matchId"
      params={{ matchId: match.id }}
      className="group flex items-center gap-3 border-b border-border px-4 py-3 transition-colors hover:bg-secondary/50 last:border-b-0"
    >
      {/* Status column */}
      <div className="flex w-14 flex-col items-center gap-0.5">
        {isLive && <LiveIndicator />}
        <span className={`text-xs font-semibold ${getStatusColor(match.status)}`}>
          {isUpcoming ? match.startTime : getStatusLabel(match.status, match.minute)}
        </span>
      </div>

      {/* Teams & Score */}
      <div className="flex flex-1 flex-col gap-1">
        <TeamRow
          name={match.homeTeam}
          score={match.homeScore}
          isUpcoming={isUpcoming}
          isWinning={!isUpcoming && match.homeScore > match.awayScore}
          isLive={isLive}
        />
        <TeamRow
          name={match.awayTeam}
          score={match.awayScore}
          isUpcoming={isUpcoming}
          isWinning={!isUpcoming && match.awayScore > match.homeScore}
          isLive={isLive}
        />
      </div>

      {/* Arrow */}
      <div className="text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </Link>
  );
}

function TeamRow({
  name,
  score,
  isUpcoming,
  isWinning,
  isLive,
}: {
  name: string;
  score: number;
  isUpcoming: boolean;
  isWinning: boolean;
  isLive: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className={`text-sm ${isWinning ? "font-semibold text-foreground" : "text-surface-foreground"}`}>
        {name}
      </span>
      {!isUpcoming && (
        <span
          className={`min-w-[1.5rem] text-right font-mono text-sm font-bold ${
            isLive ? "text-foreground" : isWinning ? "text-foreground" : "text-muted-foreground"
          }`}
        >
          {score}
        </span>
      )}
    </div>
  );
}
