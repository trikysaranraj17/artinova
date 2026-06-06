'use client';

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { X, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function LoginModal() {
  const { user, isGuest, loginModalOpen, setLoginModalOpen, login, signup, continueAsGuest, loginWithGoogle } = useAuthStore();
  const [isSignUp, setIsSignUp] = useState(false);
  const [isAdminSignUp, setIsAdminSignUp] = useState(false);
  
  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [adminSecret, setAdminSecret] = useState('');
  
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!user && !isGuest) {
        setLoginModalOpen(true);
      }
    }, 1500);
    return () => clearTimeout(timer);
  }, [user, isGuest, setLoginModalOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setFormLoading(true);

    if (isSignUp) {
      try {
        await signup(email, password, fullName, phone, address);
        setSuccessMsg('Account created successfully.');
      } catch (err: any) {
        setError(err.message || 'Failed to sign up.');
      }
    } else {
      try {
        await login(email, password);
        setSuccessMsg('Welcome to Artinova.');
      } catch (err: any) {
        setError(err.message || 'Authentication failed.');
      }
    }
    setFormLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setFormLoading(true);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      setError(err.message || 'Google authorization failed.');
    } finally {
      setFormLoading(false);
    }
  };

  const clearForm = () => {
    setEmail('');
    setPassword('');
    setFullName('');
    setPhone('');
    setAddress('');
    setAdminSecret('');
    setError(null);
    setSuccessMsg(null);
  };

  const InputField = ({ label, type, value, onChange, placeholder, required = true }: any) => (
    <div className="flex flex-col mb-4">
      <label className="font-accent text-[9px] uppercase tracking-widest text-[#9A8F7E] mb-1">{label}</label>
      <input
        type={type}
        required={required}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full bg-transparent border-b border-[#C9A84C]/20 py-2 text-sm font-body text-white placeholder-[#9A8F7E]/30 focus:outline-none focus:border-[#C9A84C] transition-colors"
      />
    </div>
  );

  return (
    <AnimatePresence>
      {loginModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLoginModalOpen(false)}
            className="absolute inset-0 bg-[#0A0A0A]/95 backdrop-blur-md cursor-pointer"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 10 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-md bg-[#111111] border border-[#C9A84C]/20 relative flex flex-col max-h-[90vh]"
          >
            <button
              onClick={() => setLoginModalOpen(false)}
              className="absolute top-5 right-5 text-[#9A8F7E] hover:text-[#F5F0E8] transition-colors z-10 cursor-pointer"
            >
              <X size={18} strokeWidth={1.5} />
            </button>

            <div className="flex flex-col items-center pt-10 pb-6 select-none border-b border-[#C9A84C]/10">
              <h2 className="font-display text-2xl tracking-[0.3em] text-[#F5F0E8] font-bold">ARTINOVA</h2>
              <span className="font-accent text-[8px] uppercase tracking-[0.4em] text-[#C9A84C] mt-1">
                Private Access
              </span>
            </div>

            <div className="flex justify-center border-b border-[#C9A84C]/10">
              <button
                onClick={() => { setIsSignUp(false); clearForm(); }}
                className={`flex-1 py-4 text-[9px] uppercase tracking-[0.2em] transition-colors cursor-pointer ${!isSignUp ? 'text-[#C9A84C] border-b-2 border-[#C9A84C] font-bold' : 'text-[#9A8F7E] hover:text-[#F5F0E8]'}`}
              >
                Sign In
              </button>
              <button
                onClick={() => { setIsSignUp(true); clearForm(); }}
                className={`flex-1 py-4 text-[9px] uppercase tracking-[0.2em] transition-colors cursor-pointer ${isSignUp ? 'text-[#C9A84C] border-b-2 border-[#C9A84C] font-bold' : 'text-[#9A8F7E] hover:text-[#F5F0E8]'}`}
              >
                Register
              </button>
            </div>

            <div className="flex-grow overflow-y-auto custom-scrollbar p-8">
              <AnimatePresence mode="wait">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="text-red-400 text-[10px] font-accent uppercase tracking-wider mb-6 text-center"
                  >
                    {error}
                  </motion.div>
                )}
                {successMsg && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="text-[#C9A84C] text-[10px] font-accent uppercase tracking-wider mb-6 text-center"
                  >
                    {successMsg}
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleSubmit} className="flex flex-col">
                {isSignUp ? (
                  <>
                    <InputField label="Full Name" type="text" value={fullName} onChange={(e: any) => setFullName(e.target.value)} placeholder="e.g. John Doe" />
                    <InputField label="Email Address" type="email" value={email} onChange={(e: any) => setEmail(e.target.value)} placeholder="john@example.com" />
                    <InputField label="Phone Number" type="tel" value={phone} onChange={(e: any) => setPhone(e.target.value)} placeholder="+91 98765 43210" />
                    <InputField label="Password" type="password" value={password} onChange={(e: any) => setPassword(e.target.value)} placeholder="••••••••" />
                  </>
                ) : (
                  <>
                    <InputField label="Email Address" type="email" value={email} onChange={(e: any) => setEmail(e.target.value)} placeholder="john@example.com" />
                    <InputField label="Password" type="password" value={password} onChange={(e: any) => setPassword(e.target.value)} placeholder="••••••••" />
                  </>
                )}



                <button
                  type="submit"
                  disabled={formLoading}
                  className="w-full bg-[#C9A84C] text-[#0A0A0A] py-4 text-[10px] font-accent uppercase tracking-[0.25em] font-extrabold hover:bg-[#F5F0E8] transition-colors mt-2 cursor-pointer"
                >
                  {formLoading ? 'Authenticating...' : isSignUp ? 'Create Account' : 'Authenticate'}
                </button>
              </form>

              <div className="flex flex-col items-center mt-8 gap-4 border-t border-[#C9A84C]/10 pt-6">
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={formLoading}
                  className="font-accent text-[10px] uppercase tracking-wider text-[#9A8F7E] hover:text-[#F5F0E8] transition-colors flex items-center gap-2 cursor-pointer"
                >
                  Continue with Google
                </button>
                <button
                  type="button"
                  onClick={continueAsGuest}
                  className="font-accent text-[9px] uppercase tracking-widest text-[#9A8F7E]/50 hover:text-[#C9A84C] transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  Browse as Guest <ArrowRight size={10} />
                </button>
              </div>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
