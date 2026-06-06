'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function MiniCartDrawer() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { 
    items, 
    giftNote, 
    setGiftNote, 
    cartDrawerOpen, 
    setCartDrawerOpen, 
    updateQty, 
    removeItem, 
    getSubtotal,
    getShipping
  } = useCartStore();

  const subtotal = getSubtotal();
  const shipping = getShipping();
  const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);

  const handleCheckout = () => {
    setCartDrawerOpen(false);
    router.push('/checkout');
  };

  const handleViewCart = () => {
    setCartDrawerOpen(false);
    router.push('/cart');
  };

  const uId = user?.id || 'guest';

  return (
    <AnimatePresence>
      {cartDrawerOpen && (
        <>
          {/* Backdrop Blur Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setCartDrawerOpen(false)}
            className="fixed inset-0 bg-[#0A0A0A]/70 backdrop-blur-sm z-[2500]"
          />

          {/* Drawer Body - Width: 420px desktop, 100vw mobile */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 220 }}
            className="fixed top-0 right-0 h-full w-full sm:w-[420px] bg-[#111111] border-l border-[#C9A84C]/15 shadow-[0_0_50px_rgba(0,0,0,0.9)] z-[2600] flex flex-col justify-between font-body select-none"
          >
            {/* Header: 64px height, padding 0 20px, border-bottom */}
            <div className="h-16 px-5 border-b border-[#C9A84C]/15 flex items-center justify-between bg-[#0D0D0D]">
              <button
                onClick={() => setCartDrawerOpen(false)}
                className="text-[#9A8F7E] hover:text-[#C9A84C] flex items-center gap-1.5 text-[10px] font-accent uppercase tracking-widest cursor-pointer"
              >
                <X size={14} /> Close
              </button>
              <span className="font-display text-sm font-bold text-[#F5F0E8] uppercase tracking-widest">
                Your Cart
              </span>
              <span className="text-[#C9A84C] font-mono font-bold text-xs bg-[#C9A84C]/10 px-2 py-0.5 rounded border border-[#C9A84C]/20">
                [{cartCount}]
              </span>
            </div>

            {/* Scrollable Item List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#0A0A0A]/20">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center gap-4 opacity-40 py-20">
                  <ShoppingBag size={40} className="text-[#C9A84C]/40" />
                  <span className="font-accent text-[9px] uppercase tracking-widest text-[#F5F0E8]">
                    Your Cart is Empty
                  </span>
                </div>
              ) : (
                items.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex gap-4 py-4 px-5 border-b border-[#C9A84C]/10 bg-transparent relative items-center"
                  >
                    {/* Item Image: 64px border-radius 8px */}
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-[#C9A84C]/10 bg-[#0A0A0A] shrink-0">
                      <img
                        src={item.product?.images?.[0] || 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=300'}
                        alt={item.product?.name || 'Bespoke Gift'}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Item Details */}
                    <div className="flex-grow flex flex-col justify-between min-h-[64px] min-w-0 pr-6">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <h4 className="font-display text-xs font-bold text-[#F5F0E8] truncate">
                            {item.product?.name || 'Custom Keepsake'}
                          </h4>
                          {/* Variant/Customizations info */}
                          {item.customization && (
                            <div className="flex flex-col gap-0.5 text-[8.5px] font-accent text-[#9A8F7E]/70 mt-0.5 uppercase tracking-wider">
                              {item.customization.engravingText && <span>Text: "{item.customization.engravingText}"</span>}
                              {item.customization.variantSize && <span>Size: {item.customization.variantSize.split(' ')[0]}</span>}
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => removeItem(uId, item.product_id)}
                          className="text-[#9A8F7E]/40 hover:text-red-400 p-1 transition-colors cursor-pointer shrink-0"
                          title="Remove item"
                        >
                          <X size={12} />
                        </button>
                      </div>
                      
                      <div className="flex items-center justify-between gap-4 mt-2">
                        {/* Qty step buttons: 28x28px */}
                        <div className="flex items-center border border-[#C9A84C]/25 rounded bg-[#0A0A0A] overflow-hidden shrink-0">
                          <button
                            onClick={() => updateQty(uId, item.product_id, item.quantity - 1)}
                            className="w-[28px] h-[28px] flex items-center justify-center text-[#9A8F7E] hover:text-[#C9A84C] transition-colors cursor-pointer text-xs"
                          >
                            -
                          </button>
                          <span className="px-2 text-[10px] text-[#F5F0E8] font-bold">{item.quantity}</span>
                          <button
                            onClick={() => updateQty(uId, item.product_id, item.quantity + 1)}
                            className="w-[28px] h-[28px] flex items-center justify-center text-[#9A8F7E] hover:text-[#C9A84C] transition-colors cursor-pointer text-xs"
                          >
                            +
                          </button>
                        </div>

                        {/* Price */}
                        <span className="font-body text-xs font-bold text-[#C9A84C]">
                          ₹{((item.product?.price || 0) * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Gift Note: padding 16px 20px, border-top, 40px textarea */}
            {items.length > 0 && (
              <div className="p-4 px-5 border-t border-[#C9A84C]/15 bg-[#0D0D0D] flex flex-col gap-1.5">
                <label className="text-[10px] uppercase tracking-widest text-[#9A8F7E] font-bold">GIFT NOTE</label>
                <textarea
                  rows={1}
                  value={giftNote}
                  onChange={(e) => setGiftNote(e.target.value)}
                  placeholder="Add a personal gift note..."
                  className="w-full h-10 bg-[#0A0A0A] border border-[#C9A84C]/15 text-xs p-2 rounded text-white placeholder-[#9A8F7E]/30 focus:border-[#C9A84C] outline-none resize-none font-body text-[14px]"
                />
              </div>
            )}

            {/* Subtotal, Shipping, Total: padding 20px, border-top */}
            {items.length > 0 && (
              <div className="p-5 border-t border-[#C9A84C]/15 bg-[#111111] flex flex-col gap-3">
                <div className="flex justify-between items-center text-xs text-[#9A8F7E]">
                  <span>Subtotal:</span>
                  <span className="text-[#F5F0E8]">₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-xs text-[#9A8F7E]">
                  <span>Shipping:</span>
                  <span className="text-[#C9A84C] uppercase tracking-widest text-[10px] font-bold">FREE</span>
                </div>
                <hr className="border-t border-[#C9A84C]/10 my-0.5" />
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-[#9A8F7E]">Total:</span>
                  <span className="font-display text-[22px] font-bold text-[#C9A84C]">
                    ₹{subtotal.toLocaleString()}
                  </span>
                </div>

                {/* Buttons — 52px height */}
                <button
                  onClick={handleCheckout}
                  className="w-full h-[52px] bg-[#C9A84C] text-[#0A0A0A] rounded font-accent text-xs uppercase tracking-[0.2em] font-extrabold hover:bg-[#F5F0E8] transition-all flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(201,168,76,0.35)] cursor-pointer mb-2"
                >
                  Checkout
                </button>
                <button
                  onClick={handleViewCart}
                  className="w-full h-[52px] border border-[#C9A84C]/30 text-[#F5F0E8] hover:border-[#C9A84C] rounded font-accent text-xs uppercase tracking-[0.2em] font-bold hover:bg-[#C9A84C]/5 transition-all text-center cursor-pointer"
                >
                  View Cart
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
