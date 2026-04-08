import { supabase, supabaseAdmin } from '../_lib/supabase.js';
import { verifyAdmin } from '../_lib/auth.js';

export default async function handler(req, res) {
  const { method, query, body } = req;

  if (method === 'GET') {
    // /api/hero-slides?all=true → admin sees all slides
    // /api/hero-slides → public sees only active slides
    const admin = verifyAdmin(req);
    const showAll = query.all === 'true' && admin;

    let dbQuery = supabase.from('hero_slides').select('*').order('order_index', { ascending: true });
    if (!showAll) dbQuery = dbQuery.eq('active', true);

    const { data, error } = await dbQuery;
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  // All mutations require admin
  const admin = verifyAdmin(req);
  if (!admin) return res.status(403).json({ error: 'Admin access required' });

  if (method === 'POST') {
    const { data, error } = await supabaseAdmin.from('hero_slides').insert([body]).select();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json(data[0]);
  }

  if (method === 'PUT') {
    const { id } = query;
    if (!id) return res.status(400).json({ error: 'id required' });
    const { data, error } = await supabaseAdmin.from('hero_slides').update(body).eq('id', id).select();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data[0]);
  }

  if (method === 'DELETE') {
    const { id } = query;
    if (!id) return res.status(400).json({ error: 'id required' });
    const { error } = await supabaseAdmin.from('hero_slides').delete().eq('id', id);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(204).end();
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
