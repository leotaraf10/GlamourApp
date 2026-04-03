import { supabaseAdmin } from '../../_lib/supabase.js';
import { verifyAdmin } from '../../_lib/auth.js';

export default async function handler(req, res) {
  const { id } = req.query;
  const { method, body } = req;

  // All routes here are admin-only
  const admin = verifyAdmin(req);
  if (!admin) return res.status(403).json({ error: 'Admin access required' });

  if (method === 'PUT') {
    const { data, error } = await supabaseAdmin
      .from('hero_slides')
      .update(body)
      .eq('id', id)
      .select();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data[0]);
  }

  if (method === 'DELETE') {
    const { error } = await supabaseAdmin.from('hero_slides').delete().eq('id', id);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(204).end();
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
