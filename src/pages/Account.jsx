import { useState } from 'react';
import { useAuthStore } from '../store';

export default function Account() {
  const user = useAuthStore(state => state.user);
  const logout = useAuthStore(state => state.logout);
  const login = useAuthStore(state => state.login);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    login({ id: 1, email, nom: 'Doe', prenom: 'John' }, 'fake-jwt-token');
  };

  const inputClass = "w-full bg-white border border-[#EAEAEA] text-[#111111] px-4 py-3 text-[11px] uppercase tracking-widest placeholder-[#AAAAAA] focus:border-[#111111] focus:ring-0 outline-none transition-all mb-4";

  if (!user) {
    return (
      <div className="bg-[#FAF8F5] min-h-screen py-20 flex justify-center">
        <div className="w-full max-w-md bg-white border border-[#E8E1D9] p-10 shadow-sm">
          <h1 className="text-2xl font-elegant text-[#111111] mb-8 text-center">{isRegistering ? 'Créer un compte' : 'Connexion'}</h1>
          <form onSubmit={handleLogin}>
            <input type="email" placeholder="Email" required className={inputClass} value={email} onChange={e => setEmail(e.target.value)} />
            <input type="password" placeholder="Mot de passe" required className={inputClass} value={password} onChange={e => setPassword(e.target.value)} />
            
            <button type="submit" className="w-full bg-[#111111] text-white py-4 text-[11px] uppercase tracking-widest font-bold hover:bg-[#333333] transition-colors mt-4">
              {isRegistering ? "S'inscrire" : "Se Connecter"}
            </button>
          </form>
          <div className="mt-6 text-center">
            <button onClick={() => setIsRegistering(!isRegistering)} className="text-[10px] uppercase tracking-widest text-[#888888] font-bold border-b border-[#888888]">
              {isRegistering ? "Déjà un compte ? Connectez-vous" : "Pas de compte ? Inscrivez-vous"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#FAF8F5] min-h-screen py-16">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="flex justify-between items-end mb-12 border-b border-[#EAEAEA] pb-6">
          <h1 className="text-3xl font-elegant text-[#111111] uppercase tracking-widest">Bonjour, {user.prenom}</h1>
          <button onClick={logout} className="text-[10px] uppercase tracking-widest font-bold text-[#888888] hover:text-[#111111] transition-colors">Déconnexion</button>
        </div>

        <div className="bg-white border border-[#E8E1D9] p-8">
          <h2 className="text-sm font-bold uppercase tracking-widest text-[#111111] mb-6">Historique des Commandes</h2>
          <p className="text-[#555555] font-light text-sm">Vous n'avez passé aucune commande pour le moment.</p>
        </div>
      </div>
    </div>
  );
}
