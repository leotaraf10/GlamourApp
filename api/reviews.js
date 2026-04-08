import { supabase, supabaseAdmin } from './_lib/supabase.js';
import { verifyAdmin } from './_lib/auth.js';

export default async function handler(req, res) {
  const { method, query, body } = req;

  // GET /api/reviews?product_id=X → public approved reviews for a product
  if (method === 'GET') {
    const { product_id, admin: isAdmin } = query;
    const adminUser = verifyAdmin(req);

    // Admin: return all reviews
    if (adminUser) {
      let dbQuery = supabase.from('reviews').select('*, products(nom)').order('created_at', { ascending: false });
      const { data, error } = await dbQuery;
      if (error) return res.status(500).json({ error: error.message });
      // Flatten product name into review
      const flat = (data || []).map(r => ({ ...r, product_nom: r.products?.nom || '', products: undefined }));
      return res.status(200).json(flat);
    }

    // Public: only approved reviews for a specific product
    if (!product_id) return res.status(400).json({ error: 'product_id required' });
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('product_id', product_id)
      .eq('approuve', true)
      .order('created_at', { ascending: false });
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  // POST → add a public or admin review
  if (method === 'POST') {
    const adminUser = verifyAdmin(req);
    const { data, error } = await supabaseAdmin.from('reviews').insert([{ ...body, approuve: !!adminUser }]).select();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json(data[0]);
  }

  // PUT/DELETE require admin
  const admin = verifyAdmin(req);
  if (!admin) return res.status(403).json({ error: 'Admin access required' });

  if (method === 'PUT') {
    const { id } = query;
    if (!id) return res.status(400).json({ error: 'id required' });
    const { data, error } = await supabaseAdmin.from('reviews').update(body).eq('id', id).select();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data[0]);
  }

  if (method === 'DELETE') {
    const { id } = query;
    if (!id) return res.status(400).json({ error: 'id required' });
    const { error } = await supabaseAdmin.from('reviews').delete().eq('id', id);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(204).end();
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
