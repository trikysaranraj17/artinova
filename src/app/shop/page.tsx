'use client';

import React, { useState, useEffect, Suspense } from 'react';
import NextLink from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { getProducts, getCategories, Product, Category } from '../../lib/db';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';
import { useWishlistStore } from '../../store/wishlistStore';
import { Search, Heart, ShoppingCart, Eye, Sparkles, Filter, X, ChevronDown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function ShopContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const { user } = useAuthStore();
  const { addItem, setCartDrawerOpen } = useCartStore();
  const { items: wishlistItems, toggleItem, hasItem } = useWishlistStore();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [search, setSearch] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState<number>(12000);
  const [onlyCustomizable, setOnlyCustomizable] = useState(false);
  const [minRating, setMinRating] = useState<number | null>(null);
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [sortBy, setSortBy] = useState('popular');

  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [activeTab, setActiveTab] = useState<'catalog' | 'wishlist'>('catalog');

  // Load URL query params
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'wishlist') {
      setActiveTab('wishlist');
    } else {
      setActiveTab('catalog');
    }

    const catParam = searchParams.get('category');
    if (catParam) {
      setSelectedCategories([catParam]);
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

  const handleCategoryToggle = (slug: string) => {
    setSelectedCategories(prev => 
      prev.includes(slug) ? prev.filter(c => c !== slug) : [...prev, slug]
    );
  };

  const handleResetFilters = () => {
    setSearch('');
    setSelectedCategories([]);
    setMaxPrice(12000);
    setOnlyCustomizable(false);
    setMinRating(null);
    setOnlyInStock(false);
    setSortBy('popular');
    router.push('/shop');
  };

  // Filter & Sort Logic
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase()) || 
                          product.description.toLowerCase().includes(search.toLowerCase());
    
    // Mapped categories lookup
    const catSlug = categories.find(c => c.id === product.category_id)?.slug || '';
    const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(catSlug);
    
    const matchesPrice = product.price <= maxPrice;
    const matchesCustom = !onlyCustomizable || product.is_customizable;
    const matchesStock = !onlyInStock || product.stock > 0;
    const matchesRating = minRating === null || (product.rating ?? 5) >= minRating;

    if (activeTab === 'wishlist') {
      const isWishlisted = hasItem(product.id);
      return matchesSearch && matchesCategory && matchesPrice && matchesCustom && matchesStock && matchesRating && isWishlisted;
    }
    
    return matchesSearch && matchesCategory && matchesPrice && matchesCustom && matchesStock && matchesRating;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price-asc') return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    if (sortBy === 'newest') return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
    return (b.rating ?? 5) - (a.rating ?? 5); // Popularity fallback
  });

  const SidebarFilters = () => (
    <div className="flex flex-col gap-8 select-none">
      
      {/* Search Inside Sidebar */}
      <div className="flex flex-col gap-2">
        <h3 className="font-accent text-[10px] uppercase tracking-widest text-[#C9A84C] font-bold">Search</h3>
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Type query..."
            className="w-full bg-[#0A0A0A] border border-[#C9A84C]/10 rounded py-2 px-3 text-xs text-[#F5F0E8] placeholder-[#9A8F7E]/40 focus:border-[#C9A84C]"
          />
        </div>
      </div>

      <div className="h-[1px] bg-[#C9A84C]/10" />

      {/* Category Checklists */}
      <div className="flex flex-col gap-3">
        <h3 className="font-accent text-[10px] uppercase tracking-widest text-[#C9A84C] font-bold">Category</h3>
        <div className="flex flex-col gap-2">
          {categories.map((cat) => {
            const isChecked = selectedCategories.includes(cat.slug);
            return (
              <button
                key={cat.id}
                onClick={() => handleCategoryToggle(cat.slug)}
                className="flex items-center gap-3 text-left font-body text-xs text-[#9A8F7E] hover:text-[#C9A84C] transition-colors group cursor-pointer"
              >
                <div className={`w-3.5 h-3.5 border border-[#C9A84C]/30 rounded flex items-center justify-center transition-all ${isChecked ? 'bg-[#C9A84C] border-[#C9A84C]' : 'bg-[#0A0A0A]'}`}>
                  {isChecked && <Check size={10} className="text-[#0A0A0A] stroke-[4]" />}
                </div>
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="h-[1px] bg-[#C9A84C]/10" />

      {/* Price Range Slider */}
      <div className="flex flex-col gap-3">
        <div className="flex justify-between items-center">
          <h3 className="font-accent text-[10px] uppercase tracking-widest text-[#C9A84C] font-bold">Max Price</h3>
          <span className="font-body text-xs font-bold text-[#C9A84C]">₹{maxPrice.toLocaleString()}</span>
        </div>
        <input
          type="range"
          min="500"
          max="12000"
          step="250"
          value={maxPrice}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
          className="w-full h-[3px] bg-[#161616] rounded-lg appearance-none cursor-pointer accent-[#C9A84C]"
        />
        <div className="flex justify-between text-[10px] text-[#9A8F7E]/40 font-body">
          <span>₹500</span>
          <span>₹12,000+</span>
        </div>
      </div>

      <div className="h-[1px] bg-[#C9A84C]/10" />

      {/* Customizable Toggle */}
      <div className="flex items-center justify-between">
        <span className="font-accent text-[10px] uppercase tracking-widest text-[#C9A84C] font-bold">Customizable</span>
        <button
          onClick={() => setOnlyCustomizable(!onlyCustomizable)}
          className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-300 focus:outline-none cursor-pointer ${onlyCustomizable ? 'bg-[#C9A84C]' : 'bg-[#161616] border border-[#C9A84C]/25'}`}
        >
          <div className={`w-3.5 h-3.5 rounded-full bg-[#0A0A0A] transition-transform duration-300 ${onlyCustomizable ? 'translate-x-4' : 'translate-x-0'}`} />
        </button>
      </div>

      {/* In Stock Toggle */}
      <div className="flex items-center justify-between">
        <span className="font-accent text-[10px] uppercase tracking-widest text-[#C9A84C] font-bold">In Stock Only</span>
        <button
          onClick={() => setOnlyInStock(!onlyInStock)}
          className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-300 focus:outline-none cursor-pointer ${onlyInStock ? 'bg-[#C9A84C]' : 'bg-[#161616] border border-[#C9A84C]/25'}`}
        >
          <div className={`w-3.5 h-3.5 rounded-full bg-[#0A0A0A] transition-transform duration-300 ${onlyInStock ? 'translate-x-4' : 'translate-x-0'}`} />
        </button>
      </div>

      <div className="h-[1px] bg-[#C9A84C]/10" />

      {/* Star Ratings */}
      <div className="flex flex-col gap-3">
        <h3 className="font-accent text-[10px] uppercase tracking-widest text-[#C9A84C] font-bold">Minimum Rating</h3>
        <div className="flex flex-col gap-2">
          {[5, 4, 3].map((rating) => (
            <button
              key={rating}
              onClick={() => setMinRating(minRating === rating ? null : rating)}
              className={`flex items-center gap-2 text-left font-body text-xs transition-colors cursor-pointer ${minRating === rating ? 'text-[#C9A84C] font-bold' : 'text-[#9A8F7E] hover:text-[#C9A84C]'}`}
            >
              <div className="flex text-[#C9A84C] text-[10px]">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i}>{i < rating ? '★' : '☆'}</span>
                ))}
              </div>
              <span>& Up</span>
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={handleResetFilters}
        className="w-full mt-4 py-3 border border-red-500/20 hover:border-red-500 bg-red-950/5 hover:bg-red-950/20 text-red-400 hover:text-red-300 font-accent text-[9px] uppercase tracking-wider transition-colors rounded cursor-pointer"
      >
        Clear Filters
      </button>
    </div>
  );

  return (
    <div className="min-h-screen pt-32 pb-24 px-6 bg-[#0A0A0A] relative">
      {/* Background ambient glows */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-[#C9A84C]/5 blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto">
        
        {/* Title */}
        <div className="flex flex-col gap-2 mb-10 text-center sm:text-left select-none">
          <span className="font-accent text-[9px] text-[#C9A84C] uppercase tracking-[0.25em]">Artisan Boutique</span>
          <h1 className="font-display text-4xl sm:text-5xl font-semibold tracking-wide text-[#F5F0E8] leading-none">
            {activeTab === 'wishlist' ? 'My Secret Wishlist' : 'The Luxury Boutique'}
          </h1>
          <div className="w-12 h-[1px] bg-[#C9A84C] mt-2 self-center sm:self-start" />
        </div>

        {/* Tab Toggle (Catalog vs Wishlist) */}
        <div className="flex border-b border-[#C9A84C]/10 mb-8 gap-8 justify-center sm:justify-start">
          <button
            onClick={() => {
              setActiveTab('catalog');
              router.push('/shop');
            }}
            className={`pb-4 font-accent text-[10px] uppercase tracking-[0.2em] relative cursor-pointer ${
              activeTab === 'catalog' ? 'text-[#C9A84C] font-extrabold' : 'text-[#9A8F7E] hover:text-[#F5F0E8]'
            }`}
          >
            Catalog Boutique
            {activeTab === 'catalog' && (
              <motion.div layoutId="shopActiveTab" className="absolute bottom-0 left-0 w-full h-[1.5px] bg-[#C9A84C]" />
            )}
          </button>
          <button
            onClick={() => {
              setActiveTab('wishlist');
              router.push('/shop?tab=wishlist');
            }}
            className={`pb-4 font-accent text-[10px] uppercase tracking-[0.2em] relative flex items-center gap-2 cursor-pointer ${
              activeTab === 'wishlist' ? 'text-[#C9A84C] font-extrabold' : 'text-[#9A8F7E] hover:text-[#F5F0E8]'
            }`}
          >
            Wishlist ({wishlistItems.length})
            {activeTab === 'wishlist' && (
              <motion.div layoutId="shopActiveTab" className="absolute bottom-0 left-0 w-full h-[1.5px] bg-[#C9A84C]" />
            )}
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col lg:flex-row gap-4 justify-between items-center bg-[#111111] border border-[#C9A84C]/10 p-4 rounded-lg backdrop-blur-md mb-8">
          <div className="relative w-full lg:max-w-md">
            <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9A8F7E]/40" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search creations..."
              className="w-full bg-[#0A0A0A] border border-[#C9A84C]/15 rounded py-2.5 pl-11 pr-4 text-xs font-body text-[#F5F0E8] placeholder-[#9A8F7E]/40 focus:border-[#C9A84C]"
            />
          </div>

          <div className="flex items-center gap-4 w-full lg:w-auto justify-between lg:justify-end">
            <button
              onClick={() => setShowMobileFilters(true)}
              className="lg:hidden flex items-center gap-2 px-4 py-2.5 border border-[#C9A84C]/20 rounded text-xs font-accent uppercase tracking-widest text-[#F5F0E8] cursor-pointer"
            >
              <Filter size={14} /> Filters
            </button>

            {/* Price Sorter */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-[#0A0A0A] border border-[#C9A84C]/20 text-[#9A8F7E] px-4 py-2.5 rounded text-xs font-accent focus:border-[#C9A84C] appearance-none cursor-pointer pr-10"
              >
                <option value="popular">Popularity</option>
                <option value="newest">Newest Creations</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-4 border-t-[#9A8F7E]" />
            </div>
          </div>
        </div>

        {/* Sidebar + Main Grid Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* A. Desktop Sidebar */}
          <aside className="hidden lg:block lg:col-span-3 bg-[#111111] border border-[#C9A84C]/10 p-6 rounded-lg sticky top-28 h-fit max-h-[80vh] overflow-y-auto">
            <SidebarFilters />
          </aside>

          {/* B. Products Grid */}
          <div className="lg:col-span-9">
            {loading ? (
              <div className="grid grid-cols-2 xl:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((n) => (
                  <div key={n} className="aspect-square rounded-lg bg-[#111111] animate-pulse border border-[#C9A84C]/10" />
                ))}
              </div>
            ) : sortedProducts.length === 0 ? (
              <div className="text-center py-20 bg-[#111111] border border-[#C9A84C]/10 rounded-lg select-none">
                <span className="text-[#C9A84C] text-2xl">✦</span>
                <h3 className="font-display italic text-lg text-[#9A8F7E] mt-2">No masterpieces found</h3>
                <p className="font-body text-xs text-[#9A8F7E]/50 mt-1">
                  Try adjusting your query filter, price range, or clear search queries.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="mt-6 font-accent text-[9px] uppercase tracking-wider text-[#C9A84C] hover:text-[#F5F0E8] underline font-bold cursor-pointer"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 xl:grid-cols-4 gap-6">
                {sortedProducts.map((p) => {
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

                      {/* Image */}
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
          </div>

        </div>

      </div>

      {/* Mobile Filters Drawer */}
      <AnimatePresence>
        {showMobileFilters && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1500] lg:hidden bg-[#0A0A0A]/90 backdrop-blur-md flex justify-end"
          >
            <div className="absolute inset-0" onClick={() => setShowMobileFilters(false)} />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-80 bg-[#111111] p-6 border-l border-[#C9A84C]/20 overflow-y-auto h-full z-10 flex flex-col gap-6"
            >
              <div className="flex justify-between items-center pb-4 border-b border-[#C9A84C]/10">
                <span className="font-accent text-sm uppercase tracking-widest text-[#C9A84C] font-bold flex items-center gap-2">
                  <Filter size={14} /> Filter Boutique
                </span>
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="p-1 rounded-full text-[#9A8F7E] hover:text-[#C9A84C] transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <SidebarFilters />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
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
