'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import NextLink from 'next/link';
import { getOrderById, getTrackingUpdates, Order, TrackingUpdate } from '../../../lib/db';
import { useAuthStore } from '../../../store/authStore';
import { ArrowLeft, Clock, MapPin, Loader2, Calendar, ShieldCheck, CheckCircle2, ChevronRight, Check } from 'lucide-react';
import { motion } from 'framer-motion';

const STATUS_STEPS = [
  { key: 'received', label: 'Order Received', desc: 'Custom commission received and registered.' },
  { key: 'verified', label: 'Payment Verified', desc: 'UPI payment screenshot reviewed and verified by admin.' },
  { key: 'design', label: 'Design Confirmed', desc: 'Custom text engraving and files confirmed.' },
  { key: 'crafting', label: 'Crafting Started', desc: 'Artisans hand-crafting, pouring geode, and engraving items.' },
  { key: 'quality', label: 'Quality Check', desc: 'Rigorous detail inspection, polishing, and detailing.' },
  { key: 'packaging', label: 'Packaging', desc: 'Wrapped in signature velvet ribbon and wax stamp sealed.' },
  { key: 'shipped', label: 'Shipped', desc: 'Handed over to courier partner. Transit details uploaded.' },
  { key: 'delivered', label: 'Delivered', desc: 'Package delivered successfully. Enjoy your custom keepsakes!' }
];

export default function OrderTrackingPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { id } = resolvedParams;
  const { user, isGuest, setLoginModalOpen, isLoading } = useAuthStore();
  const router = useRouter();

  const [order, setOrder] = useState<Order | null>(null);
  const [trackingLogs, setTrackingLogs] = useState<TrackingUpdate[]>([]);
  const [pageLoading, setPageLoading] = useState(true);

  // Authenticate gate
  useEffect(() => {
    if (!isLoading && !user && !isGuest) {
      router.push('/');
      setLoginModalOpen(true);
    }
  }, [user, isGuest, isLoading, router, setLoginModalOpen]);

  // Load tracking data
  useEffect(() => {
    async function loadTrackingData(showLoading = true) {
      if (id) {
        if (showLoading) setPageLoading(true);
        try {
          const fetchedOrder = await getOrderById(id);
          if (fetchedOrder) {
            setOrder(fetchedOrder);
            const logs = await getTrackingUpdates(id);
            setTrackingLogs(logs);
          }
        } catch (err) {
          console.error('Error fetching order tracking details:', err);
        } finally {
          if (showLoading) setPageLoading(false);
        }
      }
    }

    loadTrackingData(true);

    // Dynamic real-time polling updates every 5 seconds
    const interval = setInterval(() => {
      loadTrackingData(false);
    }, 5000);

    return () => clearInterval(interval);
  }, [id]);

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

  if (isLoading || pageLoading) {
    return (
      <div className="min-h-screen py-20 bg-[#0A0A0A] flex flex-col items-center justify-center gap-4 text-xs font-body text-[#9A8F7E]/50 select-none">
        <Loader2 className="animate-spin text-[#C9A84C]" size={28} />
        <span className="font-accent text-[#C9A84C] tracking-[0.25em] uppercase">Opening Logistics Registry...</span>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen py-24 px-6 bg-[#0A0A0A] flex flex-col items-center justify-center gap-6 text-center select-none">
        <h3 className="font-display italic text-lg text-[#C9A84C]">Order record not found</h3>
        <p className="text-xs text-[#9A8F7E] max-w-xs leading-relaxed">
          The requested tracking reference code does not exist in our secure database.
        </p>
        <NextLink
          href="/orders"
          className="btn-solid-gold py-3 px-8 text-[10px] uppercase font-bold tracking-widest rounded"
        >
          Return to Orders
        </NextLink>
      </div>
    );
  }

  // Calculate current active step index
  const activeStepIndex = STATUS_STEPS.findIndex(step => step.key.toLowerCase() === order.order_status.toLowerCase());

  const getStatusText = (status: string) => {
    switch (status) {
      case 'received': return 'Order Received';
      case 'verified': return 'Payment Verified';
      case 'design': return 'Design Confirmed';
      case 'crafting': return 'Crafting Started';
      case 'quality': return 'Quality Check';
      case 'packaging': return 'Packaging';
      case 'shipped': return 'Shipped';
      case 'delivered': return 'Delivered';
      default: return status;
    }
  };

  return (
    <div className="min-h-screen pt-40 pb-24 px-6 bg-[#0A0A0A] text-[#F5F0E8] font-body relative overflow-hidden">
      {/* Golden backdrop glow */}
      <div className="absolute top-1/3 right-[-10%] w-96 h-96 bg-[#C9A84C]/5 blur-[120px] pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10">
        
        {/* Back Link */}
        <NextLink
          href="/orders"
          className="inline-flex items-center gap-2 text-xs font-accent uppercase tracking-widest text-[#9A8F7E] hover:text-[#C9A84C] mb-10 transition-colors"
        >
          <ArrowLeft size={13} /> Back to Order History
        </NextLink>

        {/* Title */}
        <div className="flex flex-col gap-2 mb-12 select-none">
          <span className="font-accent text-[9px] text-[#C9A84C] uppercase tracking-[0.25em]">Real-Time Logistics Tracker</span>
          <h1 className="font-display text-4xl sm:text-5xl font-semibold tracking-wide text-[#F5F0E8] leading-none">
            Track Order
          </h1>
          <div className="w-12 h-[1px] bg-[#C9A84C] mt-2" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* A. Tracking Timeline (Left - 8 cols) */}
          <div className="lg:col-span-8 bg-[#111111] border border-[#C9A84C]/10 p-8 rounded-lg shadow-xl">
            <h3 className="font-accent text-xs font-bold uppercase tracking-widest text-[#C9A84C] mb-8 border-b border-[#C9A84C]/10 pb-4 select-none">
              Production & Shipping Timeline
            </h3>

            {/* Glowing Vertical Timeline Container */}
            <div className="relative flex flex-col gap-8 select-none pl-4">
              
              {/* Central connecting progress timeline line */}
              <div className="absolute left-[15px] top-4 bottom-4 w-[2px] bg-[#0A0A0A] border-l border-[#C9A84C]/10" />
              
              {/* Dynamic filled golden progress timeline bar */}
              {activeStepIndex !== -1 && (
                <div 
                  className="absolute left-[15px] top-4 w-[2px] bg-gradient-to-b from-[#B8860B] to-[#C9A84C] transition-all duration-1000 shadow-[0_0_8px_rgba(201,168,76,0.5)]"
                  style={{
                    height: `${(activeStepIndex / (STATUS_STEPS.length - 1)) * 90}%`
                  }}
                />
              )}

              {/* Status steps mapping */}
              {STATUS_STEPS.map((step, idx) => {
                const isCompleted = idx < activeStepIndex;
                const isActive = idx === activeStepIndex;

                return (
                  <div key={step.key} className="flex gap-6 items-start relative z-10">
                    
                    {/* Circle Indicator */}
                    <div className="flex items-center justify-center shrink-0 w-8 h-8 rounded-full border bg-[#111111] relative">
                      {isCompleted ? (
                        <div className="w-8 h-8 rounded-full border border-[#C9A84C] bg-[#C9A84C]/10 text-[#C9A84C] flex items-center justify-center shadow-[0_0_8px_rgba(201,168,76,0.25)]">
                          <Check size={12} strokeWidth={3} />
                        </div>
                      ) : isActive ? (
                        <div className="w-8 h-8 rounded-full border-2 border-[#C9A84C] bg-[#C9A84C]/25 flex items-center justify-center shadow-[0_0_12px_rgba(201,168,76,0.35)]">
                          <div className="w-2.5 h-2.5 rounded-full bg-[#C9A84C] animate-ping" />
                          <div className="absolute w-2 h-2 rounded-full bg-[#C9A84C]" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full border border-[#C9A84C]/10 bg-[#0A0A0A] flex items-center justify-center text-[#9A8F7E]/30 text-[10px] font-bold">
                          {idx + 1}
                        </div>
                      )}
                    </div>

                    {/* Step descriptions */}
                    <div className="flex flex-col gap-1">
                      <span className={`font-accent text-xs font-bold transition-colors ${
                        isActive ? 'text-[#C9A84C]' : isCompleted ? 'text-[#C9A84C]/80' : 'text-[#9A8F7E]/40'
                      }`}>
                        {step.label}
                      </span>
                      <span className="font-body text-[10.5px] text-[#9A8F7E]/70 leading-relaxed">
                        {step.desc}
                      </span>
                      {isActive && order.courier && order.tracking_number && step.key === 'shipped' && (
                        <div className="mt-2 text-[10px] p-2 bg-[#0A0A0A] border border-[#C9A84C]/15 rounded text-[#9A8F7E] w-fit">
                          Courier: <strong className="text-white">{order.courier}</strong> &bull; AWB: <strong className="text-[#C9A84C]">{order.tracking_number}</strong>
                        </div>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>
          </div>

          {/* B. Order Summary Details (Right - 4 cols) */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            
            {/* Quick Summary Card */}
            <div className="bg-[#111111] border border-[#C9A84C]/10 p-6 rounded-lg flex flex-col gap-4 shadow-xl select-none">
              <h4 className="font-accent text-xs font-bold uppercase tracking-widest text-[#C9A84C]">
                Order Summary
              </h4>

              <div className="h-[1px] bg-[#C9A84C]/10" />

              <div className="flex flex-col gap-3 font-body text-xs text-[#9A8F7E]">
                <div className="flex justify-between items-center">
                  <span>Reference ID</span>
                  <span className="font-accent text-[9px] font-bold tracking-wider">{order.order_number}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Placed Date</span>
                  <span className="flex items-center gap-1"><Calendar size={11} className="text-[#C9A84C]/60" /> {formatDate(order.created_at)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Total Amount</span>
                  <span className="font-bold text-[#C9A84C]">₹{order.total.toLocaleString()}</span>
                </div>
              </div>

              <div className="h-[1px] bg-[#C9A84C]/10" />

              <div className="flex flex-col gap-1.5 font-body text-xs text-[#9A8F7E]">
                <span className="flex items-center gap-1.5 text-[#C9A84C] font-bold uppercase text-[9px] tracking-wider"><MapPin size={11} /> Shipping Address</span>
                <span className="leading-relaxed text-[10px] mt-0.5">{order.shipping_address}</span>
              </div>
            </div>

            {/* Historical comments log box */}
            {trackingLogs.length > 0 && (
              <div className="bg-[#111111] border border-[#C9A84C]/10 p-6 rounded-lg flex flex-col gap-4 shadow-xl">
                <h4 className="font-accent text-xs font-bold uppercase tracking-widest text-[#C9A84C]">
                  Logistics Diary
                </h4>
                
                <div className="flex flex-col gap-4 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                  {trackingLogs.map((log) => (
                    <div key={log.id} className="flex flex-col gap-1.5 pb-3 border-b border-[#C9A84C]/5 last:border-0">
                      <div className="flex justify-between items-center font-body text-[9px]">
                        <span className="text-[#C9A84C] font-bold uppercase tracking-wider">{getStatusText(log.stage)}</span>
                        <span className="text-[#9A8F7E]/40 flex items-center gap-1"><Clock size={9} /> {formatDate(log.created_at)}</span>
                      </div>
                      <p className="font-body text-[10.5px] text-[#9A8F7E] leading-normal">
                        {log.note}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Premium Guarantee */}
            <div className="flex items-start gap-4 p-5 bg-[#161616] border border-[#C9A84C]/10 rounded-lg">
              <ShieldCheck className="text-[#C9A84C] shrink-0 mt-0.5" size={20} />
              <div className="flex flex-col gap-1 select-none">
                <span className="font-accent text-[10px] font-bold text-[#C9A84C] uppercase tracking-wider">Secure Gifting</span>
                <span className="font-body text-[9.5px] text-[#9A8F7E] leading-normal">
                  Our studio signs off on quality checks at each stage. For express shipping queries, connect with our care line.
                </span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
