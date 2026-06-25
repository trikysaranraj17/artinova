'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import NextLink from 'next/link';
import { useAuthStore } from '../../store/authStore';
import { getOrders, Order, getOrderItems, OrderItem } from '../../lib/db';
import { Package, Clock, Eye, ChevronRight, ArrowLeft, Loader2, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

export default function OrdersHistoryPage() {
  const { user, isGuest, setLoginModalOpen, isLoading } = useAuthStore();
  const router = useRouter();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [orderItemsMap, setOrderItemsMap] = useState<Record<string, OrderItem[]>>({});

  // Authenticate gate
  useEffect(() => {
    if (!isLoading && !user && !isGuest) {
      router.push('/login');
    }
  }, [user, isGuest, isLoading, router]);

  // Load orders
  useEffect(() => {
    async function loadData() {
      if (user) {
        setOrdersLoading(true);
        try {
          const userOrders = await getOrders(user.id);
          setOrders(userOrders);
          
          // Load items for each order
          const itemsMap: Record<string, OrderItem[]> = {};
          await Promise.all(
            userOrders.map(async (order) => {
              const items = await getOrderItems(order.id);
              itemsMap[order.id] = items;
            })
          );
          setOrderItemsMap(itemsMap);
        } catch (err) {
          console.error('Error loading order history:', err);
        } finally {
          setOrdersLoading(false);
        }
      }
    }
    loadData();
  }, [user]);

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

  const getDeliveryEstimate = (createdAt: string) => {
    try {
      const date = new Date(createdAt);
      date.setDate(date.getDate() + 7);
      return formatDate(date.toISOString());
    } catch (e) {
      return '5-7 business days';
    }
  };

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'received':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'verified':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'design':
        return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
      case 'crafting':
        return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      case 'quality':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'packaging':
        return 'bg-pink-500/10 text-pink-400 border-pink-500/20';
      case 'shipped':
        return 'bg-violet-500/10 text-violet-400 border-violet-500/20';
      case 'delivered':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      default:
        return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'received': return 'Payment Pending';
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

  if (isLoading || ordersLoading) {
    return (
      <div className="min-h-screen py-20 bg-[#0A0A0A] flex flex-col items-center justify-center gap-4 text-xs font-body text-[#9A8F7E]/50 select-none">
        <Loader2 className="animate-spin text-[#C9A84C]" size={28} />
        <span className="font-accent text-[#C9A84C] tracking-[0.25em] uppercase">Opening Gifting Registry...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-8 md:pt-16 pb-24 px-6 bg-[#0A0A0A] text-[#F5F0E8] font-body relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-[#C9A84C]/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10">
        
        {/* Navigation back */}
        <NextLink
          href="/profile"
          className="inline-flex items-center gap-2 text-xs font-accent uppercase tracking-widest text-[#9A8F7E] hover:text-[#C9A84C] mb-10 transition-colors"
        >
          <ArrowLeft size={13} /> Back to Profile
        </NextLink>

        {/* Title */}
        <div className="flex flex-col gap-2 mb-12 select-none">
          <span className="font-accent text-[9px] text-[#C9A84C] uppercase tracking-[0.25em]">Registry Records</span>
          <h1 className="font-display text-4xl sm:text-5xl font-semibold tracking-wide text-[#F5F0E8] leading-tight">
            Order Logs
          </h1>
          <div className="w-12 h-[1px] bg-[#C9A84C] mt-2" />
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-20 bg-[#111111] border border-[#C9A84C]/10 rounded-lg flex flex-col items-center gap-6 p-8 shadow-xl max-w-xl mx-auto">
            <div className="w-16 h-16 rounded-full border border-[#C9A84C]/25 flex items-center justify-center text-[#C9A84C] opacity-50">
              <Package size={28} />
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="font-display italic text-lg text-[#C9A84C]">No orders found</h3>
              <p className="text-xs text-[#9A8F7E] max-w-xs leading-relaxed">
                You haven&apos;t placed any custom handcrafted orders yet. Build a trunk selection to start.
              </p>
            </div>
            <NextLink
              href="/shop"
              className="btn-solid-gold py-3 px-8 text-[10px] uppercase font-bold tracking-widest rounded"
            >
              Start Customizing
            </NextLink>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {orders.map((order) => {
              const items = orderItemsMap[order.id] || [];
              return (
                <div
                  key={order.id}
                  className="bg-[#111111] border border-[#C9A84C]/10 p-6 rounded-lg flex flex-col gap-5 hover:border-[#C9A84C]/35 transition-all duration-300 shadow-lg"
                >
                  {/* Head Bar */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-[#C9A84C]/10 select-none">
                    <div className="flex flex-col gap-1 min-w-0">
                      <span className="font-accent text-[9px] uppercase tracking-wider text-[#9A8F7E] font-bold">
                        Order Ref: {order.order_number}
                      </span>
                      <div className="flex flex-wrap items-center gap-4 text-xs text-[#9A8F7E]/70 mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar size={12} className="text-[#C9A84C]/70" />
                          {formatDate(order.created_at)}
                        </span>
                        <span className="font-bold text-[#C9A84C]">
                          Total: ₹{order.total.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <span className={`border px-3 py-1 rounded text-[9px] uppercase tracking-widest font-extrabold ${getStatusBadgeStyle(order.order_status)}`}>
                      {getStatusText(order.order_status)}
                    </span>
                  </div>

                  {/* Items Display */}
                  <div className="flex flex-col gap-3.5 select-none">
                    {items.map((item) => (
                      <div key={item.id} className="flex gap-4 items-center justify-between">
                        <div className="flex gap-4 items-center min-w-0">
                          <img
                            src={item.product?.images[0] || 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=300'}
                            alt={item.product_name}
                            className="w-12 h-12 rounded object-cover border border-[#C9A84C]/10 bg-[#0A0A0A] shrink-0"
                          />
                          <div className="flex flex-col min-w-0">
                            <span className="font-display text-sm font-bold text-[#F5F0E8] truncate">{item.product_name || 'Bespoke Custom Gifting'}</span>
                            <span className="font-body text-[10px] text-[#9A8F7E]/70 mt-0.5">Quantity: {item.quantity} &bull; ₹{item.price?.toLocaleString()} each</span>
                          </div>
                        </div>
                        <span className="font-body text-xs font-bold text-[#C9A84C] shrink-0">₹{(item.price * item.quantity).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>

                  {/* Footer Row */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-2 border-t border-[#C9A84C]/5 pt-4">
                    <span className="font-body text-[10px] text-[#9A8F7E]/50">
                      Estimate Delivery: {getDeliveryEstimate(order.created_at)}
                    </span>
                    <button
                      onClick={() => router.push(`/orders/${order.id}`)}
                      className="px-5 py-2.5 border border-[#C9A84C]/40 hover:border-[#C9A84C] bg-[#C9A84C]/5 hover:bg-[#C9A84C] hover:text-[#0A0A0A] text-[#C9A84C] rounded font-accent text-[9px] uppercase tracking-widest font-extrabold transition-all duration-300 flex items-center gap-1.5 cursor-pointer"
                    >
                      View Order Details <ChevronRight size={12} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
