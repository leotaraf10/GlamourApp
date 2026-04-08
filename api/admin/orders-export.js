import { supabase } from '../../server-lib/supabase.js';
import { verifyAdmin } from '../../server-lib/auth.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const admin = verifyAdmin(req);
  if (!admin) return res.status(403).json({ error: 'Admin access required' });

  try {
    // Fetch all orders with their items (joined)
    const { data: orders, error: ordersErr } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .order('created_at', { ascending: false });

    if (ordersErr) return res.status(500).json({ error: ordersErr.message });

    // Flatten: one row per order item (for CSV export)
    const rows = [];
    for (const order of orders || []) {
      if (order.order_items && order.order_items.length > 0) {
        for (const item of order.order_items) {
          rows.push({
            id: order.id,
            created_at: order.created_at,
            statut: order.statut,
            nom: order.nom,
            prenom: order.prenom,
            email: order.email,
            tel: order.tel,
            adresse: order.adresse,
            ville: order.ville,
            livraison_mode: order.livraison_mode,
            total: order.total,
            nom_produit: item.nom_produit,
            taille: item.taille,
            couleur: item.couleur,
            quantite: item.quantite,
            prix_unitaire: item.prix_unitaire,
          });
        }
      } else {
        rows.push({
          id: order.id,
          created_at: order.created_at,
          statut: order.statut,
          nom: order.nom,
          prenom: order.prenom,
          email: order.email,
          tel: order.tel,
          adresse: order.adresse,
          ville: order.ville,
          livraison_mode: order.livraison_mode,
          total: order.total,
          nom_produit: '',
          taille: '',
          couleur: '',
          quantite: 0,
          prix_unitaire: 0,
        });
      }
    }

    return res.status(200).json(rows);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
