const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const BASE_URL = 'https://api.football-data.org/v4';

// Map football-data.org status to our short codes
function mapStatus(status: string, minute: number | null): { long: string; short: string; elapsed: number | null } {
  const map: Record<string, { long: string; short: string }> = {
    SCHEDULED: { long: 'Not Started', short: 'NS' },
    TIMED: { long: 'Not Started', short: 'NS' },
    IN_PLAY: { long: 'In Play', short: '1H' },
    PAUSED: { long: 'Half Time', short: 'HT' },
    FINISHED: { long: 'Match Finished', short: 'FT' },
    POSTPONED: { long: 'Postponed', short: 'PST' },
    CANCELLED: { long: 'Cancelled', short: 'CANC' },
    SUSPENDED: { long: 'Suspended', short: 'SUSP' },
    AWARDED: { long: 'Awarded', short: 'AWD' },
    EXTRA_TIME: { long: 'Extra Time', short: 'ET' },
    PENALTY_SHOOTOUT: { long: 'Penalties', short: 'PEN' },
  };
  const mapped = map[status] || { long: status, short: status };
  // If in play and minute > 45, assume 2nd half
  let shortCode = mapped.short;
  if (status === 'IN_PLAY' && minute && minute > 45) shortCode = '2H';
  return { long: mapped.long, short: shortCode, elapsed: minute };
}

// Transform a football-data.org match to our ApiFixture format
function transformMatch(match: any) {
  const homeWinner = match.score?.winner === 'HOME_TEAM' ? true : match.score?.winner === 'AWAY_TEAM' ? false : null;
  const awayWinner = match.score?.winner === 'AWAY_TEAM' ? true : match.score?.winner === 'HOME_TEAM' ? false : null;

  return {
    fixture: {
      id: match.id,
      referee: match.referees?.[0]?.name || null,
      timezone: 'UTC',
      date: match.utcDate,
      timestamp: Math.floor(new Date(match.utcDate).getTime() / 1000),
      status: mapStatus(match.status, match.minute ?? null),
    },
    league: {
      id: match.competition?.id || 0,
      name: match.competition?.name || 'Unknown',
      country: match.area?.name || '',
      logo: match.competition?.emblem || '',
      flag: match.area?.flag || null,
      season: match.season?.id || new Date().getFullYear(),
      round: match.matchday ? `Matchday ${match.matchday}` : '',
    },
    teams: {
      home: {
        id: match.homeTeam?.id || 0,
        name: match.homeTeam?.shortName || match.homeTeam?.name || 'TBD',
        logo: match.homeTeam?.crest || '',
        winner: homeWinner,
      },
      away: {
        id: match.awayTeam?.id || 0,
        name: match.awayTeam?.shortName || match.awayTeam?.name || 'TBD',
        logo: match.awayTeam?.crest || '',
        winner: awayWinner,
      },
    },
    goals: {
      home: match.score?.fullTime?.home ?? null,
      away: match.score?.fullTime?.away ?? null,
    },
    score: {
      halftime: {
        home: match.score?.halfTime?.home ?? null,
        away: match.score?.halfTime?.away ?? null,
      },
      fulltime: {
        home: match.score?.fullTime?.home ?? null,
        away: match.score?.fullTime?.away ?? null,
      },
    },
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('RAPIDAPI_KEY');
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'API key not configured.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { endpoint, params } = await req.json();
    if (!endpoint) {
      return new Response(
        JSON.stringify({ error: 'endpoint is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const headers = {
      'X-Auth-Token': apiKey,
    };

    let url: string;
    let responseData: any;

    if (endpoint === 'fixtures' || endpoint === 'matches') {
      if (params?.live === 'all') {
        // Live matches - football-data.org doesn't have a dedicated live endpoint
        // We fetch today's matches and filter by IN_PLAY/PAUSED status
        const today = new Date().toISOString().split('T')[0];
        url = `${BASE_URL}/matches?date=${today}`;
      } else if (params?.id) {
        // Single match by ID
        url = `${BASE_URL}/matches/${params.id}`;
      } else if (params?.date) {
        url = `${BASE_URL}/matches?date=${params.date}`;
      } else {
        url = `${BASE_URL}/matches`;
      }

      console.log('Fetching:', url);
      const resp = await fetch(url, { headers });

      if (!resp.ok) {
        const errText = await resp.text();
        console.error(`football-data.org error [${resp.status}]:`, errText);
        return new Response(
          JSON.stringify({ error: `API error: ${resp.status}`, details: errText }),
          { status: resp.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const data = await resp.json();

      if (params?.id) {
        // Single match
        responseData = { response: [transformMatch(data)] };
      } else {
        let matches = data.matches || [];
        // Filter for live only if requested
        if (params?.live === 'all') {
          matches = matches.filter((m: any) => ['IN_PLAY', 'PAUSED', 'EXTRA_TIME', 'PENALTY_SHOOTOUT'].includes(m.status));
        }
        responseData = { response: matches.map(transformMatch) };
      }
    } else if (endpoint === 'fixtures/events' || endpoint === 'fixtures/statistics') {
      // football-data.org doesn't have separate events/statistics endpoints on free tier
      // Return empty for now
      responseData = { response: [] };
    } else if (endpoint === 'standings') {
      const leagueId = params?.league;
      const season = params?.season;
      url = `${BASE_URL}/competitions/${leagueId}/standings${season ? `?season=${season}` : ''}`;

      console.log('Fetching standings:', url);
      const resp = await fetch(url, { headers });

      if (!resp.ok) {
        const errText = await resp.text();
        console.error(`Standings error [${resp.status}]:`, errText);
        return new Response(
          JSON.stringify({ error: `API error: ${resp.status}`, details: errText }),
          { status: resp.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const data = await resp.json();
      const standing = data.standings?.[0]; // TOTAL standing
      const table = standing?.table || [];

      responseData = {
        response: [{
          league: {
            standings: [table.map((entry: any) => ({
              rank: entry.position,
              team: {
                id: entry.team?.id,
                name: entry.team?.shortName || entry.team?.name,
                logo: entry.team?.crest || '',
              },
              points: entry.points,
              goalsDiff: entry.goalDifference,
              group: standing?.group || '',
              form: entry.form || '',
              status: '',
              description: '',
              all: {
                played: entry.playedGames,
                win: entry.won,
                draw: entry.draw,
                lose: entry.lost,
                goals: { for: entry.goalsFor, against: entry.goalsAgainst },
              },
            }))],
          },
        }],
      };
    } else if (endpoint === 'teams' || endpoint === 'teams/search') {
      // Search by name
      const search = params?.search || params?.name;
      url = `${BASE_URL}/teams?limit=10${search ? `&name=${encodeURIComponent(search)}` : ''}`;

      console.log('Fetching teams:', url);
      const resp = await fetch(url, { headers });

      if (!resp.ok) {
        const errText = await resp.text();
        return new Response(
          JSON.stringify({ error: `API error: ${resp.status}`, details: errText }),
          { status: resp.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const data = await resp.json();
      responseData = {
        response: (data.teams || []).map((t: any) => ({
          team: { id: t.id, name: t.shortName || t.name, logo: t.crest || '' },
        })),
      };
    } else {
      return new Response(
        JSON.stringify({ error: `Unknown endpoint: ${endpoint}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(JSON.stringify(responseData), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Football API error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
