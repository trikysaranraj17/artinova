'use client';

import React, { useEffect } from 'react';
import NextLink from 'next/link';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';
import { useWishlistStore } from '../../store/wishlistStore';
import { Heart, Trash2, ShoppingCart, ArrowLeft } from 'lucide-react';

export default function WishlistPage() {
  const { user } = useAuthStore();
  const { addItem } = useCartStore();
  const { items: wishlistItems, toggleItem, fetchWishlist } = useWishlistStore();

  useEffect(() => {
    const uId = user?.id || 'guest';
    fetchWishlist(uId);
  }, [user]);

  const handleMoveToCart = (productId: string) => {
    const uId = user?.id || 'guest';
    addItem(uId, productId, 1);
    toggleItem(uId, productId); // remove from wishlist once moved
  };

  const handleRemove = (productId: string) => {
    const uId = user?.id || 'guest';
    toggleItem(uId, productId);
  };

  return (
    <div className="min-h-screen pt-32 pb-24 px-6 bg-[#0A0A0A] text-[#F5F0E8] font-body relative">
      {/* Background glow */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-[#C9A84C]/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10 select-none">
        {/* Back Link */}
        <NextLink
          href="/shop"
          className="inline-flex items-center gap-2 text-xs font-accent uppercase tracking-widest text-[#9A8F7E] hover:text-[#C9A84C] mb-8 transition-colors"
        >
          <ArrowLeft size={13} /> Back to Boutique
        </NextLink>

        {/* Title */}
        <div className="flex flex-col gap-2 mb-10 text-center sm:text-left">
          <span className="font-accent text-[9px] text-[#C9A84C] uppercase tracking-[0.25em]">Registry Collection</span>
          <h1 className="font-display text-4xl sm:text-5xl font-semibold tracking-wide text-[#F5F0E8] leading-none">
            My Wishlist
          </h1>
          <div className="w-12 h-[1px] bg-[#C9A84C] mt-2 self-center sm:self-start" />
        </div>

        {wishlistItems.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center text-center py-20 bg-[#111111] border border-[#C9A84C]/10 rounded-lg p-8 gap-5 max-w-xl mx-auto shadow-xl">
            <div className="w-16 h-16 rounded-full border border-dashed border-[#C9A84C]/30 flex items-center justify-center text-[#C9A84C] opacity-50">
              <Heart size={24} />
            </div>
            <div className="flex flex-col gap-1.5">
              <h3 className="font-display italic text-lg text-[#9A8F7E]">Your wishlist is currently empty.</h3>
              <p className="font-body text-xs text-[#9A8F7E]/60 max-w-xs leading-relaxed">
                Browse our luxury geode wall clocks, custom floral preservation photo frames, and premium gift trunks to save them here.
              </p>
            </div>
            <NextLink href="/shop" className="btn-solid-gold py-3 mt-2">
              Browse Creations
            </NextLink>
          </div>
        ) : (
          /* Wishlist Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {wishlistItems.map((p) => (
              <div 
                key={p.id} 
                className="group bg-[#111111] border border-[#C9A84C]/15 rounded-lg overflow-hidden flex flex-col justify-between shadow-lg hover:border-[#C9A84C] transition-colors"
              >
                {/* Image */}
                <div className="relative aspect-square w-full overflow-hidden bg-[#0A0A0A]">
                  <img 
                    src={p.images[0]} 
                    alt={p.name} 
                    className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500" 
                  />
                  <button
                    onClick={() => handleRemove(p.id)}
                    className="absolute top-3 right-3 p-2 bg-[#0A0A0A]/60 border border-red-500/10 hover:border-red-500 hover:bg-red-950/25 rounded-full text-[#9A8F7E] hover:text-red-400 transition-all cursor-pointer"
                    title="Remove item"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>

                {/* Details */}
                <div className="p-5 flex flex-col flex-grow gap-2">
                  <h3 className="font-display text-sm font-bold text-[#F5F0E8] line-clamp-1">
                    {p.name}
                  </h3>
                  <span className="font-body text-xs text-[#C9A84C] font-semibold">
                    ₹{p.price.toLocaleString()}
                  </span>
                  
                  <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-[#C9A84C]/10">
                    <button 
                      onClick={() => handleMoveToCart(p.id)}
                      className="w-full flex items-center justify-center gap-1.5 bg-[#C9A84C] text-[#0A0A0A] py-2.5 text-[9px] font-accent uppercase tracking-widest font-extrabold transition-colors cursor-pointer"
                    >
                      <ShoppingCart size={11} /> Move to Cart
                    </button>
                    <NextLink 
                      href={`/products/${p.slug}`}
                      className="w-full flex items-center justify-center border border-[#C9A84C]/30 text-[#C9A84C] hover:border-[#C9A84C] py-2.5 text-[9px] font-accent uppercase tracking-widest font-bold transition-colors"
                    >
                      View Details
                    </NextLink>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
