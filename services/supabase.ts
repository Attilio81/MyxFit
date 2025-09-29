
import { createClient } from '@supabase/supabase-js';

// In a Vite project, environment variables must be prefixed with `VITE_` to be
// exposed on the client.
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