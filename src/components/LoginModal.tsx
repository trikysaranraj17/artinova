'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { X, Mail, Lock, User, Phone, MapPin, Eye, EyeOff, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const GoogleLogo = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" className="shrink-0 mr-2.5">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      fill="#EA4335"
    />
  </svg>
);

export default function LoginModal() {
  const { user, isGuest, loginModalOpen, setLoginModalOpen, login, signup, continueAsGuest, loginWithGoogle } = useApp();
  const [isSignUp, setIsSignUp] = useState(false);
  const [isAdminSignUp, setIsAdminSignUp] = useState(false);
  
  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [adminSecret, setAdminSecret] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  // Trigger modal on page load if user is not logged in and not guest
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
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        setFormLoading(false);
        return;
      }
      if (isAdminSignUp && !adminSecret) {
        setError('Admin authorization secret code is required.');
        setFormLoading(false);
        return;
      }
      try {
        await signup(email, password, fullName, phone, address, isAdminSignUp ? adminSecret : undefined);
        setSuccessMsg('Account created successfully!');
      } catch (err: any) {
        setError(err.message || 'Failed to sign up.');
      }
    } else {
      try {
        await login(email, password, isAdminSignUp ? adminSecret : undefined);
        setSuccessMsg('Welcome back to ARTINOVA!');
      } catch (err: any) {
        setError(err.message || 'Failed to sign in.');
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
      setError(err.message || 'Failed Google Authorization.');
    } finally {
      setFormLoading(false);
    }
  };

  const clearForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setFullName('');
    setPhone('');
    setAddress('');
    setAdminSecret('');
    setError(null);
    setSuccessMsg(null);
  };

  return (
    <AnimatePresence>
      {loginModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          
          {/* Backdrop Overlay with blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              if (user || isGuest) {
                setLoginModalOpen(false);
              }
            }}
            className="absolute inset-0 bg-matte-black/95 backdrop-blur-xl"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', duration: 0.45 }}
            className="w-full max-w-lg bg-[#0d0d0f]/90 border border-champagne-gold/15 p-8 md:p-10 rounded-xl relative overflow-hidden flex flex-col max-h-[92vh] shadow-[0_0_50px_rgba(212,175,55,0.05)]"
          >
            {/* Ambient gold glows */}
            <div className="absolute -top-32 -right-32 w-64 h-64 rounded-full bg-warm-amber/10 blur-[80px] pointer-events-none" />
            <div className="absolute -bottom-32 -left-32 w-64 h-64 rounded-full bg-deep-bronze/15 blur-[80px] pointer-events-none" />

            {/* Close Button */}
            {(user || isGuest) && (
              <button
                onClick={() => setLoginModalOpen(false)}
                className="absolute top-6 right-6 p-2 rounded-full border border-champagne-gold/10 text-soft-ivory/60 hover:border-royal-gold hover:text-royal-gold transition-colors z-10"
              >
                <X size={14} />
              </button>
            )}

            {/* Logo and Brand representation */}
            <div className="flex flex-col items-center text-center mb-8">
              {/* SVG Wings + Gift Logo Custom vector */}
              <svg viewBox="0 0 100 100" className="w-16 h-16 text-royal-gold animate-float glow-glow-shadow mb-3">
                {/* Left wing */}
                <path d="M 40,50 C 25,48 10,40 10,25 C 10,20 20,18 28,26 C 33,31 38,40 40,47" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M 42,52 C 28,48 15,44 14,33 C 14,29 22,28 29,33 C 34,37 39,45 42,50" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                {/* Right wing */}
                <path d="M 60,50 C 75,48 90,40 90,25 C 90,20 80,18 72,26 C 67,31 62,40 60,47" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M 58,52 C 72,48 85,44 86,33 C 86,29 78,28 71,33 C 66,37 61,45 58,50" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                {/* Gift box in center */}
                <rect x="42" y="52" width="16" height="16" rx="1.5" fill="none" stroke="currentColor" strokeWidth="2.5" />
                <path d="M 40,52 L 60,52 M 50,52 L 50,68" stroke="currentColor" strokeWidth="2" />
                <polygon points="50,38 52,43 57,45 52,47 50,52 48,47 43,45 48,43" fill="currentColor" />
              </svg>

              <h2 className="font-cinzel text-2xl md:text-3xl font-extrabold tracking-[0.25em] text-gold-gradient">
                ARTINOVA
              </h2>
              <span className="font-poppins text-[9px] uppercase tracking-[0.35em] text-royal-gold/70 -mt-0.5 mb-2">
                Customized Gift
              </span>
              <p className="font-poppins text-xs text-soft-ivory/50 mt-1 max-w-xs leading-relaxed">
                {isSignUp ? 'Establish your luxury profile registry.' : 'Secure entry authentication.'}
              </p>
            </div>

            {/* Form scroll viewport */}
            <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto pr-1 flex flex-col gap-5 max-h-[50vh]">
              
              {/* Alert Feedback */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-950/30 border border-red-500/20 text-red-200 text-xs p-4 rounded-lg flex items-start gap-3 font-poppins"
                >
                  <ShieldAlert size={16} className="text-red-400 shrink-0 mt-0.5" />
                  <div className="flex flex-col gap-1">
                    <span>{error}</span>
                    {error.includes('Admin') && (
                      <span className="text-[10px] text-royal-gold/60 font-poppins mt-1">
                        Try local key: <code className="text-champagne-gold font-mono bg-matte-black/60 px-1 rounded">ARTINOVA_LUX_ADMIN</code>
                      </span>
                    )}
                  </div>
                </motion.div>
              )}

              {successMsg && (
                <div className="bg-emerald-950/30 border border-emerald-500/20 text-emerald-200 text-xs p-4 rounded-lg font-poppins">
                  {successMsg}
                </div>
              )}

              {/* Full Name (Sign Up only) */}
              {isSignUp && (
                <div className="flex flex-col gap-1.5">
                  <label className="font-poppins text-[10px] uppercase tracking-widest text-soft-ivory/50 font-semibold pl-1">Full Name</label>
                  <div className="relative">
                    <User size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-royal-gold/60" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Receiver full name"
                      style={{ paddingLeft: '44px' }}
                      className="w-full bg-[#121215]/80 border border-champagne-gold/15 py-3.5 pl-12 pr-4 text-xs font-poppins rounded focus:outline-none focus:border-royal-gold/60 focus:ring-1 focus:ring-royal-gold/30 text-soft-ivory transition-all"
                    />
                  </div>
                </div>
              )}

              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label className="font-poppins text-[10px] uppercase tracking-widest text-soft-ivory/50 font-semibold pl-1">Email Address</label>
                <div className="relative">
                  <Mail size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-royal-gold/60" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="patron@luxury.com"
                    style={{ paddingLeft: '44px' }}
                    className="w-full bg-[#121215]/80 border border-champagne-gold/15 py-3.5 pl-12 pr-4 text-xs font-poppins rounded focus:outline-none focus:border-royal-gold/60 focus:ring-1 focus:ring-royal-gold/30 text-soft-ivory transition-all"
                  />
                </div>
              </div>

              {/* Phone (Sign Up only) */}
              {isSignUp && (
                <div className="flex flex-col gap-1.5">
                  <label className="font-poppins text-[10px] uppercase tracking-widest text-soft-ivory/50 font-semibold pl-1">Phone Number</label>
                  <div className="relative">
                    <Phone size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-royal-gold/60" />
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="GPay transaction contact"
                      style={{ paddingLeft: '44px' }}
                      className="w-full bg-[#121215]/80 border border-champagne-gold/15 py-3.5 pl-12 pr-4 text-xs font-poppins rounded focus:outline-none focus:border-royal-gold/60 focus:ring-1 focus:ring-royal-gold/30 text-soft-ivory transition-all"
                    />
                  </div>
                </div>
              )}

              {/* Address (Sign Up only) */}
              {isSignUp && (
                <div className="flex flex-col gap-1.5">
                  <label className="font-poppins text-[10px] uppercase tracking-widest text-soft-ivory/50 font-semibold pl-1">Delivery Address</label>
                  <div className="relative">
                    <MapPin size={14} className="absolute left-4 top-4 text-royal-gold/60" />
                    <textarea
                      required
                      rows={2}
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Royal estate shipping details"
                      style={{ paddingLeft: '44px' }}
                      className="w-full bg-[#121215]/80 border border-champagne-gold/15 py-3.5 pl-12 pr-4 text-xs font-poppins rounded focus:outline-none focus:border-royal-gold/60 focus:ring-1 focus:ring-royal-gold/30 text-soft-ivory transition-all resize-none"
                    />
                  </div>
                </div>
              )}

              {/* Password */}
              <div className="flex flex-col gap-1.5">
                <label className="font-poppins text-[10px] uppercase tracking-widest text-soft-ivory/50 font-semibold pl-1">Password</label>
                <div className="relative">
                  <Lock size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-royal-gold/60" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    style={{ paddingLeft: '44px' }}
                    className="w-full bg-[#121215]/80 border border-champagne-gold/15 py-3.5 pl-12 pr-12 text-xs font-poppins rounded focus:outline-none focus:border-royal-gold/60 focus:ring-1 focus:ring-royal-gold/30 text-soft-ivory transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4.5 top-1/2 -translate-y-1/2 text-soft-ivory/40 hover:text-champagne-gold"
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password (Sign Up only) */}
              {isSignUp && (
                <div className="flex flex-col gap-1.5">
                  <label className="font-poppins text-[10px] uppercase tracking-widest text-soft-ivory/50 font-semibold pl-1">Confirm Password</label>
                  <div className="relative">
                    <Lock size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-royal-gold/60" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      style={{ paddingLeft: '44px' }}
                      className="w-full bg-[#121215]/80 border border-champagne-gold/15 py-3.5 pl-12 pr-4 text-xs font-poppins rounded focus:outline-none focus:border-royal-gold/60 focus:ring-1 focus:ring-royal-gold/30 text-soft-ivory transition-all"
                    />
                  </div>
                </div>
              )}

              {/* Admin Checkbox */}
              <div className="flex items-center gap-2.5 mt-1 select-none">
                <input
                  type="checkbox"
                  id="adminModalCheckbox"
                  checked={isAdminSignUp}
                  onChange={(e) => setIsAdminSignUp(e.target.checked)}
                  className="rounded border-champagne-gold/30 bg-matte-black text-royal-gold focus:ring-0 focus:ring-offset-0 w-4 h-4 accent-royal-gold cursor-pointer"
                />
                <label htmlFor="adminModalCheckbox" className="font-poppins text-[10px] uppercase tracking-widest text-royal-gold/80 hover:text-royal-gold cursor-pointer">
                  {isSignUp ? 'Register as Administrator' : 'Sign In as Admin'}
                </label>
              </div>

              {/* Admin Secret code */}
              <AnimatePresence>
                {isAdminSignUp && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex flex-col gap-1.5 overflow-hidden"
                  >
                    <label className="font-poppins text-[10px] uppercase tracking-widest text-royal-gold font-semibold pl-1">Admin Code Token</label>
                    <div className="relative">
                      <Lock size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-royal-gold" />
                      <input
                        type="password"
                        required
                        value={adminSecret}
                        onChange={(e) => setAdminSecret(e.target.value)}
                        placeholder="Verification passcode"
                        style={{ paddingLeft: '44px' }}
                        className="w-full bg-[#121215] border border-royal-gold/30 py-3.5 pl-12 pr-4 text-xs font-poppins rounded focus:outline-none focus:border-royal-gold text-soft-ivory transition-all"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Actions submit */}
              <button
                type="submit"
                disabled={formLoading}
                className="btn-solid-gold w-full text-center py-4 tracking-[0.25em] font-extrabold cursor-pointer transition-premium disabled:opacity-50"
              >
                {formLoading ? 'SECURE AUTHENTICATION...' : isSignUp ? 'CREATE ACCOUNT' : 'SECURE SIGN IN'}
              </button>

            </form>

            {/* Spacer / Separator */}
            <div className="flex items-center justify-between gap-4 my-5 select-none">
              <div className="h-[1px] bg-champagne-gold/10 flex-grow" />
              <span className="font-poppins text-[9px] uppercase tracking-widest text-soft-ivory/30">Or Continue With</span>
              <div className="h-[1px] bg-champagne-gold/10 flex-grow" />
            </div>

            {/* Google Authentication Button */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={formLoading}
              className="btn-purple w-full flex items-center justify-center py-4 mb-6 shadow-[0_0_15px_rgba(109,40,217,0.15)] font-bold cursor-pointer transition-premium disabled:opacity-50"
            >
              <GoogleLogo />
              Google Authorization
            </button>

            {/* Alternate toggles */}
            <div className="flex flex-col gap-4 text-center border-t border-champagne-gold/10 pt-6">
              <span className="font-poppins text-xs text-soft-ivory/50">
                {isSignUp ? 'Already have an ARTINOVA profile?' : 'New to our handcrafted store?'}
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    clearForm();
                  }}
                  className="text-royal-gold font-bold ml-1.5 hover:text-champagne-gold transition-colors"
                >
                  {isSignUp ? 'Sign In Here' : 'Create Account'}
                </button>
              </span>

              {/* Guest option */}
              <button
                type="button"
                onClick={continueAsGuest}
                className="font-poppins text-[10px] uppercase tracking-[0.25em] text-champagne-gold/60 hover:text-champagne-gold transition-colors"
              >
                Continue browsing as Guest
              </button>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
