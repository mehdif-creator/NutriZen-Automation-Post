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
    const clientSecret = Deno.env.get('PINTEREST_CLIENT_SECRET')
    const redirectUri = Deno.env.get('PINTEREST_REDIRECT_URI')
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!clientId || !clientSecret || !supabaseUrl || !supabaseKey) {
        return new Response(
            JSON.stringify({ code: "PINTEREST_NOT_CONFIGURED", message: "Environment variables missing" }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }

    const { code, state } = await req.json()
    if (!code || !state) throw new Error("Missing code or state")

    const supabase = createClient(supabaseUrl, supabaseKey)

    // 1. Validate State (CSRF Check)
    const { data: stateData, error: stateError } = await supabase
        .from('oauth_states')
        .select('state')
        .eq('state', state)
        .single()

    if (stateError || !stateData) {
        return new Response(
            JSON.stringify({ error: "Invalid or expired state parameter" }),
            { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }

    // Delete state after use
    await supabase.from('oauth_states').delete().eq('state', state)

    // 2. Exchange Code for Token
    const tokenResponse = await fetch('https://api.pinterest.com/v5/oauth/token', {
        method: 'POST',
        headers: {
            'Authorization': `Basic ${btoa(clientId + ":" + clientSecret)}`,
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: redirectUri
        })
    })

    if (!tokenResponse.ok) {
        const errText = await tokenResponse.text()
        throw new Error(`Pinterest API Error: ${errText}`)
    }

    const tokenData = await tokenResponse.json()
    // Expected: { access_token, refresh_token, scope, expires_in, token_type }

    // 3. Store Tokens Securely (Admin Only Table)
    // In production, encrypt these before storage using Deno.env.get('TOKEN_ENCRYPTION_KEY')
    const { error: dbError } = await supabase
        .from('pinterest_oauth')
        .upsert({
            account_label: 'default',
            access_token: tokenData.access_token,
            refresh_token: tokenData.refresh_token, // Might be undefined if not provided
            expires_at: new Date(Date.now() + (tokenData.expires_in * 1000)).toISOString(),
            scope: tokenData.scope,
            updated_at: new Date().toISOString()
        }, { onConflict: 'account_label' })

    if (dbError) throw dbError

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})