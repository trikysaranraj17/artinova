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
    if (!user) {
      router.push('/login');
    } else if (items.length === 0) {
      router.push('/cart');
    }
  }, [items, user, router]);

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
    gpay_upi_id: 'akashselva18@okhdfcbank',
    gpay_qr_url: '/qr-code.jpg'
  });

  useEffect(() => {
    async function loadSettings() {
      try {
        const data = await getSettings();
        if (data) {
          setSettings({
            gpay_upi_id: data.gpay_upi_id || 'akashselva18@okhdfcbank',
            gpay_qr_url: data.gpay_qr_url || '/qr-code.jpg'
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
        // Send email to customer
        await sendEmailTrigger(placed, placedItems, 'placed', user?.email || email);
        // Send notification email to admin (Akash) with the uploaded screenshot
        await sendEmailTrigger(placed, placedItems, 'placed', 'akashselva18@gmail.com', {
          isAdminNotify: true,
          screenshotUrl: finalScreenshotUrl
        });
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
        <div className="flex flex-col gap-2 mb-8 select-none text-center">
          <span className="font-accent text-[9px] text-[#C9A84C] uppercase tracking-[0.25em]">Secure Checkout</span>
          <h1 className="font-display text-4xl sm:text-5xl font-semibold tracking-wide text-[#F5F0E8] leading-none">
            Bespoke Gifting Registry
          </h1>
          <div className="w-12 h-[1px] bg-[#C9A84C] mt-2 mx-auto" />
        </div>

        {/* Step Indicator (top, centered) */}
        <div className="flex items-center justify-center max-w-lg mx-auto mb-16 select-none relative">
          {/* Step 1 */}
          <div className="flex flex-col items-center z-10">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
              checkoutStep > 1 
                ? 'bg-[#C9A84C] text-[#0A0A0A]' 
                : checkoutStep === 1 
                ? 'bg-[#C9A84C] text-[#0A0A0A] ring-4 ring-[#C9A84C]/25 animate-pulse' 
                : 'bg-[#161616] border border-[#C9A84C]/20 text-[#9A8F7E]/40'
            }`}>
              {checkoutStep > 1 ? '✓' : '1'}
            </div>
            <span className={`text-[12px] font-medium mt-2 uppercase tracking-wider ${
              checkoutStep === 1 ? 'text-[#C9A84C]' : 'text-[#9A8F7E]/40'
            }`}>
              Info
            </span>
          </div>

          {/* Connector 1 */}
          <div className={`flex-grow h-[2px] mx-4 transition-colors duration-300 ${
            checkoutStep > 1 ? 'bg-[#C9A84C]' : 'bg-[#161616] border-t border-[#C9A84C]/10'
          }`} />

          {/* Step 2 */}
          <div className="flex flex-col items-center z-10">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
              checkoutStep > 2 
                ? 'bg-[#C9A84C] text-[#0A0A0A]' 
                : checkoutStep === 2 
                ? 'bg-[#C9A84C] text-[#0A0A0A] ring-4 ring-[#C9A84C]/25 animate-pulse' 
                : 'bg-[#161616] border border-[#C9A84C]/20 text-[#9A8F7E]/40'
            }`}>
              {checkoutStep > 2 ? '✓' : '2'}
            </div>
            <span className={`text-[12px] font-medium mt-2 uppercase tracking-wider ${
              checkoutStep === 2 ? 'text-[#C9A84C]' : 'text-[#9A8F7E]/40'
            }`}>
              Review
            </span>
          </div>

          {/* Connector 2 */}
          <div className={`flex-grow h-[2px] mx-4 transition-colors duration-300 ${
            checkoutStep > 2 ? 'bg-[#C9A84C]' : 'bg-[#161616] border-t border-[#C9A84C]/10'
          }`} />

          {/* Step 3 */}
          <div className="flex flex-col items-center z-10">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
              checkoutStep === 3 
                ? 'bg-[#C9A84C] text-[#0A0A0A] ring-4 ring-[#C9A84C]/25 animate-pulse' 
                : 'bg-[#161616] border border-[#C9A84C]/20 text-[#9A8F7E]/40'
            }`}>
              3
            </div>
            <span className={`text-[12px] font-medium mt-2 uppercase tracking-wider ${
              checkoutStep === 3 ? 'text-[#C9A84C]' : 'text-[#9A8F7E]/40'
            }`}>
              Pay
            </span>
          </div>
        </div>

        {error && (
          <div className="max-w-[560px] mx-auto bg-red-950/40 border border-red-500/30 text-red-200 text-xs p-4 rounded mb-8 font-body">
            {error}
          </div>
        )}

        {/* STEP 1: CUSTOMER INFORMATION FORM */}
        {checkoutStep === 1 && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-[560px] mx-auto bg-[#111111] border border-[#C9A84C]/10 p-8 rounded-2xl flex flex-col gap-4 shadow-2xl relative"
          >
            {user && savedAddresses.length > 0 && (
              <div className="flex items-center justify-between border-b border-[#C9A84C]/10 pb-4 mb-2">
                <label className="text-[12px] uppercase tracking-wider text-[#9A8F7E] font-medium">Use Saved Address:</label>
                <select
                  value={selectedAddressIndex}
                  onChange={(e) => handleAddressSelect(e.target.value)}
                  className="bg-[#0A0A0A] border border-[#C9A84C]/15 text-[11px] p-2 rounded text-[#F5F0E8] font-accent uppercase tracking-wider outline-none focus:border-[#C9A84C]"
                >
                  <option value="new">Add New Address</option>
                  {savedAddresses.map((addr, idx) => (
                    <option key={idx} value={idx}>{addr.label} ({addr.fullName})</option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex flex-col gap-1">
              <label className="text-[12px] font-sans font-medium text-[#9A8F7E] mb-[6px]">Recipient Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Recipient's Name"
                className="bg-[#0A0A0A]/55 border border-[#C9A84C]/15 h-[48px] px-4 rounded-lg text-[#F5F0E8] placeholder-[#9A8F7E]/30 w-full focus:border-[#C9A84C] outline-none font-sans"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[12px] font-sans font-medium text-[#9A8F7E] mb-[6px]">Contact Phone Number</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Phone Number"
                className="bg-[#0A0A0A]/55 border border-[#C9A84C]/15 h-[48px] px-4 rounded-lg text-[#F5F0E8] placeholder-[#9A8F7E]/30 w-full focus:border-[#C9A84C] outline-none font-sans"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[12px] font-sans font-medium text-[#9A8F7E] mb-[6px]">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email Address"
                className="bg-[#0A0A0A]/55 border border-[#C9A84C]/15 h-[48px] px-4 rounded-lg text-[#F5F0E8] placeholder-[#9A8F7E]/30 w-full focus:border-[#C9A84C] outline-none font-sans"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[12px] font-sans font-medium text-[#9A8F7E] mb-[6px]">Street Address</label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="House number, street details"
                className="bg-[#0A0A0A]/55 border border-[#C9A84C]/15 h-[48px] px-4 rounded-lg text-[#F5F0E8] placeholder-[#9A8F7E]/30 w-full focus:border-[#C9A84C] outline-none font-sans"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[12px] font-sans font-medium text-[#9A8F7E] mb-[6px]">State</label>
              <input
                type="text"
                required
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="State"
                className="bg-[#0A0A0A]/55 border border-[#C9A84C]/15 h-[48px] px-4 rounded-lg text-[#F5F0E8] placeholder-[#9A8F7E]/30 w-full focus:border-[#C9A84C] outline-none font-sans"
              />
            </div>

            {/* Two fields side-by-side: City + Pincode (CSS Grid 1fr 1fr, gap 12px) */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[12px] font-sans font-medium text-[#9A8F7E] mb-[6px]">City</label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="City"
                  className="bg-[#0A0A0A]/55 border border-[#C9A84C]/15 h-[48px] px-4 rounded-lg text-[#F5F0E8] placeholder-[#9A8F7E]/30 w-full focus:border-[#C9A84C] outline-none font-sans"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[12px] font-sans font-medium text-[#9A8F7E] mb-[6px]">Pincode</label>
                <input
                  type="text"
                  required
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  placeholder="Pincode"
                  className="bg-[#0A0A0A]/55 border border-[#C9A84C]/15 h-[48px] px-4 rounded-lg text-[#F5F0E8] placeholder-[#9A8F7E]/30 w-full focus:border-[#C9A84C] outline-none font-sans"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[12px] font-sans font-medium text-[#9A8F7E] mb-[6px]">Delivery Instructions (Optional)</label>
              <textarea
                rows={2}
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="Delivery Instructions"
                className="bg-[#0A0A0A]/55 border border-[#C9A84C]/15 py-3 px-4 text-xs rounded-lg text-[#F5F0E8] placeholder-[#9A8F7E]/30 resize-none focus:border-[#C9A84C] outline-none font-sans"
              />
            </div>

            <button
              type="button"
              onClick={() => {
                if (!name || !phone || !email || !address || !city || !state || !pincode) {
                  setError('Please fill in all required shipping fields.');
                  return;
                }
                setError(null);
                setCheckoutStep(2);
              }}
              className="w-full mt-4 h-[48px] bg-[#C9A84C] text-[#0A0A0A] font-accent text-xs font-extrabold uppercase tracking-[0.2em] rounded-lg hover:bg-[#F5F0E8] transition-all flex items-center justify-center gap-2 cursor-pointer"
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
            className="max-w-[560px] mx-auto bg-[#111111] border border-[#C9A84C]/10 p-8 rounded-2xl flex flex-col gap-6 shadow-2xl relative"
          >
            <h3 className="font-accent text-xs font-bold uppercase tracking-widest text-[#C9A84C] border-b border-[#C9A84C]/10 pb-4 mb-2">
              Order Review
            </h3>

            {/* Address summary */}
            <div className="p-4 bg-[#0A0A0A]/40 border border-[#C9A84C]/10 rounded-xl flex flex-col gap-1 font-body text-xs select-none">
              <span className="text-[#C9A84C] uppercase text-[9px] tracking-widest font-bold">Shipping Destination</span>
              <span className="text-[#F5F0E8]/90 font-bold">{name} &bull; {phone}</span>
              <span className="text-[#9A8F7E]">{address}, {city}, {state} - {pincode}</span>
              {instructions && <span className="text-[#9A8F7E]/50 italic">Notes: {instructions}</span>}
            </div>

            {/* Items display */}
            <div className="flex flex-col gap-4 max-h-60 overflow-y-auto pr-2 select-none">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3 items-center py-2 border-b border-[#C9A84C]/5 last:border-0">
                  {/* img 48x48px */}
                  <div className="w-[48px] h-[48px] rounded overflow-hidden border border-[#C9A84C]/15 bg-[#0A0A0A] shrink-0">
                    <img src={item.product?.images[0]} alt={item.product?.name} className="object-cover w-full h-full" />
                  </div>
                  {/* name + variant flex-grow */}
                  <div className="flex-grow min-w-0">
                    <span className="font-display text-xs font-bold text-[#F5F0E8] block truncate">{item.product?.name}</span>
                    {item.customization && (item.customization.engravingText || item.customization.variantSize) && (
                      <span className="text-[9px] text-[#9A8F7E] uppercase tracking-wider block">
                        {item.customization.variantSize ? item.customization.variantSize.split(' ')[0] : 'Standard'}
                        {item.customization.engravingText ? ` | "${item.customization.engravingText}"` : ''}
                      </span>
                    )}
                  </div>
                  {/* qty x price right-align */}
                  <span className="text-xs text-[#C9A84C] font-mono shrink-0 text-right">
                    {item.quantity} &times; ₹{item.product?.price?.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            {giftNote && (
              <div className="p-4 bg-[#0A0A0A]/40 border border-[#C9A84C]/10 rounded-xl flex flex-col gap-1 font-body text-xs select-none">
                <span className="text-[#C9A84C] uppercase text-[9px] tracking-widest font-bold">Greetings Envelope Note</span>
                <p className="text-[#F5F0E8]/70 leading-relaxed italic">&ldquo;{giftNote}&rdquo;</p>
              </div>
            )}

            {/* Price rows below: flex justify-between, DM Sans 14px */}
            <div className="border-t border-[#C9A84C]/10 pt-4 flex flex-col gap-2.5 font-sans text-[14px] text-[#9A8F7E] select-none">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span>₹{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>GST (18% inclusive)</span>
                <span>₹{gst.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Luxury Shipping</span>
                {shipping === 0 ? (
                  <span className="text-emerald-400 font-accent text-[9px] uppercase tracking-widest font-bold">FREE</span>
                ) : (
                  <span>₹{shipping}</span>
                )}
              </div>
              {/* Total row: Cormorant 22px gold */}
              <div className="flex justify-between items-end border-t border-[#C9A84C]/5 pt-3 mt-1 text-[#C9A84C] font-bold">
                <span className="font-accent text-xs uppercase tracking-widest">Total Amount Due</span>
                <span className="font-display text-[22px] font-bold">₹{total.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setCheckoutStep(1)}
                className="w-1/3 h-[48px] border border-[#C9A84C]/20 hover:border-[#C9A84C] text-[#F5F0E8] rounded-lg font-accent text-[10px] uppercase tracking-[0.2em] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft size={14} /> Back
              </button>
              <button
                type="button"
                onClick={() => setCheckoutStep(3)}
                className="w-2/3 h-[48px] bg-[#C9A84C] text-[#0A0A0A] font-accent text-xs font-extrabold uppercase tracking-[0.2em] rounded-lg hover:bg-[#F5F0E8] transition-all flex items-center justify-center gap-2 cursor-pointer"
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
            className="max-w-[560px] mx-auto bg-[#111111] border border-[#C9A84C]/10 p-8 rounded-2xl flex flex-col gap-6 shadow-2xl relative"
          >
            <h3 className="font-accent text-xs font-bold uppercase tracking-widest text-[#C9A84C] border-b border-[#C9A84C]/10 pb-4 mb-4 text-center">
              Secure Payment Verification
            </h3>

            {/* QR centered: max-width 200px, margin 0 auto, mb: 20px */}
            <div className="max-w-[200px] mx-auto mb-5 bg-[#FAF7F2] p-2.5 rounded-lg border border-[#C9A84C]/30 flex items-center justify-center overflow-hidden select-none">
              <img
                src={settings.gpay_qr_url}
                alt="UPI QR Scanner"
                className="w-full h-full object-contain"
              />
            </div>

            {/* UPI row: centered, gold text, DM Sans Medium, mb: 24px */}
            <div className="text-center font-sans font-medium text-[#C9A84C] mb-6">
              <span className="text-[10px] text-[#9A8F7E] block uppercase tracking-wider mb-1">UPI ID</span>
              <span className="text-sm select-all bg-[#0A0A0A] px-3 py-1.5 rounded-lg border border-[#C9A84C]/10 font-mono font-bold tracking-wider">{settings.gpay_upi_id}</span>
            </div>

            {/* Amount: Cormorant 32px gold, centered, mb: 24px */}
            <div className="text-center mb-6">
              <span className="text-[10px] text-[#9A8F7E] block uppercase tracking-wider mb-1">Amount to Pay</span>
              <span className="font-display text-[32px] font-bold text-[#C9A84C]">₹{total.toLocaleString()}</span>
            </div>

            {/* Steps list: DM Sans 14px, left-align, max-width 360px, margin auto, mb: 24px */}
            <div className="font-sans text-[14px] text-[#9A8F7E] max-w-[360px] mx-auto text-left mb-6 space-y-2">
              <div className="flex gap-2">
                <span className="text-[#C9A84C] font-bold">1.</span>
                <span>Scan the QR code above in your UPI App (GPay/PhonePe).</span>
              </div>
              <div className="flex gap-2">
                <span className="text-[#C9A84C] font-bold">2.</span>
                <span>Transfer the exact amount (₹{total.toLocaleString()}).</span>
              </div>
              <div className="flex gap-2">
                <span className="text-[#C9A84C] font-bold">3.</span>
                <span>Capture a screenshot of your payment receipt.</span>
              </div>
              <div className="flex gap-2">
                <span className="text-[#C9A84C] font-bold">4.</span>
                <span>Upload the screenshot below to verify.</span>
              </div>
            </div>

            {/* Upload zone: dashed gold border, border-radius 12px, 120px height */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`relative border border-dashed border-[#C9A84C] rounded-xl h-[120px] transition-all duration-300 bg-[#0A0A0A]/40 flex flex-col items-center justify-center text-center cursor-pointer ${
                isDragActive 
                  ? 'bg-[#C9A84C]/5 shadow-[0_0_15px_rgba(201,168,76,0.15)]' 
                  : 'hover:border-[#C9A84C]/70'
              }`}
            >
              <input
                type="file"
                accept="image/*"
                required
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-20"
              />
              
              {fileName ? (
                <div className="flex flex-col items-center gap-1 text-emerald-400 select-none">
                  <CheckCircle2 size={24} />
                  <span className="font-bold text-xs max-w-[240px] truncate">{fileName}</span>
                  <span className="text-[10px] text-emerald-400/70 font-sans">Payment slip loaded successfully</span>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center select-none p-4">
                  <Upload className="text-[#C9A84C] mb-2 animate-bounce" size={20} />
                  <span className="font-body text-xs text-[#F5F0E8] font-bold">
                    Drop screenshot here
                  </span>
                  <span className="text-[10px] text-[#9A8F7E]/40 mt-1 font-sans">
                    or click to browse receipt file
                  </span>
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex gap-4 mt-2">
              <button
                type="button"
                onClick={() => setCheckoutStep(2)}
                className="w-1/3 h-[48px] border border-[#C9A84C]/20 hover:border-[#C9A84C] text-[#F5F0E8] rounded-lg font-accent text-[10px] uppercase tracking-[0.2em] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft size={14} /> Back
              </button>
              <button
                type="button"
                onClick={handlePlaceOrder}
                disabled={placingOrder || uploadLoading || !screenshotBase64}
                className="w-2/3 h-[48px] bg-[#C9A84C] text-[#0A0A0A] font-accent text-xs font-extrabold uppercase tracking-[0.2em] rounded-lg hover:bg-[#F5F0E8] transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer shadow-lg"
              >
                {placingOrder ? 'Placing Order...' : 'PLACE ORDER'}
              </button>
            </div>
          </motion.div>
        )}

      </div>
    </div>
  );
}
