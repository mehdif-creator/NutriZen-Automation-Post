import { createClient } from '@supabase/supabase-js';

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

if (!supabaseUrl || !supabaseKey) {
  console.error("Supabase Environment Variables missing! Check .env file (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY).");
}

// Fallback to placeholder only to prevent immediate crash, app will likely fail on network requests
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseKey || 'placeholder-key'
);