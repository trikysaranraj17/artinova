'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import NextLink from 'next/link';
import { getOrderById, getOrderItems, getTrackingUpdates, Order, OrderItem, TrackingUpdate } from '../../../lib/db';
import { useAuthStore } from '../../../store/authStore';
import { ArrowLeft, Calendar, FileText, CheckCircle2, ChevronRight, MessageCircle, MapPin, ClipboardList, ShieldAlert, Image as ImageIcon, X, ZoomIn, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const orderId = resolvedParams.id;
  const { user, isGuest, setLoginModalOpen, isLoading } = useAuthStore();
  const router = useRouter();

  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [trackingLogs, setTrackingLogs] = useState<TrackingUpdate[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [screenshotModalOpen, setScreenshotModalOpen] = useState(false);

  // Authenticate gate
  useEffect(() => {
    if (!isLoading && !user && !isGuest) {
      router.push('/');
      setLoginModalOpen(true);
    }
  }, [user, isGuest, isLoading, router, setLoginModalOpen]);

  // Load order details
  useEffect(() => {
    async function loadOrderDetails() {
      if (orderId) {
        setPageLoading(true);
        try {
          const fetchedOrder = await getOrderById(orderId);
          if (fetchedOrder) {
            setOrder(fetchedOrder);
            const fetchedItems = await getOrderItems(orderId);
            setItems(fetchedItems);
            const fetchedLogs = await getTrackingUpdates(orderId);
            setTrackingLogs(fetchedLogs);
          }
        } catch (err) {
          console.error('Error fetching order details:', err);
        } finally {
          setPageLoading(false);
        }
      }
    }
    loadOrderDetails();
  }, [orderId]);

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

  const activeStepIndex = order ? STATUS_STEPS.findIndex(step => step.key.toLowerCase() === order.order_status.toLowerCase()) : -1;

  const printInvoice = () => {
    if (!order) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    const itemsHtml = items.map(item => `
      <tr>
        <td style="padding: 12px 10px; border-bottom: 1px solid #eeeeee;">
          <div style="font-weight: bold; font-size: 13px;">${item.product_name || 'Bespoke Item'}</div>
          ${item.customization?.engravingText ? `<div style="font-size: 10px; color: #777; margin-top: 3px; font-style: italic;">Engraving: "${item.customization.engravingText}"</div>` : ''}
          ${item.customization?.variantSize ? `<div style="font-size: 9px; color: #888;">Size Swatch: ${item.customization.variantSize}</div>` : ''}
        </td>
        <td style="padding: 12px 10px; border-bottom: 1px solid #eeeeee; text-align: center; font-size: 13px;">${item.quantity}</td>
        <td style="padding: 12px 10px; border-bottom: 1px solid #eeeeee; text-align: right; font-size: 13px;">₹${item.price.toLocaleString()}</td>
        <td style="padding: 12px 10px; border-bottom: 1px solid #eeeeee; text-align: right; font-size: 13px; font-weight: bold;">₹${(item.price * item.quantity).toLocaleString()}</td>
      </tr>
    `).join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice - ${order.order_number}</title>
          <style>
            body { font-family: 'DM Sans', sans-serif; color: #222; margin: 40px; line-height: 1.4; }
            .header { border-bottom: 2px solid #C9A84C; padding-bottom: 20px; }
            .logo { font-family: Georgia, serif; font-size: 26px; color: #0A0A0A; letter-spacing: 5px; font-weight: 300; text-transform: uppercase; }
            .info { margin-top: 30px; display: flex; justify-content: space-between; }
            .info-col { width: 45%; }
            table { width: 100%; border-collapse: collapse; margin-top: 30px; }
            th { background-color: #fcfbfa; padding: 10px; text-align: left; border-bottom: 1px solid #C9A84C; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #B8860B; }
            .totals { margin-top: 30px; text-align: right; width: 40%; margin-left: auto; }
            .totals table { margin-top: 0; }
            .totals td { padding: 6px 10px; font-size: 12px; }
            .footer { margin-top: 60px; text-align: center; font-size: 11px; color: #9A8F7E; border-top: 1px solid #eeeeee; padding-top: 20px; }
          </style>
        </head>
        <body>
          <div style="display:flex; justify-content:space-between; align-items:center;" class="header">
            <div>
              <div class="logo">ARTINOVA</div>
              <div style="font-size: 8px; letter-spacing: 2px; color: #9A8F7E; margin-top:4px;">CRAFTING EMOTIONS INTO LUXURY GIFTS</div>
            </div>
            <div style="text-align: right;">
              <h2 style="margin: 0; font-size: 20px; color:#C9A84C; font-weight: normal; letter-spacing: 2px;">INVOICE</h2>
              <div style="font-size: 12px; margin-top: 5px; color: #444;">Order: <strong>${order.order_number}</strong></div>
              <div style="font-size: 11px; color: #666; margin-top: 2px;">Date: ${formatDate(order.created_at)}</div>
            </div>
          </div>
          
          <div class="info">
            <div class="info-col">
              <h4 style="margin: 0 0 8px 0; font-size: 11px; text-transform: uppercase; color:#B8860B; letter-spacing: 1px;">Recipient Details:</h4>
              <div style="font-size: 13px; font-weight: bold;">${order.shipping_name}</div>
              <div style="font-size: 13px; color:#444; margin-top: 5px; line-height: 1.5;">${order.shipping_address}</div>
              <div style="font-size: 13px; color:#444; margin-top: 4px;">Phone: ${order.shipping_phone}</div>
            </div>
            <div class="info-col" style="text-align: right;">
              <h4 style="margin: 0 0 8px 0; font-size: 11px; text-transform: uppercase; color:#B8860B; letter-spacing: 1px;">Studio Registry:</h4>
              <div style="font-size: 13px; font-weight: bold;">Artinova Premium Gifting</div>
              <div style="font-size: 13px; color:#444; margin-top: 5px;">Chennai, Tamil Nadu, India</div>
              <div style="font-size: 13px; color:#444; margin-top: 3px;">deepaksabari28@gmail.com</div>
            </div>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Bespoke Creation</th>
                <th style="text-align: center; width: 60px;">Qty</th>
                <th style="text-align: right; width: 100px;">Price</th>
                <th style="text-align: right; width: 110px;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
          
          <div class="totals">
            <table style="border:0; width: 100%;">
              <tr>
                <td style="color:#666;">Items Subtotal</td>
                <td style="text-align: right; font-weight: bold;">₹${order.subtotal.toLocaleString()}</td>
              </tr>
              <tr>
                <td style="color:#666;">GST (18% inclusive)</td>
                <td style="text-align: right;">₹${order.gst.toLocaleString()}</td>
              </tr>
              <tr>
                <td style="color:#666;">Shipping Transit</td>
                <td style="text-align: right;">${order.shipping === 0 ? 'Free Shipping' : `₹${order.shipping.toLocaleString()}`}</td>
              </tr>
              <tr style="font-size: 15px; border-top: 1px solid #C9A84C;">
                <td style="font-weight: bold; color:#0A0A0A; padding-top: 10px;">Total Amount Paid</td>
                <td style="text-align: right; font-weight: bold; color:#B8860B; padding-top: 10px; font-size: 16px;">₹${order.total.toLocaleString()}</td>
              </tr>
            </table>
          </div>
          
          <div class="footer">
            <p>Thank you for placing your trust in our custom workshop. We craft every luxury detail to celebrate your connections.</p>
            <p style="margin-top: 20px; color:#aaa; font-size:9px;">Generated electronically via Artinova Studio.</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    // Wait for content loading to print
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  if (isLoading || pageLoading) {
    return (
      <div className="min-h-screen py-20 bg-[#0A0A0A] flex flex-col items-center justify-center gap-4 text-xs font-body text-[#9A8F7E]/50 select-none">
        <Loader2 className="animate-spin text-[#C9A84C]" size={28} />
        <span className="font-accent text-[#C9A84C] tracking-[0.25em] uppercase">Opening Order Logs...</span>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen py-24 px-6 bg-[#0A0A0A] flex flex-col items-center justify-center gap-6 text-center select-none">
        <h3 className="font-display italic text-lg text-[#C9A84C]">Order record not found</h3>
        <p className="text-xs text-[#9A8F7E] max-w-xs leading-relaxed">
          The requested order reference ID does not exist in our secure database.
        </p>
        <NextLink
          href="/orders"
          className="btn-solid-gold py-3 px-8 text-[10px] uppercase font-bold tracking-widest rounded"
        >
          Return to History
        </NextLink>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-40 pb-24 px-6 bg-[#0A0A0A] text-[#F5F0E8] font-body relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-[#C9A84C]/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Screenshot inspection modal */}
      <AnimatePresence>
        {screenshotModalOpen && order.payment_screenshot_url && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[3000] bg-[#0A0A0A]/95 backdrop-blur-md flex flex-col items-center justify-center p-6"
            onClick={() => setScreenshotModalOpen(false)}
          >
            <div className="absolute top-6 right-6 select-none">
              <button
                onClick={() => setScreenshotModalOpen(false)}
                className="p-2.5 bg-[#111111] border border-[#C9A84C]/20 hover:border-[#C9A84C] text-[#F5F0E8] rounded-full transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>
            
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="relative max-w-lg max-h-[80vh] w-full flex items-center justify-center bg-[#111111] border border-[#C9A84C]/15 rounded p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={order.payment_screenshot_url}
                alt="UPI Transaction Slip"
                className="object-contain max-w-full max-h-[70vh] rounded shadow-2xl"
              />
            </motion.div>
            <span className="font-accent text-[9px] text-[#9A8F7E] uppercase tracking-widest mt-4">Manual Payment screenshot uploader</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-4xl mx-auto relative z-10">
        
        {/* Back Link */}
        <NextLink
          href="/orders"
          className="inline-flex items-center gap-2 text-xs font-accent uppercase tracking-widest text-[#9A8F7E] hover:text-[#C9A84C] mb-8 transition-colors select-none"
        >
          <ArrowLeft size={13} /> Back to History
        </NextLink>

        {/* Header Summary */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-12 select-none border-b border-[#C9A84C]/10 pb-6">
          <div className="flex flex-col gap-2">
            <span className="font-accent text-[9px] text-[#C9A84C] uppercase tracking-[0.25em]">Registry Archives</span>
            <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-wide text-[#F5F0E8] leading-none">
              Order #{order.order_number}
            </h1>
            <div className="flex items-center gap-4 text-xs text-[#9A8F7E] mt-1">
              <span>Date: {formatDate(order.created_at)}</span>
              <span>&bull;</span>
              <span>Total Paid: ₹{order.total.toLocaleString()}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={printInvoice}
              className="px-4 py-2.5 bg-[#111111] border border-[#C9A84C]/25 text-[#C9A84C] hover:border-[#C9A84C] hover:bg-[#C9A84C]/5 font-accent text-[9px] uppercase tracking-widest font-extrabold rounded flex items-center gap-2 transition-all duration-300 cursor-pointer shadow-md"
            >
              <FileText size={13} /> Download Invoice
            </button>
            <span className={`border px-4 py-2.5 rounded text-[9px] uppercase tracking-widest font-extrabold ${getStatusBadgeStyle(order.order_status)} shadow-md`}>
              {getStatusText(order.order_status)}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Items details + Timeline */}
          <div className="lg:col-span-8 flex flex-col gap-8">
            
            {/* Custom Creations card list */}
            <div className="bg-[#111111] border border-[#C9A84C]/10 p-6 rounded-lg shadow-xl">
              <h3 className="font-accent text-xs font-bold uppercase tracking-widest text-[#C9A84C] border-b border-[#C9A84C]/5 pb-4 mb-4 select-none">
                Bespoke Creations
              </h3>

              <div className="flex flex-col gap-6">
                {items.map((item) => (
                  <div key={item.id} className="flex flex-col gap-4 border-b border-[#C9A84C]/5 last:border-0 pb-6 last:pb-0">
                    <div className="flex gap-4 items-start justify-between">
                      <div className="flex gap-4 items-start min-w-0">
                        <div className="relative w-14 h-14 rounded border border-[#C9A84C]/10 overflow-hidden bg-[#0A0A0A] shrink-0">
                          <img src={item.product?.images[0]} alt={item.product_name} className="object-cover w-full h-full" />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <h4 className="font-display text-base font-bold text-[#F5F0E8] truncate leading-tight">{item.product_name || 'Bespoke Creation'}</h4>
                          <span className="font-body text-[10px] text-[#C9A84C] font-bold mt-1">₹{item.price?.toLocaleString()} each</span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="font-body text-xs font-bold text-[#9A8F7E]/60">Qty: {item.quantity}</div>
                        <div className="font-body text-sm font-bold text-[#C9A84C] mt-1">₹{(item.price * item.quantity).toLocaleString()}</div>
                      </div>
                    </div>

                    {/* Custom options info block */}
                    {item.customization && (Object.keys(item.customization).length > 0) && (
                      <div className="p-4 rounded bg-[#0A0A0A]/60 border border-[#C9A84C]/10 flex flex-col gap-2 text-[10px] font-accent uppercase tracking-wider text-[#9A8F7E]">
                        <span className="text-[#C9A84C] font-bold text-[9px] border-b border-[#C9A84C]/5 pb-1 mb-1">Tailored Specifications</span>
                        {item.customization.engravingText && (
                          <div className="flex justify-between items-start">
                            <span>Text Message Engraving:</span>
                            <span className="normal-case text-white font-body text-right max-w-[60%] italic">&ldquo;{item.customization.engravingText}&rdquo;</span>
                          </div>
                        )}
                        {item.customization.variantSize && (
                          <div className="flex justify-between items-center mt-1">
                            <span>Size Swatch:</span>
                            <span className="text-white text-right">{item.customization.variantSize}</span>
                          </div>
                        )}
                        {item.customization.photoUrl && (
                          <div className="flex justify-between items-center mt-1">
                            <span>Custom memory Photo:</span>
                            <span className="text-emerald-400 font-extrabold">Uploaded & Embedded ✓</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Tracking timeline */}
            <div className="bg-[#111111] border border-[#C9A84C]/10 p-6 rounded-lg shadow-xl">
              <h3 className="font-accent text-xs font-bold uppercase tracking-widest text-[#C9A84C] border-b border-[#C9A84C]/5 pb-4 mb-6 select-none">
                Workshop Progress Track
              </h3>

              <div className="relative pl-4 flex flex-col gap-6">
                <div className="absolute left-[15px] top-3 bottom-3 w-[2px] bg-[#0A0A0A] border-l border-[#C9A84C]/10" />
                {activeStepIndex !== -1 && (
                  <div 
                    className="absolute left-[15px] top-3 w-[2px] bg-[#C9A84C] transition-all duration-1000 shadow-[0_0_8px_rgba(201,168,76,0.4)]"
                    style={{ height: `${(activeStepIndex / (STATUS_STEPS.length - 1)) * 86}%` }}
                  />
                )}

                {STATUS_STEPS.map((step, idx) => {
                  const isCompleted = idx < activeStepIndex;
                  const isActive = idx === activeStepIndex;

                  return (
                    <div key={step.key} className="flex gap-4 items-start relative z-10 select-none">
                      <div className="w-8 h-8 rounded-full border bg-[#111111] flex items-center justify-center shrink-0">
                        {isCompleted ? (
                          <div className="w-8 h-8 rounded-full border border-[#C9A84C] bg-[#C9A84C]/10 text-[#C9A84C] flex items-center justify-center">
                            <CheckCircle2 size={13} />
                          </div>
                        ) : isActive ? (
                          <div className="w-8 h-8 rounded-full border-2 border-[#C9A84C] bg-[#C9A84C]/25 flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-[#C9A84C] animate-pulse" />
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-full border border-[#C9A84C]/10 bg-[#0A0A0A] flex items-center justify-center text-[#9A8F7E]/30 text-[9px] font-bold">
                            {idx + 1}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className={`font-accent text-xs font-bold ${isActive ? 'text-[#C9A84C]' : isCompleted ? 'text-[#C9A84C]/85' : 'text-[#9A8F7E]/40'}`}>
                          {step.label}
                        </span>
                        <span className="font-body text-[10px] text-[#9A8F7E]/75 leading-relaxed">{step.desc}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Right Column: Address, Invoice Summary, Screenshot */}
          <div className="lg:col-span-4 flex flex-col gap-6 select-none">
            
            {/* Delivery address card */}
            <div className="bg-[#111111] border border-[#C9A84C]/10 p-6 rounded-lg shadow-xl">
              <h3 className="font-accent text-xs font-bold uppercase tracking-widest text-[#C9A84C] border-b border-[#C9A84C]/5 pb-4 mb-4">
                Delivery Address
              </h3>
              <div className="flex flex-col gap-2 text-xs font-body">
                <span className="font-bold text-[#F5F0E8]">{order.shipping_name}</span>
                <span className="text-[#9A8F7E] leading-relaxed">{order.shipping_address}</span>
                <span className="text-[#9A8F7E]/70 mt-1 font-bold">Phone: {order.shipping_phone}</span>
              </div>
            </div>

            {/* Price invoice summary */}
            <div className="bg-[#111111] border border-[#C9A84C]/10 p-6 rounded-lg shadow-xl flex flex-col gap-4">
              <h3 className="font-accent text-xs font-bold uppercase tracking-widest text-[#C9A84C] border-b border-[#C9A84C]/5 pb-4">
                Receipt breakdown
              </h3>
              <div className="flex flex-col gap-2.5 text-xs font-body text-[#9A8F7E]">
                <div className="flex justify-between">
                  <span>Trunk Subtotal</span>
                  <span>₹{order.subtotal?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>GST (18%)</span>
                  <span>₹{order.gst?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping Courier</span>
                  {order.shipping === 0 ? (
                    <span className="text-emerald-400 font-accent text-[9px] uppercase tracking-widest font-bold">Free Shipping</span>
                  ) : (
                    <span>₹{order.shipping?.toLocaleString()}</span>
                  )}
                </div>
                <div className="h-[1px] bg-[#C9A84C]/15 my-1.5" />
                <div className="flex justify-between items-end text-[#F5F0E8] font-bold">
                  <span className="font-accent text-xs uppercase tracking-widest text-[#C9A84C]">Total Paid</span>
                  <span className="text-base text-[#C9A84C]">₹{order.total?.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Payment receipt screenshot uploader preview (Customer check only) */}
            {order.payment_screenshot_url && (
              <div className="bg-[#111111] border border-[#C9A84C]/10 p-6 rounded-lg shadow-xl flex flex-col gap-4">
                <h3 className="font-accent text-xs font-bold uppercase tracking-widest text-[#C9A84C] border-b border-[#C9A84C]/5 pb-4">
                  Payment Slip Log
                </h3>
                <p className="font-body text-[9.5px] text-[#9A8F7E] leading-relaxed">
                  Your GPay screenshot has been logged. Clicking the preview expands verification details.
                </p>

                <div 
                  onClick={() => setScreenshotModalOpen(true)}
                  className="relative group w-full h-32 rounded border border-[#C9A84C]/15 bg-[#0A0A0A] overflow-hidden flex items-center justify-center cursor-zoom-in"
                >
                  <img
                    src={order.payment_screenshot_url}
                    alt="Slip preview"
                    className="object-contain max-h-full max-w-full transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-[#C9A84C] font-accent text-[9px] font-bold uppercase tracking-widest">
                    <ZoomIn size={12} /> Inspect Slip
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}
