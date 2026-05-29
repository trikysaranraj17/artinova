'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '../../context/AppContext';
import { createOrder, Order } from '../../lib/db';
import { sendOrderEmailNotification } from '../../lib/email';
import { ShieldCheck, Upload, Sparkles, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CheckoutPage() {
  const { cart, user, clearUserCart } = useApp();
  const router = useRouter();

  // Redirect if cart is empty or user is not logged in
  useEffect(() => {
    if (cart.length === 0) {
      router.push('/cart');
    }
    if (!user) {
      router.push('/cart');
    }
  }, [cart, user, router]);

  // Shipping details state
  const [name, setName] = useState(user?.full_name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [email, setEmail] = useState(user?.email || '');
  const [address, setAddress] = useState(user?.address || '');
  
  // Payment screenshot upload state
  const [screenshotBase64, setScreenshotBase64] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [uploadLoading, setUploadLoading] = useState(false);
  
  const [placingOrder, setPlacingOrder] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Success overlay state
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);

  const subtotal = cart.reduce((acc, item) => acc + (item.product?.price || 0) * item.quantity, 0);

  // Convert uploaded image to base64
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File is too large. Max size is 5MB.');
      return;
    }

    setFileName(file.name);
    setUploadLoading(true);

    const reader = new FileReader();
    reader.onload = () => {
      setScreenshotBase64(reader.result as string);
      setUploadLoading(false);
    };
    reader.onerror = () => {
      setError('Failed to read image file.');
      setUploadLoading(false);
    };
    reader.readAsDataURL(file);
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!screenshotBase64) {
      setError('Please upload a screenshot of your GPay transaction before placing the order.');
      return;
    }

    setPlacingOrder(true);
    setError(null);

    try {
      // Calculate delivery estimate (5 days from now)
      const deliveryDate = new Date();
      deliveryDate.setDate(deliveryDate.getDate() + 5);

      const orderData = {
        user_id: user?.id,
        shipping_name: name,
        shipping_phone: phone,
        shipping_email: email,
        shipping_address: address,
        total_amount: subtotal,
        screenshot_url: screenshotBase64, // Stored as base64 string
        delivery_estimate: deliveryDate.toISOString()
      };

      const orderItems = cart.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.product?.price || 0
      }));

      // Write to Database
      const placed = await createOrder(orderData, orderItems);
      setCreatedOrder(placed);
      
      // Dispatch notification via FormSubmit.co
      try {
        const emailItems = cart.map(item => ({
          id: item.id,
          order_id: placed.id,
          product_id: item.product_id,
          quantity: item.quantity,
          price: item.product?.price || 0,
          product: item.product
        }));
        await sendOrderEmailNotification(placed, emailItems);
      } catch (emailErr) {
        console.error('Failed to send order email receipt:', emailErr);
      }
      
      // Clear shopping cart
      await clearUserCart();

      // Show Cinematic Success overlay
      setShowSuccessOverlay(true);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to place your order. Please try again.');
    } finally {
      setPlacingOrder(false);
    }
  };

  return (
    <div className="min-h-screen py-16 px-6 bg-ambient-glow relative">
      
      {/* Cinematic Success Overlay Modal */}
      <AnimatePresence>
        {showSuccessOverlay && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[100] bg-matte-black/95 backdrop-blur-lg flex flex-col items-center justify-center p-6 text-center"
          >
            {/* Ambient gold glows */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full bg-royal-gold/15 blur-[80px] pointer-events-none" />

            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: 'spring', damping: 15 }}
              className="max-w-md flex flex-col items-center gap-6"
            >
              <div className="w-20 h-20 rounded-full bg-royal-gold/10 border border-royal-gold flex items-center justify-center text-royal-gold filter drop-shadow-[0_0_10px_rgba(212,175,55,0.4)] animate-bounce">
                <CheckCircle2 size={38} />
              </div>

              <div className="flex flex-col gap-3">
                <h2 className="font-cinzel text-2xl md:text-3xl font-bold tracking-widest text-gold-gradient">
                  ORDER PLACED
                </h2>
                <p className="font-poppins text-xs text-royal-gold uppercase tracking-[0.25em] font-semibold">
                  Artisan Commission Received
                </p>
              </div>

              <p className="font-poppins text-sm text-soft-ivory/70 leading-relaxed mt-4">
                Thank you for choosing <span className="text-champagne-gold font-medium">ARTINOVA</span>. <br />
                Your handcrafted order has been received. <br />
                We will reach you soon.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-4 mt-8 w-full">
                <button
                  onClick={() => router.push(`/tracking/${createdOrder?.id}`)}
                  className="w-full font-poppins text-xs font-semibold uppercase tracking-[0.2em] bg-royal-gold text-matte-black py-4 rounded hover:bg-champagne-gold hover:shadow-[0_0_15px_rgba(214,175,55,0.4)] transition-all duration-300"
                >
                  Track Order Timeline
                </button>
                <button
                  onClick={() => router.push('/')}
                  className="w-full font-poppins text-xs font-semibold uppercase tracking-[0.2em] border border-champagne-gold/25 text-soft-ivory py-4 rounded hover:bg-champagne-gold/5 transition-all duration-300"
                >
                  Return to Home
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-6xl mx-auto">
        
        {/* Title */}
        <div className="flex flex-col gap-2 mb-12">
          <span className="font-poppins text-[10px] text-royal-gold uppercase tracking-[0.25em] font-semibold">Secure Checkout</span>
          <h1 className="font-cinzel text-3xl md:text-5xl font-bold tracking-wide text-soft-ivory">
            Artisan Commission
          </h1>
          <div className="w-12 h-[1px] bg-royal-gold/60 mt-1" />
        </div>

        {error && (
          <div className="bg-red-950/40 border border-red-500/30 text-red-200 text-xs p-4 rounded mb-8 font-poppins">
            {error}
          </div>
        )}

        <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Shipping Form (Left - 7 cols) */}
          <div className="lg:col-span-7 glass-panel p-8 rounded-lg flex flex-col gap-6 border border-champagne-gold/5">
            <h3 className="font-cinzel text-sm uppercase tracking-widest text-champagne-gold font-semibold mb-2">
              Shipping & Custom Registry
            </h3>

            {/* Full Name */}
            <div className="flex flex-col gap-1.5">
              <label className="font-poppins text-[10px] uppercase tracking-wider text-soft-ivory/50">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Receiver full name"
                className="bg-matte-black/55 border border-champagne-gold/15 py-3 px-4 text-xs font-poppins rounded focus:outline-none focus:border-royal-gold/60 text-soft-ivory"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Phone */}
              <div className="flex flex-col gap-1.5">
                <label className="font-poppins text-[10px] uppercase tracking-wider text-soft-ivory/50">Phone Number</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Shipping phone number"
                  className="bg-matte-black/55 border border-champagne-gold/15 py-3 px-4 text-xs font-poppins rounded focus:outline-none focus:border-royal-gold/60 text-soft-ivory"
                />
              </div>

              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label className="font-poppins text-[10px] uppercase tracking-wider text-soft-ivory/50">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Order updates email"
                  className="bg-matte-black/55 border border-champagne-gold/15 py-3 px-4 text-xs font-poppins rounded focus:outline-none focus:border-royal-gold/60 text-soft-ivory"
                />
              </div>
            </div>

            {/* Address */}
            <div className="flex flex-col gap-1.5">
              <label className="font-poppins text-[10px] uppercase tracking-wider text-soft-ivory/50">Delivery Address</label>
              <textarea
                required
                rows={3}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Full delivery location details"
                className="bg-matte-black/55 border border-champagne-gold/15 py-3 px-4 text-xs font-poppins rounded focus:outline-none focus:border-royal-gold/60 text-soft-ivory resize-none"
              />
            </div>
          </div>

          {/* Payment GPay Panel (Right - 5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            {/* GPay QR Block */}
            <div className="glass-panel p-6 rounded-lg border border-champagne-gold/10 flex flex-col items-center text-center gap-4">
              <h3 className="font-cinzel text-sm uppercase tracking-widest text-champagne-gold font-semibold">
                Google Pay QR Transfer
              </h3>
              
              {/* Dynamic Luxury GPay QR Vector Representation */}
              <div className="bg-[#faf7f2] p-4 rounded-lg relative w-48 h-48 border border-royal-gold/20 flex flex-col items-center justify-between">
                {/* QR Framing corner markers */}
                <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-matte-black" />
                <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-matte-black" />
                <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-matte-black" />
                <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-matte-black" />

                {/* Simulated QR Grid Pattern */}
                <div className="flex flex-col items-center justify-center flex-grow w-full">
                  <svg viewBox="0 0 100 100" className="w-[85%] h-[85%] text-matte-black">
                    {/* QR Finder patterns */}
                    <rect x="0" y="0" width="22" height="22" fill="currentColor" />
                    <rect x="3" y="3" width="16" height="16" fill="white" />
                    <rect x="6" y="6" width="10" height="10" fill="currentColor" />

                    <rect x="78" y="0" width="22" height="22" fill="currentColor" />
                    <rect x="81" y="3" width="16" height="16" fill="white" />
                    <rect x="84" y="6" width="10" height="10" fill="currentColor" />

                    <rect x="0" y="78" width="22" height="22" fill="currentColor" />
                    <rect x="3" y="81" width="16" height="16" fill="white" />
                    <rect x="6" y="84" width="10" height="10" fill="currentColor" />
                    
                    {/* Simulated random data columns */}
                    <rect x="30" y="0" width="6" height="6" fill="currentColor" />
                    <rect x="42" y="4" width="10" height="6" fill="currentColor" />
                    <rect x="60" y="0" width="8" height="12" fill="currentColor" />
                    
                    <rect x="30" y="18" width="12" height="6" fill="currentColor" />
                    <rect x="48" y="24" width="6" height="12" fill="currentColor" />
                    <rect x="60" y="20" width="10" height="6" fill="currentColor" />

                    <rect x="0" y="32" width="6" height="12" fill="currentColor" />
                    <rect x="12" y="40" width="12" height="6" fill="currentColor" />
                    <rect x="30" y="36" width="18" height="6" fill="currentColor" />

                    <rect x="85" y="32" width="10" height="10" fill="currentColor" />
                    <rect x="70" y="42" width="12" height="6" fill="currentColor" />
                    <rect x="80" y="60" width="15" height="6" fill="currentColor" />

                    <rect x="30" y="52" width="6" height="18" fill="currentColor" />
                    <rect x="44" y="60" width="16" height="6" fill="currentColor" />
                    <rect x="65" y="55" width="6" height="12" fill="currentColor" />

                    <rect x="30" y="78" width="12" height="6" fill="currentColor" />
                    <rect x="48" y="85" width="18" height="8" fill="currentColor" />
                    <rect x="70" y="78" width="8" height="18" fill="currentColor" />
                  </svg>
                </div>

                {/* GPay Label */}
                <span className="font-poppins text-[8px] font-bold tracking-widest text-[#1e3d59] -mt-1 uppercase">
                  ARTINOVA.GPAY@UPI
                </span>
              </div>

              <p className="font-poppins text-[10px] text-soft-ivory/50 leading-relaxed px-4">
                Scan the QR code with any UPI app (GPay, PhonePe, Paytm), complete the transfer of <span className="text-royal-gold font-medium">${subtotal.toFixed(2)}</span>, and upload the transaction receipt screenshot below.
              </p>
            </div>

            {/* Upload screenshot */}
            <div className="glass-panel p-6 rounded-lg border border-champagne-gold/10 flex flex-col gap-4">
              <h3 className="font-cinzel text-xs uppercase tracking-widest text-champagne-gold font-semibold">
                Upload Payment Screenshot
              </h3>

              <div className="relative border border-dashed border-champagne-gold/20 hover:border-royal-gold/50 rounded-lg p-6 transition-colors bg-matte-black/30 flex flex-col items-center justify-center text-center cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-20"
                />
                
                <Upload className="text-royal-gold/60 mb-2 group-hover:text-royal-gold" size={24} />
                
                <span className="font-poppins text-xs text-soft-ivory/80 font-medium">
                  {fileName ? fileName : 'Choose Screenshot Image'}
                </span>
                <span className="font-poppins text-[9px] text-soft-ivory/40 mt-1">
                  JPG, PNG, WebP up to 5MB
                </span>
              </div>

              {screenshotBase64 && (
                <div className="relative w-full h-32 rounded border border-champagne-gold/10 overflow-hidden bg-matte-black/60 flex items-center justify-center">
                  <img
                    src={screenshotBase64}
                    alt="Preview screenshot"
                    className="object-contain max-h-full max-w-full"
                  />
                  <div className="absolute top-2 right-2 bg-matte-black/80 text-emerald-400 text-[8px] uppercase tracking-wider py-1 px-2 rounded border border-emerald-400/20 font-poppins">
                    Loaded Successfully
                  </div>
                </div>
              )}
            </div>

            {/* Checkout Action CTA */}
            <button
              type="submit"
              disabled={placingOrder || uploadLoading}
              className="w-full py-4.5 bg-royal-gold text-matte-black font-poppins text-xs font-semibold uppercase tracking-[0.2em] rounded hover:bg-champagne-gold hover:shadow-[0_0_15px_rgba(214,175,55,0.4)] transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {placingOrder ? 'PLACING COMMISSION...' : 'PLACE ORDER'}
            </button>

            {/* Trust badge */}
            <div className="flex items-center justify-center gap-2 text-soft-ivory/40 font-poppins text-[9px] uppercase tracking-widest mt-2">
              <ShieldCheck size={12} /> SSL Secured Payment verification
            </div>

          </div>

        </form>

      </div>
    </div>
  );
}
