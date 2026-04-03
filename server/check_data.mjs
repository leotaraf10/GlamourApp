import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zplnrgzlvqdunuizpldq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpwbG5yZ3psdnFkdW51aXpwbGRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUyMTczMTAsImV4cCI6MjA5MDc5MzMxMH0.5ZJQekU4VLmgRi1__7SWd1ev2F-W9FFOaMSeFeHt7l0';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
  console.log('🔍 Vérification de Supabase...');
  
  const { data: prods } = await supabase.from('products').select('id, nom, slug, categorie, best_seller');
  console.log(`📦 Produits (${prods?.length || 0}):`, prods);
  
  const { data: cats } = await supabase.from('nav_categories').select('*');
  console.log(`📂 Catégories (${cats?.length || 0}):`, cats);
  
  process.exit(0);
}

check();
