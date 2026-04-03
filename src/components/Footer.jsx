export default function Footer() {
  return (
    <footer className="bg-white text-[#111111] pt-20 pb-10 border-t border-[#EAEAEA]">
      <div className="max-w-[1600px] mx-auto px-6 lg:px-8">

        {/* Top */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 mb-20">

          {/* Links 1 */}
          <div className="lg:col-span-3">
            <h4 className="text-[#111111] font-bold uppercase tracking-[0.15em] text-[10px] mb-6">Informations</h4>
            <ul className="space-y-4">
              {['À propos', 'Nos boutiques', 'Carrières', 'Presse'].map(item => (
                <li key={item}><a href="#" className="text-[#555555] text-[12px] font-light hover:text-[#111111] transition-colors">{item}</a></li>
              ))}
            </ul>
          </div>

          {/* Links 2 */}
          <div className="lg:col-span-3">
            <h4 className="text-[#111111] font-bold uppercase tracking-[0.15em] text-[10px] mb-6">Aide & Contact</h4>
            <ul className="space-y-4">
              {['FAQ', 'Livraison', 'Retours & Remboursements', 'Suivre ma commande', 'Nous contacter'].map(item => (
                <li key={item}><a href="#" className="text-[#555555] text-[12px] font-light hover:text-[#111111] transition-colors">{item}</a></li>
              ))}
            </ul>
          </div>

          {/* Spacer */}
          <div className="hidden lg:block lg:col-span-1"></div>

          {/* Newsletter (takes up more space) */}
          <div className="lg:col-span-5">
            <h4 className="text-[#111111] font-bold uppercase tracking-[0.15em] text-[10px] mb-6">S'inscrire à la newsletter</h4>
            <p className="text-[#555555] text-[12px] font-light mb-6 leading-relaxed max-w-sm">
              Soyez les premiers informés de nos nouveautés, de nos collections capsules et bénéficiez d'avantages exclusifs.
            </p>
            <form className="relative max-w-md">
              <input
                type="email"
                placeholder="VOTRE ADRESSE EMAIL"
                className="w-full bg-transparent border-b border-[#EAEAEA] text-[#111111] px-0 py-3 text-[11px] uppercase tracking-widest placeholder-[#888888] focus:border-[#111111] focus:ring-0 outline-none transition-all"
                required
              />
              <button type="submit" className="absolute right-0 top-3 text-[#111111] font-bold text-[11px] uppercase tracking-widest hover:text-[#888888] transition-colors">
                S'inscrire
              </button>
            </form>
          </div>

        </div>

        {/* Bottom */}
        <div className="pt-8 flex flex-col md:flex-row justify-between items-center gap-6 text-[9px] text-[#888888] font-bold uppercase tracking-widest">
          <p>&copy; 2026 Glamour</p>
          
          <div className="flex gap-8">
             <a href="#" className="hover:text-[#111111] transition-colors">Instagram</a>
             <a href="#" className="hover:text-[#111111] transition-colors">Tiktok</a>
             <a href="#" className="hover:text-[#111111] transition-colors">Facebook</a>
          </div>

          <div className="flex gap-8">
            <a href="#" className="hover:text-[#111111] transition-colors">Confidentialité</a>
            <a href="#" className="hover:text-[#111111] transition-colors">CGV</a>
            <a href="#" className="hover:text-[#111111] transition-colors">Mentions Légales</a>
          </div>
        </div>

      </div>
    </footer>
  );
}

