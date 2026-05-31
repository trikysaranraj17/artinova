'use client';

import React, { useState, useEffect } from 'react';
import NextLink from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '../context/AppContext';
import { ShoppingCart, Heart, User, LogOut, Shield, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const { user, isAdmin, cart, wishlist, setLoginModalOpen, logout } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const wishlistCount = wishlist.length;

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Shop', href: '/shop' },
    { name: 'Contact', href: '/contact' },
  ];

  // Track page scroll to apply luxury sticky background styles
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
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
      {/* 1. TOP ANNOUNCEMENT BANNER */}
      <div className="bg-gradient-to-r from-[#121214] via-[#3d2a1c] to-[#121214] border-b border-[var(--color-royal-gold)]/10 text-[var(--color-champagne-gold)] text-center py-2.5 text-[8px] md:text-[10px] font-extrabold tracking-[0.25em] uppercase fixed top-0 left-0 w-full z-[2100] select-none animate-[fadeInDown_1s_ease_forwards]">
        Exclusive Handcrafted Luxury Gifts | Free Shipping Pan-India
      </div>

      {/* 2. SYMMETRICAL HEADER BAR */}
      <header 
        className={`fixed left-0 right-0 z-50 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          scrolled 
            ? 'top-0 py-3.5 bg-[#070708]/95 border-b border-[var(--color-royal-gold)]/20 backdrop-blur-md px-6 md:px-12' 
            : 'top-10 py-5 bg-transparent border-b border-transparent px-6 md:px-12'
        }`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-6">
          
          {/* A. Left: Brand Logo & Title */}
          <div className="flex-1 flex justify-start items-center">
            <NextLink href="/" className="flex items-center gap-3 group select-none">
              <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
                <div className="absolute inset-0 bg-[var(--color-royal-gold)]/20 rounded-full blur-md animate-pulse pointer-events-none" />
                <svg viewBox="0 0 100 100" className="relative z-10 w-full h-full text-[var(--color-royal-gold)] filter drop-shadow-[0_0_15px_rgba(212,175,55,0.8)] transition-transform duration-500 group-hover:scale-105">
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
              <div className="flex flex-col">
                <span className="font-cinzel text-base md:text-lg font-bold tracking-[0.2em] text-gold-gradient leading-none">
                  ARTINOVA
                </span>
                <span className="font-poppins text-[7.5px] uppercase tracking-[0.3em] text-[var(--color-royal-gold)]/60 -mt-0.5">
                  Customized Gift
                </span>
              </div>
            </NextLink>
          </div>

          {/* B. Center: Desktop Links (Perfect center alignment) */}
          <div className="hidden lg:flex items-center justify-center gap-4 xl:gap-8 shrink-0">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <NextLink
                  key={link.name}
                  href={link.href}
                  className={`font-poppins text-[9px] xl:text-[9.5px] uppercase tracking-[0.15em] xl:tracking-[0.25em] font-semibold relative transition-colors ${
                    isActive ? 'text-[var(--color-royal-gold)] font-bold' : 'text-[var(--color-soft-ivory)]/60 hover:text-[var(--color-royal-gold)]'
                  }`}
                >
                  {link.name}
                  {isActive && (
                    <motion.div
                      layoutId="navUnderline"
                      className="absolute -bottom-1.5 left-0 w-full h-[1.5px] bg-[var(--color-royal-gold)]"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </NextLink>
              );
            })}
          </div>

          {/* C. Right: User Registry Controls & Dedicated Admin Access */}
          <div className="flex-1 flex items-center justify-end gap-2 xl:gap-3.5 shrink-0 z-[2200]">
            
            {/* Wishlist */}
            <NextLink
              href="/shop?tab=wishlist"
              className="p-1.5 text-[var(--color-soft-ivory)]/70 hover:text-[var(--color-royal-gold)] transition-colors relative shrink-0"
              title="My Wishlist"
            >
              <Heart size={14} />
              {wishlistCount > 0 && (
                <span className="absolute top-0.5 right-0.5 w-3 h-3 rounded-full bg-[var(--color-royal-gold)] text-[7px] text-matte-black font-bold flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </NextLink>

            {/* Cart */}
            <NextLink
              href="/cart"
              className="p-1.5 text-[var(--color-soft-ivory)]/70 hover:text-[var(--color-royal-gold)] transition-colors relative shrink-0"
              title="My Cart"
            >
              <ShoppingCart size={14} />
              {cartCount > 0 && (
                <span className="absolute top-0.5 right-0.5 w-3 h-3 rounded-full bg-[var(--color-royal-gold)] text-[7px] text-matte-black font-bold flex items-center justify-center animate-pulse">
                  {cartCount}
                </span>
              )}
            </NextLink>

            {/* Profile */}
            {user && !isAdmin && (
              <NextLink
                href="/profile"
                className="p-1.5 text-[var(--color-soft-ivory)]/70 hover:text-[var(--color-royal-gold)] transition-colors shrink-0"
                title="My Account Profile"
              >
                <User size={14} />
              </NextLink>
            )}

            {/* Admin Portal Button */}
            <NextLink
              href="/admin-secure-dashboard"
              className="hidden sm:flex items-center gap-1 xl:gap-1.5 border border-[var(--color-royal-gold)]/40 hover:border-[var(--color-royal-gold)] bg-[var(--color-royal-gold)]/5 hover:bg-[var(--color-royal-gold)]/15 py-1 px-2 xl:px-3 rounded text-[8px] xl:text-[8.5px] font-poppins font-bold uppercase tracking-wider text-[var(--color-royal-gold)] transition-all duration-300 shrink-0 shadow-[0_0_8px_rgba(212,175,55,0.03)]"
              title="Admin Portal Dashboard"
            >
              <Shield size={9} /> Admin Portal
            </NextLink>

            {/* User Info / Sign Out Actions */}
            {user ? (
              <div className="flex items-center border-l border-[var(--color-champagne-gold)]/10 pl-2 shrink-0">
                <button
                  onClick={logout}
                  className="p-1.5 text-[var(--color-soft-ivory)]/40 hover:text-red-400 transition-colors"
                  title="Sign Out"
                >
                  <LogOut size={13} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setLoginModalOpen(true)}
                className="font-poppins text-[8px] xl:text-[8.5px] uppercase tracking-[0.15em] xl:tracking-[0.2em] border border-[var(--color-royal-gold)]/40 px-2 xl:px-3 py-1 rounded hover:bg-[var(--color-royal-gold)] hover:text-matte-black transition-all duration-300 shrink-0 font-bold"
              >
                Sign In
              </button>
            )}

            {/* Mobile Burger (Toggler) */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-[var(--color-royal-gold)] hover:text-[var(--color-soft-ivory)] transition-colors shrink-0"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

        </div>
      </header>

      {/* 3. MOBILE MENU DRAWER */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed top-20 left-0 w-full z-45 glass-panel border-b border-[var(--color-royal-gold)]/15 lg:hidden flex flex-col px-6 py-8 gap-5 shadow-2xl"
          >
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <NextLink
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`font-poppins text-xs uppercase tracking-widest ${
                    pathname === link.href ? 'text-[var(--color-royal-gold)] font-bold' : 'text-[var(--color-soft-ivory)]/70'
                  }`}
                >
                  {link.name}
                </NextLink>
              ))}
            </div>

            <div className="h-[1px] bg-[var(--color-soft-ivory)]/10 my-1" />

            <div className="flex items-center justify-between">
              <NextLink
                href="/shop?tab=wishlist"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 text-[var(--color-soft-ivory)]/70 hover:text-[var(--color-royal-gold)]"
              >
                <Heart size={15} />
                <span className="font-poppins text-[9px] uppercase tracking-wider">Wishlist ({wishlistCount})</span>
              </NextLink>

              <NextLink
                href="/cart"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 text-[var(--color-soft-ivory)]/70 hover:text-[var(--color-royal-gold)]"
              >
                <ShoppingCart size={15} />
                <span className="font-poppins text-[9px] uppercase tracking-wider">Cart ({cartCount})</span>
              </NextLink>
              
              {user && !isAdmin && (
                <NextLink
                  href="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 text-[var(--color-soft-ivory)]/70 hover:text-[var(--color-royal-gold)]"
                >
                  <User size={15} />
                  <span className="font-poppins text-[9px] uppercase tracking-wider">Profile</span>
                </NextLink>
              )}
            </div>

            <NextLink
              href="/admin-secure-dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 border border-[var(--color-royal-gold)]/50 bg-[var(--color-royal-gold)]/5 py-3 rounded text-[9px] font-poppins font-bold uppercase tracking-wider text-[var(--color-royal-gold)]"
            >
              <Shield size={11} /> Admin Portal
            </NextLink>

            <div className="h-[1px] bg-[var(--color-soft-ivory)]/10 my-1" />

            {user ? (
              <div className="flex items-center justify-between bg-[#121214]/90 p-4 rounded border border-[var(--color-royal-gold)]/10">
                <span className="font-poppins text-xs text-[var(--color-royal-gold)] max-w-[150px] truncate">
                  {user.full_name || user.email}
                </span>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-1.5 text-red-400 text-[9px] font-poppins uppercase tracking-wider font-bold"
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
                className="w-full font-poppins text-[9px] uppercase tracking-[0.2em] border border-[var(--color-royal-gold)]/40 py-3 rounded hover:bg-[var(--color-royal-gold)] hover:text-matte-black transition-all font-bold"
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
