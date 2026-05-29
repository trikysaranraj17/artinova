'use client';

import React from 'react';
import Link from 'next/link';
import { useApp } from '../../context/AppContext';
import { Trash2, ShoppingBag, ArrowRight, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

export default function CartPage() {
  const { cart, updateItemQty, removeItemFromCart, user, setLoginModalOpen } = useApp();
  const router = useRouter();

  const subtotal = cart.reduce((acc, item) => acc + (item.product?.price || 0) * item.quantity, 0);

  const handleCheckoutRedirect = () => {
    if (!user) {
      setLoginModalOpen(true);
    } else {
      router.push('/checkout');
    }
  };

  return (
    <div className="min-h-screen py-16 px-6 bg-ambient-glow">
      <div className="max-w-5xl mx-auto">
        
        {/* Title */}
        <div className="flex flex-col gap-2 mb-12">
          <span className="font-poppins text-[10px] text-royal-gold uppercase tracking-[0.25em] font-semibold">Shopping Cart</span>
          <h1 className="font-cinzel text-3xl md:text-5xl font-bold tracking-wide text-soft-ivory">
            My Luxury Selections
          </h1>
          <div className="w-12 h-[1px] bg-royal-gold/60 mt-1" />
        </div>

        {cart.length === 0 ? (
          <div className="text-center py-20 glass-panel rounded-lg border border-champagne-gold/5 flex flex-col items-center gap-6">
            <div className="p-5 rounded-full border border-champagne-gold/10 text-royal-gold">
              <ShoppingBag size={32} />
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="font-cinzel text-lg text-champagne-gold">Your cart is empty</h3>
              <p className="font-poppins text-xs text-soft-ivory/50">
                You haven&apos;t added any handcrafted gifts to your cart yet.
              </p>
            </div>
            <Link
              href="/shop"
              className="font-poppins text-xs uppercase tracking-[0.2em] bg-royal-gold text-matte-black px-8 py-3.5 rounded hover:bg-champagne-gold transition-colors font-semibold"
            >
              Browse Boutique
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Items Column (Left - 8 cols) */}
            <div className="lg:col-span-8 flex flex-col gap-4">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="glass-panel p-5 rounded-lg flex items-center justify-between gap-6 border border-champagne-gold/5"
                >
                  {/* Thumbnail */}
                  <div className="relative w-20 h-20 rounded border border-champagne-gold/10 overflow-hidden shrink-0">
                    <img
                      src={item.product?.images[0] || 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=500'}
                      alt={item.product?.title}
                      className="object-cover w-full h-full"
                    />
                  </div>

                  {/* Title & Price */}
                  <div className="flex-grow flex flex-col min-w-0">
                    <span className="font-poppins text-[9px] uppercase tracking-wider text-royal-gold">
                      {item.product?.category}
                    </span>
                    <h3 className="font-cinzel text-sm font-bold text-soft-ivory truncate mt-1">
                      {item.product?.title}
                    </h3>
                    <span className="font-poppins text-xs text-champagne-gold font-medium mt-1">
                      ${(item.product?.price || 0).toFixed(2)} each
                    </span>
                  </div>

                  {/* Qty and Actions */}
                  <div className="flex items-center gap-6 shrink-0">
                    {/* Qty adjustments */}
                    <div className="flex items-center border border-champagne-gold/10 rounded bg-matte-black/30 h-10">
                      <button
                        onClick={() => updateItemQty(item.product_id, item.quantity - 1)}
                        className="px-3 text-soft-ivory/50 hover:text-champagne-gold text-sm"
                      >
                        -
                      </button>
                      <span className="w-8 text-center text-xs font-poppins font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateItemQty(item.product_id, item.quantity + 1)}
                        className="px-3 text-soft-ivory/50 hover:text-champagne-gold text-sm"
                      >
                        +
                      </button>
                    </div>

                    {/* Delete */}
                    <button
                      onClick={() => removeItemFromCart(item.product_id)}
                      className="p-2 text-soft-ivory/30 hover:text-red-400 transition-colors"
                      title="Remove product"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                </div>
              ))}
            </div>

            {/* Summary Column (Right - 4 cols) */}
            <div className="lg:col-span-4 glass-card p-6 rounded-lg flex flex-col gap-6 border border-champagne-gold/10">
              <h3 className="font-cinzel text-sm uppercase tracking-widest text-champagne-gold font-semibold">
                Order Summary
              </h3>
              
              <div className="h-[1px] bg-champagne-gold/10" />

              <div className="flex justify-between items-center text-xs font-poppins text-soft-ivory/60">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-xs font-poppins text-soft-ivory/60">
                <span>Luxury Wrapping</span>
                <span className="text-emerald-400 uppercase text-[9px] tracking-wider font-semibold">Complimentary</span>
              </div>
              <div className="flex justify-between items-center text-xs font-poppins text-soft-ivory/60">
                <span>Delivery Charge</span>
                <span className="text-emerald-400 uppercase text-[9px] tracking-wider font-semibold">Complimentary</span>
              </div>

              <div className="h-[1px] bg-champagne-gold/10" />

              <div className="flex justify-between items-end">
                <span className="font-cinzel text-xs uppercase tracking-widest text-champagne-gold">Total Amount</span>
                <span className="font-poppins text-lg font-bold text-royal-gold">
                  ${subtotal.toFixed(2)}
                </span>
              </div>

              <button
                onClick={handleCheckoutRedirect}
                className="w-full mt-4 py-4 bg-royal-gold text-matte-black font-poppins text-xs font-semibold uppercase tracking-[0.2em] rounded hover:bg-champagne-gold hover:shadow-[0_0_12px_rgba(214,175,55,0.35)] transition-all duration-300 flex items-center justify-center gap-2"
              >
                Proceed to Checkout <ArrowRight size={14} />
              </button>

              {!user && (
                <span className="font-poppins text-[10px] text-royal-gold/60 text-center leading-relaxed">
                  * Authentication is required prior to checkout. Guest carts are preserved.
                </span>
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
