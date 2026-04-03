import { createClient } from '@supabase/supabase-js';
import { createRequire } from 'module';
import path from 'path';
import { fileURLToPath } from 'url';

const require = createRequire(import.meta.url);
const sqlite3 = require('sqlite3');
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const supabaseUrl = 'https://zplnrgzlvqdunuizpldq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpwbG5yZ3psdnFkdW51aXpwbGRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUyMTczMTAsImV4cCI6MjA5MDc5MzMxMH0.5ZJQekU4VLmgRi1__7SWd1ev2F-W9FFOaMSeFeHt7l0';

console.log('🚀 Migration finale en cours...');

const supabase = createClient(supabaseUrl, supabaseAnonKey);
const dbPath = path.resolve(__dirname, 'temp_database.sqlite');
const db = new sqlite3.Database(dbPath);

async function run() {
  const tables = [
    'users', 'nav_categories', 'products', 'reviews', 'hero_slides', 
    'home_sections', 'site_settings', 'promo_codes'
  ];

  for (const table of tables) {
    console.log(`📦 Migration: ${table}...`);
    const rows = await new Promise((resolve) => {
      db.all(`SELECT * FROM ${table}`, (err, data) => resolve(data || []));
    });

    if (rows.length === 0) { console.log(`   (Table ${table} vide)`); continue; }

    const formatted = rows.map(r => {
      const n = { ...r };
      delete n.id; // Laisser Supabase générer les nouveaux ID
      ['images', 'videos', 'tailles', 'couleurs', 'stock_variants', 'config', 'data'].forEach(c => {
        if (typeof n[c] === 'string') try { n[c] = JSON.parse(n[c]); } catch(e) {}
      });
      ['best_seller', 'nouveaute', 'solde', 'active', 'is_hot', 'is_visible', 'whatsapp_sent', 'approuve'].forEach(c => {
        if (n[c] !== undefined) n[c] = !!n[c];
      });
      return n;
    });

    const { error } = await supabase.from(table).insert(formatted);
    if (error) console.error(`❌ Erreur ${table}:`, error.message);
    else console.log(`✅ ${table}: ${rows.length} lignes migrées`);
  }
  console.log('🏁 Migration terminée ! Tout est dans le Cloud.');
  process.exit(0);
}

run();
