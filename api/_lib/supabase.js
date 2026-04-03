import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('❌ Supabase credentials missing from Environment Variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
