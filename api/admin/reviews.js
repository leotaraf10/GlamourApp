import { supabaseAdmin } from '../../_lib/supabase.js';
import { verifyAdmin } from '../../_lib/auth.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const admin = verifyAdmin(req);
  if (!admin) return res.status(403).json({ error: 'Admin access required' });

  const { product_id, nom, ville, note, commentaire } = req.body;

  if (!product_id || !note) {
    return res.status(400).json({ error: 'product_id and note are required' });
  }

  const { data, error } = await supabaseAdmin
    .from('reviews')
    .insert([{
      product_id,
      nom: nom || 'Admin',
      ville: ville || '',
      note: parseInt(note),
      commentaire: commentaire || '',
      approuve: true, // Admin reviews are auto-approved
    }])
    .select();

  if (error) return res.status(500).json({ error: error.message });
  return res.status(201).json(data[0]);
}
