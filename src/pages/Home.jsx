import { useState, useEffect } from 'react';
import Hero from '../components/Hero';
import BestSellers from '../components/BestSellers';
import ProductGrid from '../components/ProductGrid';
import SocialProof from '../components/SocialProof';

export default function Home() {
  const [newProducts, setNewProducts] = useState([]);
  const API = `http://${window.location.hostname}:5001`;

  useEffect(() => {
    fetch(`${API}/api/products?sort=newest&limit=8`)
      .then(res => res.json())
      .then(data => setNewProducts(data))
      .catch(err => console.error(err));
  }, []);

  return (
    <>
      <Hero />
      <BestSellers />
      <ProductGrid products={newProducts} title="Nouveautés" />
      <SocialProof />
    </>
  );
}

