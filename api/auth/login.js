import { supabase } from '../_lib/supabase.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'glamour_secret_2026';

export default async function handler(req, res) {
  const { method, body } = req;

  if (method === 'POST') {
    const { email, password } = body;

    // 1. Fetch user from Supabase
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      return res.status(401).json({ error: 'Identifiants invalides' });
    }

    // 2. Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Identifiants invalides' });
    }

    // 3. Check role
    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'Accès réservé aux administrateurs' });
    }

    // 4. Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // 5. Update last seen
    await supabase.from('users').update({ last_seen_at: new Date().toISOString() }).eq('id', user.id);

    return res.status(200).json({ token, user: { id: user.id, email: user.email, nom: user.nom, prenom: user.prenom } });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
