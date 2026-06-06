'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import NextLink from 'next/link';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';
import { getOrders, Order, OrderItem, getOrderItems } from '../../lib/db';
import { Camera, Package, MapPin, Phone, User, Mail, ShieldAlert, CheckCircle, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ProfilePage() {
  const router = useRouter();
  
  const { user, logout, updateProfile: authUpdateProfile, setLoginModalOpen, isLoading } = useAuthStore();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderItemsMap, setOrderItemsMap] = useState<Record<string, OrderItem[]>>({});
  const [ordersLoading, setOrdersLoading] = useState(true);

  // Profile Form States
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [line1, setLine1] = useState('');
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState('');
  const [pincode, setPincode] = useState('');
  
  const [updateMsg, setUpdateMsg] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  // Gatekeeper
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/');
      setLoginModalOpen(true);
    }
  }, [user, isLoading, router, setLoginModalOpen]);

  // Sync profile details and load orders
  useEffect(() => {
    if (user) {
      const userId = user.id;
      setFullName(user.full_name || '');
      setPhone(user.phone || '');
      
      // Load address details from localStorage or user meta
      if (typeof window !== 'undefined') {
        const storedAddr = localStorage.getItem(`addresses_${userId}`);
        if (storedAddr) {
          try {
            const addrs = JSON.parse(storedAddr);
            const def = addrs.find((a: any) => a.is_default) || addrs[0];
            if (def) {
              setLine1(def.line1 || '');
              setCity(def.city || '');
              setStateName(def.state || '');
              setPincode(def.pincode || '');
            }
          } catch (e) {
            console.error(e);
          }
        } else if (user.address) {
          setLine1(user.address);
        }
      }

      // Load orders
      async function loadOrdersAndItems() {
        setOrdersLoading(true);
        try {
          const items = await getOrders(userId);
          setOrders(items);

          // Fetch items for each order
          const itemsMap: Record<string, OrderItem[]> = {};
          await Promise.all(
            items.map(async (o) => {
              const oItems = await getOrderItems(o.id);
              itemsMap[o.id] = oItems;
            })
          );
          setOrderItemsMap(itemsMap);
        } catch (err) {
          console.error('Error fetching orders:', err);
        } finally {
          setOrdersLoading(false);
        }
      }
      loadOrdersAndItems();
    }
  }, [user]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      try {
        await authUpdateProfile({ avatar_url: base64 });
        setUpdateMsg('Profile photo updated.');
        setTimeout(() => setUpdateMsg(null), 3000);
      } catch (err) {
        console.error(err);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdateMsg(null);
    setFormLoading(true);
    try {
      // 1. Update basic profile info
      await authUpdateProfile({ full_name: fullName, phone, address: line1 });

      // 2. Save address details as default address in LocalStorage
      if (user && typeof window !== 'undefined') {
        const addrObj = {
          label: 'Default Address',
          fullName,
          phone,
          line1,
          line2: '',
          city,
          state: stateName,
          pincode,
          is_default: true
        };
        localStorage.setItem(`addresses_${user.id}`, JSON.stringify([addrObj]));
      }

      setUpdateMsg('Patron details saved successfully.');
      setTimeout(() => setUpdateMsg(null), 3000);
    } catch (err: any) {
      setUpdateMsg(err.message || 'Error updating details.');
    } finally {
      setFormLoading(false);
    }
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center text-[#C9A84C] select-none">
        <div className="w-10 h-10 border-2 border-[#C9A84C] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-24 px-6 bg-[#0A0A0A] relative text-[#F5F0E8] font-body select-none">
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-[#C9A84C]/5 blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto flex flex-col gap-10 relative z-10">
        
        {/* Title */}
        <div className="flex flex-col items-center text-center gap-2">
          <img 
            src="/logo.jpg" 
            alt="ARTINOVA Logo" 
            className="h-16 w-auto object-contain border border-[#C9A84C]/25 rounded-md mb-1 shadow-[0_0_20px_rgba(201,168,76,0.15)]"
          />
          <span className="font-accent text-[9px] text-[#C9A84C] uppercase tracking-[0.25em]">Bespoke Registry</span>
          <h1 className="font-display text-3xl sm:text-5xl font-semibold tracking-wide text-[#F5F0E8]">
            Patron Dashboard
          </h1>
          <div className="w-12 h-[1px] bg-[#C9A84C] mt-2" />
        </div>

        {updateMsg && (
          <div className="bg-[#C9A84C]/10 border border-[#C9A84C]/35 text-[#C9A84C] text-xs p-4 rounded flex items-center gap-2 max-w-xl mx-auto w-full">
            <CheckCircle size={14} /> {updateMsg}
          </div>
        )}

        {/* 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* COLUMN 1: CLIENT DETAILS (lg:col-span-5) */}
          <div className="lg:col-span-5 bg-[#111111] border border-[#C9A84C]/15 p-6 sm:p-8 rounded-lg flex flex-col gap-6 shadow-xl">
            {/* Avatar & Meta info */}
            <div className="flex flex-col items-center text-center gap-3">
              <div className="relative w-24 h-24 rounded-full border-2 border-[#C9A84C]/30 overflow-hidden bg-[#0A0A0A] flex items-center justify-center group shadow-lg">
                {user.avatar_url ? (
                  <img src={user.avatar_url} alt="Profile Photo" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl font-accent font-extrabold text-[#C9A84C]">{fullName?.charAt(0) || 'P'}</span>
                )}
                
                <label className="absolute inset-0 bg-[#0A0A0A]/85 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer text-[8px] font-accent uppercase tracking-widest text-[#C9A84C]">
                  <Camera size={16} className="mb-1" /> Edit Photo
                  <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                </label>
              </div>
              
              <div className="flex flex-col leading-none mt-1">
                <span className="font-display text-lg font-bold text-[#F5F0E8]">{fullName || 'Bespoke Patron'}</span>
                <span className="font-body text-xs text-[#9A8F7E]/60 mt-1.5">{user.email}</span>
              </div>
            </div>

            <div className="h-[1px] bg-[#C9A84C]/10" />

            {/* Profile Form */}
            <form onSubmit={handleProfileSave} className="flex flex-col gap-4">
              <h3 className="font-accent text-[10px] uppercase tracking-widest text-[#C9A84C] font-bold">Personal Registry</h3>
              
              <div className="flex flex-col gap-1">
                <label className="text-[9px] uppercase tracking-widest text-[#9A8F7E]">Patron Full Name</label>
                <input 
                  type="text" 
                  required 
                  value={fullName} 
                  onChange={(e) => setFullName(e.target.value)} 
                  className="bg-[#0A0A0A]/60 border border-[#C9A84C]/15 py-2.5 px-4 text-xs rounded text-white focus:border-[#C9A84C] outline-none" 
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[9px] uppercase tracking-widest text-[#9A8F7E]">Registered Phone</label>
                <input 
                  type="tel" 
                  required 
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)} 
                  className="bg-[#0A0A0A]/60 border border-[#C9A84C]/15 py-2.5 px-4 text-xs rounded text-white focus:border-[#C9A84C] outline-none" 
                />
              </div>

              <h3 className="font-accent text-[10px] uppercase tracking-widest text-[#C9A84C] font-bold mt-2">Shipping Details</h3>

              <div className="flex flex-col gap-1">
                <label className="text-[9px] uppercase tracking-widest text-[#9A8F7E]">Street Address</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. 100 Golden Geode, Vandavasi"
                  value={line1} 
                  onChange={(e) => setLine1(e.target.value)} 
                  className="bg-[#0A0A0A]/60 border border-[#C9A84C]/15 py-2.5 px-4 text-xs rounded text-white focus:border-[#C9A84C] outline-none" 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] uppercase tracking-widest text-[#9A8F7E]">City</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Chennai"
                    value={city} 
                    onChange={(e) => setCity(e.target.value)} 
                    className="bg-[#0A0A0A]/60 border border-[#C9A84C]/15 py-2.5 px-4 text-xs rounded text-white focus:border-[#C9A84C] outline-none" 
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] uppercase tracking-widest text-[#9A8F7E]">State</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Tamil Nadu"
                    value={stateName} 
                    onChange={(e) => setStateName(e.target.value)} 
                    className="bg-[#0A0A0A]/60 border border-[#C9A84C]/15 py-2.5 px-4 text-xs rounded text-white focus:border-[#C9A84C] outline-none" 
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[9px] uppercase tracking-widest text-[#9A8F7E]">Pincode</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. 600001"
                  value={pincode} 
                  onChange={(e) => setPincode(e.target.value)} 
                  className="bg-[#0A0A0A]/60 border border-[#C9A84C]/15 py-2.5 px-4 text-xs rounded text-white focus:border-[#C9A84C] outline-none" 
                />
              </div>

              <button 
                type="submit" 
                disabled={formLoading}
                className="btn-solid-gold w-full py-3 mt-4 text-[10px] font-accent uppercase tracking-widest font-extrabold shadow-md"
              >
                {formLoading ? 'Saving...' : 'Save Registry Profile'}
              </button>
            </form>

            <button 
              onClick={logout}
              className="w-full py-2.5 mt-2 border border-red-500/25 hover:border-red-500 bg-red-950/5 hover:bg-red-950/20 text-red-400 hover:text-red-300 rounded text-[9px] font-accent uppercase tracking-widest transition-colors cursor-pointer"
            >
              Sign Out
            </button>
          </div>

          {/* COLUMN 2: MY ORDERS & ORDERED PRODUCTS (lg:col-span-7) */}
          <div className="lg:col-span-7 bg-[#111111] border border-[#C9A84C]/15 p-6 sm:p-8 rounded-lg flex flex-col gap-6 shadow-xl min-h-[50vh]">
            <h2 className="font-display text-xl sm:text-2xl text-gold-gradient">Ordered Products & Log</h2>
            <div className="h-[1px] bg-[#C9A84C]/10" />

            {ordersLoading ? (
              <div className="flex justify-center items-center py-20 flex-grow">
                <div className="w-8 h-8 border-2 border-[#C9A84C] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : orders.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center gap-4 py-20 flex-grow">
                <span className="text-[#C9A84C] text-2xl">✦</span>
                <p className="font-body text-xs text-[#9A8F7E]/55 italic max-w-xs leading-relaxed">
                  No orders logged under this registry. Select collections inside our catalog to begin your gifting experience.
                </p>
                <NextLink href="/shop" className="btn-solid-gold py-2 px-6 text-[9px] font-accent uppercase tracking-widest font-bold">
                  Browse Shop
                </NextLink>
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                {orders.map((o) => {
                  const oItems = orderItemsMap[o.id] || [];
                  return (
                    <div key={o.id} className="p-5 bg-[#0A0A0A] rounded border border-[#C9A84C]/15 flex flex-col gap-4 shadow-sm hover:border-[#C9A84C]/35 transition-all">
                      {/* Order Header */}
                      <div className="flex items-center justify-between border-b border-[#C9A84C]/10 pb-3 flex-wrap gap-2">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-mono text-[10px] text-[#C9A84C] font-bold">#{o.order_number}</span>
                          <span className="font-body text-[10px] text-[#9A8F7E]/65">Date: {new Date(o.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="inline-block px-2 py-0.5 bg-[#111111] border border-[#C9A84C]/25 text-[#C9A84C] rounded text-[7.5px] font-accent uppercase tracking-widest font-bold">
                            {o.order_status}
                          </span>
                          <span className="font-body text-xs font-bold text-white">₹{o.total.toLocaleString()}</span>
                        </div>
                      </div>

                      {/* Order Items */}
                      <div className="flex flex-col gap-3">
                        {oItems.map((item) => (
                          <div key={item.id} className="flex items-start gap-4 text-left">
                            <img 
                              src={item.product_image || '/images/placeholder.jpg'} 
                              alt={item.product_name} 
                              className="w-12 h-12 object-cover border border-[#C9A84C]/15 rounded shrink-0 bg-[#0E0D0D]" 
                            />
                            <div className="flex-grow min-w-0">
                              <h4 className="font-display text-xs text-white truncate font-bold">{item.product_name}</h4>
                              <span className="font-body text-[10px] text-[#9A8F7E] block mt-0.5">
                                Qty: {item.quantity} · Price: ₹{item.price.toLocaleString()}
                              </span>
                              {item.customization && Object.keys(item.customization).length > 0 && (
                                <div className="text-[9px] font-accent text-[#C9A84C] mt-1 italic flex flex-col gap-0.5">
                                  {item.customization.engravingText && (
                                    <span>Engraving: "{item.customization.engravingText}"</span>
                                  )}
                                  {item.customization.variantSize && (
                                    <span>Option: {item.customization.variantSize}</span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Order Footer & Tracking Link */}
                      <div className="flex justify-end pt-2 border-t border-[#C9A84C]/5">
                        <NextLink 
                          href={`/tracking/${o.id}`} 
                          className="flex items-center gap-1.5 border border-[#C9A84C]/50 hover:bg-[#C9A84C] hover:text-[#0A0A0A] px-3.5 py-1.5 rounded text-[8.5px] font-accent uppercase tracking-widest font-extrabold transition-all"
                        >
                          Track Shipment <ArrowRight size={10} />
                        </NextLink>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
