import { useState } from 'react';
import { useCartStore, useAuthStore } from '../store';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Check, Tag } from 'lucide-react';

export default function Checkout() {
  const items = useCartStore(state => state.items);
  const cartTotal = useCartStore(state => state.cartTotal());
  const clearCart = useCartStore(state => state.clearCart);
  const user = useAuthStore(state => state.user);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: user?.email || '',
    nom: user?.nom || '', prenom: user?.prenom || '',
    adresse: '', code_postal: '', ville: '', tel: user?.tel || '',
    mode_livraison: 'standard',
    cgv_accepted: false,
  });
  const [promoCode, setPromoCode] = useState('');
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoMsg, setPromoMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const deliveryCost = formData.mode_livraison === 'express' ? 120 : 50;
  const discounted = Math.min(promoDiscount, cartTotal);
  const finalTotal = Math.max(0, cartTotal - discounted) + deliveryCost;

  const applyPromo = () => {
    if (!promoCode) return;
    fetch('http://localhost:5001/api/promo/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: promoCode.trim().toUpperCase(), total: cartTotal })
    }).then(r => r.json()).then(data => {
      if (data.discount) { setPromoDiscount(data.discount); setPromoMsg(`✓ Code appliqué : -${data.discount} DH`); }
      else setPromoMsg(data.error || 'Code invalide');
    }).catch(() => setPromoMsg('Erreur de connexion'));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.cgv_accepted) { alert('Veuillez accepter les CGV pour continuer.'); return; }
    setLoading(true);

    const payload = {
      user_id: user?.id || null,
      email: formData.email, nom: formData.nom, prenom: formData.prenom,
      adresse: formData.adresse, code_postal: formData.code_postal, ville: formData.ville, tel: formData.tel,
      total: finalTotal, livraison_mode: formData.mode_livraison, livraison_cost: deliveryCost,
      promo_code: promoCode || null, promo_discount: promoDiscount,
      items: items.map(i => ({ 
        id: i.id, 
        nom: i.nom, 
        taille: i.taille, 
        selectedColor: i.selectedColor,
        quantite: i.quantite, 
        prix: i.prix, 
        prix_solde: i.prix_solde 
      }))
    };

    try {
      const res = await fetch('http://localhost:5001/api/orders', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (data.success) {
        // Generate WhatsApp message
        const adminNum = import.meta.env.VITE_ADMIN_WHATSAPP || '212600000000';
        let msg = `🛍️ *Nouvelle Commande #${data.orderId}*\n━━━━━━━━━━━━━\n`;
        msg += `👤 *Client:* ${formData.prenom} ${formData.nom}\n📞 ${formData.tel}\n✉️ ${formData.email}\n\n`;
        msg += `📍 *Livraison (${formData.mode_livraison}):*\n${formData.adresse}, ${formData.code_postal} ${formData.ville}\n\n`;
        msg += `🛒 *Articles:*\n`;
        items.forEach(i => { 
          msg += `• ${i.nom} — ${i.selectedColor ? i.selectedColor + ' ' : ''}Taille ${i.taille} x${i.quantite} = ${(i.prix_solde || i.prix) * i.quantite} DH\n`; 
        });
        if (promoDiscount > 0) msg += `\n🏷️ Code promo: -${promoDiscount} DH\n`;
        msg += `\n💰 *Total à payer à la livraison: ${finalTotal} DH*`;

        window.open(`https://wa.me/${adminNum}?text=${encodeURIComponent(msg)}`, '_blank');
        clearCart();
        navigate('/confirmation');
      } else {
        alert('Erreur : ' + (data.error || 'Inconnue'));
      }
    } catch { alert('Erreur réseau. Vérifiez votre connexion.'); }
    setLoading(false);
  };

  const inputCls = "w-full bg-white border border-[#EAEAEA] text-[#111111] px-4 py-3 text-[11px] uppercase tracking-widest placeholder-[#AAAAAA] focus:border-[#111111] outline-none transition-all";

  if (items.length === 0) return (
    <div className="py-32 text-center bg-[#FAF8F5] min-h-screen">
      <p className="text-[#555555] mb-8">Votre panier est vide.</p>
    </div>
  );

  return (
    <div className="bg-[#FAF8F5] min-h-screen py-10">
      <div className="max-w-[1200px] mx-auto px-6">
        <h1 className="text-3xl font-elegant text-[#111111] mb-12 uppercase tracking-widest text-center">Valider ma commande</h1>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Form */}
          <div className="flex-1">
            <form onSubmit={handleSubmit} className="flex flex-col gap-10">

              <section>
                <h2 className="text-[11px] font-bold uppercase tracking-widest mb-5 text-[#111111] pb-3 border-b border-[#EAEAEA]">1 — Contact</h2>
                <input type="email" placeholder="Adresse e-mail *" required className={inputCls} value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </section>

              <section>
                <h2 className="text-[11px] font-bold uppercase tracking-widest mb-5 text-[#111111] pb-3 border-b border-[#EAEAEA]">2 — Adresse de livraison</h2>
                <div className="flex flex-col gap-3">
                  <div className="grid grid-cols-2 gap-3">
                    <input placeholder="Prénom *" required className={inputCls} value={formData.prenom} onChange={e => setFormData({...formData, prenom: e.target.value})} />
                    <input placeholder="Nom *" required className={inputCls} value={formData.nom} onChange={e => setFormData({...formData, nom: e.target.value})} />
                  </div>
                  <input placeholder="Adresse complète *" required className={inputCls} value={formData.adresse} onChange={e => setFormData({...formData, adresse: e.target.value})} />
                  <div className="grid grid-cols-2 gap-3">
                    <input placeholder="Code postal *" required className={inputCls} value={formData.code_postal} onChange={e => setFormData({...formData, code_postal: e.target.value})} />
                    <input placeholder="Ville *" required className={inputCls} value={formData.ville} onChange={e => setFormData({...formData, ville: e.target.value})} />
                  </div>
                  <input type="tel" placeholder="Téléphone *" required className={inputCls} value={formData.tel} onChange={e => setFormData({...formData, tel: e.target.value})} />
                </div>
              </section>

              <section>
                <h2 className="text-[11px] font-bold uppercase tracking-widest mb-5 text-[#111111] pb-3 border-b border-[#EAEAEA]">3 — Livraison</h2>
                <div className="flex flex-col gap-3">
                  {[
                    { val: 'standard', label: 'Standard (5–7 jours)', cost: 50 },
                    { val: 'express', label: 'Express (2–3 jours)', cost: 120 },
                  ].map(opt => (
                    <label key={opt.val} className={`flex items-center justify-between p-4 border cursor-pointer transition-colors ${formData.mode_livraison === opt.val ? 'border-[#111111] bg-white' : 'border-[#EAEAEA] bg-transparent'}`}>
                      <div className="flex items-center gap-3">
                        <input type="radio" name="delivery" checked={formData.mode_livraison === opt.val} onChange={() => setFormData({...formData, mode_livraison: opt.val})} className="accent-[#111111]" />
                        <span className="text-[11px] font-bold uppercase tracking-widest">{opt.label}</span>
                      </div>
                      <span className="text-[11px] font-bold">{opt.cost} DH</span>
                    </label>
                  ))}
                </div>
              </section>

              <section>
                <h2 className="text-[11px] font-bold uppercase tracking-widest mb-5 text-[#111111] pb-3 border-b border-[#EAEAEA]">4 — Paiement</h2>
                <div className="p-5 bg-[#F2ECE4] flex items-center gap-4">
                  <Check size={20} className="text-[#8D7B68] flex-shrink-0" />
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-widest">Paiement à la livraison uniquement</p>
                    <p className="text-[11px] text-[#555555] font-light mt-1">Réglez en espèces à la réception.</p>
                  </div>
                </div>
              </section>

              {/* CGV */}
              <div className="flex items-start gap-3">
                <input type="checkbox" id="cgv" checked={formData.cgv_accepted} onChange={e => setFormData({...formData, cgv_accepted: e.target.checked})} className="accent-[#111111] w-4 h-4 mt-0.5 flex-shrink-0" />
                <label htmlFor="cgv" className="text-[11px] text-[#555555] font-light cursor-pointer leading-relaxed">
                  J'accepte les{' '}
                  <a href="/cgv" target="_blank" rel="noopener noreferrer" className="text-[#111111] font-bold underline">Conditions Générales de Vente</a>{' '}
                  et la politique de livraison.
                </label>
              </div>

              <button type="submit" disabled={loading} className="w-full bg-[#111111] text-white py-5 text-[11px] uppercase tracking-widest font-bold flex items-center justify-center gap-3 hover:bg-[#333333] transition-colors disabled:opacity-50">
                {loading ? 'Traitement...' : <><ArrowRight size={16} /> Confirmer sur WhatsApp</>}
              </button>
            </form>
          </div>

          {/* Summary */}
          <div className="w-full lg:w-[380px]">
            <div className="bg-white border border-[#E8E1D9] p-6 sticky top-[160px]">
              <h2 className="text-[11px] font-bold uppercase tracking-widest mb-6">Résumé</h2>

              {/* Items */}
              <div className="flex flex-col gap-4 mb-6">
                {items.map(item => {
                  const getImgUrl = (img) => {
                    if (!img) return '';
                    const url = typeof img === 'object' ? img.url : img;
                    return (url.startsWith('http') || url.startsWith('data:')) ? url : `http://localhost:5001${url}`;
                  };
                  const img = getImgUrl(item.images?.[0]);
                  return (
                    <div key={item.id + item.taille} className="flex gap-3 items-center">
                      {img && <img src={img} alt={item.nom} className="w-14 h-18 object-cover bg-[#F2ECE4] flex-shrink-0" />}
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-bold uppercase tracking-wide truncate">{item.nom}</p>
                        <p className="text-[10px] text-[#888888] uppercase tracking-widest">T. {item.taille} × {item.quantite}</p>
                      </div>
                      <span className="text-[11px] font-bold flex-shrink-0">{(item.prix_solde || item.prix) * item.quantite} DH</span>
                    </div>
                  );
                })}
              </div>

              {/* Promo code */}
              <div className="border-t border-[#EAEAEA] pt-4 mb-4">
                <div className="flex gap-2">
                  <input className="flex-1 border border-[#EAEAEA] px-3 py-2 text-[11px] uppercase tracking-widest placeholder-[#AAAAAA] focus:border-[#111111] outline-none"
                    placeholder="Code promo" value={promoCode} onChange={e => setPromoCode(e.target.value.toUpperCase())} />
                  <button type="button" onClick={applyPromo} className="px-4 bg-[#8D7B68] text-white text-[10px] font-bold uppercase tracking-widest hover:bg-[#726252] transition-colors">
                    <Tag size={14} />
                  </button>
                </div>
                {promoMsg && <p className={`text-[10px] mt-2 uppercase tracking-widest font-bold ${promoDiscount > 0 ? 'text-[#5A7D59]' : 'text-red-500'}`}>{promoMsg}</p>}
              </div>

              {/* Totals */}
              <div className="border-t border-[#EAEAEA] pt-4 flex flex-col gap-2">
                <div className="flex justify-between text-[11px] text-[#888888]">
                  <span>Sous-total</span><span>{cartTotal} DH</span>
                </div>
                {promoDiscount > 0 && (
                  <div className="flex justify-between text-[11px] text-[#5A7D59] font-bold">
                    <span>Réduction</span><span>-{promoDiscount} DH</span>
                  </div>
                )}
                <div className="flex justify-between text-[11px] text-[#888888]">
                  <span>Livraison</span><span>{deliveryCost} DH</span>
                </div>
                <div className="flex justify-between font-bold text-[14px] pt-3 border-t border-[#111111] mt-2">
                  <span>Total à payer</span><span>{finalTotal} DH</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
