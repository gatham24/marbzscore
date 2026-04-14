const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('RAPIDAPI_KEY');
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'RAPIDAPI_KEY not configured' }),
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

    // Try RapidAPI format first (most common for users signing up via RapidAPI)
    const rapidApiUrl = new URL(`https://api-football-v1.p.rapidapi.com/v3/${endpoint}`);
    if (params) {
      Object.entries(params).forEach(([k, v]) => rapidApiUrl.searchParams.set(k, v as string));
    }

    let response = await fetch(rapidApiUrl.toString(), {
      headers: {
        "x-rapidapi-key": apiKey,
        "x-rapidapi-host": "api-football-v1.p.rapidapi.com",
      },
    });

    // If RapidAPI fails, try direct API-Football format
    if (!response.ok || response.status === 403) {
      const directUrl = new URL(`https://v3.football.api-sports.io/${endpoint}`);
      if (params) {
        Object.entries(params).forEach(([k, v]) => directUrl.searchParams.set(k, v as string));
      }

      response = await fetch(directUrl.toString(), {
        headers: { "x-apisports-key": apiKey },
      });
    }

    const data = await response.json();

    return new Response(
      JSON.stringify(data),
      {
        status: response.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Football API error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
