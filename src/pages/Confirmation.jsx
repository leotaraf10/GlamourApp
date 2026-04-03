import { Link } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';

export default function Confirmation() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-[#FAF8F5] py-20">
      <div className="max-w-md w-full bg-white border border-[#E8E1D9] p-12 text-center shadow-sm">
        <CheckCircle2 size={48} className="text-[#8D7B68] mx-auto mb-6" strokeWidth={1} />
        
        <h1 className="text-2xl lg:text-3xl font-elegant text-[#111111] mb-4">Merci pour votre commande</h1>
        
        <div className="w-12 h-[1px] bg-[#EAEAEA] mx-auto mb-6"></div>
        
        <p className="text-[#555555] font-light text-sm leading-relaxed mb-8">
          Un message WhatsApp a été généré via votre application pour contacter notre vendeur.
          Si vous l'avez bien envoyé, vous recevrez une confirmation finale sous 24h.
        </p>
        
        <Link to="/" className="inline-block bg-[#111111] text-white px-8 py-4 text-[10px] uppercase tracking-widest font-bold hover:bg-[#333333] transition-colors">
          Retour à la boutique
        </Link>
      </div>
    </div>
  );
}
