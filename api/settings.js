import { supabase, supabaseAdmin } from './_lib/supabase.js';
import { verifyAdmin } from './_lib/auth.js';

export default async function handler(req, res) {
  const { method, body } = req;

  // GET /api/settings → returns all settings as key-value object
  if (method === 'GET') {
    const { data, error } = await supabase.from('site_settings').select('*');
    if (error) return res.status(500).json({ error: error.message });
    // Convert array of {key, value} to a flat object
    const settings = {};
    (data || []).forEach(row => { settings[row.key] = row.value; });
    return res.status(200).json(settings);
  }

  // PUT /api/settings → upsert all key-value pairs
  const admin = verifyAdmin(req);
  if (!admin) return res.status(403).json({ error: 'Admin access required' });

  if (method === 'PUT') {
    const entries = Object.entries(body || {}).map(([key, value]) => ({
      key,
      value: String(value ?? ''),
    }));

    if (entries.length === 0) return res.status(400).json({ error: 'No settings provided' });

    const { error } = await supabaseAdmin
      .from('site_settings')
      .upsert(entries, { onConflict: 'key' });

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
