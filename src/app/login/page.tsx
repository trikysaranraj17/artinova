'use client';

import React, { useState } from 'react';
import NextLink from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../store/authStore';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const router = useRouter();
  const { login, signup, loginWithGoogle } = useAuthStore();
  
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    
    try {
      if (isSignUp) {
        await signup(email, password, fullName, phone, '');
        setSuccess('Account created successfully! You can now sign in.');
        setIsSignUp(false);
        setPassword('');
      } else {
        await login(email, password);
        router.push('/profile');
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check details.');
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
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center px-6 py-20 relative overflow-hidden select-none">
      {/* Background glow */}
      <div className="absolute w-[500px] h-[500px] bg-[#C9A84C]/5 rounded-full blur-[120px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-[#111111] border border-[#C9A84C]/20 rounded-lg shadow-2xl relative z-10 flex flex-col overflow-hidden"
      >
        {/* Logo Header */}
        <div className="flex flex-col items-center pt-8 pb-4 border-b border-[#C9A84C]/10 bg-[#0A0A0A]/50">
          <NextLink href="/" className="group mb-2">
            <img 
              src="/logo.jpg" 
              alt="ARTINOVA Logo" 
              className="h-16 w-auto object-contain border border-[#C9A84C]/25 rounded transition-transform duration-500 group-hover:scale-105" 
            />
          </NextLink>
          <span className="font-accent text-[9px] uppercase tracking-[0.3em] text-[#C9A84C]">Private Authenticator</span>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-[#C9A84C]/10 text-center">
          <button
            type="button"
            onClick={() => { setIsSignUp(false); setError(null); setSuccess(null); }}
            className={`flex-1 py-3.5 font-accent text-[10px] uppercase tracking-wider transition-colors cursor-pointer ${!isSignUp ? 'text-[#C9A84C] border-b-2 border-[#C9A84C] font-bold bg-[#0A0A0A]/20' : 'text-[#9A8F7E] hover:text-[#F5F0E8]'}`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setIsSignUp(true); setError(null); setSuccess(null); }}
            className={`flex-1 py-3.5 font-accent text-[10px] uppercase tracking-wider transition-colors cursor-pointer ${isSignUp ? 'text-[#C9A84C] border-b-2 border-[#C9A84C] font-bold bg-[#0A0A0A]/20' : 'text-[#9A8F7E] hover:text-[#F5F0E8]'}`}
          >
            Register
          </button>
        </div>

        <div className="p-8 flex flex-col gap-5">
          {error && (
            <div className="text-red-400 text-[10px] font-accent uppercase tracking-wider text-center border border-red-500/20 bg-red-950/5 py-2 rounded">
              {error}
            </div>
          )}

          {success && (
            <div className="text-[#C9A84C] text-[10px] font-accent uppercase tracking-wider text-center border border-[#C9A84C]/35 bg-[#C9A84C]/5 py-2 rounded">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {isSignUp && (
              <>
                <div className="flex flex-col gap-1">
                  <label className="font-accent text-[9px] uppercase tracking-widest text-[#9A8F7E]">Full Name</label>
                  <input 
                    type="text" 
                    required
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="bg-transparent border-b border-[#C9A84C]/25 py-2 text-xs text-[#F5F0E8] placeholder-[#9A8F7E]/30 focus:border-[#C9A84C] outline-none transition-colors"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-accent text-[9px] uppercase tracking-widest text-[#9A8F7E]">Phone Number</label>
                  <input 
                    type="tel" 
                    required
                    placeholder="+91 99999 99999"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="bg-transparent border-b border-[#C9A84C]/25 py-2 text-xs text-[#F5F0E8] placeholder-[#9A8F7E]/30 focus:border-[#C9A84C] outline-none transition-colors"
                  />
                </div>
              </>
            )}

            <div className="flex flex-col gap-1">
              <label className="font-accent text-[9px] uppercase tracking-widest text-[#9A8F7E]">Email Address</label>
              <input 
                type="email" 
                required
                placeholder="client@luxury.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-transparent border-b border-[#C9A84C]/25 py-2 text-xs text-[#F5F0E8] placeholder-[#9A8F7E]/30 focus:border-[#C9A84C] outline-none transition-colors"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-accent text-[9px] uppercase tracking-widest text-[#9A8F7E]">Password</label>
              <input 
                type="password" 
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-transparent border-b border-[#C9A84C]/25 py-2 text-xs text-[#F5F0E8] placeholder-[#9A8F7E]/30 focus:border-[#C9A84C] outline-none transition-colors"
              />
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-[#C9A84C] text-[#0A0A0A] py-3.5 mt-4 text-[10px] font-accent uppercase tracking-widest font-extrabold hover:bg-[#F5F0E8] hover:text-[#0A0A0A] transition-all cursor-pointer shadow-lg animate-button-glow"
            >
              {loading ? 'Authenticating...' : isSignUp ? 'Register Account' : 'Authenticate'}
            </button>
          </form>

          <div className="flex flex-col items-center gap-2 pt-4 border-t border-[#C9A84C]/10 mt-2">
            <button 
              type="button" 
              onClick={handleGoogle}
              className="w-full py-2.5 border border-[#C9A84C]/30 hover:border-[#C9A84C] text-[#C9A84C] rounded text-[9px] font-accent uppercase tracking-wider transition-colors cursor-pointer bg-[#C9A84C]/5 font-bold"
            >
              Continue with Google
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
