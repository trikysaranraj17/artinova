'use client';

import React from 'react';
import NextLink from 'next/link';
import { Mail, Phone, MessageSquare } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="relative bg-[#080808] border-t border-[#C9A84C]/15 pt-20 pb-10 overflow-hidden select-none">
      
      {/* Background ambient glowing leaks */}
      <div className="absolute -bottom-48 -left-48 w-96 h-96 rounded-full bg-[#B8860B]/5 blur-[100px] pointer-events-none" />

      {/* Main Grid Content */}
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 relative z-10 text-center md:text-left">
        
        {/* Column 1: Brand & Socials */}
        <div className="flex flex-col items-center md:items-start gap-4">
          <NextLink href="/" className="select-none">
            <img 
              src="/logo.jpg" 
              alt="ARTINOVA Logo" 
              className="h-10 w-auto object-contain border border-[#C9A84C]/10 rounded-sm" 
            />
          </NextLink>
          <p className="font-body italic text-xs text-[#9A8F7E] max-w-xs leading-relaxed">
            "Crafting Emotions Into Luxury Gifts"
          </p>
          <p className="font-body text-xs text-[#9A8F7E]/70 max-w-xs leading-relaxed">
            Ultra-premium handcrafted gifting studio designed to celebrate life's most meaningful milestones.
          </p>
          
          {/* Social Links */}
          <div className="flex items-center gap-3.5 text-[#F5F0E8]/70 mt-2">
            <a 
              href="https://instagram.com/artinova.studio" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="p-2 rounded-full border border-[#C9A84C]/15 hover:border-[#C9A84C] hover:text-[#C9A84C] transition-all duration-300 flex items-center justify-center"
              aria-label="Instagram"
            >
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
              </svg>
            </a>
            <a 
              href="https://wa.me/919994203670" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="p-2 rounded-full border border-[#C9A84C]/15 hover:border-[#C9A84C] hover:text-[#C9A84C] transition-all duration-300 flex items-center justify-center"
              aria-label="WhatsApp"
            >
              <MessageSquare size={14} />
            </a>
            <a 
              href="https://facebook.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="p-2 rounded-full border border-[#C9A84C]/15 hover:border-[#C9A84C] hover:text-[#C9A84C] transition-all duration-300 flex items-center justify-center"
              aria-label="Facebook"
            >
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
              </svg>
            </a>
            <a 
              href="https://pinterest.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="p-2 rounded-full border border-[#C9A84C]/15 hover:border-[#C9A84C] hover:text-[#C9A84C] transition-all duration-300 flex items-center justify-center"
              aria-label="Pinterest"
            >
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>
              </svg>
            </a>
          </div>
        </div>

        {/* Column 2: Quick Links */}
        <div className="flex flex-col items-center md:items-start gap-4">
          <h4 className="font-accent text-[11px] uppercase tracking-[0.2em] text-[#C9A84C] font-semibold">
            Quick Links
          </h4>
          <div className="flex flex-col items-center md:items-start gap-2.5">
            <NextLink href="/" className="font-body text-xs text-[#9A8F7E] hover:text-[#C9A84C] transition-colors">
              Home
            </NextLink>
            <NextLink href="/shop" className="font-body text-xs text-[#9A8F7E] hover:text-[#C9A84C] transition-colors">
              Collections
            </NextLink>
            <NextLink href="/contact" className="font-body text-xs text-[#9A8F7E] hover:text-[#C9A84C] transition-colors">
              Contact
            </NextLink>
          </div>
        </div>

        {/* Column 3: Customer Care */}
        <div className="flex flex-col items-center md:items-start gap-4">
          <h4 className="font-accent text-[11px] uppercase tracking-[0.2em] text-[#C9A84C] font-semibold">
            Customer Care
          </h4>
          <div className="flex flex-col items-center md:items-start gap-2.5">
            <NextLink href="/profile" className="font-body text-xs text-[#9A8F7E] hover:text-[#C9A84C] transition-colors">
              Track Order
            </NextLink>
            <NextLink href="/profile" className="font-body text-xs text-[#9A8F7E] hover:text-[#C9A84C] transition-colors">
              My Account
            </NextLink>
            <NextLink href="/#faq" className="font-body text-xs text-[#9A8F7E] hover:text-[#C9A84C] transition-colors">
              FAQ
            </NextLink>
            <NextLink href="/contact" className="font-body text-xs text-[#9A8F7E] hover:text-[#C9A84C] transition-colors">
              Returns & Refunds
            </NextLink>
          </div>
        </div>

        {/* Column 4: Contact Info */}
        <div className="flex flex-col items-center md:items-start gap-4">
          <h4 className="font-accent text-[11px] uppercase tracking-[0.2em] text-[#C9A84C] font-semibold">
            Gifting Studio
          </h4>
          <div className="flex flex-col items-center md:items-start gap-3 text-[#9A8F7E] font-body text-xs">
            <div className="flex items-center gap-2.5">
              <Mail size={13} className="text-[#C9A84C] shrink-0" />
              <span>deepaksabari28@gmail.com</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Phone size={13} className="text-[#C9A84C] shrink-0" />
              <span>+91 99942 03670 (Akash)</span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="font-accent text-[10px] text-[#C9A84C] shrink-0">Studio:</span>
              <span>Chennai, Tamil Nadu, India</span>
            </div>
            
            <a 
              href="https://wa.me/919994203670?text=Hello%20Artinova,%20I%20would%20like%20to%20inquire%20about%20a%20personalized%20gift."
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 flex items-center justify-center gap-2 border border-[#C9A84C]/50 hover:border-[#C9A84C] bg-[#C9A84C]/5 hover:bg-[#C9A84C]/15 py-2 px-4 rounded text-[10px] font-accent uppercase tracking-wider text-[#C9A84C] transition-all duration-300"
            >
              Chat on WhatsApp
            </a>
          </div>
        </div>

      </div>

      {/* Symmetrical footer bottom divider */}
      <div className="max-w-7xl mx-auto px-6 mt-16 pt-8 border-t border-[#C9A84C]/10 flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
        
        <span className="font-body text-[10px] text-[#9A8F7E]/50 uppercase tracking-widest text-center md:text-left">
          © {new Date().getFullYear()} ARTINOVA. All Rights Reserved.
        </span>
        
        {/* Payment vectors row */}
        <div className="flex items-center gap-4">
          {/* UPI Vector Logo */}
          <div className="h-4 w-auto text-[#9A8F7E]/40 hover:text-[#C9A84C] transition-colors flex items-center gap-1.5 border border-[#9A8F7E]/20 px-2 py-0.5 rounded text-[8px] font-accent tracking-widest font-extrabold uppercase select-none">
            <svg viewBox="0 0 100 100" className="w-3.5 h-3.5" fill="currentColor">
              <path d="M 50,15 L 85,45 L 85,85 L 15,85 L 15,45 Z" fill="none" stroke="currentColor" strokeWidth="6" />
              <path d="M 35,65 L 50,45 L 65,65 Z" />
            </svg>
            UPI
          </div>
          
          {/* GPay Vector Badge */}
          <div className="h-4 w-auto text-[#9A8F7E]/40 hover:text-[#C9A84C] transition-colors flex items-center gap-1 border border-[#9A8F7E]/20 px-2 py-0.5 rounded text-[8px] font-accent tracking-widest font-extrabold uppercase select-none">
            <svg viewBox="0 0 100 100" className="w-3 h-3" fill="currentColor">
              <path d="M50 10c22.1 0 40 17.9 40 40s-17.9 40-40 40S10 72.1 10 50 27.9 10 50 10m0-5C25.1 5 5 25.1 5 50s20.1 45 45 45 45-20.1 45-45S74.9 5 50 5z" />
              <path d="M35 55 h30 v10 h-30 z M60 35 v25 h10 v-25 z" />
            </svg>
            GPay
          </div>
        </div>

        <div className="flex items-center gap-6 text-[10px] font-body uppercase tracking-wider text-[#9A8F7E]/50">
          <NextLink href="/contact" className="hover:text-[#C9A84C] transition-colors">Privacy Policy</NextLink>
          <NextLink href="/contact" className="hover:text-[#C9A84C] transition-colors">Terms of Service</NextLink>
          <NextLink href="/contact" className="hover:text-[#C9A84C] transition-colors">Refund Policy</NextLink>
        </div>
      </div>
    </footer>
  );
}
