import { useCartStore } from '../store';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ArrowRight, Minus, Plus } from 'lucide-react';
import { API_URL } from '../apiConfig';

const API = API_URL.replace('/api', '');

export default function Cart() {
  const items = useCartStore(state => state.items);
  const removeItem = useCartStore(state => state.removeItem);
  const updateQuantity = useCartStore(state => state.updateQuantity);
  const cartTotal = useCartStore(state => state.cartTotal());
  const navigate = useNavigate();

  return (
    <div className="bg-[#FAF8F5] min-h-screen pt-12 pb-24">
      <div className="max-w-[1200px] mx-auto px-6">
        
        <h1 className="text-3xl lg:text-4xl font-elegant text-[#111111] mb-12 uppercase tracking-widest text-center">
          Votre Panier
        </h1>

        {items.length === 0 ? (
          <div className="text-center py-20 bg-white border border-[#E8E1D9]">
            <p className="text-[#555555] mb-8 font-light">Votre panier est actuellement vide.</p>
            <Link to="/" className="inline-block bg-[#111111] text-white px-10 py-4 text-[10px] uppercase tracking-widest font-bold hover:bg-[#333333] transition-colors">
              Continuer mes achats
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-12">
            
            {/* Items List */}
            <div className="flex-1">
              <div className="bg-white border border-[#E8E1D9] p-6 lg:p-10">
                <div className="flex justify-between border-b border-[#E8E1D9] pb-4 mb-6 text-[10px] uppercase tracking-widest font-bold text-[#888888]">
                  <span>Produit</span>
                  <span className="hidden sm:block">Quantité</span>
                  <span>Total</span>
                </div>

                {items.map((item, idx) => (
                  <div key={`${item.id}-${item.taille}-${idx}`} className="flex items-center justify-between border-b border-[#E8E1D9] pb-8 mb-8 last:border-0 last:pb-0 last:mb-0">
                    
                    {/* Image & Detail */}
                    <div className="flex items-center gap-6 flex-1">
                      <div className="w-20 h-24 bg-[#F2ECE4] flex-shrink-0">
                        <img 
                          src={(() => {
                            const img = item.images?.[0];
                            if (!img) return '';
                            const url = typeof img === 'object' ? (img.url || img) : img;
                            if (typeof url !== 'string') return '';
                            const imgUrl = (url.startsWith('http') || url.startsWith('data:')) ? url : `${API}${url}`;
                          })()} 
                          alt={item.nom} 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                      <div>
                        <Link to={`/product/${item.id}`} className="block text-[#111111] font-bold text-sm uppercase tracking-wide mb-1 hover:text-[#8D7B68] transition-colors">{item.nom}</Link>
                        <div className="flex gap-4">
                          <p className="text-[#888888] text-[11px] mb-2 uppercase tracking-widest">Taille: {item.taille}</p>
                          {item.selectedColor && <p className="text-[#888888] text-[11px] mb-2 uppercase tracking-widest">Couleur: {item.selectedColor}</p>}
                        </div>
                        <button onClick={() => removeItem(item.id, item.taille, item.selectedColor)} className="text-[#555555] hover:text-[#ff4444] transition-colors flex items-center gap-1 text-[10px] uppercase font-bold tracking-widest">
                          <Trash2 size={12} /> Supprimer
                        </button>
                      </div>
                    </div>

                    {/* Quantity (Mobile Hidden for now, simplified) */}
                    <div className="hidden sm:flex items-center border border-[#EAEAEA]">
                      <button onClick={() => updateQuantity(item.id, item.taille, item.selectedColor, Math.max(1, item.quantite - 1))} className="p-3 text-[#555555] hover:bg-[#FAF8F5]">
                        <Minus size={12} />
                      </button>
                      <span className="px-4 text-sm">{item.quantite}</span>
                      <button onClick={() => updateQuantity(item.id, item.taille, item.selectedColor, item.quantite + 1)} className="p-3 text-[#555555] hover:bg-[#FAF8F5]">
                        <Plus size={12} />
                      </button>
                    </div>

                    {/* Price */}
                    <div className="text-right ml-4">
                      <span className="text-[#111111] font-bold text-sm">{(item.prix_solde || item.prix) * item.quantite} DH</span>
                    </div>

                  </div>
                ))}
              </div>
            </div>

            {/* Summary */}
            <div className="w-full lg:w-[350px]">
              <div className="bg-[#111111] text-white p-8">
                <h2 className="text-sm font-bold uppercase tracking-widest mb-6">Récapitulatif</h2>
                
                <div className="flex justify-between mb-4 text-xs text-[#AAAAAA]">
                  <span>Sous-total</span>
                  <span>{cartTotal} DH</span>
                </div>
                <div className="flex justify-between mb-6 text-xs text-[#AAAAAA]">
                  <span>Livraison</span>
                  <span>Calculé à l'étape suivante</span>
                </div>
                
                <div className="flex justify-between border-t border-[#333333] pt-6 mb-8 text-lg font-bold">
                  <span>Total</span>
                  <span>{cartTotal} DH</span>
                </div>

                <button 
                  onClick={() => navigate('/checkout')}
                  className="w-full bg-white text-[#111111] py-4 text-[10px] uppercase tracking-widest font-bold flex items-center justify-center gap-2 hover:bg-[#EAEAEA] transition-colors"
                >
                  Passer la commande <ArrowRight size={14} />
                </button>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
