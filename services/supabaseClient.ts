import { createClient } from '@supabase/supabase-js';

// Helper to safely access env vars in various environments (Vite, CRA, Browser)
const getEnv = (key: string) => {
  try {
    // Check process.env (Create React App, Node)
    // @ts-ignore
    if (typeof process !== 'undefined' && process.env) {
      // @ts-ignore
      return process.env[key];
    }
    // Check import.meta.env (Vite)
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      // @ts-ignore
      return import.meta.env[key];
    }
  } catch (e) {
    // Ignore errors
  }
  return undefined;
};

// Use fallbacks to prevent "supabaseUrl is required" crash
const supabaseUrl = getEnv('REACT_APP_SUPABASE_URL') || 'https://placeholder.supabase.co';
const supabaseKey = getEnv('REACT_APP_SUPABASE_ANON_KEY') || 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseKey);