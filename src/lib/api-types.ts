// Types for API-Football responses

export interface ApiFixture {
  fixture: {
    id: number;
    referee: string | null;
    timezone: string;
    date: string;
    timestamp: number;
    status: {
      long: string;
      short: string; // "1H", "2H", "HT", "FT", "NS", "PST", "LIVE", etc.
      elapsed: number | null;
    };
  };
  league: {
    id: number;
    name: string;
    country: string;
    logo: string;
    flag: string | null;
    season: number;
    round: string;
  };
  teams: {
    home: { id: number; name: string; logo: string; winner: boolean | null };
    away: { id: number; name: string; logo: string; winner: boolean | null };
  };
  goals: {
    home: number | null;
    away: number | null;
  };
  score: {
    halftime: { home: number | null; away: number | null };
    fulltime: { home: number | null; away: number | null };
  };
}

export interface ApiEvent {
  time: { elapsed: number; extra: number | null };
  team: { id: number; name: string; logo: string };
  player: { id: number; name: string };
  assist: { id: number | null; name: string | null };
  type: string; // "Goal", "Card", "subst", "Var"
  detail: string; // "Normal Goal", "Yellow Card", "Red Card", "Substitution 1", etc.
  comments: string | null;
}

export interface ApiStatistic {
  team: { id: number; name: string; logo: string };
  statistics: Array<{
    type: string;
    value: number | string | null;
  }>;
}

export interface ApiStanding {
  rank: number;
  team: { id: number; name: string; logo: string };
  points: number;
  goalsDiff: number;
  group: string;
  form: string; // "WWDLW"
  status: string;
  description: string | null;
  all: {
    played: number;
    win: number;
    draw: number;
    lose: number;
    goals: { for: number; against: number };
  };
}

// Helper to determine match status display
export function getApiStatusInfo(status: { short: string; elapsed: number | null }) {
  const s = status.short;
  const isLive = ["1H", "2H", "ET", "BT", "P", "LIVE", "INT"].includes(s);
  const isHalftime = s === "HT";
  const isFinished = ["FT", "AET", "PEN"].includes(s);
  const isUpcoming = ["NS", "TBD"].includes(s);
  const isPostponed = ["PST", "CANC", "ABD", "AWD", "WO", "SUSP"].includes(s);

  let label = "";
  if (isLive) label = `${status.elapsed}'`;
  else if (isHalftime) label = "HT";
  else if (isFinished) label = "FT";
  else if (isUpcoming) label = "—";
  else if (isPostponed) label = "POSTP";
  else label = s;

  let colorClass = "text-muted-foreground";
  if (isLive) colorClass = "text-live";
  else if (isHalftime) colorClass = "text-score-highlight";
  else if (isPostponed) colorClass = "text-destructive";

  return { isLive, isHalftime, isFinished, isUpcoming, isPostponed, label, colorClass };
}

// Map API event type to our icon type
export function getEventType(event: ApiEvent): "goal" | "yellow_card" | "red_card" | "substitution" | "var" {
  if (event.type === "Goal") return "goal";
  if (event.type === "Card" && event.detail.includes("Yellow")) return "yellow_card";
  if (event.type === "Card" && event.detail.includes("Red")) return "red_card";
  if (event.type === "subst") return "substitution";
  if (event.type === "Var") return "var";
  return "goal";
}

// Extract a stat value from API statistics
export function getStatValue(stats: Array<{ type: string; value: number | string | null }>, type: string): number {
  const stat = stats.find(s => s.type === type);
  if (!stat || stat.value === null) return 0;
  if (typeof stat.value === "string") return parseInt(stat.value.replace("%", ""), 10) || 0;
  return stat.value;
}
