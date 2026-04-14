import { MatchCard } from "./MatchCard";
import type { ApiFixture } from "@/lib/api-types";

interface LeagueSectionProps {
  leagueName: string;
  leagueCountry: string;
  leagueLogo: string;
  leagueFlag: string | null;
  matches: ApiFixture[];
}

export function LeagueSection({ leagueName, leagueCountry, leagueLogo, leagueFlag, matches }: LeagueSectionProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="flex items-center gap-2 border-b border-border bg-secondary/30 px-4 py-2.5">
        {leagueFlag ? (
          <img src={leagueFlag} alt={leagueCountry} className="h-4 w-4 object-contain" />
        ) : (
          <img src={leagueLogo} alt={leagueName} className="h-4 w-4 object-contain" />
        )}
        <div>
          <h3 className="text-sm font-semibold text-foreground">{leagueName}</h3>
          <span className="text-xs text-muted-foreground">{leagueCountry}</span>
        </div>
      </div>
      <div>
        {matches.map(match => (
          <MatchCard key={match.fixture.id} match={match} />
        ))}
      </div>
    </div>
  );
}
