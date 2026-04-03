const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcrypt');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

async function seed() {
  const salt = await bcrypt.genSalt(10);
  const adminPassword = await bcrypt.hash('admin123', salt);

  db.serialize(() => {
    db.run(`DROP TABLE IF EXISTS order_items`);
    db.run(`DROP TABLE IF EXISTS orders`);
    db.run(`DROP TABLE IF EXISTS reviews`);
    db.run(`DROP TABLE IF EXISTS cart_items`);
    db.run(`DROP TABLE IF EXISTS products`);
    db.run(`DROP TABLE IF EXISTS users`);
    db.run(`DROP TABLE IF EXISTS hero_slides`);
    db.run(`DROP TABLE IF EXISTS home_sections`);
    db.run(`DROP TABLE IF EXISTS site_settings`);
    db.run(`DROP TABLE IF EXISTS visitors_log`);
    db.run(`DROP TABLE IF EXISTS promo_codes`);

    // USERS
    db.run(`CREATE TABLE users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT,
      nom TEXT NOT NULL,
      prenom TEXT NOT NULL,
      tel TEXT,
      role TEXT DEFAULT 'client',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_seen_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // PRODUCTS (extended)
    db.run(`CREATE TABLE products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nom TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT,
      prix REAL NOT NULL,
      prix_solde REAL,
      best_seller INTEGER DEFAULT 0,
      nouveaute INTEGER DEFAULT 0,
      solde INTEGER DEFAULT 0,
      categorie TEXT NOT NULL,
      stock INTEGER DEFAULT 100,
      images TEXT DEFAULT '[]',
      image_secondary TEXT,
      videos TEXT DEFAULT '[]',
      tailles TEXT DEFAULT '[]',
      couleurs TEXT DEFAULT '[]',
      order_index INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // ORDERS
    db.run(`CREATE TABLE orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      email TEXT NOT NULL,
      nom TEXT NOT NULL,
      prenom TEXT NOT NULL,
      adresse TEXT NOT NULL,
      code_postal TEXT NOT NULL,
      ville TEXT NOT NULL,
      tel TEXT NOT NULL,
      total REAL NOT NULL,
      statut TEXT DEFAULT 'pending',
      livraison_mode TEXT NOT NULL,
      livraison_cost REAL DEFAULT 50,
      promo_code TEXT,
      promo_discount REAL DEFAULT 0,
      whatsapp_sent INTEGER DEFAULT 0,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // ORDER ITEMS
    db.run(`CREATE TABLE order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      product_id INTEGER,
      nom_produit TEXT NOT NULL,
      taille TEXT NOT NULL,
      quantite INTEGER NOT NULL,
      prix_unitaire REAL NOT NULL
    )`);

    // REVIEWS
    db.run(`CREATE TABLE reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      user_id INTEGER,
      nom TEXT NOT NULL DEFAULT 'Anonyme',
      ville TEXT DEFAULT '',
      note INTEGER NOT NULL,
      commentaire TEXT,
      approuve INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // CART ITEMS (persistent)
    db.run(`CREATE TABLE cart_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id TEXT,
      user_id INTEGER,
      product_id INTEGER NOT NULL,
      nom_produit TEXT NOT NULL,
      prix REAL NOT NULL,
      taille TEXT NOT NULL,
      quantite INTEGER NOT NULL DEFAULT 1,
      image TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // HERO SLIDES
    db.run(`CREATE TABLE hero_slides (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      image_url TEXT,
      video_url TEXT,
      title TEXT,
      subtitle TEXT,
      cta_text TEXT DEFAULT 'Découvrir',
      cta_link TEXT DEFAULT '/',
      order_index INTEGER DEFAULT 0,
      active INTEGER DEFAULT 1,
      duration INTEGER DEFAULT 5000
    )`);

    // HOME SECTIONS
    db.run(`CREATE TABLE home_sections (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT UNIQUE NOT NULL,
      title TEXT,
      subtitle TEXT,
      active INTEGER DEFAULT 1,
      order_index INTEGER DEFAULT 0,
      config TEXT DEFAULT '{}'
    )`);

    // SITE SETTINGS
    db.run(`CREATE TABLE site_settings (
      key TEXT PRIMARY KEY,
      value TEXT
    )`);

    // VISITORS LOG
    db.run(`CREATE TABLE visitors_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id TEXT,
      page TEXT,
      action TEXT,
      data TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // PROMO CODES
    db.run(`CREATE TABLE promo_codes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE NOT NULL,
      type TEXT DEFAULT 'percent',
      value REAL NOT NULL,
      min_order REAL DEFAULT 0,
      max_uses INTEGER DEFAULT 100,
      uses INTEGER DEFAULT 0,
      active INTEGER DEFAULT 1,
      expires_at DATETIME
    )`);

    console.log('Schema created.');

    // SEED ADMIN
    db.run(`INSERT OR IGNORE INTO users (email, password, nom, prenom, role) VALUES (?, ?, ?, ?, ?)`,
      ['admin@glamour.ma', adminPassword, 'Admin', 'Super', 'admin']);

    // SEED PRODUCTS
    const products = [
      {
        nom: 'Legging Taille Haute Sculptant', slug: 'legging-taille-haute', description: '<p>Le legging qui redéfinit la silhouette. Tissu compressant à haute teneur en élasthanne, coutures plates anti-frottements.</p>',
        prix: 399, prix_solde: 249, best_seller: 1, nouveaute: 0, solde: 1, categorie: 'femme',
        images: JSON.stringify([
          { url: 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=700&q=80', is_primary: 1, is_secondary: 0, order: 0 },
          { url: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=700&q=80', is_primary: 0, is_secondary: 1, order: 1 }
        ]),
        image_secondary: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=700&q=80',
        tailles: JSON.stringify(['XS', 'S', 'M', 'L', 'XL']), 
        couleurs: JSON.stringify(['Noir', 'Taupe']),
        stock: 150, order_index: 1
      },
      {
        nom: 'Ensemble Côtelé Sans Couture', slug: 'ensemble-cotele', description: '<p>Confort et élégance sans compromis. Assemblé sans coutures pour un toucher second peau exceptionnel.</p>',
        prix: 549, prix_solde: null, best_seller: 1, nouveaute: 1, solde: 0, categorie: 'femme',
        images: JSON.stringify([
          { url: 'https://images.unsplash.com/photo-1518310383802-640c2de311b2?w=700&q=80', is_primary: 1, is_secondary: 0, order: 0 },
          { url: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=700&q=80', is_primary: 0, is_secondary: 1, order: 1 }
        ]),
        image_secondary: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=700&q=80',
        tailles: JSON.stringify(['S', 'M', 'L']), 
        couleurs: JSON.stringify(['Beige', 'Taupe']),
        stock: 80, order_index: 2
      },
      {
        nom: 'Veste Coupe-vent Minimaliste', slug: 'veste-coupe-vent', description: '<p>Légère, respirante et imperméable. La compagne idéale pour vos séances outdoor.</p>',
        prix: 599, prix_solde: null, best_seller: 0, nouveaute: 1, solde: 0, categorie: 'femme',
        images: JSON.stringify([
          { url: 'https://images.unsplash.com/photo-1556821840-a3bd585ca4c8?w=700&q=80', is_primary: 1, is_secondary: 0, order: 0 }
        ]),
        image_secondary: null,
        tailles: JSON.stringify(['M', 'L', 'XL']), 
        couleurs: JSON.stringify(['Noir']),
        stock: 40, order_index: 3
      },
      {
        nom: 'Brassière Maintien Performance', slug: 'brassiere-maintien', description: '<p>Maintien renforcé pour les sports à fort impact. Bretelles croisées et bonnets moulés.</p>',
        prix: 299, prix_solde: 199, best_seller: 1, nouveaute: 0, solde: 1, categorie: 'femme',
        images: JSON.stringify([
          { url: 'https://images.unsplash.com/photo-1535743686920-55e4145369b9?w=700&q=80', is_primary: 1, is_secondary: 0, order: 0 },
          { url: 'https://images.unsplash.com/photo-1570655652364-2e0a67455ac6?w=700&q=80', is_primary: 0, is_secondary: 1, order: 1 }
        ]),
        image_secondary: 'https://images.unsplash.com/photo-1570655652364-2e0a67455ac6?w=700&q=80',
        tailles: JSON.stringify(['S', 'M', 'L']), 
        couleurs: JSON.stringify(['Bordeaux', 'Noir']),
        stock: 200, order_index: 4
      },
      {
        nom: 'Short Training Homme', slug: 'short-training-homme', description: '<p>Short technique avec poches intégrées. Tissu dry-fit ultra respirant.</p>',
        prix: 249, prix_solde: null, best_seller: 0, nouveaute: 1, solde: 0, categorie: 'homme',
        images: JSON.stringify([
          { url: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=700&q=80', is_primary: 1, is_secondary: 0, order: 0 }
        ]),
        image_secondary: null,
        tailles: JSON.stringify(['S', 'M', 'L', 'XL']), 
        couleurs: JSON.stringify(['Gris', 'Noir']),
        stock: 60, order_index: 5
      },
      {
        nom: 'T-Shirt Oversize Homme', slug: 'tshirt-oversize-homme', description: '<p>Coupe oversize décontractée en coton bio. Idéal post-workout.</p>',
        prix: 199, prix_solde: 149, best_seller: 1, nouveaute: 0, solde: 1, categorie: 'homme',
        images: JSON.stringify([
          { url: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=700&q=80', is_primary: 1, is_secondary: 0, order: 0 },
          { url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=700&q=80', is_primary: 0, is_secondary: 1, order: 1 }
        ]),
        image_secondary: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=700&q=80',
        tailles: JSON.stringify(['S', 'M', 'L', 'XL', 'XXL']), 
        couleurs: JSON.stringify(['Blanc', 'Noir']),
        stock: 300, order_index: 6
      }
    ];

    const pStmt = db.prepare(`INSERT OR IGNORE INTO products (nom, slug, description, prix, prix_solde, best_seller, nouveaute, solde, categorie, images, image_secondary, tailles, couleurs, stock, order_index) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
    products.forEach(p => {
      pStmt.run(p.nom, p.slug, p.description, p.prix, p.prix_solde, p.best_seller, p.nouveaute, p.solde, p.categorie, p.images, p.image_secondary, p.tailles, p.couleurs, p.stock, p.order_index);
    });
    pStmt.finalize();

    // SEED HERO SLIDES
    const slides = [
      { image_url: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&q=80&w=2000', title: 'Nouvelle Collection', subtitle: 'L\'Élégance en Mouvement', cta_text: 'Découvrir', cta_link: '/collections/nouveautes', order_index: 0 },
      { image_url: 'https://images.unsplash.com/photo-1518310383802-640c2de311b2?auto=format&fit=crop&q=80&w=2000', title: 'Best Sellers', subtitle: 'Les Pièces Incontournables', cta_text: 'Voir la Sélection', cta_link: '/collections/best-sellers', order_index: 1 },
      { image_url: 'https://images.unsplash.com/photo-1535743686920-55e4145369b9?auto=format&fit=crop&q=80&w=2000', title: 'Soldes', subtitle: 'Jusqu\'à -40% sur une Sélection', cta_text: 'Profiter des Soldes', cta_link: '/collections/soldes', order_index: 2 },
    ];
    const sStmt = db.prepare(`INSERT OR IGNORE INTO hero_slides (image_url, title, subtitle, cta_text, cta_link, order_index) VALUES (?, ?, ?, ?, ?, ?)`);
    slides.forEach(s => sStmt.run(s.image_url, s.title, s.subtitle, s.cta_text, s.cta_link, s.order_index));
    sStmt.finalize();

    // SEED HOME SECTIONS
    const sections = [
      { type: 'promobanner', title: 'Livraison offerte dès 1000 DH | Paiement à la livraison | Retours gratuits 30 jours', active: 1, order_index: 0 },
      { type: 'hero', title: 'Hero Carrousel', active: 1, order_index: 1 },
      { type: 'best_sellers', title: 'Best Sellers', subtitle: 'Les pièces que tout le monde s\'arrache', active: 1, order_index: 2 },
      { type: 'nouveautes', title: 'Nouveautés', subtitle: 'Les dernières pièces de la collection', active: 1, order_index: 3 },
      { type: 'soldes', title: 'Soldes', subtitle: 'Nos offres exclusives', active: 1, order_index: 4 },
      { type: 'social_proof', title: 'Ce Qu\'ils En Disent', active: 1, order_index: 5 },
    ];
    const secStmt = db.prepare(`INSERT OR IGNORE INTO home_sections (type, title, subtitle, active, order_index) VALUES (?, ?, ?, ?, ?)`);
    sections.forEach(s => secStmt.run(s.type, s.title, s.subtitle || null, s.active, s.order_index));
    secStmt.finalize();

    // SEED SITE SETTINGS
    const settings = [
      ['whatsapp_number', '212600000000'],
      ['delivery_standard_cost', '50'],
      ['delivery_express_cost', '120'],
      ['delivery_standard_days', '5-7'],
      ['delivery_express_days', '2-3'],
      ['free_delivery_threshold', '1000'],
      ['instagram_url', '#'],
      ['tiktok_url', '#'],
      ['facebook_url', '#'],
    ];
    const setStmt = db.prepare(`INSERT OR IGNORE INTO site_settings (key, value) VALUES (?, ?)`);
    settings.forEach(([k, v]) => setStmt.run(k, v));
    setStmt.finalize();

    // SEED PROMO CODES
    db.run(`INSERT OR IGNORE INTO promo_codes (code, type, value, min_order) VALUES ('BIENVENUE10', 'percent', 10, 500)`);

    // SEED REVIEWS
    const reviews = [
      { product_id: 1, nom: 'Marie L.', ville: 'Casablanca', note: 5, commentaire: 'Qualité exceptionnelle et taille parfaite. Je recommande vivement !', approuve: 1 },
      { product_id: 2, nom: 'Sofia K.', ville: 'Marrakech', note: 5, commentaire: 'Le tissu est incroyable, très doux. Le maintien est parfait pour mes cours de yoga.', approuve: 1 },
      { product_id: 4, nom: 'Zineb M.', ville: 'Rabat', note: 5, commentaire: 'Exactement ce que je cherchais. Livraison rapide et conditionnement irréprochable.', approuve: 1 },
    ];
    const rStmt = db.prepare(`INSERT OR IGNORE INTO reviews (product_id, nom, ville, note, commentaire, approuve) VALUES (?, ?, ?, ?, ?, ?)`);
    reviews.forEach(r => rStmt.run(r.product_id, r.nom, r.ville, r.note, r.commentaire, r.approuve));
    rStmt.finalize(() => {
      console.log('All data seeded successfully.');
      db.close();
    });
  });
}

seed().catch(err => {
  console.error('Seed error:', err);
  db.close();
});

