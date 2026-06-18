'use client';

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Plus, ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function MockGoogleChooser() {
  const router = useRouter();
  const { mockGoogleOpen, setMockGoogleOpen, loginWithMockEmail } = useAuthStore();
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [isMounted, setIsMounted] = useState(false);
  const [deviceAccounts, setDeviceAccounts] = useState<any[]>([]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('artinova_device_accounts');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setDeviceAccounts(parsed);
          if (parsed.length === 0) {
            setShowCustomInput(true);
          } else {
            setShowCustomInput(false);
          }
        } catch (e) {
          console.error(e);
          setShowCustomInput(true);
        }
      } else {
        setShowCustomInput(true);
      }
    }
  }, [mockGoogleOpen]);

  if (!isMounted) return null;

  const handleSelectAccount = async (email: string, name: string) => {
    await loginWithMockEmail(email, name);
    // Redirect logic: if admin, go to admin secure dashboard; if user, go to profile
    const lowerEmail = email.toLowerCase().trim();
    if (lowerEmail === 'deepaksabari28@gmail.com' || lowerEmail === 'deepaksabari28@gmial.com' || lowerEmail === 'akashselva18@gmail.com') {
      router.push('/admin-secure-dashboard');
    } else {
      router.push('/profile');
    }
  };

  const handleRemoveAccount = (email: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = deviceAccounts.filter(acc => acc.email !== email);
    setDeviceAccounts(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('artinova_device_accounts', JSON.stringify(updated));
    }
    if (updated.length === 0) {
      setShowCustomInput(true);
    }
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail) return;
    const name = customName || customEmail.split('@')[0];
    handleSelectAccount(customEmail, name);
  };

  return (
    <AnimatePresence>
      {mockGoogleOpen && (
        <div className="fixed inset-0 z-[1000] flex flex-col items-center justify-center p-4 bg-[#0A0A0A]/95 backdrop-blur-md select-none font-sans text-white">
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-[450px] bg-[#1b1b1b] border border-neutral-800 rounded-xl shadow-2xl overflow-hidden flex flex-col p-8 md:p-10"
          >
            {/* Header Close button */}
            <div className="flex justify-end -mt-4 -mr-4 mb-2">
              <button 
                onClick={() => setMockGoogleOpen(false)}
                className="text-neutral-500 hover:text-white p-2 rounded-full hover:bg-neutral-800 transition-colors cursor-pointer"
                title="Cancel Sign-In"
              >
                <X size={18} />
              </button>
            </div>

            {/* Google Identity Logo */}
            <div className="flex items-center gap-2 mb-6">
              <svg viewBox="0 0 24 24" width="20" height="20" className="shrink-0">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              <span className="text-[14px] font-medium tracking-tight text-neutral-300">Sign in with Google</span>
            </div>

            {/* Choose Account Heading */}
            <div className="flex flex-col gap-1 text-left mb-6">
              <h1 className="text-[24px] font-normal tracking-tight text-white leading-tight">
                Choose an account
              </h1>
              <p className="text-xs text-neutral-400 font-normal leading-normal">
                to continue to <span className="text-blue-400 font-medium select-all">artinova.vercel.app</span>
              </p>
            </div>

            {/* Account List */}
            <div className="flex flex-col border-b border-neutral-800 pb-2 max-h-[260px] overflow-y-auto custom-scrollbar">
              {deviceAccounts.map((acc, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectAccount(acc.email, acc.name)}
                  className="w-full flex items-center justify-between py-3.5 px-3 rounded-lg hover:bg-neutral-800/60 transition-colors text-left cursor-pointer group"
                >
                  <div className="flex items-center gap-3.5 min-w-0 flex-grow">
                    {/* Circle Avatar */}
                    <div className={`w-8 h-8 rounded-full ${acc.color || 'bg-indigo-600'} flex items-center justify-center text-white font-bold text-xs uppercase shadow-sm shrink-0`}>
                      {acc.avatar}
                    </div>
                    
                    <div className="flex flex-col leading-tight min-w-0">
                      <span className="text-[13px] font-semibold text-neutral-200 group-hover:text-white truncate">
                        {acc.name}
                      </span>
                      <span className="text-[11px] text-neutral-400 font-normal truncate mt-0.5">
                        {acc.email}
                      </span>
                    </div>
                  </div>

                  {/* Remove Account */}
                  <button
                    type="button"
                    onClick={(e) => handleRemoveAccount(acc.email, e)}
                    className="text-neutral-500 hover:text-red-400 p-1.5 rounded-full hover:bg-[#1E1E1E] transition-colors cursor-pointer shrink-0 z-10 opacity-0 group-hover:opacity-100"
                    title="Remove account from device"
                  >
                    <X size={14} />
                  </button>
                </button>
              ))}
            </div>

            {/* Use Another Account Button */}
            {!showCustomInput ? (
              <button
                onClick={() => setShowCustomInput(true)}
                className="w-full flex items-center gap-3.5 py-4 px-3 rounded-lg hover:bg-neutral-800/60 transition-colors text-left cursor-pointer text-neutral-300 hover:text-white"
              >
                <div className="w-8 h-8 rounded-full border border-neutral-700/60 flex items-center justify-center text-neutral-400 hover:text-white bg-neutral-900 shrink-0">
                  <Plus size={15} />
                </div>
                <span className="text-[13px] font-medium">Use another account</span>
              </button>
            ) : (
              <motion.form 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                onSubmit={handleCustomSubmit}
                className="flex flex-col gap-3 pt-4 border-t border-neutral-800/30 mt-2 text-left"
              >
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase tracking-wider text-neutral-400">Email Address</label>
                  <input
                    type="email"
                    required
                    value={customEmail}
                    onChange={(e) => setCustomEmail(e.target.value)}
                    placeholder="name@gmail.com"
                    className="w-full bg-neutral-900 border border-neutral-800 text-xs py-2.5 px-3 rounded-md outline-none text-white focus:border-blue-500"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase tracking-wider text-neutral-400">Full Name (Optional)</label>
                  <input
                    type="text"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="Bespoke Patron"
                    className="w-full bg-neutral-900 border border-neutral-800 text-xs py-2.5 px-3 rounded-md outline-none text-white focus:border-blue-500"
                  />
                </div>
                <div className="flex gap-2 justify-end mt-2">
                  <button
                    type="button"
                    onClick={() => setShowCustomInput(false)}
                    className="px-3.5 py-1.5 border border-neutral-800 text-xs rounded text-neutral-400 hover:text-white cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-blue-600 text-white font-medium text-xs rounded hover:bg-blue-500 cursor-pointer"
                  >
                    Authenticate
                  </button>
                </div>
              </motion.form>
            )}

            {/* Help/Privacy Footer */}
            <div className="flex justify-between items-center text-[10px] text-neutral-500 mt-10 select-none">
              <div className="flex items-center gap-1 cursor-pointer hover:text-neutral-300">
                <span>English (United States)</span>
                <ChevronDown size={11} />
              </div>
              <div className="flex gap-4">
                <span className="cursor-pointer hover:text-neutral-300">Help</span>
                <span className="cursor-pointer hover:text-neutral-300">Privacy</span>
                <span className="cursor-pointer hover:text-neutral-300">Terms</span>
              </div>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
