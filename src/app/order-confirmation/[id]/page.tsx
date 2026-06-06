'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import NextLink from 'next/link';
import { getOrderById, Order, getSettings } from '../../../lib/db';
import { Check, Copy, CheckCircle2, MessageCircle, ShoppingBag, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function OrderConfirmationPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState('+91 99942 03670');

  useEffect(() => {
    async function loadOrder() {
      try {
        const orderData = await getOrderById(orderId);
        setOrder(orderData);
        
        const settings = await getSettings();
        if (settings && settings.whatsapp_number) {
          setWhatsappNumber(settings.whatsapp_number);
        }
      } catch (err) {
        console.error('Error fetching order details:', err);
      } finally {
        setLoading(false);
      }
    }
    if (orderId) {
      loadOrder();
    }
  }, [orderId]);

  const handleCopyId = () => {
    if (order) {
      navigator.clipboard.writeText(order.order_number || order.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getWhatsappLink = () => {
    if (!order) return '';
    const cleanNum = whatsappNumber.replace(/[^\d+]/g, '');
    const text = `Hi Artinova, I placed order #${order.order_number || order.id}. Please verify my manual payment screenshot. Thanks!`;
    return `https://wa.me/${cleanNum}?text=${encodeURIComponent(text)}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center text-[#F5F0E8] font-body select-none">
        <div className="w-8 h-8 rounded-full border-2 border-[#C9A84C]/20 border-t-[#C9A84C] animate-spin mb-4" />
        <span className="font-accent text-[9px] uppercase tracking-widest text-[#9A8F7E]">Retrieving Registry Details...</span>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center text-[#F5F0E8] font-body p-6 text-center select-none">
        <h2 className="font-display text-2xl text-[#C9A84C] mb-2">Registry Entry Not Found</h2>
        <p className="text-xs text-[#9A8F7E] max-w-xs mb-8">This order does not appear in our gifting records.</p>
        <NextLink href="/shop" className="btn-solid-gold py-3 text-[10px]">
          Continue Shopping
        </NextLink>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-36 pb-24 px-6 bg-[#0A0A0A] text-[#F5F0E8] font-body relative overflow-hidden flex items-center">
      {/* Golden backdrop glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[#C9A84C]/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-md w-full mx-auto bg-[#111111] border border-[#C9A84C]/15 p-8 rounded-lg flex flex-col items-center text-center shadow-2xl relative z-10">
        
        {/* Luxury animated checkmark */}
        <div className="relative w-20 h-20 mb-6 flex items-center justify-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="absolute inset-0 rounded-full bg-[#C9A84C]/10 border border-[#C9A84C] filter drop-shadow-[0_0_10px_rgba(201,168,76,0.3)]"
          />
          <svg className="w-10 h-10 text-[#C9A84C]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <motion.path
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.8, delay: 0.2, ease: 'easeInOut' }}
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        {/* Headlines */}
        <span className="font-accent text-[9px] text-[#C9A84C] uppercase tracking-[0.25em] font-bold">Commission Lodged</span>
        <h1 className="font-display text-3xl font-semibold tracking-wide text-[#F5F0E8] mt-2 mb-3">
          Order Placed Successfully!
        </h1>
        <p className="text-[11px] text-[#9A8F7E] leading-relaxed max-w-sm mb-6">
          Thank you for choosing Artinova. Our artisans will review and verify your payment confirmation screenshot within 2 hours.
        </p>

        {/* Copyable Order ID card */}
        <div className="w-full bg-[#0A0A0A] border border-[#C9A84C]/10 rounded p-4 mb-6 flex items-center justify-between font-body text-xs select-none">
          <div className="flex flex-col items-start gap-1">
            <span className="text-[8px] uppercase tracking-widest text-[#9A8F7E] font-bold">Order Number</span>
            <span className="text-[#F5F0E8] font-bold tracking-wider">{order.order_number}</span>
          </div>
          <button
            onClick={handleCopyId}
            className="p-2 text-[#9A8F7E] hover:text-[#C9A84C] border border-transparent hover:border-[#C9A84C]/20 rounded transition-all cursor-pointer"
            title="Copy order number"
          >
            {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
          </button>
        </div>

        {/* CTAs */}
        <div className="flex flex-col gap-3.5 w-full">
          <a
            href={getWhatsappLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-accent text-[10px] font-bold uppercase tracking-[0.2em] rounded transition-all flex items-center justify-center gap-2 hover:shadow-[0_0_15px_rgba(16,185,129,0.35)] cursor-pointer"
          >
            <MessageCircle size={15} /> Get updates on WhatsApp
          </a>

          <div className="grid grid-cols-2 gap-3 w-full mt-1.5">
            <button
              onClick={() => router.push(`/orders/${order.id}`)}
              className="py-3.5 border border-[#C9A84C]/30 text-[#C9A84C] hover:border-[#C9A84C] rounded font-accent text-[9px] uppercase tracking-[0.2em] font-bold hover:bg-[#C9A84C]/5 transition-all text-center cursor-pointer"
            >
              View Order
            </button>
            <button
              onClick={() => router.push('/shop')}
              className="py-3.5 bg-[#C9A84C] text-[#0A0A0A] rounded font-accent text-[9px] uppercase tracking-[0.2em] font-extrabold hover:bg-[#F5F0E8] transition-all flex items-center justify-center gap-1 cursor-pointer"
            >
              Shop More <ArrowRight size={10} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
