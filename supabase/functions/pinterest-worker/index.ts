import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

declare const Deno: any;

serve(async (req) => {
  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  try {
    // 1. Dequeue Jobs (Atomic)
    const { data: jobs, error } = await supabaseClient.rpc('dequeue_pinterest_jobs', { p_limit: 10 })
    
    if (error) throw error
    if (!jobs || jobs.length === 0) {
        return new Response(JSON.stringify({ message: "No jobs" }), { headers: { 'Content-Type': 'application/json' } })
    }

    const results = []

    // 2. Process Jobs
    for (const job of jobs) {
        try {
            // Call the publish function (internal invocation)
            // Note: In production, you might import the logic directly to save a hop, 
            // but calling the function ensures consistent environment checks.
            const response = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/pinterest-publish`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ queue_id: job.id })
            })

            const resJson = await response.json()

            // If Stub Mode or Error, we might need to handle it
            if (resJson.code === 'PINTEREST_NOT_CONFIGURED') {
                console.error("Stopping worker: Pinterest not configured")
                // Release the job back to 'rendered' or 'failed' so it's not stuck in 'processing'
                 await supabaseClient
                    .from('social_queue')
                    .update({ status: 'failed', publish_error: 'Pinterest secrets missing (Stub Mode)' })
                    .eq('id', job.id)
                break; // Stop processing rest of batch
            }
            
            results.push({ id: job.id, status: response.ok ? 'ok' : 'error', data: resJson })

        } catch (e) {
            console.error(`Job ${job.id} failed`, e)
            await supabaseClient
                .from('social_queue')
                .update({ status: 'failed', publish_error: e.message })
                .eq('id', job.id)
            results.push({ id: job.id, error: e.message })
        }
    }

    return new Response(JSON.stringify({ processed: results.length, details: results }), { headers: { 'Content-Type': 'application/json' } })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } })
  }
})