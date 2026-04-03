import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CookieBanner from './components/CookieBanner';

import Home from './pages/Home';
import Collection from './pages/Collection';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Confirmation from './pages/Confirmation';
import Account from './pages/Account';
import Admin from './pages/Admin';
import SearchPage from './pages/Search';
import { APropos, Contact, FAQ, LivraisonRetours, CGV, MentionsLegales } from './pages/StaticPages';

function Layout() {
  const { pathname } = useLocation();
  const isAdmin = pathname.startsWith('/admin');
  const isHome = pathname === '/';

  if (isAdmin) {
    return (
      <Routes>
        <Route path="/admin" element={<Admin />} />
      </Routes>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] font-sans selection:bg-[#111111] selection:text-white flex flex-col">
      <Navbar />
      {/* On the homepage, Hero extends under the navbar (Hero handles its own margin).
          On all other pages, we add the correct top offset: 36px announcement + 64px nav = 100px */}
      <main className={`flex-grow ${isHome ? '' : 'pt-[100px]'}`}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/collections/:slug" element={<Collection />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/confirmation" element={<Confirmation />} />
          <Route path="/account" element={<Account />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/a-propos" element={<APropos />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/livraison-retours" element={<LivraisonRetours />} />
          <Route path="/cgv" element={<CGV />} />
          <Route path="/mentions-legales" element={<MentionsLegales />} />
        </Routes>
      </main>
      <Footer />
      <CookieBanner />
    </div>
  );
}

function App() {
  return (
    <HelmetProvider>
      <Router>
        <Layout />
      </Router>
    </HelmetProvider>
  );
}

export default App;
