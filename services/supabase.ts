
import { createClient } from '@supabase/supabase-js';

// FIX: Switched from import.meta.env to process.env to resolve TypeScript errors.
// FIX: Changed variable names to match README.md for consistency.
// UPDATE: Now supports both VITE_ prefixed and non-prefixed env vars for flexibility.
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Supabase URL and anonymous key are required. " +
    "Make sure to set SUPABASE_URL and SUPABASE_ANON_KEY " +
    "(or their VITE_ prefixed versions) environment variables in Vercel."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);