import { createFileRoute, Link } from "@tanstack/react-router";
import { eplStandings, leagues } from "@/lib/mock-data";

export const Route = createFileRoute("/standings")({
  head: () => ({
    meta: [
      { title: "Standings — MarbzScore" },
      { name: "description", content: "League standings and tables for top football leagues." },
      { property: "og:title", content: "Standings — MarbzScore" },
    ],
  }),
  component: StandingsPage,
});

function FormBadge({ result }: { result: "W" | "D" | "L" }) {
  const colors = {
    W: "bg-primary text-primary-foreground",
    D: "bg-muted text-muted-foreground",
    L: "bg-destructive text-destructive-foreground",
  };
  return (
    <span className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${colors[result]}`}>
      {result}
    </span>
  );
}

function StandingsPage() {
  const epl = leagues.find(l => l.id === "epl")!;

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <div className="mb-4 flex items-center gap-2">
        <span className="text-xl">{epl.flag}</span>
        <h1 className="text-xl font-bold text-foreground">{epl.name}</h1>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/30 text-xs text-muted-foreground">
                <th className="w-8 px-3 py-2.5 text-center">#</th>
                <th className="px-3 py-2.5 text-left">Team</th>
                <th className="w-8 px-2 py-2.5 text-center">P</th>
                <th className="w-8 px-2 py-2.5 text-center">W</th>
                <th className="w-8 px-2 py-2.5 text-center">D</th>
                <th className="w-8 px-2 py-2.5 text-center">L</th>
                <th className="hidden w-10 px-2 py-2.5 text-center sm:table-cell">GF</th>
                <th className="hidden w-10 px-2 py-2.5 text-center sm:table-cell">GA</th>
                <th className="w-10 px-2 py-2.5 text-center">GD</th>
                <th className="w-10 px-2 py-2.5 text-center font-semibold">Pts</th>
                <th className="hidden px-3 py-2.5 text-center md:table-cell">Form</th>
              </tr>
            </thead>
            <tbody>
              {eplStandings.map((row) => (
                <tr
                  key={row.team}
                  className="border-b border-border/50 transition-colors hover:bg-secondary/30"
                >
                  <td className="px-3 py-2.5 text-center text-xs font-medium text-muted-foreground">
                    <span className={row.position <= 4 ? "text-primary font-bold" : ""}>
                      {row.position}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 font-medium text-foreground">{row.team}</td>
                  <td className="px-2 py-2.5 text-center text-muted-foreground">{row.played}</td>
                  <td className="px-2 py-2.5 text-center text-muted-foreground">{row.won}</td>
                  <td className="px-2 py-2.5 text-center text-muted-foreground">{row.drawn}</td>
                  <td className="px-2 py-2.5 text-center text-muted-foreground">{row.lost}</td>
                  <td className="hidden px-2 py-2.5 text-center text-muted-foreground sm:table-cell">{row.goalsFor}</td>
                  <td className="hidden px-2 py-2.5 text-center text-muted-foreground sm:table-cell">{row.goalsAgainst}</td>
                  <td className="px-2 py-2.5 text-center font-medium text-foreground">
                    {row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}
                  </td>
                  <td className="px-2 py-2.5 text-center font-bold text-foreground">{row.points}</td>
                  <td className="hidden px-3 py-2.5 md:table-cell">
                    <div className="flex justify-center gap-0.5">
                      {row.form.map((r, i) => (
                        <FormBadge key={i} result={r} />
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
