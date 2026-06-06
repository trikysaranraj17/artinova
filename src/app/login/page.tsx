'use client';

import React, { useState } from 'react';
import NextLink from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../store/authStore';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const router = useRouter();
  const { login, loginWithGoogle } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      router.push('/profile');
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError(null);
    try {
      await loginWithGoogle();
      router.push('/profile');
    } catch (err: any) {
      setError(err.message || 'Google authentication failed.');
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute w-[400px] h-[400px] bg-[#C9A84C]/5 rounded-full blur-[100px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-[#111111] border border-[#C9A84C]/20 p-8 rounded-lg shadow-2xl relative z-10 flex flex-col gap-6"
      >
        <div className="text-center select-none">
          <NextLink href="/" className="font-display text-3xl font-bold tracking-[0.25em] text-[#F5F0E8] hover:text-[#C9A84C] transition-colors">
            ARTINOVA
          </NextLink>
          <p className="font-accent text-[9px] uppercase tracking-[0.3em] text-[#C9A84C] mt-2">Private Authentication</p>
        </div>

        {error && (
          <span className="text-red-400 text-[10px] font-accent uppercase tracking-wider text-center">{error}</span>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="font-accent text-[9px] uppercase tracking-widest text-[#9A8F7E]">Email Address</label>
            <input 
              type="email" 
              required
              placeholder="e.g. client@luxury.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-transparent border-b border-[#C9A84C]/20 py-2.5 text-xs text-[#F5F0E8] placeholder-[#9A8F7E]/30 focus:border-[#C9A84C] outline-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center">
              <label className="font-accent text-[9px] uppercase tracking-widest text-[#9A8F7E]">Password</label>
              <NextLink href="/forgot-password" className="font-accent text-[8px] uppercase tracking-widest text-[#9A8F7E]/60 hover:text-[#C9A84C]">
                Forgot?
              </NextLink>
            </div>
            <input 
              type="password" 
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-transparent border-b border-[#C9A84C]/20 py-2.5 text-xs text-[#F5F0E8] placeholder-[#9A8F7E]/30 focus:border-[#C9A84C] outline-none"
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-[#C9A84C] text-[#0A0A0A] py-3.5 mt-4 text-[10px] font-accent uppercase tracking-widest font-extrabold hover:bg-[#F5F0E8] transition-all cursor-pointer"
          >
            {loading ? 'Authenticating...' : 'Authenticate'}
          </button>
        </form>

        <div className="flex flex-col items-center gap-4 pt-4 border-t border-[#C9A84C]/10">
          <button 
            type="button" 
            onClick={handleGoogle}
            className="font-accent text-[10px] uppercase tracking-wider text-[#9A8F7E] hover:text-[#F5F0E8] transition-colors cursor-pointer"
          >
            Continue with Google
          </button>
          
          <span className="font-body text-xs text-[#9A8F7E]/50">
            New to Artinova?{' '}
            <NextLink href="/signup" className="text-[#C9A84C] hover:text-[#F5F0E8] font-bold">
              Register
            </NextLink>
          </span>
        </div>
      </motion.div>
    </div>
  );
}
