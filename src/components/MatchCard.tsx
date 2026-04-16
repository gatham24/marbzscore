import { Link } from "@tanstack/react-router";
import type { ApiFixture } from "@/lib/api-types";
import { getApiStatusInfo } from "@/lib/api-types";
import { LiveIndicator } from "./LiveIndicator";
import { Star } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useSavedMatches } from "@/hooks/useFavorites";

export function MatchCard({ match }: { match: ApiFixture }) {
  const status = getApiStatusInfo(match.fixture.status);
  const startTime = new Date(match.fixture.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const { user } = useAuth();
  const { isSaved, toggle } = useSavedMatches();
  const saved = user ? isSaved(match.fixture.id) : false;

  return (
    <div className="group flex items-center border-b border-border/50 transition-colors hover:bg-secondary/30 last:border-b-0">
      <Link
        to="/match/$matchId"
        params={{ matchId: String(match.fixture.id) }}
        className="flex flex-1 items-center gap-3 px-4 py-2.5"
      >
        {/* Status column */}
        <div className="flex w-12 flex-col items-center gap-0.5">
          {(status.isLive || status.isHalftime) && <LiveIndicator />}
          <span className={`text-xs font-semibold ${status.colorClass}`}>
            {status.isUpcoming ? startTime : status.label}
          </span>
        </div>

        {/* Teams & Score */}
        <div className="flex flex-1 flex-col gap-0.5">
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
      </Link>

      {/* Save button */}
      {user && (
        <button
          onClick={(e) => {
            e.preventDefault();
            toggle(match.fixture.id, match.teams.home.name, match.teams.away.name, match.fixture.date);
          }}
          className="px-3 py-2 text-muted-foreground transition-colors hover:text-score-highlight"
        >
          <Star className={`h-4 w-4 ${saved ? "fill-score-highlight text-score-highlight" : ""}`} />
        </button>
      )}
    </div>
  );
}

function TeamRow({
  name, logo, score, isUpcoming, isWinning, isLive,
}: {
  name: string; logo: string; score: number | null; isUpcoming: boolean; isWinning: boolean; isLive: boolean;
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
        <span className={`min-w-[1.5rem] text-right font-mono text-sm font-bold ${
          isLive ? "text-foreground" : isWinning ? "font-bold text-foreground" : "text-muted-foreground"
        }`}>
          {score}
        </span>
      )}
    </div>
  );
}
