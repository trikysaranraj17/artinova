'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '../context/AppContext';
import { ShoppingCart, Heart, User, LogOut, Shield, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const { user, isAdmin, cart, wishlist, setLoginModalOpen, logout } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const wishlistCount = wishlist.length;

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Shop', href: '/shop' },
    { name: 'Track Order', href: '/tracking' },
    { name: 'Contact', href: '/contact' },
  ];

  return (
    <>
      <header className="fixed top-0 left-0 w-full z-50 glass-panel border-b border-champagne-gold/5 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          
          {/* Left Third: Navigation Links */}
          <div className="hidden md:flex items-center gap-8 w-1/3 justify-start">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`font-poppins text-[10px] uppercase tracking-[0.2em] font-semibold relative transition-colors ${
                    isActive ? 'text-champagne-gold' : 'text-soft-ivory/60 hover:text-champagne-gold'
                  }`}
                >
                  {link.name}
                  {isActive && (
                    <motion.div
                      layoutId="navUnderline"
                      className="absolute -bottom-1.5 left-0 w-full h-[1px] bg-royal-gold"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>
          
          {/* Mobile hamburger toggler (Left side on mobile) */}
          <div className="md:hidden flex w-1/3 justify-start">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-soft-ivory/80 hover:text-champagne-gold transition-colors"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

          {/* Center Third: Brand Logo & Title (Perfectly Centered) */}
          <div className="flex w-1/3 justify-center items-center">
            <Link href="/" className="flex flex-col items-center group text-center">
              {/* Exact Wings + Gift Vector Logo */}
              <div className="relative w-9 h-9 flex items-center justify-center mb-0.5">
                <svg viewBox="0 0 100 100" className="w-full h-full text-royal-gold filter drop-shadow-[0_0_5px_rgba(212,175,55,0.4)] transition-transform duration-500 group-hover:scale-105">
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
              </div>
              <span className="font-cinzel text-base md:text-lg font-bold tracking-[0.25em] text-gold-gradient group-hover:text-champagne-gold transition-colors">
                ARTINOVA
              </span>
              <span className="font-poppins text-[7px] uppercase tracking-[0.35em] text-royal-gold/60 -mt-1">
                Customized Gift
              </span>
            </Link>
          </div>
          
          {/* Right Third: User Account, Icons, and dedicated Admin Button */}
          <div className="flex items-center gap-6 w-1/3 justify-end">
            
            {/* Wishlist */}
            <Link
              href="/shop?tab=wishlist"
              className="p-2 text-soft-ivory/70 hover:text-champagne-gold transition-colors relative shrink-0"
              title="My Wishlist"
            >
              <Heart size={15} />
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-royal-gold text-[8px] text-matte-black font-bold flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link
              href="/cart"
              className="p-2 text-soft-ivory/70 hover:text-champagne-gold transition-colors relative shrink-0"
              title="My Cart"
            >
              <ShoppingCart size={15} />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-royal-gold text-[8px] text-matte-black font-bold flex items-center justify-center animate-pulse">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Customer Profile link */}
            {user && !isAdmin && (
              <Link
                href="/profile"
                className="p-2 text-soft-ivory/70 hover:text-champagne-gold transition-colors shrink-0"
                title="My Account Profile"
              >
                <User size={15} />
              </Link>
            )}

            {/* Separate Admin Panel Button (Top Right, always visible) */}
            <Link
              href="/admin-secure-dashboard"
              className="hidden sm:flex items-center gap-1.5 border border-royal-gold/50 hover:border-royal-gold bg-royal-gold/5 hover:bg-royal-gold/15 py-1.5 px-3 rounded text-[9px] font-poppins font-semibold uppercase tracking-wider text-royal-gold transition-all duration-300 shrink-0"
              title="Admin Portal Dashboard"
            >
              <Shield size={10} /> Admin Portal
            </Link>

            {/* User Info & Logout/Sign-In actions */}
            {user ? (
              <div className="flex items-center border-l border-champagne-gold/10 pl-3">
                <button
                  onClick={logout}
                  className="p-2 text-soft-ivory/40 hover:text-red-400 transition-colors"
                  title="Sign Out"
                >
                  <LogOut size={14} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setLoginModalOpen(true)}
                className="font-poppins text-[9px] uppercase tracking-[0.2em] border border-royal-gold/40 px-3.5 py-1.5 rounded hover:bg-royal-gold hover:text-matte-black transition-all duration-300 shrink-0 font-semibold"
              >
                Sign In
              </button>
            )}

          </div>

        </div>
      </header>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed top-20 left-0 w-full z-45 glass-panel border-b border-royal-gold/10 md:hidden flex flex-col px-6 py-6 gap-4 shadow-2xl"
          >
            <div className="flex flex-col gap-3">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`font-poppins text-xs uppercase tracking-widest ${
                    pathname === link.href ? 'text-champagne-gold font-semibold' : 'text-soft-ivory/70'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>

            <div className="h-[1px] bg-champagne-gold/10 my-0.5" />

            <div className="flex items-center justify-between">
              <Link
                href="/shop?tab=wishlist"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 text-soft-ivory/70 hover:text-champagne-gold"
              >
                <Heart size={15} />
                <span className="font-poppins text-[9px] uppercase tracking-wider">Wishlist ({wishlistCount})</span>
              </Link>

              <Link
                href="/cart"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 text-soft-ivory/70 hover:text-champagne-gold"
              >
                <ShoppingCart size={15} />
                <span className="font-poppins text-[9px] uppercase tracking-wider">Cart ({cartCount})</span>
              </Link>
              
              {user && !isAdmin && (
                <Link
                  href="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 text-soft-ivory/70 hover:text-champagne-gold"
                >
                  <User size={15} />
                  <span className="font-poppins text-[9px] uppercase tracking-wider">Profile</span>
                </Link>
              )}
            </div>

            <Link
              href="/admin-secure-dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 border border-royal-gold/50 bg-royal-gold/5 py-2.5 rounded text-[9px] font-poppins font-bold uppercase tracking-wider text-royal-gold"
            >
              <Shield size={11} /> Admin Portal
            </Link>

            <div className="h-[1px] bg-champagne-gold/10 my-0.5" />

            {user ? (
              <div className="flex items-center justify-between bg-[#121215] p-3 rounded border border-champagne-gold/5">
                <span className="font-poppins text-xs text-champagne-gold max-w-[150px] truncate">
                  {user.full_name || user.email}
                </span>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-1 text-red-400 text-[9px] font-poppins uppercase tracking-wider font-semibold"
                >
                  <LogOut size={12} /> Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setLoginModalOpen(true);
                  setMobileMenuOpen(false);
                }}
                className="w-full font-poppins text-[9px] uppercase tracking-[0.2em] border border-royal-gold/40 py-2.5 rounded hover:bg-royal-gold hover:text-matte-black transition-all font-semibold"
              >
                Sign In
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
