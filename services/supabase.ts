
import { createClient } from '@supabase/supabase-js';

// FIX: Switched from import.meta.env to process.env to resolve TypeScript errors.
// FIX: Changed variable names to match README.md for consistency.
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Supabase URL and anonymous key are required. " +
    "Make sure to set SUPABASE_URL and SUPABASE_ANON_KEY " +
    "environment variables in Vercel."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);