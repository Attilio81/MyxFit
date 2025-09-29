import { createClient } from '@supabase/supabase-js';

// WARNING: Hardcoding credentials is a significant security risk.
// This is for local testing ONLY. Do not commit this file to version control.
const supabaseUrl = "https://mvcnuxhgopmvskknosyj.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im12Y251eGhnb3BtdnNra25vc3lqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4NzQ3MDUsImV4cCI6MjA3NDQ1MDcwNX0.o3CPqSDGfs2mBoWytzr6fk-RLqr512ieDhyuHp5rtds";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
