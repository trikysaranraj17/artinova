'use client';

import React, { useState, useEffect, useRef } from 'react';
import NextLink from 'next/link';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { getCollections, getProducts, Collection, Product } from '../lib/db';
import { Sparkles, Award, ShieldCheck, ChevronDown, Check, Heart, ShoppingCart } from 'lucide-react';
import CSSGiftBox from '../components/CSSGiftBox';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import { useWishlistStore } from '../store/wishlistStore';

const Hero3DCanvas = dynamic(() => import('../components/Hero3DCanvas'), { ssr: false });

export default function HomePage() {
  const { user } = useAuthStore();
  const { addItem } = useCartStore();
  const { toggleItem, hasItem } = useWishlistStore();

  const [collections, setCollections] = useState<Collection[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const orbRef = useRef<HTMLDivElement>(null);
  
  // Accordion FAQ states
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Load data
  useEffect(() => {
    async function loadData() {
      try {
        const cols = await getCollections();
        const prods = await getProducts();
        setCollections(cols);
        setProducts(prods);
      } catch (err) {
        console.warn('Error loading homepage data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();

    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 20;
      const y = (e.clientY / window.innerHeight - 0.5) * 20;
      if (orbRef.current) {
        orbRef.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      }
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const trustPillars = [
    { icon: <Sparkles className="text-[#10B981]" size={22} />, title: "Handcrafted Artistry", desc: "Every resin clock, frame, and coaster is meticulously cast and hand-polished." },
    { icon: <Award className="text-[#C9A84C]" size={22} />, title: "Luxury Materials", desc: "Crafted exclusively with optical-grade resins, real gold foils, and preserved botanicals." },
    { icon: <ShieldCheck className="text-[#10B981]" size={22} />, title: "Bespoke Personalization", desc: "Tailor each gift with custom names, dates, text engravings, and photo integration." }
  ];

  const customSteps = [
    { num: "01", title: "Select Design", desc: "Choose clock, frame, or luxury hampers from our collections catalog." },
    { num: "02", title: "Personalize", desc: "Provide names, dates, or upload photos for custom engravings." },
    { num: "03", title: "Handcrafting", desc: "Our local artisans spend up to 48 hours casting and curing your piece." }
  ];

  const customerReviews = [
    { name: "Priya Sharma", city: "Mumbai", review: "The Royal Resin Wall Clock is a masterpiece! It catches the light so beautifully. The packaging felt like opening a high-end luxury watch.", rating: 5, product: "The Royal Resin Clock" },
    { name: "Rohan Malhotra", city: "Delhi", review: "Ordered custom coasters for our anniversary. The gold leaf layout is stunning, and the velvet backing looks so professional.", rating: 5, product: "Resin Coasters Set" },
    { name: "Ananya Iyer", city: "Chennai", review: "The unboxing experience alone is worth every rupee. Artinova has completely redefined what personalized gifting means in India.", rating: 5, product: "Champagne Gifting Hamper" }
  ];

  const faqs = [
    { q: "How long does the customization process take?", a: "Each custom item takes between 3 to 5 business days to cast, cure, and hand-polish. For larger resin art clocks, curing can take up to 7 days to ensure safety in transit." },
    { q: "Can I add custom text or names to my order?", a: "Yes, you can customize any product with engraving names, dates, or personal coordinates in our styling options directly on the details page." },
    { q: "Do you support bulk corporate orders?", a: "Yes! We specialize in custom-tailored luxury corporate gifts, white-label hampers, and branded premium packaging. Send us an inquiry via the Contact page." },
    { q: "What payment methods do you support?", a: "We accept manual UPI payments (GPay, PhonePe, UPI) during checkout. Simply scan the provided QR code and upload your transfer screenshot for approval." }
  ];

  // Filters catalog
  const filteredProducts = products.filter(p => {
    if (activeTab === 'All') return true;
    return p.category_id === activeTab;
  });

  return (
    <div className="relative overflow-hidden bg-[#0A0A0A] text-[#F5F0E8] font-body select-none">
      
      {/* SECTION 1: HERO (100vh) */}
      <section className="relative h-screen w-full flex flex-col items-center justify-center overflow-hidden px-6">
        {/* Three.js Particle Canvas */}
        <Hero3DCanvas />

        {/* Ambient Gold Orb Parallax */}
        <div 
          ref={orbRef}
          className="absolute w-[600px] h-[600px] rounded-full bg-[#C9A84C]/14 blur-[130px] pointer-events-none transition-transform duration-500 ease-out"
          style={{ transform: 'translate3d(0, 0, 0)' }}
        />

        {/* Vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(circle,transparent_40%,#0A0A0A_100%)] pointer-events-none" />

        {/* Center Content */}
        <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center text-center mt-16 md:mt-24 select-none">
          {/* Badge pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 border border-[#C9A84C]/30 bg-[#C9A84C]/5 rounded-full text-[11px] font-accent uppercase tracking-[0.2em] text-[#C9A84C] mb-5">
            ✦ EST. 2023 · HANDCRAFTED IN INDIA ✦
          </div>

          <h1 className="font-display text-[52px] sm:text-[96px] font-bold tracking-tight text-3d-luxury-gold leading-tight mb-4">
            ARTINOVA
          </h1>

          <p className="font-display italic text-2xl sm:text-[32px] text-[#C9A84C] tracking-widest mb-5">
            Crafting Emotions Into Luxury Gifts
          </p>

          <p className="font-body text-base sm:text-[17px] text-[#9A8F7E] max-w-[520px] leading-[1.8] mb-12">
            Bespoke handcrafted resin artwork, custom wedding hampers, and personalized keepsakes designed to preserve life's golden milestones forever.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto px-4 max-w-[320px] sm:max-w-none mb-[80px]">
            <NextLink href="/shop" className="btn-solid-gold w-full sm:w-auto text-center py-4 sm:py-3.5 px-8 text-xs font-accent uppercase tracking-widest font-bold btn-tap-scale">
              Shop Collection
            </NextLink>
            <a 
              href="https://wa.me/919994203670" 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn-gold w-full sm:w-auto text-center py-4 sm:py-3.5 px-8 text-xs font-accent uppercase tracking-widest font-bold btn-tap-scale block cursor-pointer"
            >
              Customize Gift
            </a>
            <a 
              href="https://www.instagram.com/__artinova__/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn-gold w-full sm:w-auto text-center py-4 sm:py-3.5 px-8 text-xs font-accent uppercase tracking-widest font-bold btn-tap-scale block cursor-pointer border-[#10B981]/50 hover:border-[#10B981]"
            >
              VISIT OUR PAGE
            </a>
          </div>
        </div>

        {/* Interactive CSS 3D Box (Right - Hidden on mobile) */}
        <div className="hidden md:block absolute bottom-[15%] right-[10%] z-10 pointer-events-auto">
          <CSSGiftBox />
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 flex flex-col items-center gap-2 text-[#9A8F7E]/50 text-[9px] uppercase tracking-[0.2em] font-accent">
          <span>Scroll to discover</span>
          <div className="w-[1.5px] h-6 bg-gradient-to-b from-[#C9A84C]/60 to-transparent relative overflow-hidden" />
        </div>
      </section>

      {/* SECTION 2: CURATED COLLECTIONS */}
      <section className="sec-pad border-t border-[#C9A84C]/10 bg-[#111111]/45 relative">
        <div className="sec-container">
          <div className="sec-header">
            <span className="sec-label">Bespoke Galleries</span>
            <h2 className="sec-title">Curated Collections</h2>
            <p className="sec-subtitle">Indulge in our categories of custom resin clocks, wedding registries, and premium gifts.</p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-96 rounded bg-[#111111] animate-pulse border border-[#C9A84C]/10 skeleton-box" />
              ))}
            </div>
          ) : (
            <div className="collections-scroll flex gap-5 overflow-x-auto snap-x snap-mandatory pb-8 scrollbar-none md:grid md:grid-cols-3 xl:flex xl:overflow-x-auto w-full">
              {collections.map((col) => (
                <NextLink 
                  href={`/shop?category=${col.slug}`} 
                  key={col.id}
                  className="collection-card snap-start shrink-0 w-[240px] md:w-auto xl:w-[240px] rounded-xl overflow-hidden bg-[#161616] border border-[#C9A84C]/10 hover:border-[#C9A84C]/50 hover:-translate-y-1.5 transition-all duration-300 hover:shadow-[0_0_0_1px_rgba(201,168,76,0.5),0_20px_60px_rgba(201,168,76,0.1)] flex flex-col justify-end h-96 relative group"
                >
                  {/* Image Area aspect 3/4 */}
                  <div className="absolute inset-0 z-0 w-full h-full">
                    <img 
                      src={col.banner_url || "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=600"} 
                      alt={col.name} 
                      className="w-full h-full object-cover opacity-50 group-hover:scale-105 group-hover:opacity-75 transition-all duration-700" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/40 to-transparent" />
                  </div>

                  {/* Text alignment padding-bottom 16px */}
                  <div className="relative z-10 w-full border-t border-[#C9A84C]/20 bg-[#0A0A0A]/85 backdrop-blur-sm">
                    <h3 className="font-accent text-sm tracking-[2px] uppercase text-[#F5F0E8] p-[16px_20px_4px] group-hover:text-[#C9A84C] transition-colors">{col.name}</h3>
                    <p className="font-body text-xs text-[#C9A84C]/70 p-[0_20px_16px] font-medium">Bespoke Catalog</p>
                  </div>
                </NextLink>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* SECTION 3: PRODUCT GRID SECTION */}
      <section className="sec-pad border-t border-[#C9A84C]/10 bg-[#0A0A0A]">
        <div className="sec-container">
          <div className="sec-header">
            <span className="sec-label">Our Creations</span>
            <h2 className="sec-title">Bespoke Masterpieces</h2>
            <p className="sec-subtitle">Browse through our handcrafted customized products ready for direct commissions.</p>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center justify-center gap-2 overflow-x-auto pb-4 scrollbar-none w-full mb-10 snap-x">
            {['All', 'cat-art', 'cat-hampers', 'cat-frames', 'cat-chocolates'].map((tab) => {
              const labelMap: Record<string, string> = {
                'All': 'All Creations',
                'cat-art': 'Resin Clocks',
                'cat-hampers': 'Luxury Hampers',
                'cat-frames': 'Custom Frames',
                'cat-chocolates': 'Chocolate Covers'
              };
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`h-9 px-5 rounded-full text-[13px] font-accent uppercase tracking-widest transition-all duration-300 shrink-0 cursor-pointer ${
                    activeTab === tab
                      ? 'bg-[#C9A84C] text-[#0A0A0A] font-bold shadow-[0_0_12px_rgba(201,168,76,0.35)]'
                      : 'bg-[#111111] text-[#9A8F7E] hover:text-[#F5F0E8] border border-[#C9A84C]/10 hover:border-[#C9A84C]'
                  }`}
                >
                  {labelMap[tab]}
                </button>
              );
            })}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="aspect-square rounded-lg bg-[#111111] animate-pulse border border-[#C9A84C]/10 skeleton-box" />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-16 px-6 bg-[#111111]/40 border border-[#C9A84C]/10 rounded-lg max-w-xl mx-auto flex flex-col items-center gap-4">
              <span className="text-[#C9A84C] text-xl">✦</span>
              <h3 className="font-display italic text-lg text-[#F5F0E8]">Bespoke Catalog Curation</h3>
              <p className="font-body text-xs text-[#9A8F7E] leading-relaxed">
                We design custom gifts on commission. Access the secure admin panel to populate products, or click below to describe your dream geode resin piece.
              </p>
              <a 
                href="https://wa.me/919994203670" 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn-solid-gold py-2.5 px-6 text-[9px] font-accent uppercase tracking-widest font-extrabold mt-2 btn-tap-scale cursor-pointer"
              >
                Commission Custom Gift
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 items-stretch">
              {filteredProducts.map((p) => {
                const inWishlist = hasItem(p.id);
                return (
                  <div key={p.id} className="luxury-card relative flex flex-col h-full bg-[#161616] group">
                    {/* TL Badge */}
                    <div className="absolute top-2 left-2 sm:top-3 sm:left-3 z-20 pointer-events-none">
                      {p.is_featured && (
                        <span className="px-1.5 py-0.5 sm:px-3 sm:py-1.5 bg-gradient-to-r from-[#064E3B] to-[#10B981] text-white text-[7px] sm:text-[9px] font-accent uppercase tracking-widest font-bold shadow-md rounded-sm border border-[#10B981]/25">
                          Bestseller
                        </span>
                      )}
                    </div>

                    {/* TR Wishlist Heart */}
                    <button 
                      onClick={() => toggleItem(user?.id || 'guest', p.id)}
                      className="absolute top-2 right-2 sm:top-3 sm:right-3 z-20 w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-[#0A0A0A]/60 border border-[#C9A84C]/15 hover:border-[#C9A84C] text-[#F5F0E8]/70 hover:text-red-400 flex items-center justify-center transition-all cursor-pointer"
                      title="Add to Wishlist"
                    >
                      <Heart size={12} fill={inWishlist ? '#C9A84C' : 'none'} className={inWishlist ? 'text-[#C9A84C] w-3 h-3 sm:w-3.5 sm:h-3.5' : 'w-3 h-3 sm:w-3.5 sm:h-3.5'} />
                    </button>

                    {/* Product Image aspect-ratio 1/1 */}
                    <NextLink href={`/products/${p.slug}`} className="relative aspect-square w-full overflow-hidden block bg-[#0D0D0D] rounded-t-lg">
                      <img 
                        src={p.images[0] || '/images/placeholder.jpg'} 
                        alt={p.name} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                      />
                    </NextLink>

                    {/* Content padding 16px */}
                    <div className="p-3 sm:p-4 flex flex-col flex-grow gap-1 sm:gap-1.5">
                      <span className="font-accent text-[8px] sm:text-[10px] tracking-[1px] sm:tracking-[2px] text-[#C9A84C]/80 uppercase">Handcrafted</span>
                      <h3 className="font-display text-xs sm:text-[18px] text-[#F5F0E8] leading-snug group-hover:text-[#C9A84C] transition-colors mb-1 min-h-[36px] sm:min-h-[50px] font-bold break-words">
                        {p.name}
                      </h3>
                      
                      {/* Review stars */}
                      <div className="flex items-center gap-0.5 text-[#C9A84C] text-[8px] sm:text-[10px] mb-1 sm:mb-2">
                        {Array.from({ length: 5 }).map((_, idx) => (
                          <span key={idx}>★</span>
                        ))}
                        <span className="text-[#9A8F7E] text-[8px] sm:text-[10px] ml-1">({p.review_count || 0})</span>
                      </div>

                      {/* Pricing */}
                      <div className="flex items-center justify-between mt-auto pt-1.5 sm:pt-2 border-t border-[#C9A84C]/5">
                        <span className="font-body text-xs sm:text-base text-[#C9A84C] font-bold">
                          ₹{p.price.toLocaleString()}
                        </span>
                        {p.original_price && (
                          <span className="font-body text-[#9A8F7E]/50 line-through text-[9px] sm:text-[11px] ml-1.5 sm:ml-2">
                            ₹{p.original_price.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Add to Cart button translates up on hover */}
                    <button 
                      onClick={() => addItem(user?.id || 'guest', p.id, 1)}
                      className="w-full bg-[#111111] border-t border-[#C9A84C]/25 text-[#C9A84C] hover:bg-[#C9A84C] hover:text-[#0A0A0A] py-2 sm:py-3 text-[8px] sm:text-[9px] font-accent uppercase tracking-widest font-extrabold transition-all duration-300 cursor-pointer btn-tap-scale"
                    >
                      Add To Cart
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* SECTION 4: WHY ARTINOVA (Trust Pillars) */}
      <section className="sec-pad border-t border-[#C9A84C]/10 bg-[#111111]/45 relative">
        <div className="sec-container">
          <div className="sec-header">
            <span className="sec-label">Our Philosophy</span>
            <h2 className="sec-title">Gilded Quality Standards</h2>
            <p className="sec-subtitle">Akash and our local artisans commit to royal, luxury standards for every geode creation.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[28px] auto-rows-stretch w-full">
            {trustPillars.map((pillar, i) => (
              <div key={i} className="p-[36px_28px] rounded-2xl bg-[#111] border border-[#C9A84C]/5 hover:border-[#C9A84C]/25 transition-all duration-300 flex flex-col items-center text-center shadow-lg">
                <div className="w-14 h-14 rounded-full bg-[#0A0A0A] border border-[#C9A84C]/15 flex items-center justify-center mb-5 shrink-0">
                  {pillar.icon}
                </div>
                <div className="flex flex-col gap-2">
                  <h3 className="font-accent text-xs font-bold uppercase tracking-widest text-[#F5F0E8]">{pillar.title}</h3>
                  <p className="font-body text-sm text-[#9A8F7E] leading-relaxed max-w-[240px]">{pillar.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 5: THE COMMISSIONING TIMELINE */}
      <section className="sec-pad border-t border-[#C9A84C]/10 bg-[#0A0A0A]">
        <div className="sec-container">
          <div className="sec-header">
            <span className="sec-label">How It Works</span>
            <h2 className="sec-title">Bespoke Design Journey</h2>
            <p className="sec-subtitle">Crafting your emotions into luxury creations is a seamless three-step process.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative max-w-5xl mx-auto z-10 w-full">
            {/* Connector Line (Desktop) */}
            <div className="hidden md:block absolute top-8 left-[15%] right-[15%] h-[1px] bg-gradient-to-r from-transparent via-[#10B981]/40 via-[#C9A84C]/40 to-transparent z-0" />

            {customSteps.map((step, i) => (
              <div key={i} className="flex flex-col items-center text-center gap-4 relative z-10 group select-none">
                <div className={`w-16 h-16 rounded-full bg-[#111111] border-2 ${i % 2 === 0 ? 'border-[#10B981]/35 group-hover:border-[#10B981] text-[#10B981]' : 'border-[#C9A84C]/35 group-hover:border-[#C9A84C] text-[#C9A84C]'} flex items-center justify-center text-sm font-accent font-bold shadow-lg transition-colors duration-300`}>
                  {step.num}
                </div>
                <h3 className="font-accent text-xs font-bold uppercase tracking-widest text-[#F5F0E8] mt-2">{step.title}</h3>
                <p className="font-body text-xs text-[#9A8F7E] max-w-[240px] leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 6: CLIENT REVIEWS (Testimonials Masonry Grid) */}
      <section className="sec-pad border-t border-[#C9A84C]/10 bg-[#111111]/45">
        <div className="sec-container">
          <div className="sec-header">
            <span className="sec-label">True Patron Reviews</span>
            <h2 className="sec-title">Words From Our Customers</h2>
            <p className="sec-subtitle">Review verification is logs authenticated directly from real transaction feedback.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 w-full">
            {customerReviews.map((rev, idx) => {
              const isEven = idx % 2 === 0;
              return (
                <div key={idx} className={`p-7 rounded-xl bg-[#111] border ${isEven ? 'border-[#10B981]/15 hover:border-[#10B981]' : 'border-[#C9A84C]/10 hover:border-[#C9A84C]'} transition-all duration-300 flex flex-col gap-4 shadow-md`}>
                  {/* 5 stars */}
                  <div className="flex items-center gap-0.5 text-[#C9A84C] text-[10px]">
                    {Array.from({ length: rev.rating }).map((_, i) => <span key={i}>★</span>)}
                  </div>
                  {/* Review italic */}
                  <p className="font-body italic text-[15px] text-[#9A8F7E] leading-relaxed mb-1">
                    "{rev.review}"
                  </p>
                  
                  {/* Divider */}
                  <div className={`h-[1px] ${isEven ? 'bg-[#10B981]/15' : 'bg-[#C9A84C]/15'} w-full mt-auto`} />

                  {/* Avatar circle */}
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full bg-[#0A0A0A] border ${isEven ? 'border-[#10B981]/35 text-[#10B981]' : 'border-[#C9A84C]/35 text-[#C9A84C]'} flex items-center justify-center text-xs font-accent font-extrabold shrink-0`}>
                      {rev.name.charAt(0)}
                    </div>
                    <div className="flex flex-col leading-none">
                      <span className="font-body text-sm text-[#F5F0E8] font-bold">{rev.name}</span>
                      <span className="font-body text-xs text-[#9A8F7E]/60 mt-1">{rev.city}</span>
                      <span className={`font-accent text-[9px] ${isEven ? 'text-[#10B981]' : 'text-[#C9A84C]'} mt-1.5 uppercase tracking-wider`}>via {rev.product}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECTION 7: FAQ ACCORDION SECTION */}
      <section className="sec-pad border-t border-[#C9A84C]/10 bg-[#0A0A0A]">
        <div className="sec-container">
          <div className="sec-header">
            <span className="sec-label">Curated Answers</span>
            <h2 className="sec-title">Frequently Asked Questions</h2>
            <p className="sec-subtitle">Find immediate logs detailing customization times, logistics, and verification steps.</p>
          </div>

          <div className="max-w-[768px] mx-auto flex flex-col gap-0 w-full bg-[#111] p-6 rounded-xl border border-[#C9A84C]/10 shadow-lg select-none">
            {faqs.map((faq, i) => {
              const isOpen = openFaq === i;
              return (
                <div key={i} className="border-b border-white/5 last:border-b-0 flex flex-col">
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : i)}
                    className="w-full py-5 flex items-center justify-between text-left gap-4 font-body text-base font-medium text-[#F5F0E8] hover:text-[#C9A84C] transition-colors cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown 
                      size={18} 
                      className={`text-[#C9A84C] transition-transform duration-300 shrink-0 ${isOpen ? 'rotate-180' : ''}`} 
                    />
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="overflow-hidden"
                      >
                        <div className="pb-5 font-body text-sm text-[#9A8F7E] leading-relaxed">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECTION 8: CALL TO ACTION */}
      <section className="sec-pad max-w-5xl mx-auto px-6 select-none">
        <div className="p-8 md:p-16 rounded-xl bg-[#111111] border border-[#C9A84C]/15 relative overflow-hidden flex flex-col items-center text-center gap-6 shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-[#C9A84C]/5 blur-[80px] pointer-events-none" />
          <span className="text-[#C9A84C] text-2xl font-serif">✦</span>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#F5F0E8] tracking-wide leading-tight">Looking for Custom Gifting?</h2>
          <p className="font-body text-xs sm:text-sm text-[#9A8F7E] max-w-xl leading-relaxed">
            Whether it is an upcoming luxury wedding union, a corporate leadership presentation set, or a geode resin clock to match your living room walls, our studio can craft a customized creation tailored exactly to your emotions.
          </p>
          <a 
            href="https://wa.me/919994203670" 
            target="_blank" 
            rel="noopener noreferrer"
            className="btn-solid-gold py-3.5 px-10 text-xs font-accent uppercase tracking-widest font-bold btn-tap-scale block cursor-pointer text-center"
          >
            Start A Bespoke Request
          </a>
        </div>
      </section>

    </div>
  );
}
