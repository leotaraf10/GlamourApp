import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Package, Image, LayoutGrid, ShoppingCart,
  Users, Star, Settings, LogOut, Menu, X, BarChart2,
  CheckCircle2, AlertCircle, PlusCircle, Trash2, Eye, Download,
  Navigation, Pencil, GripVertical, EyeOff, Flame
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { useAuthStore } from '../store';
import { API_URL } from '../apiConfig';

// ─── Helpers ──────────────────────────────────────────────────────
const API = API_URL;
const BASE_URL = API_URL.replace('/api', '');
const authHeader = (token) => ({ 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' });

// Shared Supabase client for frontend uploads (uses anon key — safe for Storage uploads)
const supabaseClient = createClient(
  import.meta.env.VITE_SUPABASE_URL || 'https://zplnrgzlvqdunuizpldq.supabase.co',
  import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpwbG5yZ3psdnFkdW51aXpwbGRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUyMTczMTAsImV4cCI6MjA5MDc5MzMxMH0.5ZJQekU4VLmgRi1__7SWd1ev2F-W9FFOaMSeFeHt7l0'
);

const getImgUrl = (img) => {
  if (!img) return '';
  const url = (typeof img === 'object' && img !== null) ? (img.url || img) : img;
  if (typeof url !== 'string' || !url) return '';
  return (url.startsWith('http') || url.startsWith('data:')) ? url : `${BASE_URL}${url}`;
};

function useAdminData(endpoint, token, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const refresh = useCallback(() => {
    setLoading(true);
    fetch(`${API}${endpoint}`, { headers: authHeader(token) })
      .then(r => r.json()).then(d => { setData(d); setLoading(false); }).catch(() => setLoading(false));
  }, [endpoint, token, ...deps]);
  useEffect(() => { refresh(); }, [refresh]);
  return { data, loading, refresh };
}

// ─── Stat Card ────────────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, color = '#111111' }) {
  return (
    <div className="bg-white border border-[#EAEAEA] p-6 flex items-center justify-between">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-[#888888] mb-1">{label}</p>
        <p className="text-2xl font-bold text-[#111111]">{value ?? '—'}</p>
      </div>
      <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: color + '15' }}>
        <Icon size={22} style={{ color }} strokeWidth={1.5} />
      </div>
    </div>
  );
}

// ─── Dashboard Tab ────────────────────────────────────────────────
function DashboardTab({ token }) {
  const { data: stats } = useAdminData('/stats', token);
  const { data: orders } = useAdminData('/orders?limit=5', token);

  return (
    <div>
      <h2 className="text-xl font-elegant uppercase tracking-widest mb-8">Tableau de Bord</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <StatCard label="Commandes totales" value={stats?.orders_total} icon={ShoppingCart} />
        <StatCard label="Chiffre d'affaires" value={stats?.revenue_total ? `${stats.revenue_total} DH` : null} icon={BarChart2} color="#8D7B68" />
        <StatCard label="Clients" value={stats?.clients_total} icon={Users} color="#5A7D59" />
        <StatCard label="Stock faible" value={stats?.low_stock} icon={AlertCircle} color="#CC4444" />
      </div>

      <div className="bg-white border border-[#EAEAEA] p-6">
        <h3 className="text-[11px] font-bold uppercase tracking-widest mb-6">Dernières commandes</h3>
        {!orders || orders.length === 0 ? (
          <p className="text-[#888888] text-sm">Aucune commande</p>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[#EAEAEA] text-[9px] font-bold uppercase tracking-widest text-[#888888]">
                <th className="pb-3">ID</th><th className="pb-3">Client</th><th className="pb-3">Total</th><th className="pb-3">Statut</th><th className="pb-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.id} className="border-b border-[#F5F5F5] hover:bg-[#FAF8F5]">
                  <td className="py-3 text-xs font-bold">#{o.id}</td>
                  <td className="py-3 text-xs">{o.prenom} {o.nom}</td>
                  <td className="py-3 text-xs font-bold">{o.total} DH</td>
                  <td className="py-3">
                    <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-1 ${
                      o.statut === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      o.statut === 'shipped' ? 'bg-blue-100 text-blue-700' :
                      o.statut === 'delivered' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}>{o.statut}</span>
                  </td>
                  <td className="py-3 text-xs text-[#888888]">{new Date(o.created_at).toLocaleDateString('fr-FR')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ─── Products Tab ─────────────────────────────────────────────────
function ProductsTab({ token }) {
  const { data: products, loading, refresh } = useAdminData('/products', token);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  const defaultForm = { nom: '', slug: '', description: '', prix: '', prix_solde: '', best_seller: false, nouveaute: false, solde: false, categorie: 'robes', stock: 0, tailles: 'S,M,L', couleurs: 'Noir,Blanc,Taupe', image_primary: '' };

  const openNew = () => { setEditing('new'); setForm(defaultForm); };
  const openEdit = (p) => {
    setEditing(p.id);
    setForm({
      ...p,
      tailles: p.tailles.join(','),
      couleurs: p.couleurs.join(','),
      stock_variants: p.stock_variants || {},
      image_primary: p.images[0]?.url || p.images[0] || '',
      image_secondary: p.image_secondary || '',
    });
  };
  const closeEdit = () => setEditing(null);

  const uploadFile = async (file, field) => {
    if (!file) return;
    
    const fileName = `uploads/${Date.now()}-${file.name}`;
    const filePath = fileName;

    try {
      const { data, error } = await supabaseClient.storage.from('products').upload(filePath, file);
      if (error) {
        if (error.message.includes('bucket not found') || error.message.includes('Bucket not found')) {
           alert('Erreur: Le bucket "products" n\'est pas créé sur votre Supabase. Allez dans "Storage" > "New Bucket" > Nommez-le "products" > Mettez-le en "Public".');
        } else {
           alert(`Erreur d'upload: ${error.message}`);
        }
        return;
      }

      // Get Public URL
      const { data: { publicUrl } } = supabaseClient.storage.from('products').getPublicUrl(filePath);
      setForm(prev => ({ ...prev, [field]: publicUrl }));
    } catch (err) {
      console.error('Upload error:', err);
      alert('Erreur technique lors de l\'upload');
    }
  };
  const save = async () => {
    setSaving(true);
    const finalCouleurs = (form.couleurs || '').split(',').map(c => c.trim()).filter(Boolean);
    const finalStockVariants = { ...form.stock_variants };
    // Cleanup stock_variants: remove entries for colors no longer in finalCouleurs
    Object.keys(finalStockVariants).forEach(c => {
      if (!finalCouleurs.includes(c)) delete finalStockVariants[c];
    });
    // Ensure all current colors have an entry
    finalCouleurs.forEach(c => {
      if (finalStockVariants[c] === undefined) finalStockVariants[c] = 0;
    });

    const { image_primary, ...cleanedForm } = form;

    const body = {
      ...cleanedForm,
      prix: parseFloat(form.prix),
      prix_solde: form.prix_solde ? parseFloat(form.prix_solde) : null,
      tailles: (form.tailles || '').split(',').map(t => t.trim()).filter(Boolean),
      couleurs: finalCouleurs,
      stock_variants: finalStockVariants,
      stock: Object.values(finalStockVariants).reduce((a, b) => a + parseInt(b || 0), 0),
      images: form.image_primary ? [{ url: form.image_primary, is_primary: 1, order: 0 }] : [],
      image_secondary: form.image_secondary || null,
    };
    const method = editing === 'new' ? 'POST' : 'PUT';
    const url = editing === 'new' ? `${API}/products` : `${API}/products/${editing}`;
    try {
      const res = await fetch(url, { method, headers: authHeader(token), body: JSON.stringify(body) });
      if (!res.ok) {
        const errorData = await res.json();
        alert(`Erreur: ${errorData.error || 'Impossible de sauvegarder le produit'}`);
      } else {
        closeEdit();
        refresh();
      }
    } catch (err) {
      alert('Erreur réseau ou serveur lors de la sauvegarde.');
    }
    setSaving(false);
  };

  const deleteProduct = async (id) => {
    if (!confirm('Supprimer ce produit ?')) return;
    await fetch(`${API}/products/${id}`, { method: 'DELETE', headers: authHeader(token) });
    refresh();
  };

  const inputCls = "w-full border border-[#EAEAEA] px-3 py-2.5 text-[11px] uppercase tracking-widest focus:border-[#111111] outline-none bg-white";

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-xl font-elegant uppercase tracking-widest">Produits</h2>
        <button onClick={openNew} className="bg-[#111111] text-white px-6 py-2.5 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-[#333333]">
          <PlusCircle size={14} /> Ajouter
        </button>
      </div>

      {/* Edit / New Form */}
      {editing && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-start justify-end overflow-auto">
          <div className="bg-white w-full max-w-xl h-full overflow-y-auto p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-bold uppercase tracking-widest">{editing === 'new' ? 'Nouveau produit' : 'Modifier'}</h3>
              <button onClick={closeEdit}><X size={20} /></button>
            </div>
            <div className="flex flex-col gap-4">
              <input className={inputCls} placeholder="Nom *" value={form.nom || ''} onChange={e => setForm({...form, nom: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')})} />
              <input className={inputCls} placeholder="Slug (auto)" value={form.slug || ''} onChange={e => setForm({...form, slug: e.target.value})} />
              <textarea className={inputCls} placeholder="Description" rows={3} value={form.description || ''} onChange={e => setForm({...form, description: e.target.value})} />
              <div className="grid grid-cols-2 gap-3">
                <input className={inputCls} type="number" placeholder="Prix (DH)*" value={form.prix || ''} onChange={e => setForm({...form, prix: e.target.value})} />
                <input className={inputCls} type="number" placeholder="Prix soldé (DH)" value={form.prix_solde || ''} onChange={e => setForm({...form, prix_solde: e.target.value})} />
              </div>
              <div className="flex flex-col gap-3">
                <select className={inputCls} value={form.categorie} onChange={e => setForm({...form, categorie: e.target.value})}>
                  <option value="ete-2025">Été 2025</option>
                  <option value="jeans">Jeans</option>
                  <option value="robes">Robes</option>
                  <option value="tops-bodys">Tops | Bodys</option>
                  <option value="ensembles">Ensembles</option>
                  <option value="pantalons">Pantalons</option>
                  <option value="blazers">Blazers</option>
                  <option value="manteaux-trench">Manteaux | Trench</option>
                </select>
              </div>
              <input className={inputCls} placeholder="Tailles (ex: XS,S,M,L,XL)" value={form.tailles || ''} onChange={e => setForm({...form, tailles: e.target.value})} />
              
              <div className="bg-[#FAF8F5] border border-[#EAEAEA] p-5">
                <div className="flex justify-between items-center mb-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#888888]">Gestion des Stocks par Couleur</p>
                  <button 
                    type="button"
                    onClick={() => {
                      const newColor = prompt('Entrez le nom de la nouvelle couleur (ex: Bordeaux)');
                      if (newColor && newColor.trim()) {
                        const c = newColor.trim();
                        const currentCouleurs = (form.couleurs || '').split(',').map(x => x.trim()).filter(Boolean);
                        if (!currentCouleurs.includes(c)) {
                          setForm({
                            ...form,
                            couleurs: [...currentCouleurs, c].join(','),
                            stock_variants: { ...form.stock_variants, [c]: 0 }
                          });
                        }
                      }
                    }}
                    className="text-[9px] font-bold uppercase tracking-widest text-[#111111] border-b border-[#111111] pb-0.5 hover:text-[#8D7B68] hover:border-[#8D7B68]"
                  >
                    + Ajouter une couleur
                  </button>
                </div>
                
                <div className="flex flex-col gap-3">
                  {(form.couleurs || '').split(',').map(c => c.trim()).filter(Boolean).map(color => (
                    <div key={color} className="flex items-center gap-4 bg-white p-3 border border-[#F0F0F0]">
                      <span className="flex-1 text-[11px] font-bold uppercase tracking-wider text-[#111111]">{color}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] text-[#888888] font-bold uppercase">Stock:</span>
                        <input 
                          className={`${inputCls} !w-20 !py-1.5 text-center font-bold`} 
                          type="number" 
                          min="0"
                          value={form.stock_variants?.[color] ?? 0} 
                          onChange={e => setForm({
                            ...form, 
                            stock_variants: { 
                              ...form.stock_variants, 
                              [color]: parseInt(e.target.value || 0) 
                            }
                          })} 
                        />
                        <button 
                          type="button"
                          onClick={() => {
                            const currentCouleurs = (form.couleurs || '').split(',').map(x => x.trim()).filter(Boolean);
                            const nextCouleurs = currentCouleurs.filter(x => x !== color);
                            const nextVariants = { ...form.stock_variants };
                            delete nextVariants[color];
                            setForm({ ...form, couleurs: nextCouleurs.join(','), stock_variants: nextVariants });
                          }}
                          className="p-1.5 text-[#AAAAAA] hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                  {(form.couleurs || '').split(',').map(c => c.trim()).filter(Boolean).length === 0 && (
                    <p className="text-[10px] text-[#AAAAAA] italic text-center py-4">Aucune couleur définie. Cliquez sur "+" pour commencer.</p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between px-3 py-2 bg-[#111111] text-white">
                <span className="text-[10px] font-bold uppercase tracking-widest">Stock Total</span>
                <span className="text-sm font-bold">
                  {Object.values(form.stock_variants || {}).reduce((a, b) => a + parseInt(b || 0), 0)}
                </span>
              </div>
              <div className="flex flex-col gap-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#888888]">Image principale (URL ou Fichier)</p>
                <div className="flex gap-2">
                  <input className={inputCls} placeholder="URL Image principale" value={form.image_primary || ''} onChange={e => setForm({...form, image_primary: e.target.value})} />
                  <label className="bg-[#111111] text-white px-4 py-2 text-[10px] font-bold uppercase tracking-widest cursor-pointer hover:bg-[#333333] flex items-center shrink-0">
                    Upload
                    <input type="file" className="hidden" accept="image/*" onChange={e => uploadFile(e.target.files[0], 'image_primary')} />
                  </label>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#888888]">Image secondaire (URL ou Fichier)</p>
                <div className="flex gap-2">
                  <input className={inputCls} placeholder="URL Image secondaire" value={form.image_secondary || ''} onChange={e => setForm({...form, image_secondary: e.target.value})} />
                  <label className="bg-[#111111] text-white px-4 py-2 text-[10px] font-bold uppercase tracking-widest cursor-pointer hover:bg-[#333333] flex items-center shrink-0">
                    Upload
                    <input type="file" className="hidden" accept="image/*" onChange={e => uploadFile(e.target.files[0], 'image_secondary')} />
                  </label>
                </div>
              </div>
              <div className="flex flex-wrap gap-4">
                {[['best_seller', 'Best Seller'], ['nouveaute', 'Nouveauté'], ['solde', 'Soldes']].map(([key, label]) => (
                  <label key={key} className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={!!form[key]} onChange={e => setForm({...form, [key]: e.target.checked})} className="accent-[#111111] w-4 h-4" />
                    <span className="text-[11px] font-bold uppercase tracking-widest">{label}</span>
                  </label>
                ))}
              </div>
              <button onClick={save} disabled={saving} className="bg-[#111111] text-white py-4 text-[10px] font-bold uppercase tracking-widest hover:bg-[#333333] transition-colors mt-2">
                {saving ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Products table */}
      <div className="bg-white border border-[#EAEAEA] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[#EAEAEA] bg-[#FAF8F5] text-[9px] font-bold uppercase tracking-widest text-[#888888]">
                <th className="p-4">Image</th><th className="p-4">Nom</th><th className="p-4">Prix</th>
                <th className="p-4">Catégorie</th><th className="p-4">Tags</th><th className="p-4">Stock</th><th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(products || []).map(p => (
                <tr key={p.id} className="border-b border-[#F5F5F5] hover:bg-[#FAF8F5] transition-colors">
                  <td className="p-4">
                    <img src={getImgUrl(p.images[0])} alt={p.nom} className="w-12 h-16 object-cover bg-[#F2ECE4]" />
                  </td>
                  <td className="p-4 max-w-[200px]">
                    <p className="text-xs font-bold text-[#111111] truncate">{p.nom}</p>
                    <p className="text-[10px] text-[#888888]">{p.slug}</p>
                  </td>

                  <td className="p-4 text-xs">
                    <p className="font-bold">{p.prix_solde || p.prix} DH</p>
                    {p.prix_solde && <p className="line-through text-[#AAAAAA]">{p.prix} DH</p>}
                  </td>
                  <td className="p-4 text-[10px] uppercase tracking-widest">{p.categorie}</td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-1">
                      {p.best_seller === 1 && <span className="text-[8px] bg-[#8D7B68] text-white px-1.5 py-0.5 uppercase font-bold">Best</span>}
                      {p.nouveaute === 1 && <span className="text-[8px] bg-[#111111] text-white px-1.5 py-0.5 uppercase font-bold">New</span>}
                      {p.solde === 1 && <span className="text-[8px] bg-red-100 text-red-600 px-1.5 py-0.5 uppercase font-bold">Solde</span>}
                    </div>
                  </td>
                  <td className="p-4 text-xs">{p.stock}</td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(p)} className="p-2 hover:bg-[#FAF8F5] text-[#111111] border border-[#EAEAEA]"><Eye size={14}/></button>
                      <button onClick={() => deleteProduct(p.id)} className="p-2 hover:bg-red-50 text-red-500 border border-red-100"><Trash2 size={14}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Hero Tab ─────────────────────────────────────────────────────
function HeroTab({ token }) {
  const { data: slides, refresh } = useAdminData('/hero-slides?all=true', token);
  const [form, setForm] = useState({ image_url: '', title: '', subtitle: '', cta_text: 'Découvrir', cta_link: '/', active: true });
  const [saving, setSaving] = useState(false);

  const uploadFile = async (file) => {
    if (!file) return;
    const fileName = `hero/${Date.now()}-${file.name}`;
    try {
      const { error } = await supabaseClient.storage.from('products').upload(fileName, file);
      if (error) {
        if (error.message.includes('bucket') || error.message.includes('Bucket')) {
          alert('Bucket "products" introuvable. Créez-le dans Supabase \u2192 Storage \u2192 New Bucket \u2192 "products" (Public)');
        } else {
          alert(`Erreur upload: ${error.message}`);
        }
        return;
      }
      const { data: { publicUrl } } = supabaseClient.storage.from('products').getPublicUrl(fileName);
      setForm(prev => ({ ...prev, image_url: publicUrl }));
    } catch (err) {
      console.error('Upload error:', err);
      alert('Erreur technique lors de l\'upload');
    }
  };

  const add = async () => {
    setSaving(true);
    await fetch(`${API}/hero-slides`, { method: 'POST', headers: authHeader(token), body: JSON.stringify({ ...form, order_index: (slides?.length || 0) }) });
    setSaving(false);
    setForm({ image_url: '', title: '', subtitle: '', cta_text: 'Découvrir', cta_link: '/', active: true });
    refresh();
  };
  const remove = async (id) => {
    await fetch(`${API}/hero-slides/${id}`, { method: 'DELETE', headers: authHeader(token) });
    refresh();
  };
  const toggle = async (slide) => {
    await fetch(`${API}/hero-slides/${slide.id}`, { method: 'PUT', headers: authHeader(token), body: JSON.stringify({ ...slide, active: !slide.active }) });
    refresh();
  };

  const inputCls = "w-full border border-[#EAEAEA] px-3 py-2.5 text-[11px] uppercase tracking-widest focus:border-[#111111] outline-none bg-white";

  return (
    <div>
      <h2 className="text-xl font-elegant uppercase tracking-widest mb-8">Hero Carrousel</h2>
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Add form */}
        <div className="bg-white border border-[#EAEAEA] p-6">
          <h3 className="text-[11px] font-bold uppercase tracking-widest mb-6">Ajouter un slide</h3>
          <div className="flex flex-col gap-3">
            <div className="flex gap-2">
              <input className={inputCls} placeholder="URL image ou vidéo" value={form.image_url} onChange={e => setForm({...form, image_url: e.target.value})} />
              <label className="bg-[#111111] text-white px-4 py-2 text-[10px] font-bold uppercase tracking-widest cursor-pointer hover:bg-[#333333] flex items-center shrink-0">
                Upload
                <input type="file" className="hidden" accept="image/*,video/*" onChange={e => uploadFile(e.target.files[0])} />
              </label>
            </div>
            <input className={inputCls} placeholder="Titre" value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
            <input className={inputCls} placeholder="Sous-titre" value={form.subtitle} onChange={e => setForm({...form, subtitle: e.target.value})} />
            <div className="grid grid-cols-2 gap-3">
              <input className={inputCls} placeholder="Texte bouton" value={form.cta_text} onChange={e => setForm({...form, cta_text: e.target.value})} />
              <input className={inputCls} placeholder="Lien bouton (/collections/...)" value={form.cta_link} onChange={e => setForm({...form, cta_link: e.target.value})} />
            </div>
            <button onClick={add} disabled={saving} className="bg-[#111111] text-white py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-[#333333]">
              {saving ? 'Ajout...' : 'Ajouter le slide'}
            </button>
          </div>
        </div>

        {/* Current slides */}
        <div className="flex flex-col gap-3">
          {(slides || []).map(s => (
            <div key={s.id} className={`flex items-center gap-4 bg-white border p-3 transition-all ${s.active ? 'border-[#EAEAEA]' : 'border-[#EAEAEA] opacity-40'}`}>
              {s.image_url && <img src={s.image_url} alt={s.title} className="w-20 h-14 object-cover bg-[#F2ECE4] flex-shrink-0" />}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold truncate">{s.title || 'Sans titre'}</p>
                <p className="text-[10px] text-[#888888] truncate">{s.cta_link}</p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button onClick={() => toggle(s)} className={`p-2 border text-[10px] font-bold uppercase tracking-widest ${s.active ? 'border-green-200 text-green-600' : 'border-[#EAEAEA] text-[#888888]'}`}>
                  {s.active ? 'ON' : 'OFF'}
                </button>
                <button onClick={() => remove(s.id)} className="p-2 border border-red-100 text-red-500 hover:bg-red-50"><Trash2 size={13}/></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Orders Tab ───────────────────────────────────────────────────
function OrdersTab({ token }) {
  const { data: orders, loading, refresh } = useAdminData('/orders', token);
  const STATUTS = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

  const changeStatus = async (id, statut) => {
    await fetch(`${API}/orders/${id}/status`, { method: 'PUT', headers: authHeader(token), body: JSON.stringify({ statut }) });
    refresh();
  };

  const exportCSV = async () => {
    try {
      const res = await fetch(`${API}/admin/orders-export`, { headers: authHeader(token) });
      const data = await res.json();
      if (!Array.isArray(data)) return;

      const header = 'ID,Date,Statut,Client,Email,Tel,Adresse,Ville,Produit,Taille,Couleur,Quantite,Prix Unitaire,Total Commande';
      const rows = data.map(o => [
        o.id,
        new Date(o.created_at).toLocaleDateString('fr-FR'),
        o.statut,
        `${o.prenom} ${o.nom}`,
        o.email,
        o.tel,
        `"${o.adresse.replace(/"/g, '""')}"`,
        o.ville,
        `"${o.nom_produit || ''}"`,
        o.taille || '',
        o.couleur || '',
        o.quantite || 0,
        o.prix_unitaire || 0,
        o.total
      ].join(','));

      const csv = [header, ...rows].join('\n');
      const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' }); // \ufeff for Excel UTF-8
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); 
      a.href = url; 
      a.download = `glamour_commandes_${new Date().toISOString().split('T')[0]}.csv`; 
      a.click();
    } catch (err) {
      console.error('Export error:', err);
      alert('Erreur lors de l\'exportation');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-xl font-elegant uppercase tracking-widest">Commandes</h2>
        <button onClick={exportCSV} className="flex items-center gap-2 border border-[#EAEAEA] px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest hover:border-[#111111]">
          <Download size={13}/> Export CSV
        </button>
      </div>
      <div className="bg-white border border-[#EAEAEA] overflow-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-[#EAEAEA] bg-[#FAF8F5] text-[9px] font-bold uppercase tracking-widest text-[#888888]">
              <th className="p-4">ID</th><th className="p-4">Client</th><th className="p-4">Tel</th>
              <th className="p-4">Total</th><th className="p-4">Livraison</th><th className="p-4">Statut</th><th className="p-4">Date</th>
            </tr>
          </thead>
          <tbody>
            {(orders || []).map(o => (
              <tr key={o.id} className="border-b border-[#F5F5F5] hover:bg-[#FAF8F5]">
                <td className="p-4 text-xs font-bold">#{o.id}</td>
                <td className="p-4 text-xs">
                  <p className="font-bold">{o.prenom} {o.nom}</p>
                  <p className="text-[#888888] text-[10px]">{o.email}</p>
                </td>
                <td className="p-4 text-xs">{o.tel}</td>
                <td className="p-4 text-xs font-bold">{o.total} DH</td>
                <td className="p-4 text-[10px] uppercase">{o.livraison_mode}</td>
                <td className="p-4">
                  <select
                    value={o.statut}
                    onChange={(e) => changeStatus(o.id, e.target.value)}
                    className="text-[9px] font-bold uppercase tracking-widest border border-[#EAEAEA] px-2 py-1.5 outline-none bg-white"
                  >
                    {STATUTS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
                <td className="p-4 text-[10px] text-[#888888]">{new Date(o.created_at).toLocaleDateString('fr-FR')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Reviews Tab ──────────────────────────────────────────────────
function ReviewsTab({ token }) {
  const { data: reviews, refresh } = useAdminData('/reviews/admin/all', token);
  const { data: products } = useAdminData('/products', token);
  
  const [form, setForm] = useState({ product_id: '', nom: 'Admin', ville: '', note: 5, commentaire: '' });
  const [saving, setSaving] = useState(false);

  const approve = async (id, val) => {
    await fetch(`${API}/reviews/${id}`, { method: 'PUT', headers: authHeader(token), body: JSON.stringify({ approuve: val }) });
    refresh();
  };
  const remove = async (id) => {
    if (!confirm('Supprimer cet avis ?')) return;
    await fetch(`${API}/reviews/${id}`, { method: 'DELETE', headers: authHeader(token) });
    refresh();
  };

  const addReview = async (e) => {
    e.preventDefault();
    if (!form.product_id) return alert('Sélectionnez un produit');
    setSaving(true);
    try {
      await fetch(`${API}/admin/reviews`, { 
        method: 'POST', 
        headers: authHeader(token), 
        body: JSON.stringify(form) 
      });
      setForm({ product_id: '', nom: 'Admin', ville: '', note: 5, commentaire: '' });
      refresh();
    } catch (err) {
      console.error(err);
      alert('Erreur lors de l\'ajout');
    }
    setSaving(true);
    setSaving(false);
  };

  const inputCls = "w-full border border-[#EAEAEA] px-3 py-2 text-[10px] uppercase tracking-widest focus:border-[#111111] outline-none bg-white";

  return (
    <div className="grid lg:grid-cols-12 gap-8">
      {/* Form */}
      <div className="lg:col-span-4">
        <div className="bg-white border border-[#EAEAEA] p-6 sticky top-24">
          <h2 className="text-[11px] font-bold uppercase tracking-widest mb-6">Ajouter un Avis</h2>
          <form onSubmit={addReview} className="flex flex-col gap-4">
            <div>
              <p className="text-[9px] font-bold uppercase text-[#888888] mb-1.5">Produit *</p>
              <select className={inputCls} value={form.product_id} onChange={e => setForm({...form, product_id: e.target.value})} required>
                <option value="">Choisir un produit...</option>
                {products?.map(p => <option key={p.id} value={p.id}>{p.nom}</option>)}
              </select>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[9px] font-bold uppercase text-[#888888] mb-1.5">Nom</p>
                <input className={inputCls} value={form.nom} onChange={e => setForm({...form, nom: e.target.value})} placeholder="Ex: Jean D." />
              </div>
              <div>
                <p className="text-[9px] font-bold uppercase text-[#888888] mb-1.5">Ville</p>
                <input className={inputCls} value={form.ville} onChange={e => setForm({...form, ville: e.target.value})} placeholder="Ex: Casablanca" />
              </div>
            </div>

            <div>
              <p className="text-[9px] font-bold uppercase text-[#888888] mb-1.5">Note</p>
              <div className="flex gap-2">
                {[1,2,3,4,5].map(star => (
                  <button 
                    key={star} 
                    type="button"
                    onClick={() => setForm({...form, note: star})}
                    className={`p-1 transition-all ${form.note >= star ? 'text-[#111111]' : 'text-gray-200'}`}
                  >
                    <Star size={20} fill={form.note >= star ? 'currentColor' : 'none'} strokeWidth={1.5} />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[9px] font-bold uppercase text-[#888888] mb-1.5">Commentaire</p>
              <textarea className={inputCls} rows={4} value={form.commentaire} onChange={e => setForm({...form, commentaire: e.target.value})} placeholder="Votre avis..." />
            </div>

            <button type="submit" disabled={saving} className="bg-[#111111] text-white py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-[#333333] transition-colors mt-2">
              {saving ? 'Ajout...' : 'Ajouter l\'avis'}
            </button>
          </form>
        </div>
      </div>

      {/* List */}
      <div className="lg:col-span-8">
        <h2 className="text-xl font-elegant uppercase tracking-widest mb-8">Modération des Avis</h2>
        <div className="flex flex-col gap-3">
          {reviews?.length === 0 && <p className="text-[#888888] text-sm italic">Aucun avis trouvé.</p>}
          {(reviews || []).map(r => (
            <div key={r.id} className={`bg-white border p-5 transition-all ${r.approuve ? 'border-[#EAEAEA]' : 'border-yellow-200 bg-yellow-50/30'}`}>
              <div className="flex flex-wrap justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <p className="text-xs font-bold text-[#111111]">{r.nom}</p>
                    {r.ville && <p className="text-[10px] text-[#888888] uppercase tracking-widest">{r.ville}</p>}
                    <span className="text-[9px] font-bold px-1.5 py-0.5 bg-[#FAF8F5] border border-[#EAEAEA] text-[#8D7B68] rounded">{r.product_nom}</span>
                  </div>
                  <div className="flex gap-0.5 my-1.5">
                    {[1,2,3,4,5].map(i => (
                      <Star key={i} size={11} className={i <= r.note ? 'text-[#111111] fill-[#111111]' : 'text-gray-200 fill-gray-100'} />
                    ))}
                  </div>
                  <p className="text-sm text-[#555555] font-light leading-relaxed">"{r.commentaire}"</p>
                  <p className="text-[9px] text-[#AAAAAA] mt-2 italic">{new Date(r.created_at).toLocaleDateString('fr-FR')}</p>
                </div>
                <div className="flex gap-2 items-start shrink-0">
                  <button onClick={() => approve(r.id, !r.approuve)} className={`px-3 py-1.5 border text-[9px] font-bold uppercase tracking-widest transition-all ${r.approuve ? 'border-yellow-200 text-yellow-600 hover:bg-yellow-50' : 'border-green-200 text-green-600 hover:bg-green-50'}`}>
                    {r.approuve ? 'Masquer' : 'Approuver'}
                  </button>
                  <button onClick={() => remove(r.id)} className="p-2 border border-red-100 text-red-500 hover:bg-red-50 transition-colors"><Trash2 size={14}/></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Settings Tab ─────────────────────────────────────────────────
function SettingsTab({ token }) {
  const { data: settings, loading } = useAdminData('/settings', token);
  const [form, setForm] = useState({});
  const [saved, setSaved] = useState(false);

  useEffect(() => { if (settings) setForm(settings); }, [settings]);

  const save = async () => {
    await fetch(`${API}/settings`, { method: 'PUT', headers: authHeader(token), body: JSON.stringify(form) });
    setSaved(true); setTimeout(() => setSaved(false), 2000);
  };

  const inputCls = "w-full border border-[#EAEAEA] px-3 py-2.5 text-[11px] uppercase tracking-widest focus:border-[#111111] outline-none";
  const Field = ({ k, label }) => (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-widest text-[#888888] mb-1.5">{label}</p>
      <input className={inputCls} value={form[k] || ''} onChange={e => setForm({...form, [k]: e.target.value})} />
    </div>
  );

  return (
    <div>
      <h2 className="text-xl font-elegant uppercase tracking-widest mb-8">Paramètres du Site</h2>
      <div className="bg-white border border-[#EAEAEA] p-8 max-w-xl">
        <div className="flex flex-col gap-5">
          <Field k="whatsapp_number" label="Numéro WhatsApp Admin (212...)" />
          <Field k="delivery_standard_cost" label="Frais livraison standard (DH)" />
          <Field k="delivery_express_cost" label="Frais livraison express (DH)" />
          <Field k="delivery_standard_days" label="Délai standard (ex: 5-7)" />
          <Field k="delivery_express_days" label="Délai express (ex: 2-3)" />
          <Field k="free_delivery_threshold" label="Livraison gratuite dès (DH)" />
          <Field k="instagram_url" label="Lien Instagram" />
          <Field k="tiktok_url" label="Lien TikTok" />
          <Field k="facebook_url" label="Lien Facebook" />

          <button onClick={save} className={`py-4 text-[10px] font-bold uppercase tracking-widest transition-colors mt-2 ${saved ? 'bg-[#5A7D59] text-white' : 'bg-[#111111] text-white hover:bg-[#333333]'}`}>
            {saved ? '✓ Enregistré' : 'Sauvegarder'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── CategoriesTab ───────────────────────────────────
function CategoriesTab({ token }) {
  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', slug: '', is_hot: false, is_visible: true });
  const [newForm, setNewForm] = useState({ name: '', slug: '', is_hot: false, is_visible: true });
  const [deleting, setDeleting] = useState(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const fetchCats = () => {
    setLoading(true);
    fetch(`${API}/admin/nav-categories`, { headers: authHeader(token) })
      .then(r => r.json()).then(d => { setCats(Array.isArray(d) ? d : []); setLoading(false); }).catch(() => setLoading(false));
  };

  useEffect(() => { fetchCats(); }, []);

  const autoSlug = (name) => name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');

  const handleAdd = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = { ...newForm, slug: newForm.slug || autoSlug(newForm.name) };
    const res = await fetch(`${API}/admin/nav-categories`, {
      method: 'POST', headers: authHeader(token), body: JSON.stringify(payload)
    });
    const data = await res.json();
    setSaving(false);
    if (res.ok) { setMsg('Section ajoutée !'); setNewForm({ name: '', slug: '', is_hot: false, is_visible: true }); fetchCats(); }
    else setMsg(data.error || 'Erreur');
    setTimeout(() => setMsg(''), 3000);
  };

  const handleSave = async (cat) => {
    setSaving(true);
    const res = await fetch(`${API}/admin/nav-categories/${cat.id}`, {
      method: 'PUT', headers: authHeader(token), body: JSON.stringify(editForm)
    });
    setSaving(false);
    if (res.ok) { setMsg('Modifié !'); setEditId(null); fetchCats(); }
    else setMsg('Erreur');
    setTimeout(() => setMsg(''), 3000);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cette section de navigation ?')) return;
    setDeleting(id);
    await fetch(`${API}/admin/nav-categories/${id}`, { method: 'DELETE', headers: authHeader(token) });
    setDeleting(null);
    fetchCats();
  };

  const toggleVisibility = async (cat) => {
    await fetch(`${API}/admin/nav-categories/${cat.id}`, {
      method: 'PUT', headers: authHeader(token),
      body: JSON.stringify({ ...cat, is_visible: cat.is_visible ? 0 : 1 })
    });
    fetchCats();
  };

  const inputCls = 'bg-[#FAF8F5] border border-[#EAEAEA] px-3 py-2 text-[11px] uppercase tracking-widest outline-none focus:border-[#111111] transition-colors w-full';

  return (
    <div className="p-8 max-w-3xl">
      <h2 className="text-xl font-elegant mb-1">Sections de Navigation</h2>
      <p className="text-[11px] text-[#888888] uppercase tracking-widest mb-8">Gérez les catégories affichées dans la barre de navigation</p>
      {msg && <div className="mb-6 px-4 py-3 bg-[#111111] text-white text-[11px] uppercase tracking-widest font-bold">{msg}</div>}
      {loading ? (
        <div className="flex items-center justify-center h-32"><div className="w-6 h-6 border-2 border-[#111111] border-t-transparent animate-spin rounded-full" /></div>
      ) : (
        <div className="border border-[#EAEAEA] mb-10">
          {cats.length === 0 && <p className="text-center text-[11px] text-[#888888] py-8 uppercase tracking-widest">Aucune section.</p>}
          {cats.map((cat) => editId === cat.id ? (
            <div key={cat.id} className="p-4 border-b border-[#EAEAEA] bg-[#FAF8F5]">
              <div className="grid grid-cols-2 gap-3 mb-3">
                <input className={inputCls} placeholder="Nom" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} />
                <input className={inputCls} placeholder="Slug" value={editForm.slug} onChange={e => setEditForm({...editForm, slug: e.target.value})} />
              </div>
              <div className="flex items-center gap-6 mb-3">
                <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest cursor-pointer">
                  <input type="checkbox" checked={!!editForm.is_hot} onChange={e => setEditForm({...editForm, is_hot: e.target.checked})} className="accent-red-500" />
                  <Flame size={12} className="text-red-500" /> Soldes (rouge)
                </label>
                <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest cursor-pointer">
                  <input type="checkbox" checked={!!editForm.is_visible} onChange={e => setEditForm({...editForm, is_visible: e.target.checked})} />
                  <Eye size={12} /> Visible
                </label>
              </div>
              <div className="flex gap-3">
                <button onClick={() => handleSave(cat)} disabled={saving} className="bg-[#111111] text-white px-6 py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-[#333333] disabled:opacity-50">{saving ? 'Sauvegarde...' : 'Sauvegarder'}</button>
                <button onClick={() => setEditId(null)} className="border border-[#EAEAEA] text-[#888888] px-6 py-2 text-[10px] font-bold uppercase tracking-widest hover:border-[#111111] hover:text-[#111111]">Annuler</button>
              </div>
            </div>
          ) : (
            <div key={cat.id} className={`flex items-center justify-between px-5 py-4 border-b border-[#EAEAEA] last:border-0 transition-colors ${!cat.is_visible ? 'opacity-40 bg-gray-50' : 'hover:bg-[#FAF8F5]'}`}>
              <div className="flex items-center gap-3">
                <GripVertical size={16} className="text-[#CCCCCC]" />
                <div>
                  <p className={`text-xs font-bold uppercase tracking-widest ${cat.is_hot ? 'text-red-500' : 'text-[#111111]'}`}>{cat.name}</p>
                  <p className="text-[10px] text-[#AAAAAA]">/collections/{cat.slug}</p>
                </div>
                {cat.is_hot === 1 && <span className="text-[8px] bg-red-50 text-red-500 border border-red-200 px-2 py-0.5 font-bold uppercase tracking-widest">Soldes</span>}
                {cat.is_visible === 0 && <span className="text-[8px] bg-gray-50 text-gray-400 border border-gray-200 px-2 py-0.5 font-bold uppercase tracking-widest">Caché</span>}
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => toggleVisibility(cat)} title={cat.is_visible ? 'Masquer' : 'Afficher'} className="p-2 text-[#888888] hover:text-[#111111] transition-colors">
                  {cat.is_visible ? <Eye size={15} /> : <EyeOff size={15} />}
                </button>
                <button onClick={() => { setEditId(cat.id); setEditForm({ name: cat.name, slug: cat.slug, is_hot: !!cat.is_hot, is_visible: !!cat.is_visible }); }} className="p-2 text-[#888888] hover:text-[#111111] transition-colors"><Pencil size={15} /></button>
                <button onClick={() => handleDelete(cat.id)} disabled={deleting === cat.id} className="p-2 text-[#888888] hover:text-red-500 transition-colors disabled:opacity-40"><Trash2 size={15} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
      <form onSubmit={handleAdd} className="border border-[#EAEAEA] p-5">
        <h3 className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#888888] mb-5">Ajouter une nouvelle section</h3>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <input className={inputCls} placeholder="Nom (ex: Robes)" required value={newForm.name} onChange={e => setNewForm({...newForm, name: e.target.value})} />
          <input className={inputCls} placeholder="Slug auto (laisser vide)" value={newForm.slug} onChange={e => setNewForm({...newForm, slug: e.target.value})} />
        </div>
        <div className="flex items-center gap-6 mb-4">
          <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest cursor-pointer">
            <input type="checkbox" checked={newForm.is_hot} onChange={e => setNewForm({...newForm, is_hot: e.target.checked})} className="accent-red-500" />
            <Flame size={12} className="text-red-500" /> Afficher en rouge (Soldes)
          </label>
        </div>
        <button type="submit" disabled={saving} className="flex items-center gap-2 bg-[#111111] text-white px-6 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-[#333333] disabled:opacity-50">
          <PlusCircle size={14} /> Ajouter la section
        </button>
      </form>
    </div>
  );
}

// ─── Sidebar ─────────────────────────────────────────────
const MENU = [
  { key: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
  { key: 'products', label: 'Produits', icon: Package },
  { key: 'hero', label: 'Hero Carrousel', icon: Image },
  { key: 'categories', label: 'Catégories', icon: Navigation },
  { key: 'orders', label: 'Commandes', icon: ShoppingCart },
  { key: 'reviews', label: 'Avis', icon: Star },
  { key: 'settings', label: 'Paramètres', icon: Settings },
];

// ─── Main Admin ───────────────────────────────────────────────────
export default function Admin() {
  const { user, token, logout } = useAuthStore();
  const navigate = useNavigate();
  const [tab, setTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: 'admin@glamour.ma', password: '' });
  const [loginError, setLoginError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoggingIn(true);
    try {
      const res = await fetch(`${API}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(loginForm) });
      const data = await res.json();
      if (data.token && (data.user.role === 'admin' || data.user.email === 'admin@glamour.ma')) {
        useAuthStore.getState().login(data.user, data.token);
      } else {
        setLoginError('Accès refusé. Administrateurs uniquement.');
      }
    } catch { setLoginError('Erreur de connexion.'); }
    setLoggingIn(false);
  };

  if (!user || !token || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center">
        <div className="bg-white border border-[#E8E1D9] p-10 w-full max-w-sm shadow-sm">
          <div className="flex justify-center mb-6">
            <img src="/logo.png" alt="Chic Glam" className="h-14 w-auto object-contain" />
          </div>
          {loginError && <p className="text-red-500 text-[11px] text-center mb-4 uppercase tracking-widest font-bold">{loginError}</p>}
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <input type="email" placeholder="Email" required value={loginForm.email} onChange={e => setLoginForm({...loginForm, email: e.target.value})}
              className="border border-[#EAEAEA] px-4 py-3 text-[11px] uppercase tracking-widest focus:border-[#111111] outline-none" />
            <input type="password" placeholder="Mot de passe" required value={loginForm.password} onChange={e => setLoginForm({...loginForm, password: e.target.value})}
              className="border border-[#EAEAEA] px-4 py-3 text-[11px] uppercase tracking-widest focus:border-[#111111] outline-none" />
            <button type="submit" disabled={loggingIn} className="bg-[#111111] text-white py-4 text-[11px] font-bold uppercase tracking-widest hover:bg-[#333333] disabled:opacity-50">
              {loggingIn ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>
          <p className="text-[9px] text-center text-[#AAAAAA] mt-6 uppercase tracking-widest">Mot de passe par défaut : admin123</p>
        </div>
      </div>
    );
  }

  const renderTab = () => {
    switch (tab) {
      case 'dashboard': return <DashboardTab token={token} />;
      case 'products': return <ProductsTab token={token} />;
      case 'hero': return <HeroTab token={token} />;
      case 'categories': return <CategoriesTab token={token} />;
      case 'orders': return <OrdersTab token={token} />;
      case 'reviews': return <ReviewsTab token={token} />;
      case 'settings': return <SettingsTab token={token} />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F5F2] flex" style={{ paddingTop: '0' }}>
      {/* Mobile sidebar overlay */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 w-64 bg-[#111111] text-white flex flex-col z-50 transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="p-6 border-b border-white/10 flex flex-col items-start gap-1">
          <img src="/logo.png" alt="Chic Glam" className="h-8 w-auto object-contain brightness-0 invert" />
          <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-[#8D7B68] mt-1">Admin</p>
        </div>
        <nav className="flex-1 py-4 overflow-y-auto">
          {MENU.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => { setTab(key); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-6 py-3.5 text-[11px] font-bold uppercase tracking-widest transition-all text-left
                ${tab === key ? 'bg-white/10 text-white' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
            >
              <Icon size={16} strokeWidth={1.5} /> {label}
            </button>
          ))}
        </nav>
        <div className="p-6 border-t border-white/10">
          <p className="text-[10px] text-white/40 uppercase tracking-widest mb-3">{user.prenom} {user.nom}</p>
          <button onClick={logout} className="flex items-center gap-2 text-[10px] text-red-400 hover:text-red-300 uppercase tracking-widest font-bold">
            <LogOut size={14} /> Déconnexion
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Top bar */}
        <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-[#EAEAEA] flex items-center px-6 h-16">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden mr-4 text-[#111111]"><Menu size={20} /></button>
          <p className="text-[11px] font-bold uppercase tracking-widest text-[#888888]">{MENU.find(m => m.key === tab)?.label}</p>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 lg:p-10 overflow-auto">
          {renderTab()}
        </div>
      </div>
    </div>
  );
}

