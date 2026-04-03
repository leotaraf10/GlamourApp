import { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import ProductGrid from '../components/ProductGrid';
import { Filter, ChevronDown, X } from 'lucide-react';
import { API_URL } from '../apiConfig';

const CATEGORIES = [
  { id: 'soldes', label: 'Soldes -50%' },
  { id: 'ete-2025', label: 'Été 2025' },
  { id: 'jeans', label: 'Jeans' },
  { id: 'robes', label: 'Robes' },
  { id: 'tops-bodys', label: 'Tops | Bodys' },
  { id: 'ensembles', label: 'Ensembles' },
  { id: 'pantalons', label: 'Pantalons' },
  { id: 'blazers', label: 'Blazers' },
  { id: 'manteaux-trench', label: 'Manteaux | Trench' },
];

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const COLORS = [
  { name: 'Noir', class: 'bg-black' },
  { name: 'Blanc', class: 'bg-white border border-gray-200' },
  { name: 'Taupe', class: 'bg-[#8D7B68]' },
  { name: 'Beige', class: 'bg-[#F5F5DC]' },
  { name: 'Gris', class: 'bg-gray-400' },
  { name: 'Bordeaux', class: 'bg-red-900' },
];

export default function Collection() {
  const { slug } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState('newest');
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);
  
  // Filters State
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');

  const title = slug.replace('-', ' ').toUpperCase();

  useEffect(() => {
    fetchProducts();
  }, [slug, sort, selectedSize, selectedColor, priceRange]);

  const fetchProducts = () => {
    setLoading(true);
    let url = `${API_URL}/products?sort=${sort}`;
    
    if (slug === 'best-sellers') url += '&best_seller=true';
    else if (slug === 'soldes') url += '&solde=true';
    else if (slug === 'nouveautes') url += '&nouveaute=true';
    else url += `&categorie=${slug}`;

    if (selectedSize) url += `&taille=${selectedSize}`;
    if (selectedColor) url += `&couleur=${selectedColor}`;
    if (priceRange.min) url += `&min_price=${priceRange.min}`;
    if (priceRange.max) url += `&max_price=${priceRange.max}`;
    
    fetch(url)
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  const clearFilters = () => {
    setSelectedSize('');
    setSelectedColor('');
    setPriceRange({ min: '', max: '' });
  };

  const FilterSidebar = ({ isMobile }) => (
    <div className={`flex flex-col gap-10 ${isMobile ? 'p-6' : 'w-64 pr-12 hidden lg:flex sticky top-[140px] h-[calc(100vh-200px)] overflow-y-auto'}`}>
      
      {/* Categories Selection */}
      <div className="animate-fade-in group">
        <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#111111] mb-6 border-l-2 border-[#111111] pl-3">Collections</h4>
        <div className="flex flex-col gap-3">
          {CATEGORIES.map(cat => (
            <Link 
              key={cat.id} 
              to={`/collections/${cat.id}`}
              className={`text-[11px] uppercase tracking-widest transition-all hover:translate-x-1 ${slug === cat.id ? 'font-bold text-[#111111]' : 'text-[#888888] hover:text-[#111111]'}`}
            >
              {cat.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Price filter */}
      <div className="animate-fade-in delay-100">
        <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#111111] mb-6 border-l-2 border-[#111111] pl-3">Budget (DH)</h4>
        <div className="flex items-center gap-2">
          <input 
            type="number" 
            placeholder="Min" 
            value={priceRange.min}
            onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
            className="w-full bg-[#FAF8F5] border border-[#EAEAEA] px-3 py-2 text-[10px] uppercase outline-none focus:border-[#111111]"
          />
          <span className="text-[#CCC]">—</span>
          <input 
            type="number" 
            placeholder="Max" 
            value={priceRange.max}
            onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
            className="w-full bg-[#FAF8F5] border border-[#EAEAEA] px-3 py-2 text-[10px] uppercase outline-none focus:border-[#111111]"
          />
        </div>
      </div>

      {/* Sizes */}
      <div className="animate-fade-in delay-200">
        <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#111111] mb-6 border-l-2 border-[#111111] pl-3">Taille</h4>
        <div className="flex flex-wrap gap-2">
          {SIZES.map(t => (
            <button 
              key={t} 
              onClick={() => setSelectedSize(selectedSize === t ? '' : t)}
              className={`w-10 h-10 border text-[10px] font-bold transition-all flex items-center justify-center
                ${selectedSize === t ? 'border-[#111111] bg-[#111111] text-white' : 'border-[#EAEAEA] text-[#111111] hover:border-[#111111]'}`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Colors */}
      <div className="animate-fade-in delay-300">
        <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#111111] mb-6 border-l-2 border-[#111111] pl-3">Couleur</h4>
        <div className="flex flex-wrap gap-3">
          {COLORS.map(c => (
            <button 
              key={c.name} 
              onClick={() => setSelectedColor(selectedColor === c.name ? '' : c.name)}
              className={`w-6 h-6 rounded-full transition-transform hover:scale-125 ${c.class} ${selectedColor === c.name ? 'ring-2 ring-offset-2 ring-[#111111] scale-125' : ''}`}
              title={c.name}
            />
          ))}
        </div>
      </div>



      {(selectedSize || selectedColor || priceRange.min || priceRange.max) && (
        <button 
          onClick={() => {
            clearFilters();
          }}
          className="text-[9px] font-bold uppercase tracking-widest text-red-500 hover:text-red-700 flex items-center gap-1 group transition-all"
        >
          <X size={12} className="group-hover:rotate-90 transition-transform" /> Réinitialiser les filtres
        </button>
      )}
    </div>
  );

  return (
    <div className="bg-[#FAF8F5] min-h-screen">
      {/* Editorial Header */}
      <div className="py-24 lg:py-32 text-center bg-[#F2ECE4] border-b border-[#E8E1D9]">
        <h1 className="text-4xl lg:text-5xl font-elegant text-[#111111] capitalize tracking-[0.1em]">{title}</h1>
        <p className="text-[#555555] font-light mt-6 max-w-lg mx-auto text-xs lg:text-sm px-6 uppercase tracking-widest leading-relaxed">
          {slug === 'femme' ? 'Élégance et performance pour la femme moderne.' : 
           slug === 'homme' ? 'Style intemporel et confort absolu pour l\'homme.' :
           'Une collection exclusive sélectionnée avec soin.'}
        </p>
      </div>

      {/* Mobile Toolbar */}
      <div className="sticky top-[104px] z-30 bg-white/80 backdrop-blur-md border-b border-[#EAEAEA] lg:hidden">
        <div className="px-6 h-14 flex items-center justify-between">
          <button 
            onClick={() => setShowFiltersMobile(true)}
            className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#111111]"
          >
            <Filter size={14} /> Filtrer
          </button>
          
          <div className="flex items-center gap-2">
             <select 
               value={sort}
               onChange={(e) => setSort(e.target.value)}
               className="bg-transparent border-none text-[10px] font-bold uppercase tracking-widest text-[#111111] focus:ring-0 outline-none"
             >
               <option value="newest">Nouveautés</option>
               <option value="price_asc">Prix croissant</option>
               <option value="price_desc">Prix décroissant</option>
             </select>
          </div>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      {showFiltersMobile && (
        <div className="fixed inset-0 z-[100] bg-white translate-x-0 transition-transform duration-500 overflow-y-auto">
          <div className="p-6 border-b border-[#EAEAEA] flex items-center justify-between sticky top-0 bg-white z-10">
            <h3 className="text-xs font-bold uppercase tracking-widest">Filtres</h3>
            <button onClick={() => setShowFiltersMobile(false)} className="p-2"><X size={24} /></button>
          </div>
          <FilterSidebar isMobile={true} />
          <div className="p-6 sticky bottom-0 bg-white border-t border-[#EAEAEA]">
            <button 
              onClick={() => setShowFiltersMobile(false)}
              className="w-full bg-[#111111] text-white py-4 text-[10px] font-bold uppercase tracking-widest"
            >
              Voir les {products.length} produits
            </button>
          </div>
        </div>
      )}

      {/* Main Layout */}
      <div className="max-w-[1600px] mx-auto px-6 lg:px-12 py-12 lg:py-20 flex">
        
        {/* Desktop Sidebar */}
        <FilterSidebar isMobile={false} />

        {/* Product List */}
        <div className="flex-1">
          {/* Desktop Sort Only */}
          <div className="hidden lg:flex items-center justify-between mb-12">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#888888]">{products.length} PRODUITS</p>
            <div className="flex items-center gap-4">
               <span className="text-[10px] text-[#888888] font-bold uppercase tracking-widest">Trier par:</span>
               <select 
                 value={sort}
                 onChange={(e) => setSort(e.target.value)}
                 className="bg-transparent border-none text-[10px] font-bold uppercase tracking-widest text-[#111111] focus:ring-0 cursor-pointer outline-none"
               >
                 <option value="newest">Nouveautés</option>
                 <option value="price_asc">Prix croissant</option>
                 <option value="price_desc">Prix décroissant</option>
               </select>
            </div>
          </div>

          {loading ? (
            <div className="min-h-[40vh] flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-[#111111] border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="lg:pl-8">
               <ProductGrid products={products} />
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

