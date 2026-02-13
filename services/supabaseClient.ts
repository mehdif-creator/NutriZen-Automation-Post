import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Helper to safely access env vars, prioritizing Vite
const getEnv = (key: string, viteKey: string) => {
  try {
    // 1. Vite (import.meta.env) - Primary
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[viteKey]) {
      // @ts-ignore
      return import.meta.env[viteKey];
    }
    
    // 2. CRA / Node (process.env) - Fallback
    // @ts-ignore
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
      // @ts-ignore
      return process.env[key];
    }
  } catch (e) {
    // Ignore access errors
  }
  return undefined;
};

const supabaseUrl = getEnv('REACT_APP_SUPABASE_URL', 'VITE_SUPABASE_URL');
const supabaseKey = getEnv('REACT_APP_SUPABASE_ANON_KEY', 'VITE_SUPABASE_ANON_KEY');

// Flag to check if we have real credentials
export const isSupabaseConfigured = !!supabaseUrl && !!supabaseKey && supabaseUrl !== 'undefined' && supabaseKey !== 'undefined';

if (!isSupabaseConfigured) {
  console.warn("Supabase Environment Variables missing! App running in Mock Mode. (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY not found)");
}

// Mock Client Construction
const createMockClient = () => {
    const mockSession = {
        user: { id: 'demo-user', email: 'demo@nutrizen.app' },
        access_token: 'mock-token',
        expires_in: 3600
    };

    return {
        auth: {
            getSession: async () => ({ data: { session: mockSession }, error: null }),
            getUser: async () => ({ data: { user: mockSession.user }, error: null }),
            onAuthStateChange: (callback: any) => {
                // Immediately fire signed in for demo
                setTimeout(() => callback('SIGNED_IN', mockSession), 0);
                return { data: { subscription: { unsubscribe: () => {} } } };
            },
            signInWithOAuth: async () => {
                console.log("Mock Sign In");
                return { data: { url: window.location.origin }, error: null };
            },
            signOut: async () => {
                console.log("Mock Sign Out");
                return { error: null };
            }
        },
        functions: {
            invoke: async (fn: string, args: any) => {
                console.warn(`[Mock] Function ${fn} invoked`, args);
                
                // Simulate error for OAuth start to show config warning in Settings
                if (fn === 'pinterest-oauth-start') {
                    return { error: { message: "Mock Mode: Edge Functions not available." } };
                }
                
                // Simulate successful publish in mock mode
                if (fn === 'pinterest-publish') {
                     return { data: { success: true, id: 'mock-pin-id' }, error: null };
                }

                // Default success for other functions
                return { data: { success: true }, error: null };
            }
        },
        // Minimal DB mock to prevent crashes if something accesses it directly
        from: (table: string) => ({
            select: () => ({
                order: () => ({ data: [], error: null }),
                eq: () => ({ 
                    single: () => ({ data: null, error: null }),
                    maybeSingle: () => ({ data: null, error: null })
                })
            }),
            insert: () => ({ select: () => ({ single: () => ({ data: null, error: null }) }) }),
            update: () => ({ eq: () => ({ select: () => ({ single: () => ({ data: null, error: null }) }) }) }),
            delete: () => ({ eq: () => ({ error: null }) }),
            upsert: () => ({ error: null })
        })
    };
};

// Export either real client or mock object based on configuration
export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl!, supabaseKey!) 
  : (createMockClient() as unknown as SupabaseClient);