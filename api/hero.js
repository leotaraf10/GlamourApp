import { supabase } from '../server-lib/supabase.js';
import { verifyAdmin } from '../server-lib/auth.js';

export default async function handler(req, res) {
  const { method, query, body } = req;

  if (method === 'GET') {
    const { data, error } = await supabase.from('hero_slides').select('*').eq('active', true).order('order_index', { ascending: true });
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  const admin = verifyAdmin(req);
  if (!admin) return res.status(403).json({ error: 'Admin access required' });

  if (method === 'POST') {
    const { data, error } = await supabase.from('hero_slides').insert([body]).select();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json(data[0]);
  }

  if (method === 'DELETE') {
    const { id } = query;
    const { error } = await supabase.from('hero_slides').delete().eq('id', id);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(204).end();
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
