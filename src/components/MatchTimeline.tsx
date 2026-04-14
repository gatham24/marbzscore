import type { MatchEvent, Match } from "@/lib/mock-data";

function EventIcon({ type }: { type: MatchEvent["type"] }) {
  switch (type) {
    case "goal": return <span className="text-base">⚽</span>;
    case "yellow_card": return <span className="inline-block h-4 w-3 rounded-sm bg-score-highlight" />;
    case "red_card": return <span className="inline-block h-4 w-3 rounded-sm bg-destructive" />;
    case "substitution": return <span className="text-base">🔄</span>;
    case "var": return <span className="text-xs font-bold text-muted-foreground">VAR</span>;
    case "corner": return <span className="text-base">📐</span>;
    case "kickoff": return <span className="text-base">🏁</span>;
    case "halftime": return <span className="text-xs font-bold text-score-highlight">HT</span>;
    case "fulltime": return <span className="text-xs font-bold text-muted-foreground">FT</span>;
    default: return null;
  }
}

function getEventLabel(event: MatchEvent, match: Match): string {
  switch (event.type) {
    case "goal":
      return `${event.playerName}${event.assistName ? ` (${event.assistName})` : ""}`;
    case "yellow_card":
    case "red_card":
      return event.playerName;
    case "substitution":
      return `${event.playerName}${event.detail ? ` ↔ ${event.detail}` : ""}`;
    case "kickoff":
      return "Kick Off";
    case "halftime":
      return `Half Time — ${match.homeTeam} ${match.homeScore} - ${match.awayScore} ${match.awayTeam}`;
    case "fulltime":
      return "Full Time";
    case "corner":
      return `Corner — ${event.playerName}`;
    default:
      return event.playerName;
  }
}

export function MatchTimeline({ match }: { match: Match }) {
  const sortedEvents = [...match.events].sort((a, b) => b.minute - a.minute);

  return (
    <div className="space-y-0">
      {sortedEvents.map((event) => (
        <div
          key={event.id}
          className={`flex items-start gap-3 border-b border-border/50 px-4 py-2.5 ${
            event.type === "goal" ? "bg-primary/5" : ""
          }`}
        >
          <span className="w-8 pt-0.5 text-right font-mono text-xs font-semibold text-muted-foreground">
            {event.minute}'
          </span>
          <div className="flex w-5 items-center justify-center pt-0.5">
            <EventIcon type={event.type} />
          </div>
          <div className="flex-1">
            <span className={`text-sm ${event.type === "goal" ? "font-semibold text-foreground" : "text-surface-foreground"}`}>
              {getEventLabel(event, match)}
            </span>
            {event.type === "goal" && (
              <span className="ml-2 text-xs text-primary font-medium">GOAL</span>
            )}
          </div>
          <span className="text-xs text-muted-foreground">
            {event.team === "home" ? match.homeTeam : event.team === "away" ? match.awayTeam : ""}
          </span>
        </div>
      ))}
    </div>
  );
}
