import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase credentials missing (SUPABASE_URL, SUPABASE_ANON_KEY)');
}

export const supabase = createClient(supabaseUrl || 'https://fallback.supabase.co', supabaseAnonKey || 'fallback_key');

export const supabaseAdmin = createClient(
  supabaseUrl || 'https://fallback.supabase.co',
  supabaseServiceKey || supabaseAnonKey || 'fallback_key'
);
