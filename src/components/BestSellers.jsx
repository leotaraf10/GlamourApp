import { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation } from 'swiper/modules';
import ProductCard from './ProductCard';

import 'swiper/css';
import 'swiper/css/navigation';

export default function BestSellers() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:5001/api/products?best_seller=true')
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) return null; // Or a minimal skeleton
  if (products.length === 0) return null;

  return (
    <section className="w-full bg-[#FAF8F5] py-20 lg:py-28 overflow-hidden">
      <div className="max-w-[1600px] mx-auto px-4 lg:px-8">

        <div className="text-center mb-12 animate-fade-in">
          <h2 className="font-elegant text-3xl lg:text-4xl text-[#111111] font-normal uppercase tracking-widest">
            Best Sellers
          </h2>
          <div className="w-8 h-[1px] bg-[#111111] mx-auto mt-6"></div>
        </div>

        <Swiper
          modules={[Autoplay, Navigation]}
          spaceBetween={16}
          slidesPerView={2}
          breakpoints={{
            640: { slidesPerView: 3, spaceBetween: 24 },
            1024: { slidesPerView: 4, spaceBetween: 32 },
          }}
          autoplay={{ delay: 3000, disableOnInteraction: true, pauseOnMouseEnter: true }}
          navigation={true}
          className="w-full !px-2 lg:!px-4"
        >
          {products.map((p) => (
            <SwiperSlide key={p.id} className="h-auto">
              <ProductCard {...p} />
            </SwiperSlide>
          ))}
        </Swiper>

      </div>
    </section>
  );
}
