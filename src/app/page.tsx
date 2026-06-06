'use client';

import React, { useState, useEffect } from 'react';
import NextLink from 'next/link';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { getCollections, Collection } from '../lib/db';
import { Sparkles, Award, ShieldCheck, ChevronDown, Check, ArrowRight } from 'lucide-react';

const Hero3DCanvas = dynamic(() => import('../components/Hero3DCanvas'), { ssr: false });

export default function HomePage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });

  // Load collections
  useEffect(() => {
    async function loadData() {
      try {
        const cols = await getCollections();
        setCollections(cols);
      } catch (err) {
        console.warn('Error loading collections:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();

    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 20;
      const y = (e.clientY / window.innerHeight - 0.5) * 20;
      setMouseOffset({ x, y });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const trustPillars = [
    { icon: <Sparkles className="text-[#C9A84C]" size={20} />, title: "Handcrafted Artistry", desc: "Every resin clock, frame, and coaster is meticulously cast and hand-polished." },
    { icon: <Award className="text-[#C9A84C]" size={20} />, title: "Luxury Materials", desc: "Crafted exclusively with optical-grade resins, real gold foils, and preserved botanicals." },
    { icon: <ShieldCheck className="text-[#C9A84C]" size={20} />, title: "Bespoke Personalization", desc: "Tailor each gift with custom names, dates, text engravings, and photo integration." }
  ];

  const customSteps = [
    { num: "01", title: "Select Design", desc: "Choose clock, frame, or luxury hampers from our collections catalog." },
    { num: "02", title: "Personalize", desc: "Provide names, dates, or upload photos for custom engravings." },
    { num: "03", title: "Handcrafting", desc: "Our local artisans spend up to 48 hours casting and curing your piece." }
  ];

  return (
    <div className="relative overflow-hidden bg-[#0A0A0A] text-[#F5F0E8] font-body select-none">
      
      {/* SECTION 1: HERO (100vh) */}
      <section className="relative h-screen w-full flex flex-col items-center justify-center overflow-hidden px-6">
        {/* Three.js Particle Canvas */}
        <Hero3DCanvas />

        {/* Ambient Gold Orb Parallax */}
        <div 
          className="absolute w-[450px] h-[450px] rounded-full bg-[#C9A84C]/5 blur-[120px] pointer-events-none transition-transform duration-500 ease-out"
          style={{ transform: `translate3d(${mouseOffset.x}px, ${mouseOffset.y}px, 0)` }}
        />

        {/* Vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(circle,transparent_40%,#0A0A0A_100%)] pointer-events-none" />

        {/* Center Content */}
        <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center text-center gap-6 mt-16 md:mt-24">
          <motion.img 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            src="/logo.jpg" 
            alt="ARTINOVA Gold Logo" 
            className="h-20 sm:h-24 w-auto object-contain border border-[#C9A84C]/25 rounded-md shadow-[0_0_30px_rgba(201,168,76,0.15)] mb-2"
          />

          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="font-display text-4xl sm:text-6xl font-bold tracking-[0.2em] text-[#F5F0E8]"
          >
            ARTINOVA
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="font-display italic text-lg sm:text-xl text-[#C9A84C] tracking-widest"
          >
            Crafting Emotions Into Luxury Gifts
          </motion.p>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="font-body text-xs sm:text-sm text-[#9A8F7E] max-w-lg leading-relaxed"
          >
            Bespoke handcrafted resin artwork, custom wedding hampers, and personalized keepsakes designed to preserve life's golden milestones forever.
          </motion.p>

          {/* CTAs */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex flex-col sm:flex-row items-center gap-4 mt-4 w-full sm:w-auto"
          >
            <NextLink href="/shop" className="btn-solid-gold w-full sm:w-auto text-center py-3 px-8 text-xs font-accent uppercase tracking-widest font-bold">
              Explore Collections
            </NextLink>
            <NextLink href="/contact" className="btn-gold w-full sm:w-auto text-center py-3 px-8 text-xs font-accent uppercase tracking-widest font-bold">
              Bespoke Commission
            </NextLink>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 flex flex-col items-center gap-2 text-[#9A8F7E]/50 text-[9px] uppercase tracking-[0.2em] font-accent">
          <span>Scroll to discover</span>
          <div className="w-[1.5px] h-6 bg-gradient-to-b from-[#C9A84C]/60 to-transparent relative overflow-hidden" />
        </div>
      </section>

      {/* SECTION 2: THE LUXURY COLLECTIONS */}
      <section className="py-24 border-t border-[#C9A84C]/10 bg-[#111111]/45 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="font-accent text-[9px] tracking-[0.25em] text-[#C9A84C] uppercase">Bespoke Galleries</span>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold text-[#F5F0E8] mt-2">Curated Collections</h2>
            <div className="w-12 h-[1px] bg-[#C9A84C] mx-auto mt-3" />
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-96 rounded bg-[#111111] animate-pulse border border-[#C9A84C]/10" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {collections.filter(c => c.is_featured).map((col) => (
                <NextLink 
                  href={`/shop?category=${col.slug}`} 
                  key={col.id}
                  className="group relative h-96 rounded-lg overflow-hidden border border-[#C9A84C]/10 hover:border-[#C9A84C] transition-all duration-500 shadow-xl flex flex-col justify-end p-6 bg-[#161616]"
                >
                  {/* Image Background */}
                  <div className="absolute inset-0 z-0">
                    <img 
                      src={col.banner_url || "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=600"} 
                      alt={col.name} 
                      className="w-full h-full object-cover opacity-50 group-hover:scale-105 group-hover:opacity-75 transition-all duration-700" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/40 to-transparent" />
                  </div>

                  {/* Info */}
                  <div className="relative z-10 flex flex-col gap-1">
                    <span className="font-accent text-[10px] uppercase tracking-widest text-[#C9A84C]">Browse Gallery</span>
                    <h3 className="font-display text-xl tracking-wider text-[#F5F0E8] font-bold transition-colors group-hover:text-[#C9A84C]">{col.name}</h3>
                    <p className="font-body text-xs text-[#9A8F7E]/75 line-clamp-2 mt-1 leading-relaxed">{col.description}</p>
                  </div>

                  {/* Sweep Shimmer */}
                  <span className="absolute inset-0 w-[50%] h-full bg-gradient-to-r from-transparent via-[#F5F0E8]/5 to-transparent skew-x-[-20deg] left-[-150%] group-hover:left-[150%] transition-all duration-1000 ease-out pointer-events-none" />
                </NextLink>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* SECTION 3: WHY ARTINOVA (Trust Pillars) */}
      <section className="py-24 max-w-7xl mx-auto px-6 border-t border-[#C9A84C]/10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {trustPillars.map((pillar, i) => (
            <div key={i} className="p-8 rounded-lg bg-[#111111] border border-[#C9A84C]/5 hover:border-[#C9A84C]/25 transition-all duration-300 flex items-start gap-4">
              <div className="p-3 bg-[#0A0A0A] rounded-full border border-[#C9A84C]/15 shrink-0">
                {pillar.icon}
              </div>
              <div className="flex flex-col gap-1.5">
                <h3 className="font-accent text-[11px] uppercase tracking-widest text-[#F5F0E8] font-bold">{pillar.title}</h3>
                <p className="font-body text-xs text-[#9A8F7E] leading-relaxed">{pillar.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 4: THE COMMISSIONING TIMELINE */}
      <section className="py-24 bg-[#111111]/45 border-t border-[#C9A84C]/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="font-accent text-[9px] tracking-[0.25em] text-[#C9A84C] uppercase">How It Works</span>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold text-[#F5F0E8] mt-2">Bespoke Design Journey</h2>
            <div className="w-12 h-[1px] bg-[#C9A84C] mx-auto mt-3" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative max-w-5xl mx-auto">
            {/* Connector Line (Desktop) */}
            <div className="hidden md:block absolute top-8 left-[15%] right-[15%] h-[1px] bg-gradient-to-r from-transparent via-[#C9A84C]/20 to-transparent z-0" />

            {customSteps.map((step, i) => (
              <div key={i} className="flex flex-col items-center text-center gap-4 relative z-10 group">
                <div className="w-16 h-16 rounded-full bg-[#111111] border-2 border-[#C9A84C]/35 group-hover:border-[#C9A84C] flex items-center justify-center text-[#C9A84C] text-sm font-accent font-bold shadow-lg transition-colors duration-300">
                  {step.num}
                </div>
                <h3 className="font-accent text-xs font-bold uppercase tracking-widest text-[#F5F0E8] mt-2">{step.title}</h3>
                <p className="font-body text-xs text-[#9A8F7E] max-w-[240px] leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 5: CALL TO ACTION */}
      <section className="py-24 max-w-5xl mx-auto px-6">
        <div className="p-8 md:p-16 rounded-lg bg-[#111111] border border-[#C9A84C]/15 relative overflow-hidden flex flex-col items-center text-center gap-6">
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-[#C9A84C]/5 blur-[80px] pointer-events-none" />
          <span className="text-[#C9A84C] text-2xl font-serif">✦</span>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#F5F0E8] tracking-wide">Looking for Custom Gifting?</h2>
          <p className="font-body text-xs sm:text-sm text-[#9A8F7E] max-w-xl leading-relaxed">
            Whether it is an upcoming luxury wedding union, a corporate leadership presentation set, or a geode resin clock to match your living room walls, our studio can craft a customized creation tailored exactly to your emotions.
          </p>
          <NextLink href="/contact" className="btn-solid-gold py-3.5 px-10 text-xs font-accent uppercase tracking-widest font-bold">
            Start A Bespoke Request
          </NextLink>
        </div>
      </section>

    </div>
  );
}
