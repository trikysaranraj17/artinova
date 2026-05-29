'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '../../context/AppContext';
import { getOrders, Order } from '../../lib/db';
import { Search, Package, MapPin, Calendar, Clock, ArrowRight } from 'lucide-react';

export default function TrackingPortalPage() {
  const { user, setLoginModalOpen } = useApp();
  const router = useRouter();
  
  const [orderIdInput, setOrderIdInput] = useState('');
  const [userOrders, setUserOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    async function load(showLoading = true) {
      if (user) {
        if (showLoading) setLoading(true);
        const data = await getOrders(user.id);
        setUserOrders(data);
        if (showLoading) setLoading(false);
      } else {
        setUserOrders([]);
        if (showLoading) setLoading(false);
      }
    }
    load(true);

    if (user) {
      interval = setInterval(() => {
        load(false);
      }, 2000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [user]);

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    if (orderIdInput.trim()) {
      router.push(`/tracking/${orderIdInput.trim()}`);
    } else {
      setError('Please enter a valid order ID');
    }
  };

  return (
    <div className="min-h-screen py-16 px-6 bg-ambient-glow">
      <div className="max-w-4xl mx-auto">
        
        {/* Title */}
        <div className="flex flex-col gap-2 mb-12">
          <span className="font-poppins text-[10px] text-royal-gold uppercase tracking-[0.25em] font-semibold">Logistics Portal</span>
          <h1 className="font-cinzel text-3xl md:text-5xl font-bold tracking-wide text-soft-ivory">
            Order Tracking
          </h1>
          <div className="w-12 h-[1px] bg-royal-gold/60 mt-1" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* Lookup Input Form (5 cols) */}
          <div className="md:col-span-5 glass-panel p-6 rounded-lg border border-champagne-gold/5 flex flex-col gap-5">
            <h3 className="font-cinzel text-xs uppercase tracking-widest text-champagne-gold font-semibold">
              Track Specific ID
            </h3>
            <p className="font-poppins text-[10px] text-soft-ivory/50 leading-relaxed">
              Enter the unique alphanumeric ID provided in your invoice or dashboard profile.
            </p>
            
            <form onSubmit={handleLookup} className="flex flex-col gap-4">
              <div className="relative">
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-soft-ivory/30" />
                <input
                  type="text"
                  value={orderIdInput}
                  onChange={(e) => {
                    setOrderIdInput(e.target.value);
                    setError(null);
                  }}
                  placeholder="e.g. order-170425..."
                  required
                  className="w-full bg-matte-black/60 border border-champagne-gold/15 py-3 pl-10 pr-4 text-xs font-poppins rounded focus:outline-none focus:border-royal-gold/60 text-soft-ivory"
                />
              </div>
              
              {error && (
                <span className="text-[10px] text-red-400 font-poppins">{error}</span>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-royal-gold text-matte-black font-poppins text-xs font-semibold uppercase tracking-[0.15em] rounded hover:bg-champagne-gold transition-colors"
              >
                Track Shipment
              </button>
            </form>
          </div>

          {/* User Order History list (7 cols) */}
          <div className="md:col-span-7 flex flex-col gap-5">
            <h3 className="font-cinzel text-xs uppercase tracking-widest text-champagne-gold font-semibold">
              Commission History
            </h3>

            {!user ? (
              <div className="glass-panel p-8 rounded-lg text-center flex flex-col items-center gap-4 border border-champagne-gold/5">
                <Package size={24} className="text-soft-ivory/20" />
                <p className="font-poppins text-xs text-soft-ivory/50">
                  Please log in to view orders linked directly to your luxury profile.
                </p>
                <button
                  onClick={() => setLoginModalOpen(true)}
                  className="font-poppins text-[10px] uppercase tracking-wider border border-royal-gold/40 px-6 py-2.5 rounded hover:bg-royal-gold hover:text-matte-black transition-colors"
                >
                  Log In Account
                </button>
              </div>
            ) : loading ? (
              <div className="h-48 rounded-lg bg-luxury-charcoal animate-pulse border border-champagne-gold/5" />
            ) : userOrders.length === 0 ? (
              <div className="glass-panel p-8 rounded-lg text-center flex flex-col items-center gap-4 border border-champagne-gold/5">
                <Package size={24} className="text-soft-ivory/20" />
                <p className="font-poppins text-xs text-soft-ivory/50">
                  No orders found. Once you place an order, it will appear here.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-4 max-h-[500px] overflow-y-auto pr-1">
                {userOrders.map((order) => (
                  <div
                    key={order.id}
                    onClick={() => router.push(`/tracking/${order.id}`)}
                    className="glass-panel p-5 rounded-lg border border-champagne-gold/5 hover:border-royal-gold/30 transition-all cursor-pointer group flex items-center justify-between gap-6"
                  >
                    <div className="flex flex-col gap-1 min-w-0">
                      <span className="font-mono text-[9px] text-soft-ivory/40 uppercase tracking-widest truncate">
                        ID: {order.id}
                      </span>
                      <span className="font-cinzel text-xs font-bold text-soft-ivory group-hover:text-champagne-gold transition-colors mt-1">
                        Amount: ${order.total_amount.toFixed(2)}
                      </span>
                      <div className="flex items-center gap-4 text-[10px] text-soft-ivory/50 font-poppins mt-1">
                        <span className="flex items-center gap-1">
                          <Clock size={10} className="text-royal-gold/70" />
                          {new Date(order.created_at).toLocaleDateString()}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[8px] uppercase tracking-wider font-semibold ${
                          order.status === 'Delivered' 
                            ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-500/20' 
                            : 'bg-royal-gold/10 text-royal-gold border border-royal-gold/20'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                    <ArrowRight size={14} className="text-soft-ivory/30 group-hover:text-royal-gold group-hover:translate-x-1 transition-all shrink-0" />
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
