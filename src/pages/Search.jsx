import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductGrid from '../components/ProductGrid';

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (query) {
      setLoading(true);
      fetch(`http://localhost:5001/api/products?q=${encodeURIComponent(query)}`)
        .then(res => res.json())
        .then(data => {
          setProducts(data);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    } else {
      setProducts([]);
      setLoading(false);
    }
  }, [query]);

  return (
    <div className="bg-[#FAF8F5] min-h-screen py-12 lg:py-20">
      <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
        <div className="mb-12">
          <h1 className="text-2xl lg:text-3xl font-elegant uppercase tracking-widest text-[#111111]">
            Résultats pour : "{query}"
          </h1>
          <p className="text-[#888888] text-[10px] font-bold uppercase tracking-widest mt-2">
            {products.length} PRODUITS TROUVÉS
          </p>
        </div>

        {loading ? (
          <div className="min-h-[40vh] flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-[#111111] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <ProductGrid products={products} />
        )}
      </div>
    </div>
  );
}
