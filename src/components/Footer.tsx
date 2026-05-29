'use client';

import React, { useState } from 'react';
import Link from 'next/link';
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
    <footer className="relative bg-luxury-charcoal border-t border-champagne-gold/10 pt-20 pb-10 overflow-hidden">
      {/* Decorative ambient glowing circles */}
      <div className="absolute -bottom-48 -left-48 w-96 h-96 rounded-full bg-deep-bronze/10 blur-[100px] pointer-events-none" />
      <div className="absolute -top-48 -right-48 w-96 h-96 rounded-full bg-burgundy-glow/15 blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 relative z-10">
        
        {/* Brand block */}
        <div className="flex flex-col gap-6 md:col-span-1">
          <div className="flex flex-col">
            <span className="font-cinzel text-2xl font-bold tracking-[0.25em] text-gold-gradient">
              ARTINOVA
            </span>
            <span className="font-poppins text-[10px] uppercase tracking-[0.35em] text-royal-gold/70 -mt-0.5">
              Customized Gift
            </span>
          </div>
          <p className="font-poppins text-xs text-soft-ivory/50 leading-relaxed">
            Crafting raw human emotions into timeless physical luxury. Every single piece is individually handcrafted and detailed to royal perfection.
          </p>
          <div className="flex items-center gap-4 text-soft-ivory/60">
            {/* Instagram vector SVG */}
            <a href="#" className="p-2.5 rounded-full border border-champagne-gold/10 hover:border-royal-gold hover:text-royal-gold transition-all duration-300 flex items-center justify-center">
              <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
            </a>
            {/* Facebook vector SVG */}
            <a href="#" className="p-2.5 rounded-full border border-champagne-gold/10 hover:border-royal-gold hover:text-royal-gold transition-all duration-300 flex items-center justify-center">
              <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
              </svg>
            </a>
            {/* Twitter/X vector SVG */}
            <a href="#" className="p-2.5 rounded-full border border-champagne-gold/10 hover:border-royal-gold hover:text-royal-gold transition-all duration-300 flex items-center justify-center">
              <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
              </svg>
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div className="flex flex-col gap-6">
          <h4 className="font-cinzel text-sm uppercase tracking-[0.2em] text-champagne-gold font-semibold">
            Collections
          </h4>
          <div className="flex flex-col gap-3.5">
            <Link href="/shop?category=Royal Box" className="font-poppins text-xs text-soft-ivory/50 hover:text-champagne-gold transition-colors">
              Royal Keepsake Boxes
            </Link>
            <Link href="/shop?category=Crystal Craft" className="font-poppins text-xs text-soft-ivory/50 hover:text-champagne-gold transition-colors">
              Crystal Glass Trinkets
            </Link>
            <Link href="/shop?category=Glass Art" className="font-poppins text-xs text-soft-ivory/50 hover:text-champagne-gold transition-colors">
              Gilded Glassware
            </Link>
            <Link href="/shop?category=Personalized" className="font-poppins text-xs text-soft-ivory/50 hover:text-champagne-gold transition-colors">
              Custom Couple Albums
            </Link>
          </div>
        </div>

        {/* Customer Support */}
        <div className="flex flex-col gap-6">
          <h4 className="font-cinzel text-sm uppercase tracking-[0.2em] text-champagne-gold font-semibold">
            Support
          </h4>
          <div className="flex flex-col gap-3.5">
            <Link href="/tracking" className="font-poppins text-xs text-soft-ivory/50 hover:text-champagne-gold transition-colors">
              Track Order Status
            </Link>
            <Link href="/shop" className="font-poppins text-xs text-soft-ivory/50 hover:text-champagne-gold transition-colors">
              Browse Boutique
            </Link>
            <Link href="/#about" className="font-poppins text-xs text-soft-ivory/50 hover:text-champagne-gold transition-colors">
              The Artisan Story
            </Link>
            <Link href="/#why-choose-us" className="font-poppins text-xs text-soft-ivory/50 hover:text-champagne-gold transition-colors">
              Quality Assurance
            </Link>
          </div>
        </div>

        {/* Newsletter / Contacts */}
        <div className="flex flex-col gap-6">
          <h4 className="font-cinzel text-sm uppercase tracking-[0.2em] text-champagne-gold font-semibold">
            Newsletter
          </h4>
          <p className="font-poppins text-xs text-soft-ivory/50 leading-relaxed">
            Subscribe to receive exclusive access to private collection releases and custom gifting guides.
          </p>
          <form onSubmit={handleSubscribe} className="relative mt-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your royal email..."
              required
              className="w-full bg-matte-black/60 border border-champagne-gold/15 py-3 pl-4 pr-12 text-xs font-poppins rounded focus:outline-none focus:border-royal-gold/60 text-soft-ivory transition-colors"
            />
            <button
              type="submit"
              className="absolute right-1 top-1 bottom-1 px-3 text-royal-gold hover:text-champagne-gold transition-colors"
            >
              <Send size={14} />
            </button>
          </form>
          {subscribed && (
            <span className="font-poppins text-[10px] text-royal-gold animate-pulse">
              Invitation sent to your inbox.
            </span>
          )}
        </div>

      </div>

      {/* Gilded Line and copyrights */}
      <div className="max-w-7xl mx-auto px-6 mt-16 pt-8 border-t border-champagne-gold/5 flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Animated line decorator */}
        <div className="absolute left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-royal-gold/20 to-transparent -translate-y-8" />
        
        <span className="font-poppins text-[10px] text-soft-ivory/30 uppercase tracking-widest text-center md:text-left">
          © {new Date().getFullYear()} ARTINOVA Customized Gift. All rights reserved.
        </span>
        <div className="flex items-center gap-8 text-[10px] font-poppins uppercase tracking-widest text-soft-ivory/30">
          <a href="#" className="hover:text-champagne-gold transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-champagne-gold transition-colors">Terms of Service</a>
        </div>
      </div>
    </footer>
  );
}
