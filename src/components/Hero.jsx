import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const FALLBACK_SLIDES = [
  {
    id: 'f1',
    image_url: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1600&q=90&fit=crop',
    subtitle: 'Nouvelle Collection',
    title: 'Été 2025',
    cta_text: 'Découvrir',
    cta_link: '/collections/ete-2025',
  },
  {
    id: 'f2',
    image_url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1600&q=90&fit=crop',
    subtitle: 'Pièces Signatures',
    title: 'Robes & Ensembles',
    cta_text: 'Explorer',
    cta_link: '/collections/robes',
  },
  {
    id: 'f3',
    image_url: 'https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=1600&q=90&fit=crop',
    subtitle: 'Soldes Exceptionnels',
    title: '-50%',
    cta_text: 'Profiter',
    cta_link: '/collections/soldes',
  },
];

export default function Hero() {
  const [slides, setSlides] = useState([]);
  const [current, setCurrent] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    fetch(`http://${window.location.hostname}:5001/api/hero-slides`)
      .then(r => r.json())
      .then(data => setSlides(data && data.length > 0 ? data : FALLBACK_SLIDES))
      .catch(() => setSlides(FALLBACK_SLIDES));
  }, []);

  // Auto-advance
  useEffect(() => {
    if (slides.length <= 1) return;
    timerRef.current = setInterval(() => {
      goTo((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timerRef.current);
  }, [slides.length]);

  const goTo = (indexOrFn) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrent(typeof indexOrFn === 'function' ? indexOrFn : () => indexOrFn);
      setIsTransitioning(false);
    }, 400);
  };

  const prev = () => {
    clearInterval(timerRef.current);
    goTo((c) => (c - 1 + slides.length) % slides.length);
  };

  const next = () => {
    clearInterval(timerRef.current);
    goTo((c) => (c + 1) % slides.length);
  };

  if (slides.length === 0) return (
    <div className="w-full h-screen bg-[#F2ECE4] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#111111] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const slide = slides[current];
  const imgUrl = slide.image_url || (slide.image ? `http://${window.location.hostname}:5001${slide.image}` : '');

  return (
    <div className="relative w-full h-[100svh] bg-[#111111] overflow-hidden select-none" style={{ marginTop: '88px' }}>

      {/* Background Image */}
      <div
        key={slide.id}
        className={`absolute inset-0 bg-cover bg-center transition-opacity duration-700 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}
        style={{ backgroundImage: `url(${imgUrl})` }}
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-black/15" />

      {/* Content */}
      <div className={`absolute inset-0 z-20 flex flex-col items-center justify-end pb-24 text-center px-6 transition-all duration-700 ${isTransitioning ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
        {slide.subtitle && (
          <p className="text-white/70 font-bold text-[9px] uppercase tracking-[0.5em] mb-5">
            {slide.subtitle}
          </p>
        )}
        <h1 className="font-elegant text-6xl sm:text-7xl lg:text-8xl xl:text-9xl text-white font-normal leading-[0.9] mb-10 drop-shadow-2xl">
          {slide.title}
        </h1>
        {slide.cta_link && (
          <Link to={slide.cta_link}>
            <button className="group relative bg-white text-[#111111] px-14 py-4 font-bold uppercase tracking-[0.25em] text-[10px] overflow-hidden transition-all duration-300 hover:shadow-[0_0_0_2px_white]">
              <span className="relative z-10">{slide.cta_text || 'Découvrir'}</span>
              <span className="absolute inset-0 bg-[#111111] translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              <span className="absolute inset-0 z-10 text-white flex items-center justify-center font-bold uppercase tracking-[0.25em] text-[10px] opacity-0 group-hover:opacity-100 transition-opacity duration-300">{slide.cta_text || 'Découvrir'}</span>
            </button>
          </Link>
        )}
      </div>

      {/* Arrows */}
      {slides.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-6 top-1/2 -translate-y-1/2 z-30 w-12 h-12 bg-white/10 backdrop-blur-sm border border-white/20 text-white flex items-center justify-center hover:bg-white/20 transition-all duration-300"
          >
            <ChevronLeft size={20} strokeWidth={1.5} />
          </button>
          <button
            onClick={next}
            className="absolute right-6 top-1/2 -translate-y-1/2 z-30 w-12 h-12 bg-white/10 backdrop-blur-sm border border-white/20 text-white flex items-center justify-center hover:bg-white/20 transition-all duration-300"
          >
            <ChevronRight size={20} strokeWidth={1.5} />
          </button>
        </>
      )}

      {/* Dots */}
      {slides.length > 1 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => { clearInterval(timerRef.current); goTo(i); }}
              className={`transition-all duration-500 rounded-full ${i === current ? 'bg-white w-6 h-[3px]' : 'bg-white/40 w-[3px] h-[3px] hover:bg-white/70'}`}
            />
          ))}
        </div>
      )}

      {/* Slide Counter */}
      <div className="absolute bottom-8 right-8 z-30 text-white/50 text-[9px] font-bold tracking-widest">
        {String(current + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}
      </div>

    </div>
  );
}
