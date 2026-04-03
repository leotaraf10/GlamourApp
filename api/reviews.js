import { supabase } from '../_lib/supabase.js';

export default async function handler(req, res) {
  const { method, query, body } = req;

  if (method === 'GET') {
    const { product_id } = query;
    let dbQuery = supabase.from('reviews').select('*').eq('approuve', true);
    if (product_id) dbQuery = dbQuery.eq('product_id', product_id);
    const { data, error } = await dbQuery.order('created_at', { ascending: false });
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  if (method === 'POST') {
    const { data, error } = await supabase.from('reviews').insert([body]).select();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json(data[0]);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
