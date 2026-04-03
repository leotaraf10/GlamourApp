import { supabase, supabaseAdmin } from '../../_lib/supabase.js';
import { verifyAdmin } from '../../_lib/auth.js';

export default async function handler(req, res) {
  const { method, query, body } = req;

  // All routes here are admin-only
  const admin = verifyAdmin(req);
  if (!admin) return res.status(403).json({ error: 'Admin access required' });

  if (method === 'GET') {
    const { data, error } = await supabase
      .from('nav_categories')
      .select('*')
      .order('position', { ascending: true });
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  if (method === 'POST') {
    const { data, error } = await supabaseAdmin
      .from('nav_categories')
      .insert([body])
      .select();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json(data[0]);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
