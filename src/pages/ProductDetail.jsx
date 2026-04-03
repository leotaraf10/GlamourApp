import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingBag, ChevronRight, Check, Minus, Plus, Heart, Star } from 'lucide-react';
import { useCartStore } from '../store';

import { API_URL } from '../apiConfig';
const API = API_URL.replace('/api', '');

const getImgUrl = (img) => {
  if (!img) return '';
  const url = (typeof img === 'object' && img !== null) ? (img.url || img) : img;
  if (typeof url !== 'string' || !url) return '';
  if (url.startsWith('http') || url.startsWith('data:')) return url;
  // If it's a relative path starting with /uploads, we use the current host
  return `${API}${url.startsWith('/') ? '' : '/'}${url}`;
};

function StarRating({ note = 5, size = 14 }) {
  const n = typeof note === 'number' ? note : 5;
  return (
    <div className="flex gap-0.5" aria-label={`Rating: ${n} stars`}>
      {[1,2,3,4,5].map(i => (
        <Star key={i} size={size} className={i <= n ? 'text-[#111111] fill-[#111111]' : 'text-[#DDDDDD] fill-[#DDDDDD]'} />
      ))}
    </div>
  );
}

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [added, setAdded] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  const addItem = useCartStore(state => state.addItem);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(`${API}/api/products/${id}`).then(r => r.json()),
      fetch(`${API}/api/reviews/${id}`).then(r => r.json()),
    ]).then(([prod, revs]) => {
      if (prod && !prod.error) {
        setProduct(prod);
        setReviews(revs || []);
        if (prod.tailles?.length) setSelectedSize(prod.tailles[0]);
        if (prod.couleurs?.length) setSelectedColor(prod.couleurs[0]);
      }
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, [id]);

  if (loading) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#111111]"></div>
    </div>
  );

  if (!product || product.error) return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
      <p className="text-[#888888] text-sm mb-4">Produit introuvable ({id})</p>
      <Link to="/" className="text-[#111111] text-xs uppercase tracking-widest font-bold border-b border-[#111111] pb-1">Retour à l'accueil</Link>
    </div>
  );

  const images = Array.isArray(product.images) ? product.images : [];
  const tailles = Array.isArray(product.tailles) ? product.tailles : [];
  const couleurs = Array.isArray(product.couleurs) ? product.couleurs : [];
  const nom = product.nom || 'Produit';
  const categorie = product.categorie || 'Boutique';
  const reviewsList = Array.isArray(reviews) ? reviews : [];
  const avgRating = reviewsList.length ? Math.round(reviewsList.reduce((a, r) => a + (r.note || 0), 0) / reviewsList.length) : 0;

  const handleAddToCart = () => {
    addItem({ ...product, selectedColor }, selectedSize, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const COLORS_MAP = {
    'Noir': 'bg-black', 'Blanc': 'bg-white border border-gray-200', 'Taupe': 'bg-[#8D7B68]', 'Beige': 'bg-[#F5F5DC]', 'Gris': 'bg-gray-400', 'Bordeaux': 'bg-red-900'
  };

  return (
    <div className="bg-white min-h-screen pb-24">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 pt-10">
        
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-[#888888] mb-10 font-bold">
          <Link to="/" className="hover:text-[#111111] transition-colors">Accueil</Link>
          <ChevronRight size={10} />
          <Link to={`/collections/${categorie}`} className="hover:text-[#111111] transition-colors capitalize">{categorie}</Link>
          <ChevronRight size={10} />
          <span className="text-[#111111] truncate max-w-[200px]">{nom}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
          {/* Gallery */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <div className="aspect-[3/4] bg-[#F2ECE4] overflow-hidden rounded-sm">
              {images.length > 0 ? (
                <img src={getImgUrl(images[activeImage])} alt={nom} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[#888888] text-[10px] uppercase font-bold tracking-[0.2em]">Aucune image</div>
              )}
            </div>
            {images.length > 1 && (
              <div className="grid grid-cols-6 gap-3">
                {images.map((img, idx) => (
                  <button key={idx} onClick={() => setActiveImage(idx)} className={`aspect-[3/4] bg-[#F2ECE4] border-2 transition-all ${activeImage === idx ? 'border-black' : 'border-transparent opacity-60 hover:opacity-100'}`}>
                    <img src={getImgUrl(img)} className="w-full h-full object-cover" alt="" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="lg:col-span-5 flex flex-col lg:sticky lg:top-[160px] h-fit">
            <p className="text-[10px] font-bold text-[#8D7B68] uppercase tracking-[0.3em] mb-2">Collection {categorie}</p>
            <h1 className="text-3xl lg:text-4xl font-serif text-[#111111] leading-tight mb-4">{nom}</h1>

            <div className="flex items-center gap-4 mb-6">
              <StarRating note={avgRating} />
              <span className="text-[10px] text-[#888888] uppercase tracking-widest font-bold">({reviewsList.length} avis)</span>
            </div>

            <div className="flex items-baseline gap-4 mb-8">
              {product.prix_solde ? (
                <>
                  <span className="text-3xl font-bold text-[#111111]">{product.prix_solde} DH</span>
                  <span className="text-lg text-[#AAAAAA] line-through font-light">{product.prix} DH</span>
                </>
              ) : (
                <span className="text-3xl font-bold text-[#111111]">{product.prix} DH</span>
              )}
            </div>

            <div className="flex flex-col gap-8">
              {couleurs.length > 0 && (
                <div>
                  <p className="text-[10px] uppercase tracking-widest font-bold mb-4">Couleur: <span className="font-light ml-1">{selectedColor}</span></p>
                  <div className="flex gap-3">
                    {couleurs.map(c => (
                      <button key={c} onClick={() => setSelectedColor(c)} className={`w-8 h-8 rounded-full transition-all ${COLORS_MAP[c] || 'bg-gray-200'} ${selectedColor === c ? 'ring-2 ring-black ring-offset-2 scale-110' : 'hover:scale-110'}`} />
                    ))}
                  </div>
                </div>
              )}

              {tailles.length > 0 && (
                <div>
                  <p className="text-[10px] uppercase tracking-widest font-bold mb-4">Taille: <span className="font-light ml-1">{selectedSize}</span></p>
                  <div className="flex flex-wrap gap-2">
                    {tailles.map(t => (
                      <button key={t} onClick={() => setSelectedSize(t)} className={`min-w-[60px] h-12 border text-[11px] font-bold uppercase transition-all ${selectedSize === t ? 'bg-black text-white border-black' : 'border-gray-200 hover:border-black'}`}>{t}</button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <div className="flex items-center border border-gray-200 h-14">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-4"><Minus size={14}/></button>
                  <span className="w-10 text-center font-bold">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="px-4"><Plus size={14}/></button>
                </div>
                <button onClick={handleAddToCart} className={`flex-1 h-14 text-[11px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${added ? 'bg-[#25D366] text-white' : 'bg-black text-white hover:bg-[#333333]'}`}>
                  {added ? <Check size={16}/> : <ShoppingBag size={16}/>}
                  {added ? 'Ajouté !' : 'Ajouter au panier'}
                </button>
              </div>

              <a href={`https://wa.me/212600000000?text=Je souhaite commander : ${nom}`} target="_blank" className="w-full h-14 border border-black text-[11px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-black hover:text-white transition-all">
                Commander via WhatsApp
              </a>
            </div>

            <div className="mt-12 border-t border-gray-100 pt-8">
               <div className="flex gap-8 border-b border-gray-100 mb-6">
                  {['description', 'livraison'].map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)} className={`pb-4 text-[10px] font-bold uppercase tracking-widest border-b-2 transition-all ${activeTab === tab ? 'border-black text-black' : 'border-transparent text-gray-400 hover:text-black'}`}>{tab}</button>
                  ))}
               </div>
               <div className="text-sm text-gray-600 font-light leading-relaxed" dangerouslySetInnerHTML={{ __html: product.description || '' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
