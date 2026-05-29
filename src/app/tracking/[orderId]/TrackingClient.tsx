'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Order, OrderItem, TrackingUpdate, getTrackingUpdates, getOrderById } from '../../../lib/db';
import { ArrowLeft, Clock, Calendar, MapPin, Truck, ChevronRight, PackageCheck, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const STEPS = [
  'Order received',
  'Crafting in progress',
  'Quality check',
  'Packed',
  'Shipped',
  'Out for delivery',
  'Delivered'
];

interface Props {
  order: Order;
  items: OrderItem[];
  initialUpdates: TrackingUpdate[];
}

export default function TrackingClient({ order, items, initialUpdates }: Props) {
  const [currentOrder, setCurrentOrder] = useState<Order>(order);
  const [updates, setUpdates] = useState<TrackingUpdate[]>(initialUpdates);
  const activeIndex = STEPS.indexOf(currentOrder.status);

  // Poll for order details and tracking updates in background
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const freshOrder = await getOrderById(order.id);
        if (freshOrder) {
          setCurrentOrder(freshOrder);
        }
        const fresh = await getTrackingUpdates(order.id);
        if (fresh.length !== updates.length) {
          setUpdates(fresh);
        }
      } catch (err) {
        console.error('Polling tracking updates error:', err);
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [order.id, updates.length]);

  return (
    <div className="min-h-screen py-16 px-6 bg-ambient-glow">
      <div className="max-w-5xl mx-auto">
        
        {/* Navigation back */}
        <Link
          href="/tracking"
          className="inline-flex items-center gap-2 text-xs font-poppins uppercase tracking-wider text-soft-ivory/60 hover:text-champagne-gold mb-12 transition-colors"
        >
          <ArrowLeft size={14} /> Tracking Portal
        </Link>

        {/* Order Header Summary */}
        <div className="glass-panel p-6 md:p-8 rounded-lg border border-champagne-gold/10 mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex flex-col gap-1 min-w-0">
            <span className="font-mono text-[9px] uppercase tracking-widest text-soft-ivory/30">Order Reference</span>
            <h1 className="font-cinzel text-lg md:text-xl font-bold text-champagne-gold truncate max-w-md">
              {currentOrder.id}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-xs font-poppins text-soft-ivory/60 mt-1">
              <span className="flex items-center gap-1.5">
                <Clock size={12} className="text-royal-gold/60" />
                Placed: {new Date(order.created_at).toLocaleDateString()}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar size={12} className="text-royal-gold/60" />
                Est. Delivery: {new Date(currentOrder.delivery_estimate).toLocaleDateString()}
              </span>
            </div>
          </div>

          <div className="flex flex-col md:items-end text-left md:text-right gap-1.5">
            <span className="font-poppins text-[10px] text-soft-ivory/40 uppercase tracking-widest">Total Commission</span>
            <span className="font-poppins text-xl font-extrabold text-royal-gold">
              ${currentOrder.total_amount.toFixed(2)}
            </span>
            <span className={`px-2 py-0.5 rounded text-[8px] uppercase tracking-wider font-semibold border ${
              currentOrder.status === 'Delivered'
                ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/20'
                : 'bg-royal-gold/10 text-royal-gold border-royal-gold/20'
            }`}>
              {currentOrder.status}
            </span>
          </div>
        </div>

        {/* 3D LUXURY TIMELINE ROADMAP */}
        <div className="glass-panel p-8 rounded-lg border border-champagne-gold/5 mb-10 relative overflow-hidden">
          
          <h3 className="font-cinzel text-xs uppercase tracking-widest text-champagne-gold font-semibold mb-12">
            Artisan Production Journey
          </h3>

          {/* Horizontal timeline bar for large screens */}
          <div className="hidden md:flex items-center justify-between relative mt-16 mb-8 px-4">
            
            {/* Background Line path */}
            <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[2px] bg-champagne-gold/10 z-0" />
            
            {/* Glowing gold progress line */}
            <motion.div 
              className="absolute left-0 top-1/2 -translate-y-1/2 h-[2px] bg-royal-gold z-0"
              initial={{ width: 0 }}
              animate={{ width: `${(activeIndex / (STEPS.length - 1)) * 100}%` }}
              transition={{ duration: 1, ease: 'easeInOut' }}
              style={{ boxShadow: '0 0 10px rgba(212,175,55,0.6)' }}
            />

            {/* Individual step nodes */}
            {STEPS.map((step, idx) => {
              const isPast = idx < activeIndex;
              const isActive = idx === activeIndex;
              const isFuture = idx > activeIndex;

              return (
                <div key={step} className="flex flex-col items-center relative z-10 w-24 text-center">
                  
                  {/* Sliding truck indicator above active step */}
                  {isActive && (
                    <motion.div
                      className="absolute -top-12 text-royal-gold flex flex-col items-center"
                      animate={{ y: [0, -5, 0] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                    >
                      <Truck size={18} className="filter drop-shadow-[0_0_5px_rgba(212,175,55,0.6)]" />
                      <div className="w-1.5 h-1.5 bg-royal-gold rotate-45 mt-1" />
                    </motion.div>
                  )}

                  {/* Circle beacon */}
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all duration-500 ${
                    isPast
                      ? 'bg-royal-gold border-royal-gold text-matte-black shadow-[0_0_8px_rgba(212,175,55,0.3)]'
                      : isActive
                        ? 'bg-matte-black border-royal-gold shadow-[0_0_12px_rgba(212,175,55,0.8)] scale-110'
                        : 'bg-luxury-charcoal border-champagne-gold/10 text-soft-ivory/20'
                  }`}>
                    {isPast ? (
                      <span className="text-[10px] font-bold">✓</span>
                    ) : (
                      <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-royal-gold animate-ping' : 'bg-transparent'}`} />
                    )}
                  </div>

                  {/* Label */}
                  <span className={`font-poppins text-[9px] uppercase tracking-wider mt-4 leading-tight ${
                    isActive ? 'text-royal-gold font-bold' : isPast ? 'text-soft-ivory/80' : 'text-soft-ivory/30'
                  }`}>
                    {step}
                  </span>
                </div>
              );
            })}

          </div>

          {/* Vertical timeline layout for small screens */}
          <div className="flex md:hidden flex-col gap-8 relative pl-6 py-4">
            
            {/* Background Line path */}
            <div className="absolute left-[30px] top-0 bottom-0 w-[2px] bg-champagne-gold/10 z-0" />
            
            {/* Glowing gold progress line */}
            <motion.div 
              className="absolute left-[30px] top-0 w-[2px] bg-royal-gold z-0"
              initial={{ height: 0 }}
              animate={{ height: `${(activeIndex / (STEPS.length - 1)) * 100}%` }}
              transition={{ duration: 1 }}
              style={{ boxShadow: '0 0 10px rgba(212,175,55,0.6)' }}
            />

            {/* Steps loop */}
            {STEPS.map((step, idx) => {
              const isPast = idx < activeIndex;
              const isActive = idx === activeIndex;

              return (
                <div key={step} className="flex items-center gap-6 relative z-10">
                  
                  {/* Circle beacon */}
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center border shrink-0 transition-all ${
                    isPast
                      ? 'bg-royal-gold border-royal-gold text-matte-black shadow-[0_0_6px_rgba(212,175,55,0.3)]'
                      : isActive
                        ? 'bg-matte-black border-royal-gold shadow-[0_0_10px_rgba(212,175,55,0.7)] scale-110'
                        : 'bg-luxury-charcoal border-champagne-gold/10'
                  }`}>
                    {isPast ? (
                      <span className="text-[10px] font-bold">✓</span>
                    ) : (
                      <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-royal-gold' : 'bg-transparent'}`} />
                    )}
                  </div>

                  {/* Label & Details */}
                  <div className="flex flex-col">
                    <span className={`font-poppins text-xs uppercase tracking-widest ${
                      isActive ? 'text-royal-gold font-bold' : isPast ? 'text-soft-ivory/80' : 'text-soft-ivory/30'
                    }`}>
                      {step}
                    </span>
                    {isActive && (
                      <span className="font-poppins text-[9px] text-champagne-gold/60 mt-0.5 flex items-center gap-1.5 uppercase tracking-wider animate-pulse">
                        <Truck size={10} /> Active status
                      </span>
                    )}
                  </div>

                </div>
              );
            })}

          </div>

        </div>

        {/* Detailed Logs & Shipping Specs */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Production timeline activity logs (7 cols) */}
          <div className="lg:col-span-7 glass-panel p-6 rounded-lg border border-champagne-gold/5 flex flex-col gap-6">
            <h3 className="font-cinzel text-xs uppercase tracking-widest text-champagne-gold font-semibold">
              Activity History Log
            </h3>
            
            {updates.length === 0 ? (
              <p className="font-poppins text-xs text-soft-ivory/40">No activity history reported yet.</p>
            ) : (
              <div className="flex flex-col gap-5">
                {updates.map((update, idx) => (
                  <div key={update.id} className="flex gap-4 items-start text-xs font-poppins relative">
                    {/* Connecting vertical dot stems */}
                    {idx < updates.length - 1 && (
                      <div className="absolute left-[13px] top-[26px] bottom-[-20px] w-[1px] bg-champagne-gold/10" />
                    )}

                    <div className="w-7 h-7 rounded-full bg-luxury-charcoal border border-champagne-gold/15 flex items-center justify-center shrink-0 mt-0.5">
                      <Clock size={12} className="text-royal-gold/60" />
                    </div>

                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-3">
                        <span className="font-cinzel text-xs font-bold text-soft-ivory uppercase tracking-wider">
                          {update.status}
                        </span>
                        <span className="text-[9px] text-soft-ivory/40">
                          {new Date(update.updated_at).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-soft-ivory/60 leading-relaxed mt-0.5">{update.comment}</p>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Delivery Registry details (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            {/* Shipment address */}
            <div className="glass-panel p-6 rounded-lg border border-champagne-gold/5 flex flex-col gap-4">
              <h3 className="font-cinzel text-xs uppercase tracking-widest text-champagne-gold font-semibold flex items-center gap-2">
                <MapPin size={14} className="text-royal-gold" /> Shipping Registry
              </h3>
              
              <div className="flex flex-col gap-2 font-poppins text-xs text-soft-ivory/70 leading-relaxed">
                <span className="font-semibold text-soft-ivory">{currentOrder.shipping_name}</span>
                <span>Phone: {currentOrder.shipping_phone}</span>
                <span>Email: {currentOrder.shipping_email}</span>
                <span className="border-t border-champagne-gold/5 pt-2 mt-1">
                  {currentOrder.shipping_address}
                </span>
              </div>
            </div>

            {/* Items details */}
            <div className="glass-panel p-6 rounded-lg border border-champagne-gold/5 flex flex-col gap-4">
              <h3 className="font-cinzel text-xs uppercase tracking-widest text-champagne-gold font-semibold flex items-center gap-2">
                <PackageCheck size={14} className="text-royal-gold" /> Box Contents
              </h3>
              
              <div className="flex flex-col gap-3.5 max-h-48 overflow-y-auto pr-1">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-4 text-xs font-poppins text-soft-ivory/70">
                    <div className="flex flex-col min-w-0">
                      <span className="font-cinzel font-bold text-soft-ivory truncate">
                        {item.product?.title || 'Bespoke Craft'}
                      </span>
                      <span className="text-[10px] text-soft-ivory/40 mt-0.5">
                        Qty: {item.quantity} &bull; ${(item.price).toFixed(2)}
                      </span>
                    </div>
                    <span className="font-semibold text-champagne-gold shrink-0">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
