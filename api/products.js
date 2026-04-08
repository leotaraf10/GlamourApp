import { supabase, supabaseAdmin } from './_lib/supabase.js';
import { verifyAdmin } from './_lib/auth.js';

export default async function handler(req, res) {
  const { method, query, body } = req;

  if (method === 'GET') {
    const { id, categorie, best_seller, nouveaute, solde, sort, q, min_price, max_price, taille, couleur, marque } = query;

    let dbQuery = supabase.from('products').select('*');

    // Filters
    if (id) {
       const isSlug = isNaN(id);
       dbQuery = isSlug ? dbQuery.eq('slug', id) : dbQuery.eq('id', id);
       const { data, error } = await dbQuery.single();
       if (error) return res.status(404).json({ error: 'Product not found' });
       return res.status(200).json(data);
    }

    if (categorie) dbQuery = dbQuery.eq('categorie', categorie);
    if (marque) dbQuery = dbQuery.eq('marque', marque);
    if (best_seller === 'true') dbQuery = dbQuery.eq('best_seller', true);
    if (nouveaute === 'true') dbQuery = dbQuery.eq('nouveaute', true);
    if (solde === 'true') dbQuery = dbQuery.eq('solde', true);
    if (q) dbQuery = dbQuery.or(`nom.ilike.%${q}%,description.ilike.%${q}%`);
    
    if (min_price) dbQuery = dbQuery.gte('prix', Number(min_price));
    if (max_price) dbQuery = dbQuery.lte('prix', Number(max_price));

    // Array filters (tailles, couleurs) - stored as JSONB
    if (taille) dbQuery = dbQuery.contains('tailles', [taille]);
    if (couleur) dbQuery = dbQuery.contains('couleurs', [couleur]);

    // Sorting
    if (sort === 'price_asc') dbQuery = dbQuery.order('prix', { ascending: true });
    else if (sort === 'price_desc') dbQuery = dbQuery.order('prix', { ascending: false });
    else dbQuery = dbQuery.order('order_index', { ascending: true }).order('created_at', { ascending: false });

    const { data, error } = await dbQuery;
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  // All write operations require admin
  const admin = verifyAdmin(req);
  if (!admin) return res.status(403).json({ error: 'Admin access required' });

  if (method === 'POST') {
    const { data, error } = await supabaseAdmin.from('products').insert([body]).select();
    if (error) {
      console.error('❌ Supabase Insert Error:', error);
      return res.status(500).json({ error: error.message });
    }
    return res.status(201).json(data[0]);
  }

  if (method === 'PUT') {
    const { id } = query;
    if (!id) return res.status(400).json({ error: 'id required' });
    const { data, error } = await supabaseAdmin.from('products').update(body).eq('id', id).select();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data[0]);
  }

  if (method === 'DELETE') {
    const { id } = query;
    if (!id) return res.status(400).json({ error: 'id required' });
    const { error } = await supabaseAdmin.from('products').delete().eq('id', id);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(204).end();
  }

  // Handle other methods
  return res.status(405).json({ error: 'Method not allowed' });
}
