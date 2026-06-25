'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import NextLink from 'next/link';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';
import { useWishlistStore } from '../../store/wishlistStore';
import { getOrders, Order, OrderItem, getOrderItems } from '../../lib/db';
import { Camera, Package, MapPin, Phone, User, Mail, ShieldAlert, CheckCircle, ArrowRight, ShoppingBag, Heart, CreditCard, Plus, Trash2, Edit2, Settings as SettingsIcon } from 'lucide-react';
import { motion } from 'framer-motion';

const formatDate = (dateStr: string) => {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  } catch (e) {
    return dateStr;
  }
};

export default function ProfilePage() {
  const router = useRouter();
  
  const { user, logout, updateProfile: authUpdateProfile, setLoginModalOpen, isLoading } = useAuthStore();
  const { items: wishlistItems } = useWishlistStore();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderItemsMap, setOrderItemsMap] = useState<Record<string, OrderItem[]>>({});
  const [ordersLoading, setOrdersLoading] = useState(true);

  // Active Tab: overview | info | addresses | orders | settings
  const [activeTab, setActiveTab] = useState<'overview' | 'info' | 'addresses' | 'orders' | 'settings'>('overview');

  // Profile Form States
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [line1, setLine1] = useState('');
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState('');
  const [pincode, setPincode] = useState('');
  
  const [updateMsg, setUpdateMsg] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  // Address book states
  const [addresses, setAddresses] = useState<any[]>([]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editAddressIdx, setEditAddressIdx] = useState<number | null>(null);
  const [addrLabel, setAddrLabel] = useState('Home');
  const [addrName, setAddrName] = useState('');
  const [addrPhone, setAddrPhone] = useState('');
  const [addrLine1, setAddrLine1] = useState('');
  const [addrCity, setAddrCity] = useState('');
  const [addrState, setAddrState] = useState('');
  const [addrPincode, setAddrPincode] = useState('');

  // Gatekeeper
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  // Sync profile details and load orders & addresses
  useEffect(() => {
    if (user) {
      const userId = user.id;
      setFullName(user.full_name || '');
      setPhone(user.phone || '');
      setAddrName(user.full_name || '');
      setAddrPhone(user.phone || '');
      
      // Load address details from localStorage or user meta
      if (typeof window !== 'undefined') {
        const storedAddr = localStorage.getItem(`addresses_${userId}`);
        if (storedAddr) {
          try {
            const parsed = JSON.parse(storedAddr);
            setAddresses(parsed);
            const def = parsed.find((a: any) => a.is_default) || parsed[0];
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
          const defaultAddr = {
            label: 'Default Address',
            fullName: user.full_name || '',
            phone: user.phone || '',
            line1: user.address,
            city: '',
            state: '',
            pincode: '',
            is_default: true
          };
          setAddresses([defaultAddr]);
          localStorage.setItem(`addresses_${userId}`, JSON.stringify([defaultAddr]));
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
        setUpdateMsg('Profile photo updated successfully.');
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
      // Update profile in store/Supabase
      await authUpdateProfile({ full_name: fullName, phone, address: line1 });

      // Save standard address
      if (user && typeof window !== 'undefined') {
        const updatedAddresses = [...addresses];
        const defaultIdx = updatedAddresses.findIndex(a => a.is_default);
        const addrObj = {
          label: 'Default Address',
          fullName,
          phone,
          line1,
          city,
          state: stateName,
          pincode,
          is_default: true
        };

        if (defaultIdx !== -1) {
          updatedAddresses[defaultIdx] = addrObj;
        } else {
          updatedAddresses.unshift(addrObj);
        }
        setAddresses(updatedAddresses);
        localStorage.setItem(`addresses_${user.id}`, JSON.stringify(updatedAddresses));
      }

      setUpdateMsg('Patron details saved successfully.');
      setTimeout(() => setUpdateMsg(null), 3000);
    } catch (err: any) {
      setUpdateMsg(err.message || 'Error updating details.');
    } finally {
      setFormLoading(false);
    }
  };

  // Address book controls
  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    const newAddr = {
      label: addrLabel,
      fullName: addrName,
      phone: addrPhone,
      line1: addrLine1,
      city: addrCity,
      state: addrState,
      pincode: addrPincode,
      is_default: addresses.length === 0
    };

    let updated = [...addresses];
    if (editAddressIdx !== null) {
      updated[editAddressIdx] = { ...updated[editAddressIdx], ...newAddr };
    } else {
      updated.push(newAddr);
    }

    setAddresses(updated);
    localStorage.setItem(`addresses_${user.id}`, JSON.stringify(updated));
    resetAddressForm();
  };

  const handleDeleteAddress = (idx: number) => {
    if (!user) return;
    if (confirm('Delete this address?')) {
      const updated = addresses.filter((_, i) => i !== idx);
      setAddresses(updated);
      localStorage.setItem(`addresses_${user.id}`, JSON.stringify(updated));
    }
  };

  const handleSetDefaultAddress = (idx: number) => {
    if (!user) return;
    const updated = addresses.map((addr, i) => ({
      ...addr,
      is_default: i === idx
    }));
    setAddresses(updated);
    localStorage.setItem(`addresses_${user.id}`, JSON.stringify(updated));
  };

  const resetAddressForm = () => {
    setShowAddressForm(false);
    setEditAddressIdx(null);
    setAddrLabel('Home');
    setAddrName(user?.full_name || '');
    setAddrPhone(user?.phone || '');
    setAddrLine1('');
    setAddrCity('');
    setAddrState('');
    setAddrPincode('');
  };

  const handleEditAddressInit = (idx: number) => {
    const addr = addresses[idx];
    setAddrLabel(addr.label || 'Home');
    setAddrName(addr.fullName || '');
    setAddrPhone(addr.phone || '');
    setAddrLine1(addr.line1 || '');
    setAddrCity(addr.city || '');
    setAddrState(addr.state || '');
    setAddrPincode(addr.pincode || '');
    setEditAddressIdx(idx);
    setShowAddressForm(true);
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center text-[#C9A84C] select-none">
        <div className="w-10 h-10 border-2 border-[#C9A84C] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const totalSpent = orders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);

  return (
    <div className="min-h-screen pt-8 md:pt-16 pb-24 px-6 bg-[#0A0A0A] relative text-[#F5F0E8] font-body select-none">
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-[#C9A84C]/5 blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto flex flex-col gap-10 relative z-10">
        
        {/* Title */}
        <div className="flex flex-col items-center text-center gap-2 mb-4">
          <img 
            src="/logo.jpg" 
            alt="ARTINOVA Logo" 
            className="h-16 w-auto object-contain border border-[#C9A84C]/25 rounded-md mb-1 shadow-[0_0_20px_rgba(201,168,76,0.15)]"
          />
          <span className="font-accent text-[9px] text-[#C9A84C] uppercase tracking-[0.25em]">Bespoke Registry</span>
          <h1 className="font-display text-3xl sm:text-5xl font-semibold tracking-wide text-[#F5F0E8] leading-tight mt-1">
            Patron Registry Desk
          </h1>
          <div className="w-12 h-[1px] bg-[#C9A84C] mt-2" />
        </div>

        {updateMsg && (
          <div className="bg-[#C9A84C]/10 border border-[#C9A84C]/35 text-[#C9A84C] text-xs p-4 rounded-xl flex items-center gap-2 max-w-xl mx-auto w-full">
            <CheckCircle size={14} /> {updateMsg}
          </div>
        )}

        {/* 2-Column Sidebar + Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* SLIM SIDEBAR (240px equivalent) */}
          <aside className="lg:col-span-3 bg-[#0D0D0D] border border-[#C9A84C]/10 rounded-2xl p-6 flex flex-col gap-6">
            <div className="flex flex-col items-center text-center gap-3">
              <div className="relative w-16 h-16 rounded-full border border-[#C9A84C]/30 overflow-hidden bg-[#0A0A0A] flex items-center justify-center group shadow-lg">
                {user.avatar_url ? (
                  <img src={user.avatar_url} alt="Profile Photo" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xl font-accent font-bold text-[#C9A84C]">{fullName?.charAt(0) || 'P'}</span>
                )}
                
                <label className="absolute inset-0 bg-[#0A0A0A]/90 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer text-[8px] font-accent uppercase tracking-widest text-[#C9A84C]">
                  <Camera size={14} className="mb-0.5" /> Edit
                  <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                </label>
              </div>
              
              <div className="flex flex-col leading-none">
                <span className="font-display text-[18px] font-bold text-[#F5F0E8]">{fullName || 'Bespoke Patron'}</span>
                <span className="font-sans text-[12px] text-[#9A8F7E] mt-2 font-medium">Member since 2026</span>
              </div>
            </div>

            <hr className="border-t border-[#C9A84C]/10 my-1" />

            {/* Nav Menu */}
            <nav className="flex flex-col gap-1.5 font-sans">
              {[
                { id: 'overview', name: 'Overview', icon: <Package size={14} /> },
                { id: 'info', name: 'Personal Info', icon: <User size={14} /> },
                { id: 'addresses', name: 'Addresses', icon: <MapPin size={14} /> },
                { id: 'orders', name: 'My Orders', icon: <ShoppingBag size={14} /> },
                { id: 'settings', name: 'Settings', icon: <SettingsIcon size={14} /> }
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-semibold uppercase tracking-wider text-left transition-all border cursor-pointer ${
                    activeTab === item.id
                      ? 'bg-[#C9A84C]/8 text-[#C9A84C] border-[#C9A84C]/35'
                      : 'text-[#9A8F7E] hover:bg-[#C9A84C]/4 hover:text-[#F5F0E8] border-transparent'
                  }`}
                >
                  {item.icon}
                  {item.name}
                </button>
              ))}
            </nav>
          </aside>

          {/* CONTENT AREA: padding 32px (p-8) */}
          <section className="lg:col-span-9 bg-[#111111] border border-[#C9A84C]/10 p-8 rounded-2xl shadow-xl flex flex-col gap-6 min-h-[50vh]">
            
            {/* 1. OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div className="flex flex-col gap-8">
                <h3 className="font-display text-xl font-bold text-white border-b border-[#C9A84C]/10 pb-4 mb-2">Account Overview</h3>
                
                {/* Stats cards row (3 cards) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 font-sans">
                  <div className="bg-[#0D0D0D] border border-[#C9A84C]/10 p-5 rounded-xl flex flex-col gap-1 shadow">
                    <span className="text-[10px] uppercase tracking-widest text-[#9A8F7E] font-bold">Total Orders</span>
                    <span className="text-2xl font-bold text-[#C9A84C] font-mono mt-1">{orders.length}</span>
                  </div>
                  <div className="bg-[#0D0D0D] border border-[#C9A84C]/10 p-5 rounded-xl flex flex-col gap-1 shadow">
                    <span className="text-[10px] uppercase tracking-widest text-[#9A8F7E] font-bold">Wishlist Items</span>
                    <span className="text-2xl font-bold text-[#C9A84C] font-mono mt-1">{wishlistItems.length}</span>
                  </div>
                  <div className="bg-[#0D0D0D] border border-[#C9A84C]/10 p-5 rounded-xl flex flex-col gap-1 shadow">
                    <span className="text-[10px] uppercase tracking-widest text-[#9A8F7E] font-bold">Total Spent</span>
                    <span className="text-2xl font-bold text-[#C9A84C] font-mono mt-1">₹{totalSpent.toLocaleString()}</span>
                  </div>
                </div>

                {/* Recent orders mini table (last 3 orders) */}
                <div className="flex flex-col gap-4 mt-4 select-none">
                  <h4 className="font-accent text-[11px] uppercase tracking-widest text-[#C9A84C] font-bold">Recent Commissions</h4>
                  {orders.length === 0 ? (
                    <p className="text-xs text-[#9A8F7E]/55 italic py-4">No order logs logged yet.</p>
                  ) : (
                    <div className="bg-[#0D0D0D] border border-[#C9A84C]/10 rounded-xl overflow-hidden shadow">
                      <table className="w-full text-left font-sans text-xs">
                        <thead>
                          <tr className="border-b border-[#C9A84C]/15 bg-black/40 font-accent text-[9px] uppercase tracking-widest text-[#C9A84C] font-bold">
                            <th className="p-4">Order ID</th>
                            <th className="p-4">Total Amount</th>
                            <th className="p-4">Status</th>
                            <th className="p-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {orders.slice(0, 3).map((ord) => (
                            <tr key={ord.id} className="border-b border-[#C9A84C]/5 last:border-0 hover:bg-white/[0.01]">
                              <td className="p-4 font-mono font-bold text-white">#{ord.order_number}</td>
                              <td className="p-4 font-mono font-bold text-[#C9A84C]">₹{ord.total?.toLocaleString()}</td>
                              <td className="p-4">
                                <span className="inline-block px-2.5 py-0.5 bg-black border border-[#C9A84C]/25 text-[#C9A84C] rounded text-[8px] font-accent uppercase tracking-widest font-extrabold">
                                  {ord.order_status}
                                </span>
                              </td>
                              <td className="p-4 text-right">
                                <button
                                  onClick={() => setActiveTab('orders')}
                                  className="text-xs text-[#C9A84C] hover:underline"
                                >
                                  Manage &rarr;
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 2. PERSONAL INFO TAB */}
            {activeTab === 'info' && (
              <form onSubmit={handleProfileSave} className="flex flex-col gap-6">
                <h3 className="font-display text-xl font-bold text-white border-b border-[#C9A84C]/10 pb-4 mb-2">Personal Registry</h3>
                
                <div className="flex flex-col gap-1 font-sans">
                  <label className="text-[12px] font-medium text-[#9A8F7E] mb-1.5">Recipient Full Name</label>
                  <input 
                    type="text" 
                    required 
                    value={fullName} 
                    onChange={(e) => setFullName(e.target.value)} 
                    className="bg-[#0A0A0A] border border-[#C9A84C]/15 h-11 px-4 rounded-lg text-white outline-none focus:border-[#C9A84C]" 
                  />
                </div>

                <div className="flex flex-col gap-1 font-sans">
                  <label className="text-[12px] font-medium text-[#9A8F7E] mb-1.5">Registered Phone Coordinates</label>
                  <input 
                    type="tel" 
                    required 
                    value={phone} 
                    onChange={(e) => setPhone(e.target.value)} 
                    className="bg-[#0A0A0A] border border-[#C9A84C]/15 h-11 px-4 rounded-lg text-white outline-none focus:border-[#C9A84C]" 
                  />
                </div>

                <h4 className="font-accent text-[11px] uppercase tracking-widest text-[#C9A84C] font-bold mt-4">Standard Delivery Coordinates</h4>

                <div className="flex flex-col gap-1 font-sans">
                  <label className="text-[12px] font-medium text-[#9A8F7E] mb-1.5">Street Address</label>
                  <input 
                    type="text" 
                    required
                    placeholder="House details, street"
                    value={line1} 
                    onChange={(e) => setLine1(e.target.value)} 
                    className="bg-[#0A0A0A] border border-[#C9A84C]/15 h-11 px-4 rounded-lg text-white outline-none focus:border-[#C9A84C]" 
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 font-sans">
                  <div className="flex flex-col gap-1">
                    <label className="text-[12px] font-medium text-[#9A8F7E] mb-1.5">City</label>
                    <input 
                      type="text" 
                      required
                      placeholder="City"
                      value={city} 
                      onChange={(e) => setCity(e.target.value)} 
                      className="bg-[#0A0A0A] border border-[#C9A84C]/15 h-11 px-4 rounded-lg text-white outline-none focus:border-[#C9A84C]" 
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[12px] font-medium text-[#9A8F7E] mb-1.5">State</label>
                    <input 
                      type="text" 
                      required
                      placeholder="State"
                      value={stateName} 
                      onChange={(e) => setStateName(e.target.value)} 
                      className="bg-[#0A0A0A] border border-[#C9A84C]/15 h-11 px-4 rounded-lg text-white outline-none focus:border-[#C9A84C]" 
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1 font-sans">
                  <label className="text-[12px] font-medium text-[#9A8F7E] mb-1.5">Pincode</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Pincode"
                    value={pincode} 
                    onChange={(e) => setPincode(e.target.value)} 
                    className="bg-[#0A0A0A] border border-[#C9A84C]/15 h-11 px-4 rounded-lg text-white outline-none focus:border-[#C9A84C]" 
                  />
                </div>

                <div className="flex justify-end select-none mt-4">
                  <button 
                    type="submit" 
                    disabled={formLoading}
                    className="h-11 px-8 bg-[#C9A84C] text-[#0A0A0A] rounded-lg font-accent text-[10px] font-extrabold uppercase tracking-widest hover:bg-[#F5F0E8] transition-colors cursor-pointer"
                  >
                    {formLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            )}

            {/* 3. ADDRESSES TAB */}
            {activeTab === 'addresses' && (
              <div className="flex flex-col gap-6">
                <div className="flex justify-between items-center border-b border-[#C9A84C]/10 pb-4 mb-2">
                  <h3 className="font-display text-xl font-bold text-white">Addresses Book</h3>
                  {!showAddressForm && (
                    <button
                      onClick={() => setShowAddressForm(true)}
                      className="flex items-center gap-1.5 px-4 py-2 border border-[#C9A84C]/35 text-[#C9A84C] font-accent text-[9px] font-bold uppercase tracking-widest rounded-lg hover:bg-[#C9A84C]/5 cursor-pointer"
                    >
                      <Plus size={12} /> Add Address
                    </button>
                  )}
                </div>

                {showAddressForm ? (
                  <form onSubmit={handleSaveAddress} className="bg-[#0D0D0D] border border-[#C9A84C]/10 p-6 rounded-xl flex flex-col gap-4">
                    <h4 className="font-accent text-[10px] uppercase tracking-widest text-[#C9A84C] font-bold mb-2">
                      {editAddressIdx !== null ? 'Modify Address' : 'New Address Details'}
                    </h4>

                    <div className="grid grid-cols-2 gap-4 font-sans">
                      <div className="flex flex-col gap-1">
                        <label className="text-[12px] font-medium text-[#9A8F7E] mb-1">Label (e.g. Home, Office)</label>
                        <input 
                          type="text" 
                          required
                          value={addrLabel}
                          onChange={(e) => setAddrLabel(e.target.value)}
                          className="bg-[#0A0A0A] border border-[#C9A84C]/15 h-10 px-3 rounded text-white" 
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[12px] font-medium text-[#9A8F7E] mb-1">Recipient Name</label>
                        <input 
                          type="text" 
                          required
                          value={addrName}
                          onChange={(e) => setAddrName(e.target.value)}
                          className="bg-[#0A0A0A] border border-[#C9A84C]/15 h-10 px-3 rounded text-white" 
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1 font-sans">
                      <label className="text-[12px] font-medium text-[#9A8F7E] mb-1">Recipient Phone</label>
                      <input 
                        type="tel" 
                        required
                        value={addrPhone}
                        onChange={(e) => setAddrPhone(e.target.value)}
                        className="bg-[#0A0A0A] border border-[#C9A84C]/15 h-10 px-3 rounded text-white" 
                      />
                    </div>

                    <div className="flex flex-col gap-1 font-sans">
                      <label className="text-[12px] font-medium text-[#9A8F7E] mb-1">Street Address</label>
                      <input 
                        type="text" 
                        required
                        value={addrLine1}
                        onChange={(e) => setAddrLine1(e.target.value)}
                        className="bg-[#0A0A0A] border border-[#C9A84C]/15 h-10 px-3 rounded text-white" 
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-3 font-sans">
                      <div className="flex flex-col gap-1">
                        <label className="text-[12px] font-medium text-[#9A8F7E] mb-1">City</label>
                        <input 
                          type="text" 
                          required
                          value={addrCity}
                          onChange={(e) => setAddrCity(e.target.value)}
                          className="bg-[#0A0A0A] border border-[#C9A84C]/15 h-10 px-3 rounded text-white" 
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[12px] font-medium text-[#9A8F7E] mb-1">State</label>
                        <input 
                          type="text" 
                          required
                          value={addrState}
                          onChange={(e) => setAddrState(e.target.value)}
                          className="bg-[#0A0A0A] border border-[#C9A84C]/15 h-10 px-3 rounded text-white" 
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[12px] font-medium text-[#9A8F7E] mb-1">Pincode</label>
                        <input 
                          type="text" 
                          required
                          value={addrPincode}
                          onChange={(e) => setAddrPincode(e.target.value)}
                          className="bg-[#0A0A0A] border border-[#C9A84C]/15 h-10 px-3 rounded text-white" 
                        />
                      </div>
                    </div>

                    <div className="flex gap-3 justify-end select-none mt-4">
                      <button
                        type="button"
                        onClick={resetAddressForm}
                        className="px-4 py-2 border border-[#C9A84C]/15 text-[#9A8F7E] text-[10px] font-accent uppercase tracking-widest rounded-lg cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-2 bg-[#C9A84C] text-[#0A0A0A] text-[10px] font-accent uppercase tracking-widest font-bold rounded-lg cursor-pointer"
                      >
                        Save Address
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 select-none">
                    {addresses.map((addr, idx) => (
                      <div key={idx} className="rounded-xl p-5 bg-[#0D0D0D] border border-[#C9A84C]/10 flex flex-col justify-between min-h-[160px] relative">
                        <div className="flex flex-col gap-1.5">
                          <div className="flex justify-between items-center">
                            <span className="font-accent text-[9px] uppercase tracking-widest text-[#C9A84C] font-bold border border-[#C9A84C]/20 px-2 py-0.5 rounded bg-black">
                              {addr.label || 'Bespoke destination'}
                            </span>
                            {addr.is_default && (
                              <span className="text-[8px] font-accent uppercase tracking-widest text-emerald-400 font-bold bg-emerald-950/20 px-1.5 py-0.5 rounded border border-emerald-500/25">
                                Default
                              </span>
                            )}
                          </div>
                          
                          <div className="font-sans text-[14px] text-[#F5F0E8] mt-3 font-semibold">
                            {addr.fullName} &bull; <span className="font-mono text-xs font-normal text-[#9A8F7E]">{addr.phone}</span>
                          </div>
                          <p className="font-sans text-[12px] text-[#9A8F7E] leading-relaxed mt-1">
                            {addr.line1}, {addr.city}, {addr.state} - {addr.pincode}
                          </p>
                        </div>

                        <div className="flex items-center gap-3 pt-4 mt-2 border-t border-[#C9A84C]/5 text-[10px] font-accent uppercase tracking-widest">
                          <button onClick={() => handleEditAddressInit(idx)} className="text-[#C9A84C] hover:underline cursor-pointer">Edit</button>
                          <span className="text-[#C9A84C]/20">|</span>
                          <button onClick={() => handleDeleteAddress(idx)} className="text-red-400 hover:underline cursor-pointer">Delete</button>
                          {!addr.is_default && (
                            <>
                              <span className="text-[#C9A84C]/20">|</span>
                              <button onClick={() => handleSetDefaultAddress(idx)} className="text-[#C9A84C] hover:underline cursor-pointer">Set Default</button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}

                    {/* Add new address placeholder */}
                    <div 
                      onClick={() => setShowAddressForm(true)}
                      className="border border-dashed border-[#C9A84C]/20 rounded-xl p-5 bg-[#0D0D0D]/30 flex flex-col items-center justify-center text-center cursor-pointer hover:border-[#C9A84C] hover:bg-[#C9A84C]/5 transition-colors min-h-[160px]"
                    >
                      <Plus className="text-[#C9A84C] mb-2" size={20} />
                      <span className="font-accent text-[9px] uppercase tracking-widest text-[#C9A84C] font-bold">Add New Address</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 4. MY ORDERS TAB */}
            {activeTab === 'orders' && (
              <div className="flex flex-col gap-6">
                <h3 className="font-display text-xl font-bold text-white border-b border-[#C9A84C]/10 pb-4 mb-2">Commissions Log</h3>
                
                {orders.length === 0 ? (
                  <div className="text-center py-12 text-[#9A8F7E]/40 italic">
                    No orders booked yet.
                  </div>
                ) : (
                  <div className="flex flex-col gap-6">
                    {orders.map((o) => {
                      const oItems = orderItemsMap[o.id] || [];
                      return (
                        <div key={o.id} className="p-5 bg-[#0D0D0D] rounded-xl border border-[#C9A84C]/10 flex flex-col gap-4 shadow hover:border-[#C9A84C]/25 transition-all">
                          
                          {/* Order Header */}
                          <div className="flex items-center justify-between border-b border-[#C9A84C]/15 pb-3 flex-wrap gap-2 select-none">
                            <div className="flex flex-col gap-0.5">
                              <span className="font-mono text-[10px] text-[#C9A84C] font-bold">#{o.order_number}</span>
                              <span className="text-[10px] text-[#9A8F7E]/50">{formatDate(o.created_at)}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="inline-block px-2.5 py-0.5 bg-black border border-[#C9A84C]/25 text-[#C9A84C] rounded text-[8px] font-accent uppercase tracking-widest font-extrabold">
                                {o.order_status}
                              </span>
                              <span className="font-mono text-xs font-bold text-white">₹{o.total?.toLocaleString()}</span>
                            </div>
                          </div>

                          {/* Order Items */}
                          <div className="flex flex-col gap-3">
                            {oItems.map((item) => (
                              <div key={item.id} className="flex items-start gap-4">
                                <img 
                                  src={item.product_image || item.product?.images?.[0] || 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=300'} 
                                  alt={item.product_name} 
                                  className="w-12 h-12 object-cover border border-[#C9A84C]/15 rounded shrink-0 bg-[#0E0D0D]" 
                                />
                                <div className="flex-grow min-w-0 font-sans">
                                  <h4 className="font-display text-xs text-white truncate font-bold">{item.product_name}</h4>
                                  <span className="text-[10px] text-[#9A8F7E] block mt-0.5">
                                    Quantity: {item.quantity} &bull; Price: ₹{item.price?.toLocaleString()}
                                  </span>
                                  {item.customization && Object.keys(item.customization).length > 0 && (
                                    <div className="text-[9px] font-mono text-[#C9A84C] mt-1 italic flex flex-col gap-0.5 bg-black/40 p-2 rounded">
                                      {item.customization.engravingText && <span>Engraving: "{item.customization.engravingText}"</span>}
                                      {item.customization.variantSize && <span>Option: {item.customization.variantSize}</span>}
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Action footer */}
                          <div className="flex justify-between items-center pt-3 border-t border-[#C9A84C]/5 select-none">
                            <span className="text-[10px] text-[#9A8F7E] font-mono">Courier: {o.courier || 'Awaiting dispatch'}</span>
                            <NextLink
                              href={`/tracking/${o.id}`}
                              className="flex items-center gap-1.5 border border-[#C9A84C]/50 hover:bg-[#C9A84C] hover:text-[#0A0A0A] px-4 py-2 rounded-lg text-[8.5px] font-accent uppercase tracking-widest font-extrabold transition-all"
                            >
                              Track Shipment &rarr;
                            </NextLink>
                          </div>

                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* 5. SETTINGS TAB */}
            {activeTab === 'settings' && (
              <div className="flex flex-col gap-6">
                <h3 className="font-display text-xl font-bold text-white border-b border-[#C9A84C]/10 pb-4 mb-2">Registry Settings</h3>
                <p className="text-xs text-[#9A8F7E] leading-relaxed">
                  Manage login credentials and secure options. Sign out or update parameters.
                </p>

                <div className="bg-[#0D0D0D] border border-[#C9A84C]/10 p-6 rounded-xl flex flex-col gap-4">
                  <span className="text-xs text-[#9A8F7E] block">Authenticated Email Profile:</span>
                  <span className="font-mono text-sm text-[#C9A84C] font-bold select-all bg-black px-4 py-2 rounded border border-[#C9A84C]/5">{user.email}</span>
                </div>

                <div className="flex gap-4 select-none">
                  <button 
                    onClick={logout}
                    className="h-11 px-8 bg-red-950 border border-red-500/25 hover:border-red-400 text-red-400 hover:text-red-300 rounded-lg font-accent text-[9px] uppercase tracking-widest font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    Logout
                  </button>
                </div>
              </div>
            )}

          </section>

        </div>

      </div>
    </div>
  );
}
