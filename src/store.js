import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (product, size, quantity = 1) => set((state) => {
        const color = product.selectedColor || null;
        const existingItem = state.items.find(i => i.id === product.id && i.taille === size && i.selectedColor === color);
        if (existingItem) {
          return {
            items: state.items.map(i => 
              i.id === product.id && i.taille === size && i.selectedColor === color
                ? { ...i, quantite: i.quantite + quantity } 
                : i
            )
          };
        }
        return { items: [...state.items, { ...product, taille: size, selectedColor: color, quantite: quantity }] };
      }),

      removeItem: (productId, size, color) => set((state) => ({
        items: state.items.filter(i => !(i.id === productId && i.taille === size && i.selectedColor === color))
      })),

      updateQuantity: (productId, size, color, quantity) => set((state) => ({
        items: state.items.map(i => 
          i.id === productId && i.taille === size && i.selectedColor === color
            ? { ...i, quantite: quantity } 
            : i
        )
      })),

      clearCart: () => set({ items: [] }),

      cartTotal: () => get().items.reduce((total, item) => total + (item.prix_solde || item.prix) * item.quantite, 0),
      cartCount: () => get().items.reduce((count, item) => count + item.quantite, 0),
    }),
    {
      name: 'glamour-cart',
    }
  )
);

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      login: (user, token) => set({ user, token }),
      logout: () => set({ user: null, token: null }),
    }),
    {
      name: 'glamour-auth',
    }
  )
);

