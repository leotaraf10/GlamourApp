import { ShoppingBag, Menu, Search, User, X, ChevronDown } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useCartStore, useAuthStore } from '../store';
import { API_URL } from '../apiConfig';

const API = API_URL.replace('/api', '');

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState([]);

  const cartCount = useCartStore(state => state.cartCount());
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${API}/api/nav-categories`)
      .then(r => r.json())
      .then(data => setCategories(Array.isArray(data) ? data : []))
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setSearchOpen(false);
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const mid = Math.floor(categories.length / 2);
  const leftLinks = categories.slice(0, mid);
  const rightLinks = categories.slice(mid);
  const allLinks = categories;

  const isActive = (slug) => location.pathname === `/collections/${slug}`;

  return (
    <>
      {/* Announcement Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-[#111111] text-white text-center py-2">
        <p className="text-[9px] font-bold uppercase tracking-[0.3em]">Livraison Gratuite Dès 500 DH  ·  Retours Sous 30 Jours</p>
      </div>

      <nav
        className={`fixed left-0 right-0 z-40 transition-all duration-500 ${
          scrolled
            ? 'bg-white/96 backdrop-blur-md shadow-[0_1px_20px_rgba(0,0,0,0.06)] border-b border-[#E8E1D9]'
            : 'bg-white'
        }`}
        style={{ top: '36px' }}
      >
        <div className="max-w-[1600px] mx-auto px-6 lg:px-16">

          {/* Search Bar */}
          {searchOpen ? (
            <div className="h-16 flex items-center animate-fade-in">
              <form onSubmit={handleSearch} className="flex-1 flex items-center gap-4">
                <Search size={16} className="text-[#888888]" />
                <input
                  autoFocus
                  type="text"
                  placeholder="Rechercher..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent border-none text-[11px] uppercase tracking-[0.2em] outline-none font-bold text-[#111111] placeholder-[#AAAAAA]"
                />
              </form>
              <button onClick={() => setSearchOpen(false)} className="text-[#111111] p-2 hover:rotate-90 transition-transform duration-300">
                <X size={18} />
              </button>
            </div>
          ) : (
            <>
              {/* MAIN NAV ROW */}
              <div className="flex items-center h-16">

                {/* LEFT: Nav Links Desktop */}
                <div className="hidden lg:flex items-center gap-7 flex-1">
                  {leftLinks.map(link => (
                    <Link
                      key={link.slug || link.name}
                      to={`/collections/${link.slug}`}
                      className={`relative text-[10px] font-bold uppercase tracking-[0.18em] transition-colors duration-300 group pb-1
                        ${link.is_hot ? 'text-red-500 hover:text-red-600' : isActive(link.slug) ? 'text-[#111111]' : 'text-[#888888] hover:text-[#111111]'}`}
                    >
                      {link.name}
                      <span className={`absolute bottom-0 left-0 h-[1.5px] transition-all duration-300 ease-out ${link.is_hot ? 'bg-red-500' : 'bg-[#111111]'} ${isActive(link.slug) ? 'w-full' : 'w-0 group-hover:w-full'}`} />
                    </Link>
                  ))}
                </div>

                {/* CENTER: Logo */}
                <div className="flex-shrink-0 mx-auto lg:mx-0 lg:absolute lg:left-1/2 lg:-translate-x-1/2">
                  <Link to="/" className="group select-none flex items-center">
                    <img
                      src="/logo.png"
                      alt="Chic Glam"
                      className="h-10 lg:h-12 w-auto object-contain transition-opacity duration-300 group-hover:opacity-80"
                      style={{ maxWidth: '180px' }}
                    />
                  </Link>
                </div>

                {/* RIGHT: Nav Links Desktop */}
                <div className="hidden lg:flex items-center gap-8 flex-1 justify-end">
                  {rightLinks.map(link => (
                    <Link
                      key={link.slug || link.name}
                      to={`/collections/${link.slug}`}
                      className={`relative text-[10px] font-bold uppercase tracking-[0.18em] transition-colors duration-300 group pb-1
                        ${isActive(link.slug) ? 'text-[#111111]' : 'text-[#888888] hover:text-[#111111]'}`}
                    >
                      {link.name}
                      <span className={`absolute bottom-0 left-0 h-[1.5px] bg-[#111111] transition-all duration-300 ease-out ${isActive(link.slug) ? 'w-full' : 'w-0 group-hover:w-full'}`} />
                    </Link>
                  ))}

                  {/* Divider */}
                  <div className="h-5 w-[1px] bg-[#E0D9D0]" />

                  {/* Icons */}
                  <div className="flex items-center gap-5">
                    <button onClick={() => setSearchOpen(true)} className="text-[#555555] hover:text-[#111111] transition-colors">
                      <Search size={17} strokeWidth={1.5} />
                    </button>
                    <Link to="/account" className="text-[#555555] hover:text-[#111111] transition-colors">
                      <User size={17} strokeWidth={1.5} />
                    </Link>
                    <Link to="/cart" className="relative text-[#555555] hover:text-[#111111] transition-colors">
                      <ShoppingBag size={17} strokeWidth={1.5} />
                      {cartCount > 0 && (
                        <span className="absolute -top-2 -right-2.5 min-w-[15px] h-[15px] bg-[#111111] rounded-full text-white text-[8px] font-bold flex items-center justify-center px-1">
                          {cartCount}
                        </span>
                      )}
                    </Link>
                  </div>
                </div>

                {/* MOBILE: Hamburger (left) + Icons (right) */}
                <div className="flex lg:hidden items-center justify-between w-full absolute left-0 right-0 px-6 pointer-events-none">
                  <button onClick={() => setMobileMenuOpen(true)} className="text-[#111111] pointer-events-auto">
                    <Menu size={22} strokeWidth={1.2} />
                  </button>
                  <div className="flex items-center gap-4 pointer-events-auto">
                    <button onClick={() => setSearchOpen(true)} className="text-[#555555]"><Search size={17} strokeWidth={1.5} /></button>
                    <Link to="/cart" className="relative text-[#555555]">
                      <ShoppingBag size={17} strokeWidth={1.5} />
                      {cartCount > 0 && (
                        <span className="absolute -top-2 -right-2.5 min-w-[15px] h-[15px] bg-[#111111] rounded-full text-white text-[8px] font-bold flex items-center justify-center px-1">
                          {cartCount}
                        </span>
                      )}
                    </Link>
                  </div>
                </div>

              </div>
            </>
          )}
        </div>
      </nav>

      {/* Mobile Menu Drawer */}
      <div
        className={`fixed inset-0 z-[100] transition-all duration-500 lg:hidden ${mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setMobileMenuOpen(false)}
      >
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
        <div
          className={`absolute inset-y-0 left-0 w-[82%] max-w-sm bg-white shadow-2xl flex flex-col transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-8 py-7 border-b border-[#F0EBE4]">
            <img src="/logo.png" alt="Chic Glam" className="h-10 w-auto object-contain" style={{ maxWidth: '150px' }} />
            <button onClick={() => setMobileMenuOpen(false)} className="text-[#111111] hover:rotate-90 transition-transform duration-300">
              <X size={20} strokeWidth={1.5} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto py-8 px-8 flex flex-col gap-0">
            {allLinks.map((link, idx) => (
              <Link
                key={link.name}
                to={link.path}
                className={`py-5 border-b border-[#F0EBE4] text-sm font-bold uppercase tracking-[0.2em] transition-colors duration-200
                  ${link.hot ? 'text-red-500' : 'text-[#111111] hover:text-[#8D7B68]'}`}
                style={{ animationDelay: `${idx * 40}ms` }}
              >
                {link.name}
              </Link>
            ))}
          </div>
          <div className="px-8 py-6 border-t border-[#F0EBE4] flex flex-col gap-4">
            <Link to="/account" className="text-[10px] font-bold text-[#888888] uppercase tracking-[0.25em] flex items-center gap-3">
              <User size={14} /> Mon Compte
            </Link>
            <Link to="/contact" className="text-[10px] font-bold text-[#888888] uppercase tracking-[0.25em]">Contact & Support</Link>
          </div>
        </div>
      </div>
    </>
  );
}
