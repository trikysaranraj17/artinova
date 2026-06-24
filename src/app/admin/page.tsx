'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import NextLink from 'next/link';
import { useAuthStore } from '../../store/authStore';
import { Lock, LogOut, ArrowLeft, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminPage() {
  const router = useRouter();
  const { user, isAdmin, loginWithGoogle, logout, isLoading } = useAuthStore();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && !isLoading && user && isAdmin) {
      router.push('/admin-secure-dashboard');
    }
  }, [user, isAdmin, isLoading, isMounted, router]);

  const handleGoogle = async () => {
    setError(null);
    setLoading(true);
    try {
      await loginWithGoogle(window.location.origin + '/admin');
    } catch (err: any) {
      setError(err.message || 'Google authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  if (!isMounted) return null;


  // Access Denied Wall if logged in but NOT an admin
  if (user && !isAdmin) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] text-[#F5F0E8] flex flex-col items-center justify-center p-6 relative overflow-hidden font-body select-none">
        {/* Golden backdrop glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full bg-red-500/5 blur-[90px] pointer-events-none" />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-[#111111] border border-red-500/20 rounded-xl p-8 flex flex-col items-center text-center shadow-2xl relative"
        >
          <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 mb-6">
            <ShieldAlert size={28} />
          </div>

          <h2 className="font-accent text-lg font-bold tracking-widest text-red-400 mb-2 uppercase">
            Access Denied
          </h2>
          <p className="text-xs text-[#9A8F7E] leading-relaxed mb-6 max-w-xs">
            The email address <span className="font-semibold text-[#F5F0E8] break-all">{user.email}</span> is not registered as an administrator.
          </p>

          <div className="flex flex-col gap-3.5 w-full">
            <button
              onClick={logout}
              className="w-full bg-red-950 border border-red-500/25 hover:border-red-400 text-red-400 hover:text-red-300 py-3.5 px-6 rounded font-accent text-[10px] font-bold uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogOut size={13} /> Sign Out / Switch Account
            </button>
            
            <NextLink
              href="/"
              className="w-full border border-[#C9A84C]/35 hover:border-[#C9A84C] text-[#C9A84C] hover:bg-[#C9A84C]/5 py-3 rounded text-[9px] font-accent uppercase tracking-widest transition-colors flex items-center justify-center gap-1.5 cursor-pointer font-bold"
            >
              <ArrowLeft size={10} /> Back to Shop
            </NextLink>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070913] flex flex-col items-center justify-center px-6 py-20 relative overflow-hidden select-none font-body">
      {/* Background glow matching the screenshot's dark blue/purple ambient style */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-950/15 rounded-full blur-[140px] pointer-events-none" />

      {/* Top logo/header display similar to the screenshot */}
      <div className="absolute top-6 left-6 flex items-center gap-3">
        <NextLink href="/" className="flex items-center">
          <img 
            src="/logo.jpg" 
            alt="ARTINOVA Logo" 
            className="h-10 w-auto object-contain border border-[#C9A84C]/10 rounded-sm" 
          />
        </NextLink>
        <div className="flex flex-col leading-none">
          <span className="font-accent text-[10px] text-[#C9A84C] uppercase tracking-wider font-bold">ARTINOVA</span>
          <span className="font-body text-[8px] text-[#9A8F7E] uppercase tracking-widest mt-1">Admin Portal</span>
        </div>
      </div>

      <div className="absolute top-6 right-6 hidden sm:flex">
        <div className="border border-[#C9A84C]/25 bg-[#C9A84C]/5 px-3.5 py-1.5 rounded text-[8px] font-accent uppercase tracking-wider text-[#C9A84C] font-bold">
          ADMINISTRATION MODE
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-[#0e1122]/90 border border-slate-800/80 rounded-2xl shadow-[0_0_50px_0_rgba(0,0,0,0.8)] relative z-10 flex flex-col overflow-hidden p-8 md:p-12 items-center text-center"
      >
        {/* Lock and Key Icon Block */}
        <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-700/60 flex items-center justify-center text-[#C9A84C] mb-8 shadow-inner relative">
          <Lock size={22} className="stroke-[1.5]" />
          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#C9A84C] text-[#0A0A0A] flex items-center justify-center font-bold text-[8px]">
            ✓
          </div>
        </div>

        <h2 className="font-display text-2xl md:text-3xl text-white font-bold tracking-wide mb-2">
          Admin Portal
        </h2>
        
        <p className="text-xs text-[#9A8F7E] leading-relaxed mb-10 max-w-[260px]">
          Sign in with your admin credentials.
        </p>

        {error && (
          <div className="w-full text-red-400 text-[10px] font-accent uppercase tracking-wider text-center border border-red-500/20 bg-red-950/5 py-2.5 rounded mb-6">
            {error}
          </div>
        )}

        <button 
          onClick={handleGoogle}
          disabled={loading}
          className="w-full py-3.5 bg-white text-black hover:bg-slate-200 rounded-lg font-sans text-[12px] font-bold tracking-wide transition-all duration-300 flex items-center justify-center gap-3 cursor-pointer shadow-md select-none"
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" className="shrink-0">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          {loading ? 'Signing In...' : 'Sign in with Google'}
        </button>

        <NextLink
          href="/"
          className="mt-8 text-[10px] font-accent uppercase tracking-widest text-[#9A8F7E]/60 hover:text-[#C9A84C] transition-colors flex items-center gap-1.5 cursor-pointer font-bold"
        >
          <ArrowLeft size={10} /> Back to Shop
        </NextLink>
      </motion.div>
    </div>
  );
}
