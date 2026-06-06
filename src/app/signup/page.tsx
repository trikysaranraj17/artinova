'use client';

import React, { useState } from 'react';
import NextLink from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../store/authStore';
import { motion } from 'framer-motion';

export default function SignupPage() {
  const router = useRouter();
  const { signup } = useAuthStore();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await signup(email, password, fullName, phone, address);
      router.push('/profile');
    } catch (err: any) {
      setError(err.message || 'Failed to create account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center px-6 py-16 relative overflow-hidden">
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
          <p className="font-accent text-[9px] uppercase tracking-[0.3em] text-[#C9A84C] mt-2">Create Patron Registry</p>
        </div>

        {error && (
          <span className="text-red-400 text-[10px] font-accent uppercase tracking-wider text-center">{error}</span>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="font-accent text-[9px] uppercase tracking-widest text-[#9A8F7E]">Full Name</label>
            <input 
              type="text" 
              required
              placeholder="e.g. John Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="bg-transparent border-b border-[#C9A84C]/20 py-2 text-xs text-[#F5F0E8] placeholder-[#9A8F7E]/30 focus:border-[#C9A84C] outline-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-accent text-[9px] uppercase tracking-widest text-[#9A8F7E]">Email Address</label>
            <input 
              type="email" 
              required
              placeholder="e.g. client@luxury.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-transparent border-b border-[#C9A84C]/20 py-2 text-xs text-[#F5F0E8] placeholder-[#9A8F7E]/30 focus:border-[#C9A84C] outline-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-accent text-[9px] uppercase tracking-widest text-[#9A8F7E]">Phone Number</label>
            <input 
              type="tel" 
              required
              placeholder="e.g. +91 98765 43210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="bg-transparent border-b border-[#C9A84C]/20 py-2 text-xs text-[#F5F0E8] placeholder-[#9A8F7E]/30 focus:border-[#C9A84C] outline-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-accent text-[9px] uppercase tracking-widest text-[#9A8F7E]">Shipping Address</label>
            <input 
              type="text" 
              required
              placeholder="Full address coordinates"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="bg-transparent border-b border-[#C9A84C]/20 py-2 text-xs text-[#F5F0E8] placeholder-[#9A8F7E]/30 focus:border-[#C9A84C] outline-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-accent text-[9px] uppercase tracking-widest text-[#9A8F7E]">Password</label>
            <input 
              type="password" 
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-transparent border-b border-[#C9A84C]/20 py-2 text-xs text-[#F5F0E8] placeholder-[#9A8F7E]/30 focus:border-[#C9A84C] outline-none"
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-[#C9A84C] text-[#0A0A0A] py-3.5 mt-4 text-[10px] font-accent uppercase tracking-widest font-extrabold hover:bg-[#F5F0E8] transition-all cursor-pointer"
          >
            {loading ? 'Registering...' : 'Create Account'}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-[#C9A84C]/10">
          <span className="font-body text-xs text-[#9A8F7E]/50">
            Already registered?{' '}
            <NextLink href="/login" className="text-[#C9A84C] hover:text-[#F5F0E8] font-bold">
              Sign In
            </NextLink>
          </span>
        </div>
      </motion.div>
    </div>
  );
}
