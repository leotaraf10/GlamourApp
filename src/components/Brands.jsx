import React from 'react';

const BRANDS = [
  { name: 'Nike', logo: '/logos/nike.svg' },
  { name: 'Adidas', logo: '/logos/adidas.svg' },
  { name: 'Puma', logo: '/logos/puma.svg' },
  { name: 'Reebok', logo: '/logos/reebok.svg' },
  { name: 'Under Armour', logo: '/logos/underarmour.svg' },
  { name: 'Roxy', logo: '/logos/roxy.svg' },
];

export default function Brands() {
  return (
    <div className="bg-white py-24 border-t border-[#F2ECE4]">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="flex flex-col items-center mb-16">
          <p className="text-[10px] font-bold text-[#8D7B68] uppercase tracking-[0.4em] mb-4">Partenaires Officiels</p>
          <h2 className="text-3xl lg:text-4xl font-serif text-[#111111] leading-tight text-center font-normal">Les plus grandes marques<br/>en un seul endroit</h2>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-12 lg:gap-16 items-center justify-items-center">
          {BRANDS.map((brand) => (
            <div key={brand.name} className="h-16 w-full max-w-[120px] flex items-center justify-center transition-all duration-500 cursor-pointer group opacity-100 hover:scale-110">
              <img 
                src={brand.logo} 
                alt={brand.name} 
                className="max-h-full max-w-full object-contain icon-black" 
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
