import { supabase } from '../_lib/supabase.js';
import { verifyAdmin } from '../_lib/auth.js';

export default async function handler(req, res) {
  const { method, query, body } = req;

  if (method === 'GET') {
    const { data, error } = await supabase.from('site_settings').select('*');
    if (error) return res.status(500).json({ error: error.message });
    // Transform array to object { key: value }
    const settings = data.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {});
    return res.status(200).json(settings);
  }

  const admin = verifyAdmin(req);
  if (!admin) return res.status(403).json({ error: 'Admin access required' });

  if (method === 'POST') {
    // Body is expected to be { key, value }
    const { key, value } = body;
    const { data, error } = await supabase.from('site_settings').upsert({ key, value }).select();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data[0]);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
