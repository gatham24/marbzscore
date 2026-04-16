import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

interface FavoriteTeam {
  team_id: number;
  team_name: string;
  team_logo: string | null;
}

interface SavedMatch {
  match_id: number;
  home_team: string;
  away_team: string;
  match_date: string | null;
}

export function useFavoriteTeams() {
  const { user } = useAuth();
  const [teams, setTeams] = useState<FavoriteTeam[]>([]);

  const load = useCallback(async () => {
    if (!user) { setTeams([]); return; }
    const { data } = await supabase.from("favorite_teams").select("team_id, team_name, team_logo").eq("user_id", user.id);
    setTeams((data as FavoriteTeam[]) || []);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const toggle = useCallback(async (teamId: number, teamName: string, teamLogo: string) => {
    if (!user) return;
    const exists = teams.some(t => t.team_id === teamId);
    if (exists) {
      await supabase.from("favorite_teams").delete().eq("user_id", user.id).eq("team_id", teamId);
    } else {
      await supabase.from("favorite_teams").insert({ user_id: user.id, team_id: teamId, team_name: teamName, team_logo: teamLogo });
    }
    load();
  }, [user, teams, load]);

  const isFavorite = useCallback((teamId: number) => teams.some(t => t.team_id === teamId), [teams]);

  return { teams, toggle, isFavorite };
}

export function useSavedMatches() {
  const { user } = useAuth();
  const [matches, setMatches] = useState<SavedMatch[]>([]);

  const load = useCallback(async () => {
    if (!user) { setMatches([]); return; }
    const { data } = await supabase.from("saved_matches").select("match_id, home_team, away_team, match_date").eq("user_id", user.id);
    setMatches((data as SavedMatch[]) || []);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const toggle = useCallback(async (matchId: number, homeTeam: string, awayTeam: string, matchDate?: string) => {
    if (!user) return;
    const exists = matches.some(m => m.match_id === matchId);
    if (exists) {
      await supabase.from("saved_matches").delete().eq("user_id", user.id).eq("match_id", matchId);
    } else {
      await supabase.from("saved_matches").insert({ user_id: user.id, match_id: matchId, home_team: homeTeam, away_team: awayTeam, match_date: matchDate || null });
    }
    load();
  }, [user, matches, load]);

  const isSaved = useCallback((matchId: number) => matches.some(m => m.match_id === matchId), [matches]);

  return { matches, toggle, isSaved };
}
