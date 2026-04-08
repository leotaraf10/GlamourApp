import { supabase } from './_lib/supabase.js';
import { verifyAdmin } from './_lib/auth.js';

export default async function handler(req, res) {
  const { method, query, body } = req;

  if (method === 'GET') {
    const { data, error } = await supabase.from('home_sections').select('*').order('order_index', { ascending: true });
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  const admin = verifyAdmin(req);
  if (!admin) return res.status(403).json({ error: 'Admin access required' });

  if (method === 'PUT') {
    const { id } = query;
    const { data, error } = await supabase.from('home_sections').update(body).eq('id', id).select();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data[0]);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
