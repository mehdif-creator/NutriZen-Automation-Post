import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

declare const Deno: any;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-internal-secret',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const internalServiceKey = Deno.env.get('INTERNAL_SERVICE_KEY')
    const appBaseUrl = Deno.env.get('APP_BASE_URL') || 'https://mynutrizen.fr'
    
    const authHeader = req.headers.get('Authorization')
    const internalSecretHeader = req.headers.get('x-internal-secret')

    let isAuthorized = false;

    // AUTH STRATEGY:
    // 1. Internal Worker: Check strict equality of x-internal-secret against env var
    if (internalServiceKey && internalSecretHeader === internalServiceKey) {
        isAuthorized = true;
    } 
    // 2. Admin User: Check valid JWT and is_admin() role
    else if (authHeader) {
        const userClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
            global: { headers: { Authorization: authHeader } }
        })
        const { data: { user }, error: userError } = await userClient.auth.getUser()
        
        if (!userError && user) {
             const { data: isAdmin } = await userClient.rpc('is_admin', { uid: user.id })
             if (isAdmin) isAuthorized = true;
        }
    }

    if (!isAuthorized) {
         return new Response(
            JSON.stringify({ error: "Forbidden: Invalid credentials" }),
            { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }

    // Initialize Service Client for DB Ops (Read tokens, update queue)
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { queue_id } = await req.json()
    if (!queue_id) throw new Error("Missing queue_id")

    // 3. Fetch Job Data
    const { data: item, error: itemError } = await supabase
        .from('social_queue')
        .select('*')
        .eq('id', queue_id)
        .single()
    
    if (itemError || !item) throw new Error("Job not found")

    // 4. Fetch Credentials
    const { data: authData } = await supabase
        .from('pinterest_oauth')
        .select('access_token')
        .eq('account_label', 'default')
        .single()

    if (!authData?.access_token) {
        throw new Error("PINTEREST_NOT_CONFIGURED: No access token found in database")
    }

    // 5. Fetch Board Map
    const { data: boardMap } = await supabase
        .from('pinterest_board_map')
        .select('pinterest_board_id')
        .eq('board_slug', item.board_slug)
        .single()
    
    const pinterestBoardId = boardMap?.pinterest_board_id
    if (!pinterestBoardId) {
         throw new Error(`No mapped Pinterest Board ID found for slug: ${item.board_slug}`)
    }

    // 6. Prepare Payload
    const imageUrl = item.asset_9x16_path || item.asset_4x5_path || item.image_path
    const link = item.destination_url || `${appBaseUrl}/recipes/${item.recipe_id}`

    // 7. Publish to Pinterest API
    const pinterestRes = await fetch(`https://api.pinterest.com/v5/pins`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${authData.access_token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            board_id: pinterestBoardId,
            media_source: {
                source_type: 'image_url',
                url: imageUrl
            },
            title: item.pin_title,
            description: item.pin_description,
            link: link
        })
    })

    const pinterestData = await pinterestRes.json()

    if (!pinterestRes.ok) {
        throw new Error(`Pinterest API Error (${pinterestData.code}): ${pinterestData.message}`)
    }

    // 8. Update Queue on Success
    await supabase
        .from('social_queue')
        .update({
            status: 'posted',
            external_post_id: pinterestData.id,
            published_at: new Date().toISOString(),
            publish_error: null,
            locked_at: null
        })
        .eq('id', queue_id)

    return new Response(
      JSON.stringify({ success: true, id: pinterestData.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message, code: error.message.includes("NOT_CONFIGURED") ? "PINTEREST_NOT_CONFIGURED" : "ERROR" }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})