import { createClient } from '@supabase/supabase-js';

// WARNING: Hardcoding credentials is a significant security risk.
// This is for local testing ONLY. Do not commit this file to version control.
const supabaseUrl = "";
const supabaseAnonKey = "";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
