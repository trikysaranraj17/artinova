'use client';

import React, { useState, useEffect } from 'react';
import NextLink from 'next/link';
import { useAuthStore } from '../../store/authStore';
import { 
  getProducts, createProduct, updateProduct, deleteProduct, Product,
  getOrders, updateOrderStatus, getOrderItems, Order, OrderItem,
  getSettings, updateSettings, getTrackingUpdates, createTrackingUpdate
} from '../../lib/db';
import { sendEmailTrigger } from '../../lib/email';
import { 
  Plus, Trash2, Edit2, ShieldAlert, Package, ShoppingBag, 
  Users, Upload, Eye, X, Check, ArrowRight, Loader2, Sparkles, 
  TrendingUp, BarChart3, Settings, Truck, CreditCard, PieChart, 
  Download, FileText, CheckCircle2, AlertCircle, RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Recharts components imports
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, 
  BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell 
} from 'recharts';

const STEPS = [
  { key: 'received', label: 'Order Received' },
  { key: 'verified', label: 'Payment Verified' },
  { key: 'design', label: 'Design Confirmed' },
  { key: 'crafting', label: 'Crafting Started' },
  { key: 'quality', label: 'Quality Check' },
  { key: 'packaging', label: 'Packaging' },
  { key: 'shipped', label: 'Shipped' },
  { key: 'delivered', label: 'Delivered' }
];

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

export default function AdminDashboardPage() {
  const { user, isAdmin, setLoginModalOpen, loginWithGoogle, logout } = useAuthStore();
  
  const [isMounted, setIsMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<
    'overview' | 'products' | 'orders' | 'customers' | 'tracking' | 'payments' | 'analytics' | 'settings'
  >('overview');
  
  // Data states
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [settings, setSettings] = useState<any>({});
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states (Add/Edit Product)
  const [showProductForm, setShowProductForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [pName, setPName] = useState('');
  const [pSlug, setPSlug] = useState('');
  const [pPrice, setPPrice] = useState('');
  const [pOriginalPrice, setPOriginalPrice] = useState('');
  const [pDescription, setPDescription] = useState('');
  const [pCategory, setPCategory] = useState('cat-art');
  const [pStock, setPStock] = useState('10');
  const [pCustomizable, setPCustomizable] = useState(false);
  const [pCustomFields, setPCustomFields] = useState<Array<{ name: string; type: string; required: boolean }>>([]);
  const [pFeatured, setPFeatured] = useState(false);
  const [pActive, setPActive] = useState(true);
  const [pImages, setPImages] = useState<string[]>([]);
  const [pMetaTitle, setPMetaTitle] = useState('');
  const [pMetaDescription, setPMetaDescription] = useState('');
  const [uploadError, setUploadError] = useState<string | null>(null);
  
  // Expand Order Details
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [expandedOrderItems, setExpandedOrderItems] = useState<OrderItem[]>([]);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [internalNotes, setInternalNotes] = useState('');
  const [courierName, setCourierName] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  
  // View Screenshot Modal
  const [activeScreenshot, setActiveScreenshot] = useState<string | null>(null);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [selectedRejectOrderId, setSelectedRejectOrderId] = useState<string | null>(null);

  // Settings form states
  const [setUpiId, setSetUpiId] = useState('');
  const [setQrUrl, setSetQrUrl] = useState('');
  const [setWaNumber, setSetWaNumber] = useState('');
  const [setGstRate, setSetGstRate] = useState('');
  const [setThreshold, setSetThreshold] = useState('');

  // Hydration fix
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Fetch initial data
  const loadDashboardData = async (showLoading = true) => {
    if (isAdmin) {
      if (showLoading) setLoading(true);
      try {
        const prods = await getProducts();
        const ords = await getOrders();
        const config = await getSettings();
        
        setProducts(prods);
        setOrders(ords);
        setSettings(config);

        // Map settings fields
        setSetUpiId(config.gpay_upi_id || 'artinova@upi');
        setSetQrUrl(config.gpay_qr_url || '');
        setSetWaNumber(config.whatsapp_number || '+91 99942 03670');
        setSetGstRate(config.gst_rate || '18');
        setSetThreshold(config.free_shipping_threshold || '999');

        // Compile customer list from registered users and orders
        if (typeof window !== 'undefined') {
          const registered = JSON.parse(localStorage.getItem('artinova_registered_users') || '[]');
          const customersList = registered.map((u: any) => {
            const userOrders = ords.filter(o => o.user_id === u.id);
            const totalSpent = userOrders.reduce((sum, o) => sum + o.total, 0);
            return {
              ...u,
              ordersCount: userOrders.length,
              totalSpent,
              joined: u.created_at || new Date().toISOString()
            };
          });
          setCustomers(customersList);
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        if (showLoading) setLoading(false);
      }
    }
  };

  useEffect(() => {
    loadDashboardData(true);
  }, [isAdmin]);

  const handleExpandOrder = async (orderId: string) => {
    if (expandedOrderId === orderId) {
      setExpandedOrderId(null);
      setExpandedOrderItems([]);
      return;
    }

    setExpandedOrderId(orderId);
    setItemsLoading(true);
    try {
      const orderData = orders.find(o => o.id === orderId);
      if (orderData) {
        setInternalNotes(orderData.admin_notes || '');
        setCourierName(orderData.courier || '');
        setTrackingNumber(orderData.tracking_number || '');
      }
      const orderItems = await getOrderItems(orderId);
      setExpandedOrderItems(orderItems);
    } catch (err) {
      console.error(err);
    } finally {
      setItemsLoading(false);
    }
  };

  // UPI settings save
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateSettings('gpay_upi_id', setUpiId);
      await updateSettings('gpay_qr_url', setQrUrl);
      await updateSettings('whatsapp_number', setWaNumber);
      await updateSettings('gst_rate', setGstRate);
      await updateSettings('free_shipping_threshold', setThreshold);
      
      alert('Artinova system configuration updated successfully.');
      loadDashboardData(false);
    } catch (err) {
      console.error(err);
    }
  };

  // Convert Product Image to Base64
  const handleProductImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image size exceeds 5MB limit.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setPImages([reader.result as string]);
    };
    reader.onerror = () => {
      setUploadError('Failed to read image file.');
    };
    reader.readAsDataURL(file);
  };

  const addCustomField = () => {
    setPCustomFields([...pCustomFields, { name: '', type: 'text', required: true }]);
  };

  const removeCustomField = (idx: number) => {
    setPCustomFields(pCustomFields.filter((_, i) => i !== idx));
  };

  const updateCustomField = (idx: number, field: string, val: any) => {
    const updated = [...pCustomFields];
    updated[idx] = { ...updated[idx], [field]: val };
    setPCustomFields(updated);
  };

  // Product submit logic
  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pName || !pPrice) return;

    const payload = {
      name: pName,
      slug: pSlug || pName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
      description: pDescription,
      price: parseFloat(pPrice),
      original_price: pOriginalPrice ? parseFloat(pOriginalPrice) : undefined,
      category_id: pCategory,
      stock: parseInt(pStock, 10),
      is_customizable: pCustomizable,
      customization_fields: pCustomizable ? pCustomFields : [],
      is_featured: pFeatured,
      is_active: pActive,
      meta_title: pMetaTitle,
      meta_description: pMetaDescription
    };

    try {
      if (isEditing && editId) {
        await updateProduct(editId, payload, pImages);
      } else {
        await createProduct(payload, pImages);
      }
      resetProductForm();
      loadDashboardData(false);
      alert('Product catalog successfully updated.');
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditProductInit = (prod: Product) => {
    setPName(prod.name);
    setPSlug(prod.slug);
    setPPrice(prod.price.toString());
    setPOriginalPrice(prod.original_price?.toString() || '');
    setPDescription(prod.description);
    setPCategory(prod.category_id || 'cat-art');
    setPStock(prod.stock.toString());
    setPCustomizable(prod.is_customizable);
    setPCustomFields(prod.customization_fields || []);
    setPFeatured(prod.is_featured);
    setPActive(prod.is_active);
    setPImages(prod.images || []);
    setPMetaTitle(prod.meta_title || '');
    setPMetaDescription(prod.meta_description || '');
    setIsEditing(true);
    setEditId(prod.id);
    setShowProductForm(true);
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm('Permanently delete this product from catalog?')) {
      await deleteProduct(id);
      loadDashboardData(false);
    }
  };

  const resetProductForm = () => {
    setPName('');
    setPSlug('');
    setPPrice('');
    setPOriginalPrice('');
    setPDescription('');
    setPCategory('cat-art');
    setPStock('10');
    setPCustomizable(false);
    setPCustomFields([]);
    setPFeatured(false);
    setPActive(true);
    setPImages([]);
    setPMetaTitle('');
    setPMetaDescription('');
    setIsEditing(false);
    setEditId(null);
    setShowProductForm(false);
  };

  // Payment review controls
  const handleVerifyPayment = async (orderId: string) => {
    try {
      const orderData = orders.find(o => o.id === orderId);
      if (!orderData) return;
      
      const ok = await updateOrderStatus(
        orderId, 
        'verified', 
        'verified', 
        orderData.courier, 
        orderData.tracking_number, 
        internalNotes
      );
      if (ok) {
        // Send email trigger
        const orderItems = await getOrderItems(orderId);
        await sendEmailTrigger(orderData, orderItems, 'verified', orderData.shipping_email || '');
        
        alert('GPay Payment approved. Client notified.');
        loadDashboardData(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRejectPaymentClick = (orderId: string) => {
    setSelectedRejectOrderId(orderId);
    setRejectModalOpen(true);
  };

  const handleConfirmRejectPayment = async () => {
    if (!selectedRejectOrderId) return;
    try {
      const orderData = orders.find(o => o.id === selectedRejectOrderId);
      if (!orderData) return;

      const ok = await updateOrderStatus(
        selectedRejectOrderId, 
        'received', 
        'rejected', 
        orderData.courier, 
        orderData.tracking_number, 
        `Payment Rejected: ${rejectReason}`
      );
      if (ok) {
        // Send rejection email trigger
        const orderItems = await getOrderItems(selectedRejectOrderId);
        await sendEmailTrigger(orderData, orderItems, 'rejected', orderData.shipping_email || '', { reason: rejectReason });
        
        alert('GPay Payment rejected. Client email notification sent.');
        setRejectModalOpen(false);
        setRejectReason('');
        setSelectedRejectOrderId(null);
        loadDashboardData(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Advancing tracking stages
  const handleUpdatePipeline = async (orderId: string, stage: string) => {
    try {
      const orderData = orders.find(o => o.id === orderId);
      if (!orderData) return;

      const ok = await updateOrderStatus(
        orderId, 
        stage, 
        orderData.payment_status, 
        courierName, 
        trackingNumber, 
        internalNotes
      );
      
      if (ok) {
        const orderItems = await getOrderItems(orderId);
        
        // Trigger shipment or delivery emails
        if (stage === 'shipped') {
          await sendEmailTrigger(orderData, orderItems, 'shipped', orderData.shipping_email || '', {
            trackingNumber,
            courier: courierName
          });
        } else if (stage === 'delivered') {
          await sendEmailTrigger(orderData, orderItems, 'delivered', orderData.shipping_email || '');
        }

        alert(`Logistics stage advanced to: ${stage}`);
        loadDashboardData(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Export Customer List CSV
  const handleExportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'Name,Email,Phone,Orders Count,Total Spent,Joined Date\r\n';
    
    customers.forEach(c => {
      csvContent += `"${c.full_name}","${c.email}","${c.phone || ''}",${c.ordersCount},${c.totalSpent},"${new Date(c.joined).toLocaleDateString()}"\r\n`;
    });
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `artinova_customers_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] text-[#F5F0E8] flex flex-col items-center justify-center p-6 relative overflow-hidden font-body select-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full bg-[#C9A84C]/5 blur-[90px] pointer-events-none" />
        
        <div className="max-w-sm w-full bg-[#111111] border border-[#C9A84C]/15 rounded-xl p-8 flex flex-col items-center text-center shadow-2xl relative">
          <div className="w-16 h-16 rounded-full bg-[#C9A84C]/10 border border-[#C9A84C] flex items-center justify-center text-[#C9A84C] mb-6">
            <ShieldAlert size={28} />
          </div>

          <h2 className="font-accent text-lg font-bold tracking-widest text-[#C9A84C] mb-2 uppercase">
            Admin Panel Access
          </h2>
          <p className="text-xs text-[#9A8F7E] leading-relaxed mb-8 max-w-[260px]">
            Please authenticate using authorized credentials to open the Artinova management dashboard.
          </p>

          <button
            onClick={loginWithGoogle}
            className="w-full bg-[#C9A84C] text-[#0A0A0A] py-3.5 px-6 rounded font-accent text-[10px] font-bold uppercase tracking-widest hover:bg-[#F5F0E8] transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-lg"
          >
            Authenticate with Google
          </button>
        </div>
      </div>
    );
  }

  // Analytics variables
  const totalSales = orders.reduce((sum, o) => sum + o.total, 0);
  const totalOrdersCount = orders.length;
  const productsCount = products.length;
  const pendingPayments = orders.filter(o => o.payment_status === 'pending').length;
  
  // Chart datasets
  const salesHistoryData = orders
    .map(o => ({
      date: new Date(o.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      amount: o.total
    }))
    .reverse()
    .slice(0, 15);

  const categoriesData = [
    { name: 'Frames', value: products.filter(p => p.category_id === 'cat-frames').length },
    { name: 'Hampers', value: products.filter(p => p.category_id === 'cat-hampers').length },
    { name: 'Resin Art', value: products.filter(p => p.category_id === 'cat-art').length },
    { name: 'Custom', value: products.filter(p => p.category_id === 'cat-keepsakes' || p.category_id === 'cat-accessories').length }
  ];

  const COLORS = ['#C9A84C', '#B8860B', '#9A8F7E', '#161616'];

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F5F0E8] flex flex-col font-body">
      
      {/* Top Header */}
      <header className="w-full py-4 px-6 md:px-12 flex items-center justify-between border-b border-[#C9A84C]/15 bg-[#111111]/90 backdrop-blur-md z-[50] select-none">
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <span className="font-accent text-sm font-bold tracking-widest text-[#C9A84C] leading-none">ARTINOVA</span>
            <span className="font-accent text-[8px] uppercase tracking-[0.25em] text-[#9A8F7E] mt-1">Management Desk</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <span className="hidden md:inline text-[10px] text-[#9A8F7E] font-bold">{user?.email}</span>
            <button
              onClick={logout}
              className="text-[9px] font-accent font-bold uppercase tracking-widest text-[#9A8F7E] hover:text-red-400 transition-colors cursor-pointer border border-[#9A8F7E]/20 hover:border-red-400/30 px-3 py-1.5 rounded"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <div className="flex-grow flex w-full relative">
        
        {/* Sidebar Nav */}
        <aside className="hidden lg:flex w-64 bg-[#111111] border-r border-[#C9A84C]/10 p-6 flex-col justify-between shrink-0 select-none">
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-3 pb-6 border-b border-[#C9A84C]/10">
              <div className="w-9 h-9 rounded bg-[#C9A84C]/10 border border-[#C9A84C]/35 flex items-center justify-center text-[#C9A84C] text-sm font-bold">
                {user?.full_name?.charAt(0) || 'A'}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-[#F5F0E8] truncate">{user?.full_name || 'Admin'}</span>
                <span className="text-[9px] uppercase tracking-widest text-[#C9A84C] font-bold mt-0.5">Control Tower</span>
              </div>
            </div>

            <nav className="flex flex-col gap-1.5">
              {[
                { id: 'overview', name: 'Overview', icon: <BarChart3 size={14} /> },
                { id: 'products', name: 'Products', icon: <Package size={14} /> },
                { id: 'orders', name: 'Orders', icon: <ShoppingBag size={14} /> },
                { id: 'customers', name: 'Customers', icon: <Users size={14} /> },
                { id: 'tracking', name: 'Tracking', icon: <Truck size={14} /> },
                { id: 'payments', name: 'Payments', icon: <CreditCard size={14} /> },
                { id: 'analytics', name: 'Analytics', icon: <PieChart size={14} /> },
                { id: 'settings', name: 'Settings', icon: <Settings size={14} /> }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded text-xs font-accent uppercase tracking-wider transition-all border text-left cursor-pointer ${
                    activeTab === tab.id
                      ? 'bg-[#C9A84C]/10 text-[#C9A84C] border-[#C9A84C]/30 font-bold'
                      : 'text-[#9A8F7E] hover:bg-[#C9A84C]/5 hover:text-[#F5F0E8] border-transparent'
                  }`}
                >
                  {tab.icon}
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* Content body container */}
        <main className="flex-grow p-6 md:p-8 overflow-y-auto max-w-full">
          
          {/* Zoomed Screenshot Overlay Modal */}
          <AnimatePresence>
            {activeScreenshot && (
              <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-[#0A0A0A]/95 backdrop-blur-md">
                <div className="absolute inset-0" onClick={() => setActiveScreenshot(null)} />
                <div className="relative max-w-lg max-h-[85vh] z-10 flex flex-col items-center gap-4 bg-[#111111] p-4 rounded border border-[#C9A84C]/20">
                  <button
                    onClick={() => setActiveScreenshot(null)}
                    className="absolute top-4 right-4 p-2 rounded-full bg-[#0A0A0A]/80 border border-[#C9A84C]/20 text-[#F5F0E8] hover:text-[#C9A84C] cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                  <img
                    src={activeScreenshot}
                    alt="Payment Slip Log"
                    className="object-contain max-h-[70vh] rounded"
                  />
                  <span className="font-accent text-[9px] text-[#C9A84C] uppercase tracking-widest">GPay verification token slip</span>
                </div>
              </div>
            )}
          </AnimatePresence>

          {/* Payment Rejection Comment Modal */}
          <AnimatePresence>
            {rejectModalOpen && (
              <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-[#0A0A0A]/90 backdrop-blur-md">
                <div className="bg-[#111111] border border-red-500/20 max-w-md w-full p-6 rounded-lg flex flex-col gap-4 shadow-2xl">
                  <h3 className="font-accent text-xs font-bold uppercase tracking-widest text-red-400">Suspend Payment Verification</h3>
                  <p className="text-xs text-[#9A8F7E] leading-relaxed">
                    Provide the rationale for payment rejection. An automated email receipt will alert the client immediately.
                  </p>
                  <textarea
                    rows={3}
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="E.g. The GPay screenshot is blurry or transaction ID does not match our bank archives."
                    className="w-full bg-[#0A0A0A] border border-[#C9A84C]/10 p-3 rounded text-xs text-white focus:border-red-500 outline-none resize-none font-body"
                  />
                  <div className="flex gap-3 justify-end mt-2">
                    <button
                      onClick={() => {
                        setRejectModalOpen(false);
                        setRejectReason('');
                        setSelectedRejectOrderId(null);
                      }}
                      className="px-4 py-2 border border-[#C9A84C]/15 text-[#9A8F7E] hover:text-[#F5F0E8] text-xs font-accent uppercase tracking-widest rounded cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleConfirmRejectPayment}
                      disabled={!rejectReason.trim()}
                      className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-accent uppercase tracking-widest rounded cursor-pointer disabled:opacity-40"
                    >
                      Reject Payment
                    </button>
                  </div>
                </div>
              </div>
            )}
          </AnimatePresence>

          {/* Tab specific content switches */}

          {/* 1. OVERVIEW DASHBOARD */}
          {activeTab === 'overview' && (
            <div className="flex flex-col gap-8">
              
              {/* KPI cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 select-none">
                <div className="bg-[#111111] border border-[#C9A84C]/10 p-6 rounded-xl flex items-center justify-between shadow-lg">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] uppercase tracking-widest text-[#9A8F7E] font-bold">Total Revenue</span>
                    <span className="font-display text-2xl font-bold text-[#C9A84C]">₹{totalSales.toLocaleString()}</span>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-[#C9A84C]/10 flex items-center justify-center text-[#C9A84C]">
                    <TrendingUp size={18} />
                  </div>
                </div>

                <div className="bg-[#111111] border border-[#C9A84C]/10 p-6 rounded-xl flex items-center justify-between shadow-lg">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] uppercase tracking-widest text-[#9A8F7E] font-bold">Total Orders</span>
                    <span className="font-display text-2xl font-bold text-[#F5F0E8]">{totalOrdersCount}</span>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-[#B8860B]/10 flex items-center justify-center text-[#B8860B]">
                    <ShoppingBag size={18} />
                  </div>
                </div>

                <div className="bg-[#111111] border border-[#C9A84C]/10 p-6 rounded-xl flex items-center justify-between shadow-lg">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] uppercase tracking-widest text-[#9A8F7E] font-bold">New Customers</span>
                    <span className="font-display text-2xl font-bold text-[#F5F0E8]">{customers.length}</span>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                    <Users size={18} />
                  </div>
                </div>

                <div className={`bg-[#111111] border p-6 rounded-xl flex items-center justify-between shadow-lg transition-colors ${
                  pendingPayments > 0 ? 'border-red-500/20 bg-red-950/5' : 'border-[#C9A84C]/10'
                }`}>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] uppercase tracking-widest text-[#9A8F7E] font-bold">Pending Payments</span>
                    <span className={`font-display text-2xl font-bold ${pendingPayments > 0 ? 'text-red-400 animate-pulse' : 'text-[#F5F0E8]'}`}>
                      {pendingPayments}
                    </span>
                  </div>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    pendingPayments > 0 ? 'bg-red-500/20 text-red-400' : 'bg-[#9A8F7E]/10 text-[#9A8F7E]'
                  }`}>
                    <CreditCard size={18} />
                  </div>
                </div>
              </div>

              {/* Quick Action / Mini grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start select-none">
                
                {/* Pending payouts / orders (Left - 7 cols) */}
                <div className="lg:col-span-8 bg-[#111111] border border-[#C9A84C]/10 p-6 rounded-xl flex flex-col gap-4">
                  <div className="flex justify-between items-center border-b border-[#C9A84C]/5 pb-3">
                    <h3 className="font-accent text-xs font-bold uppercase tracking-widest text-[#C9A84C]">Pending Payment Verification</h3>
                    <button onClick={() => setActiveTab('payments')} className="text-[10px] font-accent uppercase tracking-wider text-[#9A8F7E] hover:text-[#C9A84C]">View All</button>
                  </div>

                  {orders.filter(o => o.payment_status === 'pending').length === 0 ? (
                    <div className="text-center py-8 text-xs text-[#9A8F7E]/50">
                      No pending payment screenshots require review.
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {orders.filter(o => o.payment_status === 'pending').map(order => (
                        <div key={order.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-[#0A0A0A] border border-[#C9A84C]/5 rounded gap-4">
                          <div className="flex flex-col gap-0.5">
                            <span className="font-accent text-[9px] font-bold tracking-wider text-[#9A8F7E]">{order.order_number}</span>
                            <span className="text-xs text-white font-bold">{order.shipping_name} &bull; ₹{order.total.toLocaleString()}</span>
                            <span className="text-[9.5px] text-[#9A8F7E]/75">{formatDate(order.created_at)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {order.payment_screenshot_url && (
                              <button
                                onClick={() => setActiveScreenshot(order.payment_screenshot_url || null)}
                                className="px-3 py-2 border border-[#C9A84C]/20 hover:border-[#C9A84C] text-[9px] font-accent uppercase tracking-widest rounded cursor-pointer"
                              >
                                View Slip
                              </button>
                            )}
                            <button
                              onClick={() => handleVerifyPayment(order.id)}
                              className="px-3 py-2 bg-[#C9A84C] text-[#0A0A0A] text-[9px] font-accent uppercase tracking-widest font-extrabold rounded cursor-pointer"
                            >
                              Verify
                            </button>
                            <button
                              onClick={() => handleRejectPaymentClick(order.id)}
                              className="px-3 py-2 bg-red-950 border border-red-500/25 text-red-300 text-[9px] font-accent uppercase tracking-widest rounded cursor-pointer"
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Quick actions (Right - 4 cols) */}
                <div className="lg:col-span-4 bg-[#111111] border border-[#C9A84C]/10 p-6 rounded-xl flex flex-col gap-4 select-none">
                  <h3 className="font-accent text-xs font-bold uppercase tracking-widest text-[#C9A84C] border-b border-[#C9A84C]/5 pb-3">Quick Studio Actions</h3>
                  
                  <div className="flex flex-col gap-2.5">
                    <button
                      onClick={() => {
                        setActiveTab('products');
                        setShowProductForm(true);
                      }}
                      className="w-full py-3 bg-[#C9A84C] text-[#0A0A0A] font-accent text-[9px] font-extrabold uppercase tracking-widest rounded hover:bg-[#F5F0E8] transition-colors cursor-pointer text-center"
                    >
                      Add New Product
                    </button>
                    <button
                      onClick={() => setActiveTab('tracking')}
                      className="w-full py-3 border border-[#C9A84C]/25 text-[#C9A84C] hover:border-[#C9A84C] hover:bg-[#C9A84C]/5 font-accent text-[9px] font-bold uppercase tracking-widest rounded transition-colors cursor-pointer text-center"
                    >
                      Update Logistics Pipeline
                    </button>
                    <button
                      onClick={() => setActiveTab('settings')}
                      className="w-full py-3 border border-[#C9A84C]/25 text-[#9A8F7E] hover:border-[#C9A84C] hover:text-[#F5F0E8] hover:bg-[#C9A84C]/5 font-accent text-[9px] font-bold uppercase tracking-widest rounded transition-colors cursor-pointer text-center"
                    >
                      Manage UPI Scanner
                    </button>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* 2. PRODUCTS MANAGER */}
          {activeTab === 'products' && (
            <div className="flex flex-col gap-8">
              
              <div className="flex justify-between items-center select-none border-b border-[#C9A84C]/10 pb-4">
                <h3 className="font-accent text-xs font-bold uppercase tracking-widest text-[#C9A84C]">Boutique Products Registry</h3>
                <button
                  onClick={() => {
                    if (showProductForm) {
                      resetProductForm();
                    } else {
                      setShowProductForm(true);
                    }
                  }}
                  className="flex items-center gap-2 px-5 py-3 rounded bg-[#C9A84C] text-[#0A0A0A] font-accent text-[9px] font-extrabold uppercase tracking-widest hover:bg-[#F5F0E8] transition-all cursor-pointer shadow-md"
                >
                  {showProductForm ? <X size={13} /> : <Plus size={13} />} {showProductForm ? 'Cancel Form' : 'Register New Gift'}
                </button>
              </div>

              {/* Form container */}
              <AnimatePresence>
                {showProductForm && (
                  <motion.form
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    onSubmit={handleProductSubmit}
                    className="bg-[#111111] border border-[#C9A84C]/15 p-6 rounded-lg flex flex-col gap-5 overflow-hidden shadow-xl"
                  >
                    <h4 className="font-accent text-xs font-bold uppercase tracking-widest text-[#C9A84C] border-b border-[#C9A84C]/5 pb-3">
                      {isEditing ? 'Modify product record' : 'Register new creation'}
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] uppercase tracking-widest text-[#9A8F7E] font-bold">Product Name</label>
                        <input
                          type="text"
                          required
                          value={pName}
                          onChange={(e) => setPName(e.target.value)}
                          placeholder="e.g. Hexagonal Geode Coasters"
                          className="bg-[#0A0A0A] border border-[#C9A84C]/10 p-3 rounded text-xs"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] uppercase tracking-widest text-[#9A8F7E] font-bold">Price (₹ INR)</label>
                        <input
                          type="number"
                          required
                          value={pPrice}
                          onChange={(e) => setPPrice(e.target.value)}
                          placeholder="e.g. 1800"
                          className="bg-[#0A0A0A] border border-[#C9A84C]/10 p-3 rounded text-xs"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] uppercase tracking-widest text-[#9A8F7E] font-bold">Original Price (₹ Strike-through)</label>
                        <input
                          type="number"
                          value={pOriginalPrice}
                          onChange={(e) => setPOriginalPrice(e.target.value)}
                          placeholder="e.g. 2400"
                          className="bg-[#0A0A0A] border border-[#C9A84C]/10 p-3 rounded text-xs"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[9px] uppercase tracking-widest text-[#9A8F7E] font-bold">Description copy</label>
                      <textarea
                        rows={3}
                        required
                        value={pDescription}
                        onChange={(e) => setPDescription(e.target.value)}
                        placeholder="Detail materials used (real gold-leafing, geode crystals, velvet liners, lead-times)"
                        className="w-full bg-[#0A0A0A] border border-[#C9A84C]/10 p-3 rounded text-xs font-body resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] uppercase tracking-widest text-[#9A8F7E] font-bold">Category</label>
                        <select
                          value={pCategory}
                          onChange={(e) => setPCategory(e.target.value)}
                          className="bg-[#0A0A0A] border border-[#C9A84C]/10 p-3 rounded text-xs"
                        >
                          <option value="cat-frames">Luxury Frames</option>
                          <option value="cat-hampers">Premium Hampers</option>
                          <option value="cat-art">Resin Art Masterpieces</option>
                          <option value="cat-accessories">Custom Accessories</option>
                          <option value="cat-keepsakes">Bespoke Keepsakes</option>
                        </select>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] uppercase tracking-widest text-[#9A8F7E] font-bold">Stock Quantity</label>
                        <input
                          type="number"
                          required
                          value={pStock}
                          onChange={(e) => setPStock(e.target.value)}
                          className="bg-[#0A0A0A] border border-[#C9A84C]/10 p-3 rounded text-xs"
                        />
                      </div>

                      <div className="flex flex-col justify-end gap-1.5 select-none h-full pb-2">
                        <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[#F5F0E8]">
                          <input
                            type="checkbox"
                            checked={pCustomizable}
                            onChange={(e) => setPCustomizable(e.target.checked)}
                            className="w-4 h-4 rounded border-[#C9A84C]/25 text-[#C9A84C] bg-black focus:ring-0 focus:ring-offset-0"
                          />
                          Is Product Customizable?
                        </label>
                      </div>
                    </div>

                    {/* Customization builder section */}
                    {pCustomizable && (
                      <div className="p-4 rounded bg-[#0A0A0A] border border-[#C9A84C]/10 flex flex-col gap-3">
                        <div className="flex justify-between items-center border-b border-[#C9A84C]/5 pb-2">
                          <span className="text-[9.5px] uppercase tracking-widest text-[#C9A84C] font-bold">Customization Options</span>
                          <button
                            type="button"
                            onClick={addCustomField}
                            className="px-2.5 py-1 bg-[#C9A84C]/10 border border-[#C9A84C]/35 text-[#C9A84C] text-[9px] font-accent uppercase tracking-widest rounded font-bold cursor-pointer"
                          >
                            + Add Option Field
                          </button>
                        </div>

                        {pCustomFields.length === 0 ? (
                          <div className="text-center py-4 text-[10px] text-[#9A8F7E]/40 italic">
                            No options configured. (E.g. Name Engraving, Photo Upload).
                          </div>
                        ) : (
                          <div className="flex flex-col gap-3">
                            {pCustomFields.map((f, i) => (
                              <div key={i} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                                <div className="sm:col-span-5 flex flex-col gap-1">
                                  <input
                                    type="text"
                                    required
                                    value={f.name}
                                    onChange={(e) => updateCustomField(i, 'name', e.target.value)}
                                    placeholder="Option Label (e.g. Engraving Message)"
                                    className="bg-black border border-[#C9A84C]/10 p-2.5 rounded text-xs"
                                  />
                                </div>
                                <div className="sm:col-span-3">
                                  <select
                                    value={f.type}
                                    onChange={(e) => updateCustomField(i, 'type', e.target.value)}
                                    className="bg-black border border-[#C9A84C]/10 p-2.5 rounded text-xs w-full"
                                  >
                                    <option value="text">Text Input</option>
                                    <option value="file">Photo Upload</option>
                                    <option value="select">Select Dropdown</option>
                                  </select>
                                </div>
                                <div className="sm:col-span-2 select-none text-center">
                                  <label className="flex items-center gap-1.5 justify-center text-[10px] uppercase font-bold text-[#9A8F7E] cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={f.required}
                                      onChange={(e) => updateCustomField(i, 'required', e.target.checked)}
                                      className="w-3.5 h-3.5"
                                    /> Required?
                                  </label>
                                </div>
                                <div className="sm:col-span-2 text-right">
                                  <button
                                    type="button"
                                    onClick={() => removeCustomField(i)}
                                    className="p-2 border border-red-500/20 text-red-400 hover:bg-red-500/5 rounded text-xs cursor-pointer"
                                  >
                                    Remove
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* SEO toggles */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-[#C9A84C]/5 pt-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] uppercase tracking-widest text-[#9A8F7E] font-bold">SEO Title</label>
                        <input
                          type="text"
                          value={pMetaTitle}
                          onChange={(e) => setPMetaTitle(e.target.value)}
                          placeholder="Google search snippet heading"
                          className="bg-[#0A0A0A] border border-[#C9A84C]/10 p-3 rounded text-xs"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] uppercase tracking-widest text-[#9A8F7E] font-bold">SEO Description</label>
                        <input
                          type="text"
                          value={pMetaDescription}
                          onChange={(e) => setPMetaDescription(e.target.value)}
                          placeholder="Search snippet summary text"
                          className="bg-[#0A0A0A] border border-[#C9A84C]/10 p-3 rounded text-xs"
                        />
                      </div>
                    </div>

                    {/* Form Toggles */}
                    <div className="flex flex-wrap gap-6 items-center select-none pt-2 border-t border-[#C9A84C]/5">
                      <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[#F5F0E8]">
                        <input
                          type="checkbox"
                          checked={pFeatured}
                          onChange={(e) => setPFeatured(e.target.checked)}
                          className="w-4 h-4"
                        />
                        Display on Bestsellers Grid
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[#F5F0E8]">
                        <input
                          type="checkbox"
                          checked={pActive}
                          onChange={(e) => setPActive(e.target.checked)}
                          className="w-4 h-4"
                        />
                        Publish Active in Boutique
                      </label>
                    </div>

                    {/* Image upload */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[9px] uppercase tracking-widest text-[#9A8F7E] font-bold">Product Photo</label>
                      <div className="relative border border-dashed border-[#C9A84C]/25 hover:border-[#C9A84C] rounded p-6 bg-[#0A0A0A]/40 flex flex-col items-center justify-center text-center cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleProductImageUpload}
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                        />
                        <Upload size={18} className="text-[#C9A84C] mb-2" />
                        <span className="font-body text-xs text-[#F5F0E8] font-bold">Select product image file</span>
                        <span className="text-[9px] text-[#9A8F7E]/40 mt-1">PNG, JPG, WEBP formats up to 5MB</span>
                      </div>
                      {uploadError && <span className="text-[10px] text-red-400 font-bold">{uploadError}</span>}
                      
                      {pImages.length > 0 && (
                        <div className="flex gap-3 mt-3">
                          {pImages.map((img, idx) => (
                            <div key={idx} className="relative w-16 h-16 rounded border border-[#C9A84C]/15 overflow-hidden bg-[#0A0A0A]">
                              <img src={img} alt="Product upload preview" className="object-cover w-full h-full" />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-3 justify-end border-t border-[#C9A84C]/5 pt-4">
                      <button
                        type="button"
                        onClick={resetProductForm}
                        className="px-5 py-3 border border-[#C9A84C]/20 hover:border-[#C9A84C] text-[#F5F0E8] rounded font-accent text-[9px] uppercase tracking-widest font-extrabold cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-8 py-3 bg-[#C9A84C] text-[#0A0A0A] rounded font-accent text-[9px] uppercase tracking-widest font-extrabold hover:bg-[#F5F0E8] transition-colors cursor-pointer"
                      >
                        {isEditing ? 'Update Registry' : 'Publish Product'}
                      </button>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>

              {/* Products Table/List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {products.map(prod => (
                  <div
                    key={prod.id}
                    className="bg-[#111111] border border-[#C9A84C]/10 p-5 rounded-lg flex items-center justify-between gap-6 shadow-md"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="relative w-16 h-16 rounded border border-[#C9A84C]/10 overflow-hidden shrink-0 bg-[#0A0A0A]">
                        <img src={prod.images?.[0] || 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=300'} alt={prod.name} className="object-cover w-full h-full" />
                      </div>
                      <div className="flex flex-col min-w-0 font-body">
                        <span className="font-accent text-[8px] text-[#C9A84C] uppercase tracking-wider font-bold">
                          {prod.category_id === 'cat-frames' ? 'Luxury Frames' : prod.category_id === 'cat-hampers' ? 'Premium Hampers' : 'Resin Art'}
                        </span>
                        <h4 className="font-display text-base font-bold text-[#F5F0E8] truncate mt-0.5">{prod.name}</h4>
                        <span className="text-xs text-[#C9A84C] font-bold mt-1">₹{prod.price?.toLocaleString()} &bull; Qty: {prod.stock}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleEditProductInit(prod)}
                        className="p-2 bg-[#0A0A0A] border border-[#C9A84C]/20 hover:border-[#C9A84C] text-[#C9A84C] rounded transition-colors cursor-pointer"
                        title="Modify catalog"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(prod.id)}
                        className="p-2 bg-[#0A0A0A] border border-red-500/10 hover:border-red-400 text-red-400 rounded transition-colors cursor-pointer"
                        title="Delete product"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}

          {/* 3. ORDER MANAGEMENT */}
          {activeTab === 'orders' && (
            <div className="flex flex-col gap-8">
              <h3 className="font-accent text-xs font-bold uppercase tracking-widest text-[#C9A84C] border-b border-[#C9A84C]/10 pb-4">
                Active Client Orders
              </h3>

              {orders.length === 0 ? (
                <div className="bg-[#111111] p-12 text-center rounded-lg border border-[#C9A84C]/5 text-xs text-[#9A8F7E]/50">
                  No orders found in registry database.
                </div>
              ) : (
                <div className="flex flex-col gap-6">
                  {orders.map(order => {
                    const isExpanded = expandedOrderId === order.id;

                    return (
                      <div
                        key={order.id}
                        className={`bg-[#111111] rounded-lg border transition-all duration-300 shadow-lg ${
                          isExpanded ? 'border-[#C9A84C] shadow-[0_0_15px_rgba(201,168,76,0.15)]' : 'border-[#C9A84C]/10 hover:border-[#C9A84C]/35'
                        }`}
                      >
                        {/* Summary panel */}
                        <div className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                          <div className="flex flex-col gap-1 min-w-0">
                            <span className="font-accent text-[9px] uppercase tracking-wider text-[#9A8F7E] font-bold">Order: {order.order_number}</span>
                            <h4 className="font-display text-lg font-bold text-white truncate mt-0.5">{order.shipping_name}</h4>
                            <span className="text-xs text-[#9A8F7E] mt-0.5">{order.shipping_email} &bull; {order.shipping_phone}</span>
                          </div>

                          <div className="flex items-center gap-5 shrink-0 select-none">
                            <div className="text-left md:text-right">
                              <span className="text-[9px] uppercase tracking-widest text-[#9A8F7E] font-bold">Paid Sum</span>
                              <div className="font-body text-base font-bold text-[#C9A84C] mt-0.5">₹{order.total?.toLocaleString()}</div>
                            </div>

                            <div className="flex flex-col gap-1">
                              <span className="text-[9px] uppercase tracking-widest text-[#9A8F7E] font-bold text-left md:text-right">Receipt</span>
                              {order.payment_screenshot_url ? (
                                <button
                                  onClick={() => setActiveScreenshot(order.payment_screenshot_url || null)}
                                  className="px-3 py-1.5 bg-[#0A0A0A] border border-[#C9A84C]/25 text-[#C9A84C] text-[9px] font-accent uppercase tracking-widest rounded hover:border-[#C9A84C] transition-colors cursor-pointer"
                                >
                                  View Slip
                                </button>
                              ) : (
                                <span className="text-[10px] text-red-400 font-bold uppercase">No Slip</span>
                              )}
                            </div>
                          </div>

                          <button
                            onClick={() => handleExpandOrder(order.id)}
                            className="w-full md:w-auto px-5 py-3 border border-[#C9A84C]/25 hover:border-[#C9A84C] text-[#C9A84C] hover:text-white rounded font-accent text-[9px] uppercase tracking-widest font-extrabold transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md bg-[#0A0A0A]"
                          >
                            {isExpanded ? 'Collapse' : 'Manage Pipeline'} <ArrowRight size={12} className={`transform transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`} />
                          </button>
                        </div>

                        {/* Collapsible panel */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="border-t border-[#C9A84C]/10 bg-[#0A0A0A]/40 overflow-hidden"
                            >
                              <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
                                
                                {/* Ordered items (5 cols) */}
                                <div className="lg:col-span-5 flex flex-col gap-4">
                                  <h5 className="font-accent text-[10px] uppercase tracking-widest text-[#C9A84C] font-bold border-b border-[#C9A84C]/5 pb-2">Ordered Creations</h5>
                                  {itemsLoading ? (
                                    <div className="flex items-center gap-2 py-4 text-xs text-[#9A8F7E]/50 font-body">
                                      <Loader2 className="animate-spin text-[#C9A84C]" size={12} /> Loading items...
                                    </div>
                                  ) : (
                                    <div className="flex flex-col gap-4 text-xs font-body text-[#9A8F7E]">
                                      {expandedOrderItems.map(item => (
                                        <div key={item.id} className="flex flex-col gap-1.5 py-2 border-b border-[#C9A84C]/5 last:border-0 pb-3">
                                          <div className="flex justify-between items-start">
                                            <span className="font-bold text-white">{item.product_name} <strong className="text-[#C9A84C]">x{item.quantity}</strong></span>
                                            <span className="font-bold text-[#C9A84C]">₹{(item.price * item.quantity).toLocaleString()}</span>
                                          </div>
                                          {item.customization && (
                                            <div className="p-2 bg-black/50 border border-[#C9A84C]/10 rounded text-[9px] uppercase tracking-wider text-[#9A8F7E]/80">
                                              {item.customization.engravingText && <div>Engraving: <strong className="text-white normal-case italic">"{item.customization.engravingText}"</strong></div>}
                                              {item.customization.variantSize && <div>Size Swatch: <strong className="text-white">{item.customization.variantSize}</strong></div>}
                                            </div>
                                          )}
                                        </div>
                                      ))}
                                      
                                      <div className="flex flex-col gap-1.5 border-t border-[#C9A84C]/5 pt-4">
                                        <span className="text-[9px] uppercase tracking-widest text-[#C9A84C] font-bold">Delivery Location Coordinates</span>
                                        <span className="leading-relaxed mt-0.5 text-white">{order.shipping_address}</span>
                                      </div>
                                    </div>
                                  )}
                                </div>

                                {/* Logistics progress uploader (7 cols) */}
                                <div className="lg:col-span-7 flex flex-col gap-4 border-l border-[#C9A84C]/5 lg:pl-8">
                                  <h5 className="font-accent text-[10px] uppercase tracking-widest text-[#C9A84C] font-bold border-b border-[#C9A84C]/5 pb-2">Logistics Control</h5>
                                  
                                  <div className="flex flex-col gap-4 font-body text-xs text-[#9A8F7E]">
                                    
                                    {/* Order Status triggers */}
                                    <div className="flex flex-wrap items-center gap-3">
                                      <span>Current Status:</span>
                                      <span className="bg-[#C9A84C]/10 border border-[#C9A84C]/25 text-[#C9A84C] px-2.5 py-1 rounded text-[9px] font-accent uppercase tracking-widest font-extrabold">
                                        {getStatusText(order.order_status)}
                                      </span>
                                      <span>&bull;</span>
                                      <span>Payment status:</span>
                                      <span className={`px-2.5 py-1 rounded text-[9px] font-accent uppercase tracking-widest font-extrabold border ${
                                        order.payment_status === 'verified' 
                                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25' 
                                          : 'bg-amber-500/10 text-amber-400 border-amber-500/25'
                                      }`}>
                                        {order.payment_status}
                                      </span>
                                    </div>

                                    {/* Verification action row */}
                                    {order.payment_status === 'pending' && (
                                      <div className="p-4 rounded bg-amber-500/5 border border-amber-500/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 select-none">
                                        <div className="flex flex-col gap-0.5">
                                          <strong className="text-amber-400 text-xs flex items-center gap-1.5 uppercase font-accent tracking-wider"><AlertCircle size={13} /> Action Required</strong>
                                          <span className="text-[10px] text-[#9A8F7E] mt-0.5">Validate the transaction screenshot first before advancing the pipeline.</span>
                                        </div>
                                        <div className="flex gap-2">
                                          <button
                                            onClick={() => handleVerifyPayment(order.id)}
                                            className="px-3.5 py-2 bg-emerald-500 text-black font-accent text-[9px] font-extrabold uppercase tracking-widest rounded cursor-pointer"
                                          >
                                            Verify GPay
                                          </button>
                                          <button
                                            onClick={() => handleRejectPaymentClick(order.id)}
                                            className="px-3.5 py-2 bg-red-950 border border-red-500/25 text-red-300 font-accent text-[9px] uppercase tracking-widest rounded cursor-pointer"
                                          >
                                            Reject Slip
                                          </button>
                                        </div>
                                      </div>
                                    )}

                                    {/* Logistics advancement input */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                      <div className="flex flex-col gap-1.5">
                                        <label className="text-[9px] uppercase tracking-widest text-[#9A8F7E] font-bold">Courier Name</label>
                                        <input
                                          type="text"
                                          value={courierName}
                                          onChange={(e) => setCourierName(e.target.value)}
                                          placeholder="E.g. Blue Dart"
                                          className="bg-[#0A0A0A] border border-[#C9A84C]/10 p-2.5 rounded text-xs text-white"
                                        />
                                      </div>

                                      <div className="flex flex-col gap-1.5">
                                        <label className="text-[9px] uppercase tracking-widest text-[#9A8F7E] font-bold">AWB Tracking Number</label>
                                        <input
                                          type="text"
                                          value={trackingNumber}
                                          onChange={(e) => setTrackingNumber(e.target.value)}
                                          placeholder="E.g. AWB12345678"
                                          className="bg-[#0A0A0A] border border-[#C9A84C]/10 p-2.5 rounded text-xs text-white"
                                        />
                                      </div>
                                    </div>

                                    {/* Internal notes */}
                                    <div className="flex flex-col gap-1.5">
                                      <label className="text-[9px] uppercase tracking-widest text-[#9A8F7E] font-bold">Internal Workshop Notes</label>
                                      <input
                                        type="text"
                                        value={internalNotes}
                                        onChange={(e) => setInternalNotes(e.target.value)}
                                        placeholder="Admin annotations (e.g. engraving names corrected, sandlewood box verified)"
                                        className="bg-[#0A0A0A] border border-[#C9A84C]/10 p-2.5 rounded text-xs text-white"
                                      />
                                    </div>

                                    {/* Pipeline advances dropdown */}
                                    <div className="flex flex-col gap-2 mt-2 select-none">
                                      <span className="text-[9px] uppercase tracking-widest text-[#9A8F7E] font-bold">Advance Pipeline Node</span>
                                      <div className="flex flex-wrap gap-2">
                                        {STEPS.map(step => {
                                          const isCurrent = step.key === order.order_status;
                                          return (
                                            <button
                                              key={step.key}
                                              type="button"
                                              disabled={isCurrent}
                                              onClick={() => handleUpdatePipeline(order.id, step.key)}
                                              className={`px-3 py-2 border rounded text-[9px] font-accent uppercase tracking-widest transition-all cursor-pointer ${
                                                isCurrent 
                                                  ? 'bg-[#C9A84C] border-[#C9A84C] text-[#0A0A0A] font-extrabold' 
                                                  : 'bg-black border-[#C9A84C]/15 text-[#9A8F7E] hover:border-[#C9A84C]'
                                              }`}
                                            >
                                              {step.label}
                                            </button>
                                          );
                                        })}
                                      </div>
                                    </div>

                                  </div>
                                </div>

                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                      </div>
                    );
                  })}
                </div>
              )}

            </div>
          )}

          {/* 4. CUSTOMER MANAGEMENT */}
          {activeTab === 'customers' && (
            <div className="flex flex-col gap-8">
              <div className="flex justify-between items-center select-none border-b border-[#C9A84C]/10 pb-4">
                <h3 className="font-accent text-xs font-bold uppercase tracking-widest text-[#C9A84C]">Registered Patrons</h3>
                <button
                  onClick={handleExportCSV}
                  className="px-4 py-2 border border-[#C9A84C]/25 text-[#C9A84C] hover:border-[#C9A84C] hover:bg-[#C9A84C]/5 font-accent text-[9px] font-extrabold uppercase tracking-widest rounded flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download size={12} /> Export CSV
                </button>
              </div>

              {customers.length === 0 ? (
                <div className="bg-[#111111] p-12 text-center rounded border border-[#C9A84C]/5 text-xs text-[#9A8F7E]/50">
                  No customers registered in local registry database.
                </div>
              ) : (
                <div className="bg-[#111111] border border-[#C9A84C]/10 rounded-lg overflow-hidden shadow-xl select-none">
                  <table className="w-full text-left font-body text-xs">
                    <thead>
                      <tr className="border-b border-[#C9A84C]/15 bg-black/30 font-accent text-[9px] uppercase tracking-widest text-[#C9A84C]">
                        <th className="p-4">Patron</th>
                        <th className="p-4">Contact</th>
                        <th className="p-4 text-center">Orders Count</th>
                        <th className="p-4 text-right">Lifetime Spent</th>
                        <th className="p-4 text-right">Joined Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {customers.map((c, i) => (
                        <tr key={i} className="border-b border-[#C9A84C]/5 last:border-0 hover:bg-black/20 transition-colors">
                          <td className="p-4 flex items-center gap-3">
                            <div className="w-8 h-8 rounded bg-[#C9A84C]/10 border border-[#C9A84C]/25 flex items-center justify-center text-[#C9A84C] font-bold">
                              {c.full_name?.charAt(0) || 'P'}
                            </div>
                            <span className="font-bold text-white">{c.full_name}</span>
                          </td>
                          <td className="p-4 text-[#9A8F7E] font-mono">
                            <div>{c.email}</div>
                            <div className="mt-0.5 text-[10px]">{c.phone || 'No phone'}</div>
                          </td>
                          <td className="p-4 text-center font-bold text-white">{c.ordersCount}</td>
                          <td className="p-4 text-right font-bold text-[#C9A84C]">₹{c.totalSpent.toLocaleString()}</td>
                          <td className="p-4 text-right text-[#9A8F7E]">{formatDate(c.joined)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

            </div>
          )}

          {/* 5. TRACKING MANAGEMENT */}
          {activeTab === 'tracking' && (
            <div className="flex flex-col gap-8">
              <h3 className="font-accent text-xs font-bold uppercase tracking-widest text-[#C9A84C] border-b border-[#C9A84C]/10 pb-4">
                Logistics Pipeline Control
              </h3>

              <div className="bg-[#111111] border border-[#C9A84C]/10 rounded-lg p-6 shadow-xl flex flex-col gap-4">
                <p className="text-xs text-[#9A8F7E] leading-relaxed">
                  Select any active order ID to modify its current packaging, crafting, or courier dispatch progress index.
                </p>

                {orders.length === 0 ? (
                  <div className="text-center py-6 text-xs text-[#9A8F7E]/40 italic">
                    No active orders logged.
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {orders.map(order => (
                      <div key={order.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-[#0A0A0A]/60 border border-[#C9A84C]/10 rounded gap-4 font-body select-none">
                        <div className="flex flex-col">
                          <span className="font-accent text-[9px] font-bold text-[#C9A84C] tracking-wider">{order.order_number} &bull; {order.shipping_name}</span>
                          <span className="text-[10px] text-[#9A8F7E] mt-0.5">Location: {order.shipping_address?.split('.')[0]}</span>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-[10px] text-[#9A8F7E]">Pipeline Node:</span>
                          <span className="bg-[#C9A84C]/10 border border-[#C9A84C]/25 text-[#C9A84C] px-2.5 py-1 rounded text-[9px] font-accent uppercase tracking-widest font-extrabold">
                            {getStatusText(order.order_status)}
                          </span>
                          <button
                            onClick={() => {
                              setActiveTab('orders');
                              handleExpandOrder(order.id);
                            }}
                            className="px-3.5 py-2 border border-[#C9A84C]/25 hover:border-[#C9A84C] text-[#C9A84C] hover:bg-[#C9A84C]/5 text-[9px] font-accent uppercase tracking-widest font-bold rounded transition-colors cursor-pointer"
                          >
                            Advance
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* 6. PAYMENTS REVIEW */}
          {activeTab === 'payments' && (
            <div className="flex flex-col gap-8">
              <h3 className="font-accent text-xs font-bold uppercase tracking-widest text-[#C9A84C] border-b border-[#C9A84C]/10 pb-4">
                Manual Payments Auditing
              </h3>

              <div className="bg-[#111111] border border-[#C9A84C]/10 rounded-lg p-6 shadow-xl flex flex-col gap-4">
                <p className="text-xs text-[#9A8F7E] leading-relaxed">
                  Review transaction slips uploaded by clients via GPay. Rejecting a slip will put the order back to pending state and request re-upload.
                </p>

                {orders.length === 0 ? (
                  <div className="text-center py-6 text-xs text-[#9A8F7E]/40 italic">
                    No payments registered.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {orders.map(order => (
                      <div key={order.id} className="bg-[#0A0A0A] border border-[#C9A84C]/10 p-4 rounded flex flex-col gap-4 font-body shadow-md select-none">
                        <div className="flex justify-between items-start border-b border-[#C9A84C]/5 pb-2">
                          <div className="flex flex-col gap-0.5">
                            <span className="font-accent text-[9px] font-bold text-[#C9A84C] tracking-wider">{order.order_number}</span>
                            <span className="text-xs text-white font-bold">{order.shipping_name}</span>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[8px] uppercase tracking-widest font-bold border ${
                            order.payment_status === 'verified' 
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25' 
                              : 'bg-amber-500/10 text-amber-400 border-amber-500/25'
                          }`}>
                            {order.payment_status}
                          </span>
                        </div>

                        {order.payment_screenshot_url ? (
                          <div 
                            onClick={() => setActiveScreenshot(order.payment_screenshot_url || null)}
                            className="relative group w-full h-32 rounded border border-[#C9A84C]/15 bg-black overflow-hidden flex items-center justify-center cursor-zoom-in"
                          >
                            <img src={order.payment_screenshot_url} alt="Slip log" className="object-contain max-h-full max-w-full" />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-[#C9A84C] font-accent text-[8.5px] font-bold uppercase tracking-widest">
                              <Eye size={11} /> Inspect Receipt
                            </div>
                          </div>
                        ) : (
                          <div className="w-full h-32 bg-black/40 border border-red-500/15 rounded flex items-center justify-center text-red-400 text-[9.5px] font-bold uppercase tracking-wider">
                            Screenshot slip missing
                          </div>
                        )}

                        <div className="flex gap-2 justify-end">
                          <button
                            disabled={order.payment_status === 'verified'}
                            onClick={() => handleVerifyPayment(order.id)}
                            className="px-3.5 py-1.5 bg-[#C9A84C] text-[#0A0A0A] text-[9px] font-accent uppercase tracking-widest font-extrabold rounded cursor-pointer disabled:opacity-40"
                          >
                            Approve
                          </button>
                          <button
                            disabled={order.payment_status === 'rejected'}
                            onClick={() => handleRejectPaymentClick(order.id)}
                            className="px-3.5 py-1.5 bg-red-950 border border-red-500/20 text-red-300 text-[9px] font-accent uppercase tracking-widest rounded cursor-pointer disabled:opacity-40"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* 7. ANALYTICS DETAIL */}
          {activeTab === 'analytics' && isMounted && (
            <div className="flex flex-col gap-8">
              
              {/* Sales area chart */}
              <div className="bg-[#111111] border border-[#C9A84C]/10 p-6 rounded-lg shadow-xl">
                <h3 className="font-accent text-xs font-bold uppercase tracking-widest text-[#C9A84C] mb-6 border-b border-[#C9A84C]/5 pb-3">
                  Historical Gifting Sales (₹ INR)
                </h3>
                
                <div className="w-full h-72">
                  {salesHistoryData.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-xs text-[#9A8F7E]/40 italic">
                      Insufficient order data to render trend projections.
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={salesHistoryData}>
                        <defs>
                          <linearGradient id="areaGlow" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#C9A84C" stopOpacity={0.25}/>
                            <stop offset="95%" stopColor="#C9A84C" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="date" stroke="#9A8F7E" fontSize={10} tickLine={false} />
                        <YAxis stroke="#9A8F7E" fontSize={10} tickLine={false} />
                        <Tooltip contentStyle={{ backgroundColor: '#111111', borderColor: '#C9A84C' }} labelStyle={{ color: '#F5F0E8' }} />
                        <Area type="monotone" dataKey="amount" stroke="#C9A84C" fillOpacity={1} fill="url(#areaGlow)" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              {/* Share grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 select-none">
                
                {/* Categories bar chart */}
                <div className="bg-[#111111] border border-[#C9A84C]/10 p-6 rounded-lg shadow-xl">
                  <h3 className="font-accent text-xs font-bold uppercase tracking-widest text-[#C9A84C] mb-6 border-b border-[#C9A84C]/5 pb-3">
                    Collection Volume Index
                  </h3>
                  <div className="w-full h-60">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={categoriesData}>
                        <XAxis dataKey="name" stroke="#9A8F7E" fontSize={10} tickLine={false} />
                        <YAxis stroke="#9A8F7E" fontSize={10} tickLine={false} />
                        <Tooltip contentStyle={{ backgroundColor: '#111111', borderColor: '#C9A84C' }} />
                        <Bar dataKey="value" fill="#C9A84C" radius={[4, 4, 0, 0]}>
                          {categoriesData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Analytical summaries */}
                <div className="bg-[#111111] border border-[#C9A84C]/10 p-6 rounded-lg shadow-xl flex flex-col gap-5">
                  <h3 className="font-accent text-xs font-bold uppercase tracking-widest text-[#C9A84C] border-b border-[#C9A84C]/5 pb-3">
                    Boutique Performance Index
                  </h3>
                  
                  <div className="flex flex-col gap-4 font-body text-xs text-[#9A8F7E]">
                    <div className="flex justify-between items-center py-2 border-b border-[#C9A84C]/5">
                      <span>Average Order Value:</span>
                      <strong className="text-white">₹{orders.length > 0 ? Math.round(totalSales / orders.length).toLocaleString() : 0}</strong>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-[#C9A84C]/5">
                      <span>Active Catalog Products:</span>
                      <strong className="text-white">{productsCount} Items</strong>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-[#C9A84C]/5">
                      <span>Total Registered Accounts:</span>
                      <strong className="text-white">{customers.length} Patrons</strong>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* 8. SETTINGS MANAGER */}
          {activeTab === 'settings' && (
            <div className="flex flex-col gap-8 max-w-2xl">
              <h3 className="font-accent text-xs font-bold uppercase tracking-widest text-[#C9A84C] border-b border-[#C9A84C]/10 pb-4">
                Boutique Configuration Panel
              </h3>

              <form onSubmit={handleSaveSettings} className="bg-[#111111] border border-[#C9A84C]/10 p-6 rounded-lg flex flex-col gap-5 shadow-xl font-body">
                
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] uppercase tracking-widest text-[#9A8F7E] font-bold">Manual GPay UPI ID</label>
                  <input
                    type="text"
                    required
                    value={setUpiId}
                    onChange={(e) => setSetUpiId(e.target.value)}
                    placeholder="E.g. artinova@upi"
                    className="bg-[#0A0A0A] border border-[#C9A84C]/10 p-3 rounded text-xs text-white"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] uppercase tracking-widest text-[#9A8F7E] font-bold">GPay QR Image Scanner URL (Base64 or HTTPS)</label>
                  <input
                    type="text"
                    required
                    value={setQrUrl}
                    onChange={(e) => setSetQrUrl(e.target.value)}
                    placeholder="URL to GPay QR Code image file"
                    className="bg-[#0A0A0A] border border-[#C9A84C]/10 p-3 rounded text-xs text-white"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] uppercase tracking-widest text-[#9A8F7E] font-bold">WhatsApp Business Number (Gifting line)</label>
                  <input
                    type="text"
                    required
                    value={setWaNumber}
                    onChange={(e) => setSetWaNumber(e.target.value)}
                    placeholder="E.g. +91 99942 03670"
                    className="bg-[#0A0A0A] border border-[#C9A84C]/10 p-3 rounded text-xs text-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] uppercase tracking-widest text-[#9A8F7E] font-bold">GST Standard Rate (%)</label>
                    <input
                      type="number"
                      required
                      value={setGstRate}
                      onChange={(e) => setSetGstRate(e.target.value)}
                      placeholder="18"
                      className="bg-[#0A0A0A] border border-[#C9A84C]/10 p-3 rounded text-xs text-white"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] uppercase tracking-widest text-[#9A8F7E] font-bold">Free Shipping Threshold Amount (₹)</label>
                    <input
                      type="number"
                      required
                      value={setThreshold}
                      onChange={(e) => setSetThreshold(e.target.value)}
                      placeholder="999"
                      className="bg-[#0A0A0A] border border-[#C9A84C]/10 p-3 rounded text-xs text-white"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="mt-4 w-full py-4 bg-[#C9A84C] text-[#0A0A0A] font-accent text-[9px] font-extrabold uppercase tracking-widest rounded hover:bg-[#F5F0E8] transition-colors cursor-pointer text-center shadow-lg"
                >
                  Save Configuration Registry
                </button>

              </form>

            </div>
          )}

        </main>
      </div>
    </div>
  );
}
