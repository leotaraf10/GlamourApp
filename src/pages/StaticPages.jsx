export function APropos() {
  return (
    <div className="py-24 max-w-3xl mx-auto px-6 text-center">
      <h1 className="text-3xl font-elegant uppercase tracking-widest mb-8">À Propos</h1>
      <p className="text-[#555555] font-light leading-relaxed">Créée en 2009, Glamour est la référence de la mode activewear minimaliste et haut de gamme. Notre mission est de proposer des pièces à la fois techniques et élégantes, conçues pour sublimer le mouvement tout en offrant un confort absolu.</p>
    </div>
  );
}

export function Contact() {
  return (
    <div className="py-24 max-w-3xl mx-auto px-6 text-center">
      <h1 className="text-3xl font-elegant uppercase tracking-widest mb-8">Contact</h1>
      <p className="text-[#555555] font-light leading-relaxed mb-8">Notre équipe est à votre disposition pour toute question via WhatsApp ou par email.</p>
      <a href="https://wa.me/212600000000" className="inline-block bg-[#111111] text-white px-8 py-4 text-[10px] uppercase tracking-widest font-bold hover:bg-[#333333] transition-colors">
        Nous contacter sur WhatsApp
      </a>
    </div>
  );
}

export function FAQ() {
  return (
    <div className="py-24 max-w-3xl mx-auto px-6">
      <h1 className="text-3xl font-elegant uppercase tracking-widest mb-8 text-center">FAQ</h1>
      <div className="space-y-6">
        <div className="border-b border-[#EAEAEA] pb-4">
          <h3 className="font-bold text-[#111111] text-sm uppercase tracking-widest mb-2">Comment fonctionne le paiement ?</h3>
          <p className="text-[#555555] font-light text-sm">Nous proposons uniquement le paiement à la livraison. Vous réglez votre commande en espèces à la réception.</p>
        </div>
        <div className="border-b border-[#EAEAEA] pb-4">
          <h3 className="font-bold text-[#111111] text-sm uppercase tracking-widest mb-2">Quels sont les délais de livraison ?</h3>
          <p className="text-[#555555] font-light text-sm">La livraison standard prend de 5 à 7 jours ouvrés. La livraison express prend 2 à 3 jours ouvrés.</p>
        </div>
      </div>
    </div>
  );
}

export function LivraisonRetours() {
  return (
    <div className="py-24 max-w-3xl mx-auto px-6 text-center">
      <h1 className="text-3xl font-elegant uppercase tracking-widest mb-8">Livraison & Retours</h1>
      <p className="text-[#555555] font-light leading-relaxed">Les retours sont possibles sous 30 jours pour tout article non porté et avec étiquettes. Les frais de retour sont à la charge du client.</p>
    </div>
  );
}

export function CGV() {
  return (
    <div className="py-24 max-w-3xl mx-auto px-6 text-center">
      <h1 className="text-3xl font-elegant uppercase tracking-widest mb-8">Conditions Générales de Vente</h1>
      <p className="text-[#555555] font-light leading-relaxed">Contenu juridique à définir par le service légal de Glamour.</p>
    </div>
  );
}

export function MentionsLegales() {
  return (
    <div className="py-24 max-w-3xl mx-auto px-6 text-center">
      <h1 className="text-3xl font-elegant uppercase tracking-widest mb-8">Mentions Légales</h1>
      <p className="text-[#555555] font-light leading-relaxed">Glamour est enregistrée au Maroc. Siège social : Casablanca. Hébergeur du site : Vercel / Railway.</p>
    </div>
  );
}

