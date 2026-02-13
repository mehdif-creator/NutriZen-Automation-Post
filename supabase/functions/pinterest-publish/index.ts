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

    // STUB MODE CHECK
    if (!clientId) {
        return new Response(
            JSON.stringify({ code: "PINTEREST_NOT_CONFIGURED", message: "Pinterest secrets missing in Edge Function" }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { queue_id } = await req.json()

    // 1. Fetch Item
    const { data: item } = await supabaseClient
        .from('social_queue')
        .select('*')
        .eq('id', queue_id)
        .single()
    
    if (!item) throw new Error("Item not found")

    // 2. Real Publish Logic would go here (Fetch Token -> POST Pinterest)
    // For now, we simulate success if configured
    
    // 3. Update Status
    await supabaseClient
        .from('social_queue')
        .update({
            status: 'posted',
            external_post_id: 'stub-id-' + Date.now(),
            published_at: new Date().toISOString(),
            attempts: (item.attempts || 0) + 1
        })
        .eq('id', queue_id)

    return new Response(
      JSON.stringify({ success: true, stub: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})