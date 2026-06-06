'use client';

import React, { useState, useEffect, useRef } from 'react';
import NextLink from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { getProducts, getCollections, Product, Collection, createContactRequest } from '../lib/db';
import { useCartStore } from '../store/cartStore';
import { useWishlistStore } from '../store/wishlistStore';
import { useAuthStore } from '../store/authStore';
import { 
  ArrowRight, Sparkles, Award, ShieldCheck, Heart, Eye, 
  Layers, Users, Smile, HelpCircle, ChevronDown, Check, Send, Compass 
} from 'lucide-react';
import CSSGiftBox from '../components/CSSGiftBox';

const Hero3DCanvas = dynamic(() => import('../components/Hero3DCanvas'), { ssr: false });

export default function HomePage() {
  const { user } = useAuthStore();
  const { addItem } = useCartStore();
  const { toggleItem, hasItem, fetchWishlist } = useWishlistStore();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Tabs & filters
  const [activeTab, setActiveTab] = useState('All');
  
  // Modals & States
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);
  const [quoteForm, setQuoteForm] = useState({ name: '', email: '', phone: '', company: '', message: '' });
  const [quoteSubmitted, setQuoteSubmitted] = useState(false);

  // FAQ states
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Packaging gallery
  const [packagingIndex, setPackagingIndex] = useState(0);

  // Parallax background coordinates
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });

  // Load products & collections
  useEffect(() => {
    async function loadData() {
      try {
        const prods = await getProducts();
        const cols = await getCollections();
        setProducts(prods);
        setCollections(cols);
        if (user) {
          fetchWishlist(user.id);
        } else {
          fetchWishlist('guest');
        }
      } catch (err) {
        console.warn('Error loading homepage data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();

    // Mouse movement listener for gold orb parallax
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 30;
      const y = (e.clientY / window.innerHeight - 0.5) * 30;
      setMouseOffset({ x, y });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [user]);

  // Corporate quote submit
  const handleQuoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quoteForm.name || !quoteForm.email || !quoteForm.phone) return;
    
    try {
      await createContactRequest({
        name: quoteForm.name,
        email: quoteForm.email,
        phone: quoteForm.phone,
        message: `Company: ${quoteForm.company}. Message: ${quoteForm.message}`,
        type: 'corporate'
      });
      setQuoteSubmitted(true);
      setTimeout(() => {
        setQuoteSubmitted(false);
        setQuoteModalOpen(false);
        setQuoteForm({ name: '', email: '', phone: '', company: '', message: '' });
      }, 3000);
    } catch (err) {
      console.error(err);
    }
  };

  // Filter products by selected active category
  const filteredProducts = products.filter(p => {
    if (activeTab === 'All') return true;
    if (activeTab === 'Resin Art') return p.category_id === 'cat-art';
    if (activeTab === 'Wedding') return p.slug.includes('wedding') || p.category_id === 'cat-hampers';
    if (activeTab === 'Birthday') return p.slug.includes('dish') || p.category_id === 'cat-accessories';
    if (activeTab === 'Corporate') return p.slug.includes('corp') || p.slug.includes('keepsake');
    return true;
  });

  const trustPillars = [
    { icon: <Sparkles className="text-[#C9A84C]" size={22} />, title: "Handcrafted With Love", desc: "Every single artifact is carefully conceptualized and cast by hand." },
    { icon: <Award className="text-[#C9A84C]" size={22} />, title: "Premium Quality Materials", desc: "Using strictly luxury-grade resins, gold leaves, and real botanicals." },
    { icon: <Layers className="text-[#C9A84C]" size={22} />, title: "Luxury Packaging", desc: "Arrives in our signature velvet boxes complete with a wax seal stamp." },
    { icon: <Compass className="text-[#C9A84C]" size={22} />, title: "Pan-India Shipping", desc: "Safe, transit-insured delivery across India to your doorstep." },
    { icon: <ShieldCheck className="text-[#C9A84C]" size={22} />, title: "100% Customizable", desc: "Engrave initials, messages, and cast customized flower patterns." },
    { icon: <Users className="text-[#C9A84C]" size={22} />, title: "10,000+ Happy Customers", desc: "Loved by couples, newly-weds, and corporate clients nationwide." }
  ];

  const customizationSteps = [
    { num: "01", title: "Choose Your Creation", desc: "Select from our curated catalog of custom clocks, frames, or keepsakes.", icon: "🎨" },
    { num: "02", title: "Personalize Details", desc: "Provide initials, upload high-resolution images, and select gold foil densities.", icon: "✒️" },
    { num: "03", title: "We Handcraft", desc: "Our local artisans spend up to 48 hours casting, curing, and polishing your piece.", icon: "⏳" },
    { num: "04", title: "Delivered in Style", desc: "Arrives wrapped in premium velvet ribbon boxes with customized cards.", icon: "🎁" }
  ];

  const packagingGallery = [
    { title: "Obsidian Gift Chest", desc: "Our signature rigid textured black box detailed with gold foil logos.", url: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800" },
    { title: "Champagne Velvet Ribbon", desc: "Elegant silk ribbon wraps to keep your emotions perfectly intact.", url: "https://images.unsplash.com/photo-1513201099705-a9746e1e201f?w=800" },
    { title: "Bespoke Wax Stamp Seal", desc: "Traditional red wax seals authenticating the handmade origin.", url: "https://images.unsplash.com/photo-1574926053821-79c5e338a933?w=800" },
    { title: "Ivory Tissue Lining", desc: "Delicate premium lining detailed with dried botanical lavender sprays.", url: "https://images.unsplash.com/photo-1607344645866-009c320c5ab8?w=800" },
    { title: "Gold Calligraphy Letter", desc: "A hand-penned card carrying your greeting messages.", url: "https://images.unsplash.com/photo-1512909006721-3d6018887383?w=800" }
  ];

  const customerReviews = [
    { name: "Priya Sharma", city: "Mumbai", review: "The Royal Resin Wall Clock is a masterpiece! It catches the light so beautifully. The packaging felt like opening a high-end luxury watch.", rating: 5, product: "The Royal Resin Clock" },
    { name: "Rohan Malhotra", city: "Delhi", review: "Ordered custom coasters for our anniversary. The gold leaf layout is stunning, and the velvet backing looks so professional.", rating: 5, product: "Resin Coasters Set" },
    { name: "Ananya Iyer", city: "Chennai", review: "The unboxing experience alone is worth every rupee. Artinova has completely redefined what personalized gifting means in India.", rating: 5, product: "Champagne Gifting Hamper" },
    { name: "Abhishek Das", city: "Bangalore", review: "White-label corporate hampers for our leadership team were customized with our emblem. Phenomenal craftsmanship.", rating: 5, product: "Sandalwood Gift Chest" },
    { name: "Sneha Reddy", city: "Hyderabad", review: "Our wedding photos preserved in the botanical glass frame look breathtaking. Thank you, Akash and the artisans!", rating: 5, product: "Botanical Photo Frame" },
    { name: "Vikram Sen", city: "Kolkata", review: "Elegant, premium, and delivered on time. The photo accordion is a beautiful memory keeper. Highly recommended.", rating: 5, product: "Photo Accordion Box" }
  ];

  const faqs = [
    { q: "How long does the customization process take?", a: "Each custom item takes between 3 to 5 business days to cast, cure, and hand-polish. For larger resin art clocks, curing can take up to 7 days to ensure safety in transit." },
    { q: "Can I add custom text or names to my order?", a: "Yes, you can customize any product with engraving names, dates, or personal coordinates in our styling options directly on the details page." },
    { q: "Do you support bulk corporate orders?", a: "Yes! We specialize in custom-tailored luxury corporate gifts, white-label hampers, and branded premium packaging. Request a corporate quote below." },
    { q: "What payment methods do you support?", a: "We accept manual UPI payments (GPay, PhonePe, UPI) during checkout. Simply scan the provided QR code and upload your transfer screenshot for approval." },
    { q: "How do I track my order logistics?", a: "After checkout and verification, your tracking link will be visible on your dashboard under 'My Orders', updating you from 'Crafting Started' through 'Delivered'." },
    { q: "What if my luxury product arrives damaged?", a: "Every order is transit-insured. In the rare event of transit damage, notify us via WhatsApp (+91 99942 03670) within 24 hours with photos for a free replacement." },
    { q: "Do you ship internationally?", a: "Currently, we only deliver within India. We offer free shipping nationwide on all orders over ₹999." },
    { q: "Can I return a customized resin item?", a: "Because custom gifts are personalized with names, photos, and unique dates, they cannot be returned or refunded unless they arrive damaged." },
    { q: "How do I upload photos for photo frames?", a: "You can upload high-resolution JPEG/PNG files directly in the customization uploader on the product page before adding items to the cart." },
    { q: "What is the UPI ID for direct transfers?", a: "Our official UPI transfer ID is artinova@upi. You will find this UPI ID and a direct GPay QR code on the payment step of our checkout." }
  ];

  return (
    <div className="relative overflow-hidden bg-[#0A0A0A] text-[#F5F0E8] font-body">
      
      {/* SECTION 1: HERO SECTION */}
      <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">
        {/* Three.js Drifting particles canvas */}
        <Hero3DCanvas />

        {/* Ambient Gold Orb Parallax */}
        <div 
          className="absolute w-[600px] h-[600px] rounded-full bg-gradient-to-r from-[#C9A84C]/5 to-transparent blur-[150px] pointer-events-none transition-transform duration-300 ease-out"
          style={{ transform: `translate3d(${mouseOffset.x}px, ${mouseOffset.y}px, 0)` }}
        />

        {/* Cinematic Vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(circle,transparent_30%,#0A0A0A_100%)] pointer-events-none" />

        {/* Hero Content Grid */}
        <div className="relative z-10 max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 items-center gap-12 w-full mt-10">
          
          {/* Content (Left) */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left gap-6">
            <span className="inline-block px-3.5 py-1.5 border border-[#C9A84C]/30 bg-[#C9A84C]/5 rounded-full text-[9px] font-accent uppercase tracking-[0.25em] text-[#C9A84C]">
              Handcrafted in India · Est. 2023
            </span>
            
            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold tracking-[0.1em] text-[#F5F0E8] leading-tight select-none">
              ARTINOVA
            </h1>
            
            <p className="font-display italic text-xl sm:text-2xl text-[#C9A84C] tracking-wide">
              Crafting Emotions Into Luxury Gifts
            </p>
            
            <p className="font-body text-sm sm:text-base text-[#9A8F7E] max-w-lg leading-relaxed">
              Handcrafted personalized gifts designed to celebrate life's most meaningful milestones. Cast in liquid-gold resin, gold-leafing, and botanical preservation.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center gap-4 mt-2">
              <NextLink href="/shop" className="btn-solid-gold text-center">
                Shop Collection
              </NextLink>
              <NextLink href="/shop?filter=customizable" className="btn-gold text-center">
                Customize Gift
              </NextLink>
            </div>
          </div>

          {/* Interactive CSS 3D Box (Right) */}
          <div className="flex items-center justify-center">
            <CSSGiftBox />
          </div>

        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-[#9A8F7E]/60 text-[9px] uppercase tracking-[0.2em] font-accent select-none">
          <span>Scroll to discover</span>
          <div className="w-[1.5px] h-8 bg-gradient-to-b from-[#C9A84C] to-transparent relative overflow-hidden">
            <motion.div 
              animate={{ y: [0, 32, 0] }}
              transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
              className="absolute top-0 w-full h-2 bg-[#F5F0E8]"
            />
          </div>
        </div>
      </section>

      {/* SECTION 2: FEATURED COLLECTIONS STRIP */}
      <section className="py-20 bg-[#111111] border-y border-[#C9A84C]/10 overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-6 mb-8 text-center">
          <span className="font-accent text-[9px] tracking-[0.25em] text-[#C9A84C] uppercase">Bespoke Galleries</span>
          <h2 className="font-display text-3xl md:text-4xl font-semibold text-[#F5F0E8] mt-1">Featured Collections</h2>
        </div>

        {/* Horizontal scroll track */}
        <div className="flex items-center gap-6 overflow-x-auto px-8 pb-8 scrollbar-none snap-x snap-mandatory">
          {[
            { name: "Wedding Gifts", count: "24 Products", img: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=400", slug: "wedding-gifts" },
            { name: "Couple Gifts", count: "18 Products", img: "https://images.unsplash.com/photo-1513201099705-a9746e1e201f?w=400", slug: "couple-gifts" },
            { name: "Birthday Gifts", count: "15 Products", img: "https://images.unsplash.com/photo-1606744824163-985d376605aa?w=400", slug: "birthday-gifts" },
            { name: "Corporate Gifts", count: "12 Products", img: "https://images.unsplash.com/photo-1589256469067-ea99122bbec4?w=400", slug: "corporate-gifts" },
            { name: "Photo Gifts", count: "20 Products", img: "https://images.unsplash.com/photo-1512909006721-3d6018887383?w=400", slug: "photo-gifts" },
            { name: "Resin Art", count: "16 Products", img: "https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?w=400", slug: "resin-art" },
            { name: "Luxury Hampers", count: "10 Products", img: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400", slug: "luxury-hampers" }
          ].map((item, i) => (
            <NextLink 
              href={`/collections/${item.slug}`} 
              key={i}
              className="group snap-center shrink-0 w-[260px] h-[340px] rounded-lg overflow-hidden bg-[#161616] border border-[#C9A84C]/10 hover:border-[#C9A84C] relative flex flex-col justify-end p-5 transition-all duration-500 shadow-lg"
              style={{ perspective: '800px' }}
            >
              {/* Image background */}
              <div className="absolute inset-0 z-0 overflow-hidden">
                <img 
                  src={item.img} 
                  alt={item.name} 
                  className="w-full h-full object-cover opacity-60 group-hover:scale-105 group-hover:opacity-85 transition-all duration-700" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/40 to-transparent" />
              </div>
              
              {/* Content */}
              <div className="relative z-10 flex flex-col gap-1">
                <span className="font-accent text-[9px] uppercase tracking-widest text-[#C9A84C]">{item.count}</span>
                <span className="font-accent text-sm tracking-widest text-[#F5F0E8] font-bold group-hover:text-[#C9A84C] transition-colors">{item.name}</span>
              </div>

              {/* Shimmer sweep effect */}
              <span className="absolute inset-0 w-[50%] h-full bg-gradient-to-r from-transparent via-[#F5F0E8]/5 to-transparent skew-x-[-20deg] left-[-150%] group-hover:left-[150%] transition-all duration-1000 ease-out pointer-events-none" />
            </NextLink>
          ))}
        </div>
      </section>

      {/* SECTION 3: BEST SELLING PRODUCTS */}
      <section className="py-20 max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <span className="font-accent text-[9px] tracking-[0.25em] text-[#C9A84C] uppercase">Most Loved Items</span>
          <h2 className="font-display text-4xl font-semibold text-[#F5F0E8] mt-1">Our Most Loved Creations</h2>
          <p className="font-body text-sm text-[#9A8F7E] mt-2">Chosen by thousands of happy customers across India</p>

          {/* Filter Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
            {['All', 'Wedding', 'Birthday', 'Corporate', 'Resin Art'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2 rounded border text-[10px] font-accent uppercase tracking-widest transition-all duration-300 ${
                  activeTab === tab 
                    ? 'bg-[#C9A84C] text-[#0A0A0A] border-[#C9A84C] font-extrabold shadow-[0_0_15px_rgba(201,168,76,0.3)]' 
                    : 'bg-[#111111]/80 text-[#9A8F7E] border-[#C9A84C]/20 hover:border-[#C9A84C]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-square bg-[#111111] animate-pulse rounded border border-[#C9A84C]/10" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map((p) => {
              const inWishlist = hasItem(p.id);
              return (
                <div key={p.id} className="group luxury-card relative flex flex-col h-full bg-[#161616]">
                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 z-20 flex flex-col gap-1.5 pointer-events-none">
                    {p.is_featured && (
                      <span className="px-2 py-0.5 bg-[#C9A84C] text-[#0A0A0A] text-[7.5px] font-accent uppercase tracking-widest font-extrabold rounded-sm shadow-md">
                        Bestseller
                      </span>
                    )}
                    {p.is_customizable && (
                      <span className="px-2 py-0.5 bg-[#111111]/90 border border-[#C9A84C]/30 text-[#C9A84C] text-[7.5px] font-accent uppercase tracking-widest font-extrabold rounded-sm">
                        Custom
                      </span>
                    )}
                  </div>

                  {/* Wishlist Heart */}
                  <button 
                    onClick={() => toggleItem(user?.id || 'guest', p.id)}
                    className="absolute top-3 right-3 z-20 p-2 rounded-full bg-[#0A0A0A]/60 border border-[#C9A84C]/10 hover:border-[#C9A84C] text-[#F5F0E8]/70 hover:text-red-400 transition-all cursor-pointer"
                  >
                    <Heart size={13} fill={inWishlist ? '#ef4444' : 'none'} className={inWishlist ? 'text-red-500' : ''} />
                  </button>

                  {/* Image wrapper */}
                  <NextLink href={`/products/${p.slug}`} className="relative aspect-square w-full overflow-hidden block">
                    <img 
                      src={p.images[0]} 
                      alt={p.name} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                    />
                    <div className="absolute inset-0 bg-[#0A0A0A]/0 group-hover:bg-[#0A0A0A]/70 transition-all duration-300 flex items-center justify-center">
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 px-4 py-2 border border-[#C9A84C] bg-[#0A0A0A] text-[#C9A84C] font-accent text-[9px] uppercase tracking-widest font-bold">
                        Quick View
                      </span>
                    </div>
                  </NextLink>

                  {/* Info details */}
                  <div className="p-4 flex flex-col flex-grow gap-2 border-t border-[#C9A84C]/10">
                    <h3 className="font-display text-[15px] text-[#F5F0E8] line-clamp-1 group-hover:text-[#C9A84C] transition-colors">
                      {p.name}
                    </h3>
                    
                    {/* Rating */}
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, starIdx) => (
                        <span key={starIdx} className="text-[#C9A84C] text-[10px]">★</span>
                      ))}
                      <span className="text-[#9A8F7E] text-[9px] ml-1">({p.review_count})</span>
                    </div>

                    <div className="flex items-center justify-between mt-auto pt-2 border-t border-[#C9A84C]/5">
                      <span className="font-body text-[#C9A84C] font-bold text-sm">
                        ₹{p.price.toLocaleString()}
                      </span>
                      {p.original_price && (
                        <span className="font-body text-[#9A8F7E]/50 line-through text-xs">
                          ₹{p.original_price.toLocaleString()}
                        </span>
                      )}
                    </div>
                    
                    <button 
                      onClick={() => addItem(user?.id || 'guest', p.id, 1)}
                      className="w-full bg-[#111111] border border-[#C9A84C]/30 text-[#C9A84C] hover:bg-[#C9A84C] hover:text-[#0A0A0A] py-2 mt-2 text-[9px] font-accent uppercase tracking-widest font-bold transition-all duration-300 cursor-pointer"
                    >
                      Add To Cart
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* SECTION 4: WEDDING COLLECTION FEATURE */}
      <section className="py-24 bg-[#111111] border-y border-[#C9A84C]/15">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Left: Wedding Image */}
          <div className="relative aspect-[4/3] rounded-lg overflow-hidden border border-[#C9A84C]/20 shadow-2xl">
            <img 
              src="https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800" 
              alt="Luxury Wedding Gift Arrangment" 
              className="w-full h-full object-cover" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A]/50 to-transparent" />
          </div>

          {/* Right: Wedding details */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left gap-6">
            <span className="font-accent text-[9px] tracking-[0.25em] text-[#C9A84C] uppercase">Royal Unions</span>
            <h2 className="font-display text-4xl font-bold text-[#F5F0E8]">The Wedding Collection</h2>
            <div className="w-16 h-[1px] bg-[#C9A84C] self-center lg:self-start" />
            <p className="font-display italic text-[#9A8F7E] text-lg">
              "Every love story deserves a gift that lasts forever."
            </p>
            <p className="font-body text-sm text-[#9A8F7E]/80 leading-relaxed max-w-md">
              Explore custom geode rings dishes, preservation keepsakes, double-glass botanical resin photo frames, and customized luxury champagne hampers. Hand-crafted with antique gold leaf and silk velvet detailing.
            </p>

            <NextLink href="/collections/wedding-gifts" className="btn-solid-gold mt-2">
              Browse Wedding Collection
            </NextLink>
          </div>

        </div>
      </section>

      {/* SECTION 5: CORPORATE GIFTING */}
      <section className="py-24 relative max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="font-accent text-[9px] tracking-[0.25em] text-[#C9A84C] uppercase">Executive hampers</span>
          <h2 className="font-display text-4xl font-bold text-[#F5F0E8] mt-1">Elevate Your Corporate Relationships</h2>
          <p className="font-body text-sm text-[#9A8F7E] max-w-lg mx-auto mt-2">Branded luxury gift hampers, bulk orders, and white-label packaging for businesses and executives.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { title: "Custom Corporate Branding", desc: "Embed your company's official emblem, logos, or initials inside resin molds or metal-plate engravings." },
            { title: "Volume Tier Discounts", desc: "Enjoy dedicated custom catalog quotes, volume discounts, and white-glove shipping on hampers sets over 50 units." },
            { title: "Premium Packaging", desc: "Every hamper box is detailed with velvet-lined desks dividers, customized greeting notes, and direct courier dispatch." }
          ].map((card, i) => (
            <div key={i} className="p-8 rounded-lg bg-[#111111] border border-[#C9A84C]/10 hover:border-[#C9A84C] transition-all duration-300 flex flex-col gap-4 text-center">
              <span className="text-[#C9A84C] text-2xl">✦</span>
              <h3 className="font-accent text-sm font-bold tracking-widest text-[#F5F0E8] uppercase">{card.title}</h3>
              <p className="font-body text-xs text-[#9A8F7E]/75 leading-relaxed">{card.desc}</p>
            </div>
          ))}
        </div>

        <div className="flex justify-center mt-12">
          <button 
            onClick={() => setQuoteModalOpen(true)}
            className="btn-gold cursor-pointer"
          >
            Request Corporate Quote
          </button>
        </div>

        {/* Corporate Quote Modal */}
        <AnimatePresence>
          {quoteModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setQuoteModalOpen(false)}
                className="absolute inset-0 bg-[#0A0A0A]/90 backdrop-blur-md cursor-pointer"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                className="bg-[#111111] border border-[#C9A84C]/30 p-8 w-full max-w-lg rounded-md relative z-10"
              >
                <button 
                  onClick={() => setQuoteModalOpen(false)}
                  className="absolute top-4 right-4 text-[#9A8F7E] hover:text-[#F5F0E8] transition-colors"
                >
                  ✕
                </button>
                <h3 className="font-display text-2xl text-gold-gradient mb-2">Corporate Gifting Inquiry</h3>
                <p className="font-body text-xs text-[#9A8F7E] mb-6">Complete the form below. Our corporate gifting executive will contact you with pricing structures within 24 hours.</p>

                {quoteSubmitted ? (
                  <div className="flex flex-col items-center justify-center gap-3 py-12">
                    <div className="w-12 h-12 rounded-full border-2 border-[#C9A84C] flex items-center justify-center text-[#C9A84C] animate-pulse">
                      ✓
                    </div>
                    <span className="font-accent text-xs uppercase tracking-widest text-[#C9A84C]">Inquiry Received</span>
                  </div>
                ) : (
                  <form onSubmit={handleQuoteSubmit} className="flex flex-col gap-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] uppercase tracking-widest text-[#9A8F7E]">Your Name</label>
                        <input 
                          type="text" 
                          required 
                          value={quoteForm.name}
                          onChange={(e) => setQuoteForm({ ...quoteForm, name: e.target.value })}
                          className="bg-[#0A0A0A]/60 border border-[#C9A84C]/15 px-3 py-2 text-xs rounded text-white"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] uppercase tracking-widest text-[#9A8F7E]">Contact Phone</label>
                        <input 
                          type="tel" 
                          required 
                          value={quoteForm.phone}
                          onChange={(e) => setQuoteForm({ ...quoteForm, phone: e.target.value })}
                          className="bg-[#0A0A0A]/60 border border-[#C9A84C]/15 px-3 py-2 text-xs rounded text-white"
                        />
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] uppercase tracking-widest text-[#9A8F7E]">Work Email</label>
                      <input 
                        type="email" 
                        required 
                        value={quoteForm.email}
                        onChange={(e) => setQuoteForm({ ...quoteForm, email: e.target.value })}
                        className="bg-[#0A0A0A]/60 border border-[#C9A84C]/15 px-3 py-2 text-xs rounded text-white"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] uppercase tracking-widest text-[#9A8F7E]">Company Name</label>
                      <input 
                        type="text" 
                        value={quoteForm.company}
                        onChange={(e) => setQuoteForm({ ...quoteForm, company: e.target.value })}
                        className="bg-[#0A0A0A]/60 border border-[#C9A84C]/15 px-3 py-2 text-xs rounded text-white"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] uppercase tracking-widest text-[#9A8F7E]">Gift Hamper Requirements</label>
                      <textarea 
                        rows={3} 
                        value={quoteForm.message}
                        onChange={(e) => setQuoteForm({ ...quoteForm, message: e.target.value })}
                        className="bg-[#0A0A0A]/60 border border-[#C9A84C]/15 px-3 py-2 text-xs rounded text-white"
                        placeholder="Expected quantities, specific products, event date..."
                      />
                    </div>
                    <button type="submit" className="btn-solid-gold mt-2">
                      Submit Quote Request
                    </button>
                  </form>
                )}
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </section>

      {/* SECTION 6: WHY ARTINOVA */}
      <section className="py-24 bg-[#111111] border-y border-[#C9A84C]/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="font-accent text-[9px] tracking-[0.25em] text-[#C9A84C] uppercase">True Gilded Trust</span>
            <h2 className="font-display text-4xl font-bold text-[#F5F0E8]">Why Thousands Choose Artinova</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {trustPillars.map((pillar, i) => (
              <div key={i} className="p-8 rounded-lg bg-[#161616] border border-[#C9A84C]/5 hover:border-[#C9A84C] transition-all duration-300 flex items-start gap-4">
                <div className="p-3 bg-[#0A0A0A] rounded-full border border-[#C9A84C]/10 shrink-0">
                  {pillar.icon}
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className="font-accent text-[11px] uppercase tracking-widest text-[#F5F0E8] font-bold">{pillar.title}</h3>
                  <p className="font-body text-xs text-[#9A8F7E] leading-relaxed">{pillar.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 7: CUSTOMIZATION PROCESS */}
      <section className="py-24 max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="font-accent text-[9px] tracking-[0.25em] text-[#C9A84C] uppercase">How It Works</span>
          <h2 className="font-display text-4xl font-bold text-[#F5F0E8]">Your Personalized Gift in 4 Steps</h2>
        </div>

        {/* Timeline track */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 relative">
          
          {/* Connector Line (Desktop) */}
          <div className="hidden lg:block absolute top-[52px] left-[10%] right-[10%] h-[1px] bg-gradient-to-r from-transparent via-[#C9A84C]/35 to-transparent z-0" />

          {customizationSteps.map((step, i) => (
            <div key={i} className="flex flex-col items-center text-center gap-4 relative z-10 group">
              {/* Timeline bubble */}
              <div className="w-16 h-16 rounded-full bg-[#111111] border-2 border-[#C9A84C]/30 group-hover:border-[#C9A84C] flex items-center justify-center text-xl shadow-lg relative transition-all duration-300">
                <span className="absolute -top-3 -right-3 text-[10px] font-accent font-bold text-[#C9A84C] bg-[#0A0A0A] px-1.5 py-0.5 rounded border border-[#C9A84C]/25">{step.num}</span>
                <span>{step.icon}</span>
              </div>
              <h3 className="font-accent text-xs font-bold uppercase tracking-widest text-[#F5F0E8] mt-2">{step.title}</h3>
              <p className="font-body text-xs text-[#9A8F7E] max-w-[200px] leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 8: PREMIUM PACKAGING SHOWCASE */}
      <section className="py-24 bg-[#111111] border-y border-[#C9A84C]/15 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 items-center gap-12">
          
          {/* Left panel info */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left gap-6">
            <span className="font-accent text-[9px] tracking-[0.25em] text-[#C9A84C] uppercase">Unboxing Moments</span>
            <h2 className="font-display text-4xl font-bold text-[#F5F0E8]">The Artinova Unboxing Experience</h2>
            <p className="font-body text-sm text-[#9A8F7E] leading-relaxed max-w-md">Every order arrives in our signature luxury packaging. Carefully gift-wrapped and detailed to reflect royal standards, making the unboxing experience as emotional as the gift itself.</p>
            
            {/* Gallery indicators */}
            <div className="flex items-center gap-2 mt-4">
              {packagingGallery.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setPackagingIndex(idx)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${packagingIndex === idx ? 'bg-[#C9A84C] w-6' : 'bg-[#C9A84C]/20'}`}
                />
              ))}
            </div>
          </div>

          {/* Right panel gallery */}
          <div className="relative aspect-[4/3] rounded-lg overflow-hidden border border-[#C9A84C]/20 shadow-2xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={packagingIndex}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0"
              >
                <img 
                  src={packagingGallery[packagingIndex].url} 
                  alt={packagingGallery[packagingIndex].title} 
                  className="w-full h-full object-cover" 
                />
                {/* Overlay content text */}
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#0A0A0A] to-transparent">
                  <h4 className="font-accent text-xs font-bold uppercase tracking-widest text-[#C9A84C]">{packagingGallery[packagingIndex].title}</h4>
                  <p className="font-body text-[11px] text-[#F5F0E8]/70 mt-1">{packagingGallery[packagingIndex].desc}</p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

        </div>
      </section>

      {/* SECTION 9: CUSTOMER TESTIMONIALS */}
      <section className="py-24 max-w-7xl mx-auto px-6 relative">
        <div className="text-center mb-16">
          <span className="font-accent text-[9px] tracking-[0.25em] text-[#C9A84C] uppercase">True Patron Reviews</span>
          <h2 className="font-display text-4xl font-bold text-[#F5F0E8]">Words From Our Customers</h2>
        </div>

        {/* Masonry Review Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {customerReviews.map((rev, idx) => (
            <div key={idx} className="p-8 rounded-lg bg-[#111111] border border-[#C9A84C]/10 hover:border-[#C9A84C] transition-all duration-300 flex flex-col gap-4">
              {/* Stars */}
              <div className="flex items-center gap-1 text-[#C9A84C] text-[10px]">
                {Array.from({ length: rev.rating }).map((_, i) => <span key={i}>★</span>)}
              </div>
              <p className="font-body italic text-xs text-[#9A8F7E] leading-relaxed">
                "{rev.review}"
              </p>
              
              {/* Product purchased */}
              <span className="text-[9px] font-accent uppercase tracking-widest text-[#C9A84C] font-bold">
                Item: {rev.product}
              </span>

              <div className="flex items-center gap-3 pt-4 border-t border-[#C9A84C]/10 mt-auto">
                <div className="w-8 h-8 rounded-full bg-[#C9A84C]/10 border border-[#C9A84C]/35 flex items-center justify-center text-[10px] font-accent font-extrabold text-[#C9A84C]">
                  {rev.name.charAt(0)}
                </div>
                <div className="flex flex-col leading-none">
                  <span className="font-body text-xs text-[#F5F0E8] font-bold">{rev.name}</span>
                  <span className="font-body text-[9px] text-[#9A8F7E]/60 mt-1">{rev.city}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 10: INSTAGRAM GALLERY */}
      <section className="py-24 bg-[#111111] border-y border-[#C9A84C]/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="font-accent text-[9px] tracking-[0.25em] text-[#C9A84C] uppercase">Instagram Showcase</span>
            <h2 className="font-display text-4xl font-bold text-[#F5F0E8]">@artinova.studio</h2>
            <p className="font-body text-sm text-[#9A8F7E] mt-2">Tag us in your luxury unboxing moments</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-9 gap-3">
            {[
              'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=300',
              'https://images.unsplash.com/photo-1513201099705-a9746e1e201f?w=300',
              'https://images.unsplash.com/photo-1574926053821-79c5e338a933?w=300',
              'https://images.unsplash.com/photo-1606744824163-985d376605aa?w=300',
              'https://images.unsplash.com/photo-1589256469067-ea99122bbec4?w=300',
              'https://images.unsplash.com/photo-1512909006721-3d6018887383?w=300',
              'https://images.unsplash.com/photo-1606041008023-472dfb5e530f?w=300',
              'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=300',
              'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=300'
            ].map((src, i) => (
              <a 
                href="https://instagram.com/artinova.studio" 
                target="_blank" 
                rel="noopener noreferrer" 
                key={i}
                className="aspect-square relative rounded overflow-hidden border border-[#C9A84C]/10 hover:border-[#C9A84C] transition-all duration-300 group block shadow-md"
              >
                <img 
                  src={src} 
                  alt={`Social ${i + 1}`} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                />
                <div className="absolute inset-0 bg-[#0A0A0A]/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-[10px] font-accent uppercase tracking-widest text-[#C9A84C]">View Feed</span>
                </div>
              </a>
            ))}
          </div>

          <div className="flex justify-center mt-12">
            <a 
              href="https://instagram.com/artinova.studio" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="btn-gold"
            >
              Follow Us on Instagram
            </a>
          </div>
        </div>
      </section>

      {/* SECTION 11: FAQ SECTION */}
      <section id="faq" className="py-24 max-w-3xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="font-accent text-[9px] tracking-[0.25em] text-[#C9A84C] uppercase">Curated Answers</span>
          <h2 className="font-display text-4xl font-bold text-[#F5F0E8]">Frequently Asked Questions</h2>
        </div>

        {/* FAQs Accordions */}
        <div className="flex flex-col gap-4">
          {faqs.map((faq, i) => {
            const isOpen = openFaq === i;
            return (
              <div 
                key={i} 
                className="rounded-lg bg-[#111111] border border-[#C9A84C]/10 overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : i)}
                  className="w-full p-5 flex items-center justify-between text-left gap-4 font-accent text-xs font-bold uppercase tracking-widest text-[#F5F0E8] cursor-pointer hover:text-[#C9A84C] transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown 
                    size={14} 
                    className={`text-[#C9A84C] transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
                  />
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                    >
                      <div className="p-5 pt-0 border-t border-[#C9A84C]/5 font-body text-xs text-[#9A8F7E] leading-relaxed">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </section>

    </div>
  );
}
