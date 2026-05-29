'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '../../context/AppContext';
import { getOrders, Order, toggleWishlist, getWishlist, Product } from '../../lib/db';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { 
  User, Mail, Phone, MapPin, Package, Calendar, Clock, 
  ChevronRight, ArrowLeft, Shield, Heart, CreditCard, 
  MessageSquare, CheckCircle, Edit3, Trash2, Eye, ShieldCheck, ShoppingCart, Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type SubView = 'none' | 'orders' | 'security' | 'addresses' | 'wishlist' | 'payments';

export default function ProfilePage() {
  const { user, isGuest, setLoginModalOpen, isLoading, logout, refreshCart, addItemToCart } = useApp();
  const router = useRouter();
  
  const [activeView, setActiveView] = useState<SubView>('none');
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [wishlistItems, setWishlistItems] = useState<Product[]>([]);
  const [wishlistLoading, setWishlistLoading] = useState(true);

  // Edit profile states
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.address || '');
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  // Authenticate gate
  useEffect(() => {
    if (!isLoading && !user && !isGuest) {
      router.push('/');
      setLoginModalOpen(true);
    }
  }, [user, isGuest, isLoading, router, setLoginModalOpen]);

  // Load profile values on user change
  useEffect(() => {
    if (user) {
      setFullName(user.full_name || '');
      setPhone(user.phone || '');
      setAddress(user.address || '');
    }
  }, [user]);

  // Load orders
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    async function loadOrders(showLoading = true) {
      if (user) {
        if (showLoading) setOrdersLoading(true);
        try {
          const userOrders = await getOrders(user.id);
          setOrders(userOrders);
        } catch (err) {
          console.error(err);
        } finally {
          if (showLoading) setOrdersLoading(false);
        }
      }
    }

    if (activeView === 'orders') {
      loadOrders(true);
      interval = setInterval(() => {
        loadOrders(false);
      }, 2000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [user, activeView]);

  // Load wishlist items
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    async function loadWishlist(showLoading = true) {
      if (user) {
        if (showLoading) setWishlistLoading(true);
        try {
          const items = await getWishlist(user.id);
          setWishlistItems(items);
        } catch (err) {
          console.error(err);
        } finally {
          if (showLoading) setWishlistLoading(false);
        }
      }
    }

    if (activeView === 'wishlist') {
      loadWishlist(true);
      interval = setInterval(() => {
        loadWishlist(false);
      }, 2000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [user, activeView]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdateLoading(true);
    setUpdateSuccess(false);

    try {
      if (isSupabaseConfigured && user) {
        // 1. Update public.users table in Supabase
        const { error } = await supabase
          .from('users')
          .update({
            full_name: fullName,
            phone,
            address
          })
          .eq('id', user.id);

        if (error) throw error;
        
        // Update user state session
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          session.user.user_metadata = {
            ...session.user.user_metadata,
            full_name: fullName,
            phone,
            address
          };
        }
      } else if (user) {
        // 2. Local Storage update
        const localUsers = JSON.parse(localStorage.getItem('artinova_registered_users') || '[]');
        const updatedUsers = localUsers.map((u: any) => {
          if (u.id === user.id) {
            return { ...u, full_name: fullName, phone, address };
          }
          return u;
        });
        localStorage.setItem('artinova_registered_users', JSON.stringify(updatedUsers));
        
        const updatedUser = { ...user, full_name: fullName, phone, address };
        localStorage.setItem('artinova_user', JSON.stringify(updatedUser));
        
        // Trigger page state reload
        window.location.reload();
      }
      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 4000);
    } catch (err) {
      console.error('Failed to update profile:', err);
      alert('Error updating security profile credentials.');
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleRemoveWishlist = async (productId: string) => {
    if (user) {
      await toggleWishlist(user.id, productId);
      setWishlistItems(wishlistItems.filter(item => item.id !== productId));
    }
  };

  const handleAddToCart = async (productId: string) => {
    await addItemToCart(productId, 1);
    alert('Masterpiece item added to cart.');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen py-20 px-6 bg-ambient-glow flex items-center justify-center font-cinzel text-xs tracking-widest text-royal-gold animate-pulse">
        Opening secure profile registry...
      </div>
    );
  }

  const amazonCards = [
    {
      id: 'orders' as SubView,
      title: 'Your Orders',
      desc: 'Track, inspect pipeline status, or browse order history',
      icon: <Package className="text-royal-gold" size={24} />
    },
    {
      id: 'security' as SubView,
      title: 'Login & Security',
      desc: 'Edit name, telephone links, or secure credentials',
      icon: <Shield className="text-royal-gold" size={24} />
    },
    {
      id: 'addresses' as SubView,
      title: 'Your Addresses',
      desc: 'Configure primary courier shipping registry parameters',
      icon: <MapPin className="text-royal-gold" size={24} />
    },
    {
      id: 'wishlist' as SubView,
      title: 'Your Wish List',
      desc: 'Inspect or commission your favorited boutique items',
      icon: <Heart className="text-royal-gold" size={24} />
    },
    {
      id: 'payments' as SubView,
      title: 'Payment Options',
      desc: 'Manage GPay UPI accounts or inspect saved transfers',
      icon: <CreditCard className="text-royal-gold" size={24} />
    },
    {
      id: 'support' as SubView,
      title: 'Contact Atelier',
      desc: 'Direct channels to request custom engravings/sizing',
      icon: <MessageSquare className="text-royal-gold" size={24} />,
      link: '/contact'
    }
  ];

  return (
    <div className="min-h-screen py-16 px-6 bg-ambient-glow relative overflow-hidden">
      {/* Glow leaks */}
      <div className="absolute top-1/3 left-[-10%] w-96 h-96 rounded-full bg-burgundy-glow/10 blur-[100px] pointer-events-none" />
      
      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* Header Intro */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12 border-b border-champagne-gold/10 pb-8">
          <div className="flex flex-col gap-2">
            <span className="font-poppins text-[10px] text-royal-gold uppercase tracking-[0.25em] font-semibold">Amazon Patron Registry</span>
            <h1 className="font-cinzel text-3xl md:text-5xl font-bold tracking-wide text-soft-ivory">
              Your Account
            </h1>
            <div className="w-12 h-[1px] bg-royal-gold/60 mt-1" />
          </div>

          <div className="flex items-center gap-4">
            <div className="flex flex-col items-start md:items-end text-left md:text-right">
              <span className="font-poppins text-[10px] text-soft-ivory/40 uppercase tracking-widest">Patron Profile</span>
              <span className="font-cinzel text-sm text-champagne-gold font-bold mt-0.5">{user?.full_name || user?.email || 'Bespoke Patron'}</span>
            </div>
            <button
              onClick={logout}
              className="px-4 py-2 border border-red-500/30 hover:border-red-400 bg-red-950/5 hover:bg-red-950/20 text-red-400 hover:text-red-300 text-[10px] font-poppins uppercase tracking-wider rounded transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Dynamic Animations View Switcher */}
        <AnimatePresence mode="wait">
          {activeView === 'none' ? (
            
            /* Main Cards Grid View */
            <motion.div
              key="grid"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {amazonCards.map((card) => {
                const handleClick = () => {
                  if (card.link) {
                    router.push(card.link);
                  } else {
                    setActiveView(card.id);
                  }
                };

                return (
                  <div
                    key={card.title}
                    onClick={handleClick}
                    className="glass-card p-6 rounded-lg border border-champagne-gold/5 hover:border-royal-gold/30 hover:bg-luxury-charcoal/50 cursor-pointer flex gap-5 items-start group transition-all"
                  >
                    <div className="p-3.5 rounded bg-royal-gold/5 border border-royal-gold/15 group-hover:border-royal-gold/45 group-hover:bg-royal-gold/10 transition-all shrink-0">
                      {card.icon}
                    </div>
                    <div className="flex flex-col gap-1 min-w-0">
                      <h3 className="font-cinzel text-sm font-bold text-soft-ivory group-hover:text-champagne-gold transition-colors">
                        {card.title}
                      </h3>
                      <p className="font-poppins text-[10px] text-soft-ivory/50 leading-relaxed mt-0.5">
                        {card.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </motion.div>

          ) : (
            
            /* Sub-View Details Layout */
            <motion.div
              key="subview"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="glass-panel p-8 rounded-lg border border-champagne-gold/10 min-h-[50vh] flex flex-col gap-6"
            >
              {/* Back Button */}
              <button
                onClick={() => setActiveView('none')}
                className="flex items-center gap-2 text-royal-gold hover:text-champagne-gold text-xs font-poppins uppercase tracking-widest font-semibold pb-4 border-b border-champagne-gold/10 transition-colors w-fit"
              >
                <ArrowLeft size={14} /> Back to Account Registry
              </button>

              {/* Sub-view Content renderer */}
              <div className="flex-grow mt-4">
                
                {/* 1. ORDERS LIST VIEW */}
                {activeView === 'orders' && (
                  <div className="flex flex-col gap-6">
                    <h3 className="font-cinzel text-md font-bold text-champagne-gold flex items-center gap-2">
                      <Package size={18} /> Purchase Orders Pipeline
                    </h3>
                    
                    {ordersLoading ? (
                      <div className="flex justify-center items-center py-16">
                        <Loader2 className="animate-spin text-royal-gold" size={24} />
                      </div>
                    ) : orders.length === 0 ? (
                      <div className="text-center py-16 text-xs font-poppins text-soft-ivory/40">
                        No commissions registered. You haven&apos;t placed any orders yet.
                      </div>
                    ) : (
                      <div className="flex flex-col gap-4">
                        {orders.map((order) => (
                          <div
                            key={order.id}
                            onClick={() => router.push(`/tracking/${order.id}`)}
                            className="bg-matte-black/45 p-5 rounded border border-champagne-gold/5 hover:border-royal-gold/30 cursor-pointer flex items-center justify-between gap-6 group transition-all"
                          >
                            <div className="flex flex-col gap-1 min-w-0">
                              <span className="font-mono text-[9px] text-soft-ivory/30 truncate">
                                REF ID: {order.id}
                              </span>
                              <div className="flex flex-wrap items-center gap-4 text-xs font-poppins text-soft-ivory/50 mt-1">
                                <span className="flex items-center gap-1">
                                  <Clock size={11} className="text-royal-gold/60" />
                                  {new Date(order.created_at).toLocaleDateString()}
                                </span>
                                <span className="font-semibold text-champagne-gold">
                                  ${order.total_amount.toFixed(2)}
                                </span>
                              </div>
                              <span className="bg-royal-gold/10 text-royal-gold border border-royal-gold/20 px-2 py-0.5 rounded text-[8px] uppercase tracking-wider font-semibold w-fit mt-2">
                                {order.status}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="font-poppins text-[9px] uppercase tracking-wider text-royal-gold opacity-0 group-hover:opacity-100 transition-opacity">
                                Track Order
                              </span>
                              <ChevronRight size={14} className="text-soft-ivory/30 group-hover:text-royal-gold group-hover:translate-x-1 transition-all" />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* 2. LOGIN & SECURITY OR ADDRESSES */}
                {(activeView === 'security' || activeView === 'addresses') && (
                  <div className="max-w-xl flex flex-col gap-6">
                    <h3 className="font-cinzel text-md font-bold text-champagne-gold flex items-center gap-2">
                      {activeView === 'security' ? <Shield size={18} /> : <MapPin size={18} />}
                      {activeView === 'security' ? 'Edit Security Credentials' : 'Manage Courier Delivery Addresses'}
                    </h3>

                    {updateSuccess && (
                      <div className="bg-emerald-950/30 border border-emerald-500/20 text-emerald-300 text-xs p-4 rounded flex items-center gap-2 font-poppins animate-pulse">
                        <CheckCircle size={14} /> Profile registry parameters updated successfully.
                      </div>
                    )}

                    <form onSubmit={handleUpdateProfile} className="flex flex-col gap-5">
                      {/* Name */}
                      <div className="flex flex-col gap-1.5">
                        <label className="font-poppins text-[10px] uppercase tracking-wider text-soft-ivory/50 font-semibold pl-1">Full Name</label>
                        <input
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="Bespoke Name"
                          className="bg-matte-black/55 border border-champagne-gold/15 py-3 px-4 text-xs font-poppins rounded focus:outline-none focus:border-royal-gold/60 text-soft-ivory"
                        />
                      </div>

                      {/* Phone */}
                      <div className="flex flex-col gap-1.5">
                        <label className="font-poppins text-[10px] uppercase tracking-wider text-soft-ivory/50 font-semibold pl-1">Phone Link</label>
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="Contact phone"
                          className="bg-matte-black/55 border border-champagne-gold/15 py-3 px-4 text-xs font-poppins rounded focus:outline-none focus:border-royal-gold/60 text-soft-ivory"
                        />
                      </div>

                      {/* Address */}
                      <div className="flex flex-col gap-1.5">
                        <label className="font-poppins text-[10px] uppercase tracking-wider text-soft-ivory/50 font-semibold pl-1">Delivery Address</label>
                        <textarea
                          required
                          rows={3}
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          placeholder="Courier shipping coordinates"
                          className="bg-matte-black/55 border border-champagne-gold/15 py-3 px-4 text-xs font-poppins rounded focus:outline-none focus:border-royal-gold/60 text-soft-ivory resize-none"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={updateLoading}
                        className="w-full mt-2 py-3.5 bg-royal-gold text-matte-black font-poppins text-xs font-bold uppercase tracking-wider rounded hover:bg-champagne-gold hover:shadow-[0_0_12px_rgba(214,175,55,0.35)] transition-all disabled:opacity-50"
                      >
                        {updateLoading ? 'UPDATING CREDENTIALS...' : 'SAVE MODIFICATIONS'}
                      </button>
                    </form>
                  </div>
                )}

                {/* 3. WISHLIST VIEW */}
                {activeView === 'wishlist' && (
                  <div className="flex flex-col gap-6">
                    <h3 className="font-cinzel text-md font-bold text-champagne-gold flex items-center gap-2">
                      <Heart size={18} /> Favorited Luxury Collections
                    </h3>

                    {wishlistLoading ? (
                      <div className="flex justify-center items-center py-16">
                        <Loader2 className="animate-spin text-royal-gold" size={24} />
                      </div>
                    ) : wishlistItems.length === 0 ? (
                      <div className="text-center py-16 text-xs font-poppins text-soft-ivory/40">
                        Wishlist registry is empty. 
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {wishlistItems.map((product) => (
                          <div
                            key={product.id}
                            className="bg-matte-black/45 p-4 rounded border border-champagne-gold/5 flex items-center justify-between gap-4"
                          >
                            <div className="flex items-center gap-4 min-w-0">
                              <img
                                src={product.images[0]}
                                alt={product.title}
                                className="w-14 h-14 rounded object-cover border border-champagne-gold/10 shrink-0"
                              />
                              <div className="flex flex-col min-w-0">
                                <h4 className="font-cinzel text-xs font-bold text-soft-ivory truncate">{product.title}</h4>
                                <span className="font-poppins text-[11px] text-royal-gold font-semibold mt-0.5">${product.price.toFixed(2)}</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <button
                                onClick={() => handleAddToCart(product.id)}
                                className="p-2 border border-royal-gold/30 hover:border-royal-gold hover:bg-royal-gold/10 text-royal-gold rounded transition-colors"
                                title="Add to Cart"
                              >
                                <ShoppingCart size={13} />
                              </button>
                              <button
                                onClick={() => handleRemoveWishlist(product.id)}
                                className="p-2 border border-red-500/20 hover:border-red-400 hover:bg-red-950/20 text-red-400 rounded transition-colors"
                                title="Remove from list"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* 4. PAYMENT OPTIONS */}
                {activeView === 'payments' && (
                  <div className="max-w-xl flex flex-col gap-6">
                    <h3 className="font-cinzel text-md font-bold text-champagne-gold flex items-center gap-2">
                      <CreditCard size={18} /> GPay UPI Account registry
                    </h3>
                    
                    <div className="p-6 bg-matte-black/45 border border-champagne-gold/5 rounded-lg flex flex-col items-center text-center gap-5">
                      <div className="p-4 rounded bg-[#faf7f2] border border-royal-gold/20 flex flex-col items-center">
                        {/* Simulated QR logo */}
                        <div className="w-32 h-32 bg-gray-200 border-2 border-matte-black flex items-center justify-center font-mono text-[8px] text-matte-black font-bold p-2 text-center">
                          [ ARTINOVA.GPAY@UPI SECURE QR ]
                        </div>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <span className="font-poppins text-[10px] text-soft-ivory/30 uppercase tracking-widest">Active UPI ID</span>
                        <span className="font-poppins text-xs font-semibold text-royal-gold">artinova.gpay@upi</span>
                      </div>
                      <p className="font-poppins text-[10px] text-soft-ivory/50 leading-relaxed max-w-sm">
                        Use GPay to scan and authorize direct bank transactions for your bespoke gifting commissions. To claim a custom order, upload your transaction reference slip during checkout.
                      </p>
                    </div>
                  </div>
                )}

              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
