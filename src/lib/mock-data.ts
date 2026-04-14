export type MatchStatus = "live" | "finished" | "upcoming" | "halftime" | "postponed";

export interface MatchEvent {
  id: string;
  type: "goal" | "yellow_card" | "red_card" | "substitution" | "var" | "corner" | "kickoff" | "halftime" | "fulltime";
  minute: number;
  team: "home" | "away";
  playerName: string;
  assistName?: string;
  detail?: string;
}

export interface Match {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  status: MatchStatus;
  minute?: number;
  league: string;
  leagueCountry: string;
  startTime: string;
  events: MatchEvent[];
  stats?: MatchStats;
  homeLineup?: string[];
  awayLineup?: string[];
}

export interface MatchStats {
  possession: [number, number];
  shots: [number, number];
  shotsOnTarget: [number, number];
  corners: [number, number];
  fouls: [number, number];
  yellowCards: [number, number];
  redCards: [number, number];
  passes: [number, number];
  passAccuracy: [number, number];
}

export interface LeagueStanding {
  position: number;
  team: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  form: ("W" | "D" | "L")[];
}

export const leagues = [
  { id: "epl", name: "Premier League", country: "England", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  { id: "laliga", name: "La Liga", country: "Spain", flag: "🇪🇸" },
  { id: "seriea", name: "Serie A", country: "Italy", flag: "🇮🇹" },
  { id: "bundesliga", name: "Bundesliga", country: "Germany", flag: "🇩🇪" },
  { id: "ligue1", name: "Ligue 1", country: "France", flag: "🇫🇷" },
  { id: "ucl", name: "Champions League", country: "Europe", flag: "🇪🇺" },
];

export const matches: Match[] = [
  {
    id: "1",
    homeTeam: "Arsenal",
    awayTeam: "Chelsea",
    homeScore: 2,
    awayScore: 1,
    status: "live",
    minute: 67,
    league: "Premier League",
    leagueCountry: "England",
    startTime: "15:00",
    events: [
      { id: "e1", type: "kickoff", minute: 0, team: "home", playerName: "" },
      { id: "e2", type: "goal", minute: 23, team: "home", playerName: "Saka", assistName: "Ødegaard" },
      { id: "e3", type: "yellow_card", minute: 31, team: "away", playerName: "Caicedo" },
      { id: "e4", type: "goal", minute: 38, team: "away", playerName: "Palmer" },
      { id: "e5", type: "halftime", minute: 45, team: "home", playerName: "" },
      { id: "e6", type: "goal", minute: 56, team: "home", playerName: "Havertz", assistName: "Saka" },
      { id: "e7", type: "yellow_card", minute: 62, team: "home", playerName: "Rice" },
    ],
    stats: {
      possession: [58, 42],
      shots: [12, 7],
      shotsOnTarget: [5, 3],
      corners: [6, 3],
      fouls: [9, 11],
      yellowCards: [1, 1],
      redCards: [0, 0],
      passes: [412, 298],
      passAccuracy: [87, 81],
    },
  },
  {
    id: "2",
    homeTeam: "Liverpool",
    awayTeam: "Man City",
    homeScore: 0,
    awayScore: 0,
    status: "live",
    minute: 34,
    league: "Premier League",
    leagueCountry: "England",
    startTime: "15:00",
    events: [
      { id: "e8", type: "kickoff", minute: 0, team: "home", playerName: "" },
      { id: "e9", type: "corner", minute: 12, team: "home", playerName: "Alexander-Arnold" },
      { id: "e10", type: "yellow_card", minute: 28, team: "away", playerName: "Rodri" },
    ],
    stats: {
      possession: [52, 48],
      shots: [5, 4],
      shotsOnTarget: [2, 1],
      corners: [3, 2],
      fouls: [6, 8],
      yellowCards: [0, 1],
      redCards: [0, 0],
      passes: [245, 230],
      passAccuracy: [89, 91],
    },
  },
  {
    id: "3",
    homeTeam: "Real Madrid",
    awayTeam: "Barcelona",
    homeScore: 3,
    awayScore: 2,
    status: "finished",
    league: "La Liga",
    leagueCountry: "Spain",
    startTime: "21:00",
    events: [
      { id: "e11", type: "goal", minute: 11, team: "away", playerName: "Lewandowski" },
      { id: "e12", type: "goal", minute: 25, team: "home", playerName: "Vinícius Jr", assistName: "Bellingham" },
      { id: "e13", type: "goal", minute: 44, team: "home", playerName: "Bellingham" },
      { id: "e14", type: "goal", minute: 58, team: "away", playerName: "Raphinha" },
      { id: "e15", type: "red_card", minute: 72, team: "away", playerName: "Gavi" },
      { id: "e16", type: "goal", minute: 89, team: "home", playerName: "Vinícius Jr" },
    ],
    stats: {
      possession: [45, 55],
      shots: [15, 12],
      shotsOnTarget: [7, 5],
      corners: [5, 7],
      fouls: [12, 14],
      yellowCards: [2, 3],
      redCards: [0, 1],
      passes: [380, 450],
      passAccuracy: [84, 88],
    },
  },
  {
    id: "4",
    homeTeam: "Bayern Munich",
    awayTeam: "Dortmund",
    homeScore: 0,
    awayScore: 0,
    status: "upcoming",
    league: "Bundesliga",
    leagueCountry: "Germany",
    startTime: "18:30",
    events: [],
  },
  {
    id: "5",
    homeTeam: "AC Milan",
    awayTeam: "Inter Milan",
    homeScore: 1,
    awayScore: 1,
    status: "halftime",
    minute: 45,
    league: "Serie A",
    leagueCountry: "Italy",
    startTime: "20:45",
    events: [
      { id: "e17", type: "goal", minute: 15, team: "home", playerName: "Leão", assistName: "Theo" },
      { id: "e18", type: "goal", minute: 39, team: "away", playerName: "Lautaro", assistName: "Barella" },
    ],
    stats: {
      possession: [46, 54],
      shots: [6, 8],
      shotsOnTarget: [2, 3],
      corners: [2, 4],
      fouls: [7, 5],
      yellowCards: [1, 0],
      redCards: [0, 0],
      passes: [198, 234],
      passAccuracy: [82, 86],
    },
  },
  {
    id: "6",
    homeTeam: "PSG",
    awayTeam: "Marseille",
    homeScore: 0,
    awayScore: 0,
    status: "upcoming",
    league: "Ligue 1",
    leagueCountry: "France",
    startTime: "21:00",
    events: [],
  },
  {
    id: "7",
    homeTeam: "Tottenham",
    awayTeam: "Man United",
    homeScore: 1,
    awayScore: 3,
    status: "finished",
    league: "Premier League",
    leagueCountry: "England",
    startTime: "12:30",
    events: [
      { id: "e19", type: "goal", minute: 8, team: "away", playerName: "Rashford" },
      { id: "e20", type: "goal", minute: 34, team: "home", playerName: "Son" },
      { id: "e21", type: "goal", minute: 55, team: "away", playerName: "Fernandes" },
      { id: "e22", type: "goal", minute: 78, team: "away", playerName: "Hojlund" },
    ],
    stats: {
      possession: [55, 45],
      shots: [14, 10],
      shotsOnTarget: [4, 6],
      corners: [7, 3],
      fouls: [10, 12],
      yellowCards: [2, 3],
      redCards: [0, 0],
      passes: [420, 340],
      passAccuracy: [86, 79],
    },
  },
];

export const eplStandings: LeagueStanding[] = [
  { position: 1, team: "Arsenal", played: 28, won: 21, drawn: 4, lost: 3, goalsFor: 65, goalsAgainst: 22, goalDifference: 43, points: 67, form: ["W", "W", "D", "W", "W"] },
  { position: 2, team: "Liverpool", played: 28, won: 20, drawn: 5, lost: 3, goalsFor: 62, goalsAgainst: 25, goalDifference: 37, points: 65, form: ["W", "D", "W", "W", "L"] },
  { position: 3, team: "Man City", played: 28, won: 19, drawn: 6, lost: 3, goalsFor: 60, goalsAgainst: 28, goalDifference: 32, points: 63, form: ["D", "W", "W", "D", "W"] },
  { position: 4, team: "Chelsea", played: 28, won: 15, drawn: 5, lost: 8, goalsFor: 52, goalsAgainst: 35, goalDifference: 17, points: 50, form: ["L", "W", "W", "D", "W"] },
  { position: 5, team: "Tottenham", played: 28, won: 14, drawn: 4, lost: 10, goalsFor: 55, goalsAgainst: 42, goalDifference: 13, points: 46, form: ["W", "L", "W", "L", "D"] },
  { position: 6, team: "Man United", played: 28, won: 13, drawn: 3, lost: 12, goalsFor: 40, goalsAgainst: 38, goalDifference: 2, points: 42, form: ["W", "W", "L", "W", "L"] },
  { position: 7, team: "Newcastle", played: 28, won: 13, drawn: 3, lost: 12, goalsFor: 45, goalsAgainst: 40, goalDifference: 5, points: 42, form: ["D", "L", "W", "W", "W"] },
  { position: 8, team: "Aston Villa", played: 28, won: 12, drawn: 5, lost: 11, goalsFor: 42, goalsAgainst: 38, goalDifference: 4, points: 41, form: ["L", "D", "W", "L", "W"] },
  { position: 9, team: "Brighton", played: 28, won: 11, drawn: 7, lost: 10, goalsFor: 48, goalsAgainst: 44, goalDifference: 4, points: 40, form: ["D", "W", "D", "L", "W"] },
  { position: 10, team: "West Ham", played: 28, won: 11, drawn: 5, lost: 12, goalsFor: 38, goalsAgainst: 45, goalDifference: -7, points: 38, form: ["L", "L", "W", "D", "W"] },
];

export function getMatchById(id: string): Match | undefined {
  return matches.find(m => m.id === id);
}

export function getMatchesByLeague(league: string): Match[] {
  return matches.filter(m => m.league === league);
}

export function getLiveMatches(): Match[] {
  return matches.filter(m => m.status === "live" || m.status === "halftime");
}

export function getStatusLabel(status: MatchStatus, minute?: number): string {
  switch (status) {
    case "live": return `${minute}'`;
    case "halftime": return "HT";
    case "finished": return "FT";
    case "upcoming": return "—";
    case "postponed": return "POSTP";
  }
}

export function getStatusColor(status: MatchStatus): string {
  switch (status) {
    case "live": return "text-live";
    case "halftime": return "text-score-highlight";
    case "finished": return "text-muted-foreground";
    case "upcoming": return "text-muted-foreground";
    case "postponed": return "text-destructive";
  }
}
