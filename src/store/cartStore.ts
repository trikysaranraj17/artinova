import { create } from 'zustand';
import { getCart, addToCart, removeFromCart, updateCartQuantity, clearCart, Product } from '../lib/db';

export interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  product?: Product;
  customization?: {
    engravingText?: string;
    variantSize?: string;
    photoUrl?: string;
  };
}

interface CartState {
  items: CartItem[];
  giftNote: string;
  cartDrawerOpen: boolean;
  setCartDrawerOpen: (open: boolean) => void;
  setGiftNote: (note: string) => void;
  fetchCart: (userId: string) => Promise<void>;
  addItem: (userId: string, productId: string, quantity?: number, customization?: any) => Promise<void>;
  updateQty: (userId: string, productId: string, quantity: number) => Promise<void>;
  removeItem: (userId: string, productId: string) => Promise<void>;
  clearCart: (userId: string) => Promise<void>;
  getSubtotal: () => number;
  getGST: () => number;
  getShipping: () => number;
  getTotal: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  giftNote: '',
  cartDrawerOpen: false,
  setCartDrawerOpen: (open) => set({ cartDrawerOpen: open }),
  setGiftNote: (note) => set({ giftNote: note }),

  fetchCart: async (userId) => {
    try {
      const items = await getCart(userId);
      set({ items });
    } catch (err) {
      console.warn('Error fetching cart from database, loading local fallback:', err);
    }
  },

  addItem: async (userId, productId, quantity = 1, customization) => {
    try {
      // Add item through database helper
      await addToCart(userId, productId, quantity);
      
      // If customization is provided, store it locally or update DB if needed.
      // For local storage/fallback:
      if (userId === 'guest' || !userId) {
        const localCart = JSON.parse(localStorage.getItem('artinova_cart') || '[]');
        const idx = localCart.findIndex((item: any) => item.product_id === productId);
        if (idx !== -1 && customization) {
          localCart[idx].customization = { ...localCart[idx].customization, ...customization };
          localStorage.setItem('artinova_cart', JSON.stringify(localCart));
        }
      }
      
      // Reload cart state
      await get().fetchCart(userId);
      set({ cartDrawerOpen: true });
    } catch (err) {
      console.error('Error adding to cart:', err);
    }
  },

  updateQty: async (userId, productId, quantity) => {
    try {
      if (quantity <= 0) {
        await get().removeItem(userId, productId);
      } else {
        await updateCartQuantity(userId, productId, quantity);
        await get().fetchCart(userId);
      }
    } catch (err) {
      console.error('Error updating cart quantity:', err);
    }
  },

  removeItem: async (userId, productId) => {
    try {
      await removeFromCart(userId, productId);
      await get().fetchCart(userId);
    } catch (err) {
      console.error('Error removing cart item:', err);
    }
  },

  clearCart: async (userId) => {
    try {
      await clearCart(userId);
      set({ items: [], giftNote: '' });
    } catch (err) {
      console.error('Error clearing cart:', err);
    }
  },

  getSubtotal: () => {
    return get().items.reduce((sum, item) => {
      const price = item.product?.price || 0;
      return sum + (price * item.quantity);
    }, 0);
  },

  getGST: () => {
    return 0;
  },

  getShipping: () => {
    const subtotal = get().getSubtotal();
    if (subtotal === 0) return 0;
    // Free shipping above ₹999
    return subtotal >= 999 ? 0 : 150;
  },

  getTotal: () => {
    const sub = get().getSubtotal();
    const gst = get().getGST();
    const ship = get().getShipping();
    return Math.round((sub + gst + ship) * 100) / 100;
  }
}));
