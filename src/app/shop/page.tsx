'use client';

import React, { useState, useEffect, Suspense } from 'react';
import NextLink from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { getProducts, getCategories, Product, Category } from '../../lib/db';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';
import { ShoppingCart, Heart, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

function ShopContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const { user } = useAuthStore();
  const { addItem } = useCartStore();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState('popular');

  // Load URL query params
  useEffect(() => {
    const catParam = searchParams.get('category');
    if (catParam) {
      setSelectedCategory(catParam);
    }
  }, [searchParams]);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const prods = await getProducts();
        const cats = await getCategories();
        setProducts(prods);
        setCategories(cats);
      } catch (err) {
        console.error('Error loading shop data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleCategorySelect = (slug: string) => {
    setSelectedCategory(slug);
    if (slug === 'All') {
      router.push('/shop');
    } else {
      router.push(`/shop?category=${slug}`);
    }
  };

  // Filter & Sort Logic
  const filteredProducts = products.filter((product) => {
    if (selectedCategory === 'All') return true;
    const catSlug = categories.find(c => c.id === product.category_id)?.slug || '';
    return catSlug === selectedCategory;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price-asc') return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    if (sortBy === 'newest') return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
    return (b.rating ?? 5) - (a.rating ?? 5); // Popularity fallback
  });

  return (
    <div className="min-h-screen pt-32 pb-24 px-6 bg-[#0A0A0A] relative text-[#F5F0E8] font-body select-none">
      {/* Background ambient glows */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-[#C9A84C]/5 blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto flex flex-col gap-8">
        
        {/* Title & Brand Header */}
        <div className="flex flex-col items-center text-center gap-2 mb-4">
          <img 
            src="/logo.jpg" 
            alt="ARTINOVA Logo" 
            className="h-16 w-auto object-contain border border-[#C9A84C]/20 rounded-md mb-2 shadow-[0_0_20px_rgba(201,168,76,0.15)]"
          />
          <span className="font-accent text-[9px] text-[#C9A84C] uppercase tracking-[0.25em]">Artisan Boutique</span>
          <h1 className="font-display text-3xl sm:text-5xl font-semibold tracking-wide text-[#F5F0E8] leading-none">
            The Collections
          </h1>
          <div className="w-12 h-[1px] bg-[#C9A84C] mt-2" />
        </div>

        {/* Categories Pill Bar & Sorter */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-[#C9A84C]/15 w-full">
          {/* Pills */}
          <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none w-full md:w-auto snap-x justify-start md:justify-center">
            <button
              onClick={() => handleCategorySelect('All')}
              className={`px-5 py-2.5 rounded-full text-[10px] font-accent uppercase tracking-widest transition-all duration-300 shrink-0 ${
                selectedCategory === 'All'
                  ? 'bg-[#C9A84C] text-[#0A0A0A] font-extrabold shadow-[0_0_12px_rgba(201,168,76,0.25)]'
                  : 'bg-[#111111]/80 text-[#9A8F7E] border border-[#C9A84C]/10 hover:border-[#C9A84C]'
              }`}
            >
              All Collections
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategorySelect(cat.slug)}
                className={`px-5 py-2.5 rounded-full text-[10px] font-accent uppercase tracking-widest transition-all duration-300 shrink-0 ${
                  selectedCategory === cat.slug
                    ? 'bg-[#C9A84C] text-[#0A0A0A] font-extrabold shadow-[0_0_12px_rgba(201,168,76,0.25)]'
                    : 'bg-[#111111]/80 text-[#9A8F7E] border border-[#C9A84C]/10 hover:border-[#C9A84C]'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Sorter */}
          <div className="relative shrink-0 w-full md:w-auto">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-[#111111] border border-[#C9A84C]/20 text-[#9A8F7E] px-5 py-2.5 rounded text-[10px] font-accent uppercase tracking-wider focus:border-[#C9A84C] appearance-none cursor-pointer pr-10 w-full md:w-48"
            >
              <option value="popular">Popularity</option>
              <option value="newest">Newest Creations</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-4 border-t-[#9A8F7E]" />
          </div>
        </div>

        {/* Main Grid Display */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-square rounded-lg bg-[#111111] animate-pulse border border-[#C9A84C]/10" />
            ))}
          </div>
        ) : sortedProducts.length === 0 ? (
          <div className="text-center py-20 px-6 bg-[#111111]/60 border border-[#C9A84C]/10 rounded-lg max-w-2xl mx-auto w-full flex flex-col items-center gap-5">
            <span className="text-[#C9A84C] text-2xl">✦</span>
            <h3 className="font-display italic text-xl text-[#F5F0E8]">Bespoke Collection Curation</h3>
            <p className="font-body text-xs text-[#9A8F7E] leading-relaxed max-w-md">
              Our studio is currently handcrafting our upcoming resin art and luxury hampers collections. We start fresh with zero default items. In the meantime, you can commission a custom personalized creation directly by contacting Akash.
            </p>
            <NextLink
              href="/contact"
              className="btn-solid-gold py-3 px-8 text-[10px] font-accent uppercase tracking-widest font-extrabold shadow-md mt-2"
            >
              Commission A Custom Gift
            </NextLink>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {sortedProducts.map((p) => (
              <div key={p.id} className="group luxury-card relative flex flex-col h-full bg-[#161616] border border-[#C9A84C]/10 rounded-lg overflow-hidden transition-all duration-300 hover:border-[#C9A84C]/45">
                {/* Badges */}
                <div className="absolute top-3 left-3 z-20 flex flex-col gap-1 pointer-events-none">
                  {p.is_featured && (
                    <span className="px-2 py-0.5 bg-[#C9A84C] text-[#0A0A0A] text-[7px] font-accent uppercase tracking-widest font-bold rounded-sm shadow-md">
                      Bestseller
                    </span>
                  )}
                  {p.is_customizable && (
                    <span className="px-2 py-0.5 bg-[#111111]/90 border border-[#C9A84C]/25 text-[#C9A84C] text-[7px] font-accent uppercase tracking-widest font-bold rounded-sm">
                      Custom
                    </span>
                  )}
                </div>

                {/* Product Image Link */}
                <NextLink href={`/products/${p.slug}`} className="relative aspect-square w-full overflow-hidden block bg-[#0D0D0D]">
                  <img 
                    src={p.images[0] || '/images/placeholder.jpg'} 
                    alt={p.name} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                  />
                  <div className="absolute inset-0 bg-[#0A0A0A]/0 group-hover:bg-[#0A0A0A]/60 transition-all duration-300 flex items-center justify-center">
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 px-4 py-2 border border-[#C9A84C] bg-[#0A0A0A] text-[#C9A84C] font-accent text-[9px] uppercase tracking-widest font-bold">
                      View details
                    </span>
                  </div>
                </NextLink>

                {/* Product details */}
                <div className="p-4 flex flex-col flex-grow gap-1.5 border-t border-[#C9A84C]/10">
                  <h3 className="font-display text-sm text-[#F5F0E8] line-clamp-1 group-hover:text-[#C9A84C] transition-colors font-bold">
                    {p.name}
                  </h3>
                  
                  {/* Review Stars */}
                  <div className="flex items-center gap-0.5 text-[#C9A84C] text-[9px]">
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <span key={idx}>★</span>
                    ))}
                    <span className="text-[#9A8F7E] text-[8px] ml-1">({p.review_count || 0})</span>
                  </div>

                  <div className="flex items-center justify-between mt-auto pt-2 border-t border-[#C9A84C]/5">
                    <span className="font-body text-[#C9A84C] font-bold text-xs sm:text-sm">
                      ₹{p.price.toLocaleString()}
                    </span>
                    {p.original_price && (
                      <span className="font-body text-[#9A8F7E]/45 line-through text-[10px] sm:text-xs">
                        ₹{p.original_price.toLocaleString()}
                      </span>
                    )}
                  </div>
                  
                  <button 
                    onClick={() => addItem(user?.id || 'guest', p.id, 1)}
                    className="w-full bg-[#111111] border border-[#C9A84C]/35 text-[#C9A84C] hover:bg-[#C9A84C] hover:text-[#0A0A0A] py-2 mt-2.5 text-[8.5px] font-accent uppercase tracking-widest font-bold transition-all duration-300 cursor-pointer rounded-sm"
                  >
                    Add To Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0A0A0A] gap-4 select-none">
        <span className="font-display text-[#C9A84C] text-lg tracking-[0.25em] animate-pulse">ARTINOVA BOUTIQUE</span>
        <span className="font-body text-[10px] text-[#9A8F7E]/40 uppercase tracking-widest">Opening Collection...</span>
      </div>
    }>
      <ShopContent />
    </Suspense>
  );
}
