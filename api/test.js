import { supabase } from './_lib/supabase.js';

export default async function handler(req, res) {
  try {
    const { data, error } = await supabase.from('users').select('count', { count: 'exact', head: true });
    if (error) throw error;
    
    return res.status(200).json({ 
      status: 'OK', 
      message: 'Connecté à Supabase avec succès !',
      env: {
        url: process.env.SUPABASE_URL ? 'Défini' : 'MANQUANT',
        key: process.env.SUPABASE_ANON_KEY ? 'Défini' : 'MANQUANT'
      }
    });
  } catch (err) {
    return res.status(500).json({ 
      status: 'ERROR', 
      message: err.message,
      env: {
        url: process.env.SUPABASE_URL ? 'Défini' : 'MANQUANT',
        key: process.env.SUPABASE_ANON_KEY ? 'Défini' : 'MANQUANT'
      }
    });
  }
}
