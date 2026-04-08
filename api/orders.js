import { supabase, supabaseAdmin } from './_lib/supabase.js';
import { verifyAdmin } from './_lib/auth.js';

export default async function handler(req, res) {
  const { method, query, body } = req;

  if (method === 'GET') {
    const admin = verifyAdmin(req);
    if (!admin) return res.status(403).json({ error: 'Admin access required' });

    const { limit, id } = query;
    let dbQuery = supabase
      .from('orders')
      .select('*, order_items(*)')
      .order('created_at', { ascending: false });

    if (id) {
       const { data, error } = await dbQuery.eq('id', id).single();
       if (error) return res.status(500).json({ error: error.message });
       return res.status(200).json(data);
    }

    if (limit) dbQuery = dbQuery.limit(Number(limit));

    const { data, error } = await dbQuery;
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  if (method === 'POST') {
    const { items, ...orderData } = body;

    // 1. Create the order
    const { data: order, error: orderErr } = await supabaseAdmin
      .from('orders').insert([orderData]).select().single();
    if (orderErr) return res.status(500).json({ error: orderErr.message });

    // 2. Create order items
    const orderItems = items.map(it => ({
      order_id: order.id,
      product_id: it.id,
      nom_produit: it.name,
      taille: it.size,
      couleur: it.color,
      quantite: it.quantity,
      prix_unitaire: it.price
    }));

    const { error: itemsErr } = await supabaseAdmin.from('order_items').insert(orderItems);
    if (itemsErr) return res.status(500).json({ error: itemsErr.message });

    // 3. Update stock for each product/variant
    for (const it of items) {
       const { data: product } = await supabase.from('products').select('*').eq('id', it.id).single();
       if (product) {
          let newStock = Math.max(0, (product.stock || 0) - it.quantity);
          let newVariants = product.stock_variants || {};
          if (it.color && newVariants[it.color] !== undefined) {
             newVariants[it.color] = Math.max(0, newVariants[it.color] - it.quantity);
          }
          await supabaseAdmin.from('products').update({
            stock: newStock,
            stock_variants: newVariants
          }).eq('id', it.id);
       }
    }

    return res.status(201).json(order);
  }

  if (method === 'PUT') {
    const { id } = query;
    const { statut } = body;
    if (!id || !statut) return res.status(400).json({ error: 'id and statut required' });

    const admin = verifyAdmin(req);
    if (!admin) return res.status(403).json({ error: 'Admin access required' });

    const { data, error } = await supabaseAdmin
      .from('orders')
      .update({ statut })
      .eq('id', id)
      .select();

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data[0]);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
