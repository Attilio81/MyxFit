
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mvcnuxhgopmvskknosyj.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im12Y251eGhnb3BtdnNra25vc3lqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4NzQ3MDUsImV4cCI6MjA3NDQ1MDcwNX0.o3CPqSDGfs2mBoWytzr6fk-RLqr512ieDhyuHp5rtds';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL and Anon Key must be provided.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
