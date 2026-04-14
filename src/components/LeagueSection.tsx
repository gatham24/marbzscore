import { MatchCard } from "./MatchCard";
import type { Match } from "@/lib/mock-data";
import { leagues } from "@/lib/mock-data";

interface LeagueSectionProps {
  league: string;
  matches: Match[];
}

export function LeagueSection({ league, matches }: LeagueSectionProps) {
  const leagueInfo = leagues.find(l => l.name === league);
  const flag = leagueInfo?.flag || "🏆";

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="flex items-center gap-2 border-b border-border bg-secondary/30 px-4 py-2.5">
        <span className="text-base">{flag}</span>
        <div>
          <h3 className="text-sm font-semibold text-foreground">{league}</h3>
          {leagueInfo && (
            <span className="text-xs text-muted-foreground">{leagueInfo.country}</span>
          )}
        </div>
      </div>
      <div>
        {matches.map(match => (
          <MatchCard key={match.id} match={match} />
        ))}
      </div>
    </div>
  );
}
