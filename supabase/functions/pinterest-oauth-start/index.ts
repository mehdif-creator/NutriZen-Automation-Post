import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

declare const Deno: any;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const clientId = Deno.env.get('PINTEREST_CLIENT_ID')
    const redirectUri = Deno.env.get('PINTEREST_REDIRECT_URI')
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    // 1. Stub Mode Check
    if (!clientId || !redirectUri || !supabaseUrl || !supabaseKey) {
        return new Response(
            JSON.stringify({ code: "PINTEREST_NOT_CONFIGURED", message: "Environment variables missing" }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // 2. Generate and Store State (CSRF Protection)
    const state = crypto.randomUUID()
    
    // Using oauth_states table to store state server-side
    const { error: stateError } = await supabase
        .from('oauth_states')
        .insert({ state: state })
    
    if (stateError) {
        throw new Error(`Failed to store state: ${stateError.message}`)
    }

    // 3. Construct Auth URL
    const scope = 'boards:read,pins:read,pins:write'
    const authUrl = `https://www.pinterest.com/oauth/?response_type=code&redirect_uri=${redirectUri}&client_id=${clientId}&scope=${scope}&state=${state}`

    return new Response(
      JSON.stringify({ auth_url: authUrl }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})