import { useState, useEffect } from 'react';
import { API_URL } from '../apiConfig';

export default function PromoBanner() {
  const [text, setText] = useState('Livraison offerte dès 1000 DH | Paiement à la livraison | Retours gratuits 30 jours');

  useEffect(() => {
    fetch(`${API_URL}/home-sections`)
      .then(r => r.json())
      .then(sections => {
        const banner = sections.find(s => s.type === 'promobanner' && s.active);
        if (banner?.title) setText(banner.title);
      })
      .catch(() => {});
  }, []);

  const items = text.split('|').map(t => t.trim());

  return (
    <div className="fixed top-0 w-full z-[60] bg-[#8D7B68] text-white py-2 overflow-hidden select-none h-9">
      <div className="flex animate-marquee whitespace-nowrap">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="flex shrink-0 items-center">
            {items.map((msg, idx) => (
              <span key={idx} className="text-[10px] font-bold uppercase tracking-[0.2em] px-10">
                {msg} {idx < items.length - 1 && <span className="mx-6 opacity-50">·</span>}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
