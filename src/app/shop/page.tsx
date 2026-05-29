'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { getProducts, Product } from '../../lib/db';
import { useApp } from '../../context/AppContext';
import { Search, SlidersHorizontal, Heart, ShoppingCart, Eye, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function ShopContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { addItemToCart, toggleItemWishlist, wishlist } = useApp();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters state
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('featured');
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState<'catalog' | 'wishlist'>('catalog');

  // Load category from query or navbar tab selection
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'wishlist') {
      setActiveTab('wishlist');
    } else {
      setActiveTab('catalog');
    }

    const catParam = searchParams.get('category');
    if (catParam) {
      setSelectedCategory(catParam);
    }
  }, [searchParams]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await getProducts();
      setProducts(data);
      setLoading(false);
    }
    load();
  }, []);

  // Compute unique categories
  const categories = ['All', ...Array.from(new Set(products.map((p) => p.category)))];

  // Filter & Sort Logic
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.title.toLowerCase().includes(search.toLowerCase()) || 
                          product.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    
    if (activeTab === 'wishlist') {
      const isWishlisted = wishlist.some((item) => item.id === product.id);
      return matchesSearch && matchesCategory && isWishlisted;
    }
    
    return matchesSearch && matchesCategory;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price-asc') return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    return 0; // Default featured (date created)
  });

  return (
    <div className="min-h-screen py-16 px-6 bg-ambient-glow">
      <div className="max-w-7xl mx-auto">
        
        {/* Breadcrumb / Title */}
        <div className="flex flex-col gap-2 mb-12">
          <span className="font-poppins text-[10px] text-royal-gold uppercase tracking-[0.25em] font-semibold">Artisan Collection</span>
          <h1 className="font-cinzel text-3xl md:text-5xl font-bold tracking-wide text-soft-ivory">
            {activeTab === 'wishlist' ? 'My Secret Wishlist' : 'The Luxury Boutique'}
          </h1>
          <div className="w-12 h-[1px] bg-royal-gold/60 mt-1" />
        </div>

        {/* Tab Toggle (Catalog vs Wishlist) */}
        <div className="flex border-b border-champagne-gold/10 mb-10 gap-8">
          <button
            onClick={() => {
              setActiveTab('catalog');
              router.push('/shop');
            }}
            className={`pb-4 font-poppins text-xs uppercase tracking-[0.2em] font-semibold relative ${
              activeTab === 'catalog' ? 'text-champagne-gold' : 'text-soft-ivory/40 hover:text-soft-ivory/80'
            }`}
          >
            Catalog Boutique
            {activeTab === 'catalog' && (
              <motion.div layoutId="shopActiveTab" className="absolute bottom-0 left-0 w-full h-[2px] bg-royal-gold" />
            )}
          </button>
          <button
            onClick={() => {
              setActiveTab('wishlist');
              router.push('/shop?tab=wishlist');
            }}
            className={`pb-4 font-poppins text-xs uppercase tracking-[0.2em] font-semibold relative flex items-center gap-2 ${
              activeTab === 'wishlist' ? 'text-champagne-gold' : 'text-soft-ivory/40 hover:text-soft-ivory/80'
            }`}
          >
            Wishlist ({wishlist.length})
            {activeTab === 'wishlist' && (
              <motion.div layoutId="shopActiveTab" className="absolute bottom-0 left-0 w-full h-[2px] bg-royal-gold" />
            )}
          </button>
        </div>

        {/* Search, Filter, Sort toolbar */}
        <div className="flex flex-col lg:flex-row gap-4 justify-between items-center bg-luxury-charcoal/30 border border-champagne-gold/5 p-4 rounded-lg backdrop-blur-md mb-8">
          
          {/* Search bar */}
          <div className="relative w-full lg:max-w-md">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-soft-ivory/30" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search handcrafted gifts..."
              className="w-full bg-matte-black/60 border border-champagne-gold/10 rounded py-3 pl-11 pr-4 text-xs font-poppins text-soft-ivory placeholder-soft-ivory/30 focus:outline-none focus:border-royal-gold/60"
            />
          </div>

          <div className="flex items-center gap-4 w-full lg:w-auto justify-between lg:justify-end">
            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2.5 px-5 py-3 border rounded text-xs font-poppins font-medium transition-colors ${
                showFilters ? 'bg-royal-gold text-matte-black border-royal-gold' : 'bg-matte-black/40 border-champagne-gold/15 text-soft-ivory hover:border-royal-gold'
              }`}
            >
              <SlidersHorizontal size={14} /> Filters
            </button>

            {/* Price Sorter */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-matte-black/40 border border-champagne-gold/15 text-soft-ivory/80 px-4 py-3 rounded text-xs font-poppins focus:outline-none focus:border-royal-gold/60 appearance-none cursor-pointer pr-10"
              >
                <option value="featured" className="bg-[#070708]">Featured Collections</option>
                <option value="price-asc" className="bg-[#070708]">Price: Low to High</option>
                <option value="price-desc" className="bg-[#070708]">Price: High to Low</option>
              </select>
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-4 border-t-soft-ivory/40" />
            </div>
          </div>

        </div>

        {/* Collapsible Categories Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-luxury-charcoal/20 border border-champagne-gold/5 p-6 rounded-lg mb-8 overflow-hidden"
            >
              <h3 className="font-cinzel text-xs uppercase tracking-widest text-champagne-gold mb-4">Filter By Category</h3>
              <div className="flex flex-wrap gap-3">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => {
                      setSelectedCategory(category);
                      // Clear search query parameters if clicking categories manually
                      const params = new URLSearchParams(window.location.search);
                      params.set('category', category);
                      router.push(`${window.location.pathname}?${params.toString()}`);
                    }}
                    className={`px-5 py-2.5 rounded text-[10px] font-poppins uppercase tracking-wider border transition-all ${
                      selectedCategory === category
                        ? 'bg-royal-gold text-matte-black border-royal-gold font-semibold'
                        : 'bg-matte-black/60 border-champagne-gold/10 text-soft-ivory/70 hover:border-royal-gold/40'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="h-96 rounded-lg bg-luxury-charcoal animate-pulse border border-champagne-gold/5" />
            ))}
          </div>
        ) : sortedProducts.length === 0 ? (
          <div className="text-center py-20 bg-luxury-charcoal/10 border border-champagne-gold/5 rounded-lg">
            <h3 className="font-cinzel text-lg text-champagne-gold mb-2">No master pieces found</h3>
            <p className="font-poppins text-xs text-soft-ivory/50">
              Try adjusting your query filter, category boundaries, or clear search queries.
            </p>
            <button
              onClick={() => {
                setSearch('');
                setSelectedCategory('All');
                setSortBy('featured');
                router.push('/shop');
              }}
              className="mt-6 font-poppins text-[10px] uppercase tracking-wider text-royal-gold hover:text-champagne-gold underline font-semibold"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {sortedProducts.map((product) => {
              const isWishlisted = wishlist.some((p) => p.id === product.id);
              return (
                <motion.div
                  key={product.id}
                  className="glass-card flex flex-col h-full rounded-lg overflow-hidden group perspective-container"
                  layout
                >
                  {/* Card Image */}
                  <div className="relative h-72 w-full overflow-hidden">
                    <Image
                      src={product.images[0] || 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800'}
                      alt={product.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-matte-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                    {/* Quick action buttons */}
                    <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button
                        onClick={() => toggleItemWishlist(product.id)}
                        className={`p-2.5 rounded-full border border-champagne-gold/15 backdrop-blur-md transition-colors ${
                          isWishlisted ? 'bg-royal-gold text-matte-black border-royal-gold' : 'bg-matte-black/80 hover:border-royal-gold text-soft-ivory hover:text-royal-gold'
                        }`}
                      >
                        <Heart size={14} fill={isWishlisted ? 'currentColor' : 'none'} />
                      </button>
                      <Link
                        href={`/shop/${product.id}`}
                        className="p-2.5 rounded-full border border-champagne-gold/15 bg-matte-black/80 hover:border-royal-gold text-soft-ivory hover:text-royal-gold backdrop-blur-md transition-colors"
                      >
                        <Eye size={14} />
                      </Link>
                    </div>

                    {/* Category Badge */}
                    <span className="absolute bottom-4 left-4 bg-matte-black/60 border border-champagne-gold/15 px-3 py-1 text-[9px] uppercase tracking-widest text-royal-gold rounded backdrop-blur-sm">
                      {product.category}
                    </span>
                  </div>

                  {/* Card Content details */}
                  <div className="p-6 flex flex-col flex-grow bg-luxury-charcoal/40">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <h3 className="font-cinzel text-lg font-bold group-hover:text-champagne-gold transition-colors">
                        {product.title}
                      </h3>
                      <span className="font-poppins text-sm font-semibold text-royal-gold shrink-0">
                        ${product.price.toFixed(2)}
                      </span>
                    </div>
                    <p className="font-poppins text-[11px] text-soft-ivory/50 leading-relaxed flex-grow">
                      {product.description.length > 130 ? `${product.description.substring(0, 125)}...` : product.description}
                    </p>
                    
                    <button
                      onClick={() => addItemToCart(product.id, 1)}
                      className="w-full mt-6 py-3.5 border border-royal-gold/30 hover:border-royal-gold hover:bg-royal-gold hover:text-matte-black transition-all duration-300 font-poppins text-[10px] uppercase tracking-[0.2em] font-semibold"
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
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col items-center justify-center bg-ambient-glow gap-4">
        <span className="font-cinzel text-royal-gold text-lg tracking-[0.25em] animate-pulse">ARTINOVA BOUTIQUE</span>
        <span className="font-poppins text-[10px] text-soft-ivory/30 uppercase tracking-widest">Opening Collection...</span>
      </div>
    }>
      <ShopContent />
    </Suspense>
  );
}
