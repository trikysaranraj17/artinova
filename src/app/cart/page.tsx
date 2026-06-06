'use client';

import React, { useEffect } from 'react';
import NextLink from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';
import { Trash2, ShoppingBag, ArrowRight, ArrowLeft } from 'lucide-react';

export default function CartPage() {
  const router = useRouter();
  const { user, setLoginModalOpen } = useAuthStore();
  const { 
    items, 
    giftNote, 
    setGiftNote, 
    updateQty, 
    removeItem, 
    getSubtotal, 
    getGST, 
    getShipping, 
    getTotal, 
    fetchCart 
  } = useCartStore();

  useEffect(() => {
    const uId = user?.id || 'guest';
    fetchCart(uId);
  }, [user]);

  const subtotal = getSubtotal();
  const gst = getGST();
  const shipping = getShipping();
  const total = getTotal();

  const handleCheckoutRedirect = () => {
    if (!user) {
      setLoginModalOpen(true);
    } else {
      router.push('/checkout');
    }
  };

  const uId = user?.id || 'guest';

  // Free shipping progress calculation
  const freeShippingLimit = 999;
  const progressPct = Math.min((subtotal / freeShippingLimit) * 100, 100);
  const remainingForFree = freeShippingLimit - subtotal;

  return (
    <div className="min-h-screen pt-32 pb-24 px-6 bg-[#0A0A0A] text-[#F5F0E8] font-body relative">
      {/* Background glow */}
      <div className="absolute top-1/4 left-1/4 w-[450px] h-[450px] bg-[#C9A84C]/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10">
        
        {/* Back Link */}
        <NextLink
          href="/shop"
          className="inline-flex items-center gap-2 text-xs font-accent uppercase tracking-widest text-[#9A8F7E] hover:text-[#C9A84C] mb-8 transition-colors select-none"
        >
          <ArrowLeft size={13} /> Back to Boutique
        </NextLink>

        {/* Title */}
        <div className="flex flex-col gap-2 mb-10 text-center sm:text-left select-none">
          <span className="font-accent text-[9px] text-[#C9A84C] uppercase tracking-[0.25em]">Shopping Trunk</span>
          <h1 className="font-display text-4xl sm:text-5xl font-semibold tracking-wide text-[#F5F0E8] leading-none">
            My Luxury Selections
          </h1>
          <div className="w-12 h-[1px] bg-[#C9A84C] mt-2 self-center sm:self-start" />
        </div>

        {items.length === 0 ? (
          /* Empty State */
          <div className="text-center py-20 bg-[#111111] border border-[#C9A84C]/15 rounded-lg flex flex-col items-center gap-5 p-8 max-w-xl mx-auto shadow-xl">
            <div className="w-16 h-16 rounded-full border border-dashed border-[#C9A84C]/30 flex items-center justify-center text-[#C9A84C] opacity-50">
              <ShoppingBag size={24} />
            </div>
            <div className="flex flex-col gap-1.5">
              <h3 className="font-display italic text-lg text-[#9A8F7E]">Your trunk is currently empty.</h3>
              <p className="font-body text-xs text-[#9A8F7E]/65 max-w-xs leading-relaxed">
                Add premium geode art clocks, customized frames, or luxury hampers to start checking out.
              </p>
            </div>
            <NextLink href="/shop" className="btn-solid-gold py-3 mt-2">
              Explore Collections
            </NextLink>
          </div>
        ) : (
          /* Symmetrical Split Layout */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Items (8 cols) */}
            <div className="lg:col-span-8 flex flex-col gap-4">
              
              {/* Free Shipping Progress Indicator */}
              <div className="p-4 rounded-lg bg-[#111111] border border-[#C9A84C]/10 select-none flex flex-col gap-2.5">
                <div className="flex justify-between text-[10px] font-accent uppercase tracking-widest text-[#9A8F7E]">
                  {subtotal >= freeShippingLimit ? (
                    <span className="text-emerald-400 font-extrabold">✓ Your order qualifies for free delivery!</span>
                  ) : (
                    <span>Add <strong className="text-[#C9A84C]">₹{remainingForFree.toLocaleString()}</strong> more for free shipping</span>
                  )}
                  <span>Threshold: ₹999</span>
                </div>
                <div className="w-full h-1.5 bg-[#0A0A0A] rounded-full overflow-hidden border border-[#C9A84C]/5">
                  <div 
                    className="h-full bg-gradient-to-r from-[#B8860B] to-[#C9A84C] rounded-full transition-all duration-500"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              </div>

              {items.map((item) => (
                <div
                  key={item.id}
                  className="bg-[#111111] border border-[#C9A84C]/10 p-5 rounded-lg flex flex-col gap-3.5 relative group"
                >
                  <div className="flex items-center justify-between gap-6">
                    {/* Thumbnail */}
                    <div className="relative w-20 h-20 rounded border border-[#C9A84C]/10 overflow-hidden bg-[#0A0A0A] shrink-0">
                      <img
                        src={item.product?.images?.[0] || 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=300'}
                        alt={item.product?.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Title Details */}
                    <div className="flex-grow flex flex-col min-w-0">
                      <span className="font-accent text-[9px] uppercase tracking-wider text-[#C9A84C] font-bold">
                        Boutique Creation
                      </span>
                      <h3 className="font-display text-base font-bold text-[#F5F0E8] truncate mt-1">
                        {item.product?.name}
                      </h3>
                      <span className="font-body text-xs text-[#9A8F7E] mt-1.5">
                        ₹{item.product?.price?.toLocaleString()} each
                      </span>
                    </div>

                    {/* Quantity Adjustment */}
                    <div className="flex items-center gap-4 shrink-0">
                      <div className="flex items-center border border-[#C9A84C]/25 rounded bg-[#0A0A0A] h-10 select-none">
                        <button
                          onClick={() => updateQty(uId, item.product_id, item.quantity - 1)}
                          className="px-3 text-[#9A8F7E] hover:text-[#C9A84C] text-sm font-bold cursor-pointer"
                        >
                          -
                        </button>
                        <span className="w-8 text-center text-xs font-bold">{item.quantity}</span>
                        <button
                          onClick={() => updateQty(uId, item.product_id, item.quantity + 1)}
                          className="px-3 text-[#9A8F7E] hover:text-[#C9A84C] text-sm font-bold cursor-pointer"
                        >
                          +
                        </button>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => removeItem(uId, item.product_id)}
                        className="p-2 text-[#9A8F7E]/40 hover:text-red-400 transition-colors cursor-pointer"
                        title="Remove product"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  {/* Customization Details Summary */}
                  {item.customization && (Object.keys(item.customization).length > 0) && (
                    <div className="p-3.5 rounded bg-[#0A0A0A]/50 border border-[#C9A84C]/10 flex flex-col gap-1.5 text-[10px] font-accent uppercase tracking-wider text-[#9A8F7E]">
                      {item.customization.engravingText && (
                        <div>
                          <span className="text-[#C9A84C] font-bold">Message Engraving: </span>
                          <span className="italic font-body normal-case text-white">&ldquo;{item.customization.engravingText}&rdquo;</span>
                        </div>
                      )}
                      {item.customization.variantSize && (
                        <div>
                          <span className="text-[#C9A84C] font-bold">Selected Size Swatch: </span>
                          <span>{item.customization.variantSize}</span>
                        </div>
                      )}
                      {item.customization.photoUrl && (
                        <div>
                          <span className="text-[#C9A84C] font-bold">Memory Photo: </span>
                          <span className="text-emerald-400 font-extrabold">Image Attached ✓</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {/* Gift Message Card */}
              <div className="bg-[#111111] border border-[#C9A84C]/10 p-6 rounded-lg flex flex-col gap-3 select-none">
                <h3 className="font-accent text-xs font-bold uppercase tracking-widest text-[#C9A84C]">
                  Bespoke Gift Greeting Message
                </h3>
                <p className="font-body text-[10px] text-[#9A8F7E]/65 leading-relaxed">
                  Would you like us to enclose a personalized calligraphy greeting card? Type your message below. We wrap it inside our signature wax stamp envelopes.
                </p>
                <textarea
                  value={giftNote}
                  onChange={(e) => setGiftNote(e.target.value)}
                  rows={3}
                  placeholder="E.g. Wishing you a beautiful journey ahead. Cheers to endless geode memories!"
                  className="w-full bg-[#0A0A0A] border border-[#C9A84C]/10 rounded p-3 text-xs font-body text-[#F5F0E8] placeholder-[#9A8F7E]/30 focus:border-[#C9A84C] outline-none resize-none"
                />
              </div>
            </div>

            {/* Right Column: Checkout Pricing Summary (4 cols) */}
            <div className="lg:col-span-4 bg-[#111111] border border-[#C9A84C]/15 p-6 rounded-lg flex flex-col gap-5 shadow-2xl">
              <h3 className="font-accent text-xs font-bold uppercase tracking-widest text-[#C9A84C]">
                Order Summary
              </h3>
              
              <div className="h-[1px] bg-[#C9A84C]/10" />

              <div className="flex flex-col gap-3 font-body text-xs text-[#9A8F7E]/80">
                <div className="flex justify-between">
                  <span>Trunk Subtotal</span>
                  <span>₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>GST (18% inclusive)</span>
                  <span>₹{gst.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Charges</span>
                  {shipping === 0 ? (
                    <span className="text-emerald-400 font-accent text-[9.5px] uppercase tracking-wider font-bold">Free Shipping</span>
                  ) : (
                    <span>₹{shipping}</span>
                  )}
                </div>
              </div>

              <div className="h-[1px] bg-[#C9A84C]/10" />

              <div className="flex justify-between items-end select-none">
                <span className="font-accent text-xs font-bold uppercase tracking-widest text-[#C9A84C]">Total Amount</span>
                <span className="font-display text-2xl font-bold text-[#C9A84C]">
                  ₹{total.toLocaleString()}
                </span>
              </div>

              <button
                onClick={handleCheckoutRedirect}
                className="w-full mt-4 py-4 bg-[#C9A84C] text-[#0A0A0A] font-accent text-xs font-extrabold uppercase tracking-[0.2em] hover:bg-[#F5F0E8] transition-all duration-300 flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(201,168,76,0.35)] cursor-pointer"
              >
                Proceed to Checkout <ArrowRight size={14} />
              </button>

              {!user && (
                <span className="font-body text-[9.5px] text-[#C9A84C]/75 text-center leading-relaxed select-none">
                  * Authentication is required to place order logs. Guest cart trunks are preserved.
                </span>
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
