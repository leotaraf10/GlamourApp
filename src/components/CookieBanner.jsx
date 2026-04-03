import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie_consent');
    if (!consent) setTimeout(() => setVisible(true), 2000);
  }, []);

  const accept = () => {
    localStorage.setItem('cookie_consent', 'accepted');
    setVisible(false);
  };

  const decline = () => {
    localStorage.setItem('cookie_consent', 'declined');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-6 left-4 right-4 sm:left-6 sm:right-auto sm:max-w-md z-[200] bg-white border border-[#E8E1D9] shadow-2xl p-6 animate-fade-in">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-[11px] font-bold uppercase tracking-widest text-[#111111]">Confidentialité & Cookies</h3>
        <button onClick={decline} className="text-[#888888] hover:text-[#111111] ml-4 flex-shrink-0"><X size={16} /></button>
      </div>
      <p className="text-[11px] text-[#555555] font-light leading-relaxed mb-6">
        Nous utilisons des cookies pour améliorer votre expérience et analyser notre trafic. En continuant, vous acceptez notre{' '}
        <a href="/cgv" className="underline hover:text-[#111111]">politique de confidentialité</a>.
      </p>
      <div className="flex gap-3">
        <button
          onClick={accept}
          className="flex-1 bg-[#111111] text-white py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-[#333333] transition-colors"
        >
          Accepter
        </button>
        <button
          onClick={decline}
          className="flex-1 border border-[#EAEAEA] text-[#111111] py-3 text-[10px] font-bold uppercase tracking-widest hover:border-[#111111] transition-colors"
        >
          Refuser
        </button>
      </div>
    </div>
  );
}
