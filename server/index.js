require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const multer = require('multer');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: ['http://localhost:5001', 'http://localhost:5174', 'http://localhost:5175', 'http://127.0.0.1:5174', 'http://127.0.0.1:5175'], methods: ['GET', 'POST'] }
});

// Ensure uploads directory exists
const uploadsDir = path.resolve(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
app.use('/uploads', express.static('uploads'));

// File upload config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  }
});
const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } }); // 50MB

// ── Security ──────────────────────────────────────────────────────
app.use(helmet({ crossOriginEmbedderPolicy: false, contentSecurityPolicy: false }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 500, standardHeaders: true, legacyHeaders: false }));
app.use(cors({
  origin: ['http://localhost:5174', 'http://localhost:5175', 'http://127.0.0.1:5174', 'http://127.0.0.1:5175', 'http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use('/uploads', express.static(uploadsDir));

// ── DB ───────────────────────────────────────────────────────────
// Support for persistent storage on Render/Railway
const dataDir = path.resolve(__dirname, 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
const dbPath = path.join(dataDir, 'database.sqlite');

const db = new sqlite3.Database(dbPath);
db.run('PRAGMA journal_mode=WAL');
db.run('PRAGMA foreign_keys=ON');

const JWT_SECRET = process.env.JWT_SECRET || 'glamour_secret_2026';

// ── Helpers ────────────────────────────────────────────────────────
const authMiddleware = (req, res, next) => {
  const token = (req.headers['authorization'] || '').split(' ')[1];
  if (!token) return res.sendStatus(401);
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};
const adminMiddleware = (req, res, next) => {
  authMiddleware(req, res, () => {
    if (req.user.role !== 'admin') return res.sendStatus(403);
    next();
  });
};
const parseProduct = (row) => {
  if (!row) return null;
  const safeParse = (str, fallback = []) => {
    try { 
      const parsed = typeof str === 'string' ? JSON.parse(str) : str;
      return Array.isArray(parsed) ? parsed : fallback;
    } catch (e) { return fallback; }
  };
  return {
    ...row,
    images: safeParse(row.images),
    videos: safeParse(row.videos),
    tailles: safeParse(row.tailles),
    couleurs: safeParse(row.couleurs),
    stock_variants: safeParse(row.stock_variants, {}),
    marque: row.marque || null
  };
};

// ── Socket.IO ──────────────────────────────────────────────────────
let liveVisitors = {};
io.on('connection', (socket) => {
  socket.on('page_view', ({ page, sessionId }) => {
    liveVisitors[sessionId] = { page, lastSeen: Date.now() };
    io.to('admin_room').emit('visitors_update', { count: Object.keys(liveVisitors).length, visitors: Object.values(liveVisitors) });
  });
  socket.on('join_admin', () => socket.join('admin_room'));
  socket.on('disconnect', () => {
    // Clean up stale visitors every connection
    const tenMin = Date.now() - 10 * 60 * 1000;
    Object.keys(liveVisitors).forEach(sid => { if (liveVisitors[sid].lastSeen < tenMin) delete liveVisitors[sid]; });
  });
  socket.on('cart_event', (data) => {
    io.to('admin_room').emit('live_cart_event', data);
    db.run(`INSERT INTO visitors_log (session_id, page, action, data) VALUES (?, ?, ?, ?)`,
      [data.sessionId, data.page || '/', data.action, JSON.stringify(data)]);
  });
});

// ── PRODUCTS ─────────────────────────────────────────────────────
app.get('/api/products', (req, res) => {
  const { categorie, best_seller, nouveaute, solde, sort, q, min_price, max_price, taille, couleur, marque } = req.query;
  console.log('GET /api/products - params:', req.query);
  let query = 'SELECT * FROM products WHERE 1=1';
  const params = [];

  if (categorie) { query += ' AND categorie = ?'; params.push(categorie); }
  if (marque) { query += ' AND marque = ?'; params.push(marque); }
  if (best_seller === 'true') { query += ' AND best_seller = 1'; }
  if (nouveaute === 'true') { query += ' AND nouveaute = 1'; }
  if (solde === 'true') { query += ' AND solde = 1'; }
  if (q) { query += ' AND (nom LIKE ? OR description LIKE ?)'; params.push(`%${q}%`, `%${q}%`); }
  
  if (min_price) { query += ' AND COALESCE(prix_solde, prix) >= ?'; params.push(Number(min_price)); }
  if (max_price) { query += ' AND COALESCE(prix_solde, prix) <= ?'; params.push(Number(max_price)); }
  if (taille) { query += ' AND tailles LIKE ?'; params.push(`%"${taille}"%`); }
  if (couleur) { query += ' AND couleurs LIKE ?'; params.push(`%"${couleur}"%`); }

  if (sort === 'price_asc') query += ' ORDER BY COALESCE(prix_solde, prix) ASC';
  else if (sort === 'price_desc') query += ' ORDER BY COALESCE(prix_solde, prix) DESC';
  else query += ' ORDER BY order_index ASC, created_at DESC';

  db.all(query, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows.map(parseProduct));
  });
});


app.get('/api/products/:id', (req, res) => {
  const { id } = req.params;
  console.log(`GET /api/products/${id}`);
  const isSlug = isNaN(id);
  const query = isSlug ? 'SELECT * FROM products WHERE slug = ?' : 'SELECT * FROM products WHERE id = ?';

  db.get(query, [id], (err, row) => {
    if (err) {
      console.error('DB Error:', err.message);
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      console.log('Product not found');
      return res.status(404).json({ error: 'Produit non trouvé' });
    }
    const product = parseProduct(row);
    console.log('Found product:', product.nom);
    res.json(product);
  });
});

// Admin: Create product
app.post('/api/products', adminMiddleware, (req, res) => {
  const { nom, slug, description, prix, prix_solde, best_seller, nouveaute, solde, categorie, stock, stock_variants, images, image_secondary, videos, tailles, couleurs, marque } = req.body;
  db.run(
    `INSERT INTO products (nom, slug, description, prix, prix_solde, best_seller, nouveaute, solde, categorie, stock, stock_variants, images, image_secondary, videos, tailles, couleurs, marque, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
    [nom, slug, description, prix, prix_solde || null, best_seller ? 1 : 0, nouveaute ? 1 : 0, solde ? 1 : 0, categorie, stock || 0,
     JSON.stringify(stock_variants || {}), JSON.stringify(images || []), image_secondary || null, JSON.stringify(videos || []), JSON.stringify(tailles || []), JSON.stringify(couleurs || []), marque || null],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id: this.lastID });
    }
  );
});

// Admin: Update product
app.put('/api/products/:id', adminMiddleware, (req, res) => {
  const { nom, slug, description, prix, prix_solde, best_seller, nouveaute, solde, categorie, stock, stock_variants, images, image_secondary, videos, tailles, couleurs, marque } = req.body;
  db.run(
    `UPDATE products SET nom=?, slug=?, description=?, prix=?, prix_solde=?, best_seller=?, nouveaute=?, solde=?, categorie=?, stock=?, stock_variants=?, images=?, image_secondary=?, videos=?, tailles=?, couleurs=?, marque=?, updated_at=CURRENT_TIMESTAMP WHERE id=?`,
    [nom, slug, description, prix, prix_solde || null, best_seller ? 1 : 0, nouveaute ? 1 : 0, solde ? 1 : 0, categorie, stock || 0,
     JSON.stringify(stock_variants || {}), JSON.stringify(images || []), image_secondary || null, JSON.stringify(videos || []), JSON.stringify(tailles || []), JSON.stringify(couleurs || []), marque || null, req.params.id],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    }
  );
});

// Admin: Delete product
app.delete('/api/products/:id', adminMiddleware, (req, res) => {
  db.run('DELETE FROM products WHERE id = ?', [req.params.id], err => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// Admin: Reorder products
app.post('/api/products/reorder', adminMiddleware, (req, res) => {
  const { order } = req.body; // [{ id, order_index }]
  const stmt = db.prepare('UPDATE products SET order_index = ? WHERE id = ?');
  order.forEach(({ id, order_index }) => stmt.run(order_index, id));
  stmt.finalize(() => res.json({ success: true }));
});

// ── AUTH ───────────────────────────────────────────────────────────
app.post('/api/auth/register', async (req, res) => {
  const { email, password, nom, prenom, tel } = req.body;
  if (!email || !nom || !prenom) return res.status(400).json({ error: 'Champs requis manquants' });
  try {
    const hash = password ? await bcrypt.hash(password, 10) : null;
    db.run(`INSERT INTO users (email, password, nom, prenom, tel) VALUES (?, ?, ?, ?, ?)`,
      [email, hash, nom, prenom, tel || ''],
      function(err) {
        if (err) return res.status(err.message.includes('UNIQUE') ? 400 : 500).json({ error: err.message.includes('UNIQUE') ? 'Email déjà utilisé' : err.message });
        const token = jwt.sign({ id: this.lastID, email, role: 'client' }, JWT_SECRET, { expiresIn: '7d' });
        res.status(201).json({ token, user: { id: this.lastID, email, nom, prenom, role: 'client' } });
      });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!user) return res.status(401).json({ error: 'Identifiants invalides' });
    const valid = user.password ? await bcrypt.compare(password, user.password) : false;
    if (!valid) return res.status(401).json({ error: 'Identifiants invalides' });
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    db.run('UPDATE users SET last_seen_at = CURRENT_TIMESTAMP WHERE id = ?', [user.id]);
    res.json({ token, user: { id: user.id, email: user.email, nom: user.nom, prenom: user.prenom, role: user.role } });
  });
});

// ── ORDERS ─────────────────────────────────────────────────────────
app.post('/api/orders', (req, res) => {
  const { user_id, email, nom, prenom, adresse, code_postal, ville, tel, total, livraison_mode, livraison_cost, promo_code, promo_discount, items } = req.body;
  
  db.serialize(() => {
    db.run(
      `INSERT INTO orders (user_id, email, nom, prenom, adresse, code_postal, ville, tel, total, livraison_mode, livraison_cost, promo_code, promo_discount) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [user_id || null, email, nom, prenom, adresse, code_postal, ville, tel, total, livraison_mode, livraison_cost || 50, promo_code || null, promo_discount || 0],
      function(err) {
        if (err) return res.status(500).json({ error: err.message });
        const orderId = this.lastID;
        
        const itemStmt = db.prepare(`INSERT INTO order_items (order_id, product_id, nom_produit, taille, couleur, quantite, prix_unitaire) VALUES (?, ?, ?, ?, ?, ?, ?)`);
        
        items.forEach(i => {
          // Record order item (added couleur column)
          itemStmt.run(orderId, i.id || null, i.nom, i.taille, i.selectedColor || null, i.quantite, i.prix_solde || i.prix);
          
          // Decrement stock if product ID exists
          if (i.id) {
            db.get('SELECT stock, stock_variants FROM products WHERE id = ?', [i.id], (errProd, prod) => {
              if (!errProd && prod) {
                let variants = {};
                try { variants = JSON.parse(prod.stock_variants || '{}'); } catch(e) {}
                
                const color = i.selectedColor;
                if (color && variants[color] !== undefined) {
                  variants[color] = Math.max(0, variants[color] - i.quantite);
                }
                
                // Recalculate total stock (sum of variants)
                const newTotalStock = Object.values(variants).reduce((a, b) => a + b, 0);
                
                db.run('UPDATE products SET stock = ?, stock_variants = ? WHERE id = ?', 
                  [newTotalStock, JSON.stringify(variants), i.id]);
              }
            });
          }
        });
        
        itemStmt.finalize(() => {
          // Notify admin via Socket.IO
          io.to('admin_room').emit('new_order', { orderId, email, total, items_count: items.length });
          res.status(201).json({ success: true, orderId });
        });
      }
    );
  });
});

// Admin: Get all orders
app.get('/api/orders', adminMiddleware, (req, res) => {
  const { statut, limit = 50, offset = 0 } = req.query;
  let query = 'SELECT * FROM orders';
  const params = [];
  if (statut) { query += ' WHERE statut = ?'; params.push(statut); }
  query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit), parseInt(offset));
  db.all(query, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Admin: Export orders with items
app.get('/api/admin/orders-export', adminMiddleware, (req, res) => {
  const query = `
    SELECT 
      o.*, 
      oi.nom_produit, 
      oi.taille, 
      oi.couleur, 
      oi.quantite, 
      oi.prix_unitaire 
    FROM orders o
    LEFT JOIN order_items oi ON o.id = oi.order_id
    ORDER BY o.created_at DESC
  `;
  db.all(query, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.get('/api/orders/:id', (req, res) => {
  db.get('SELECT * FROM orders WHERE id = ?', [req.params.id], (err, order) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!order) return res.status(404).json({ error: 'Commande non trouvée' });
    db.all('SELECT * FROM order_items WHERE order_id = ?', [order.id], (err2, items) => {
      if (err2) return res.status(500).json({ error: err2.message });
      res.json({ ...order, items });
    });
  });
});

app.put('/api/orders/:id/status', adminMiddleware, (req, res) => {
  const { statut } = req.body;
  db.run('UPDATE orders SET statut = ? WHERE id = ?', [statut, req.params.id], err => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// ── REVIEWS ────────────────────────────────────────────────────────
app.get('/api/reviews/:productId', (req, res) => {
  db.all('SELECT * FROM reviews WHERE product_id = ? AND approuve = 1 ORDER BY created_at DESC', [req.params.productId], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/reviews', (req, res) => {
  const { product_id, user_id, nom, ville, note, commentaire } = req.body;
  db.run(`INSERT INTO reviews (product_id, user_id, nom, ville, note, commentaire) VALUES (?, ?, ?, ?, ?, ?)`,
    [product_id, user_id || null, nom || 'Anonyme', ville || '', note, commentaire],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ success: true, message: 'Avis soumis, en attente de modération.' });
    });
});

app.get('/api/reviews/admin/all', adminMiddleware, (req, res) => {
  db.all('SELECT r.*, p.nom as product_nom FROM reviews r LEFT JOIN products p ON r.product_id = p.id ORDER BY r.created_at DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.put('/api/reviews/:id', adminMiddleware, (req, res) => {
  const { approuve } = req.body;
  db.run('UPDATE reviews SET approuve = ? WHERE id = ?', [approuve ? 1 : 0, req.params.id], err => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

app.delete('/api/reviews/:id', adminMiddleware, (req, res) => {
  db.run('DELETE FROM reviews WHERE id = ?', [req.params.id], err => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

app.post('/api/admin/reviews', adminMiddleware, (req, res) => {
  const { product_id, nom, ville, note, commentaire } = req.body;
  db.run(`INSERT INTO reviews (product_id, nom, ville, note, commentaire, approuve) VALUES (?, ?, ?, ?, ?, 1)`,
    [product_id, nom || 'Admin', ville || '', note, commentaire],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id: this.lastID, success: true });
    });
});

// ── HERO SLIDES ────────────────────────────────────────────────────
app.get('/api/hero-slides', (req, res) => {
  db.all('SELECT * FROM hero_slides WHERE active = 1 ORDER BY order_index ASC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.get('/api/hero-slides/all', adminMiddleware, (req, res) => {
  db.all('SELECT * FROM hero_slides ORDER BY order_index ASC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/hero-slides', adminMiddleware, (req, res) => {
  const { image_url, video_url, title, subtitle, cta_text, cta_link, order_index, active, duration } = req.body;
  db.run(`INSERT INTO hero_slides (image_url, video_url, title, subtitle, cta_text, cta_link, order_index, active, duration) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [image_url, video_url || null, title, subtitle, cta_text || 'Découvrir', cta_link || '/', order_index || 0, active !== false ? 1 : 0, duration || 5000],
    function(err) { if (err) return res.status(500).json({ error: err.message }); res.status(201).json({ id: this.lastID }); });
});

app.put('/api/hero-slides/:id', adminMiddleware, (req, res) => {
  const { image_url, video_url, title, subtitle, cta_text, cta_link, order_index, active, duration } = req.body;
  db.run(`UPDATE hero_slides SET image_url=?, video_url=?, title=?, subtitle=?, cta_text=?, cta_link=?, order_index=?, active=?, duration=? WHERE id=?`,
    [image_url, video_url || null, title, subtitle, cta_text, cta_link, order_index, active ? 1 : 0, duration || 5000, req.params.id],
    err => { if (err) return res.status(500).json({ error: err.message }); res.json({ success: true }); });
});

app.delete('/api/hero-slides/:id', adminMiddleware, (req, res) => {
  db.run('DELETE FROM hero_slides WHERE id = ?', [req.params.id], err => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

app.post('/api/hero-slides/reorder', adminMiddleware, (req, res) => {
  const { order } = req.body;
  const stmt = db.prepare('UPDATE hero_slides SET order_index = ? WHERE id = ?');
  order.forEach(({ id, order_index }) => stmt.run(order_index, id));
  stmt.finalize(() => res.json({ success: true }));
});

// ── HOME SECTIONS ──────────────────────────────────────────────────
app.get('/api/home-sections', (req, res) => {
  db.all('SELECT * FROM home_sections ORDER BY order_index ASC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows.map(r => ({ ...r, config: JSON.parse(r.config || '{}') })));
  });
});

app.put('/api/home-sections/:id', adminMiddleware, (req, res) => {
  const { title, subtitle, active, order_index, config } = req.body;
  db.run('UPDATE home_sections SET title=?, subtitle=?, active=?, order_index=?, config=? WHERE id=?',
    [title, subtitle, active ? 1 : 0, order_index, JSON.stringify(config || {}), req.params.id],
    err => { if (err) return res.status(500).json({ error: err.message }); res.json({ success: true }); });
});

app.post('/api/home-sections/reorder', adminMiddleware, (req, res) => {
  const { order } = req.body;
  const stmt = db.prepare('UPDATE home_sections SET order_index = ? WHERE id = ?');
  order.forEach(({ id, order_index }) => stmt.run(order_index, id));
  stmt.finalize(() => res.json({ success: true }));
});

// ── NAV CATEGORIES ─────────────────────────────────────────────────
// Public: get visible categories ordered by position
app.get('/api/nav-categories', (req, res) => {
  db.all('SELECT * FROM nav_categories WHERE is_visible = 1 ORDER BY position ASC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Admin: get all categories (including hidden)
app.get('/api/admin/nav-categories', adminMiddleware, (req, res) => {
  db.all('SELECT * FROM nav_categories ORDER BY position ASC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Admin: create category
app.post('/api/admin/nav-categories', adminMiddleware, (req, res) => {
  const { name, slug, is_hot, is_visible } = req.body;
  if (!name || !slug) return res.status(400).json({ error: 'name et slug requis' });
  db.run('SELECT MAX(position) as maxpos FROM nav_categories', [], (err, row) => {});
  db.get('SELECT MAX(position) as maxpos FROM nav_categories', [], (err, row) => {
    const nextPos = (row?.maxpos ?? -1) + 1;
    db.run(
      'INSERT INTO nav_categories (name, slug, position, is_hot, is_visible) VALUES (?, ?, ?, ?, ?)',
      [name, slug, nextPos, is_hot ? 1 : 0, is_visible !== false ? 1 : 0],
      function(err2) {
        if (err2) return res.status(500).json({ error: err2.message });
        res.status(201).json({ id: this.lastID, name, slug, position: nextPos, is_hot: is_hot ? 1 : 0, is_visible: 1 });
      }
    );
  });
});

// Admin: update category
app.put('/api/admin/nav-categories/:id', adminMiddleware, (req, res) => {
  const { name, slug, is_hot, is_visible } = req.body;
  db.run(
    'UPDATE nav_categories SET name=?, slug=?, is_hot=?, is_visible=? WHERE id=?',
    [name, slug, is_hot ? 1 : 0, is_visible ? 1 : 0, req.params.id],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    }
  );
});

// Admin: delete category
app.delete('/api/admin/nav-categories/:id', adminMiddleware, (req, res) => {
  db.run('DELETE FROM nav_categories WHERE id=?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// Admin: reorder categories
app.put('/api/admin/nav-categories/reorder', adminMiddleware, (req, res) => {
  const { order } = req.body; // [{id, position}]
  const stmt = db.prepare('UPDATE nav_categories SET position=? WHERE id=?');
  order.forEach(({ id, position }) => stmt.run(position, id));
  stmt.finalize(() => res.json({ success: true }));
});

// ── SITE SETTINGS ──────────────────────────────────────────────────
app.get('/api/settings', (req, res) => {
  db.all('SELECT * FROM site_settings', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    const settings = {};
    rows.forEach(r => settings[r.key] = r.value);
    res.json(settings);
  });
});

app.put('/api/settings', adminMiddleware, (req, res) => {
  const updates = req.body;
  const stmt = db.prepare('INSERT OR REPLACE INTO site_settings (key, value) VALUES (?, ?)');
  Object.entries(updates).forEach(([k, v]) => stmt.run(k, v));
  stmt.finalize(() => res.json({ success: true }));
});

// ── PROMO CODES ────────────────────────────────────────────────────
app.post('/api/promo/validate', (req, res) => {
  const { code, total } = req.body;
  db.get('SELECT * FROM promo_codes WHERE code = ? AND active = 1', [code], (err, promo) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!promo) return res.status(404).json({ error: 'Code promo invalide' });
    if (promo.uses >= promo.max_uses) return res.status(400).json({ error: 'Code promo expiré' });
    if (promo.min_order > total) return res.status(400).json({ error: `Minimum de commande : ${promo.min_order} DH` });
    const discount = promo.type === 'percent' ? (total * promo.value / 100) : promo.value;
    res.json({ discount: Math.round(discount), type: promo.type, value: promo.value });
  });
});

app.get('/api/promo', adminMiddleware, (req, res) => {
  db.all('SELECT * FROM promo_codes ORDER BY created_at DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/promo', adminMiddleware, (req, res) => {
  const { code, type, value, min_order, max_uses } = req.body;
  db.run('INSERT INTO promo_codes (code, type, value, min_order, max_uses) VALUES (?, ?, ?, ?, ?)',
    [code.toUpperCase(), type || 'percent', value, min_order || 0, max_uses || 100],
    function(err) { if (err) return res.status(500).json({ error: err.message }); res.status(201).json({ id: this.lastID }); });
});

// ── FILE UPLOAD ────────────────────────────────────────────────────
app.post('/api/upload', adminMiddleware, upload.array('files', 10), (req, res) => {
  const files = req.files.map(f => ({
    url: `/uploads/${f.filename}`,
    filename: f.filename,
    originalname: f.originalname,
    size: f.size
  }));
  res.json({ files });
});

// ── USERS ADMIN ────────────────────────────────────────────────────
app.get('/api/users', adminMiddleware, (req, res) => {
  db.all('SELECT id, email, nom, prenom, tel, role, created_at, last_seen_at FROM users ORDER BY created_at DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// ── STATS ADMIN ────────────────────────────────────────────────────
app.get('/api/stats', adminMiddleware, (req, res) => {
  const stats = {};
  db.get('SELECT COUNT(*) as total, COALESCE(SUM(total), 0) as revenue FROM orders WHERE statut != "cancelled"', [], (err, row) => {
    stats.orders_total = row?.total || 0;
    stats.revenue_total = row?.revenue || 0;
    db.get('SELECT COUNT(*) as total FROM orders WHERE DATE(created_at) = DATE("now")', [], (err2, row2) => {
      stats.orders_today = row2?.total || 0;
      db.get('SELECT COUNT(*) as total FROM users WHERE role = "client"', [], (err3, row3) => {
        stats.clients_total = row3?.total || 0;
        db.get('SELECT COUNT(*) as total FROM products WHERE stock < 10', [], (err4, row4) => {
          stats.low_stock = row4?.total || 0;
          res.json(stats);
        });
      });
    });
  });
});

app.get('/api/stats/sales-by-day', adminMiddleware, (req, res) => {
  db.all(`SELECT DATE(created_at) as date, COUNT(*) as orders, SUM(total) as revenue 
          FROM orders WHERE created_at > datetime('now', '-7 days') AND statut != 'cancelled'
          GROUP BY DATE(created_at) ORDER BY date ASC`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// ── START ──────────────────────────────────────────────────────────

// Ensure nav_categories table exists and seed defaults if empty
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS nav_categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    position INTEGER DEFAULT 0,
    is_hot INTEGER DEFAULT 0,
    is_visible INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Seed default categories if empty
  db.get('SELECT COUNT(*) as cnt FROM nav_categories', [], (err, row) => {
    if (!err && row && row.cnt === 0) {
      const defaults = [
        { name: 'Soldes -50%', slug: 'soldes', is_hot: 1 },
        { name: 'Été 2025', slug: 'ete-2025', is_hot: 0 },
        { name: 'Jeans', slug: 'jeans', is_hot: 0 },
        { name: 'Robes', slug: 'robes', is_hot: 0 },
        { name: 'Ensembles', slug: 'ensembles', is_hot: 0 },
        { name: 'Pantalons', slug: 'pantalons', is_hot: 0 },
        { name: 'Blazers', slug: 'blazers', is_hot: 0 },
        { name: 'Manteaux | Trench', slug: 'manteaux-trench', is_hot: 0 },
      ];
      const stmt = db.prepare('INSERT INTO nav_categories (name, slug, position, is_hot, is_visible) VALUES (?, ?, ?, ?, 1)');
      defaults.forEach((c, i) => stmt.run(c.name, c.slug, i, c.is_hot));
      stmt.finalize();
      console.log('✅ Nav categories seeded');
    }
  });
});

// ── SERVE FRONTEND (Production) ───────────────────────────────────
const frontendPath = path.resolve(__dirname, '../dist');
if (fs.existsSync(frontendPath)) {
  app.use(express.static(frontendPath));
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(frontendPath, 'index.html'));
    }
  });
}

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`🚀 Server + Socket.IO running on port ${PORT}`);
});

