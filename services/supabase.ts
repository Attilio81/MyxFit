// FIX: Add triple-slash directive to provide types for Vite's `import.meta.env`.
/// <reference types="vite/client" />

import { createClient } from '@supabase/supabase-js';

// In a Vite project, environment variables are exposed on the client via `import.meta.env`.
// To be exposed, they MUST be prefixed with `VITE_`.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Supabase URL and anonymous key are required. " +
    "Make sure to set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY " +
    "environment variables in Vercel."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);