import type { MatchStats } from "@/lib/mock-data";

interface StatBarProps {
  label: string;
  home: number;
  away: number;
  isPercentage?: boolean;
}

function StatBar({ label, home, away, isPercentage }: StatBarProps) {
  const total = home + away || 1;
  const homePercent = (home / total) * 100;
  const awayPercent = (away / total) * 100;
  const homeWins = home > away;
  const awayWins = away > home;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className={homeWins ? "font-semibold text-foreground" : "text-muted-foreground"}>
          {home}{isPercentage ? "%" : ""}
        </span>
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className={awayWins ? "font-semibold text-foreground" : "text-muted-foreground"}>
          {away}{isPercentage ? "%" : ""}
        </span>
      </div>
      <div className="flex h-1.5 gap-1 overflow-hidden rounded-full">
        <div
          className={`rounded-full transition-all ${homeWins ? "bg-primary" : "bg-muted"}`}
          style={{ width: `${homePercent}%` }}
        />
        <div
          className={`rounded-full transition-all ${awayWins ? "bg-primary" : "bg-muted"}`}
          style={{ width: `${awayPercent}%` }}
        />
      </div>
    </div>
  );
}

export function MatchStatsView({ stats }: { stats: MatchStats }) {
  return (
    <div className="space-y-4 p-4">
      <StatBar label="Possession" home={stats.possession[0]} away={stats.possession[1]} isPercentage />
      <StatBar label="Shots" home={stats.shots[0]} away={stats.shots[1]} />
      <StatBar label="Shots on Target" home={stats.shotsOnTarget[0]} away={stats.shotsOnTarget[1]} />
      <StatBar label="Corners" home={stats.corners[0]} away={stats.corners[1]} />
      <StatBar label="Fouls" home={stats.fouls[0]} away={stats.fouls[1]} />
      <StatBar label="Passes" home={stats.passes[0]} away={stats.passes[1]} />
      <StatBar label="Pass Accuracy" home={stats.passAccuracy[0]} away={stats.passAccuracy[1]} isPercentage />
      <StatBar label="Yellow Cards" home={stats.yellowCards[0]} away={stats.yellowCards[1]} />
      <StatBar label="Red Cards" home={stats.redCards[0]} away={stats.redCards[1]} />
    </div>
  );
}
