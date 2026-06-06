'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import NextLink from 'next/link';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';
import { useWishlistStore } from '../../store/wishlistStore';
import { getOrders, Order, Product, getOrderItems } from '../../lib/db';
import { 
  User, Mail, Phone, MapPin, Package, Heart, CreditCard, 
  Settings, Key, AlertTriangle, ChevronRight, Camera, Trash2, ShoppingCart, CheckCircle 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type TabType = 'overview' | 'info' | 'addresses' | 'orders' | 'wishlist' | 'settings';

export default function ProfilePage() {
  const router = useRouter();
  
  const { user, logout, updateProfile, setLoginModalOpen, isLoading } = useAuthStore();
  const { addItem } = useCartStore();
  const { items: wishlistItems, toggleItem, fetchWishlist } = useWishlistStore();

  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  // Edit profile states
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [birthday, setBirthday] = useState('');
  const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' });
  const [updateMsg, setUpdateMsg] = useState<string | null>(null);
  
  // Addresses state
  const [addresses, setAddresses] = useState<any[]>([]);
  const [newAddress, setNewAddress] = useState({ label: 'Home', fullName: '', phone: '', line1: '', line2: '', city: '', state: '', pincode: '' });
  const [addressEditIdx, setAddressEditIdx] = useState<number | null>(null);

  // Settings
  const [emailPref, setEmailPref] = useState(true);
  const [whatsappPref, setWhatsappPref] = useState(true);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  // Gatekeeper
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/');
      setLoginModalOpen(true);
    }
  }, [user, isLoading, router, setLoginModalOpen]);

  // Sync profile details
  useEffect(() => {
    if (user) {
      setFullName(user.full_name || '');
      setPhone(user.phone || '');
      
      const userId = user.id;
      // Load orders
      async function loadOrders() {
        setOrdersLoading(true);
        try {
          const items = await getOrders(userId);
          setOrders(items);
        } catch (err) {
          console.error(err);
        } finally {
          setOrdersLoading(false);
        }
      }
      loadOrders();
      fetchWishlist(userId);

      // Load Addresses from Local Storage Fallback
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem(`addresses_${user.id}`);
        if (stored) {
          setAddresses(JSON.parse(stored));
        } else {
          // Add default
          const def = [{
            label: 'Home',
            fullName: user.full_name || 'Bespoke Patron',
            phone: user.phone || '+91 99999 99999',
            line1: user.address || '100 Golden Geode, Vandavasi',
            line2: 'Kanchipuram Road',
            city: 'Chennai',
            state: 'Tamil Nadu',
            pincode: '600001',
            is_default: true
          }];
          setAddresses(def);
          localStorage.setItem(`addresses_${user.id}`, JSON.stringify(def));
        }
      }
    }
  }, [user]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      try {
        await updateProfile({ avatar_url: base64 });
        setUpdateMsg('Profile photo updated.');
        setTimeout(() => setUpdateMsg(null), 3000);
      } catch (err) {
        console.error(err);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleInfoSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdateMsg(null);
    try {
      await updateProfile({ full_name: fullName, phone });
      setUpdateMsg('Profile details saved successfully.');
      setTimeout(() => setUpdateMsg(null), 3000);
    } catch (err: any) {
      setUpdateMsg(err.message || 'Error updating profile.');
    }
  };

  const handlePasswordSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.new !== passwordForm.confirm) {
      alert('New passwords do not match.');
      return;
    }
    setUpdateMsg('Credentials updated successfully.');
    setPasswordForm({ current: '', new: '', confirm: '' });
    setTimeout(() => setUpdateMsg(null), 3000);
  };

  // Addresses CRUD
  const saveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    let updated = [...addresses];
    if (addressEditIdx !== null) {
      updated[addressEditIdx] = newAddress;
      setAddressEditIdx(null);
    } else {
      updated.push({ ...newAddress, is_default: updated.length === 0 });
    }
    setAddresses(updated);
    if (user) {
      localStorage.setItem(`addresses_${user.id}`, JSON.stringify(updated));
    }
    setNewAddress({ label: 'Home', fullName: '', phone: '', line1: '', line2: '', city: '', state: '', pincode: '' });
  };

  const deleteAddress = (index: number) => {
    const updated = addresses.filter((_, i) => i !== index);
    setAddresses(updated);
    if (user) {
      localStorage.setItem(`addresses_${user.id}`, JSON.stringify(updated));
    }
  };

  const setDefaultAddress = (index: number) => {
    const updated = addresses.map((addr, i) => ({
      ...addr,
      is_default: i === index
    }));
    setAddresses(updated);
    if (user) {
      localStorage.setItem(`addresses_${user.id}`, JSON.stringify(updated));
    }
  };

  const handleDeleteAccount = () => {
    if (deleteConfirmText !== 'DELETE') return;
    alert('Account deletion request has been submitted.');
    logout();
    router.push('/');
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center text-[#C9A84C]">
        <div className="w-10 h-10 border-2 border-[#C9A84C] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-24 px-6 bg-[#0A0A0A] relative text-[#F5F0E8] font-body">
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-[#C9A84C]/5 blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative z-10">
        
        {/* Sidebar Navigation */}
        <aside className="lg:col-span-3 bg-[#111111] border border-[#C9A84C]/15 p-6 rounded-lg flex flex-col gap-6 select-none">
          <div className="flex flex-col items-center text-center gap-3">
            <div className="relative w-20 h-20 rounded-full border border-[#C9A84C]/30 overflow-hidden bg-[#0A0A0A] flex items-center justify-center group shadow-md">
              {user.avatar_url ? (
                <img src={user.avatar_url} alt="Profile Photo" className="w-full h-full object-cover" />
              ) : (
                <span className="text-xl font-accent font-extrabold text-[#C9A84C]">{user.full_name?.charAt(0) || 'P'}</span>
              )}
              
              <label className="absolute inset-0 bg-[#0A0A0A]/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer text-[8px] font-accent uppercase tracking-widest text-[#C9A84C]">
                <Camera size={14} className="mb-1" /> Photo
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              </label>
            </div>
            
            <div className="flex flex-col leading-none mt-1">
              <span className="font-display font-semibold text-[#F5F0E8]">{user.full_name || 'Bespoke Patron'}</span>
              <span className="font-body text-[9px] text-[#9A8F7E]/55 mt-1">{user.email}</span>
            </div>
          </div>

          <div className="h-[1px] bg-[#C9A84C]/10" />

          {/* Sidebar Tabs */}
          <div className="flex flex-col gap-1.5">
            {[
              { id: 'overview', name: 'Overview', icon: <User size={14} /> },
              { id: 'info', name: 'Personal Info', icon: <Key size={14} /> },
              { id: 'addresses', name: 'Addresses', icon: <MapPin size={14} /> },
              { id: 'orders', name: 'My Orders', icon: <Package size={14} /> },
              { id: 'wishlist', name: 'Wishlist', icon: <Heart size={14} /> },
              { id: 'settings', name: 'Account Settings', icon: <Settings size={14} /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded text-xs font-accent uppercase tracking-widest transition-colors cursor-pointer text-left ${activeTab === tab.id ? 'bg-[#C9A84C] text-[#0A0A0A] font-extrabold shadow-md' : 'text-[#9A8F7E] hover:bg-[#161616] hover:text-[#F5F0E8]'}`}
              >
                {tab.icon}
                <span>{tab.name}</span>
              </button>
            ))}
          </div>

          <button 
            onClick={logout}
            className="w-full py-2.5 border border-red-500/25 hover:border-red-500 bg-red-950/5 hover:bg-red-950/20 text-red-400 hover:text-red-300 rounded text-[9px] font-accent uppercase tracking-widest transition-colors cursor-pointer"
          >
            Sign Out
          </button>
        </aside>

        {/* Content Area */}
        <main className="lg:col-span-9 bg-[#111111] border border-[#C9A84C]/15 p-8 rounded-lg min-h-[60vh] flex flex-col gap-6">
          
          {updateMsg && (
            <div className="bg-[#C9A84C]/10 border border-[#C9A84C]/35 text-[#C9A84C] text-xs p-4 rounded flex items-center gap-2 font-body select-none">
              <CheckCircle size={14} /> {updateMsg}
            </div>
          )}

          <AnimatePresence mode="wait">
            
            {/* TAB 1: OVERVIEW */}
            {activeTab === 'overview' && (
              <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-6">
                <h2 className="font-display text-2xl text-gold-gradient">Registry Overview</h2>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="p-5 bg-[#0A0A0A] rounded border border-[#C9A84C]/10 flex flex-col justify-center">
                    <span className="text-[9px] font-accent uppercase tracking-widest text-[#9A8F7E]">Patron Since</span>
                    <span className="font-display text-base font-bold text-[#F5F0E8] mt-1">12 June 2025</span>
                  </div>
                  <div className="p-5 bg-[#0A0A0A] rounded border border-[#C9A84C]/10 flex flex-col justify-center">
                    <span className="text-[9px] font-accent uppercase tracking-widest text-[#9A8F7E]">Total Orders</span>
                    <span className="font-display text-base font-bold text-[#F5F0E8] mt-1">{orders.length} Purchases</span>
                  </div>
                  <div className="p-5 bg-[#0A0A0A] rounded border border-[#C9A84C]/10 flex flex-col justify-center">
                    <span className="text-[9px] font-accent uppercase tracking-widest text-[#9A8F7E]">Saved Wishlist</span>
                    <span className="font-display text-base font-bold text-[#F5F0E8] mt-1">{wishlistItems.length} Masterpieces</span>
                  </div>
                </div>

                <div className="h-[1px] bg-[#C9A84C]/10 my-2" />

                {/* Recent Orders Preview */}
                <h3 className="font-accent text-xs font-bold uppercase tracking-widest text-[#C9A84C]">Recent Orders</h3>
                {ordersLoading ? (
                  <div className="h-24 bg-[#0A0A0A] animate-pulse" />
                ) : orders.length === 0 ? (
                  <div className="p-8 bg-[#0A0A0A] rounded border border-[#C9A84C]/5 text-center text-xs text-[#9A8F7E]/50 italic">
                    No orders logged yet. Get started on custom hampers in the shop.
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    {orders.slice(0, 3).map((o) => (
                      <div key={o.id} className="p-5 bg-[#0A0A0A] rounded border border-[#C9A84C]/10 flex flex-wrap items-center justify-between gap-4">
                        <div className="flex flex-col">
                          <span className="font-mono text-[9px] text-[#9A8F7E]/50">#{o.order_number}</span>
                          <span className="font-body text-xs text-[#9A8F7E] mt-1">Date: {new Date(o.created_at).toLocaleDateString()}</span>
                        </div>
                        <span className="font-body text-xs font-bold text-[#C9A84C]">₹{o.total.toLocaleString()}</span>
                        <NextLink href={`/tracking/${o.id}`} className="px-3 py-1.5 border border-[#C9A84C]/50 hover:bg-[#C9A84C] hover:text-[#0A0A0A] rounded text-[9.5px] font-accent uppercase tracking-widest font-extrabold transition-all">
                          Track Shipment
                        </NextLink>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* TAB 2: PERSONAL INFO */}
            {activeTab === 'info' && (
              <motion.div key="info" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-6 max-w-xl">
                <h2 className="font-display text-2xl text-gold-gradient">Registry Credentials</h2>
                
                {/* Details Form */}
                <form onSubmit={handleInfoSave} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] uppercase tracking-widest text-[#9A8F7E]">Patron Full Name</label>
                    <input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)} className="bg-[#0A0A0A]/55 border border-[#C9A84C]/15 py-3 px-4 text-xs rounded text-white" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] uppercase tracking-widest text-[#9A8F7E]">Registered Phone</label>
                    <input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} className="bg-[#0A0A0A]/55 border border-[#C9A84C]/15 py-3 px-4 text-xs rounded text-white" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] uppercase tracking-widest text-[#9A8F7E]">Date of Birth (Optional)</label>
                    <input type="date" value={birthday} onChange={(e) => setBirthday(e.target.value)} className="bg-[#0A0A0A]/55 border border-[#C9A84C]/15 py-3 px-4 text-xs rounded text-white" />
                  </div>
                  <button type="submit" className="btn-solid-gold mt-2 py-3">Save Details</button>
                </form>

                <div className="h-[1px] bg-[#C9A84C]/10 my-4" />

                {/* Password Form */}
                <h3 className="font-accent text-xs font-bold uppercase tracking-widest text-[#C9A84C]">Modify Secure Credentials</h3>
                <form onSubmit={handlePasswordSave} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] uppercase tracking-widest text-[#9A8F7E]">Current Password</label>
                    <input type="password" required value={passwordForm.current} onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })} className="bg-[#0A0A0A]/55 border border-[#C9A84C]/15 py-3 px-4 text-xs rounded text-white" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] uppercase tracking-widest text-[#9A8F7E]">New Password</label>
                    <input type="password" required value={passwordForm.new} onChange={(e) => setPasswordForm({ ...passwordForm, new: e.target.value })} className="bg-[#0A0A0A]/55 border border-[#C9A84C]/15 py-3 px-4 text-xs rounded text-white" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] uppercase tracking-widest text-[#9A8F7E]">Confirm Password</label>
                    <input type="password" required value={passwordForm.confirm} onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })} className="bg-[#0A0A0A]/55 border border-[#C9A84C]/15 py-3 px-4 text-xs rounded text-white" />
                  </div>
                  <button type="submit" className="btn-gold py-3">Update Credentials</button>
                </form>
              </motion.div>
            )}

            {/* TAB 3: ADDRESSES */}
            {activeTab === 'addresses' && (
              <motion.div key="addresses" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-6">
                <h2 className="font-display text-2xl text-gold-gradient">Courier Delivery Addresses</h2>
                
                {/* List Addresses */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 select-none">
                  {addresses.map((addr, idx) => (
                    <div key={idx} className="p-5 rounded bg-[#0A0A0A] border border-[#C9A84C]/15 relative flex flex-col gap-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-accent text-[9px] uppercase tracking-widest text-[#C9A84C] font-bold">
                          {addr.label} {addr.is_default && '· (Default)'}
                        </span>
                        <div className="flex items-center gap-2">
                          <button onClick={() => setAddressEditIdx(idx)} className="text-[#9A8F7E] hover:text-[#C9A84C] text-[10px] cursor-pointer">Edit</button>
                          <button onClick={() => deleteAddress(idx)} className="text-red-400 hover:text-red-300 text-[10px] cursor-pointer">Delete</button>
                        </div>
                      </div>
                      
                      <span className="font-body text-xs font-bold mt-1">{addr.fullName}</span>
                      <span className="font-body text-xs text-[#9A8F7E]">{addr.line1}, {addr.line2}</span>
                      <span className="font-body text-xs text-[#9A8F7E]">{addr.city}, {addr.state} - {addr.pincode}</span>
                      <span className="font-body text-xs text-[#9A8F7E]">Phone: {addr.phone}</span>

                      {!addr.is_default && (
                        <button onClick={() => setDefaultAddress(idx)} className="w-full mt-3 py-1.5 border border-[#C9A84C]/30 text-[#C9A84C] hover:bg-[#C9A84C]/5 text-[9px] font-accent uppercase tracking-widest rounded transition-colors cursor-pointer">
                          Set As Default
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="h-[1px] bg-[#C9A84C]/10 my-2" />

                {/* Form to Add Address */}
                <h3 className="font-accent text-xs font-bold uppercase tracking-widest text-[#C9A84C]">{addressEditIdx !== null ? 'Modify Address' : 'Register New Address'}</h3>
                
                <form onSubmit={saveAddress} className="grid grid-cols-2 gap-4 max-w-xl">
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] uppercase tracking-widest text-[#9A8F7E]">Label</label>
                    <select value={newAddress.label} onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })} className="bg-[#0A0A0A]/55 border border-[#C9A84C]/15 py-3 px-4 text-xs rounded text-white">
                      <option value="Home">Home</option>
                      <option value="Work">Work / Office</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] uppercase tracking-widest text-[#9A8F7E]">Full Name</label>
                    <input type="text" required value={newAddress.fullName} onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })} className="bg-[#0A0A0A]/55 border border-[#C9A84C]/15 py-3 px-4 text-xs rounded text-white" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] uppercase tracking-widest text-[#9A8F7E]">Contact Phone</label>
                    <input type="tel" required value={newAddress.phone} onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })} className="bg-[#0A0A0A]/55 border border-[#C9A84C]/15 py-3 px-4 text-xs rounded text-white" />
                  </div>
                  <div className="flex flex-col gap-1 col-span-2">
                    <label className="text-[9px] uppercase tracking-widest text-[#9A8F7E]">Address Line 1</label>
                    <input type="text" required value={newAddress.line1} onChange={(e) => setNewAddress({ ...newAddress, line1: e.target.value })} className="bg-[#0A0A0A]/55 border border-[#C9A84C]/15 py-3 px-4 text-xs rounded text-white" />
                  </div>
                  <div className="flex flex-col gap-1 col-span-2">
                    <label className="text-[9px] uppercase tracking-widest text-[#9A8F7E]">Address Line 2 (Optional)</label>
                    <input type="text" value={newAddress.line2} onChange={(e) => setNewAddress({ ...newAddress, line2: e.target.value })} className="bg-[#0A0A0A]/55 border border-[#C9A84C]/15 py-3 px-4 text-xs rounded text-white" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] uppercase tracking-widest text-[#9A8F7E]">City</label>
                    <input type="text" required value={newAddress.city} onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })} className="bg-[#0A0A0A]/55 border border-[#C9A84C]/15 py-3 px-4 text-xs rounded text-white" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] uppercase tracking-widest text-[#9A8F7E]">State</label>
                    <input type="text" required value={newAddress.state} onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })} className="bg-[#0A0A0A]/55 border border-[#C9A84C]/15 py-3 px-4 text-xs rounded text-white" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] uppercase tracking-widest text-[#9A8F7E]">Pincode</label>
                    <input type="text" required value={newAddress.pincode} onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })} className="bg-[#0A0A0A]/55 border border-[#C9A84C]/15 py-3 px-4 text-xs rounded text-white" />
                  </div>
                  
                  <div className="col-span-2 mt-2 flex gap-4">
                    <button type="submit" className="btn-solid-gold flex-grow py-3">
                      {addressEditIdx !== null ? 'Save Changes' : 'Register Address'}
                    </button>
                    {addressEditIdx !== null && (
                      <button type="button" onClick={() => setAddressEditIdx(null)} className="btn-gold py-3">Cancel</button>
                    )}
                  </div>
                </form>
              </motion.div>
            )}

            {/* TAB 4: MY ORDERS */}
            {activeTab === 'orders' && (
              <motion.div key="orders" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-6">
                <h2 className="font-display text-2xl text-gold-gradient">Commission Purchase Log</h2>
                
                {ordersLoading ? (
                  <div className="flex justify-center items-center py-20">
                    <div className="w-8 h-8 border-2 border-[#C9A84C] border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : orders.length === 0 ? (
                  <div className="p-10 bg-[#0A0A0A] rounded border border-[#C9A84C]/5 text-center text-xs text-[#9A8F7E]/40 italic">
                    No orders log registered.
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    {orders.map((o) => (
                      <div key={o.id} className="p-6 bg-[#0A0A0A] rounded border border-[#C9A84C]/15 flex flex-wrap items-center justify-between gap-6">
                        <div className="flex flex-col">
                          <span className="font-mono text-[10px] text-[#C9A84C] font-bold">#{o.order_number}</span>
                          <span className="font-body text-xs text-[#9A8F7E] mt-1">Date: {new Date(o.created_at).toLocaleDateString()}</span>
                          <span className="inline-block px-2.5 py-0.5 mt-2 bg-[#111111] border border-[#C9A84C]/25 text-[#C9A84C] rounded text-[8px] font-accent uppercase tracking-widest font-extrabold w-fit">
                            {o.order_status}
                          </span>
                        </div>
                        <span className="font-body text-xs font-bold text-[#C9A84C]">₹{o.total.toLocaleString()}</span>
                        <NextLink href={`/tracking/${o.id}`} className="px-5 py-2 border border-[#C9A84C] hover:bg-[#C9A84C] hover:text-[#0A0A0A] text-[9.5px] font-accent uppercase tracking-widest font-extrabold transition-all">
                          View details & Timeline
                        </NextLink>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* TAB 5: WISHLIST */}
            {activeTab === 'wishlist' && (
              <motion.div key="wishlist" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-6">
                <h2 className="font-display text-2xl text-gold-gradient">Favorited Creations</h2>
                
                {wishlistItems.length === 0 ? (
                  <div className="p-10 bg-[#0A0A0A] border border-[#C9A84C]/5 text-center text-xs text-[#9A8F7E]/45 italic rounded">
                    Your wishlist registry is empty.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {wishlistItems.map((p) => (
                      <div key={p.id} className="bg-[#0A0A0A] p-4 rounded border border-[#C9A84C]/15 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4 min-w-0">
                          <img src={p.images[0]} alt={p.name} className="w-14 h-14 rounded object-cover border border-[#C9A84C]/10 shrink-0" />
                          <div className="flex flex-col min-w-0">
                            <h4 className="font-display text-xs font-bold text-white truncate">{p.name}</h4>
                            <span className="font-body text-xs text-[#C9A84C] font-semibold mt-0.5">₹{p.price.toLocaleString()}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 shrink-0">
                          <button onClick={() => addItem(user.id, p.id, 1)} className="p-2 border border-[#C9A84C]/40 hover:bg-[#C9A84C]/10 text-[#C9A84C] rounded transition-colors cursor-pointer" title="Move to Cart">
                            <ShoppingCart size={13} />
                          </button>
                          <button onClick={() => toggleItem(user.id, p.id)} className="p-2 border border-red-500/20 hover:bg-red-950/20 text-red-400 rounded transition-colors cursor-pointer" title="Remove">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* TAB 6: ACCOUNT SETTINGS */}
            {activeTab === 'settings' && (
              <motion.div key="settings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-6 max-w-xl">
                <h2 className="font-display text-2xl text-gold-gradient">Patron Account Settings</h2>
                
                {/* Notification preferences */}
                <div className="flex flex-col gap-4">
                  <h3 className="font-accent text-xs font-bold uppercase tracking-widest text-[#C9A84C]">Notification Preferences</h3>
                  
                  <div className="flex items-center justify-between p-4 bg-[#0A0A0A] rounded border border-[#C9A84C]/10 select-none">
                    <div className="flex flex-col">
                      <span className="font-body text-xs font-bold">Email Updates</span>
                      <span className="font-body text-[10px] text-[#9A8F7E]/55">Order state updates and tracking notifications</span>
                    </div>
                    <button 
                      onClick={() => setEmailPref(!emailPref)}
                      className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer ${emailPref ? 'bg-[#C9A84C]' : 'bg-[#161616]'}`}
                    >
                      <div className={`w-3.5 h-3.5 rounded-full bg-[#0A0A0A] transition-transform ${emailPref ? 'translate-x-4' : 'translate-x-0'}`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-[#0A0A0A] rounded border border-[#C9A84C]/10 select-none">
                    <div className="flex flex-col">
                      <span className="font-body text-xs font-bold">WhatsApp Updates</span>
                      <span className="font-body text-[10px] text-[#9A8F7E]/55">Receive direct transaction approvals and dispatch receipts</span>
                    </div>
                    <button 
                      onClick={() => setWhatsappPref(!whatsappPref)}
                      className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer ${whatsappPref ? 'bg-[#C9A84C]' : 'bg-[#161616]'}`}
                    >
                      <div className={`w-3.5 h-3.5 rounded-full bg-[#0A0A0A] transition-transform ${whatsappPref ? 'translate-x-4' : 'translate-x-0'}`} />
                    </button>
                  </div>
                </div>

                <div className="h-[1px] bg-[#C9A84C]/10 my-4" />

                {/* Account Deletion */}
                <div className="flex flex-col gap-4 border border-red-500/25 p-6 rounded-lg bg-red-950/5">
                  <h3 className="font-accent text-xs font-bold uppercase tracking-widest text-red-400 flex items-center gap-2">
                    <AlertTriangle size={15} /> Delete Account Registry
                  </h3>
                  <p className="font-body text-xs text-red-400/80 leading-relaxed">
                    Warning: Deleting your account will immediately erase your profile, address records, cart items, wishlists, and any pending order invoice histories permanently.
                  </p>
                  
                  <button 
                    onClick={() => setDeleteModalOpen(true)}
                    className="w-fit py-2.5 px-6 border border-red-500 hover:bg-red-500 hover:text-white rounded text-[10px] font-accent uppercase tracking-widest transition-all cursor-pointer font-bold"
                  >
                    Request Account Deletion
                  </button>
                </div>

                {/* Delete Confirmation Modal */}
                <AnimatePresence>
                  {deleteModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                      <div className="absolute inset-0 bg-[#0A0A0A]/90 backdrop-blur-md cursor-pointer" onClick={() => setDeleteModalOpen(false)} />
                      <div className="bg-[#111111] border border-red-500/30 p-8 w-full max-w-md rounded relative z-10 flex flex-col gap-4">
                        <h3 className="font-display text-xl text-red-400">Confirm Deletion</h3>
                        <p className="font-body text-xs text-[#9A8F7E]">
                          To permanently delete your account registry, type <strong className="text-red-400 uppercase">DELETE</strong> below.
                        </p>
                        <input 
                          type="text" 
                          value={deleteConfirmText}
                          onChange={(e) => setDeleteConfirmText(e.target.value)}
                          className="bg-[#0A0A0A] border border-red-500/20 py-2.5 px-4 text-xs rounded text-white"
                          placeholder="Type DELETE..."
                        />
                        <div className="flex gap-4 mt-2">
                          <button 
                            onClick={handleDeleteAccount}
                            disabled={deleteConfirmText !== 'DELETE'}
                            className="flex-grow py-3 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white rounded text-[10px] font-accent uppercase tracking-widest font-bold cursor-pointer"
                          >
                            Permanently Delete
                          </button>
                          <button onClick={() => setDeleteModalOpen(false)} className="btn-gold py-3">Cancel</button>
                        </div>
                      </div>
                    </div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

          </AnimatePresence>
        </main>

      </div>
    </div>
  );
}
