'use client';

import React, { useState } from 'react';
import NextLink from 'next/link';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 5000);
    }
  };

  return (
    <footer className="relative bg-[#121214] border-t border-[var(--color-royal-gold)]/10 pt-24 pb-12 overflow-hidden select-none">
      
      {/* Background ambient glowing leaks */}
      <div className="absolute -bottom-48 -left-48 w-96 h-96 rounded-full bg-[var(--color-deep-bronze)]/5 blur-[100px] pointer-events-none" />
      <div className="absolute -top-48 -right-48 w-96 h-96 rounded-full bg-[var(--color-burgundy-glow)]/10 blur-[120px] pointer-events-none" />

      {/* Main Grid Content */}
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-16 relative z-10 text-center md:text-left">
        
        {/* Brand block */}
        <div className="flex flex-col items-center md:items-start gap-6">
          <div className="flex flex-col">
            <span className="font-cinzel text-2xl font-bold tracking-[0.25em] text-gold-gradient">
              ARTINOVA
            </span>
            <span className="font-poppins text-[10px] uppercase tracking-[0.35em] text-[var(--color-royal-gold)]/70 -mt-0.5">
              Customized Gift
            </span>
          </div>
          <p className="font-poppins text-xs text-[var(--color-soft-ivory)]/50 leading-relaxed max-w-sm">
            Crafting raw human emotions into timeless physical luxury. Every single piece is individually handcrafted and detailed to royal perfection.
          </p>
          
          {/* Social Links */}
          <div className="flex items-center gap-4 text-[var(--color-soft-ivory)]/60">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-full border border-[var(--color-champagne-gold)]/10 hover:border-[var(--color-royal-gold)] hover:text-[var(--color-royal-gold)] transition-all duration-300 flex items-center justify-center">
              <svg viewBox="0 0 24 24" width="15" height="15" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
            </a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-full border border-[var(--color-champagne-gold)]/10 hover:border-[var(--color-royal-gold)] hover:text-[var(--color-royal-gold)] transition-all duration-300 flex items-center justify-center">
              <svg viewBox="0 0 24 24" width="15" height="15" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
              </svg>
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-full border border-[var(--color-champagne-gold)]/10 hover:border-[var(--color-royal-gold)] hover:text-[var(--color-royal-gold)] transition-all duration-300 flex items-center justify-center">
              <svg viewBox="0 0 24 24" width="15" height="15" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
              </svg>
            </a>
          </div>
        </div>

        {/* Explore Links */}
        <div className="flex flex-col items-center gap-6">
          <h4 className="font-cinzel text-sm uppercase tracking-[0.2em] text-[var(--color-champagne-gold)] font-semibold">
            Explore
          </h4>
          <div className="flex flex-col items-center gap-3.5">
            <NextLink href="/" className="font-poppins text-xs text-[var(--color-soft-ivory)]/50 hover:text-[var(--color-royal-gold)] transition-colors uppercase tracking-widest">
              Home
            </NextLink>
            <NextLink href="/shop" className="font-poppins text-xs text-[var(--color-soft-ivory)]/50 hover:text-[var(--color-royal-gold)] transition-colors uppercase tracking-widest">
              Collections
            </NextLink>
            <NextLink href="/tracking" className="font-poppins text-xs text-[var(--color-soft-ivory)]/50 hover:text-[var(--color-royal-gold)] transition-colors uppercase tracking-widest">
              Track Order
            </NextLink>
            <NextLink href="/contact" className="font-poppins text-xs text-[var(--color-soft-ivory)]/50 hover:text-[var(--color-royal-gold)] transition-colors uppercase tracking-widest">
              Contact
            </NextLink>
          </div>
        </div>

        {/* Contact Info / Newsletter */}
        <div className="flex flex-col items-center md:items-start gap-6">
          <h4 className="font-cinzel text-sm uppercase tracking-[0.2em] text-[var(--color-champagne-gold)] font-semibold self-center md:self-start">
            Contact Details
          </h4>
          <div className="flex flex-col items-center md:items-start gap-4 text-[var(--color-soft-ivory)]/50 font-poppins text-xs tracking-wide">
            <div className="flex items-center gap-3">
              <MapPin size={14} className="text-[var(--color-royal-gold)] shrink-0" />
              <span>Chennai, Tamil Nadu, India</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone size={14} className="text-[var(--color-royal-gold)] shrink-0" />
              <span>+91 98407 06312</span>
            </div>
            <div className="flex items-center gap-3">
              <Mail size={14} className="text-[var(--color-royal-gold)] shrink-0" />
              <span>deepaksabari28@gmail.com</span>
            </div>
            
            {/* Newsletter input */}
            <form onSubmit={handleSubscribe} className="relative mt-3 w-full max-w-xs">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address..."
                required
                className="w-full bg-[#070708]/60 border border-[var(--color-champagne-gold)]/15 py-2.5 pl-4 pr-12 text-xs font-poppins rounded focus:outline-none focus:border-[var(--color-royal-gold)]/60 text-white transition-colors"
              />
              <button
                type="submit"
                className="absolute right-1 top-1 bottom-1 px-3 text-[var(--color-royal-gold)] hover:text-white transition-colors"
              >
                <Send size={12} />
              </button>
            </form>
            {subscribed && (
              <span className="font-poppins text-[9px] text-[var(--color-royal-gold)] animate-pulse mt-1">
                Newsletter registration received.
              </span>
            )}
          </div>
        </div>

      </div>

      {/* Gilded Line and copyrights */}
      <div className="max-w-7xl mx-auto px-6 mt-16 pt-8 border-t border-[var(--color-soft-ivory)]/5 flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
        <div className="absolute left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--color-royal-gold)]/20 to-transparent -translate-y-8" />
        
        <span className="font-poppins text-[9px] text-[var(--color-soft-ivory)]/30 uppercase tracking-widest text-center md:text-left">
          © {new Date().getFullYear()} ARTINOVA CUSTOMIZED GIFT. ALL RIGHTS RESERVED.
        </span>
        <div className="flex items-center gap-6 text-[9px] font-poppins uppercase tracking-widest text-[var(--color-soft-ivory)]/30">
          <a href="#" className="hover:text-[var(--color-royal-gold)] transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-[var(--color-royal-gold)] transition-colors">Terms of Service</a>
        </div>
      </div>
    </footer>
  );
}
