'use client';

import React, { useState, useEffect } from 'react';
import NextLink from 'next/link';
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
    async function loadData(showLoading = true) {
      if (showLoading) setLoading(true);
      try {
        const data = await getProducts();
        setProducts(data);
      } catch (err) {
        console.warn('Database initialization warning, loading local storage.', err);
      } finally {
        if (showLoading) setLoading(false);
      }
    }
    loadData(true);

    const handleFocus = () => {
      loadData(false);
    };
    window.addEventListener('focus', handleFocus);

    // Cinematic loading timer
    const timer = setTimeout(() => {
      setLoaderVisible(false);
    }, 1800);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('focus', handleFocus);
    };
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
            className="fixed inset-0 bg-[#070708] z-[9999] flex flex-col items-center justify-center select-none"
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
                className="font-cinzel text-2xl font-bold text-gold-gradient mt-4"
              >
                ARTINOVA
              </motion.h1>
              
              <div className="w-48 h-[1px] bg-[var(--color-champagne-gold)]/15 mt-2 relative overflow-hidden">
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

      {/* 2. HERO SECTION WITH 3D CANVAS */}
      <section className="relative h-screen w-full flex items-center justify-center overflow-hidden bg-ambient-glow">
        
        {/* Dynamic 3D Scene */}
        <Hero3DCanvas />

        {/* Cinematic Vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#070708] via-transparent to-transparent pointer-events-none" />

        {/* Hero Copywriting */}
        <div className="relative z-10 text-center max-w-4xl px-6 flex flex-col items-center select-none">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.8 }}
            className="flex flex-col items-center"
          >
            {/* Soft gold accent banner */}
            <span className="font-poppins text-[10px] md:text-xs uppercase tracking-[0.35em] text-[var(--color-royal-gold)] border border-[var(--color-royal-gold)]/25 py-2 px-5 rounded-full bg-[#070708]/40 backdrop-blur-md mb-6 inline-block font-semibold">
              ARTISAN GIFT BOUTIQUE
            </span>

            {/* Title */}
            <h1 className="font-cinzel text-4xl md:text-7xl font-extrabold tracking-wider leading-tight text-gold-gradient text-center max-w-3xl">
              Crafting Emotions <br className="hidden md:inline" /> Into Luxury Gifts
            </h1>

            {/* Subtitle description */}
            <p className="font-poppins text-sm md:text-base text-[var(--color-soft-ivory)]/60 max-w-lg mt-6 leading-relaxed">
              Bespoke collections tailored for royalty, weddings, and milestones. Individually molded, hand-polished, and custom-packaged.
            </p>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center gap-5 mt-10 w-full sm:w-auto">
              <NextLink
                href="/shop"
                className="w-full sm:w-auto text-center font-poppins text-xs font-semibold uppercase tracking-[0.2em] bg-[var(--color-royal-gold)] text-matte-black px-10 py-4 rounded hover:bg-[var(--color-champagne-gold)] hover:shadow-[0_0_15px_rgba(214,175,55,0.4)] transition-all duration-300"
              >
                Shop Now
              </NextLink>
              <NextLink
                href="#about"
                className="w-full sm:w-auto text-center font-poppins text-xs font-semibold uppercase tracking-[0.2em] border border-[var(--color-champagne-gold)]/20 px-9 py-4 rounded hover:bg-[var(--color-champagne-gold)]/5 text-[var(--color-soft-ivory)] hover:border-[var(--color-royal-gold)] transition-all duration-300"
              >
                Explore Collection
              </NextLink>
            </div>
          </motion.div>
        </div>

        {/* Animated mouse scroll hint */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none opacity-40 hover:opacity-100 transition-opacity">
          <span className="font-poppins text-[9px] uppercase tracking-[0.25em] text-[var(--color-soft-ivory)]">Scroll</span>
          <div className="w-[18px] h-[30px] border border-[var(--color-soft-ivory)]/50 rounded-full flex justify-center pt-1.5">
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="w-1.5 h-1.5 rounded-full bg-[var(--color-royal-gold)]"
            />
          </div>
        </div>
      </section>

      {/* 3. FEATURED COLLECTIONS SECTION */}
      <section className="py-28 px-6 bg-[#070708]/90 relative select-none">
        
        {/* Glow leak behind card slider */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full bg-[var(--color-deep-bronze)]/5 blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div className="flex flex-col gap-2">
              <span className="font-poppins text-xs text-[var(--color-royal-gold)] uppercase tracking-[0.3em] font-semibold">Exquisite Showcases</span>
              <h2 className="font-cinzel text-3xl md:text-5xl font-bold tracking-wide text-[var(--color-soft-ivory)]">
                The Masterpieces
              </h2>
            </div>
            <NextLink
              href="/shop"
              className="group font-poppins text-xs uppercase tracking-widest text-[var(--color-champagne-gold)] flex items-center gap-2.5 hover:text-[var(--color-royal-gold)] transition-colors font-semibold"
            >
              View Boutique Catalog <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </NextLink>
          </div>

          {/* Cards Container */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-96 rounded-lg bg-[var(--color-luxury-charcoal)] animate-pulse border border-[var(--color-champagne-gold)]/5" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {products.slice(0, 3).map((product) => {
                const isWishlisted = wishlist.some((p) => p.id === product.id);
                return (
                  <motion.div
                    key={product.id}
                    className="glass-card flex flex-col h-full rounded-lg overflow-hidden group perspective-container"
                    whileHover={{ scale: 1.01 }}
                  >
                    {/* Card Image Container */}
                    <div className="relative h-72 w-full overflow-hidden">
                      <Image
                        src={product.images[0] || 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800'}
                        alt={product.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-matte-black)]/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                      {/* Quick action buttons */}
                      <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            toggleItemWishlist(product.id);
                          }}
                          className={`p-2.5 rounded-full border border-[var(--color-champagne-gold)]/15 backdrop-blur-md transition-colors ${
                            isWishlisted ? 'bg-[var(--color-royal-gold)] text-matte-black border-[var(--color-royal-gold)]' : 'bg-[#070708]/80 hover:border-[var(--color-royal-gold)] text-[var(--color-soft-ivory)] hover:text-[var(--color-royal-gold)]'
                          }`}
                        >
                          <Heart size={14} fill={isWishlisted ? 'currentColor' : 'none'} />
                        </button>
                        <NextLink
                          href={`/shop/${product.id}`}
                          className="p-2.5 rounded-full border border-[var(--color-champagne-gold)]/15 bg-[#070708]/80 hover:border-[var(--color-royal-gold)] text-[var(--color-soft-ivory)] hover:text-[var(--color-royal-gold)] backdrop-blur-md transition-colors"
                        >
                          <Eye size={14} />
                        </NextLink>
                      </div>

                      {/* Category Badge */}
                      <span className="absolute bottom-4 left-4 bg-[#070708]/60 border border-[var(--color-champagne-gold)]/15 px-3 py-1 text-[9px] uppercase tracking-widest text-[var(--color-royal-gold)] rounded backdrop-blur-sm">
                        {product.category}
                      </span>
                    </div>

                    {/* Content details */}
                    <div className="p-6 flex flex-col flex-grow bg-[var(--color-luxury-charcoal)]/40 border-t border-[var(--color-champagne-gold)]/5">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <h3 className="font-cinzel text-lg font-bold group-hover:text-[var(--color-champagne-gold)] transition-colors">
                          {product.title}
                        </h3>
                        <span className="font-poppins text-sm font-semibold text-[var(--color-royal-gold)] shrink-0">
                          ${product.price.toFixed(2)}
                        </span>
                      </div>
                      <p className="font-poppins text-[11px] text-[var(--color-soft-ivory)]/50 leading-relaxed flex-grow mb-6">
                        {product.description.length > 110 ? `${product.description.substring(0, 105)}...` : product.description}
                      </p>
                      
                      <button
                        onClick={() => addItemToCart(product.id, 1)}
                        className="w-full py-3 border border-[var(--color-royal-gold)]/30 hover:border-[var(--color-royal-gold)] hover:bg-[var(--color-royal-gold)] hover:text-matte-black transition-all duration-300 font-poppins text-[10px] uppercase tracking-[0.2em] font-semibold cursor-pointer"
                      >
                        Add to Cart
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* 4. ABOUT BRAND STORYTELLING SECTION */}
      <section id="about" className="py-28 px-6 bg-[var(--color-luxury-charcoal)]/50 relative overflow-hidden select-none">
        
        {/* Glowing backdrop leaks */}
        <div className="absolute top-20 right-10 w-96 h-96 rounded-full bg-[var(--color-burgundy-glow)]/10 blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Text block */}
          <div className="flex flex-col gap-6 text-center lg:text-left items-center lg:items-start">
            <span className="font-poppins text-xs text-[var(--color-royal-gold)] uppercase tracking-[0.3em] font-semibold">The Artisan Legacy</span>
            <h2 className="font-cinzel text-3xl md:text-5xl font-bold tracking-wide text-[var(--color-soft-ivory)]">
              Artisans of the Soul
            </h2>
            <div className="w-16 h-[1px] bg-[var(--color-royal-gold)]/60 my-2" />
            <p className="font-playfair italic text-lg text-[var(--color-champagne-gold)]/90 leading-relaxed max-w-lg">
              &ldquo;A gift is not a mere object. It is a bridge between two minds, an emblem of silent adoration, cast in gold.&rdquo;
            </p>
            <p className="font-poppins text-xs md:text-sm text-[var(--color-soft-ivory)]/60 leading-relaxed max-w-xl">
              At ARTINOVA, we refuse the modern standard of mechanical production. We believe in the slow, meticulous crafting of individual statements. Our materials are imported premium grain wood, crystals, and solid brass, layered with real leaf plating and micro-shined to reflect ambient lighting.
            </p>
            <p className="font-poppins text-xs md:text-sm text-[var(--color-soft-ivory)]/60 leading-relaxed max-w-xl">
              Every detail is tailored to your emotional message. When a box is opened, it is not simply opened—it is unveiled.
            </p>
            <div className="mt-4">
              <NextLink
                href="/shop"
                className="font-poppins text-xs uppercase tracking-widest text-[var(--color-royal-gold)] hover:text-[var(--color-champagne-gold)] inline-flex items-center gap-2 font-semibold"
              >
                Discover The Craft <ArrowRight size={14} />
              </NextLink>
            </div>
          </div>

          {/* Layered Image showcase */}
          <div className="relative flex justify-center items-center">
            {/* Background geometric design */}
            <div className="absolute w-[80%] h-[80%] border border-[var(--color-royal-gold)]/10 rounded-full scale-105 pointer-events-none" />
            
            {/* Primary Image */}
            <div className="relative w-[300px] h-[380px] md:w-[380px] md:h-[480px] rounded overflow-hidden shadow-2xl border border-[var(--color-champagne-gold)]/10 z-10 transform -rotate-2">
              <Image
                src="https://images.unsplash.com/photo-1544816155-12df9643f363?w=800"
                alt="Handcrafting process"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
            
            {/* Secondary Floating Image */}
            <div className="absolute bottom-[-40px] left-[-20px] md:left-[20px] w-[180px] h-[220px] md:w-[220px] md:h-[260px] rounded overflow-hidden shadow-2xl border border-[var(--color-royal-gold)]/20 z-20 transform translate-x-[-10px] translate-y-[20px] rotate-3 hidden sm:block">
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
      <section id="why-choose-us" className="py-28 px-6 bg-[#070708] select-none">
        <div className="max-w-7xl mx-auto">
          
          {/* Header */}
          <div className="text-center flex flex-col items-center gap-4 mb-20">
            <span className="font-poppins text-xs text-[var(--color-royal-gold)] uppercase tracking-[0.3em] font-semibold">Quality Commitment</span>
            <h2 className="font-cinzel text-3xl md:text-5xl font-bold tracking-wide text-[var(--color-soft-ivory)]">
              The Standard of Royalty
            </h2>
            <p className="font-poppins text-xs md:text-sm text-[var(--color-soft-ivory)]/50 max-w-md leading-relaxed mt-2 uppercase tracking-widest">
              Why patrons around the globe trust ARTINOVA with their most critical personal statements.
            </p>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            
            {/* Card 1 */}
            <div className="glass-card p-8 rounded-lg flex flex-col items-center text-center gap-4">
              <div className="p-4 rounded-full border border-[var(--color-champagne-gold)]/15 text-[var(--color-royal-gold)] bg-[var(--color-luxury-charcoal)]/40">
                <Heart size={20} />
              </div>
              <h3 className="font-cinzel text-md font-bold text-[var(--color-champagne-gold)] uppercase tracking-wide">Handmade</h3>
              <p className="font-poppins text-[10px] text-[var(--color-soft-ivory)]/50 leading-relaxed">
                Individually cut, aligned, and finished. No mass assembly templates.
              </p>
            </div>

            {/* Card 2 */}
            <div className="glass-card p-8 rounded-lg flex flex-col items-center text-center gap-4">
              <div className="p-4 rounded-full border border-[var(--color-champagne-gold)]/15 text-[var(--color-royal-gold)] bg-[var(--color-luxury-charcoal)]/40">
                <Award size={20} />
              </div>
              <h3 className="font-cinzel text-md font-bold text-[var(--color-champagne-gold)] uppercase tracking-wide">Materials</h3>
              <p className="font-poppins text-[10px] text-[var(--color-soft-ivory)]/50 leading-relaxed">
                Rich Honduran mahogany, luxury velvet linings, and authentic leaf gilding.
              </p>
            </div>

            {/* Card 3 */}
            <div className="glass-card p-8 rounded-lg flex flex-col items-center text-center gap-4">
              <div className="p-4 rounded-full border border-[var(--color-champagne-gold)]/15 text-[var(--color-royal-gold)] bg-[var(--color-luxury-charcoal)]/40">
                <Sparkles size={20} />
              </div>
              <h3 className="font-cinzel text-md font-bold text-[var(--color-champagne-gold)] uppercase tracking-wide">Personalized</h3>
              <p className="font-poppins text-[10px] text-[var(--color-soft-ivory)]/50 leading-relaxed">
                Custom wing engravings and monogram options detailed to order specification.
              </p>
            </div>

            {/* Card 4 */}
            <div className="glass-card p-8 rounded-lg flex flex-col items-center text-center gap-4">
              <div className="p-4 rounded-full border border-[var(--color-champagne-gold)]/15 text-[var(--color-royal-gold)] bg-[var(--color-luxury-charcoal)]/40">
                <Truck size={20} />
              </div>
              <h3 className="font-cinzel text-md font-bold text-[var(--color-champagne-gold)] uppercase tracking-wide">Delivery</h3>
              <p className="font-poppins text-[10px] text-[var(--color-soft-ivory)]/50 leading-relaxed">
                Priority packing and tracked logistics ensuring safe courier handling.
              </p>
            </div>

            {/* Card 5 */}
            <div className="glass-card p-8 rounded-lg flex flex-col items-center text-center gap-4">
              <div className="p-4 rounded-full border border-[var(--color-champagne-gold)]/15 text-[var(--color-royal-gold)] bg-[var(--color-luxury-charcoal)]/40">
                <Gift size={20} />
              </div>
              <h3 className="font-cinzel text-md font-bold text-[var(--color-champagne-gold)] uppercase tracking-wide">Packaging</h3>
              <p className="font-poppins text-[10px] text-[var(--color-soft-ivory)]/50 leading-relaxed">
                Every box arrives sealed in protective textured gift wrap with custom ribbon bindings.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* 6. TESTIMONIALS SECTION */}
      <section className="py-28 px-6 bg-[var(--color-luxury-charcoal)]/30 relative overflow-hidden select-none">
        
        {/* Glow leaks */}
        <div className="absolute top-1/2 left-10 w-96 h-96 rounded-full bg-[var(--color-deep-bronze)]/5 blur-[100px] pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <span className="font-poppins text-xs text-[var(--color-royal-gold)] uppercase tracking-[0.3em] font-semibold">Elite Appreciations</span>
          <h2 className="font-cinzel text-3xl md:text-5xl font-bold tracking-wide text-[var(--color-soft-ivory)] mt-2 mb-16">
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
                    className="glass-panel p-10 rounded-lg flex flex-col gap-6 border border-[var(--color-champagne-gold)]/10"
                  >
                    <p className="font-playfair text-md md:text-xl italic text-[var(--color-champagne-gold)]/90 leading-relaxed">
                      &ldquo;{t.text}&rdquo;
                    </p>
                    <div className="flex flex-col">
                      <span className="font-cinzel text-sm font-semibold tracking-wider text-[var(--color-royal-gold)] uppercase">
                        {t.name}
                      </span>
                      <span className="font-poppins text-[9px] text-[var(--color-soft-ivory)]/40 uppercase tracking-widest mt-1">
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
                  idx === currentTestimonial ? 'bg-[var(--color-royal-gold)] w-6' : 'bg-[var(--color-soft-ivory)]/20'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 7. INSTAGRAM GALLERY SECTION */}
      <section className="py-28 px-6 bg-[#070708]/90 select-none">
        <div className="max-w-7xl mx-auto">
          
          {/* Header */}
          <div className="flex flex-col items-center text-center gap-4 mb-20">
            <span className="font-poppins text-xs text-[var(--color-royal-gold)] uppercase tracking-[0.3em] font-semibold">Visual Aesthetics</span>
            <h2 className="font-cinzel text-3xl md:text-5xl font-bold tracking-wide text-[var(--color-soft-ivory)]">
              The Artisan Gallery
            </h2>
            <p className="font-poppins text-xs text-[var(--color-soft-ivory)]/50 uppercase tracking-widest mt-1">
              Tag <span className="text-[var(--color-royal-gold)]">@ArtinovaLux</span> on Instagram to join our digital gallery
            </p>
          </div>

          {/* Masonry Grid */}
          <div className="columns-1 sm:columns-2 md:columns-3 gap-6 space-y-6">
            {instagramGallery.map((img, idx) => (
              <div
                key={idx}
                className="relative overflow-hidden rounded group border border-[var(--color-champagne-gold)]/5 break-inside-avoid shadow-lg"
              >
                <div className={`${img.height} relative w-full`}>
                  <Image
                    src={img.url}
                    alt={`Gallery ${idx + 1}`}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-[#070708]/50 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                    <span className="font-cinzel text-xs uppercase tracking-[0.25em] text-[var(--color-royal-gold)] border border-[var(--color-royal-gold)]/30 py-2 px-6 bg-[#070708]/80 rounded backdrop-blur-sm">
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
