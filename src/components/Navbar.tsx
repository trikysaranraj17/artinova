'use client';

import React, { useState, useEffect } from 'react';
import NextLink from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import { useWishlistStore } from '../store/wishlistStore';
import { Search, Heart, ShoppingCart, User, LogOut, Shield, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const pathname = usePathname();
  const { user, isAdmin, setLoginModalOpen, logout } = useAuthStore();
  const { items: cartItems, setCartDrawerOpen } = useCartStore();
  const { items: wishlistItems } = useWishlistStore();
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const wishlistCount = wishlistItems.length;

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Collections', href: '/shop' },
    { name: 'Contact', href: '/contact' }
  ];

  // Track scroll position
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 80) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <header 
        className={`fixed top-0 left-0 right-0 z-50 h-[72px] flex items-center transition-all duration-300 ${
          scrolled 
            ? 'bg-[#0A0A0A]/92 border-b border-[#C9A84C]/10 backdrop-blur-[20px] shadow-[0_4px_30px_rgba(0,0,0,0.8)]' 
            : 'bg-transparent border-b border-transparent'
        }`}
      >
        <div className="w-full relative flex items-center justify-between px-5">
          
          {/* Logo / Left (20px from edge) */}
          <div className="flex items-center">
            <NextLink href="/" className="flex items-center select-none">
              <img 
                src="/logo.jpg" 
                alt="ARTINOVA Logo" 
                className="h-10 w-auto object-contain border border-[#C9A84C]/10 rounded-sm transition-transform duration-500 hover:scale-105" 
              />
            </NextLink>
          </div>

          {/* Links / Center (Absolute center of bar) */}
          <nav className="hidden lg:flex items-center absolute left-1/2 -translate-x-1/2 gap-9">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <NextLink
                  key={link.name}
                  href={link.href}
                  className={`font-accent text-[11px] uppercase tracking-[0.2em] relative py-1 transition-colors duration-300 ${
                    isActive ? 'text-[#C9A84C]' : 'text-[#F5F0E8]/70 hover:text-[#C9A84C]'
                  } group`}
                >
                  {link.name}
                  {/* Underline Slide-in */}
                  <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-[#C9A84C] transition-all duration-300 group-hover:w-full" />
                  
                  {/* Active 2px Dot Centered Below */}
                  {isActive && (
                    <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-[2px] h-[2px] rounded-full bg-[#C9A84C] shadow-[0_0_8px_#C9A84C]" />
                  )}
                </NextLink>
              );
            })}
          </nav>

          {/* Icons / Right (20px from edge, gap: 20px, 40x40px tappable area) */}
          <div className="flex items-center gap-5">
            {/* Search Icon */}
            <div className="hidden md:flex relative items-center justify-center">
              <button 
                onClick={() => setSearchOpen(!searchOpen)}
                className="w-10 h-10 flex items-center justify-center text-[#F5F0E8]/80 hover:text-[#C9A84C] transition-colors cursor-pointer"
                aria-label="Search"
              >
                <Search size={16} strokeWidth={1.5} />
              </button>
              
              <AnimatePresence>
                {searchOpen && (
                  <motion.div 
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 180 }}
                    exit={{ opacity: 0, width: 0 }}
                    className="absolute right-10 top-1/2 -translate-y-1/2 overflow-hidden bg-[#111111] border border-[#C9A84C]/20 rounded-md flex items-center px-2 py-1"
                  >
                    <input 
                      type="text" 
                      placeholder="Search gifts..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-transparent text-xs text-[#F5F0E8] border-none outline-none focus:ring-0 p-0"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Cart Trigger */}
            <button
              onClick={() => setCartDrawerOpen(true)}
              className="w-10 h-10 flex items-center justify-center text-[#F5F0E8]/80 hover:text-[#C9A84C] transition-colors relative cursor-pointer"
              title="Cart"
            >
              <ShoppingCart size={16} strokeWidth={1.5} />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#C9A84C] text-[8px] text-[#0A0A0A] font-bold flex items-center justify-center shadow-[0_0_5px_rgba(201,168,76,0.5)] animate-pulse">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Admin Portal Shortcut */}
            <NextLink
              href="/admin"
              className="hidden sm:flex h-10 items-center justify-center gap-1 border border-[#C9A84C]/30 hover:border-[#C9A84C] bg-[#C9A84C]/5 px-3 rounded text-[8.5px] font-accent uppercase tracking-wider text-[#C9A84C] transition-all duration-300"
            >
              <Shield size={10} /> Admin Portal
            </NextLink>

            {/* Profile / Login */}
            <div className="hidden md:flex items-center">
              {user ? (
                <div className="flex items-center gap-3 pl-2 border-l border-[#C9A84C]/25">
                  <NextLink
                    href="/profile"
                    className="w-10 h-10 flex items-center justify-center text-[#F5F0E8]/80 hover:text-[#C9A84C] transition-colors"
                    title="Profile"
                  >
                    <User size={16} strokeWidth={1.5} />
                  </NextLink>
                  <button
                    onClick={logout}
                    className="w-10 h-10 flex items-center justify-center text-[#F5F0E8]/40 hover:text-red-400 transition-colors cursor-pointer"
                    title="Logout"
                  >
                    <LogOut size={15} strokeWidth={1.5} />
                  </button>
                </div>
              ) : (
                <NextLink
                  href="/login"
                  className="font-accent text-[9px] uppercase tracking-[0.15em] border border-[#C9A84C]/40 px-3 py-2 rounded hover:bg-[#C9A84C] hover:text-[#0A0A0A] transition-all duration-300 font-semibold cursor-pointer"
                >
                  Sign In
                </NextLink>
              )}
            </div>

            {/* Mobile Toggler */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden w-10 h-10 flex items-center justify-center text-[#C9A84C] hover:text-[#F5F0E8] transition-colors"
              aria-label="Toggle menu"
            >
              <Menu size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Drawer (Slides down from top) */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ y: '-100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '-100%', opacity: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 w-full h-screen z-[999] bg-[#0A0A0A] flex flex-col justify-center items-center px-6"
          >
            {/* Close Button top-right (40x40px) */}
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="absolute top-5 right-5 w-10 h-10 flex items-center justify-center text-[#C9A84C] hover:text-[#F5F0E8] transition-colors cursor-pointer"
              aria-label="Close menu"
            >
              <X size={24} />
            </button>

            {/* Mobile Search input inside menu */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.05 }}
              className="w-full max-w-xs mb-8 px-4"
            >
              <div className="relative flex items-center bg-[#111111] border border-[#C9A84C]/20 rounded-md px-3 py-2">
                <Search size={14} className="text-[#9A8F7E] mr-2 shrink-0" />
                <input 
                  type="text" 
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent text-xs text-[#F5F0E8] border-none outline-none focus:ring-0 p-0"
                />
              </div>
            </motion.div>

            {/* Links staggered fade-up */}
            <div className="flex flex-col items-center gap-6">
              {navLinks.map((link, index) => (
                <motion.div
                  key={link.name}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 + index * 0.06 }}
                >
                  <NextLink
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="font-display text-[48px] font-bold tracking-[0.05em] text-[#F5F0E8] hover:text-[#C9A84C] transition-colors duration-300"
                  >
                    {link.name}
                  </NextLink>
                </motion.div>
              ))}
            </div>

            {/* Footer options in overlay */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="absolute bottom-16 flex flex-col items-center gap-6 w-full max-w-xs px-6"
            >
              <div className="h-[1px] bg-[#C9A84C]/10 w-full" />
              
              <div className="flex items-center justify-center gap-8 w-full">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setCartDrawerOpen(true);
                  }}
                  className="flex items-center gap-2 text-[#F5F0E8]/70 hover:text-[#C9A84C] cursor-pointer"
                >
                  <ShoppingCart size={16} />
                  <span className="font-accent text-[9px] uppercase tracking-wider">Cart ({cartCount})</span>
                </button>
                
                {user && (
                  <NextLink
                    href="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 text-[#F5F0E8]/70 hover:text-[#C9A84C]"
                  >
                    <User size={16} />
                    <span className="font-accent text-[9px] uppercase tracking-wider">Profile</span>
                  </NextLink>
                )}
              </div>

              <NextLink
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 border border-[#C9A84C]/50 bg-[#C9A84C]/5 py-3 rounded text-[10px] font-accent font-bold uppercase tracking-wider text-[#C9A84C]"
              >
                <Shield size={12} /> Admin Portal
              </NextLink>

              {user ? (
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-1.5 text-red-400 text-[10px] font-accent uppercase tracking-wider font-bold"
                >
                  <LogOut size={14} /> Sign Out
                </button>
              ) : (
                <NextLink
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center font-accent text-[10px] uppercase tracking-[0.2em] border border-[#C9A84C]/40 py-3 rounded hover:bg-[#C9A84C] hover:text-[#0A0A0A] transition-all duration-300 font-bold"
                >
                  Sign In
                </NextLink>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
