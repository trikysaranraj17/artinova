'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { getProducts, Product } from '../lib/db';
import { useApp } from '../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Sparkles, Award, ShieldCheck, Truck, Gift, Heart, Eye } from 'lucide-react';

// Dynamically import the R3F 3D Hero canvas with SSR disabled to prevent Node compilation errors
const Hero3DCanvas = dynamic(() => import('../components/Hero3DCanvas'), { ssr: false });

export default function HomePage() {
  const { addItemToCart, toggleItemWishlist, wishlist } = useApp();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loaderVisible, setLoaderVisible] = useState(true);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  // Load products
  useEffect(() => {
    async function loadData() {
      try {
        const data = await getProducts();
        setProducts(data);
      } catch (err) {
        console.warn('Supabase DB connection not initialized yet, fallback loaded.', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();

    // Cinematic loading timer
    const timer = setTimeout(() => {
      setLoaderVisible(false);
    }, 1800);
    return () => clearTimeout(timer);
  }, []);

  // Testimonials Auto-sliding
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const testimonials = [
    {
      name: 'Princess Beatrice H.',
      role: 'Private Collector',
      text: 'The Royal Monarch Keepsake box exceeded all levels of expectation. The velvet lining is thick, the wings emblem feels heavy and royal, and the ambient design glows in the dressing hall. Visually unforgettable.',
      rating: 5
    },
    {
      name: 'Alexander V.',
      role: 'Corporate CEO',
      text: 'We commissioned custom letter openers for our executive board. The integration of amber and gold dust in the handles represents true custom excellence. ARTINOVA is modern gifting nobility.',
      rating: 5
    },
    {
      name: 'Clara & Marcus',
      role: 'Bespoke Client',
      text: 'Our personalized couple album is a work of high-end art. The Italian leather scent, the gold-leaf paper edges, the meticulous box. Truly, this is crafting emotions into luxury.',
      rating: 5
    }
  ];

  const instagramGallery = [
    { url: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=600&auto=format&fit=crop&q=80', height: 'h-64' },
    { url: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=600&auto=format&fit=crop&q=80', height: 'h-80' },
    { url: 'https://images.unsplash.com/photo-1574926053821-79c5e338a933?w=600&auto=format&fit=crop&q=80', height: 'h-96' },
    { url: 'https://images.unsplash.com/photo-1606041008023-472dfb5e530f?w=600&auto=format&fit=crop&q=80', height: 'h-72' },
    { url: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=600&auto=format&fit=crop&q=80', height: 'h-80' },
    { url: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&auto=format&fit=crop&q=80', height: 'h-96' }
  ];

  return (
    <div className="relative">
      
      {/* 1. LUXURY LOADING SCREEN */}
      <AnimatePresence>
        {loaderVisible && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
            className="fixed inset-0 bg-[#0a0a0a] z-[9999] flex flex-col items-center justify-center select-none"
          >
            <div className="flex flex-col items-center max-w-sm px-6 text-center gap-4">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="w-20 h-20 text-[var(--color-royal-gold)] filter drop-shadow-[0_0_10px_rgba(212,175,55,0.4)]"
              >
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <path d="M 40,50 C 25,48 10,40 10,25 C 10,20 20,18 28,26 C 33,31 38,40 40,47 M 60,50 C 75,48 90,40 90,25 C 90,20 80,18 72,26 C 67,31 62,40 60,47" fill="none" stroke="currentColor" strokeWidth="2.5" />
                  <rect x="42" y="52" width="16" height="16" rx="1.5" fill="none" stroke="currentColor" strokeWidth="2.5" />
                  <path d="M 50,52 L 50,68 M 40,52 L 60,52" stroke="currentColor" strokeWidth="2" />
                  <polygon points="50,38 52,43 57,45 52,47 50,52 48,47 43,45 48,43" fill="currentColor" />
                </svg>
              </motion.div>
              
              <motion.h1
                initial={{ letterSpacing: '0.1em', opacity: 0 }}
                animate={{ letterSpacing: '0.25em', opacity: 1 }}
                transition={{ duration: 1.2, delay: 0.3 }}
                className="font-playfair text-3xl font-black text-purple mt-4"
              >
                ARTINOVA
              </motion.h1>
              
              <div className="w-48 h-[1px] bg-[var(--color-royal-gold)]/15 mt-2 relative overflow-hidden">
                <motion.div
                  initial={{ left: '-100%' }}
                  animate={{ left: '100%' }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
                  className="absolute h-full w-1/2 bg-[var(--color-royal-gold)]/60"
                />
              </div>
              
              <span className="font-poppins text-[9px] uppercase tracking-[0.3em] text-[var(--color-royal-gold)]/50 mt-1">
                Handcrafting luxury memories
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. HERO SECTION WITH LUXURIOUS VIDEO BACKDROP */}
      <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">
        
        {/* Background Looping Resin Pour Video */}
        <video 
          autoPlay 
          muted 
          loop 
          playsInline 
          src="https://cdn.shopify.com/videos/c/o/v/6f7c6f0d9c4e4b5f8c1e8b3b3b3b3b3b.mp4" 
          className="absolute top-0 left-0 w-full h-full object-cover z-[-1] opacity-40 filter contrast-125 brightness-75"
        />

        {/* Dynamic 3D Scene Loaded client-side overlay */}
        <div className="absolute inset-0 z-0">
          <Hero3DCanvas />
        </div>

        {/* Cinematic Radial Vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-[#0a0a0a] pointer-events-none z-1" />
        <div className="absolute inset-0 bg-radial-gradient-vignette pointer-events-none z-1" style={{ background: 'radial-gradient(circle, transparent 20%, #0a0a0a 100%)' }} />

        {/* Hero Copywriting content */}
        <div className="relative z-10 text-center max-w-4xl px-6 flex flex-col items-center select-none">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.8 }}
            className="flex flex-col items-center"
          >
            {/* Soft gold accent banner */}
            <span className="font-poppins text-[10px] md:text-xs uppercase tracking-[0.35em] text-[var(--color-royal-gold)] border border-[var(--color-royal-gold)]/25 py-2.5 px-6 rounded-full bg-black/45 backdrop-blur-md mb-8 inline-block font-bold">
              ARTISAN GIFT BOUTIQUE
            </span>

            {/* Title - 3D Shimmer luxury text */}
            <h1 className="font-playfair text-4xl md:text-7xl font-black tracking-wider leading-tight text-center max-w-4xl select-none uppercase">
              <span className="text-3d-luxury-gold block mb-2">ARTINOVA</span>
              <span className="text-3d-luxury-gold font-serif italic text-3xl md:text-5xl tracking-[0.3em] opacity-90 block">RESIN ARTISTRY</span>
            </h1>

            {/* Subtitle description */}
            <p className="font-poppins text-xs md:text-sm text-[var(--color-pearl-white)]/70 max-w-lg mt-8 leading-relaxed">
              Handcrafted resin masterpieces that redefine the boundaries of modern elegance. Bespoke collections tailored for royalty, weddings, and premium commissions.
            </p>

            {/* Actions (Custom buttons from reference site styles) */}
            <div className="flex flex-col sm:flex-row items-center gap-6 mt-12 w-full sm:w-auto z-20">
              <Link
                href="/shop"
                className="btn-solid-purple w-full sm:w-auto text-center"
              >
                Collections
              </Link>
              <Link
                href="/contact"
                className="btn-gold w-full sm:w-auto text-center"
              >
                Customization Art
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Animated mouse scroll hint */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none opacity-40 hover:opacity-100 transition-opacity z-10">
          <span className="font-poppins text-[9px] uppercase tracking-[0.25em] text-[var(--color-pearl-white)]">Scroll</span>
          <div className="w-[18px] h-[30px] border border-[var(--color-pearl-white)]/40 rounded-full flex justify-center pt-1.5">
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="w-1.5 h-1.5 rounded-full bg-[var(--color-royal-gold)]"
            />
          </div>
        </div>
      </section>

      {/* 3. FEATURED MASTERPIECES SECTION */}
      <section className="py-32 px-6 bg-[#0a0a0a] relative select-none">
        
        {/* Glow leaks behind cards */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[450px] rounded-full bg-[rgba(109,40,217,0.06)] blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="flex flex-col items-center text-center mb-20">
            <span className="font-poppins text-xs text-[var(--color-royal-gold)] uppercase tracking-[0.3em] font-bold">Exquisite Showcases</span>
            <h2 className="font-playfair text-3xl md:text-5xl font-black uppercase tracking-[0.15em] text-white mt-3">
              <span className="text-gold">Masterpiece</span> <span className="text-purple">Galleries</span>
            </h2>
            <div className="w-16 h-[1.5px] bg-[var(--gradient-mixed)] mx-auto mt-5" />
          </div>

          {/* Cards Container (Luxury card designs with cubic scale tilts and image zoombars) */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-[520px] rounded-xl bg-[#0f1424]/40 animate-pulse border border-[var(--color-royal-gold)]/5" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {products.slice(0, 3).map((product) => {
                const isWishlisted = wishlist.some((p) => p.id === product.id);
                return (
                  <div
                    key={product.id}
                    className="luxury-card flex flex-col h-full rounded-xl overflow-hidden group text-center"
                  >
                    {/* Card Image Container (Zoom on Hover) */}
                    <div className="relative h-[360px] w-full overflow-hidden img-zoom-container select-none">
                      <Image
                        src={product.images[0] || 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800'}
                        alt={product.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 33vw"
                        priority
                      />
                      
                      {/* Dark shade overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-rich-black)]/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                      {/* Quick action buttons */}
                      <div className="absolute top-4 right-4 flex flex-col gap-2.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            toggleItemWishlist(product.id);
                          }}
                          className={`p-2.5 rounded-full border border-[var(--color-royal-gold)]/20 backdrop-blur-md transition-colors ${
                            isWishlisted ? 'bg-[var(--color-royal-gold)] text-matte-black border-[var(--color-royal-gold)]' : 'bg-black/60 text-white hover:text-[var(--color-royal-gold)] hover:border-[var(--color-royal-gold)]'
                          }`}
                        >
                          <Heart size={14} fill={isWishlisted ? 'currentColor' : 'none'} />
                        </button>
                        <Link
                          href={`/shop/${product.id}`}
                          className="p-2.5 rounded-full border border-[var(--color-royal-gold)]/20 bg-black/60 text-white hover:text-[var(--color-royal-gold)] hover:border-[var(--color-royal-gold)] backdrop-blur-md transition-colors"
                        >
                          <Eye size={14} />
                        </Link>
                      </div>

                      {/* Category Badge */}
                      <span className="absolute bottom-4 left-4 bg-[#0a0a0a]/75 border border-[var(--color-royal-gold)]/20 px-3 py-1 text-[8px] uppercase tracking-widest text-[var(--color-royal-gold)] rounded backdrop-blur-sm">
                        {product.category}
                      </span>
                    </div>

                    {/* Content Details */}
                    <div className="p-8 flex flex-col flex-grow bg-[#0f1424]/40 border-t border-[var(--color-royal-gold)]/5">
                      <h3 className="font-playfair text-lg font-bold uppercase tracking-widest mb-3 group-hover:text-[var(--color-gold)] transition-colors">
                        {product.title}
                      </h3>
                      <span className="font-poppins text-xs font-bold text-[var(--color-royal-gold)] mb-4 block">
                        ${product.price.toFixed(2)}
                      </span>
                      <p className="font-poppins text-[10px] text-[var(--color-pearl-white)]/50 leading-relaxed flex-grow max-w-xs mx-auto mb-6">
                        {product.description.length > 105 ? `${product.description.substring(0, 100)}...` : product.description}
                      </p>
                      
                      <button
                        onClick={() => addItemToCart(product.id, 1)}
                        className="w-full mt-auto py-3 bg-transparent text-[var(--color-pearl-white)] border border-[var(--color-royal-violet)] hover:border-[var(--color-royal-gold)] font-poppins text-[9px] uppercase tracking-[0.25em] font-bold transition-all duration-500 relative overflow-hidden group hover:text-black z-10 before:content-[''] before:absolute before:top-0 before:left-0 before:w-0 before:h-full before:bg-gradient-to-r before:from-[var(--color-amethyst-purple)] before:to-[var(--color-wave-teal)] before:transition-all before:duration-500 hover:before:w-full before:z-[-1]"
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Catalog Link */}
          <div className="text-center mt-16">
            <Link
              href="/shop"
              className="group font-poppins text-[10px] uppercase tracking-[0.25em] text-[var(--color-gold)] inline-flex items-center gap-3 hover:text-white transition-colors font-bold"
            >
              Discover Collections <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* 4. ABOUT BRAND STORYTELLING SECTION */}
      <section id="about" className="py-32 px-6 bg-[#0f1424]/30 relative overflow-hidden select-none">
        
        {/* Glowing backdrop leaks */}
        <div className="absolute top-20 right-10 w-96 h-96 rounded-full bg-[rgba(75,29,109,0.05)] blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Text block */}
          <div className="flex flex-col gap-6 text-center lg:text-left items-center lg:items-start">
            <span className="font-poppins text-xs text-[var(--color-royal-gold)] uppercase tracking-[0.3em] font-bold">The Artisan Legacy</span>
            <h2 className="font-playfair text-3xl md:text-5xl font-black uppercase tracking-wide text-white">
              Artisans of the Soul
            </h2>
            <div className="w-16 h-[1.5px] bg-[var(--gradient-mixed)] mt-1" />
            <p className="font-playfair italic text-lg text-[var(--color-gold)]/90 leading-relaxed max-w-lg">
              &ldquo;A gift is not a mere object. It is a bridge between two minds, an emblem of silent adoration, cast in gold.&rdquo;
            </p>
            <p className="font-poppins text-xs md:text-sm text-[var(--color-pearl-white)]/60 leading-loose max-w-xl">
              At ARTINOVA, we refuse the modern standard of mechanical production. We believe in the slow, meticulous crafting of individual statements. Our materials are imported premium grain wood, crystals, and solid brass, layered with real leaf plating and micro-shined to reflect ambient lighting.
            </p>
            <p className="font-poppins text-xs md:text-sm text-[var(--color-pearl-white)]/60 leading-loose max-w-xl">
              Every detail is tailored to your emotional message. When a box is opened, it is not simply opened—it is unveiled.
            </p>
            <div className="mt-4">
              <Link
                href="/shop"
                className="font-poppins text-[10px] uppercase tracking-[0.25em] text-[var(--color-royal-gold)] hover:text-white inline-flex items-center gap-2.5 font-bold"
              >
                Discover The Craft <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          {/* Layered Showcase Image Parallax Effect */}
          <div className="relative flex justify-center items-center select-none">
            {/* Background geometric design */}
            <div className="absolute w-[80%] h-[80%] border border-[var(--color-royal-gold)]/10 rounded-full scale-105 pointer-events-none" />
            
            {/* Primary Image */}
            <div className="relative w-[300px] h-[380px] md:w-[380px] md:h-[480px] rounded-xl overflow-hidden shadow-2xl border border-[var(--color-royal-gold)]/15 z-10 transform -rotate-2 select-none">
              <Image
                src="https://images.unsplash.com/photo-1544816155-12df9643f363?w=800"
                alt="Handcrafting process"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
            
            {/* Secondary Floating Image */}
            <div className="absolute bottom-[-30px] left-[-10px] md:left-[20px] w-[180px] h-[220px] md:w-[220px] md:h-[260px] rounded-xl overflow-hidden shadow-2xl border border-[var(--color-royal-gold)]/20 z-20 transform translate-x-[-10px] translate-y-[20px] rotate-3 hidden sm:block select-none">
              <Image
                src="https://images.unsplash.com/photo-1513151233558-d860c5398176?w=500"
                alt="Keepsake detail"
                fill
                className="object-cover"
                sizes="220px"
              />
            </div>
          </div>

        </div>
      </section>

      {/* 5. WHY CHOOSE US SECTION */}
      <section id="why-choose-us" className="py-32 px-6 bg-[#0a0a0a] relative select-none">
        <div className="max-w-7xl mx-auto">
          
          {/* Header */}
          <div className="text-center flex flex-col items-center gap-4 mb-20">
            <span className="font-poppins text-xs text-[var(--color-royal-gold)] uppercase tracking-[0.3em] font-bold">Quality Commitment</span>
            <h2 className="font-playfair text-3xl md:text-5xl font-black uppercase tracking-wide text-white mt-2">
              The Standard of Royalty
            </h2>
            <p className="font-poppins text-xs md:text-sm text-[var(--color-pearl-white)]/50 max-w-md leading-relaxed mt-2 uppercase tracking-wider">
              Why patrons around the globe trust ARTINOVA with their most critical personal statements.
            </p>
          </div>

          {/* Cards Grid with custom hover effects */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            
            {/* Card 1 */}
            <div className="glass-card p-8 rounded-xl flex flex-col items-center text-center gap-4 border border-[var(--color-royal-gold)]/10 hover:border-[var(--color-royal-gold)]/30">
              <div className="p-4 rounded-full border border-[var(--color-royal-gold)]/15 text-[var(--color-royal-gold)] bg-[#0f1424]/40">
                <Heart size={20} />
              </div>
              <h3 className="font-playfair text-md font-bold text-white uppercase tracking-wider">Handmade</h3>
              <p className="font-poppins text-[10px] text-[var(--color-pearl-white)]/50 leading-loose">
                Individually molded, layered, and finished. No automated assembly lines.
              </p>
            </div>

            {/* Card 2 */}
            <div className="glass-card p-8 rounded-xl flex flex-col items-center text-center gap-4 border border-[var(--color-royal-gold)]/10 hover:border-[var(--color-royal-gold)]/30">
              <div className="p-4 rounded-full border border-[var(--color-royal-gold)]/15 text-[var(--color-royal-gold)] bg-[#0f1424]/40">
                <Award size={20} />
              </div>
              <h3 className="font-playfair text-md font-bold text-white uppercase tracking-wider">Materials</h3>
              <p className="font-poppins text-[10px] text-[var(--color-pearl-white)]/50 leading-loose">
                Premium wood bases, fine velvet linings, and authentic leaf gilding.
              </p>
            </div>

            {/* Card 3 */}
            <div className="glass-card p-8 rounded-xl flex flex-col items-center text-center gap-4 border border-[var(--color-royal-gold)]/10 hover:border-[var(--color-royal-gold)]/30">
              <div className="p-4 rounded-full border border-[var(--color-royal-gold)]/15 text-[var(--color-royal-gold)] bg-[#0f1424]/40">
                <Sparkles size={20} />
              </div>
              <h3 className="font-playfair text-md font-bold text-white uppercase tracking-wider">Personalized</h3>
              <p className="font-poppins text-[10px] text-[var(--color-pearl-white)]/50 leading-loose">
                Custom monograms and engravings detailed specifically to order.
              </p>
            </div>

            {/* Card 4 */}
            <div className="glass-card p-8 rounded-xl flex flex-col items-center text-center gap-4 border border-[var(--color-royal-gold)]/10 hover:border-[var(--color-royal-gold)]/30">
              <div className="p-4 rounded-full border border-[var(--color-royal-gold)]/15 text-[var(--color-royal-gold)] bg-[#0f1424]/40">
                <Truck size={20} />
              </div>
              <h3 className="font-playfair text-md font-bold text-white uppercase tracking-wider">Logistics</h3>
              <p className="font-poppins text-[10px] text-[var(--color-pearl-white)]/50 leading-loose">
                Fully protected gift boxing and priority courier tracking.
              </p>
            </div>

            {/* Card 5 */}
            <div className="glass-card p-8 rounded-xl flex flex-col items-center text-center gap-4 border border-[var(--color-royal-gold)]/10 hover:border-[var(--color-royal-gold)]/30">
              <div className="p-4 rounded-full border border-[var(--color-royal-gold)]/15 text-[var(--color-royal-gold)] bg-[#0f1424]/40">
                <Gift size={20} />
              </div>
              <h3 className="font-playfair text-md font-bold text-white uppercase tracking-wider">Packaging</h3>
              <p className="font-poppins text-[10px] text-[var(--color-pearl-white)]/50 leading-loose">
                Arrives wrapped in premium textured papers with satin ribbon bows.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* 6. TESTIMONIALS SECTION */}
      <section className="py-32 px-6 bg-[#0f1424]/20 relative overflow-hidden select-none">
        
        {/* Ambient bottom glow leak */}
        <div className="absolute top-1/2 left-10 w-96 h-96 rounded-full bg-[rgba(125,60,152,0.05)] blur-[100px] pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <span className="font-poppins text-xs text-[var(--color-royal-gold)] uppercase tracking-[0.3em] font-bold">Elite Appreciations</span>
          <h2 className="font-playfair text-3xl md:text-5xl font-black uppercase tracking-wide text-white mt-3 mb-16">
            Patron Testimonials
          </h2>

          <div className="relative h-64 flex items-center justify-center">
            <AnimatePresence mode="wait">
              {testimonials.map((t, idx) => {
                if (idx !== currentTestimonial) return null;
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.6 }}
                    className="glass-panel p-10 rounded-xl flex flex-col gap-6 border border-[var(--color-royal-gold)]/10"
                  >
                    <p className="font-playfair text-md md:text-xl italic text-[var(--color-gold)]/90 leading-relaxed">
                      &ldquo;{t.text}&rdquo;
                    </p>
                    <div className="flex flex-col">
                      <span className="font-playfair text-sm font-bold tracking-wider text-[var(--color-royal-gold)] uppercase">
                        {t.name}
                      </span>
                      <span className="font-poppins text-[9px] text-[var(--color-pearl-white)]/40 uppercase tracking-widest mt-1">
                        {t.role}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Bullet Indicators */}
          <div className="flex justify-center gap-3 mt-8">
            {testimonials.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentTestimonial(idx)}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  idx === currentTestimonial ? 'bg-[var(--color-royal-gold)] w-6' : 'bg-[var(--color-pearl-white)]/20'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 7. INSTAGRAM GALLERY SECTION */}
      <section className="py-32 px-6 bg-[#0a0a0a] relative select-none">
        <div className="max-w-7xl mx-auto">
          
          {/* Header */}
          <div className="flex flex-col items-center text-center gap-4 mb-20">
            <span className="font-poppins text-xs text-[var(--color-royal-gold)] uppercase tracking-[0.3em] font-bold">Visual Aesthetics</span>
            <h2 className="font-playfair text-3xl md:text-5xl font-black uppercase tracking-wide text-white">
              The Artisan Gallery
            </h2>
            <p className="font-poppins text-xs text-[var(--color-pearl-white)]/50 uppercase tracking-widest mt-1">
              Tag <span className="text-[var(--color-royal-gold)]">@ArtinovaLux</span> on Instagram to join our digital gallery
            </p>
          </div>

          {/* Masonry Grid with Hover scale zoom-in actions */}
          <div className="columns-1 sm:columns-2 md:columns-3 gap-6 space-y-6">
            {instagramGallery.map((img, idx) => (
              <div
                key={idx}
                className="relative overflow-hidden rounded-xl group border border-[var(--color-royal-gold)]/5 break-inside-avoid shadow-lg"
              >
                <div className={`${img.height} relative w-full`}>
                  <Image
                    src={img.url}
                    alt={`Gallery ${idx + 1}`}
                    fill
                    className="object-cover transition-transform duration-1000 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  
                  {/* Hover Inspect Panel */}
                  <div className="absolute inset-0 bg-[#0a0a0a]/50 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center select-none">
                    <span className="font-poppins text-[9px] uppercase tracking-[0.25em] text-[var(--color-royal-gold)] border border-[var(--color-royal-gold)]/30 py-2 px-6 bg-black/85 rounded-md backdrop-blur-sm shadow-[0_0_15px_rgba(212,175,55,0.2)]">
                      Inspect
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

    </div>
  );
}
