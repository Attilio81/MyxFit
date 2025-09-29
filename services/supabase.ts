
import { createClient } from '@supabase/supabase-js';

// FIX: Switched from import.meta.env to process.env to resolve TypeScript errors.
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Supabase URL and anonymous key are required. " +
    "Make sure to set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY " +
    "environment variables in Vercel."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);