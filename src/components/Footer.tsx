'use client';

import React, { useState, useEffect } from 'react';
import NextLink from 'next/link';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

interface GoldParticle {
  id: number;
  left: string;
  bottom: string;
  size: string;
  delay: string;
  duration: string;
}

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [particles, setParticles] = useState<GoldParticle[]>([]);

  // Generate random gold particle layouts once on the client to avoid server hydration mismatches
  useEffect(() => {
    const list = Array.from({ length: 25 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 95 + 2.5}%`,
      bottom: `${Math.random() * 55 + 5}%`,
      size: `${2.5 + Math.random() * 3.5}px`,
      delay: `${Math.random() * 4.5}s`,
      duration: `${4.5 + Math.random() * 3.5}s`,
    }));
    setParticles(list);
  }, []);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 5000);
    }
  };

  return (
    <footer className="relative bg-[#0a0a0a] pt-40 pb-16 border-t border-[var(--color-royal-gold)]/20 overflow-hidden select-none">
      
      {/* 1. DECORATIVE AMBIENT GLOWS & WAVE LAYERS */}
      <div className="absolute inset-0 overflow-hidden z-0 pointer-events-none">
        {/* Large bottom glow leak */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-t from-[rgba(125,60,152,0.35)] to-transparent blur-[80px] z-1" />
        
        {/* Wave overlays */}
        <div className="wave-layer wave-layer-1 absolute bottom-[-15%] left-[-50%] w-[200%] h-[400px] bg-gradient-to-t from-[#2A0A2F] to-transparent rounded-[50%] filter blur-[30px] opacity-75 z-2" />
        <div className="wave-layer wave-layer-2 absolute bottom-[-25%] left-[-30%] w-[150%] h-[350px] bg-gradient-to-t from-[#5B2C83] to-transparent rounded-[50%] filter blur-[40px] opacity-65 z-3" />
        <div className="wave-layer wave-layer-3 absolute bottom-[-35%] left-[-60%] w-[250%] h-[300px] bg-gradient-to-t from-[#7D3C98] to-transparent rounded-[50%] filter blur-[50px] opacity-55 z-4" />

        {/* Floating Gold Particles */}
        {particles.map((p) => (
          <div
            key={p.id}
            className="gold-particle"
            style={{
              left: p.left,
              bottom: p.bottom,
              width: p.size,
              height: p.size,
              animationDelay: p.delay,
              animationDuration: p.duration,
            }}
          />
        ))}
      </div>

      {/* 2. FOOTER MAIN CONTENT */}
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-16 relative z-10 text-center md:text-left">
        
        {/* Brand Information Column */}
        <div className="flex flex-col items-center md:items-start gap-6">
          <div className="flex flex-col items-center md:items-start">
            <span className="font-playfair text-3xl font-black tracking-[0.25em] text-purple">
              ARTINOVA
            </span>
            <span className="font-poppins text-[10px] uppercase tracking-[0.35em] text-[var(--color-royal-gold)]/60 -mt-0.5">
              Customized Gift
            </span>
          </div>
          <p className="font-poppins text-xs text-[var(--color-pearl-white)]/50 leading-loose max-w-sm">
            Crafting raw human emotions into liquid glass. Our customized resin masterpieces are designed to bring a touch of sophisticated luxury and timeless adoration to modern spaces.
          </p>
          <div className="flex items-center gap-4 text-[var(--color-pearl-white)]/60 mt-2">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-full border border-[var(--color-royal-gold)]/10 hover:border-[var(--color-royal-gold)] hover:text-[var(--color-royal-gold)] hover:shadow-[0_0_10px_rgba(212,175,55,0.3)] transition-all duration-300 flex items-center justify-center">
              <svg viewBox="0 0 24 24" width="15" height="15" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
            </a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-full border border-[var(--color-royal-gold)]/10 hover:border-[var(--color-royal-gold)] hover:text-[var(--color-royal-gold)] hover:shadow-[0_0_10px_rgba(212,175,55,0.3)] transition-all duration-300 flex items-center justify-center">
              <svg viewBox="0 0 24 24" width="15" height="15" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
              </svg>
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-full border border-[var(--color-royal-gold)]/10 hover:border-[var(--color-royal-gold)] hover:text-[var(--color-royal-gold)] hover:shadow-[0_0_10px_rgba(212,175,55,0.3)] transition-all duration-300 flex items-center justify-center">
              <svg viewBox="0 0 24 24" width="15" height="15" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
              </svg>
            </a>
          </div>
        </div>

        {/* Explore Links Column */}
        <div className="flex flex-col items-center gap-6">
          <h4 className="font-poppins text-xs uppercase tracking-[0.3em] text-[var(--color-gold)] font-bold">
            Explore
          </h4>
          <div className="flex flex-col items-center gap-3.5">
            <NextLink href="/" className="font-poppins text-xs text-[var(--color-pearl-white)]/60 hover:text-[var(--color-gold)] transition-colors tracking-widest uppercase">
              Home
            </NextLink>
            <NextLink href="/shop" className="font-poppins text-xs text-[var(--color-pearl-white)]/60 hover:text-[var(--color-gold)] transition-colors tracking-widest uppercase">
              Collections
            </NextLink>
            <NextLink href="/tracking" className="font-poppins text-xs text-[var(--color-pearl-white)]/60 hover:text-[var(--color-gold)] transition-colors tracking-widest uppercase">
              Track Order
            </NextLink>
            <NextLink href="/contact" className="font-poppins text-xs text-[var(--color-pearl-white)]/60 hover:text-[var(--color-gold)] transition-colors tracking-widest uppercase">
              Contact
            </NextLink>
          </div>
        </div>

        {/* Contact details Column */}
        <div className="flex flex-col items-center md:items-start gap-6">
          <h4 className="font-poppins text-xs uppercase tracking-[0.3em] text-[var(--color-gold)] font-bold self-center md:self-start">
            Contact Us
          </h4>
          <div className="flex flex-col items-center md:items-start gap-4 text-[var(--color-pearl-white)]/60 font-poppins text-xs tracking-wide">
            <div className="flex items-center gap-3">
              <MapPin size={14} className="text-[var(--color-gold)] shrink-0" />
              <span>Chennai, Tamil Nadu, India</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone size={14} className="text-[var(--color-gold)] shrink-0" />
              <span>+91 98407 06312</span>
            </div>
            <div className="flex items-center gap-3">
              <Mail size={14} className="text-[var(--color-gold)] shrink-0" />
              <span>deepaksabari28@gmail.com</span>
            </div>
            
            {/* Embedded Mini Newsletter Signup */}
            <form onSubmit={handleSubscribe} className="relative mt-4 w-full max-w-xs">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Subscribe newsletter..."
                required
                className="w-full bg-[#0f1424]/60 border border-[var(--color-royal-gold)]/20 py-2.5 pl-4 pr-12 text-xs font-poppins rounded focus:outline-none focus:border-[var(--color-royal-gold)]/60 text-white transition-colors"
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
                Newsletter subscription received.
              </span>
            )}
          </div>
        </div>

      </div>

      {/* 3. SUBFOOTER COPYRIGHT */}
      <div className="max-w-7xl mx-auto px-6 mt-20 pt-8 border-t border-[var(--color-pearl-white)]/5 flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
        <span className="font-poppins text-[9px] text-[var(--color-pearl-white)]/30 uppercase tracking-widest text-center md:text-left">
          © {new Date().getFullYear()} ARTINOVA CUSTOMIZED GIFT. THE PINNACLE OF LUXURY.
        </span>
        <div className="flex items-center gap-6 text-[9px] font-poppins uppercase tracking-widest text-[var(--color-pearl-white)]/30">
          <a href="#" className="hover:text-[var(--color-gold)] transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-[var(--color-gold)] transition-colors">Terms of Service</a>
        </div>
      </div>
    </footer>
  );
}
