'use client';

import React, { useState, useEffect } from 'react';
import NextLink from 'next/link';
import { useRouter } from 'next/navigation';
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
  Download, FileText, CheckCircle2, AlertCircle, RefreshCw, LogOut,
  FolderOpen, Calendar, HelpCircle, Bell, ChevronDown, CheckSquare, Square, Menu
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Recharts components imports
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, 
  BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell, Legend
} from 'recharts';

const STEPS = [
  { key: 'received', label: 'Order Received', icon: '📩' },
  { key: 'verified', label: 'Payment Verified', icon: '✓' },
  { key: 'design', label: 'Design Confirmed', icon: '🎨' },
  { key: 'crafting', label: 'Crafting Started', icon: '🛠️' },
  { key: 'quality', label: 'Quality Check', icon: '🔍' },
  { key: 'packaging', label: 'Packaging', icon: '📦' },
  { key: 'shipped', label: 'Shipped', icon: '🚀' },
  { key: 'delivered', label: 'Delivered', icon: '🎁' }
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
  const router = useRouter();
  const { user, isAdmin, setLoginModalOpen, loginWithGoogle, logout } = useAuthStore();
  
  const [isMounted, setIsMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<
    'overview' | 'products' | 'categories' | 'orders' | 'customers' | 'tracking' | 'payments' | 'analytics' | 'settings'
  >('overview');
  
  // Data states
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [settings, setSettings] = useState<any>({});
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Layout states
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('all');
  const [productStatusFilter, setProductStatusFilter] = useState('all');

  // Order Details Sub-View
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [selectedOrderItems, setSelectedOrderItems] = useState<OrderItem[]>([]);
  const [selectedOrderTimeline, setSelectedOrderTimeline] = useState<any[]>([]);
  const [itemsLoading, setItemsLoading] = useState(false);

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
  
  // Expand/Control states for selected order
  const [internalNotes, setInternalNotes] = useState('');
  const [courierName, setCourierName] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [timelineNote, setTimelineNote] = useState('');
  
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

  useEffect(() => {
    if (isMounted && !isAdmin) {
      router.push('/admin');
    }
  }, [isAdmin, isMounted, router]);

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
            const totalSpent = userOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
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

  // Load selected order extra details
  useEffect(() => {
    if (selectedOrderId) {
      const orderData = orders.find(o => o.id === selectedOrderId);
      if (orderData) {
        setInternalNotes(orderData.admin_notes || '');
        setCourierName(orderData.courier || '');
        setTrackingNumber(orderData.tracking_number || '');
      }
      loadOrderItemsAndTimeline(selectedOrderId);
    } else {
      setSelectedOrderItems([]);
      setSelectedOrderTimeline([]);
    }
  }, [selectedOrderId, orders]);

  const loadOrderItemsAndTimeline = async (orderId: string) => {
    setItemsLoading(true);
    try {
      const orderItems = await getOrderItems(orderId);
      setSelectedOrderItems(orderItems);
      const timeline = await getTrackingUpdates(orderId);
      setSelectedOrderTimeline(timeline);
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

  // Auto-generate slug from name
  useEffect(() => {
    if (!isEditing && pName) {
      const generated = pName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      setPSlug(generated);
    }
  }, [pName, isEditing]);

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
    } catch (err: any) {
      console.error(err);
      alert(`Error saving product: ${err?.message || err?.details || JSON.stringify(err) || 'Unknown database error'}`);
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
        
        // Add default tracking update node
        await createTrackingUpdate(
          orderId,
          'verified',
          'GPay screenshot verified. Order entered design pipeline.'
        );

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
        // Add log update record
        await createTrackingUpdate(
          orderId,
          stage,
          timelineNote || `Order advanced to ${getStatusText(stage)} stage.`
        );

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

        setTimelineNote('');
        alert(`Logistics stage advanced to: ${getStatusText(stage)}`);
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

  // Bulk Product Controls
  const toggleSelectProduct = (id: string) => {
    setSelectedProductIds(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const toggleSelectAllProducts = () => {
    const visibleIds = filteredProducts.map(p => p.id);
    const allSelected = visibleIds.every(id => selectedProductIds.includes(id));
    if (allSelected) {
      setSelectedProductIds(prev => prev.filter(id => !visibleIds.includes(id)));
    } else {
      setSelectedProductIds(prev => [...new Set([...prev, ...visibleIds])]);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedProductIds.length === 0) return;
    if (confirm(`Permanently delete ${selectedProductIds.length} selected products?`)) {
      for (const id of selectedProductIds) {
        await deleteProduct(id);
      }
      setSelectedProductIds([]);
      loadDashboardData(false);
    }
  };

  const handleBulkStatusChange = async (active: boolean) => {
    if (selectedProductIds.length === 0) return;
    try {
      for (const id of selectedProductIds) {
        const prod = products.find(p => p.id === id);
        if (prod) {
          await updateProduct(id, { ...prod, is_active: active }, prod.images);
        }
      }
      setSelectedProductIds([]);
      loadDashboardData(false);
      alert('Status updated for selected creations.');
    } catch (err) {
      console.error(err);
    }
  };

  // Auth block
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
            onClick={() => loginWithGoogle(window.location.origin + '/admin')}
            className="w-full bg-[#C9A84C] text-[#0A0A0A] py-3.5 px-6 rounded font-accent text-[10px] font-bold uppercase tracking-widest hover:bg-[#F5F0E8] transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-lg"
          >
            Authenticate with Google
          </button>
        </div>
      </div>
    );
  }

  // Analytics variables
  const totalSales = orders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
  const totalOrdersCount = orders.length;
  const productsCount = products.length;
  const pendingPayments = orders.filter(o => o.payment_status === 'pending').length;
  
  // Filter products
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(productSearch.toLowerCase()) || 
                          p.slug.toLowerCase().includes(productSearch.toLowerCase());
    const matchesCategory = productCategoryFilter === 'all' || p.category_id === productCategoryFilter;
    const matchesStatus = productStatusFilter === 'all' || 
                         (productStatusFilter === 'active' && p.is_active) || 
                         (productStatusFilter === 'draft' && !p.is_active);
    return matchesSearch && matchesCategory && matchesStatus;
  });

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

  const COLORS = ['#C9A84C', '#B8860B', '#9A8F7E', '#4A4035', '#2C251E', '#1C1814'];

  const getPageTitle = () => {
    switch (activeTab) {
      case 'overview': return 'Overview Dashboard';
      case 'products': return 'Products Catalog';
      case 'categories': return 'Collections Category Index';
      case 'orders': return 'Client Orders';
      case 'customers': return 'Patrons Base';
      case 'tracking': return 'Tracking Management';
      case 'payments': return 'Payments Auditor';
      case 'analytics': return 'Boutique Analytics';
      case 'settings': return 'System Settings';
      default: return 'Admin Desk';
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F5F0E8] flex flex-col font-sans select-none overflow-x-hidden">
      
      {/* Lightbox Screenshot Zoom Modal */}
      <AnimatePresence>
        {activeScreenshot && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-[#0A0A0A]/95 backdrop-blur-md">
            <div className="absolute inset-0 cursor-zoom-out" onClick={() => setActiveScreenshot(null)} />
            <div className="relative max-w-lg max-h-[85vh] z-10 flex flex-col items-center gap-4 bg-[#111111] p-4 rounded-xl border border-[#C9A84C]/20">
              <button
                onClick={() => setActiveScreenshot(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-[#0A0A0A]/80 border border-[#C9A84C]/20 text-[#F5F0E8] hover:text-[#C9A84C] cursor-pointer z-20"
              >
                <X size={16} />
              </button>
              <img
                src={activeScreenshot}
                alt="Payment Slip Log"
                className="object-contain max-h-[70vh] rounded-lg"
              />
              <span className="font-accent text-[9px] text-[#C9A84C] uppercase tracking-widest">GPay verification token slip</span>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Payment Rejection reason input */}
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
                onChange={(e) => setSetQrUrl(e.target.value)}
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
                  className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-accent uppercase tracking-widest rounded cursor-pointer"
                >
                  Reject Payment
                </button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Slide-out Add/Edit Product Drawer */}
      <AnimatePresence>
        {showProductForm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={resetProductForm}
              className="fixed inset-0 bg-black/80 z-[200] cursor-pointer"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.35 }}
              className="fixed top-0 right-0 h-screen w-full max-w-[680px] bg-[#111111] border-l border-[#C9A84C]/15 shadow-2xl z-[250] flex flex-col justify-between font-sans text-xs"
            >
              {/* Header */}
              <div className="h-16 px-6 border-b border-[#C9A84C]/10 flex items-center justify-between bg-[#0D0D0D]">
                <h3 className="font-display text-lg font-bold text-[#F5F0E8]">{isEditing ? 'Modify Product record' : 'Register new creation'}</h3>
                <button onClick={resetProductForm} className="text-[#9A8F7E] hover:text-[#C9A84C] cursor-pointer">
                  <X size={18} />
                </button>
              </div>
              
              {/* Scrollable content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="flex flex-col gap-1">
                  <label className="text-[12px] font-sans font-medium text-[#9A8F7E] mb-1.5">Product Name</label>
                  <input
                    type="text"
                    required
                    value={pName}
                    onChange={(e) => setPName(e.target.value)}
                    placeholder="e.g. Resin Geode Wall Clock"
                    className="bg-[#0A0A0A] border border-[#C9A84C]/15 h-11 px-4 rounded-lg text-white placeholder-[#9A8F7E]/30 outline-none focus:border-[#C9A84C]"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[12px] font-sans font-medium text-[#9A8F7E] mb-1.5">Slug (Auto-generated)</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      value={pSlug}
                      onChange={(e) => setPSlug(e.target.value)}
                      placeholder="slug-link-here"
                      className="bg-[#0A0A0A] border border-[#C9A84C]/15 h-11 px-4 rounded-lg text-white flex-grow placeholder-[#9A8F7E]/30 outline-none focus:border-[#C9A84C]"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[12px] font-sans font-medium text-[#9A8F7E] mb-1.5">Description (Rich Copy)</label>
                  <textarea
                    rows={4}
                    required
                    value={pDescription}
                    onChange={(e) => setPDescription(e.target.value)}
                    placeholder="Detailed copy describing the item..."
                    className="bg-[#0A0A0A] border border-[#C9A84C]/15 p-4 rounded-lg text-white placeholder-[#9A8F7E]/30 outline-none focus:border-[#C9A84C] resize-none font-sans leading-relaxed"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-[12px] font-sans font-medium text-[#9A8F7E] mb-1.5">Price (₹ INR)</label>
                    <input
                      type="number"
                      required
                      value={pPrice}
                      onChange={(e) => setPPrice(e.target.value)}
                      placeholder="₹ price"
                      className="bg-[#0A0A0A] border border-[#C9A84C]/15 h-11 px-4 rounded-lg text-white outline-none focus:border-[#C9A84C]"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[12px] font-sans font-medium text-[#9A8F7E] mb-1.5">Original Price (₹ Strike-through)</label>
                    <input
                      type="number"
                      value={pOriginalPrice}
                      onChange={(e) => setPOriginalPrice(e.target.value)}
                      placeholder="₹ retail strike"
                      className="bg-[#0A0A0A] border border-[#C9A84C]/15 h-11 px-4 rounded-lg text-white outline-none focus:border-[#C9A84C]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-[12px] font-sans font-medium text-[#9A8F7E] mb-1.5">Category</label>
                    <select
                      value={pCategory}
                      onChange={(e) => setPCategory(e.target.value)}
                      className="bg-[#0A0A0A] border border-[#C9A84C]/15 h-11 px-4 rounded-lg text-white outline-none focus:border-[#C9A84C]"
                    >
                      <option value="cat-frames">Luxury Frames</option>
                      <option value="cat-hampers">Premium Hampers</option>
                      <option value="cat-art">Resin Art Masterpieces</option>
                      <option value="cat-accessories">Custom Accessories</option>
                      <option value="cat-keepsakes">Bespoke Keepsakes</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[12px] font-sans font-medium text-[#9A8F7E] mb-1.5">Stock Quantity</label>
                    <input
                      type="number"
                      required
                      value={pStock}
                      onChange={(e) => setPStock(e.target.value)}
                      placeholder="Stock quantity"
                      className="bg-[#0A0A0A] border border-[#C9A84C]/15 h-11 px-4 rounded-lg text-white outline-none focus:border-[#C9A84C]"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 py-2 select-none">
                  <input
                    type="checkbox"
                    id="pCustomizable"
                    checked={pCustomizable}
                    onChange={(e) => setPCustomizable(e.target.checked)}
                    className="w-4 h-4 rounded border-[#C9A84C]/25 text-[#C9A84C] bg-black focus:ring-0"
                  />
                  <label htmlFor="pCustomizable" className="text-xs text-[#F5F0E8] font-bold cursor-pointer">
                    Enable customizable options (Engravings/Photos)
                  </label>
                </div>

                {pCustomizable && (
                  <div className="p-4 rounded-lg bg-[#0A0A0A]/50 border border-[#C9A84C]/10 flex flex-col gap-3">
                    <div className="flex justify-between items-center border-b border-[#C9A84C]/5 pb-2">
                      <span className="text-[10px] uppercase tracking-widest text-[#C9A84C] font-bold">Custom Option Fields</span>
                      <button
                        type="button"
                        onClick={addCustomField}
                        className="px-2.5 py-1 bg-[#C9A84C]/10 border border-[#C9A84C]/35 text-[#C9A84C] text-[9px] font-accent uppercase tracking-widest rounded font-bold cursor-pointer"
                      >
                        + Add Field
                      </button>
                    </div>

                    {pCustomFields.length === 0 ? (
                      <div className="text-center py-4 text-[10px] text-[#9A8F7E]/40 italic">
                        No customized properties configured.
                      </div>
                    ) : (
                      <div className="flex flex-col gap-3">
                        {pCustomFields.map((f, i) => (
                          <div key={i} className="grid grid-cols-12 gap-2 items-center bg-[#0D0D0D] p-2 rounded">
                            <input
                              type="text"
                              required
                              value={f.name}
                              onChange={(e) => updateCustomField(i, 'name', e.target.value)}
                              placeholder="e.g. Monogram Initials"
                              className="col-span-5 bg-black border border-[#C9A84C]/10 p-2 rounded text-xs"
                            />
                            <select
                              value={f.type}
                              onChange={(e) => updateCustomField(i, 'type', e.target.value)}
                              className="col-span-3 bg-black border border-[#C9A84C]/10 p-2 rounded text-xs"
                            >
                              <option value="text">Text Input</option>
                              <option value="file">Photo Upload</option>
                              <option value="select">Dropdown</option>
                            </select>
                            <label className="col-span-3 flex items-center justify-center gap-1 text-[9px] uppercase text-[#9A8F7E] font-bold cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={f.required}
                                onChange={(e) => updateCustomField(i, 'required', e.target.checked)}
                                className="w-3.5 h-3.5"
                              /> Req?
                            </label>
                            <button
                              type="button"
                              onClick={() => removeCustomField(i)}
                              className="col-span-1 text-red-400 hover:text-red-300 flex justify-center cursor-pointer"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="flex items-center gap-6 select-none border-t border-[#C9A84C]/5 pt-4">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[#F5F0E8]">
                    <input
                      type="checkbox"
                      checked={pFeatured}
                      onChange={(e) => setPFeatured(e.target.checked)}
                      className="w-4 h-4"
                    />
                    Featured Bestseller
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[#F5F0E8]">
                    <input
                      type="checkbox"
                      checked={pActive}
                      onChange={(e) => setPActive(e.target.checked)}
                      className="w-4 h-4"
                    />
                    Published Active
                  </label>
                </div>

                <div className="flex flex-col gap-1 border-t border-[#C9A84C]/5 pt-4">
                  <label className="text-[12px] font-sans font-medium text-[#9A8F7E] mb-1.5">Product Primary Image</label>
                  <div className="relative border border-dashed border-[#C9A84C]/25 hover:border-[#C9A84C] rounded-lg p-6 bg-[#0A0A0A]/40 flex flex-col items-center justify-center text-center cursor-pointer">
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

                {/* Collapsible SEO */}
                <div className="border-t border-[#C9A84C]/5 pt-4 space-y-4">
                  <h5 className="font-accent text-[9px] uppercase tracking-widest text-[#C9A84C] font-bold">Search Engine Optimization (SEO)</h5>
                  <div className="flex flex-col gap-1">
                    <label className="text-[12px] font-sans font-medium text-[#9A8F7E] mb-1.5">Meta Title</label>
                    <input
                      type="text"
                      value={pMetaTitle}
                      onChange={(e) => setPMetaTitle(e.target.value)}
                      placeholder="Meta title header"
                      className="bg-[#0A0A0A] border border-[#C9A84C]/15 h-11 px-4 rounded-lg text-white outline-none focus:border-[#C9A84C]"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[12px] font-sans font-medium text-[#9A8F7E] mb-1.5">Meta Description</label>
                    <input
                      type="text"
                      value={pMetaDescription}
                      onChange={(e) => setPMetaDescription(e.target.value)}
                      placeholder="Meta description summary"
                      className="bg-[#0A0A0A] border border-[#C9A84C]/15 h-11 px-4 rounded-lg text-white outline-none focus:border-[#C9A84C]"
                    />
                  </div>
                </div>
              </div>

              {/* Drawer Footer */}
              <div className="h-16 px-6 border-t border-[#C9A84C]/10 flex items-center justify-end gap-3 bg-[#0D0D0D] sticky bottom-0">
                <button
                  type="button"
                  onClick={resetProductForm}
                  className="px-5 py-2.5 border border-[#C9A84C]/20 hover:border-[#C9A84C] text-[#F5F0E8] rounded-lg font-accent text-[9px] uppercase tracking-widest font-extrabold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleProductSubmit}
                  className="px-8 py-2.5 bg-[#C9A84C] text-[#0A0A0A] rounded-lg font-accent text-[9px] uppercase tracking-widest font-extrabold hover:bg-[#F5F0E8] transition-colors cursor-pointer"
                >
                  {isEditing ? 'Save Changes' : 'Save Product'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="flex-grow flex w-full relative">
        
        {/* MOBILE SIDEBAR DRAWER */}
        <AnimatePresence>
          {mobileSidebarOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileSidebarOpen(false)}
                className="fixed inset-0 z-[150] bg-black lg:hidden"
              />
              {/* Drawer */}
              <motion.aside
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="fixed top-0 bottom-0 left-0 z-[200] w-[260px] bg-[#0D0D0D] border-[#C9A84C]/10 border-r flex flex-col justify-between select-none lg:hidden h-screen"
              >
                <div className="flex flex-col flex-grow min-h-0">
                  {/* Top header */}
                  <div className="h-16 px-5 border-b border-[#C9A84C]/8 flex items-center justify-between shrink-0">
                    <span className="font-display font-semibold tracking-wider text-[#C9A84C] text-lg uppercase">
                      ARTINOVA
                    </span>
                    <button 
                      onClick={() => setMobileSidebarOpen(false)}
                      className="text-[#9A8F7E] hover:text-[#C9A84C] p-1.5 hover:bg-[#C9A84C]/5 rounded cursor-pointer shrink-0"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  {/* Sidebar Navigation items */}
                  <div className="flex-grow overflow-y-auto custom-scrollbar py-4 px-3 flex flex-col gap-2">
                    {/* MAIN SECTION */}
                    <span className="text-[10px] tracking-widest text-[#9A8F7E]/40 font-bold font-sans uppercase px-3 pt-3">Main</span>
                    <button
                      onClick={() => { setActiveTab('overview'); setSelectedOrderId(null); setMobileSidebarOpen(false); }}
                      className={`flex items-center gap-3 h-12 px-3 rounded-lg font-sans text-[13px] font-medium transition-all duration-200 ${
                        activeTab === 'overview'
                          ? 'bg-[#C9A84C]/8 text-[#C9A84C] border-l-3 border-[#C9A84C]'
                          : 'text-[#9A8F7E] hover:bg-[#C9A84C]/4 hover:text-[#F5F0E8]'
                      }`}
                    >
                      <BarChart3 size={18} className="shrink-0" />
                      <span>Overview</span>
                    </button>

                    {/* CATALOG SECTION */}
                    <span className="text-[10px] tracking-widest text-[#9A8F7E]/40 font-bold font-sans uppercase px-3 pt-3">Catalog</span>
                    <button
                      onClick={() => { setActiveTab('products'); setSelectedOrderId(null); setMobileSidebarOpen(false); }}
                      className={`flex items-center gap-3 h-12 px-3 rounded-lg font-sans text-[13px] font-medium transition-all duration-200 ${
                        activeTab === 'products'
                          ? 'bg-[#C9A84C]/8 text-[#C9A84C] border-l-3 border-[#C9A84C]'
                          : 'text-[#9A8F7E] hover:bg-[#C9A84C]/4 hover:text-[#F5F0E8]'
                      }`}
                    >
                      <Package size={18} className="shrink-0" />
                      <span>Products</span>
                    </button>
                    <button
                      onClick={() => { setActiveTab('categories'); setSelectedOrderId(null); setMobileSidebarOpen(false); }}
                      className={`flex items-center gap-3 h-12 px-3 rounded-lg font-sans text-[13px] font-medium transition-all duration-200 ${
                        activeTab === 'categories'
                          ? 'bg-[#C9A84C]/8 text-[#C9A84C] border-l-3 border-[#C9A84C]'
                          : 'text-[#9A8F7E] hover:bg-[#C9A84C]/4 hover:text-[#F5F0E8]'
                      }`}
                    >
                      <FolderOpen size={18} className="shrink-0" />
                      <span>Categories</span>
                    </button>

                    {/* COMMERCE SECTION */}
                    <span className="text-[10px] tracking-widest text-[#9A8F7E]/40 font-bold font-sans uppercase px-3 pt-3">Commerce</span>
                    <button
                      onClick={() => { setActiveTab('orders'); setSelectedOrderId(null); setMobileSidebarOpen(false); }}
                      className={`flex items-center gap-3 h-12 px-3 rounded-lg font-sans text-[13px] font-medium transition-all duration-200 ${
                        activeTab === 'orders'
                          ? 'bg-[#C9A84C]/8 text-[#C9A84C] border-l-3 border-[#C9A84C]'
                          : 'text-[#9A8F7E] hover:bg-[#C9A84C]/4 hover:text-[#F5F0E8]'
                      }`}
                    >
                      <ShoppingBag size={18} className="shrink-0" />
                      <span>Orders</span>
                    </button>
                    <button
                      onClick={() => { setActiveTab('payments'); setSelectedOrderId(null); setMobileSidebarOpen(false); }}
                      className={`flex items-center gap-3 h-12 px-3 rounded-lg font-sans text-[13px] font-medium transition-all duration-200 ${
                        activeTab === 'payments'
                          ? 'bg-[#C9A84C]/8 text-[#C9A84C] border-l-3 border-[#C9A84C]'
                          : 'text-[#9A8F7E] hover:bg-[#C9A84C]/4 hover:text-[#F5F0E8]'
                      }`}
                    >
                      <CreditCard size={18} className="shrink-0" />
                      <span>Payments</span>
                    </button>
                    <button
                      onClick={() => { setActiveTab('customers'); setSelectedOrderId(null); setMobileSidebarOpen(false); }}
                      className={`flex items-center gap-3 h-12 px-3 rounded-lg font-sans text-[13px] font-medium transition-all duration-200 ${
                        activeTab === 'customers'
                          ? 'bg-[#C9A84C]/8 text-[#C9A84C] border-l-3 border-[#C9A84C]'
                          : 'text-[#9A8F7E] hover:bg-[#C9A84C]/4 hover:text-[#F5F0E8]'
                      }`}
                    >
                      <Users size={18} className="shrink-0" />
                      <span>Customers</span>
                    </button>

                    {/* OPERATIONS SECTION */}
                    <span className="text-[10px] tracking-widest text-[#9A8F7E]/40 font-bold font-sans uppercase px-3 pt-3">Operations</span>
                    <button
                      onClick={() => { setActiveTab('tracking'); setMobileSidebarOpen(false); }}
                      className={`flex items-center gap-3 h-12 px-3 rounded-lg font-sans text-[13px] font-medium transition-all duration-200 ${
                        activeTab === 'tracking'
                          ? 'bg-[#C9A84C]/8 text-[#C9A84C] border-l-3 border-[#C9A84C]'
                          : 'text-[#9A8F7E] hover:bg-[#C9A84C]/4 hover:text-[#F5F0E8]'
                      }`}
                    >
                      <Truck size={18} className="shrink-0" />
                      <span>Tracking</span>
                    </button>
                    <button
                      onClick={() => { setActiveTab('analytics'); setSelectedOrderId(null); setMobileSidebarOpen(false); }}
                      className={`flex items-center gap-3 h-12 px-3 rounded-lg font-sans text-[13px] font-medium transition-all duration-200 ${
                        activeTab === 'analytics'
                          ? 'bg-[#C9A84C]/8 text-[#C9A84C] border-l-3 border-[#C9A84C]'
                          : 'text-[#9A8F7E] hover:bg-[#C9A84C]/4 hover:text-[#F5F0E8]'
                      }`}
                    >
                      <PieChart size={18} className="shrink-0" />
                      <span>Analytics</span>
                    </button>

                    {/* SYSTEM SECTION */}
                    <span className="text-[10px] tracking-widest text-[#9A8F7E]/40 font-bold font-sans uppercase px-3 pt-3">System</span>
                    <button
                      onClick={() => { setActiveTab('settings'); setSelectedOrderId(null); setMobileSidebarOpen(false); }}
                      className={`flex items-center gap-3 h-12 px-3 rounded-lg font-sans text-[13px] font-medium transition-all duration-200 ${
                        activeTab === 'settings'
                          ? 'bg-[#C9A84C]/8 text-[#C9A84C] border-l-3 border-[#C9A84C]'
                          : 'text-[#9A8F7E] hover:bg-[#C9A84C]/4 hover:text-[#F5F0E8]'
                      }`}
                    >
                      <Settings size={18} className="shrink-0" />
                      <span>Settings</span>
                    </button>
                  </div>
                </div>

                {/* Bottom Sidebar: Admin User card */}
                <div className="p-4 border-t border-[#C9A84C]/8 shrink-0 bg-[#0A0A0A]/40">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-[#C9A84C]/10 border border-[#C9A84C]/35 flex items-center justify-center text-[#C9A84C] font-bold text-xs shrink-0">
                        {user?.full_name?.charAt(0) || 'A'}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-bold text-[#F5F0E8] truncate leading-tight">{user?.full_name || 'Studio Admin'}</span>
                        <span className="text-[10px] text-[#9A8F7E] truncate">{user?.email || 'akashselva18@gmail.com'}</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => { logout(); setMobileSidebarOpen(false); }}
                      className="text-[#9A8F7E] hover:text-red-400 p-1 rounded hover:bg-red-500/5 transition-colors cursor-pointer shrink-0"
                      title="Sign Out"
                    >
                      <LogOut size={14} />
                    </button>
                  </div>
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>
        
        {/* SIDEBAR: 240px width (collapsed: 64px) */}
        <aside className={`bg-[#0D0D0D] border-r border-[#C9A84C]/8 flex flex-col justify-between shrink-0 select-none transition-all duration-300 ${
          sidebarCollapsed ? 'w-16' : 'w-[240px]'
        } hidden lg:flex h-screen sticky top-0`}>
          
          <div className="flex flex-col flex-1 min-h-0">
            {/* Top Wordmark Logo: 64px height */}
            <div className="h-16 px-5 border-b border-[#C9A84C]/8 flex items-center justify-between shrink-0">
              <span className={`font-display font-semibold tracking-wider text-[#C9A84C] transition-opacity duration-200 uppercase ${
                sidebarCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100 text-lg'
              }`}>
                ARTINOVA
              </span>
              <button 
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="text-[#9A8F7E] hover:text-[#C9A84C] p-1.5 hover:bg-[#C9A84C]/5 rounded cursor-pointer shrink-0"
              >
                <ChevronDown size={14} className={`transform transition-transform duration-300 ${sidebarCollapsed ? 'rotate-90' : '-rotate-90'}`} />
              </button>
            </div>

            {/* Sidebar Navigation items with headers */}
            <div className="flex-grow overflow-y-auto custom-scrollbar py-4 px-3 flex flex-col gap-2">
              
              {/* MAIN SECTION */}
              {!sidebarCollapsed && <span className="text-[10px] tracking-widest text-[#9A8F7E]/40 font-bold font-sans uppercase px-3 pt-3">Main</span>}
              <button
                onClick={() => { setActiveTab('overview'); setSelectedOrderId(null); }}
                className={`flex items-center gap-3 h-12 px-3 rounded-lg font-sans text-[13px] font-medium transition-all duration-200 ${
                  activeTab === 'overview'
                    ? 'bg-[#C9A84C]/8 text-[#C9A84C] border-l-3 border-[#C9A84C]'
                    : 'text-[#9A8F7E] hover:bg-[#C9A84C]/4 hover:text-[#F5F0E8]'
                }`}
              >
                <BarChart3 size={18} className="shrink-0" />
                {!sidebarCollapsed && <span>Overview</span>}
              </button>

              {/* CATALOG SECTION */}
              {!sidebarCollapsed && <span className="text-[10px] tracking-widest text-[#9A8F7E]/40 font-bold font-sans uppercase px-3 pt-3">Catalog</span>}
              <button
                onClick={() => { setActiveTab('products'); setSelectedOrderId(null); }}
                className={`flex items-center gap-3 h-12 px-3 rounded-lg font-sans text-[13px] font-medium transition-all duration-200 ${
                  activeTab === 'products'
                    ? 'bg-[#C9A84C]/8 text-[#C9A84C] border-l-3 border-[#C9A84C]'
                    : 'text-[#9A8F7E] hover:bg-[#C9A84C]/4 hover:text-[#F5F0E8]'
                }`}
              >
                <Package size={18} className="shrink-0" />
                {!sidebarCollapsed && <span>Products</span>}
              </button>
              <button
                onClick={() => { setActiveTab('categories'); setSelectedOrderId(null); }}
                className={`flex items-center gap-3 h-12 px-3 rounded-lg font-sans text-[13px] font-medium transition-all duration-200 ${
                  activeTab === 'categories'
                    ? 'bg-[#C9A84C]/8 text-[#C9A84C] border-l-3 border-[#C9A84C]'
                    : 'text-[#9A8F7E] hover:bg-[#C9A84C]/4 hover:text-[#F5F0E8]'
                }`}
              >
                <FolderOpen size={18} className="shrink-0" />
                {!sidebarCollapsed && <span>Categories</span>}
              </button>

              {/* COMMERCE SECTION */}
              {!sidebarCollapsed && <span className="text-[10px] tracking-widest text-[#9A8F7E]/40 font-bold font-sans uppercase px-3 pt-3">Commerce</span>}
              <button
                onClick={() => { setActiveTab('orders'); setSelectedOrderId(null); }}
                className={`flex items-center gap-3 h-12 px-3 rounded-lg font-sans text-[13px] font-medium transition-all duration-200 ${
                  activeTab === 'orders'
                    ? 'bg-[#C9A84C]/8 text-[#C9A84C] border-l-3 border-[#C9A84C]'
                    : 'text-[#9A8F7E] hover:bg-[#C9A84C]/4 hover:text-[#F5F0E8]'
                }`}
              >
                <ShoppingBag size={18} className="shrink-0" />
                {!sidebarCollapsed && <span>Orders</span>}
              </button>
              <button
                onClick={() => { setActiveTab('payments'); setSelectedOrderId(null); }}
                className={`flex items-center gap-3 h-12 px-3 rounded-lg font-sans text-[13px] font-medium transition-all duration-200 ${
                  activeTab === 'payments'
                    ? 'bg-[#C9A84C]/8 text-[#C9A84C] border-l-3 border-[#C9A84C]'
                    : 'text-[#9A8F7E] hover:bg-[#C9A84C]/4 hover:text-[#F5F0E8]'
                }`}
              >
                <CreditCard size={18} className="shrink-0" />
                {!sidebarCollapsed && <span>Payments</span>}
              </button>
              <button
                onClick={() => { setActiveTab('customers'); setSelectedOrderId(null); }}
                className={`flex items-center gap-3 h-12 px-3 rounded-lg font-sans text-[13px] font-medium transition-all duration-200 ${
                  activeTab === 'customers'
                    ? 'bg-[#C9A84C]/8 text-[#C9A84C] border-l-3 border-[#C9A84C]'
                    : 'text-[#9A8F7E] hover:bg-[#C9A84C]/4 hover:text-[#F5F0E8]'
                }`}
              >
                <Users size={18} className="shrink-0" />
                {!sidebarCollapsed && <span>Customers</span>}
              </button>

              {/* OPERATIONS SECTION */}
              {!sidebarCollapsed && <span className="text-[10px] tracking-widest text-[#9A8F7E]/40 font-bold font-sans uppercase px-3 pt-3">Operations</span>}
              <button
                onClick={() => { setActiveTab('tracking'); }}
                className={`flex items-center gap-3 h-12 px-3 rounded-lg font-sans text-[13px] font-medium transition-all duration-200 ${
                  activeTab === 'tracking'
                    ? 'bg-[#C9A84C]/8 text-[#C9A84C] border-l-3 border-[#C9A84C]'
                    : 'text-[#9A8F7E] hover:bg-[#C9A84C]/4 hover:text-[#F5F0E8]'
                }`}
              >
                <Truck size={18} className="shrink-0" />
                {!sidebarCollapsed && <span>Tracking</span>}
              </button>
              <button
                onClick={() => { setActiveTab('analytics'); setSelectedOrderId(null); }}
                className={`flex items-center gap-3 h-12 px-3 rounded-lg font-sans text-[13px] font-medium transition-all duration-200 ${
                  activeTab === 'analytics'
                    ? 'bg-[#C9A84C]/8 text-[#C9A84C] border-l-3 border-[#C9A84C]'
                    : 'text-[#9A8F7E] hover:bg-[#C9A84C]/4 hover:text-[#F5F0E8]'
                }`}
              >
                <PieChart size={18} className="shrink-0" />
                {!sidebarCollapsed && <span>Analytics</span>}
              </button>

              {/* SYSTEM SECTION */}
              {!sidebarCollapsed && <span className="text-[10px] tracking-widest text-[#9A8F7E]/40 font-bold font-sans uppercase px-3 pt-3">System</span>}
              <button
                onClick={() => { setActiveTab('settings'); setSelectedOrderId(null); }}
                className={`flex items-center gap-3 h-12 px-3 rounded-lg font-sans text-[13px] font-medium transition-all duration-200 ${
                  activeTab === 'settings'
                    ? 'bg-[#C9A84C]/8 text-[#C9A84C] border-l-3 border-[#C9A84C]'
                    : 'text-[#9A8F7E] hover:bg-[#C9A84C]/4 hover:text-[#F5F0E8]'
                }`}
              >
                <Settings size={18} className="shrink-0" />
                {!sidebarCollapsed && <span>Settings</span>}
              </button>
            </div>
          </div>

          {/* Bottom Sidebar: Admin User card */}
          <div className="p-4 border-t border-[#C9A84C]/8 shrink-0 bg-[#0A0A0A]/40">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-[#C9A84C]/10 border border-[#C9A84C]/35 flex items-center justify-center text-[#C9A84C] font-bold text-xs shrink-0">
                  {user?.full_name?.charAt(0) || 'A'}
                </div>
                {!sidebarCollapsed && (
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold text-[#F5F0E8] truncate leading-tight">{user?.full_name || 'Studio Admin'}</span>
                    <span className="text-[10px] text-[#9A8F7E] truncate">{user?.email || 'akashselva18@gmail.com'}</span>
                  </div>
                )}
              </div>
              {!sidebarCollapsed && (
                <button 
                  onClick={logout}
                  className="text-[#9A8F7E] hover:text-red-400 p-1 rounded hover:bg-red-500/5 transition-colors cursor-pointer shrink-0"
                  title="Sign Out"
                >
                  <LogOut size={14} />
                </button>
              )}
            </div>
          </div>
        </aside>

        {/* WORKSPACE AREA */}
        <div className="flex-1 flex flex-col min-w-0">
          
          {/* TOP BAR: Height 64px, Background #0D0D0D */}
          <header className="h-16 px-6 md:px-8 bg-[#0D0D0D] border-b border-[#C9A84C]/8 flex items-center justify-between shrink-0 sticky top-0 z-[100] select-none">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setMobileSidebarOpen(true)}
                className="lg:hidden text-[#C9A84C] hover:text-[#F5F0E8] p-1.5 hover:bg-[#C9A84C]/5 rounded transition-colors"
                title="Open Navigation"
              >
                <Menu size={20} />
              </button>
              <h2 className="font-display text-lg md:text-xl font-bold text-[#F5F0E8] tracking-wide">
                {getPageTitle()}
              </h2>
            </div>
            
            <div className="flex items-center gap-5">
              <button className="relative p-2 text-[#9A8F7E] hover:text-[#C9A84C] hover:bg-[#C9A84C]/5 rounded-lg transition-colors cursor-pointer">
                <Bell size={18} />
                {pendingPayments > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-ping" />
                )}
              </button>
              <div className="h-5 w-[1px] bg-[#C9A84C]/15" />
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#C9A84C]/10 border border-[#C9A84C]/35 flex items-center justify-center text-[#C9A84C] font-bold text-xs shrink-0 select-none">
                  {user?.full_name?.charAt(0) || 'A'}
                </div>
                <span className="hidden md:inline text-xs font-medium text-[#F5F0E8]">{user?.full_name || 'Admin'}</span>
              </div>
            </div>
          </header>

          {/* MAIN CONTENT AREA: padding 32px (p-8) */}
          <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto max-w-full">
            
            {loading ? (
              <div className="h-full w-full flex flex-col items-center justify-center gap-4 text-[#9A8F7E]/65 py-20 select-none">
                <Loader2 className="animate-spin text-[#C9A84C]" size={36} />
                <span className="font-accent text-[10px] uppercase tracking-widest">Loading Dashboard Data...</span>
              </div>
            ) : (
              <>
                
                {/* 1. OVERVIEW DASHBOARD */}
                {activeTab === 'overview' && (
                  <div className="flex flex-col gap-8">
                    
                    {/* KPI Cards Row (4 cards) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 select-none">
                      
                      {/* KPI Card: Revenue */}
                      <div className="bg-[#111111] border border-[#C9A84C]/10 p-6 rounded-xl flex flex-col gap-2 shadow-md relative group hover:border-[#C9A84C]/25 transition-all duration-300 hover:-translate-y-1">
                        <div className="flex items-center justify-between">
                          <div className="w-10 h-10 rounded-full bg-[#C9A84C]/10 flex items-center justify-center text-[#C9A84C]">
                            <TrendingUp size={18} />
                          </div>
                          <span className="text-[10px] font-accent uppercase px-2 py-0.5 rounded bg-emerald-950/40 text-emerald-400 border border-emerald-500/20 font-bold font-mono">+18%</span>
                        </div>
                        <span className="font-display text-[32px] font-bold text-[#C9A84C] mt-2">₹{totalSales.toLocaleString()}</span>
                        <span className="text-[13px] text-[#9A8F7E] font-medium mt-1">Total Revenue</span>
                        <span className="text-[11px] text-emerald-400 font-sans font-medium mt-2 flex items-center gap-1">▲ +18% this month</span>
                      </div>

                      {/* KPI Card: Orders */}
                      <div className="bg-[#111111] border border-[#C9A84C]/10 p-6 rounded-xl flex flex-col gap-2 shadow-md relative group hover:border-[#C9A84C]/25 transition-all duration-300 hover:-translate-y-1">
                        <div className="flex items-center justify-between">
                          <div className="w-10 h-10 rounded-full bg-[#B8860B]/10 flex items-center justify-center text-[#B8860B]">
                            <ShoppingBag size={18} />
                          </div>
                          <span className="text-[10px] font-accent uppercase px-2 py-0.5 rounded bg-emerald-950/40 text-emerald-400 border border-emerald-500/20 font-bold font-mono">+8%</span>
                        </div>
                        <span className="font-display text-[32px] font-bold text-[#C9A84C] mt-2">{totalOrdersCount}</span>
                        <span className="text-[13px] text-[#9A8F7E] font-medium mt-1">Total Orders</span>
                        <span className="text-[11px] text-emerald-400 font-sans font-medium mt-2 flex items-center gap-1">▲ +8% this month</span>
                      </div>

                      {/* KPI Card: Customers */}
                      <div className="bg-[#111111] border border-[#C9A84C]/10 p-6 rounded-xl flex flex-col gap-2 shadow-md relative group hover:border-[#C9A84C]/25 transition-all duration-300 hover:-translate-y-1">
                        <div className="flex items-center justify-between">
                          <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                            <Users size={18} />
                          </div>
                          <span className="text-[10px] font-accent uppercase px-2 py-0.5 rounded bg-emerald-950/40 text-emerald-400 border border-emerald-500/20 font-bold font-mono">+12%</span>
                        </div>
                        <span className="font-display text-[32px] font-bold text-[#C9A84C] mt-2">{customers.length}</span>
                        <span className="text-[13px] text-[#9A8F7E] font-medium mt-1">New Customers</span>
                        <span className="text-[11px] text-emerald-400 font-sans font-medium mt-2 flex items-center gap-1">▲ +12% this month</span>
                      </div>

                      {/* KPI Card: Pending verify */}
                      <div className="bg-[#111111] border border-[#C9A84C]/10 p-6 rounded-xl flex flex-col gap-2 shadow-md relative group hover:border-[#C9A84C]/25 transition-all duration-300 hover:-translate-y-1">
                        <div className="flex items-center justify-between">
                          <div className="w-10 h-10 rounded-full bg-[#9A8F7E]/10 flex items-center justify-center text-[#9A8F7E]">
                            <CreditCard size={18} />
                          </div>
                          {pendingPayments > 0 && (
                            <span className="text-[10px] font-accent uppercase px-2 py-0.5 rounded bg-red-950/40 text-red-400 border border-red-500/20 font-bold font-mono animate-pulse">Action</span>
                          )}
                        </div>
                        <span className="font-display text-[32px] font-bold text-[#C9A84C] mt-2">{pendingPayments}</span>
                        <span className="text-[13px] text-[#9A8F7E] font-medium mt-1">Pending Payments</span>
                        <span className={`text-[11px] font-sans font-medium mt-2 ${pendingPayments > 0 ? 'text-amber-400' : 'text-[#9A8F7E]/50'}`}>
                          {pendingPayments > 0 ? '▲ Requires auditing verification' : 'All transactions cleared'}
                        </span>
                      </div>

                    </div>

                    {/* Charts Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                      
                      {/* Left Chart (60% width): Revenue Line Chart */}
                      <div className="lg:col-span-7 bg-[#111111] border border-[#C9A84C]/10 p-6 rounded-xl shadow-lg relative select-none">
                        <h3 className="font-accent text-xs font-bold uppercase tracking-widest text-[#C9A84C] mb-6 border-b border-[#C9A84C]/5 pb-3">
                          Revenue Line Analysis (14 Days)
                        </h3>
                        <div className="w-full h-72">
                          {salesHistoryData.length === 0 ? (
                            <div className="h-full flex items-center justify-center text-xs text-[#9A8F7E]/40 italic">
                              Insufficient order data to render chart projection.
                            </div>
                          ) : (
                            <ResponsiveContainer width="100%" height="100%">
                              <AreaChart data={salesHistoryData} margin={{ left: -10, right: 10 }}>
                                <defs>
                                  <linearGradient id="revenueGlow" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#C9A84C" stopOpacity={0.18}/>
                                    <stop offset="95%" stopColor="#C9A84C" stopOpacity={0}/>
                                  </linearGradient>
                                </defs>
                                <XAxis dataKey="date" stroke="#9A8F7E" fontSize={11} tickLine={false} />
                                <YAxis stroke="#9A8F7E" fontSize={11} tickLine={false} tickFormatter={(val) => `₹${val}`} />
                                <Tooltip 
                                  contentStyle={{ backgroundColor: '#111111', borderColor: '#C9A84C', borderRadius: '8px' }} 
                                  labelStyle={{ color: '#F5F0E8', fontWeight: 'bold' }} 
                                  itemStyle={{ color: '#C9A84C' }}
                                />
                                <Area type="monotone" dataKey="amount" stroke="#C9A84C" fillOpacity={1} fill="url(#revenueGlow)" strokeWidth={2} />
                              </AreaChart>
                            </ResponsiveContainer>
                          )}
                        </div>
                      </div>

                      {/* Right Chart (40% width): Donut Chart categories */}
                      <div className="lg:col-span-5 bg-[#111111] border border-[#C9A84C]/10 p-6 rounded-xl shadow-lg relative select-none flex flex-col justify-between min-h-[360px]">
                        <h3 className="font-accent text-xs font-bold uppercase tracking-widest text-[#C9A84C] mb-4 border-b border-[#C9A84C]/5 pb-3">
                          Orders by Category
                        </h3>
                        <div className="w-full h-56 relative flex items-center justify-center">
                          <ResponsiveContainer width="100%" height="100%">
                            <RechartsPieChart>
                              <Pie
                                data={categoriesData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={4}
                                dataKey="value"
                              >
                                {categoriesData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip contentStyle={{ backgroundColor: '#111111', borderColor: '#C9A84C', borderRadius: '8px' }} />
                            </RechartsPieChart>
                          </ResponsiveContainer>
                          <div className="absolute flex flex-col items-center justify-center text-center">
                            <span className="font-mono font-bold text-xl text-[#C9A84C]">{totalOrdersCount}</span>
                            <span className="text-[9px] uppercase tracking-widest text-[#9A8F7E] mt-0.5">Total Orders</span>
                          </div>
                        </div>
                        <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-4 font-sans text-xs text-[#9A8F7E]">
                          {categoriesData.map((c, i) => (
                            <div key={i} className="flex items-center gap-1.5">
                              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                              <span>{c.name} ({c.value})</span>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>

                    {/* Recent activity & quick actions */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start select-none">
                      
                      {/* Activity Feed */}
                      <div className="lg:col-span-8 bg-[#111111] border border-[#C9A84C]/10 p-6 rounded-xl flex flex-col gap-4">
                        <div className="flex justify-between items-center border-b border-[#C9A84C]/5 pb-3">
                          <h3 className="font-accent text-xs font-bold uppercase tracking-widest text-[#C9A84C]">Recent Studio Activity</h3>
                          <button onClick={() => setActiveTab('orders')} className="text-[10px] font-accent uppercase tracking-wider text-[#9A8F7E] hover:text-[#C9A84C]">View Orders</button>
                        </div>

                        <div className="flex flex-col">
                          {orders.slice(0, 5).map((ord, i) => (
                            <div key={ord.id} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                              <div className="flex items-center gap-3">
                                <span className={`w-2 h-2 rounded-full ${
                                  ord.payment_status === 'verified' ? 'bg-emerald-400' : 'bg-amber-400'
                                }`} />
                                <span className="font-sans text-xs text-[#F5F0E8]">
                                  Order <strong className="text-white">{ord.order_number}</strong> commissioned by {ord.shipping_name}
                                </span>
                              </div>
                              <span className="font-mono text-[11px] text-[#9A8F7E]/60">{formatDate(ord.created_at)}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Quick action buttons */}
                      <div className="lg:col-span-4 bg-[#111111] border border-[#C9A84C]/10 p-6 rounded-xl flex flex-col gap-4">
                        <h3 className="font-accent text-xs font-bold uppercase tracking-widest text-[#C9A84C] border-b border-[#C9A84C]/5 pb-3">Quick Actions</h3>
                        <div className="flex flex-col gap-3">
                          <button
                            onClick={() => { setActiveTab('products'); setShowProductForm(true); }}
                            className="w-full h-11 bg-[#C9A84C] text-[#0A0A0A] font-accent text-[9px] font-extrabold uppercase tracking-widest rounded-lg hover:bg-[#F5F0E8] transition-colors cursor-pointer text-center flex items-center justify-center gap-2"
                          >
                            <Plus size={14} /> Add Product
                          </button>
                          <button
                            onClick={() => setActiveTab('payments')}
                            className="w-full h-11 border border-[#C9A84C]/20 text-white font-accent text-[9px] font-bold uppercase tracking-widest rounded-lg hover:bg-[#C9A84C]/5 transition-colors cursor-pointer text-center flex items-center justify-center gap-2"
                          >
                            Verify Payments ({pendingPayments} pending)
                          </button>
                          <button
                            onClick={() => setActiveTab('tracking')}
                            className="w-full h-11 border border-[#C9A84C]/20 text-[#9A8F7E] hover:text-[#C9A84C] font-accent text-[9px] font-bold uppercase tracking-widest rounded-lg hover:bg-[#C9A84C]/5 transition-colors cursor-pointer text-center flex items-center justify-center gap-2"
                          >
                            Logistics Management
                          </button>
                        </div>
                      </div>

                    </div>

                  </div>
                )}

                {/* 2. PRODUCTS MANAGER */}
                {activeTab === 'products' && (
                  <div className="flex flex-col gap-6">
                    
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#C9A84C]/10 pb-4">
                      <div>
                        <h3 className="font-display text-xl font-bold text-white">Boutique Creations Catalog</h3>
                        <span className="text-xs text-[#9A8F7E]">{filteredProducts.length} total products filtered</span>
                      </div>
                      <button
                        onClick={() => { setShowProductForm(true); setIsEditing(false); }}
                        className="flex items-center gap-2 px-5 py-3 rounded-lg bg-[#C9A84C] text-[#0A0A0A] font-accent text-[9px] font-extrabold uppercase tracking-widest hover:bg-[#F5F0E8] transition-all cursor-pointer shadow-md shrink-0"
                      >
                        <Plus size={13} /> Add Product
                      </button>
                    </div>

                    {/* Filters bar */}
                    <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-y border-[#C9A84C]/5">
                      <div className="flex flex-wrap items-center gap-3">
                        <input
                          type="text"
                          value={productSearch}
                          onChange={(e) => setProductSearch(e.target.value)}
                          placeholder="Search products..."
                          className="bg-[#111111] border border-[#C9A84C]/15 h-10 px-4 rounded-lg text-xs placeholder-[#9A8F7E]/40 w-[280px] outline-none focus:border-[#C9A84C]"
                        />
                        <select
                          value={productCategoryFilter}
                          onChange={(e) => setProductCategoryFilter(e.target.value)}
                          className="bg-[#111111] border border-[#C9A84C]/15 h-10 px-3 rounded-lg text-xs outline-none focus:border-[#C9A84C]"
                        >
                          <option value="all">All Categories</option>
                          <option value="cat-frames">Luxury Frames</option>
                          <option value="cat-hampers">Premium Hampers</option>
                          <option value="cat-art">Resin Art</option>
                          <option value="cat-accessories">Accessories</option>
                          <option value="cat-keepsakes">Keepsakes</option>
                        </select>
                        <select
                          value={productStatusFilter}
                          onChange={(e) => setProductStatusFilter(e.target.value)}
                          className="bg-[#111111] border border-[#C9A84C]/15 h-10 px-3 rounded-lg text-xs outline-none focus:border-[#C9A84C]"
                        >
                          <option value="all">All Statuses</option>
                          <option value="active">Active</option>
                          <option value="draft">Draft</option>
                        </select>
                      </div>

                      {selectedProductIds.length > 0 && (
                        <div className="flex items-center gap-2 select-none">
                          <span className="text-xs text-[#9A8F7E] font-medium">{selectedProductIds.length} Selected:</span>
                          <button onClick={handleBulkDelete} className="px-3 py-2 border border-red-500/20 hover:border-red-400 text-red-400 hover:bg-red-500/5 text-[10px] font-accent uppercase tracking-widest rounded-lg cursor-pointer transition-colors">
                            Delete
                          </button>
                          <button onClick={() => handleBulkStatusChange(true)} className="px-3 py-2 border border-[#C9A84C]/25 text-[#C9A84C] hover:bg-[#C9A84C]/5 text-[10px] font-accent uppercase tracking-widest rounded-lg cursor-pointer transition-colors">
                            Activate
                          </button>
                          <button onClick={() => handleBulkStatusChange(false)} className="px-3 py-2 border border-[#C9A84C]/20 text-[#9A8F7E] hover:bg-white/5 text-[10px] font-accent uppercase tracking-widest rounded-lg cursor-pointer transition-colors">
                            Draft
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Table */}
                    <div className="bg-[#111111] border border-[#C9A84C]/10 rounded-xl overflow-x-auto shadow-xl">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-[#C9A84C]/15 bg-black/40 font-accent text-[9px] uppercase tracking-widest text-[#9A8F7E] font-extrabold select-none">
                            <th className="p-4 w-12 text-center">
                              <button onClick={toggleSelectAllProducts} className="text-[#C9A84C] cursor-pointer">
                                {filteredProducts.every(p => selectedProductIds.includes(p.id)) ? (
                                  <CheckSquare size={16} />
                                ) : (
                                  <Square size={16} />
                                )}
                              </button>
                            </th>
                            <th className="p-4">Product</th>
                            <th className="p-4">Category</th>
                            <th className="p-4">Price</th>
                            <th className="p-4">Stock</th>
                            <th className="p-4">Status</th>
                            <th className="p-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredProducts.map(prod => (
                            <tr key={prod.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors group">
                              <td className="p-4 text-center">
                                <button onClick={() => toggleSelectProduct(prod.id)} className="text-[#C9A84C] cursor-pointer">
                                  {selectedProductIds.includes(prod.id) ? (
                                    <CheckSquare size={16} />
                                  ) : (
                                    <Square size={16} />
                                  )}
                                </button>
                              </td>
                              <td className="p-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-12 h-12 rounded-lg overflow-hidden border border-[#C9A84C]/15 bg-black shrink-0 select-none">
                                    <img src={prod.images?.[0] || 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=300'} alt={prod.name} className="w-full h-full object-cover" />
                                  </div>
                                  <div className="flex flex-col min-w-0 font-sans">
                                    <span className="font-bold text-[#F5F0E8] truncate text-sm">{prod.name}</span>
                                    <span className="text-[10px] text-[#9A8F7E] truncate mt-0.5">#{prod.slug}</span>
                                  </div>
                                </div>
                              </td>
                              <td className="p-4 text-[#9A8F7E] text-xs font-medium uppercase font-sans tracking-wide">
                                {prod.category_id?.replace('cat-', '')}
                              </td>
                              <td className="p-4 font-mono font-bold text-xs text-[#C9A84C]">
                                ₹{prod.price?.toLocaleString()}
                              </td>
                              <td className="p-4">
                                <span className={`font-mono text-xs font-bold ${
                                  prod.stock > 10 ? 'text-green-400' : prod.stock > 0 ? 'text-amber-400' : 'text-red-400'
                                }`}>
                                  {prod.stock > 0 ? prod.stock : 'Out of Stock'}
                                </span>
                              </td>
                              <td className="p-4 select-none">
                                <span className={`px-2.5 py-1 rounded-full text-[9px] font-accent font-extrabold border ${
                                  prod.is_active 
                                    ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                                    : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                }`}>
                                  {prod.is_active ? 'Active' : 'Draft'}
                                </span>
                              </td>
                              <td className="p-4 text-right select-none">
                                <div className="flex items-center justify-end gap-2 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-200">
                                  <button
                                    onClick={() => handleEditProductInit(prod)}
                                    className="p-2 border border-[#C9A84C]/25 text-[#C9A84C] hover:bg-[#C9A84C]/10 rounded-lg cursor-pointer transition-colors"
                                    title="Edit product record"
                                  >
                                    <Edit2 size={12} />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteProduct(prod.id)}
                                    className="p-2 border border-red-500/25 text-red-400 hover:bg-red-500/10 rounded-lg cursor-pointer transition-colors"
                                    title="Delete product"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                  </div>
                )}

                {/* 3. CATEGORIES INDEX */}
                {activeTab === 'categories' && (
                  <div className="flex flex-col gap-6">
                    <div className="border-b border-[#C9A84C]/10 pb-4">
                      <h3 className="font-display text-xl font-bold text-white">Collections Category Index</h3>
                      <span className="text-xs text-[#9A8F7E]">Catalog structure based on custom categorizations</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {[
                        { id: 'cat-frames', name: 'Luxury Frames', desc: 'Custom memory frames cast in optical-grade crystal resin.' },
                        { id: 'cat-hampers', name: 'Premium Hampers', desc: 'Bespoke corporate and wedding hampers containing curated keepsakes.' },
                        { id: 'cat-art', name: 'Resin Art Masterpieces', desc: 'Liquid-gold geode resin wall clocks and centerpieces.' },
                        { id: 'cat-accessories', name: 'Custom Accessories', desc: 'Handcrafted keychains, coasters, and small personalized keepsakes.' },
                        { id: 'cat-keepsakes', name: 'Bespoke Keepsakes', desc: 'Individually commissioned luxury keepsakes for events.' }
                      ].map(cat => {
                        const count = products.filter(p => p.category_id === cat.id).length;
                        return (
                          <div key={cat.id} className="bg-[#111111] border border-[#C9A84C]/10 p-6 rounded-xl flex flex-col justify-between gap-4 shadow-md hover:border-[#C9A84C]/25 transition-all">
                            <div className="flex flex-col gap-1.5">
                              <div className="flex items-center justify-between">
                                <span className="font-display text-lg font-bold text-white">{cat.name}</span>
                                <span className="font-mono text-xs text-[#C9A84C] bg-[#C9A84C]/10 px-2 py-0.5 rounded-md font-bold">{count} Products</span>
                              </div>
                              <p className="text-xs text-[#9A8F7E] mt-2 font-body leading-relaxed">{cat.desc}</p>
                            </div>
                            <button
                              onClick={() => {
                                setProductCategoryFilter(cat.id);
                                setActiveTab('products');
                              }}
                              className="w-full mt-2 py-2 bg-[#0A0A0A] border border-[#C9A84C]/20 hover:border-[#C9A84C] text-[#C9A84C] text-[10px] font-accent uppercase tracking-widest rounded-lg cursor-pointer hover:bg-[#C9A84C]/5 transition-colors"
                            >
                              Explore Items
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 4. CLIENT ORDERS */}
                {activeTab === 'orders' && (
                  <div className="flex flex-col gap-6">
                    
                    {/* Orders Sub-View (Selected Order Details) */}
                    {selectedOrderId ? (
                      <div className="flex flex-col gap-6">
                        
                        {/* Header back */}
                        <div className="flex justify-between items-center border-b border-[#C9A84C]/10 pb-4">
                          <button
                            onClick={() => setSelectedOrderId(null)}
                            className="inline-flex items-center gap-2 text-xs font-accent uppercase tracking-widest text-[#9A8F7E] hover:text-[#C9A84C] transition-colors cursor-pointer"
                          >
                            &larr; Back to Orders list
                          </button>
                          <span className="font-accent text-xs font-bold text-[#C9A84C]">Logistics stage manager</span>
                        </div>

                        {/* Split 60/40 detail grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                          
                          {/* Left Details column (60%) */}
                          <div className="lg:col-span-7 flex flex-col gap-6">
                            
                            {/* Ordered Items card */}
                            <div className="bg-[#111111] border border-[#C9A84C]/10 p-6 rounded-xl shadow-lg relative flex flex-col gap-4">
                              <h4 className="font-accent text-[11px] uppercase tracking-widest text-[#C9A84C] font-bold border-b border-[#C9A84C]/5 pb-2">Ordered Creations</h4>
                              {itemsLoading ? (
                                <div className="flex items-center gap-2 py-6 text-xs text-[#9A8F7E]/50">
                                  <Loader2 className="animate-spin text-[#C9A84C]" size={14} /> Loading items...
                                </div>
                              ) : (
                                <div className="flex flex-col gap-4">
                                  {selectedOrderItems.map(item => (
                                    <div key={item.id} className="flex gap-4 items-center py-3 border-b border-[#C9A84C]/5 last:border-0 pb-4">
                                      <div className="relative w-12 h-12 rounded-lg border border-[#C9A84C]/10 overflow-hidden shrink-0 bg-black">
                                        <img src={item.product_image || item.product?.images?.[0] || 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=300'} alt={item.product_name} className="w-full h-full object-cover" />
                                      </div>
                                      <div className="flex-grow min-w-0 font-sans text-xs">
                                        <div className="flex justify-between font-bold text-white mb-0.5">
                                          <span className="truncate">{item.product_name}</span>
                                          <span className="font-mono text-[#C9A84C]">x{item.quantity} &bull; ₹{(item.price * item.quantity).toLocaleString()}</span>
                                        </div>
                                        {item.customization && (
                                          <div className="mt-2 p-2.5 bg-black border border-[#C9A84C]/10 rounded-lg text-[10px] text-[#9A8F7E] tracking-wide leading-relaxed font-mono">
                                            {item.customization.engravingText && <div>Engraving: <span className="text-white italic normal-case font-body font-normal">"{item.customization.engravingText}"</span></div>}
                                            {item.customization.variantSize && <div>Size Variant: <span className="text-white">{item.customization.variantSize}</span></div>}
                                            {item.customization.photoUrl && <div>Custom Photo: <a href={item.customization.photoUrl} target="_blank" className="text-[#C9A84C] underline">View upload</a></div>}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Customer information card */}
                            <div className="bg-[#111111] border border-[#C9A84C]/10 p-6 rounded-xl shadow-lg relative flex flex-col gap-3">
                              <h4 className="font-accent text-[11px] uppercase tracking-widest text-[#C9A84C] font-bold border-b border-[#C9A84C]/5 pb-2">Customer Profile</h4>
                              <div className="grid grid-cols-2 gap-4 text-xs font-sans text-[#9A8F7E]">
                                <div className="flex flex-col gap-0.5">
                                  <span>Client Name</span>
                                  <strong className="text-white text-sm">{orders.find(o => o.id === selectedOrderId)?.shipping_name}</strong>
                                </div>
                                <div className="flex flex-col gap-0.5">
                                  <span>Phone Coordinates</span>
                                  <strong className="text-white text-sm">{orders.find(o => o.id === selectedOrderId)?.shipping_phone}</strong>
                                </div>
                                <div className="col-span-2 flex flex-col gap-0.5 border-t border-[#C9A84C]/5 pt-3">
                                  <span>Email Address</span>
                                  <strong className="text-white text-sm font-mono">{orders.find(o => o.id === selectedOrderId)?.shipping_email}</strong>
                                </div>
                              </div>
                            </div>

                            {/* Delivery Address card */}
                            <div className="bg-[#111111] border border-[#C9A84C]/10 p-6 rounded-xl shadow-lg relative flex flex-col gap-3">
                              <h4 className="font-accent text-[11px] uppercase tracking-widest text-[#C9A84C] font-bold border-b border-[#C9A84C]/5 pb-2">Delivery Address</h4>
                              <div className="text-xs text-[#9A8F7E] leading-relaxed font-sans font-medium">
                                <p className="text-white text-sm font-semibold">{orders.find(o => o.id === selectedOrderId)?.shipping_address?.split('.')[0]}</p>
                                <p className="mt-1">{orders.find(o => o.id === selectedOrderId)?.shipping_address?.split('.').slice(1).join('.')}</p>
                              </div>
                            </div>

                            {/* Internal notes card */}
                            <div className="bg-[#111111] border border-[#C9A84C]/10 p-6 rounded-xl shadow-lg relative flex flex-col gap-3">
                              <h4 className="font-accent text-[11px] uppercase tracking-widest text-[#C9A84C] font-bold border-b border-[#C9A84C]/5 pb-2">Internal notes</h4>
                              <textarea
                                rows={2}
                                value={internalNotes}
                                onChange={(e) => setInternalNotes(e.target.value)}
                                placeholder="Admin annotations (e.g. corrected photo uploader, custom packaging approved)"
                                className="bg-[#0A0A0A] border border-[#C9A84C]/15 p-3 rounded-lg text-xs text-white placeholder-[#9A8F7E]/30 focus:border-[#C9A84C] outline-none font-sans resize-none leading-relaxed"
                              />
                            </div>

                          </div>

                          {/* Right Controls column (40%) */}
                          <div className="lg:col-span-5 flex flex-col gap-6">
                            
                            {/* Order Summary card */}
                            <div className="bg-[#111111] border border-[#C9A84C]/10 p-6 rounded-xl shadow-lg relative flex flex-col gap-3 select-none">
                              <h4 className="font-accent text-[11px] uppercase tracking-widest text-[#C9A84C] font-bold border-b border-[#C9A84C]/5 pb-2">Order Summary</h4>
                              <div className="flex flex-col gap-2.5 font-sans text-xs text-[#9A8F7E]">
                                <div className="flex justify-between">
                                  <span>Order ID</span>
                                  <strong className="text-white font-mono">{orders.find(o => o.id === selectedOrderId)?.order_number}</strong>
                                </div>
                                <div className="flex justify-between">
                                  <span>Date & Time</span>
                                  <strong className="text-white">{formatDate(orders.find(o => o.id === selectedOrderId)?.created_at || '')}</strong>
                                </div>
                                <div className="flex justify-between border-t border-white/5 pt-2">
                                  <span>Subtotal</span>
                                  <strong className="text-white">₹{orders.find(o => o.id === selectedOrderId)?.subtotal?.toLocaleString()}</strong>
                                </div>
                                <div className="flex justify-between">
                                  <span>GST (18% inclusive)</span>
                                  <strong className="text-white">₹{orders.find(o => o.id === selectedOrderId)?.gst?.toLocaleString()}</strong>
                                </div>
                                <div className="flex justify-between border-t border-white/5 pt-2 items-end">
                                  <span className="text-[#C9A84C] font-bold">Total (large gold)</span>
                                  <strong className="text-xl font-bold text-[#C9A84C] font-display">₹{orders.find(o => o.id === selectedOrderId)?.total?.toLocaleString()}</strong>
                                </div>
                              </div>
                            </div>

                            {/* Payment status card */}
                            <div className="bg-[#111111] border border-[#C9A84C]/10 p-6 rounded-xl shadow-lg relative flex flex-col gap-4">
                              <h4 className="font-accent text-[11px] uppercase tracking-widest text-[#C9A84C] font-bold border-b border-[#C9A84C]/5 pb-2">Payment Audit</h4>
                              {orders.find(o => o.id === selectedOrderId)?.payment_screenshot_url ? (
                                <div 
                                  onClick={() => setActiveScreenshot(orders.find(o => o.id === selectedOrderId)?.payment_screenshot_url || null)}
                                  className="relative group w-full h-40 rounded-lg border border-[#C9A84C]/15 bg-black overflow-hidden flex items-center justify-center cursor-zoom-in select-none"
                                >
                                  <img src={orders.find(o => o.id === selectedOrderId)?.payment_screenshot_url} alt="Slip" className="object-contain max-h-full max-w-full" />
                                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-[#C9A84C] font-accent text-[9px] font-bold uppercase tracking-widest">
                                    <Eye size={12} className="mr-1.5" /> Zoom Slip
                                  </div>
                                </div>
                              ) : (
                                <div className="w-full h-32 bg-black/45 border border-red-500/15 rounded-lg flex items-center justify-center text-red-400 text-xs font-bold uppercase select-none">
                                  Screenshot slip missing
                                </div>
                              )}

                              <div className="flex items-center justify-between text-xs text-[#9A8F7E] select-none py-1 border-t border-white/5">
                                <span>Audit Status:</span>
                                <span className={`px-2.5 py-0.5 rounded text-[9px] font-accent uppercase tracking-widest font-extrabold border ${
                                  orders.find(o => o.id === selectedOrderId)?.payment_status === 'verified' 
                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25' 
                                    : 'bg-amber-500/10 text-amber-400 border-amber-500/25'
                                }`}>
                                  {orders.find(o => o.id === selectedOrderId)?.payment_status}
                                </span>
                              </div>

                              {orders.find(o => o.id === selectedOrderId)?.payment_status !== 'verified' && (
                                <div className="flex gap-3 mt-1 select-none">
                                  <button
                                    onClick={() => handleVerifyPayment(selectedOrderId)}
                                    className="flex-grow h-11 bg-[#C9A84C] hover:bg-[#F5F0E8] text-[#0A0A0A] font-accent text-[9px] font-extrabold uppercase tracking-widest rounded-lg cursor-pointer transition-colors"
                                  >
                                    Verify Payment
                                  </button>
                                  <button
                                    onClick={() => handleRejectPaymentClick(selectedOrderId)}
                                    className="px-4 h-11 border border-red-500/25 hover:border-red-400 text-red-400 hover:bg-red-500/5 font-accent text-[9px] uppercase tracking-widest rounded-lg cursor-pointer transition-colors"
                                  >
                                    Reject
                                  </button>
                                </div>
                              )}
                            </div>

                            {/* Order logistics status card */}
                            <div className="bg-[#111111] border border-[#C9A84C]/10 p-6 rounded-xl shadow-lg relative flex flex-col gap-4">
                              <h4 className="font-accent text-[11px] uppercase tracking-widest text-[#C9A84C] font-bold border-b border-[#C9A84C]/5 pb-2">Logistics Updates</h4>
                              
                              <div className="flex flex-col gap-3 font-sans text-xs">
                                <div className="flex flex-col gap-1.5">
                                  <label className="text-[10px] uppercase tracking-widest text-[#9A8F7E] font-bold">Courier Partner</label>
                                  <input
                                    type="text"
                                    value={courierName}
                                    onChange={(e) => setCourierName(e.target.value)}
                                    placeholder="e.g. DHL Express / Blue Dart"
                                    className="bg-[#0A0A0A] border border-[#C9A84C]/15 h-10 px-3 rounded-lg text-white"
                                  />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                  <label className="text-[10px] uppercase tracking-widest text-[#9A8F7E] font-bold">AWB Tracking Number</label>
                                  <input
                                    type="text"
                                    value={trackingNumber}
                                    onChange={(e) => setTrackingNumber(e.target.value)}
                                    placeholder="AWB Tracking number"
                                    className="bg-[#0A0A0A] border border-[#C9A84C]/15 h-10 px-3 rounded-lg text-white"
                                  />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                  <label className="text-[10px] uppercase tracking-widest text-[#9A8F7E] font-bold">Update Note / Custom Log</label>
                                  <input
                                    type="text"
                                    value={timelineNote}
                                    onChange={(e) => setTimelineNote(e.target.value)}
                                    placeholder="e.g. Crafting finished, preparing dispatch..."
                                    className="bg-[#0A0A0A] border border-[#C9A84C]/15 h-10 px-3 rounded-lg text-white"
                                  />
                                </div>
                              </div>

                              <div className="flex flex-col gap-2 mt-2 select-none">
                                <span className="text-[10px] uppercase tracking-widest text-[#9A8F7E] font-bold">Advance Status Node:</span>
                                <div className="grid grid-cols-2 gap-2">
                                  {STEPS.map(step => {
                                    const isCurrent = step.key === orders.find(o => o.id === selectedOrderId)?.order_status;
                                    return (
                                      <button
                                        key={step.key}
                                        type="button"
                                        disabled={isCurrent}
                                        onClick={() => handleUpdatePipeline(selectedOrderId, step.key)}
                                        className={`py-2 px-1 border rounded-lg text-[9px] font-accent uppercase tracking-widest transition-all cursor-pointer ${
                                          isCurrent 
                                            ? 'bg-[#C9A84C] border-[#C9A84C] text-[#0A0A0A] font-extrabold shadow-[0_0_8px_rgba(201,168,76,0.3)]' 
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

                            {/* Notifications / Communication card */}
                            <div className="bg-[#111111] border border-[#C9A84C]/10 p-6 rounded-xl shadow-lg relative flex flex-col gap-3 select-none">
                              <h4 className="font-accent text-[11px] uppercase tracking-widest text-[#C9A84C] font-bold border-b border-[#C9A84C]/5 pb-2">Patron Communication</h4>
                              <div className="flex flex-col gap-2">
                                <a
                                  href={`https://wa.me/${orders.find(o => o.id === selectedOrderId)?.shipping_phone?.replace(/[^0-9]/g, '')}`}
                                  target="_blank"
                                  className="w-full h-11 bg-emerald-600 hover:bg-emerald-500 text-white font-accent text-[9px] font-bold uppercase tracking-widest rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                                >
                                  📱 WhatsApp Customer
                                </a>
                                <a
                                  href={`mailto:${orders.find(o => o.id === selectedOrderId)?.shipping_email}`}
                                  className="w-full h-11 border border-[#C9A84C]/25 text-[#C9A84C] hover:border-[#C9A84C] hover:bg-[#C9A84C]/5 font-accent text-[9px] font-bold uppercase tracking-widest rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                                >
                                  ✉️ Email Customer
                                </a>
                              </div>
                            </div>

                          </div>

                        </div>

                      </div>
                    ) : (
                      
                      // Orders List view
                      <div className="flex flex-col gap-6">
                        
                        {/* Filter Tabs */}
                        <div className="flex items-center gap-2 border-b border-white/5 pb-2 select-none overflow-x-auto">
                          {['all', 'received', 'verified', 'shipped', 'delivered'].map((tab) => (
                            <button
                              key={tab}
                              onClick={() => setProductStatusFilter(tab)}
                              className={`px-4 py-2 border rounded-full text-[10px] font-accent uppercase tracking-widest transition-all cursor-pointer ${
                                productStatusFilter === tab 
                                  ? 'bg-[#C9A84C] text-[#0A0A0A] border-[#C9A84C] font-extrabold' 
                                  : 'border-[#C9A84C]/15 text-[#9A8F7E] hover:border-[#C9A84C]/45'
                              }`}
                            >
                              {tab}
                            </button>
                          ))}
                        </div>

                        {/* List grid */}
                        <div className="bg-[#111111] border border-[#C9A84C]/10 rounded-xl overflow-x-auto shadow-xl">
                          <table className="w-full text-left border-collapse font-sans text-xs">
                            <thead>
                              <tr className="border-b border-[#C9A84C]/15 bg-black/40 font-accent text-[9px] uppercase tracking-widest text-[#9A8F7E] font-extrabold select-none">
                                <th className="p-4">Order ID</th>
                                <th className="p-4">Customer</th>
                                <th className="p-4">Amount</th>
                                <th className="p-4">Payment</th>
                                <th className="p-4">Logistics Status</th>
                                <th className="p-4 text-right">Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {orders
                                .filter(o => productStatusFilter === 'all' || o.order_status === productStatusFilter)
                                .map(ord => (
                                  <tr key={ord.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.01] transition-colors">
                                    <td className="p-4 font-mono font-bold text-[#C9A84C]">
                                      {ord.order_number}
                                    </td>
                                    <td className="p-4">
                                      <div className="flex flex-col font-sans">
                                        <span className="font-bold text-white text-sm">{ord.shipping_name}</span>
                                        <span className="text-[10px] text-[#9A8F7E] mt-0.5">{ord.shipping_email}</span>
                                      </div>
                                    </td>
                                    <td className="p-4 font-mono font-bold text-[#C9A84C] text-sm">
                                      ₹{ord.total?.toLocaleString()}
                                    </td>
                                    <td className="p-4 select-none">
                                      <span className={`px-2 py-0.5 rounded text-[8px] uppercase tracking-widest font-extrabold border ${
                                        ord.payment_status === 'verified' 
                                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25' 
                                          : 'bg-amber-500/10 text-amber-400 border-amber-500/25'
                                      }`}>
                                        {ord.payment_status}
                                      </span>
                                    </td>
                                    <td className="p-4 select-none">
                                      <span className="bg-[#C9A84C]/10 border border-[#C9A84C]/25 text-[#C9A84C] px-2 py-0.5 rounded text-[8px] font-accent uppercase tracking-widest font-extrabold">
                                        {getStatusText(ord.order_status)}
                                      </span>
                                    </td>
                                    <td className="p-4 text-right select-none">
                                      <button
                                        onClick={() => setSelectedOrderId(ord.id)}
                                        className="px-3.5 py-2 border border-[#C9A84C]/20 hover:border-[#C9A84C] text-[#C9A84C] text-[9px] font-accent uppercase tracking-widest rounded-lg cursor-pointer transition-colors"
                                      >
                                        Manage
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                            </tbody>
                          </table>
                        </div>

                      </div>
                    )}

                  </div>
                )}

                {/* 5. PAYMENTS REVIEW TAB */}
                {activeTab === 'payments' && (
                  <div className="flex flex-col gap-6">
                    <div className="border-b border-[#C9A84C]/10 pb-4">
                      <h3 className="font-display text-xl font-bold text-white">Manual GPay Payments Auditing</h3>
                      <span className="text-xs text-[#9A8F7E]">Validate transactions screenshots submitted by buyers</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {orders
                        .filter(o => o.payment_status !== 'verified')
                        .map(order => (
                          <div key={order.id} className="bg-[#111111] border border-[#C9A84C]/10 p-5 rounded-xl flex flex-col gap-4 shadow-md">
                            
                            <div className="flex justify-between items-start border-b border-white/5 pb-2 select-none font-sans">
                              <div className="flex flex-col">
                                <span className="font-bold text-white text-sm">{order.shipping_name}</span>
                                <span className="text-[10px] text-[#9A8F7E] mt-0.5">Order ID: #{order.order_number}</span>
                              </div>
                              <span className="font-mono font-bold text-sm text-[#C9A84C]">₹{order.total?.toLocaleString()}</span>
                            </div>

                            {order.payment_screenshot_url ? (
                              <div
                                onClick={() => setActiveScreenshot(order.payment_screenshot_url || null)}
                                className="relative group w-full h-36 rounded-lg border border-[#C9A84C]/15 bg-black overflow-hidden flex items-center justify-center cursor-zoom-in select-none"
                              >
                                <img src={order.payment_screenshot_url} alt="Receipt slip" className="object-contain max-h-full max-w-full" />
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-[#C9A84C] font-accent text-[9px] font-bold uppercase tracking-widest">
                                  <Eye size={12} className="mr-1.5" /> Inspect Receipt
                                </div>
                              </div>
                            ) : (
                              <div className="w-full h-32 bg-black/45 border border-red-500/15 rounded-lg flex items-center justify-center text-red-400 text-xs font-bold uppercase select-none">
                                Receipt slip screenshot missing
                              </div>
                            )}

                            <div className="flex gap-2 justify-end select-none mt-1">
                              <button
                                onClick={() => handleVerifyPayment(order.id)}
                                className="flex-grow h-10 bg-[#C9A84C] text-[#0A0A0A] font-accent text-[9px] font-extrabold uppercase tracking-widest rounded-lg cursor-pointer transition-colors"
                              >
                                Approve Payment
                              </button>
                              <button
                                onClick={() => handleRejectPaymentClick(order.id)}
                                className="px-4 h-10 border border-red-500/25 hover:border-red-400 text-red-400 hover:bg-red-500/5 font-accent text-[9px] uppercase tracking-widest rounded-lg cursor-pointer transition-colors"
                              >
                                Reject
                              </button>
                            </div>

                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* 6. REGISTERED PATRONS */}
                {activeTab === 'customers' && (
                  <div className="flex flex-col gap-6">
                    <div className="flex justify-between items-center border-b border-[#C9A84C]/10 pb-4">
                      <div>
                        <h3 className="font-display text-xl font-bold text-white">Registered Patrons Base</h3>
                        <span className="text-xs text-[#9A8F7E]">{customers.length} total customer accounts logged</span>
                      </div>
                      <button
                        onClick={handleExportCSV}
                        className="px-4 py-2.5 border border-[#C9A84C]/25 text-[#C9A84C] hover:border-[#C9A84C] hover:bg-[#C9A84C]/5 font-accent text-[9px] font-extrabold uppercase tracking-widest rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer select-none"
                      >
                        <Download size={12} /> Export CSV
                      </button>
                    </div>

                    <div className="bg-[#111111] border border-[#C9A84C]/10 rounded-xl overflow-x-auto shadow-xl">
                      <table className="w-full text-left border-collapse font-sans text-xs">
                        <thead>
                          <tr className="border-b border-[#C9A84C]/15 bg-black/40 font-accent text-[9px] uppercase tracking-widest text-[#9A8F7E] font-extrabold select-none">
                            <th className="p-4">Patron</th>
                            <th className="p-4">Contact</th>
                            <th className="p-4 text-center">Orders Count</th>
                            <th className="p-4 text-right">Lifetime Spent</th>
                            <th className="p-4 text-right">Joined Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {customers.map((c, i) => (
                            <tr key={i} className="border-b border-white/5 last:border-0 hover:bg-white/[0.01] transition-colors">
                              <td className="p-4 flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-[#C9A84C]/10 border border-[#C9A84C]/25 flex items-center justify-center text-[#C9A84C] font-bold text-xs shrink-0 select-none">
                                  {c.full_name?.charAt(0) || 'P'}
                                </div>
                                <span className="font-bold text-white">{c.full_name || 'Bespoke Patron'}</span>
                              </td>
                              <td className="p-4 text-[#9A8F7E] font-mono text-[11px]">
                                <div>{c.email}</div>
                                <div className="mt-0.5 text-[#9A8F7E]/50">{c.phone || 'No PhoneCoordinates'}</div>
                              </td>
                              <td className="p-4 text-center font-bold text-white font-mono">{c.ordersCount}</td>
                              <td className="p-4 text-right font-bold text-[#C9A84C] font-mono">₹{c.totalSpent?.toLocaleString()}</td>
                              <td className="p-4 text-right text-[#9A8F7E] font-sans">{formatDate(c.joined)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* 7. TRACKING MANAGEMENT */}
                {activeTab === 'tracking' && (
                  <div className="flex flex-col gap-6">
                    
                    {/* Visual Timeline and updates log for selected order */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                      
                      {/* Left: Orders list chooser (5 cols) */}
                      <div className="lg:col-span-5 bg-[#111111] border border-[#C9A84C]/10 p-5 rounded-xl shadow-lg flex flex-col gap-4 select-none">
                        <h4 className="font-accent text-[11px] uppercase tracking-widest text-[#C9A84C] font-bold border-b border-[#C9A84C]/5 pb-2">Orders Pipeline Registry</h4>
                        <div className="flex flex-col gap-2 max-h-[500px] overflow-y-auto pr-1">
                          {orders.map(order => {
                            const isSelected = order.id === selectedOrderId;
                            return (
                              <div
                                key={order.id}
                                onClick={() => setSelectedOrderId(order.id)}
                                className={`p-4 rounded-lg border transition-all duration-200 cursor-pointer ${
                                  isSelected 
                                    ? 'bg-[#C9A84C]/8 border-[#C9A84C] shadow-[0_0_10px_rgba(201,168,76,0.1)]' 
                                    : 'bg-[#0A0A0A] border-[#C9A84C]/10 hover:border-[#C9A84C]/30'
                                }`}
                              >
                                <div className="flex justify-between items-start font-sans">
                                  <span className="font-mono text-xs font-bold text-white">{order.order_number}</span>
                                  <span className="text-[10px] text-[#C9A84C] font-semibold bg-[#C9A84C]/10 px-2 py-0.5 rounded uppercase tracking-wider">{getStatusText(order.order_status)}</span>
                                </div>
                                <div className="text-xs text-[#9A8F7E] mt-2 font-medium">
                                  {order.shipping_name} &bull; ₹{order.total?.toLocaleString()}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Right: Selected order vertical timeline tracker (7 cols) */}
                      <div className="lg:col-span-7 bg-[#111111] border border-[#C9A84C]/10 p-6 rounded-xl shadow-lg">
                        <h4 className="font-accent text-[11px] uppercase tracking-widest text-[#C9A84C] font-bold border-b border-[#C9A84C]/5 pb-2 mb-6">
                          Visual Tracking Timeline
                        </h4>

                        {selectedOrderId ? (
                          <div className="flex flex-col gap-8">
                            
                            {/* Vertical Timeline Nodes */}
                            <div className="flex flex-col relative pl-6 font-sans">
                              {/* Left line spacer */}
                              <div className="absolute left-[7px] top-2 bottom-2 w-[2px] bg-[#161616]" />

                              {STEPS.map((step, idx) => {
                                const currentStatus = orders.find(o => o.id === selectedOrderId)?.order_status || 'received';
                                
                                // Determine state
                                const stepIndices = STEPS.map(s => s.key);
                                const currentIdx = stepIndices.indexOf(currentStatus);
                                const thisIdx = stepIndices.indexOf(step.key);

                                const isCompleted = thisIdx < currentIdx;
                                const isActive = step.key === currentStatus;
                                const isUpcoming = thisIdx > currentIdx;

                                // Fetch timestamp from db timeline logs if matched
                                const timelineLog = selectedOrderTimeline.find(t => t.stage === step.key);
                                const timestampText = timelineLog ? formatDate(timelineLog.created_at) : '';
                                const logNote = timelineLog ? timelineLog.note : '';

                                return (
                                  <div key={step.key} className="relative pb-8 last:pb-0">
                                    
                                    {/* Timeline Node Symbol */}
                                    <div className="absolute -left-[25px] top-1">
                                      {isCompleted ? (
                                        <div className="w-4 h-4 rounded-full bg-[#C9A84C] flex items-center justify-center text-[10px] text-[#0A0A0A] font-bold">
                                          ✓
                                        </div>
                                      ) : isActive ? (
                                        <div className="w-4 h-4 rounded-full bg-[#0A0A0A] border-2 border-[#C9A84C] ring-4 ring-[#C9A84C]/25 animate-pulse" />
                                      ) : (
                                        <div className="w-4 h-4 rounded-full bg-[#0D0D0D] border border-white/10" />
                                      )}
                                    </div>

                                    {/* Content info block */}
                                    <div className="flex flex-col gap-1">
                                      <div className="flex justify-between items-baseline gap-4">
                                        <span className={`text-sm font-semibold tracking-wide font-sans ${
                                          isCompleted || isActive ? 'text-white' : 'text-[#9A8F7E]/40'
                                        }`}>
                                          {step.label}
                                        </span>
                                        {timestampText && (
                                          <span className="text-[11px] text-[#9A8F7E]/50 font-mono">
                                            {timestampText}
                                          </span>
                                        )}
                                      </div>
                                      {logNote && (
                                        <p className="text-xs text-[#9A8F7E]/75 italic mt-1 leading-relaxed font-body">
                                          &ldquo;{logNote}&rdquo;
                                        </p>
                                      )}
                                    </div>

                                  </div>
                                );
                              })}
                            </div>

                            {/* Timeline Node Form controller */}
                            <div className="border-t border-[#C9A84C]/10 pt-6 flex flex-col gap-4">
                              <h5 className="font-accent text-[10px] uppercase tracking-widest text-[#C9A84C] font-bold">Logistics Update Portal</h5>
                              
                              <div className="flex flex-col gap-3 text-xs">
                                <div className="flex flex-col gap-1">
                                  <label className="text-[10px] uppercase text-[#9A8F7E] font-bold mb-1">Update Log Description Note</label>
                                  <input
                                    type="text"
                                    value={timelineNote}
                                    onChange={(e) => setTimelineNote(e.target.value)}
                                    placeholder="e.g. Mold pouring finished successfully. Curing geode..."
                                    className="bg-[#0A0A0A] border border-[#C9A84C]/15 h-10 px-3 rounded-lg text-white"
                                  />
                                </div>
                                <div className="flex flex-col gap-1">
                                  <label className="text-[10px] uppercase text-[#9A8F7E] font-bold mb-1">AWB / Courier Info (Shipped stage only)</label>
                                  <div className="grid grid-cols-2 gap-2">
                                    <input
                                      type="text"
                                      value={courierName}
                                      onChange={(e) => setCourierName(e.target.value)}
                                      placeholder="Courier: Blue Dart"
                                      className="bg-[#0A0A0A] border border-[#C9A84C]/15 h-10 px-3 rounded-lg text-white"
                                    />
                                    <input
                                      type="text"
                                      value={trackingNumber}
                                      onChange={(e) => setTrackingNumber(e.target.value)}
                                      placeholder="AWB tracking #"
                                      className="bg-[#0A0A0A] border border-[#C9A84C]/15 h-10 px-3 rounded-lg text-white"
                                    />
                                  </div>
                                </div>
                              </div>

                              <div className="flex flex-wrap gap-2 select-none pt-2">
                                {STEPS.map(step => {
                                  const currentStatus = orders.find(o => o.id === selectedOrderId)?.order_status || 'received';
                                  const isCurrent = step.key === currentStatus;
                                  return (
                                    <button
                                      key={step.key}
                                      type="button"
                                      disabled={isCurrent}
                                      onClick={() => handleUpdatePipeline(selectedOrderId, step.key)}
                                      className={`py-2 px-3 border rounded-lg text-[9px] font-accent uppercase tracking-widest transition-all cursor-pointer ${
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
                        ) : (
                          <div className="text-center py-20 text-xs text-[#9A8F7E]/40 italic">
                            Select any order ID from the pipeline to audit tracking.
                          </div>
                        )}
                      </div>

                    </div>

                  </div>
                )}

                {/* 8. ANALYTICS PAGE */}
                {activeTab === 'analytics' && (
                  <div className="flex flex-col gap-8">
                    
                    <div className="bg-[#111111] border border-[#C9A84C]/10 p-6 rounded-xl shadow-lg relative select-none">
                      <h3 className="font-accent text-xs font-bold uppercase tracking-widest text-[#C9A84C] mb-6 border-b border-[#C9A84C]/5 pb-3">
                        Historical Revenue Analysis
                      </h3>
                      
                      <div className="w-full h-80">
                        {salesHistoryData.length === 0 ? (
                          <div className="h-full flex items-center justify-center text-xs text-[#9A8F7E]/40 italic">
                            No Sales record present.
                          </div>
                        ) : (
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={salesHistoryData} margin={{ left: -10, right: 10 }}>
                              <defs>
                                <linearGradient id="analyticsGlow" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#C9A84C" stopOpacity={0.25}/>
                                  <stop offset="95%" stopColor="#C9A84C" stopOpacity={0}/>
                                </linearGradient>
                              </defs>
                              <XAxis dataKey="date" stroke="#9A8F7E" fontSize={11} tickLine={false} />
                              <YAxis stroke="#9A8F7E" fontSize={11} tickLine={false} />
                              <Tooltip contentStyle={{ backgroundColor: '#111111', borderColor: '#C9A84C' }} labelStyle={{ color: '#F5F0E8' }} />
                              <Area type="monotone" dataKey="amount" stroke="#C9A84C" fillOpacity={1} fill="url(#analyticsGlow)" strokeWidth={2} />
                            </AreaChart>
                          </ResponsiveContainer>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      
                      {/* Products performance */}
                      <div className="bg-[#111111] border border-[#C9A84C]/10 p-6 rounded-xl shadow-lg relative flex flex-col gap-4 select-none">
                        <h3 className="font-accent text-xs font-bold uppercase tracking-widest text-[#C9A84C] border-b border-[#C9A84C]/5 pb-3">
                          Creations Inventory Index
                        </h3>
                        <div className="flex flex-col gap-4 text-xs font-sans text-[#9A8F7E]">
                          <div className="flex justify-between items-center py-2 border-b border-[#C9A84C]/5">
                            <span>Creations in Catalog</span>
                            <strong className="text-white">{productsCount} products</strong>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-[#C9A84C]/5">
                            <span>Pending verification orders</span>
                            <strong className="text-white">{pendingPayments} orders</strong>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-[#C9A84C]/5">
                            <span>Average Gifting invoice</span>
                            <strong className="text-white">₹{orders.length > 0 ? Math.round(totalSales / orders.length).toLocaleString() : 0}</strong>
                          </div>
                        </div>
                      </div>

                      {/* Export buttons */}
                      <div className="bg-[#111111] border border-[#C9A84C]/10 p-6 rounded-xl shadow-lg relative flex flex-col gap-4 select-none">
                        <h3 className="font-accent text-xs font-bold uppercase tracking-widest text-[#C9A84C] border-b border-[#C9A84C]/5 pb-3">
                          Boutique Exports desk
                        </h3>
                        <div className="flex flex-col gap-3">
                          <button
                            onClick={handleExportCSV}
                            className="w-full h-11 border border-[#C9A84C]/25 text-[#C9A84C] hover:border-[#C9A84C] hover:bg-[#C9A84C]/5 font-accent text-[9px] font-extrabold uppercase tracking-widest rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <Download size={14} /> Export customer records CSV
                          </button>
                        </div>
                      </div>

                    </div>

                  </div>
                )}

                {/* 8. SYSTEM CONFIG SETTINGS */}
                {activeTab === 'settings' && (
                  <div className="flex flex-col gap-8 max-w-2xl">
                    
                    <form onSubmit={handleSaveSettings} className="bg-[#111111] border border-[#C9A84C]/10 p-6 rounded-xl flex flex-col gap-5 shadow-xl font-body">
                      
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-sans font-semibold text-[#9A8F7E]">Manual GPay UPI ID</label>
                        <input
                          type="text"
                          required
                          value={setUpiId}
                          onChange={(e) => setSetUpiId(e.target.value)}
                          className="bg-[#0A0A0A] border border-[#C9A84C]/15 h-11 px-4 rounded-lg text-white"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-sans font-semibold text-[#9A8F7E]">GPay QR Image Scanner URL (Base64/HTTPS)</label>
                        <input
                          type="text"
                          required
                          value={setQrUrl}
                          onChange={(e) => setSetQrUrl(e.target.value)}
                          className="bg-[#0A0A0A] border border-[#C9A84C]/15 h-11 px-4 rounded-lg text-white"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-sans font-semibold text-[#9A8F7E]">WhatsApp Business Number</label>
                        <input
                          type="text"
                          required
                          value={setWaNumber}
                          onChange={(e) => setSetWaNumber(e.target.value)}
                          className="bg-[#0A0A0A] border border-[#C9A84C]/15 h-11 px-4 rounded-lg text-white"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[11px] font-sans font-semibold text-[#9A8F7E]">GST standard rate (%)</label>
                          <input
                            type="number"
                            required
                            value={setGstRate}
                            onChange={(e) => setSetGstRate(e.target.value)}
                            className="bg-[#0A0A0A] border border-[#C9A84C]/15 h-11 px-4 rounded-lg text-white"
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[11px] font-sans font-semibold text-[#9A8F7E]">Free Shipping threshold (₹)</label>
                          <input
                            type="number"
                            required
                            value={setThreshold}
                            onChange={(e) => setSetThreshold(e.target.value)}
                            className="bg-[#0A0A0A] border border-[#C9A84C]/15 h-11 px-4 rounded-lg text-white"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="mt-4 w-full h-12 bg-[#C9A84C] text-[#0A0A0A] font-accent text-[9px] font-extrabold uppercase tracking-widest rounded-lg hover:bg-[#F5F0E8] transition-colors cursor-pointer text-center"
                      >
                        Save Configuration Registry
                      </button>

                    </form>

                  </div>
                )}

              </>
            )}

          </main>
        </div>

      </div>
    </div>
  );
}
