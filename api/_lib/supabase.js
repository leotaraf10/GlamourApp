import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('❌ Supabase credentials missing from Environment Variables');
}

// Standard client (anon key) — pour les lectures publiques
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin client (service role key) — pour les écritures admin sans RLS
export const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseServiceKey || supabaseAnonKey // Fallback sur anon si service key pas configurée
);
