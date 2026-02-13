import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

declare const Deno: any;

serve(async (req) => {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  
  const supabase = createClient(supabaseUrl, supabaseKey)

  try {
    // 1. Dequeue Jobs (Atomic RPC)
    const { data: jobs, error } = await supabase.rpc('dequeue_pinterest_jobs', { p_limit: 5 })
    
    if (error) throw error
    if (!jobs || jobs.length === 0) {
        return new Response(JSON.stringify({ message: "No jobs to process" }), { headers: { 'Content-Type': 'application/json' } })
    }

    const results = []

    // 2. Process Batch
    for (const job of jobs) {
        try {
            console.log(`Processing Job ${job.id}...`)
            
            // We invoke the publish function using the Service Role Key.
            // This ensures we can update the DB even if the publish function fails internally.
            const response = await fetch(`${supabaseUrl}/functions/v1/pinterest-publish`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${supabaseKey}`, // Passing Service Role to bypass Admin check if logic allows
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ queue_id: job.id })
            })

            const resJson = await response.json()

            if (!response.ok) {
                const isConfigError = resJson.code === 'PINTEREST_NOT_CONFIGURED'
                
                await supabase
                    .from('social_queue')
                    .update({ 
                        status: 'failed', 
                        publish_error: resJson.error || 'Unknown error',
                        // If it's a config error, maybe don't unlock immediately or set a long backoff?
                        // For now, simple fail.
                    })
                    .eq('id', job.id)
                
                if (isConfigError) {
                    console.error("Pinterest not configured. Aborting batch.")
                    break;
                }
            }
            
            results.push({ id: job.id, status: response.ok ? 'ok' : 'failed', result: resJson })

        } catch (e) {
            console.error(`Worker execution failed for ${job.id}`, e)
            await supabase
                .from('social_queue')
                .update({ status: 'failed', publish_error: e.message })
                .eq('id', job.id)
        }
    }

    return new Response(JSON.stringify({ processed: results.length, details: results }), { headers: { 'Content-Type': 'application/json' } })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } })
  }
})