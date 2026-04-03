import { ShoppingBag } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCartStore } from '../store';

export default function ProductCard({ id, images = [], image_secondary, nom, prix, prix_solde, best_seller, nouveaute, solde, tailles = [], marque }) {
  const addItem = useCartStore(state => state.addItem);
  const [hovered, setHovered] = useState(false);
  const [added, setAdded] = useState(false);

  const API = `http://${window.location.hostname}:5001`;
  const getImgUrl = (img) => {
    if (!img) return 'https://via.placeholder.com/400x600/F2ECE4/8D7B68?text=SS';
    const url = (typeof img === 'object' && img !== null) ? (img.url || img) : img;
    if (typeof url !== 'string') return 'https://via.placeholder.com/400x600/F2ECE4/8D7B68?text=SS';
    return (url.startsWith('http') || url.startsWith('data:')) ? url : `${API}${url}`;
  };

  const primaryImage = getImgUrl(images[0]);
  const secImage = image_secondary ? getImgUrl(image_secondary) : getImgUrl(images[1] || images[0]);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const defaultSize = tailles[0] || 'M';
    const product = { id, nom, prix, prix_solde, images: [{ url: primaryImage }] };
    addItem(product, defaultSize, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  const displayPrice = prix_solde || prix;
  const isOnSale = !!prix_solde;

  return (
    <div
      className="group relative bg-white flex flex-col cursor-pointer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image container with 2nd image hover */}
      <Link to={`/product/${id}`} className="block relative aspect-[3/4] overflow-hidden bg-[#F2ECE4] mb-3">
        {/* Primary Image */}
        <img
          src={primaryImage}
          alt={nom}
          loading="lazy"
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${hovered && secImage !== primaryImage ? 'opacity-0' : 'opacity-100'}`}
        />
        {/* Secondary Image */}
        {secImage !== primaryImage && (
          <img
            src={secImage}
            alt={`${nom} vue 2`}
            loading="lazy"
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${hovered ? 'opacity-100' : 'opacity-0'}`}
          />
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {nouveaute === 1 && <span className="bg-white text-[#111111] text-[8px] font-bold uppercase tracking-widest px-2 py-1">Nouveau</span>}
          {best_seller === 1 && <span className="bg-[#8D7B68] text-white text-[8px] font-bold uppercase tracking-widest px-2 py-1">Best Seller</span>}
          {isOnSale && <span className="bg-[#111111] text-white text-[8px] font-bold uppercase tracking-widest px-2 py-1">Soldes</span>}
        </div>

        {/* Hover Add to Cart */}
        <button
          onClick={handleAddToCart}
          className={`absolute inset-x-0 bottom-0 py-3 text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all duration-300 z-20
            ${added ? 'bg-[#5A7D59] text-white translate-y-0 opacity-100' : 'bg-white/90 backdrop-blur-sm text-[#111111] hover:bg-[#111111] hover:text-white'}
            ${hovered ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}
        >
          <ShoppingBag size={13} />
          {added ? 'Ajouté !' : 'Ajouter au panier'}
        </button>
      </Link>

      {/* Info */}
      <div className="px-1">
        <div className="flex flex-col gap-1.5">
          <Link to={`/product/${id}`}>
            <h3 className="text-xs font-bold text-[#111111] uppercase tracking-widest truncate group-hover:text-[#8D7B68] transition-colors">{nom}</h3>
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-[#111111] font-bold text-[12px]">{displayPrice} DH</span>
            {isOnSale && <span className="text-[#AAAAAA] font-light text-[11px] line-through">{prix} DH</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
