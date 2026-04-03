import ProductCard from './ProductCard';

export default function ProductGrid({ products, title }) {
  if (!products || products.length === 0) {
    return (
      <section className="w-full bg-white py-20 lg:py-32">
        <div className="max-w-[1600px] mx-auto px-4 lg:px-8 text-center">
          <p className="text-[#555555] font-light">Aucun produit trouvé pour cette sélection.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full bg-white py-20 lg:py-32">
      <div className="max-w-[1600px] mx-auto px-4 lg:px-8">

        {title && (
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="font-elegant text-3xl lg:text-4xl text-[#111111] font-normal uppercase tracking-widest">
              {title}
            </h2>
          </div>
        )}

        {/* Grid - Very thin gaps for a seamless editorial look */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {products.map((p, index) => (
             <div key={p.id} className="animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
              <ProductCard {...p} />
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
