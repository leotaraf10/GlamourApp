import { useState, useEffect } from 'react';
import Hero from '../components/Hero';
import BestSellers from '../components/BestSellers';
import ProductGrid from '../components/ProductGrid';
import SocialProof from '../components/SocialProof';
import { API_URL } from '../apiConfig';

const API = API_URL.replace('/api', '');

export default function Home() {
  const [newProducts, setNewProducts] = useState([]);

  useEffect(() => {
    fetch(`${API_URL}/products?sort=newest&limit=8`)
      .then(res => res.json())
      .then(data => setNewProducts(Array.isArray(data) ? data : []))
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

