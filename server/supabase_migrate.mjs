import { createClient } from '@supabase/supabase-js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const sqlite3 = require('sqlite3');

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('🚀 Chargement du script de migration...');

// 1. CONFIGURATION
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Erreur: SUPABASE_URL ou SUPABASE_ANON_KEY manquant.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);
console.log('🏁 Initialisation du script...');
const dbPath = path.resolve(__dirname, 'temp_database.sqlite');
const db = new sqlite3.Database(dbPath);

async function migrate() {
  console.log('🚀 Démarrage de la migration vers Supabase');

  const tables = [
    'users', 'nav_categories', 'products', 'orders', 
    'order_items', 'reviews', 'hero_slides', 
    'home_sections', 'site_settings', 'promo_codes'
  ];

    for (const table of tables) {
      console.log(`📦 Tentative de migration de la table: ${table}...`);
      
      const rows = await new Promise((resolve, reject) => {
        db.all(`SELECT * FROM ${table}`, [], (err, rows) => {
          if (err) { console.error(`❌ Erreur SQL sur ${table}:`, err); reject(err); } else resolve(rows);
        });
      });

      console.log(`✅ Table ${table} lue localement: ${rows.length} lignes.`);

      if (rows.length === 0) {
        console.log(`ℹ️ Table ${table} vide.`);
        continue;
      }

    // Transformation des données (SQLite -> Postgres)
    const formattedRows = rows.map(row => {
      const newRow = { ...row };
      
      // Supprimer l'ID pour laisser Supabase le générer (Postgres identity)
      delete newRow.id; 

      // Convertir les colonnes JSON (TEXT en JSONB)
      ['images', 'videos', 'tailles', 'couleurs', 'stock_variants', 'config', 'data'].forEach(col => {
        if (newRow[col] && typeof newRow[col] === 'string') {
          try { newRow[col] = JSON.parse(newRow[col]); } catch (e) {}
        }
      });

      // Convertir les booleans (0/1 en true/false)
      ['best_seller', 'nouveaute', 'solde', 'active', 'is_hot', 'is_visible', 'whatsapp_sent', 'approuve'].forEach(col => {
        if (newRow[col] !== undefined) newRow[col] = !!newRow[col];
      });

      return newRow;
    });

    // Insertion par paquets de 50 pour éviter les erreurs de timeout
    for (let i = 0; i < formattedRows.length; i += 50) {
      const chunk = formattedRows.slice(i, i + 50);
      const { error } = await supabase.from(table).upsert(chunk);
      if (error) console.error(`❌ Erreur dans ${table}:`, error.message);
    }
    
    console.log(`✅ Table ${table} migrée (${rows.length} lignes).`);
  }

  console.log('🏁 Migration terminée !');
  process.exit(0);
}

migrate().catch(err => {
  console.error('💥 Erreur fatale:', err);
  process.exit(1);
});
