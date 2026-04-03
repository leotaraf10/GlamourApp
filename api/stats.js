import { supabase } from '../_lib/supabase.js';
import { verifyAdmin } from '../_lib/auth.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const admin = verifyAdmin(req);
  if (!admin) return res.status(403).json({ error: 'Admin access required' });

  try {
    const stats = {};

    // Total orders and revenue
    const { data: orders } = await supabase
      .from('orders')
      .select('total')
      .neq('statut', 'cancelled');
    
    stats.orders_total = orders?.length || 0;
    stats.revenue_total = orders?.reduce((acc, o) => acc + (o.total || 0), 0) || 0;

    // Orders today
    const today = new Date().toISOString().split('T')[0];
    const { count: ordersToday } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', today);
    stats.orders_today = ordersToday || 0;

    // Total clients
    const { count: clients } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'client');
    stats.clients_total = clients || 0;

    // Low stock
    const { count: lowStock } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .lt('stock', 10);
    stats.low_stock = lowStock || 0;

    return res.status(200).json(stats);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
