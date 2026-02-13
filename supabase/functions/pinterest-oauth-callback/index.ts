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

    // STUB MODE CHECK
    if (!clientId || !clientSecret) {
        return new Response(
            JSON.stringify({ code: "PINTEREST_NOT_CONFIGURED", message: "Environment variables missing" }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }

    const { code } = await req.json()
    if (!code) throw new Error("No code provided")

    // Mock successful exchange for now if needed, or real exchange:
    /*
    const response = await fetch('https://api.pinterest.com/v5/oauth/token', ...)
    // Save to database...
    */

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})