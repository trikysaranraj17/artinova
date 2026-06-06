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
      if (window.scrollY > 50) {
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
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          scrolled 
            ? 'py-4 bg-[#0A0A0A]/95 border-b border-[#C9A84C]/15 backdrop-blur-md px-6 md:px-16 shadow-[0_4px_30px_rgba(0,0,0,0.8)]' 
            : 'py-6 bg-transparent border-b border-transparent px-6 md:px-16'
        }`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* Logo / Left */}
          <div className="flex-1 flex justify-start">
            <NextLink href="/" className="flex items-center gap-2 group select-none">
              <img 
                src="/logo.jpg" 
                alt="ARTINOVA Logo" 
                className="h-9 w-auto md:h-11 object-contain border border-[#C9A84C]/10 rounded-sm transition-transform duration-500 group-hover:scale-105" 
              />
            </NextLink>
          </div>

          {/* Links / Center */}
          <nav className="hidden lg:flex items-center justify-center gap-8 xl:gap-12">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <NextLink
                  key={link.name}
                  href={link.href}
                  className={`font-accent text-[10px] xl:text-[11px] uppercase tracking-[0.2em] relative py-1 transition-colors ${
                    isActive ? 'text-[#C9A84C]' : 'text-[#F5F0E8]/70 hover:text-[#C9A84C]'
                  } group`}
                >
                  {link.name}
                  {/* Underline Slide-in */}
                  <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-[#C9A84C] transition-all duration-300 group-hover:w-full" />
                  
                  {/* Active Dot */}
                  {isActive && (
                    <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#C9A84C] shadow-[0_0_8px_#C9A84C]" />
                  )}
                </NextLink>
              );
            })}
          </nav>

          {/* Icons / Right */}
          <div className="flex-1 flex items-center justify-end gap-3 md:gap-5">
            {/* Search Icon */}
            <div className="relative">
              <button 
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-1.5 text-[#F5F0E8]/80 hover:text-[#C9A84C] transition-colors cursor-pointer"
                aria-label="Search"
              >
                <Search size={16} strokeWidth={1.5} />
              </button>
              
              <AnimatePresence>
                {searchOpen && (
                  <motion.div 
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 200 }}
                    exit={{ opacity: 0, width: 0 }}
                    className="absolute right-8 top-1/2 -translate-y-1/2 overflow-hidden bg-[#111111] border border-[#C9A84C]/20 rounded-md flex items-center px-2 py-1"
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
              className="p-1.5 text-[#F5F0E8]/80 hover:text-[#C9A84C] transition-colors relative cursor-pointer"
              title="Cart"
            >
              <ShoppingCart size={16} strokeWidth={1.5} />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-[#C9A84C] text-[8px] text-[#0A0A0A] font-bold flex items-center justify-center shadow-[0_0_5px_rgba(201,168,76,0.5)] animate-pulse">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Admin Portal Shortcut */}
            {isAdmin && (
              <NextLink
                href="/admin-secure-dashboard"
                className="hidden sm:flex items-center gap-1 border border-[#C9A84C]/30 hover:border-[#C9A84C] bg-[#C9A84C]/5 py-1 px-2.5 rounded text-[8px] font-accent uppercase tracking-wider text-[#C9A84C] transition-all duration-300"
              >
                <Shield size={10} /> Dashboard
              </NextLink>
            )}

            {/* Profile / Login */}
            {user ? (
              <div className="flex items-center gap-3 pl-2 border-l border-[#C9A84C]/25">
                <NextLink
                  href="/profile"
                  className="p-1.5 text-[#F5F0E8]/80 hover:text-[#C9A84C] transition-colors"
                  title="Profile"
                >
                  <User size={16} strokeWidth={1.5} />
                </NextLink>
                <button
                  onClick={logout}
                  className="p-1.5 text-[#F5F0E8]/40 hover:text-red-400 transition-colors cursor-pointer"
                  title="Logout"
                >
                  <LogOut size={15} strokeWidth={1.5} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setLoginModalOpen(true)}
                className="font-accent text-[9px] uppercase tracking-[0.15em] border border-[#C9A84C]/40 px-3 py-1.5 rounded hover:bg-[#C9A84C] hover:text-[#0A0A0A] transition-all duration-300 font-semibold cursor-pointer"
              >
                Sign In
              </button>
            )}

            {/* Mobile Toggler */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 text-[#C9A84C] hover:text-[#F5F0E8] transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="fixed top-20 left-0 w-full z-40 bg-[#0A0A0A]/95 border-b border-[#C9A84C]/20 backdrop-blur-md lg:hidden flex flex-col px-6 py-8 gap-6 shadow-2xl"
          >
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <NextLink
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`font-accent text-xs uppercase tracking-widest ${
                    pathname === link.href ? 'text-[#C9A84C] font-bold' : 'text-[#F5F0E8]/70'
                  }`}
                >
                  {link.name}
                </NextLink>
              ))}
            </div>

            <div className="h-[1px] bg-[#C9A84C]/10" />

            <div className="flex items-center justify-center gap-8">
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

            {isAdmin && (
              <NextLink
                href="/admin-secure-dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 border border-[#C9A84C]/50 bg-[#C9A84C]/5 py-3 rounded text-[10px] font-accent font-bold uppercase tracking-wider text-[#C9A84C]"
              >
                <Shield size={12} /> Admin Dashboard
              </NextLink>
            )}

            <div className="h-[1px] bg-[#C9A84C]/10" />

            {user ? (
              <div className="flex items-center justify-between bg-[#111111] p-4 rounded border border-[#C9A84C]/15">
                <span className="font-body text-xs text-[#C9A84C] truncate max-w-[180px]">
                  {user.full_name || user.email}
                </span>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-1.5 text-red-400 text-[10px] font-accent uppercase tracking-wider font-bold"
                >
                  <LogOut size={14} /> Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setLoginModalOpen(true);
                  setMobileMenuOpen(false);
                }}
                className="w-full font-accent text-[10px] uppercase tracking-[0.2em] border border-[#C9A84C]/40 py-3 rounded hover:bg-[#C9A84C] hover:text-[#0A0A0A] transition-all duration-300 font-bold"
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
