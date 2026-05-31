'use client';

import React, { useState, useEffect } from 'react';
import NextLink from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { getProducts, Product } from '../lib/db';
import { useApp } from '../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Sparkles, Award, ShieldCheck, Truck, Gift, Heart, Eye, Camera, Layers, Users, Smile, Info } from 'lucide-react';

// Dynamically import the R3F 3D Hero canvas with SSR disabled to prevent Node compilation errors
const Hero3DCanvas = dynamic(() => import('../components/Hero3DCanvas'), { ssr: false });
import useReveal from '../hooks/useReveal';

export default function HomePage() {
  const { addItemToCart, toggleItemWishlist, wishlist } = useApp();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loaderVisible, setLoaderVisible] = useState(true);

  useReveal();

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

    // Dynamic background polling interval (2 seconds)
    const interval = setInterval(() => {
      loadData(false);
    }, 2000);

    // Cinematic loading timer
    const timer = setTimeout(() => {
      setLoaderVisible(false);
    }, 1800);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('focus', handleFocus);
      clearInterval(interval);
    };
  }, []);


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

      {/* 2. HERO SECTION WITH VIDEO CANVAS */}
      <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">
        
        <video
          autoPlay
          muted
          loop
          playsInline
          className="video-bg"
          src="https://cdn.shopify.com/videos/c/o/v/6f7c6f0d9c4e4b5f8c1e8b3b3b3b3b3b.mp4"
        />

        {/* Cinematic Vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(circle,transparent_20%,#070708_100%)] pointer-events-none" />

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

            {/* Title / Brand Name */}
            <h1 className="font-cinzel text-6xl md:text-8xl font-extrabold tracking-widest text-[var(--color-soft-ivory)] text-center mb-4 filter drop-shadow-lg">
              ARTINOVA
            </h1>

            {/* Subtitle description */}
            <p className="font-cinzel text-xl md:text-2xl text-[var(--color-royal-gold)] max-w-lg mt-2 leading-relaxed tracking-wider">
              Crafting Emotions Into Luxury Gifts
            </p>

            <p className="font-poppins text-xs md:text-sm text-[var(--color-soft-ivory)]/60 max-w-lg mt-6 leading-relaxed">
              Bespoke collections tailored for royalty, weddings, and milestones. Individually molded, hand-polished, and custom-packaged.
            </p>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center gap-5 mt-10 w-full sm:w-auto">
              <NextLink
                href="/shop"
                className="btn-solid-gold w-full sm:w-auto text-center px-8 py-3 text-sm font-bold shadow-[0_0_20px_rgba(212,175,55,0.4)]"
              >
                Shop Now
              </NextLink>
              <NextLink
                href="#about"
                className="btn-gold w-full sm:w-auto text-center px-8 py-3 text-sm font-bold"
              >
                Explore Collection
              </NextLink>
            </div>
          </motion.div>
        </div>

        {/* Animated mouse scroll hint */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none opacity-40 hover:opacity-100 transition-opacity">
          <div style={{ width: '1px', height: '100px', background: 'var(--gradient-gold)', animation: 'scroll-line 3s infinite' }}></div>
          <style jsx>{`
            @keyframes scroll-line {
              0% { transform: scaleY(0); transform-origin: top; opacity: 0; }
              50% { transform: scaleY(1); transform-origin: top; opacity: 1; }
              51% { transform: scaleY(1); transform-origin: bottom; opacity: 1; }
              100% { transform: scaleY(0); transform-origin: bottom; opacity: 0; }
            }
          `}</style>
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
                  <div
                    key={product.id}
                    className="luxury-card reveal flex flex-col h-full rounded-lg overflow-hidden group perspective-container"
                  >
                    {/* Card Image Container */}
                    <div className="relative h-72 w-full img-zoom-container">
                      <Image
                        src={product.images[0] || 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800'}
                        alt={product.title}
                        fill
                        className="object-cover"
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
                        className="w-full py-3 border border-[var(--color-royal-gold)]/30 hover:border-[var(--color-royal-gold)] hover:bg-[var(--color-royal-gold)] hover:text-matte-black transition-all duration-300 font-poppins text-[10px] uppercase tracking-[0.2em] font-semibold cursor-pointer z-10"
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* 4. OUR BESPOKE SERVICES SECTION */}
      <section id="services" className="py-28 px-6 bg-[#070708] relative select-none">
        {/* Glow leaks */}
        <div className="absolute top-1/3 right-10 w-[500px] h-[500px] rounded-full bg-[var(--color-royal-gold)]/5 blur-[150px] pointer-events-none" />
        <div className="absolute bottom-1/3 left-10 w-[500px] h-[500px] rounded-full bg-[var(--color-burgundy-glow)]/5 blur-[150px] pointer-events-none" />

        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="flex flex-col items-center text-center mb-20 gap-4">
            <span className="font-poppins text-xs text-[var(--color-royal-gold)] uppercase tracking-[0.35em] font-semibold border border-[var(--color-royal-gold)]/20 py-1.5 px-4 rounded-full bg-[#070708]/50 backdrop-blur-md">
              Bespoke Gift Catalog
            </span>
            <h2 className="font-cinzel text-3xl md:text-5xl font-bold tracking-wide text-[var(--color-soft-ivory)] mt-2">
              Our Creative Creations
            </h2>
            <div className="w-24 h-[1px] bg-gradient-to-r from-transparent via-[var(--color-royal-gold)] to-transparent mt-4" />
            <p className="font-poppins text-xs md:text-sm text-[var(--color-soft-ivory)]/50 max-w-2xl mt-4 leading-relaxed">
              Explore our curated range of custom gifts and handcrafted items. Every piece is crafted individually and delivered with love across India.
            </p>
          </div>

          {/* Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {catalogWorks.map((work, index) => {
              const IconComponent = work.icon;
              return (
                <div
                  key={index}
                  className="glass-card hover:border-[var(--color-royal-gold)]/40 p-8 rounded-2xl flex flex-col justify-between relative overflow-hidden group border border-[var(--color-champagne-gold)]/5 h-full"
                >
                  {/* Subtle Gradient Glow in card background on hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${work.color} opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none`} />

                  <div className="relative z-10 flex flex-col gap-5">
                    {/* Top Bar: Icon & Badge */}
                    <div className="flex items-center justify-between gap-4">
                      <div className="p-3.5 rounded-xl bg-matte-black/60 border border-[var(--color-champagne-gold)]/10 text-[var(--color-royal-gold)] shadow-md group-hover:scale-110 transition-transform duration-500">
                        <IconComponent size={20} />
                      </div>
                      <span className="bg-[var(--color-royal-gold)]/10 border border-[var(--color-royal-gold)]/20 px-3 py-1 text-[8.5px] uppercase tracking-widest text-[var(--color-royal-gold)] rounded-full font-semibold font-poppins">
                        {work.badge}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="flex flex-col gap-2.5">
                      <h3 className="font-cinzel text-lg md:text-xl font-bold tracking-wide text-[var(--color-soft-ivory)] group-hover:text-[var(--color-royal-gold)] transition-colors">
                        {work.title}
                      </h3>
                      <p className="font-poppins text-[11.5px] text-[var(--color-soft-ivory)]/65 leading-relaxed">
                        {work.description}
                      </p>
                    </div>

                    {/* Pricing details banner */}
                    <div className="p-3.5 rounded-lg bg-matte-black/40 border border-[var(--color-champagne-gold)]/5 flex flex-col gap-1 mt-1">
                      <div className="flex justify-between items-center text-xs font-semibold font-poppins text-[var(--color-royal-gold)]">
                        <span>Price:</span>
                        <span>{work.price}</span>
                      </div>
                      <div className="flex items-center gap-1.5 font-poppins text-[9.5px] text-[var(--color-soft-ivory)]/40 mt-0.5">
                        <Info size={10} className="shrink-0 text-[var(--color-royal-gold)]/50" />
                        <span className="truncate">{work.detail}</span>
                      </div>
                    </div>

                    {/* List Features */}
                    <ul className="flex flex-col gap-2 mt-2">
                      {work.features.map((feat, fIndex) => (
                        <li key={fIndex} className="flex items-center gap-2.5 font-poppins text-[10.5px] text-[var(--color-soft-ivory)]/55">
                          <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-royal-gold)]/60 shrink-0" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Actions */}
                  <div className="relative z-10 mt-8 pt-4 border-t border-[var(--color-champagne-gold)]/5 flex items-center justify-between gap-4">
                    <NextLink
                      href="/contact"
                      className="w-full text-center py-2.5 rounded border border-[var(--color-royal-gold)]/30 hover:border-[var(--color-royal-gold)] hover:bg-[var(--color-royal-gold)] hover:text-matte-black transition-all duration-300 font-poppins text-[9px] uppercase tracking-[0.2em] font-bold z-10 cursor-pointer"
                    >
                      Inquire / Order Now
                    </NextLink>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* End of content */}

    </div>
  );
}

const catalogWorks = [
  {
    title: "Bespoke Photo Frames",
    description: "Your cherished memories, beautifully framed in premium quality wood. Available in 12+ custom sizes.",
    price: "₹250 - ₹4,500",
    detail: "Sizes: 3x4\" to 30x40\"",
    badge: "Best Seller",
    features: ["Premium Wood Frame", "Includes Design Charge", "Includes Shipping"],
    icon: Layers,
    color: "from-amber-500/10 to-yellow-500/10"
  },
  {
    title: "Custom Wrapper & Photo Chocolates",
    description: "Make every moment sweeter with high quality chocolates and custom designed photo wrappers.",
    price: "Small ₹25 | Medium ₹70 | Large ₹400",
    detail: "Min. Order: Small (30 pcs) | Med (12 pcs)",
    badge: "Personalized",
    features: ["Premium Taste", "Personalized photo wrappers", "Includes Shipping"],
    icon: Gift,
    color: "from-rose-500/10 to-pink-500/10"
  },
  {
    title: "Artisan Gift Bouquets",
    description: "Thoughtful bouquets styled beautifully with fresh/preserved flowers, chocolates, or jewelry.",
    price: "₹850 - ₹1,300",
    detail: "Flower, Chocolate, Caring, Photo, Accessories",
    badge: "Elegant Design",
    features: ["Premium arrangement", "Custom styling options", "Includes Shipping"],
    icon: Sparkles,
    color: "from-purple-500/10 to-indigo-500/10"
  },
  {
    title: "Luminous Polaroid Prints",
    description: "Retro polaroid prints available with ambient fairy lights to beautifully light up your favorite memories.",
    price: "₹149 - ₹649",
    detail: "Small, Medium & Large sets (10 or 24 pics)",
    badge: "Highly Popular",
    features: ["With or Without Light options", "High quality photo print", "Includes Shipping"],
    icon: Camera,
    color: "from-teal-500/10 to-emerald-500/10"
  },
  {
    title: "Custom Photo Magnets & Prints",
    description: "Turn your refrigerator or metallic boards into a gallery of memories with custom magnet sets.",
    price: "₹149 - ₹249",
    detail: "Sizes: 3x4\" (10 Pcs), 4x6\" (10 Pcs), 8x12\" (5 Pcs)",
    badge: "New Arrival",
    features: ["Durable magnetic back", "Vivid color printing", "Includes Shipping"],
    icon: Smile,
    color: "from-cyan-500/10 to-blue-500/10"
  },
  {
    title: "Curated Gift Hampers",
    description: "Stunning themed hampers tailored for weddings, birthdays, anniversaries, or house warmings.",
    price: "Custom Budget",
    detail: "Fully custom hampers made for your budget",
    badge: "Specialty",
    features: ["Tailored assortment", "Premium boxes & trays", "Occasion styling"],
    icon: Award,
    color: "from-amber-600/10 to-red-600/10"
  },
  {
    title: "Occasion Return Gifts",
    description: "Delight your guests with customized return gifts for baby showers, naming ceremonies, or half-sarees.",
    price: "Bulk Quote Available",
    detail: "Handmade concepts tailored to your request",
    badge: "Bulk Ordering",
    features: ["Themed branding", "Heartfelt tags", "Customized layout options"],
    icon: Users,
    color: "from-orange-500/10 to-amber-500/10"
  },
  {
    title: "Handmade Charm Bracelets",
    description: "Intricately hand-woven charm bracelets. Beautifully handmade with love, just for you.",
    price: "₹35 per Piece",
    detail: "Min. Order: 5 Pieces",
    badge: "Bespoke Jewelry",
    features: ["Butterfly & star charms", "Includes Shipping", "Custom color threads"],
    icon: Heart,
    color: "from-rose-600/10 to-red-500/10"
  },
  {
    title: "3D Miniature Couple Frames",
    description: "Enchanting 3D clay-style miniatures of couples and families housed in premium glass shadow frames.",
    price: "A4: ₹1,599 | A3: ₹2,599",
    detail: "A4 & A3 sizes with custom text and details",
    badge: "Signature Art",
    features: ["Handcrafted figurines", "Premium frame housing", "Includes Shipping"],
    icon: ShieldCheck,
    color: "from-yellow-600/10 to-amber-500/10"
  },
  {
    title: "Anime Poster Packs",
    description: "Vibrant, high-resolution anime posters available in customized packs to style your personal space.",
    price: "₹89 - ₹199",
    detail: "9 Poster (4x6\"), 4 Poster (6x8\"), 2 Poster (8x12\")",
    badge: "Fan Favorite",
    features: ["Vivid print details", "Durable card stock", "Includes Shipping"],
    icon: Layers,
    color: "from-purple-600/10 to-pink-500/10"
  }
];
