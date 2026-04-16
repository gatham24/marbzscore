import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { useFavoriteTeams, useSavedMatches } from "@/hooks/useFavorites";
import { Link } from "@tanstack/react-router";
import { Heart, Star, Trash2 } from "lucide-react";

export const Route = createFileRoute("/favorites")({
  head: () => ({
    meta: [
      { title: "My Favorites — MarbzScore" },
      { name: "description", content: "Your favorite teams and saved matches." },
    ],
  }),
  component: FavoritesPage,
});

function FavoritesPage() {
  const { user } = useAuth();
  const { teams, toggle: toggleTeam } = useFavoriteTeams();
  const { matches, toggle: toggleMatch } = useSavedMatches();

  if (!user) {
    return (
      <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-4">
        <div className="text-center space-y-4">
          <Heart className="mx-auto h-12 w-12 text-muted-foreground" />
          <h1 className="text-xl font-bold text-foreground">Sign in to see your favorites</h1>
          <p className="text-sm text-muted-foreground">Follow teams and save matches to keep track of your favorites.</p>
          <Link to="/login" className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 space-y-8">
      <div>
        <h2 className="mb-3 flex items-center gap-2 text-lg font-bold text-foreground">
          <Star className="h-5 w-5 text-accent" /> Favorite Teams
        </h2>
        {teams.length === 0 ? (
          <p className="text-sm text-muted-foreground">No favorite teams yet. Tap the star on any match to follow a team.</p>
        ) : (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
            {teams.map(t => (
              <div key={t.team_id} className="flex items-center gap-2 rounded-lg border border-border bg-card p-3">
                {t.team_logo && <img src={t.team_logo} alt={t.team_name} className="h-6 w-6 object-contain" />}
                <span className="flex-1 truncate text-sm font-medium text-foreground">{t.team_name}</span>
                <button onClick={() => toggleTeam(t.team_id, t.team_name, t.team_logo || "")} className="text-destructive hover:text-destructive/80">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="mb-3 flex items-center gap-2 text-lg font-bold text-foreground">
          <Heart className="h-5 w-5 text-live" /> Saved Matches
        </h2>
        {matches.length === 0 ? (
          <p className="text-sm text-muted-foreground">No saved matches yet. Bookmark matches from the scores page.</p>
        ) : (
          <div className="space-y-2">
            {matches.map(m => (
              <div key={m.match_id} className="flex items-center justify-between rounded-lg border border-border bg-card p-3">
                <Link to="/match/$matchId" params={{ matchId: String(m.match_id) }} className="flex-1">
                  <span className="text-sm font-medium text-foreground">{m.home_team} vs {m.away_team}</span>
                  {m.match_date && <span className="ml-2 text-xs text-muted-foreground">{new Date(m.match_date).toLocaleDateString()}</span>}
                </Link>
                <button onClick={() => toggleMatch(m.match_id, m.home_team, m.away_team)} className="text-destructive hover:text-destructive/80">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
