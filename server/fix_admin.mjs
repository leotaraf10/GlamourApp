import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zplnrgzlvqdunuizpldq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpwbG5yZ3psdnFkdW51aXpwbGRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUyMTczMTAsImV4cCI6MjA5MDc5MzMxMH0.5ZJQekU4VLmgRi1__7SWd1ev2F-W9FFOaMSeFeHt7l0';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function fix() {
  console.log('🛡️ Mise à jour des permissions admin...');
  
  const { data, error } = await supabase
    .from('users')
    .update({ role: 'admin' })
    .eq('email', 'admin@glamour.ma')
    .select();

  if (error) {
    console.error('❌ Erreur:', error.message);
  } else {
    console.log('✅ Succès! Utilisateur mis à jour:', data[0]);
  }
  process.exit(0);
}

fix();
