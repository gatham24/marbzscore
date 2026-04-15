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
        JSON.stringify({ error: 'RAPIDAPI_KEY not configured. Add your API key in project settings.' }),
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

    // Try RapidAPI format
    const rapidApiUrl = new URL(`https://api-football-v1.p.rapidapi.com/v3/${endpoint}`);
    if (params) {
      Object.entries(params).forEach(([k, v]) => rapidApiUrl.searchParams.set(k, v as string));
    }

    const rapidResponse = await fetch(rapidApiUrl.toString(), {
      headers: {
        "x-rapidapi-key": apiKey,
        "x-rapidapi-host": "api-football-v1.p.rapidapi.com",
      },
    });

    if (rapidResponse.ok) {
      const rapidData = await rapidResponse.json();
      if (!rapidData.errors || Object.keys(rapidData.errors).length === 0) {
        return new Response(JSON.stringify(rapidData), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // Fallback: try direct API-Football key format
    const directUrl = new URL(`https://v3.football.api-sports.io/${endpoint}`);
    if (params) {
      Object.entries(params).forEach(([k, v]) => directUrl.searchParams.set(k, v as string));
    }

    const directResponse = await fetch(directUrl.toString(), {
      headers: { "x-apisports-key": apiKey },
    });

    const directData = await directResponse.json();

    // If both fail, give a helpful error
    if (directData.errors && Object.keys(directData.errors).length > 0) {
      console.error('Both API formats failed. RapidAPI status:', rapidResponse.status, 'Direct errors:', JSON.stringify(directData.errors));
      return new Response(
        JSON.stringify({
          error: 'API key not valid. Please subscribe to API-Football on RapidAPI (https://rapidapi.com/api-sports/api/api-football) and use the key from your dashboard.',
          details: rapidResponse.status === 403 ? 'RapidAPI returned 403 - you may need to subscribe to the API first.' : undefined,
        }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(JSON.stringify(directData), {
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
