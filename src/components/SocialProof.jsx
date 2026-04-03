import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';

const testimonials = [
  {
    quote: "L'attention aux détails est incomparable. Chaque pièce est pensée pour sublimer la silhouette tout en gardant une allure effortless.",
    author: "Marie L.",
    city: "Casablanca",
    avatar: "/avatar_woman_1_1774792919720.png"
  },
  {
    quote: "Une expérience shopping d'exception. La qualité des matières et la rapidité de livraison au Maroc m'ont totalement convaincue.",
    author: "Sarah B.",
    city: "Rabat",
    avatar: "/avatar_woman_2_1774792956280.png"
  },
  {
    quote: "Enfin une boutique qui allie élégance vintage et modernité. Le service client sur WhatsApp est ultra réactif et professionnel.",
    author: "Yassine K.",
    city: "Marrakech",
    avatar: "/avatar_man_1_1774792938644.png"
  }
];

export default function SocialProof() {
  return (
    <section className="w-full bg-[#FAF8F5] py-24 lg:py-32 border-y border-[#E8E1D9]">
      <div className="max-w-[1000px] mx-auto px-6">
        
        <Swiper
          modules={[Autoplay, Pagination]}
          spaceBetween={30}
          slidesPerView={1}
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          pagination={{ clickable: true }}
          className="pb-16 testimonial-swiper"
        >
          {testimonials.map((t, i) => (
            <SwiperSlide key={i}>
              <div className="flex flex-col items-center text-center animate-fade-in">
                <div className="w-20 h-20 rounded-full overflow-hidden mb-8 border border-[#E8E1D9] grayscale hover:grayscale-0 transition-all duration-700">
                  <img src={t.avatar} alt={t.author} className="w-full h-full object-cover" />
                </div>
                
                <p className="font-elegant text-2xl lg:text-3xl text-[#111111] leading-relaxed italic mb-8 max-w-2xl mx-auto">
                  "{t.quote}"
                </p>
                
                <div className="flex flex-col items-center">
                  <div className="w-8 h-[1px] bg-[#8D7B68] mb-4"></div>
                  <span className="text-[#111111] font-bold uppercase tracking-[0.2em] text-[10px]">
                    {t.author} — {t.city}
                  </span>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
        
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .testimonial-swiper .swiper-pagination-bullet {
          background: #8D7B68;
          opacity: 0.3;
        }
        .testimonial-swiper .swiper-pagination-bullet-active {
          opacity: 1;
        }
      `}} />
    </section>
  );
}

