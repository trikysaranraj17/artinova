'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Product, getProducts } from '../../../lib/db';
import { useApp } from '../../../context/AppContext';
import { Heart, ShoppingCart, ArrowLeft, ShieldCheck, Sparkles, Box } from 'lucide-react';
import { motion } from 'framer-motion';

// Dynamically load the 3D component with SSR disabled
const Product3DPreview = dynamic(() => import('../../../components/Product3DPreview'), { ssr: false });

export default function ProductClient({ product }: { product: Product }) {
  const { addItemToCart, toggleItemWishlist, wishlist } = useApp();
  const [activeImage, setActiveImage] = useState(product.images[0] || 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800');
  const [qty, setQty] = useState(1);
  const [show3D, setShow3D] = useState(false);
  const [related, setRelated] = useState<Product[]>([]);
  
  // Hover zoom coordinates
  const [zoomStyle, setZoomStyle] = useState<{ transformOrigin: string; transform: string } | null>(null);

  const isWishlisted = wishlist.some((item) => item.id === product.id);

  // Load related products
  useEffect(() => {
    async function load() {
      const all = await getProducts();
      const filtered = all.filter((p) => p.id !== product.id && p.category === product.category).slice(0, 3);
      setRelated(filtered);
    }
    load();
    // Reset image and state when product changes
    setActiveImage(product.images[0] || 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800');
    setShow3D(false);
    setQty(1);
  }, [product]);

  // Handle Zoom Hover Move
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomStyle({
      transformOrigin: `${x}% ${y}%`,
      transform: 'scale(2.2)'
    });
  };

  const handleMouseLeave = () => {
    setZoomStyle(null);
  };

  return (
    <div className="min-h-screen py-16 px-6 bg-ambient-glow">
      <div className="max-w-7xl mx-auto">
        
        {/* Back Link */}
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 text-xs font-poppins uppercase tracking-wider text-soft-ivory/60 hover:text-champagne-gold mb-12 transition-colors"
        >
          <ArrowLeft size={14} /> Back to Boutique
        </Link>

        {/* Product Details Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* Gallery Columns (Left - 7 columns) */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            
            {/* Display screen (Image vs 3D Model) */}
            <div className="relative h-[400px] md:h-[500px] w-full border border-champagne-gold/10 rounded-lg bg-luxury-charcoal/30 overflow-hidden shadow-2xl">
              {show3D ? (
                <Product3DPreview category={product.category} />
              ) : (
                <div
                  className="relative w-full h-full cursor-zoom-in overflow-hidden"
                  onMouseMove={handleMouseMove}
                  onMouseLeave={handleMouseLeave}
                >
                  <Image
                    src={activeImage}
                    alt={product.title}
                    fill
                    style={zoomStyle || { transformOrigin: 'center center', transform: 'scale(1)' }}
                    className="object-cover transition-transform duration-100"
                  />
                </div>
              )}
            </div>

            {/* Gallery Control Toolbar */}
            <div className="flex justify-between items-center gap-4">
              
              {/* Image thumbnails */}
              <div className="flex gap-3">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setActiveImage(img);
                      setShow3D(false);
                    }}
                    className={`relative w-20 h-20 rounded border overflow-hidden transition-all ${
                      activeImage === img && !show3D
                        ? 'border-royal-gold scale-95 shadow-[0_0_8px_rgba(212,175,55,0.4)]'
                        : 'border-champagne-gold/10 hover:border-royal-gold/40'
                    }`}
                  >
                    <Image src={img} alt={`Thumb ${idx}`} fill className="object-cover" />
                  </button>
                ))}
              </div>

              {/* 3D Mode Toggle Button */}
              <button
                onClick={() => setShow3D(!show3D)}
                className={`flex items-center gap-2.5 px-6 py-4 rounded text-xs font-poppins uppercase tracking-wider font-semibold border transition-all ${
                  show3D
                    ? 'bg-royal-gold text-matte-black border-royal-gold shadow-[0_0_12px_rgba(212,175,55,0.35)]'
                    : 'bg-matte-black/60 border-champagne-gold/15 text-soft-ivory hover:border-royal-gold'
                }`}
              >
                <Box size={14} /> {show3D ? 'View Photos' : 'View in 3D'}
              </button>

            </div>

          </div>

          {/* Details Column (Right - 5 columns) */}
          <div className="lg:col-span-5 flex flex-col gap-8">
            
            {/* Header info */}
            <div className="flex flex-col gap-2">
              <span className="font-poppins text-[10px] text-royal-gold uppercase tracking-[0.25em] font-semibold">
                {product.category}
              </span>
              <h1 className="font-cinzel text-3xl md:text-4xl font-bold tracking-wide text-soft-ivory">
                {product.title}
              </h1>
              <span className="font-poppins text-2xl font-semibold text-champagne-gold mt-2">
                ${product.price.toFixed(2)}
              </span>
            </div>

            <div className="h-[1px] bg-champagne-gold/10" />

            {/* Description */}
            <div className="flex flex-col gap-4">
              <h4 className="font-cinzel text-xs uppercase tracking-widest text-champagne-gold font-semibold">The Description</h4>
              <p className="font-poppins text-xs md:text-sm text-soft-ivory/60 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Stock indicator */}
            <div className="flex items-center gap-3 font-poppins text-xs">
              <span className="text-soft-ivory/40">Availability:</span>
              {product.stock > 0 ? (
                <span className="text-emerald-400 font-semibold">{product.stock} units in boutique stock</span>
              ) : (
                <span className="text-red-400 font-semibold">Sold Out / Custom Order Only</span>
              )}
            </div>

            {/* Cart & Qty panel */}
            <div className="flex flex-col sm:flex-row items-center gap-4">
              {/* Qty adjustments */}
              <div className="flex items-center border border-champagne-gold/15 rounded bg-matte-black/40 h-14 w-full sm:w-auto px-2">
                <button
                  onClick={() => setQty((prev) => Math.max(1, prev - 1))}
                  className="px-4 text-soft-ivory/60 hover:text-champagne-gold text-lg"
                >
                  -
                </button>
                <span className="w-12 text-center text-xs font-poppins font-semibold">{qty}</span>
                <button
                  onClick={() => setQty((prev) => prev + 1)}
                  className="px-4 text-soft-ivory/60 hover:text-champagne-gold text-lg"
                >
                  +
                </button>
              </div>

              {/* Add to cart */}
              <button
                onClick={() => addItemToCart(product.id, qty)}
                disabled={product.stock <= 0}
                className="flex-grow w-full h-14 font-poppins text-xs uppercase tracking-[0.2em] bg-royal-gold text-matte-black rounded flex items-center justify-center gap-3 hover:bg-champagne-gold hover:shadow-[0_0_15px_rgba(214,175,55,0.4)] transition-all duration-300 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingCart size={14} /> Add to Cart
              </button>

              {/* Wishlist */}
              <button
                onClick={() => toggleItemWishlist(product.id)}
                className={`p-4 h-14 rounded border flex items-center justify-center transition-colors shrink-0 ${
                  isWishlisted 
                    ? 'bg-royal-gold/10 text-royal-gold border-royal-gold/40' 
                    : 'border-champagne-gold/15 hover:border-royal-gold text-soft-ivory/60 hover:text-royal-gold bg-matte-black/40'
                }`}
              >
                <Heart size={18} fill={isWishlisted ? 'currentColor' : 'none'} />
              </button>
            </div>

            {/* Premium Guarantee */}
            <div className="flex items-start gap-4 p-5 bg-luxury-charcoal/20 border border-champagne-gold/5 rounded-lg">
              <ShieldCheck className="text-royal-gold shrink-0 mt-0.5" size={20} />
              <div className="flex flex-col gap-1">
                <span className="font-cinzel text-xs font-semibold text-champagne-gold">Premium Guarantee</span>
                <span className="font-poppins text-[10px] text-soft-ivory/50 leading-normal">
                  All items are protected with robust shipping crates and transit insurance. 100% replacement in case of transport damage.
                </span>
              </div>
            </div>

          </div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <div className="mt-28 border-t border-champagne-gold/10 pt-20">
            <h2 className="font-cinzel text-2xl tracking-wide text-soft-ivory mb-12">
              Complementary Masterpieces
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {related.map((item) => (
                <div
                  key={item.id}
                  className="glass-card flex flex-col h-full rounded-lg overflow-hidden group border border-champagne-gold/5"
                >
                  <Link href={`/shop/${item.id}`} className="relative h-60 w-full overflow-hidden block">
                    <Image src={item.images[0]} alt={item.title} fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
                    <span className="absolute bottom-4 left-4 bg-matte-black/60 border border-champagne-gold/15 px-3 py-1 text-[9px] uppercase tracking-widest text-royal-gold rounded">
                      {item.category}
                    </span>
                  </Link>
                  <div className="p-6 flex flex-col flex-grow bg-luxury-charcoal/40">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <Link href={`/shop/${item.id}`} className="font-cinzel text-sm font-bold hover:text-champagne-gold transition-colors">
                        {item.title}
                      </Link>
                      <span className="font-poppins text-xs font-semibold text-royal-gold shrink-0">
                        ${item.price.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
