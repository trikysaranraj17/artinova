'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import NextLink from 'next/link';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';
import { createOrder, Order, getSettings, getOrderItems } from '../../lib/db';
import { sendEmailTrigger } from '../../lib/email';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { ShieldCheck, Upload, Sparkles, CheckCircle2, ArrowRight, ArrowLeft, Heart, ShoppingBag, Eye, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { 
    items, 
    giftNote, 
    getSubtotal, 
    getGST, 
    getShipping, 
    getTotal, 
    clearCart 
  } = useCartStore();

  // Redirect if cart is empty or user is not logged in
  useEffect(() => {
    if (items.length === 0) {
      router.push('/cart');
    }
  }, [items, router]);

  // Checkout Step Wizard State: 1 = Info, 2 = Review, 3 = Payment
  const [checkoutStep, setCheckoutStep] = useState(1);

  // Shipping details state
  const [name, setName] = useState(user?.full_name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [email, setEmail] = useState(user?.email || '');
  const [address, setAddress] = useState(user?.address || '');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [instructions, setInstructions] = useState('');

  // Saved addresses registry
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [selectedAddressIndex, setSelectedAddressIndex] = useState<number | string>('new');

  // Load Saved Addresses
  useEffect(() => {
    if (user) {
      const stored = localStorage.getItem(`addresses_${user.id}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        setSavedAddresses(parsed);
        const defIdx = parsed.findIndex((a: any) => a.is_default);
        if (defIdx !== -1) {
          setSelectedAddressIndex(defIdx);
          autofillAddress(parsed[defIdx]);
        }
      }
    }
  }, [user]);

  const autofillAddress = (addr: any) => {
    setName(addr.fullName || '');
    setPhone(addr.phone || '');
    setAddress(addr.line1 || '');
    setCity(addr.city || '');
    setState(addr.state || '');
    setPincode(addr.pincode || '');
  };

  const handleAddressSelect = (val: string) => {
    setSelectedAddressIndex(val);
    if (val === 'new') {
      setName(user?.full_name || '');
      setPhone(user?.phone || '');
      setAddress(user?.address || '');
      setCity('');
      setState('');
      setPincode('');
    } else {
      const idx = parseInt(val, 10);
      if (savedAddresses[idx]) {
        autofillAddress(savedAddresses[idx]);
      }
    }
  };

  // UPI configuration from settings
  const [settings, setSettings] = useState({
    gpay_upi_id: 'artinova@upi',
    gpay_qr_url: 'https://images.unsplash.com/photo-1605098295594-ea2243d56fc7?w=300'
  });

  useEffect(() => {
    async function loadSettings() {
      try {
        const data = await getSettings();
        if (data) {
          setSettings({
            gpay_upi_id: data.gpay_upi_id || 'artinova@upi',
            gpay_qr_url: data.gpay_qr_url || 'https://images.unsplash.com/photo-1605098295594-ea2243d56fc7?w=300'
          });
        }
      } catch (err) {
        console.error('Error fetching settings:', err);
      }
    }
    loadSettings();
  }, []);

  // Payment screenshot upload state
  const [screenshotBase64, setScreenshotBase64] = useState<string>('');
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [uploadLoading, setUploadLoading] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);
  
  const [placingOrder, setPlacingOrder] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const subtotal = getSubtotal();
  const gst = getGST();
  const shipping = getShipping();
  const total = getTotal();

  // Handle Drag Over
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  // Handle Drag Leave
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
  };

  // Handle Drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    setError(null);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  // Convert uploaded image to base64
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (PNG, JPG, JPEG, WEBP).');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('File is too large. Max size is 10MB.');
      return;
    }

    setFileName(file.name);
    setScreenshotFile(file);
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
      setError('Please upload a screenshot of your GPay/UPI transaction to proceed.');
      return;
    }

    setPlacingOrder(true);
    setError(null);

    try {
      const orderNumber = `ART-2026-${Math.floor(10000 + Math.random() * 90000)}`;
      let finalScreenshotUrl = screenshotBase64;

      // 1. Upload to Supabase Storage if configured
      if (isSupabaseConfigured && screenshotFile) {
        try {
          const fileExt = screenshotFile.name.split('.').pop();
          const storageFileName = `payment_${orderNumber}_${Date.now()}.${fileExt}`;
          
          const { data: uploadData, error: uploadErr } = await supabase.storage
            .from('payment_screenshots')
            .upload(storageFileName, screenshotFile, {
              cacheControl: '3600',
              upsert: false
            });
            
          if (uploadErr) throw uploadErr;
          
          const { data: { publicUrl } } = supabase.storage
            .from('payment_screenshots')
            .getPublicUrl(storageFileName);
            
          finalScreenshotUrl = publicUrl;
        } catch (storageErr) {
          console.warn('Error uploading payment screenshot to Supabase Storage, using fallback:', storageErr);
        }
      }

      // 2. Format Shipping Address
      const fullShippingAddress = `${address}, ${city}, ${state} - ${pincode}. Instructions: ${instructions || 'None'}`;

      // 3. Construct Order Data
      const orderData = {
        user_id: user?.id || 'guest',
        subtotal: subtotal,
        gst: gst,
        shipping: shipping,
        total: total,
        gift_note: giftNote || '',
        payment_screenshot_url: finalScreenshotUrl,
        shipping_name: name,
        shipping_phone: phone,
        shipping_address: fullShippingAddress
      };

      const orderItems = items.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.product?.price || 0,
        customization: item.customization || {}
      }));

      // 4. Create Order in Database
      const placed = await createOrder(orderData, orderItems);
      
      // Update order ID in return if needed
      const orderIdForConfirmation = placed.id || `order-${Date.now()}`;

      // 5. Send order email via unified API Route
      try {
        const placedItems = await getOrderItems(orderIdForConfirmation);
        await sendEmailTrigger(placed, placedItems, 'placed', user?.email || email);
      } catch (emailErr) {
        console.error('Failed to trigger order confirmation email dispatch:', emailErr);
      }

      // 6. Clear client cart
      const uId = user?.id || 'guest';
      await clearCart(uId);

      // 7. Route to order confirmation page
      router.push(`/order-confirmation/${orderIdForConfirmation}`);

    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to place your order. Please verify details and try again.');
    } finally {
      setPlacingOrder(false);
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-24 px-6 bg-[#0A0A0A] text-[#F5F0E8] font-body relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#C9A84C]/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10">
        
        {/* Back link */}
        <NextLink
          href="/cart"
          className="inline-flex items-center gap-2 text-xs font-accent uppercase tracking-widest text-[#9A8F7E] hover:text-[#C9A84C] mb-8 transition-colors select-none"
        >
          <ArrowLeft size={13} /> Back to Trunk
        </NextLink>

        {/* Title */}
        <div className="flex flex-col gap-2 mb-8 select-none">
          <span className="font-accent text-[9px] text-[#C9A84C] uppercase tracking-[0.25em]">Secure Checkout</span>
          <h1 className="font-display text-4xl sm:text-5xl font-semibold tracking-wide text-[#F5F0E8] leading-none">
            Bespoke Gifting Registry
          </h1>
          <div className="w-12 h-[1px] bg-[#C9A84C] mt-2" />
        </div>

        {/* Steps Breadcrumb Progress Indicators */}
        <div className="flex items-center justify-center max-w-xl mx-auto mb-12 gap-4 select-none">
          {[
            { stepNum: 1, label: "Info" },
            { stepNum: 2, label: "Review" },
            { stepNum: 3, label: "Payment" }
          ].map((s) => (
            <React.Fragment key={s.stepNum}>
              <div className="flex items-center gap-2">
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold font-body border transition-colors ${
                  checkoutStep >= s.stepNum 
                    ? 'bg-[#C9A84C] border-[#C9A84C] text-[#0A0A0A]' 
                    : 'bg-[#111111] border-[#C9A84C]/15 text-[#9A8F7E]/50'
                }`}>
                  {s.stepNum}
                </span>
                <span className={`font-accent text-[10px] uppercase tracking-widest transition-colors ${
                  checkoutStep === s.stepNum ? 'text-[#C9A84C] font-bold' : 'text-[#9A8F7E]/40'
                }`}>
                  {s.label}
                </span>
              </div>
              {s.stepNum < 3 && <div className="w-12 h-[1px] bg-[#C9A84C]/10" />}
            </React.Fragment>
          ))}
        </div>

        {error && (
          <div className="bg-red-950/40 border border-red-500/30 text-red-200 text-xs p-4 rounded mb-8 font-body">
            {error}
          </div>
        )}

        {/* STEP 1: CUSTOMER INFORMATION FORM */}
        {checkoutStep === 1 && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto bg-[#111111] border border-[#C9A84C]/10 p-8 rounded-lg flex flex-col gap-6 shadow-2xl relative"
          >
            <div className="flex items-center justify-between border-b border-[#C9A84C]/10 pb-4 mb-2">
              <h3 className="font-accent text-xs font-bold uppercase tracking-widest text-[#C9A84C] flex items-center gap-2">
                <MapPin size={14} className="text-[#C9A84C]" /> Shipping Registry
              </h3>
              
              {user && savedAddresses.length > 0 && (
                <div className="flex items-center gap-2 select-none">
                  <label className="text-[9px] uppercase tracking-widest text-[#9A8F7E] font-bold">Use Saved:</label>
                  <select
                    value={selectedAddressIndex}
                    onChange={(e) => handleAddressSelect(e.target.value)}
                    className="bg-[#0A0A0A] border border-[#C9A84C]/15 text-[10px] p-1.5 rounded text-[#F5F0E8] font-accent uppercase tracking-wider outline-none focus:border-[#C9A84C]"
                  >
                    <option value="new">Add New Address</option>
                    {savedAddresses.map((addr, idx) => (
                      <option key={idx} value={idx}>{addr.label} ({addr.fullName})</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] uppercase tracking-widest text-[#9A8F7E] font-bold">Recipient Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Receiver full name"
                className="bg-[#0A0A0A]/55 border border-[#C9A84C]/15 py-3 px-4 text-xs rounded text-[#F5F0E8] placeholder-[#9A8F7E]/30"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] uppercase tracking-widest text-[#9A8F7E] font-bold">Contact Phone Number</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Shipping phone coordinates"
                  className="bg-[#0A0A0A]/55 border border-[#C9A84C]/15 py-3 px-4 text-xs rounded text-[#F5F0E8] placeholder-[#9A8F7E]/30"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] uppercase tracking-widest text-[#9A8F7E] font-bold">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email for dispatch updates"
                  className="bg-[#0A0A0A]/55 border border-[#C9A84C]/15 py-3 px-4 text-xs rounded text-[#F5F0E8] placeholder-[#9A8F7E]/30"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] uppercase tracking-widest text-[#9A8F7E] font-bold">Street Address Line</label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Suite, house, street coordinates"
                className="bg-[#0A0A0A]/55 border border-[#C9A84C]/15 py-3 px-4 text-xs rounded text-[#F5F0E8] placeholder-[#9A8F7E]/30"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] uppercase tracking-widest text-[#9A8F7E] font-bold">City</label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Chennai"
                  className="bg-[#0A0A0A]/55 border border-[#C9A84C]/15 py-3 px-4 text-xs rounded text-[#F5F0E8] placeholder-[#9A8F7E]/30"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] uppercase tracking-widest text-[#9A8F7E] font-bold">State</label>
                <input
                  type="text"
                  required
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="e.g. Tamil Nadu"
                  className="bg-[#0A0A0A]/55 border border-[#C9A84C]/15 py-3 px-4 text-xs rounded text-[#F5F0E8] placeholder-[#9A8F7E]/30"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] uppercase tracking-widest text-[#9A8F7E] font-bold">Pincode</label>
                <input
                  type="text"
                  required
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  placeholder="600001"
                  className="bg-[#0A0A0A]/55 border border-[#C9A84C]/15 py-3 px-4 text-xs rounded text-[#F5F0E8] placeholder-[#9A8F7E]/30"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] uppercase tracking-widest text-[#9A8F7E] font-bold">Delivery Instructions (Optional)</label>
              <textarea
                rows={2}
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="Special notes for delivery courier partner (gate codes, delivery timing)"
                className="bg-[#0A0A0A]/55 border border-[#C9A84C]/15 py-3 px-4 text-xs rounded text-[#F5F0E8] placeholder-[#9A8F7E]/30 resize-none"
              />
            </div>

            <button
              type="button"
              onClick={() => {
                if (!name || !phone || !email || !address || !city || !state || !pincode) {
                  setError('Please fill in all required shipping registry fields.');
                  return;
                }
                setError(null);
                setCheckoutStep(2);
              }}
              className="w-full mt-4 py-4 bg-[#C9A84C] text-[#0A0A0A] font-accent text-xs font-extrabold uppercase tracking-[0.2em] rounded hover:bg-[#F5F0E8] hover:shadow-[0_0_15px_rgba(201,168,76,0.35)] transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
            >
              Continue to Review <ArrowRight size={14} />
            </button>
          </motion.div>
        )}

        {/* STEP 2: ORDER REVIEW */}
        {checkoutStep === 2 && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto bg-[#111111] border border-[#C9A84C]/10 p-8 rounded-lg flex flex-col gap-6 shadow-2xl relative"
          >
            <h3 className="font-accent text-xs font-bold uppercase tracking-widest text-[#C9A84C] border-b border-[#C9A84C]/10 pb-4 mb-2">
              Bespoke Order Review
            </h3>

            {/* Address summary */}
            <div className="p-4 bg-[#0A0A0A]/40 border border-[#C9A84C]/10 rounded flex flex-col gap-2 font-body text-xs select-none">
              <span className="text-[#C9A84C] uppercase text-[9px] tracking-widest font-bold">Delivery Destination</span>
              <span className="text-[#F5F0E8]/90 font-bold">{name} &bull; {phone}</span>
              <span className="text-[#9A8F7E]">{address}, {city}, {state} - {pincode}</span>
              {instructions && <span className="text-[#9A8F7E]/50 italic">Notes: {instructions}</span>}
            </div>

            {/* Items display */}
            <div className="flex flex-col gap-4 max-h-64 overflow-y-auto pr-2 select-none">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4 items-center justify-between py-3 border-b border-[#C9A84C]/5 last:border-0">
                  <div className="flex gap-4 items-center min-w-0">
                    <div className="relative w-12 h-12 rounded border border-[#C9A84C]/10 overflow-hidden shrink-0 bg-[#0A0A0A]">
                      <img src={item.product?.images[0]} alt={item.product?.name} className="object-cover w-full h-full" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-display text-sm font-bold text-[#F5F0E8] truncate">{item.product?.name}</span>
                      <span className="font-body text-[10px] text-[#C9A84C] font-bold mt-0.5">₹{item.product?.price?.toLocaleString()} each</span>
                      {item.customization && (item.customization.engravingText || item.customization.variantSize) && (
                        <div className="text-[8.5px] font-accent uppercase tracking-wider text-[#9A8F7E] mt-1">
                          {item.customization.engravingText && <span>Text: "{item.customization.engravingText}"</span>}
                          {item.customization.variantSize && <span> &bull; Size: {item.customization.variantSize.split(' ')[0]}</span>}
                        </div>
                      )}
                    </div>
                  </div>
                  <span className="font-body text-xs font-bold text-[#C9A84C] shrink-0">x{item.quantity}</span>
                </div>
              ))}
            </div>

            {giftNote && (
              <div className="p-4 bg-[#0A0A0A]/40 border border-[#C9A84C]/10 rounded flex flex-col gap-1 font-body text-xs select-none">
                <span className="text-[#C9A84C] uppercase text-[9px] tracking-widest font-bold">Envelope Greetings Note</span>
                <p className="text-[#F5F0E8]/70 leading-relaxed italic">&ldquo;{giftNote}&rdquo;</p>
              </div>
            )}

            {/* Summary details */}
            <div className="border-t border-[#C9A84C]/10 pt-4 flex flex-col gap-2 font-body text-xs text-[#9A8F7E] select-none">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span>₹{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>GST (18% inclusive)</span>
                <span>₹{gst.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Luxury Shipping & Courier</span>
                {shipping === 0 ? (
                  <span className="text-emerald-400 font-accent text-[9px] uppercase tracking-widest font-bold">Free Shipping</span>
                ) : (
                  <span>₹{shipping}</span>
                )}
              </div>
              <div className="flex justify-between items-end border-t border-[#C9A84C]/5 pt-3 mt-1 text-[#F5F0E8] font-bold">
                <span className="font-accent text-xs uppercase tracking-widest text-[#C9A84C]">Total Amount Due</span>
                <span className="text-xl font-bold text-[#C9A84C]">₹{total.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setCheckoutStep(1)}
                className="w-1/3 py-4 border border-[#C9A84C]/20 hover:border-[#C9A84C] text-[#F5F0E8] rounded font-accent text-[10px] uppercase tracking-[0.2em] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft size={14} /> Back
              </button>
              <button
                type="button"
                onClick={() => setCheckoutStep(3)}
                className="w-2/3 py-4 bg-[#C9A84C] text-[#0A0A0A] font-accent text-xs font-extrabold uppercase tracking-[0.2em] rounded hover:bg-[#F5F0E8] hover:shadow-[0_0_15px_rgba(201,168,76,0.35)] transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
              >
                Continue to Payment <ArrowRight size={14} />
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 3: PAYMENT SCREEN & GPAY QR TRANSFERS */}
        {checkoutStep === 3 && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 items-start"
          >
            {/* GPay QR visual (Left - 5 cols) */}
            <div className="md:col-span-5 bg-[#111111] border border-[#C9A84C]/10 p-6 rounded-lg flex flex-col items-center text-center gap-4 shadow-xl">
              <h3 className="font-accent text-[10px] uppercase tracking-widest text-[#C9A84C] font-bold">
                GPay / UPI Scan Code
              </h3>
              
              {/* QR Image display */}
              <div className="bg-[#FAF7F2] p-3 rounded-lg relative w-44 h-44 border border-[#C9A84C]/30 flex items-center justify-center overflow-hidden select-none">
                <img
                  src={settings.gpay_qr_url}
                  alt="UPI QR Scanner"
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="flex flex-col gap-1.5 font-body text-xs select-none">
                <span className="text-[#9A8F7E] uppercase text-[9px] tracking-widest font-bold">Active UPI ID</span>
                <span className="text-[#C9A84C] font-bold text-sm select-all">{settings.gpay_upi_id}</span>
                
                <span className="text-[#9A8F7E] uppercase text-[9px] tracking-widest font-bold mt-2">Amount to Transfer</span>
                <span className="text-[#C9A84C] font-bold text-base">₹{total.toLocaleString()}</span>
              </div>
            </div>

            {/* Screenshot Uploader form (Right - 7 cols) */}
            <div className="md:col-span-7 flex flex-col gap-6">
              <div className="bg-[#111111] border border-[#C9A84C]/10 p-6 rounded-lg flex flex-col gap-4 shadow-xl">
                <h3 className="font-accent text-xs font-bold uppercase tracking-widest text-[#C9A84C]">
                  Payment Slip Screenshot
                </h3>
                <p className="font-body text-[10.5px] text-[#9A8F7E] leading-relaxed">
                  Please initiate a transfer of <strong className="text-[#C9A84C]">₹{total.toLocaleString()}</strong> in your UPI application (Google Pay, PhonePe, Paytm) to UPI ID <strong className="text-[#C9A84C] select-all">{settings.gpay_upi_id}</strong>. Once complete, upload the confirmation screenshot below.
                </p>

                {/* Drag-drop zone */}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`relative border border-dashed rounded-lg p-6 transition-all duration-300 bg-[#0A0A0A]/40 flex flex-col items-center justify-center text-center cursor-pointer ${
                    isDragActive 
                      ? 'border-[#C9A84C] bg-[#C9A84C]/5 shadow-[0_0_15px_rgba(201,168,76,0.15)]' 
                      : 'border-[#C9A84C]/20 hover:border-[#C9A84C]/50'
                  }`}
                >
                  <input
                    type="file"
                    accept="image/*"
                    required
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-20"
                  />
                  
                  <Upload className="text-[#C9A84C] mb-2 animate-bounce" size={22} />
                  
                  <span className="font-body text-xs text-[#F5F0E8] font-bold">
                    {fileName ? fileName : 'Select Transaction Receipt'}
                  </span>
                  <span className="font-body text-[9px] text-[#9A8F7E]/60 mt-1.5">
                    Drag and drop screenshot file (JPG, PNG, WEBP up to 10MB)
                  </span>
                </div>

                {screenshotBase64 && (
                  <div className="relative w-full h-32 rounded border border-[#C9A84C]/10 overflow-hidden bg-[#0A0A0A]/80 flex items-center justify-center select-none">
                    <img
                      src={screenshotBase64}
                      alt="Preview slip"
                      className="object-contain max-h-full max-w-full"
                    />
                    <div className="absolute top-2 right-2 bg-[#0A0A0A]/85 text-emerald-400 text-[8px] uppercase tracking-widest py-1.5 px-3 rounded border border-emerald-500/20 font-accent font-bold">
                      Slip Loaded
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setCheckoutStep(2)}
                  className="w-1/3 py-4 border border-[#C9A84C]/20 hover:border-[#C9A84C] text-[#F5F0E8] rounded font-accent text-[10px] uppercase tracking-[0.2em] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft size={14} /> Back
                </button>
                <button
                  type="button"
                  onClick={handlePlaceOrder}
                  disabled={placingOrder || uploadLoading || !screenshotBase64}
                  className="w-2/3 py-4 bg-[#C9A84C] text-[#0A0A0A] font-accent text-xs font-extrabold uppercase tracking-[0.2em] rounded hover:bg-[#F5F0E8] hover:shadow-[0_0_15px_rgba(201,168,76,0.35)] transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                >
                  {placingOrder ? 'PLACING COMMISSION...' : 'PLACE ORDER'}
                </button>
              </div>
            </div>
          </motion.div>
        )}

      </div>
    </div>
  );
}
