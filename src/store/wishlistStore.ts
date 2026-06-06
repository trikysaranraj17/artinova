import { create } from 'zustand';
import { getWishlist, toggleWishlist, Product } from '../lib/db';

interface WishlistState {
  items: Product[];
  fetchWishlist: (userId: string) => Promise<void>;
  toggleItem: (userId: string, productId: string) => Promise<void>;
  hasItem: (productId: string) => boolean;
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
  items: [],

  fetchWishlist: async (userId) => {
    try {
      const items = await getWishlist(userId);
      set({ items });
    } catch (err) {
      console.warn('Error loading wishlist, loading local fallback:', err);
    }
  },

  toggleItem: async (userId, productId) => {
    try {
      await toggleWishlist(userId, productId);
      await get().fetchWishlist(userId);
    } catch (err) {
      console.error('Error toggling wishlist item:', err);
    }
  },

  hasItem: (productId) => {
    return get().items.some(item => item.id === productId);
  }
}));
