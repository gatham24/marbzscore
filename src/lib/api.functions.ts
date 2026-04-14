import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const API_BASE = "https://v3.football.api-sports.io";

let cachedApiKey: string | null = null;

async function getApiKey(): Promise<string> {
  if (process.env.RAPIDAPI_KEY) {
    return process.env.RAPIDAPI_KEY;
  }
  if (cachedApiKey) {
    return cachedApiKey;
  }

  const { data, error } = await supabaseAdmin.rpc("get_secret", { secret_name: "RAPIDAPI_KEY" });

  if (error) {
    console.error("Vault RPC error:", error);
    throw new Error(`Failed to fetch API key: ${error.message}`);
  }

  if (!data || !data.length || !data[0]?.decrypted_secret) {
    throw new Error("RAPIDAPI_KEY not found in vault");
  }

  cachedApiKey = data[0].decrypted_secret;
  return cachedApiKey!;
}

async function apiFetch(endpoint: string, params: Record<string, string> = {}) {
  const apiKey = await getApiKey();
  const url = new URL(`${API_BASE}/${endpoint}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  const response = await fetch(url.toString(), {
    headers: { "x-apisports-key": apiKey },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`API-Football error [${response.status}]: ${text}`);
  }

  return await response.json();
}

export const fetchLiveMatches = createServerFn({ method: "GET" })
  .handler(async () => {
    try {
      const data = await apiFetch("fixtures", { live: "all" });
      return { fixtures: data.response || [], error: null };
    } catch (error) {
      console.error("Failed to fetch live matches:", error);
      return { fixtures: [], error: String(error) };
    }
  });

export const fetchMatchesByDate = createServerFn({ method: "POST" })
  .inputValidator(z.object({ date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/) }))
  .handler(async ({ data }) => {
    try {
      const result = await apiFetch("fixtures", { date: data.date });
      return { fixtures: result.response || [], error: null };
    } catch (error) {
      console.error("Failed to fetch matches by date:", error);
      return { fixtures: [], error: String(error) };
    }
  });

export const fetchMatchDetails = createServerFn({ method: "POST" })
  .inputValidator(z.object({ fixtureId: z.number().int().positive() }))
  .handler(async ({ data }) => {
    try {
      const [fixtureData, eventsData, statsData] = await Promise.all([
        apiFetch("fixtures", { id: String(data.fixtureId) }),
        apiFetch("fixtures/events", { fixture: String(data.fixtureId) }),
        apiFetch("fixtures/statistics", { fixture: String(data.fixtureId) }),
      ]);
      return {
        fixture: fixtureData.response?.[0] || null,
        events: eventsData.response || [],
        statistics: statsData.response || [],
        error: null,
      };
    } catch (error) {
      console.error("Failed to fetch match details:", error);
      return { fixture: null, events: [], statistics: [], error: String(error) };
    }
  });

export const fetchStandings = createServerFn({ method: "POST" })
  .inputValidator(z.object({
    leagueId: z.number().int().positive(),
    season: z.number().int().min(2000).max(2030),
  }))
  .handler(async ({ data }) => {
    try {
      const result = await apiFetch("standings", {
        league: String(data.leagueId),
        season: String(data.season),
      });
      return { standings: result.response?.[0]?.league?.standings?.[0] || [], error: null };
    } catch (error) {
      console.error("Failed to fetch standings:", error);
      return { standings: [], error: String(error) };
    }
  });
