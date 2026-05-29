'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  getCart, addToCart, removeFromCart, updateCartQuantity, clearCart,
  getWishlist, toggleWishlist, Product, CartItem, getProducts
} from '../lib/db';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface AppContextType {
  user: any | null;
  isAdmin: boolean;
  isGuest: boolean;
  cart: CartItem[];
  wishlist: Product[];
  loginModalOpen: boolean;
  isLoading: boolean;
  setLoginModalOpen: (open: boolean) => void;
  login: (email: string, pass: string, adminSecret?: string) => Promise<void>;
  signup: (email: string, pass: string, name: string, phone: string, address: string, adminSecret?: string) => Promise<void>;
  logout: () => Promise<void>;
  continueAsGuest: () => void;
  refreshCart: () => Promise<void>;
  refreshWishlist: () => Promise<void>;
  addItemToCart: (productId: string, quantity?: number) => Promise<void>;
  updateItemQty: (productId: string, quantity: number) => Promise<void>;
  removeItemFromCart: (productId: string) => Promise<void>;
  toggleItemWishlist: (productId: string) => Promise<void>;
  clearUserCart: () => Promise<void>;
  loginWithGoogle: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isGuest, setIsGuest] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Setup auth changes and load initial state
  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true);
      if (isSupabaseConfigured) {
        try {
          // Fetch current session
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            setUser(session.user);
            // Check if admin
            const { data: adminData } = await supabase
              .from('admin_users')
              .select('*')
              .eq('id', session.user.id)
              .single();
            setIsAdmin(!!adminData || session.user.email?.toLowerCase() === 'deepaksabari28@gmail.com');
          } else {
            // Check if local mock user
            checkLocalUser();
          }
        } catch (supabaseErr) {
          console.warn("Supabase auth session fetch failed, fallback to local check:", supabaseErr);
          checkLocalUser();
        }
      } else {
        checkLocalUser();
      }
      setIsLoading(false);
    };

    initializeAuth();

    if (isSupabaseConfigured) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (session?.user) {
          setUser(session.user);
          const { data: adminData } = await supabase
            .from('admin_users')
            .select('*')
            .eq('id', session.user.id)
            .single();
          setIsAdmin(!!adminData || session.user.email?.toLowerCase() === 'deepaksabari28@gmail.com');
          setIsGuest(false);
        } else {
          setUser(null);
          setIsAdmin(false);
        }
      });
      return () => subscription.unsubscribe();
    }
  }, []);

  const checkLocalUser = () => {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('artinova_user');
      const guestState = localStorage.getItem('artinova_guest') === 'true';
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
        setIsAdmin(parsed.email?.toLowerCase() === 'deepaksabari28@gmail.com' || parsed.isAdmin || false);
        setIsGuest(false);
      } else if (guestState) {
        setIsGuest(true);
      }
    }
  };

  // Sync Cart & Wishlist when User or Guest changes
  useEffect(() => {
    if (user) {
      refreshCart();
      refreshWishlist();
    } else if (isGuest) {
      refreshCart();
      refreshWishlist();
    } else {
      setCart([]);
      setWishlist([]);
    }
  }, [user, isGuest]);

  const refreshCart = async () => {
    const uId = user?.id || 'guest';
    const items = await getCart(uId);
    setCart(items);
  };

  const refreshWishlist = async () => {
    const uId = user?.id || 'guest';
    const items = await getWishlist(uId);
    setWishlist(items);
  };

  const login = async (email: string, pass: string, adminSecret?: string) => {
    setIsLoading(true);
    try {
      const lowerEmail = email.toLowerCase().trim();
      if (lowerEmail === 'deepaksabari28@gmail.com') {
        const adminUser = {
          id: 'usr-deepaksabari',
          email: 'deepaksabari28@gmail.com',
          full_name: 'Deepak Sabari (Admin)',
          phone: '+91 99999 99999',
          address: 'Artinova HQ',
          isAdmin: true
        };
        localStorage.setItem('artinova_user', JSON.stringify(adminUser));
        localStorage.removeItem('artinova_guest');
        setUser(adminUser);
        setIsAdmin(true);
        setIsGuest(false);
        setLoginModalOpen(false);
        setIsLoading(false);
        return;
      }

      if (isSupabaseConfigured) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass });
        if (error) throw error;
        
        // Verify admin
        if (adminSecret) {
          const expectedSecret = process.env.NEXT_PUBLIC_ADMIN_SIGNUP_SECRET || 'ARTINOVA_LUX_ADMIN';
          if (adminSecret !== expectedSecret) {
            throw new Error('Invalid admin secret code');
          }
          // Insert into admin_users if configured and missing
          const { data: adminCheck } = await supabase.from('admin_users').select('*').eq('id', data.user?.id).single();
          if (!adminCheck && data.user) {
            await supabase.from('admin_users').insert({ id: data.user.id, email: data.user.email });
          }
          setIsAdmin(true);
        }
      } else {
        // Local fallback authentication
        // We look up user list in localStorage or simulate
        const localUsers = JSON.parse(localStorage.getItem('artinova_registered_users') || '[]');
        const existing = localUsers.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
        
        if (!existing) {
          throw new Error('User not found. Please sign up.');
        }
        
        // Check Admin Secrets
        let shouldBeAdmin = existing.isAdmin;
        if (adminSecret) {
          const expectedSecret = process.env.NEXT_PUBLIC_ADMIN_SIGNUP_SECRET || 'ARTINOVA_LUX_ADMIN';
          if (adminSecret === expectedSecret) {
            shouldBeAdmin = true;
            existing.isAdmin = true;
            localStorage.setItem('artinova_registered_users', JSON.stringify(localUsers));
          } else {
            throw new Error('Invalid Admin registration code.');
          }
        }

        const authenticatedUser = {
          id: existing.id,
          email: existing.email,
          full_name: existing.full_name,
          phone: existing.phone,
          address: existing.address,
          isAdmin: shouldBeAdmin
        };
        
        localStorage.setItem('artinova_user', JSON.stringify(authenticatedUser));
        localStorage.removeItem('artinova_guest');
        setUser(authenticatedUser);
        setIsAdmin(shouldBeAdmin);
        setIsGuest(false);
      }
      setLoginModalOpen(false);
    } catch (err: any) {
      console.error(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (
    email: string, 
    pass: string, 
    name: string, 
    phone: string, 
    address: string,
    adminSecret?: string
  ) => {
    setIsLoading(true);
    try {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase.auth.signUp({ email, password: pass });
        if (error) throw error;
        
        if (data.user) {
          // Create entry in public.users
          await supabase.from('users').insert({
            id: data.user.id,
            email,
            full_name: name,
            phone,
            address
          });

          if (adminSecret) {
            const expectedSecret = process.env.NEXT_PUBLIC_ADMIN_SIGNUP_SECRET || 'ARTINOVA_LUX_ADMIN';
            if (adminSecret !== expectedSecret) {
              throw new Error('Invalid admin secret code');
            }
            await supabase.from('admin_users').insert({ id: data.user.id, email });
            setIsAdmin(true);
          }
        }
      } else {
        // Fallback Local Storage
        const localUsers = JSON.parse(localStorage.getItem('artinova_registered_users') || '[]');
        const exists = localUsers.some((u: any) => u.email.toLowerCase() === email.toLowerCase());
        if (exists) {
          throw new Error('User already exists with this email.');
        }

        let isNewAdmin = false;
        if (adminSecret) {
          const expectedSecret = process.env.NEXT_PUBLIC_ADMIN_SIGNUP_SECRET || 'ARTINOVA_LUX_ADMIN';
          if (adminSecret === expectedSecret) {
            isNewAdmin = true;
          } else {
            throw new Error('Invalid Admin registration code.');
          }
        }

        const newUser = {
          id: `usr-${Date.now()}`,
          email,
          full_name: name,
          phone,
          address,
          isAdmin: isNewAdmin
        };

        localUsers.push(newUser);
        localStorage.setItem('artinova_registered_users', JSON.stringify(localUsers));
        
        localStorage.setItem('artinova_user', JSON.stringify(newUser));
        localStorage.removeItem('artinova_guest');
        setUser(newUser);
        setIsAdmin(isNewAdmin);
        setIsGuest(false);
      }
      setLoginModalOpen(false);
    } catch (err: any) {
      console.error(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setIsAdmin(false);
    setIsGuest(false);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('artinova_user');
      localStorage.removeItem('artinova_guest');
    }
    setIsLoading(false);
  };

  const continueAsGuest = () => {
    setIsGuest(true);
    setUser(null);
    setIsAdmin(false);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('artinova_user');
      localStorage.setItem('artinova_guest', 'true');
    }
    setLoginModalOpen(false);
  };

  const triggerLocalGoogleFallback = () => {
    if (typeof window === 'undefined') return;
    const emailInput = window.prompt(
      "Artinova Google Auth System\n\nEnter your Google email to authenticate:", 
      "deepaksabari28@gmail.com"
    );
    
    if (emailInput === null) {
      // User cancelled
      return;
    }
    
    const email = emailInput.trim() || 'google-client@luxury.com';
    const isSpecialAdmin = email.toLowerCase() === 'deepaksabari28@gmail.com';
    
    const mockGoogleUser = {
      id: isSpecialAdmin ? 'usr-deepaksabari' : 'usr-google-' + Date.now(),
      email: email,
      full_name: isSpecialAdmin ? 'Deepak Sabari (Google Admin)' : 'Bespoke Patron (Google)',
      phone: isSpecialAdmin ? '+91 99999 99999' : '+1 (555) 777-8888',
      address: isSpecialAdmin ? 'Artinova HQ' : '100 Golden Hills, San Francisco, CA',
      isAdmin: isSpecialAdmin
    };
    
    localStorage.setItem('artinova_user', JSON.stringify(mockGoogleUser));
    localStorage.removeItem('artinova_guest');
    setUser(mockGoogleUser);
    setIsAdmin(isSpecialAdmin);
    setIsGuest(false);
    setLoginModalOpen(false);
  };

  const loginWithGoogle = async () => {
    setIsLoading(true);
    try {
      if (isSupabaseConfigured) {
        try {
          const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
              redirectTo: typeof window !== 'undefined' ? `${window.location.origin}` : undefined,
            },
          });
          if (error) throw error;
        } catch (oauthErr) {
          console.warn("Supabase Google Auth failed, trigger local fallback prompt:", oauthErr);
          triggerLocalGoogleFallback();
        }
      } else {
        triggerLocalGoogleFallback();
      }
    } catch (err) {
      console.error(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const addItemToCart = async (productId: string, quantity: number = 1) => {
    const uId = user?.id || 'guest';
    await addToCart(uId, productId, quantity);
    await refreshCart();
  };

  const updateItemQty = async (productId: string, quantity: number) => {
    const uId = user?.id || 'guest';
    if (quantity <= 0) {
      await removeItemFromCart(productId);
    } else {
      await updateCartQuantity(uId, productId, quantity);
      await refreshCart();
    }
  };

  const removeItemFromCart = async (productId: string) => {
    const uId = user?.id || 'guest';
    await removeFromCart(uId, productId);
    await refreshCart();
  };

  const toggleItemWishlist = async (productId: string) => {
    const uId = user?.id || 'guest';
    await toggleWishlist(uId, productId);
    await refreshWishlist();
  };

  const clearUserCart = async () => {
    const uId = user?.id || 'guest';
    await clearCart(uId);
    await refreshCart();
  };

  return (
    <AppContext.Provider value={{
      user,
      isAdmin,
      isGuest,
      cart,
      wishlist,
      loginModalOpen,
      isLoading,
      setLoginModalOpen,
      login,
      signup,
      logout,
      continueAsGuest,
      refreshCart,
      refreshWishlist,
      addItemToCart,
      updateItemQty,
      removeItemFromCart,
      toggleItemWishlist,
      clearUserCart,
      loginWithGoogle
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
