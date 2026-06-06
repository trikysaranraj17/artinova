import { create } from 'zustand';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  phone?: string;
  address?: string;
  avatar_url?: string;
  isAdmin?: boolean;
}

interface AuthState {
  user: UserProfile | null;
  isAdmin: boolean;
  isGuest: boolean;
  isLoading: boolean;
  loginModalOpen: boolean;
  setLoginModalOpen: (open: boolean) => void;
  initialize: () => Promise<void>;
  login: (email: string, pass: string, adminSecret?: string) => Promise<void>;
  signup: (email: string, pass: string, name: string, phone: string, address: string, adminSecret?: string) => Promise<void>;
  logout: () => Promise<void>;
  continueAsGuest: () => void;
  updateProfile: (profile: Partial<UserProfile>) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAdmin: false,
  isGuest: false,
  isLoading: true,
  loginModalOpen: false,
  setLoginModalOpen: (open) => set({ loginModalOpen: open }),

  initialize: async () => {
    set({ isLoading: true });
    
    // 1. Supabase Check
    if (isSupabaseConfigured) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const u = session.user;
          
          // Fetch additional profile data
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', u.id)
            .single();

          // Check if admin
          const { data: adminData } = await supabase
            .from('admin_users')
            .select('*')
            .eq('user_id', u.id)
            .single();

          const isSystemAdmin = u.email?.toLowerCase() === 'deepaksabari28@gmail.com' || u.email?.toLowerCase() === 'deepaksabari28@gmial.com';

          const userProfile: UserProfile = {
            id: u.id,
            email: u.email || '',
            full_name: profile?.full_name || u.user_metadata?.full_name || '',
            phone: profile?.phone || '',
            avatar_url: profile?.avatar_url || '',
            isAdmin: isSystemAdmin
          };

          set({
            user: userProfile,
            isAdmin: !!isSystemAdmin,
            isGuest: false,
            isLoading: false
          });
          return;
        }
      } catch (err) {
        console.warn('Supabase auth initialization failed, fallback to local storage:', err);
      }
    }

    // 2. Local Storage Check
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('artinova_user');
      const isGuestMode = localStorage.getItem('artinova_guest') === 'true';
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        set({
          user: parsed,
          isAdmin: parsed.email?.toLowerCase() === 'deepaksabari28@gmail.com' || parsed.email?.toLowerCase() === 'deepaksabari28@gmial.com',
          isGuest: false
        });
      } else if (isGuestMode) {
        set({ isGuest: true });
      }
    }
    
    set({ isLoading: false });
  },

  login: async (email, pass, adminSecret) => {
    set({ isLoading: true });
    const lowerEmail = email.toLowerCase().trim();

    try {
      // Direct Admin Credential Check for deepaksabari28@gmail.com
      if ((lowerEmail === 'deepaksabari28@gmail.com' || lowerEmail === 'deepaksabari28@gmial.com') && !isSupabaseConfigured) {
        const adminUser: UserProfile = {
          id: 'usr-deepaksabari',
          email: lowerEmail,
          full_name: 'Deepak Sabari (Admin)',
          phone: '+91 99999 99999',
          address: 'Artinova Studio HQ',
          isAdmin: true
        };
        localStorage.setItem('artinova_user', JSON.stringify(adminUser));
        localStorage.removeItem('artinova_guest');
        set({ user: adminUser, isAdmin: true, isGuest: false, loginModalOpen: false });
        return;
      }

      if (isSupabaseConfigured) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass });
        if (error) throw error;

        if (data.user) {
          const u = data.user;
          const { data: profile } = await supabase.from('profiles').select('*').eq('id', u.id).single();
          const { data: adminData } = await supabase.from('admin_users').select('*').eq('user_id', u.id).single();
          const isSystemAdmin = u.email?.toLowerCase() === 'deepaksabari28@gmail.com' || u.email?.toLowerCase() === 'deepaksabari28@gmial.com';

          const userProfile: UserProfile = {
            id: u.id,
            email: u.email || '',
            full_name: profile?.full_name || '',
            phone: profile?.phone || '',
            avatar_url: profile?.avatar_url || '',
            isAdmin: isSystemAdmin
          };

          set({ user: userProfile, isAdmin: !!isSystemAdmin, isGuest: false, loginModalOpen: false });
        }
      } else {
        // Fallback Database
        const localUsers = JSON.parse(localStorage.getItem('artinova_registered_users') || '[]');
        const existing = localUsers.find((u: any) => u.email.toLowerCase() === lowerEmail);
        
        if (!existing) {
          throw new Error('No account found with this email. Please sign up.');
        }

        const isNewAdmin = lowerEmail === 'deepaksabari28@gmail.com' || lowerEmail === 'deepaksabari28@gmial.com';

        const authenticatedUser: UserProfile = {
          id: existing.id,
          email: existing.email,
          full_name: existing.full_name,
          phone: existing.phone,
          address: existing.address,
          isAdmin: isNewAdmin
        };

        localStorage.setItem('artinova_user', JSON.stringify(authenticatedUser));
        localStorage.removeItem('artinova_guest');
        set({ user: authenticatedUser, isAdmin: isNewAdmin, isGuest: false, loginModalOpen: false });
      }
    } catch (err: any) {
      console.error(err);
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  signup: async (email, pass, name, phone, address, adminSecret) => {
    set({ isLoading: true });
    const lowerEmail = email.toLowerCase().trim();

    try {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase.auth.signUp({ email, password: pass });
        if (error) throw error;

        if (data.user) {
          const u = data.user;
          // Create user profile
          const { error: profileErr } = await supabase.from('profiles').insert({
            id: u.id,
            full_name: name,
            phone: phone
          });
          if (profileErr) console.error('Error creating profile metadata:', profileErr);

          const isNewAdmin = lowerEmail === 'deepaksabari28@gmail.com' || lowerEmail === 'deepaksabari28@gmial.com';

          const userProfile: UserProfile = {
            id: u.id,
            email: lowerEmail,
            full_name: name,
            phone: phone,
            isAdmin: isNewAdmin
          };

          set({ user: userProfile, isAdmin: isNewAdmin, isGuest: false, loginModalOpen: false });
        }
      } else {
        const localUsers = JSON.parse(localStorage.getItem('artinova_registered_users') || '[]');
        const exists = localUsers.some((u: any) => u.email.toLowerCase() === lowerEmail);
        if (exists) {
          throw new Error('An account already exists with this email address.');
        }

        const isNewAdmin = lowerEmail === 'deepaksabari28@gmail.com' || lowerEmail === 'deepaksabari28@gmial.com';

        const newUser = {
          id: `usr-${Date.now()}`,
          email: lowerEmail,
          full_name: name,
          phone: phone,
          address: address,
          isAdmin: isNewAdmin
        };

        localUsers.push(newUser);
        localStorage.setItem('artinova_registered_users', JSON.stringify(localUsers));
        localStorage.setItem('artinova_user', JSON.stringify(newUser));
        localStorage.removeItem('artinova_guest');
        
        set({ user: newUser, isAdmin: isNewAdmin, isGuest: false, loginModalOpen: false });
      }
    } catch (err: any) {
      console.error(err);
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    set({ isLoading: true });
    if (isSupabaseConfigured) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.warn('Supabase logout issue:', err);
      }
    }
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem('artinova_user');
      localStorage.removeItem('artinova_guest');
    }

    set({ user: null, isAdmin: false, isGuest: false, isLoading: false });
  },

  continueAsGuest: () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('artinova_guest', 'true');
      localStorage.removeItem('artinova_user');
    }
    set({ user: null, isAdmin: false, isGuest: true, loginModalOpen: false });
  },

  updateProfile: async (profile) => {
    const state = get();
    if (!state.user) throw new Error('No authenticated user profile loaded.');

    const updatedUser = { ...state.user, ...profile };

    if (isSupabaseConfigured) {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profile.full_name,
          phone: profile.phone,
          avatar_url: profile.avatar_url
        })
        .eq('id', state.user.id);
      if (error) throw error;
    } else {
      if (typeof window !== 'undefined') {
        localStorage.setItem('artinova_user', JSON.stringify(updatedUser));
        // Also update in registered list
        const localUsers = JSON.parse(localStorage.getItem('artinova_registered_users') || '[]');
        const idx = localUsers.findIndex((u: any) => u.id === state.user?.id);
        if (idx !== -1) {
          localUsers[idx] = { ...localUsers[idx], ...profile };
          localStorage.setItem('artinova_registered_users', JSON.stringify(localUsers));
        }
      }
    }

    set({ user: updatedUser });
  },

  loginWithGoogle: async () => {
    set({ isLoading: true });
    try {
      if (isSupabaseConfigured) {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: typeof window !== 'undefined' ? `${window.location.origin}` : undefined,
          },
        });
        if (error) throw error;
      } else {
        // Mock prompt
        if (typeof window === 'undefined') return;
        const emailInput = window.prompt(
          "Artinova Google Auth System\n\nEnter your Google email to authenticate:", 
          "deepaksabari28@gmail.com"
        );
        if (emailInput === null) return;
        const email = emailInput.trim() || 'google-client@luxury.com';
        const isSpecialAdmin = email.toLowerCase() === 'deepaksabari28@gmail.com' || email.toLowerCase() === 'deepaksabari28@gmial.com';
        
        const mockGoogleUser = {
          id: isSpecialAdmin ? 'usr-deepaksabari' : 'usr-google-' + Date.now(),
          email: email,
          full_name: isSpecialAdmin ? 'Deepak Sabari (Admin)' : 'Bespoke Patron (Google)',
          phone: '+91 99999 99999',
          address: 'Artinova studio HQ',
          isAdmin: isSpecialAdmin
        };
        
        localStorage.setItem('artinova_user', JSON.stringify(mockGoogleUser));
        localStorage.removeItem('artinova_guest');
        set({ user: mockGoogleUser, isAdmin: isSpecialAdmin, isGuest: false, loginModalOpen: false });
      }
    } catch (err) {
      console.error(err);
      throw err;
    } finally {
      set({ isLoading: false });
    }
  }
}));
