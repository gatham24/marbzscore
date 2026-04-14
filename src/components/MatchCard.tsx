import { Link } from "@tanstack/react-router";
import type { ApiFixture } from "@/lib/api-types";
import { getApiStatusInfo } from "@/lib/api-types";
import { LiveIndicator } from "./LiveIndicator";

export function MatchCard({ match }: { match: ApiFixture }) {
  const status = getApiStatusInfo(match.fixture.status);
  const startTime = new Date(match.fixture.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <Link
      to="/match/$matchId"
      params={{ matchId: String(match.fixture.id) }}
      className="group flex items-center gap-3 border-b border-border px-4 py-3 transition-colors hover:bg-secondary/50 last:border-b-0"
    >
      {/* Status column */}
      <div className="flex w-14 flex-col items-center gap-0.5">
        {status.isLive && <LiveIndicator />}
        <span className={`text-xs font-semibold ${status.colorClass}`}>
          {status.isUpcoming ? startTime : status.label}
        </span>
      </div>

      {/* Teams & Score */}
      <div className="flex flex-1 flex-col gap-1">
        <TeamRow
          name={match.teams.home.name}
          logo={match.teams.home.logo}
          score={match.goals.home}
          isUpcoming={status.isUpcoming}
          isWinning={!status.isUpcoming && match.teams.home.winner === true}
          isLive={status.isLive || status.isHalftime}
        />
        <TeamRow
          name={match.teams.away.name}
          logo={match.teams.away.logo}
          score={match.goals.away}
          isUpcoming={status.isUpcoming}
          isWinning={!status.isUpcoming && match.teams.away.winner === true}
          isLive={status.isLive || status.isHalftime}
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
  logo,
  score,
  isUpcoming,
  isWinning,
  isLive,
}: {
  name: string;
  logo: string;
  score: number | null;
  isUpcoming: boolean;
  isWinning: boolean;
  isLive: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <img src={logo} alt={name} className="h-4 w-4 object-contain" loading="lazy" />
        <span className={`text-sm ${isWinning ? "font-semibold text-foreground" : "text-surface-foreground"}`}>
          {name}
        </span>
      </div>
      {!isUpcoming && score !== null && (
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
