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

    // Log key length for debugging (not the actual key)
    console.log(`API key length: ${apiKey.length}, starts with: ${apiKey.substring(0, 4)}...`);

    const { endpoint, params } = await req.json();
    if (!endpoint) {
      return new Response(
        JSON.stringify({ error: 'endpoint is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Try RapidAPI format first
    const rapidApiUrl = new URL(`https://api-football-v1.p.rapidapi.com/v3/${endpoint}`);
    if (params) {
      Object.entries(params).forEach(([k, v]) => rapidApiUrl.searchParams.set(k, v as string));
    }

    console.log(`Calling RapidAPI: ${rapidApiUrl.toString()}`);

    const rapidResponse = await fetch(rapidApiUrl.toString(), {
      headers: {
        "x-rapidapi-key": apiKey,
        "x-rapidapi-host": "api-football-v1.p.rapidapi.com",
      },
    });

    const rapidData = await rapidResponse.json();
    console.log(`RapidAPI response status: ${rapidResponse.status}`);

    // Check if RapidAPI worked (no errors object or empty errors)
    if (rapidResponse.ok && (!rapidData.errors || Object.keys(rapidData.errors).length === 0)) {
      return new Response(
        JSON.stringify(rapidData),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`RapidAPI failed, trying direct API. Errors: ${JSON.stringify(rapidData.errors)}`);

    // Fallback to direct API-Football format
    const directUrl = new URL(`https://v3.football.api-sports.io/${endpoint}`);
    if (params) {
      Object.entries(params).forEach(([k, v]) => directUrl.searchParams.set(k, v as string));
    }

    const directResponse = await fetch(directUrl.toString(), {
      headers: { "x-apisports-key": apiKey },
    });

    const directData = await directResponse.json();
    console.log(`Direct API response status: ${directResponse.status}`);

    return new Response(
      JSON.stringify(directData),
      { status: directResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Football API error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
