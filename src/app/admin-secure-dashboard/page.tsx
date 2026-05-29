'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  getProducts, createProduct, updateProduct, deleteProduct, Product,
  getOrders, updateOrderStatus, getOrderItems, Order, OrderItem
} from '../../lib/db';
import { 
  Plus, Trash2, Edit2, ShieldAlert, DollarSign, Package, ShoppingCart, 
  Users, Upload, Eye, X, Check, ArrowRight, Loader2, Sparkles, TrendingUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const STEPS = [
  'Order received',
  'Crafting in progress',
  'Quality check',
  'Packed',
  'Shipped',
  'Out for delivery',
  'Delivered'
];

export default function AdminDashboardPage() {
  const { user, isAdmin, setLoginModalOpen, loginWithGoogle, logout } = useApp();
  
  // Dashboard sections tabs
  const [activeTab, setActiveTab] = useState<'analytics' | 'products' | 'orders'>('analytics');
  
  // Data states
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states (Add/Edit Product)
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [pTitle, setPTitle] = useState('');
  const [pPrice, setPPrice] = useState('');
  const [pDescription, setPDescription] = useState('');
  const [pCategory, setPCategory] = useState('Royal Box');
  const [pStock, setPStock] = useState('10');
  const [pImageBase64, setPImageBase64] = useState<string>('');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showProductForm, setShowProductForm] = useState(false);
  
  // Expand Order Details
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [expandedOrderItems, setExpandedOrderItems] = useState<OrderItem[]>([]);
  const [itemsLoading, setItemsLoading] = useState(false);
  
  // View Screenshot Modal
  const [activeScreenshot, setActiveScreenshot] = useState<string | null>(null);

  // Status updating comments state
  const [statusComment, setStatusComment] = useState('');

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    async function loadData(showLoading = true) {
      if (isAdmin) {
        if (showLoading) setLoading(true);
        try {
          const prods = await getProducts();
          const ords = await getOrders();
          setProducts(prods);
          setOrders(ords);
        } catch (err) {
          console.error(err);
        } finally {
          if (showLoading) setLoading(false);
        }
      }
    }
    loadData(true);

    const handleFocus = () => {
      loadData(false);
    };
    window.addEventListener('focus', handleFocus);

    if (isAdmin) {
      interval = setInterval(() => {
        loadData(false);
      }, 2000);
    }

    return () => {
      window.removeEventListener('focus', handleFocus);
      if (interval) clearInterval(interval);
    };
  }, [isAdmin]);

  // Load order items on expand
  const handleExpandOrder = async (orderId: string) => {
    if (expandedOrderId === orderId) {
      setExpandedOrderId(null);
      setExpandedOrderItems([]);
      return;
    }

    setExpandedOrderId(orderId);
    setItemsLoading(true);
    try {
      const items = await getOrderItems(orderId);
      setExpandedOrderItems(items);
    } catch (err) {
      console.error(err);
    } finally {
      setItemsLoading(false);
    }
  };

  // Convert image to base64
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setUploadError('Image size exceeds 2MB limit.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setPImageBase64(reader.result as string);
    };
    reader.onerror = () => {
      setUploadError('Failed to read image file.');
    };
    reader.readAsDataURL(file);
  };

  // Create or Update Product
  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pTitle || !pPrice) return;

    try {
      const productPayload = {
        title: pTitle,
        price: parseFloat(pPrice),
        description: pDescription,
        category: pCategory,
        stock: parseInt(pStock),
        images: pImageBase64 ? [pImageBase64] : ['https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800']
      };

      if (isEditing && editId) {
        await updateProduct(editId, productPayload);
      } else {
        await createProduct(productPayload);
      }

      // Reload
      const fresh = await getProducts();
      setProducts(fresh);
      
      // Reset form
      resetForm();
    } catch (err) {
      console.error(err);
    }
  };

  const resetForm = () => {
    setPTitle('');
    setPPrice('');
    setPDescription('');
    setPCategory('Royal Box');
    setPStock('10');
    setPImageBase64('');
    setIsEditing(false);
    setEditId(null);
    setShowProductForm(false);
  };

  const handleEditInit = (product: Product) => {
    setPTitle(product.title);
    setPPrice(product.price.toString());
    setPDescription(product.description);
    setPCategory(product.category);
    setPStock(product.stock.toString());
    setPImageBase64(product.images[0] || '');
    setIsEditing(true);
    setEditId(product.id);
    setShowProductForm(true);
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm('Are you sure you want to permanently delete this product?')) {
      const ok = await deleteProduct(id);
      if (ok) {
        setProducts(products.filter(p => p.id !== id));
      }
    }
  };

  // Update tracking status
  const handleStatusChange = async (orderId: string, newStatus: string) => {
    const comment = statusComment || `Order status updated to: ${newStatus}`;
    const ok = await updateOrderStatus(orderId, newStatus, comment);
    if (ok) {
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      setStatusComment('');
      alert(`Order status updated to ${newStatus}`);
    }
  };

  // Auth gate
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#070913] text-[#fafafa] flex flex-col relative overflow-hidden font-poppins select-none">
        {/* Top Header */}
        <header className="w-full py-4 px-6 md:px-12 flex items-center justify-between border-b border-royal-gold/15 bg-[#090b1a]/85 backdrop-blur-md z-50 shrink-0">
          {/* Left: Brand */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 text-royal-gold shrink-0">
              <svg viewBox="0 0 100 100" className="w-full h-full text-royal-gold filter drop-shadow-[0_0_10px_rgba(212,175,55,0.4)]">
                <path d="M 40,50 C 25,48 10,40 10,25 C 10,20 20,18 28,26 C 33,31 38,40 40,47" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M 42,52 C 28,48 15,44 14,33 C 14,29 22,28 29,33 C 34,37 39,45 42,50" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M 60,50 C 75,48 90,40 90,25 C 90,20 80,18 72,26 C 67,31 62,40 60,47" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M 58,52 C 72,48 85,44 86,33 C 86,29 78,28 71,33 C 66,37 61,45 58,50" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <rect x="42" y="52" width="16" height="16" rx="1.5" fill="none" stroke="currentColor" strokeWidth="2.5" />
                <path d="M 40,52 L 60,52 M 50,52 L 50,68" stroke="currentColor" strokeWidth="2" />
                <polygon points="50,38 52,43 57,45 52,47 50,52 48,47 43,45 48,43" fill="currentColor" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="font-cinzel text-sm font-bold tracking-[0.2em] text-gold-gradient leading-none">
                ARTINOVA
              </span>
              <span className="font-poppins text-[8px] uppercase tracking-[0.3em] text-royal-gold/60 mt-0.5">
                Admin Portal
              </span>
            </div>
          </div>

          {/* Center: Administration Mode Pill */}
          <div className="hidden sm:block border border-royal-gold/40 bg-royal-gold/5 px-4 py-1.5 rounded-full text-[9px] uppercase tracking-[0.2em] text-royal-gold font-bold font-poppins">
            ADMINISTRATION MODE
          </div>

          {/* Right: Tamil & DarkMode */}
          <div className="flex items-center gap-4">
            <button className="border border-royal-gold/40 bg-royal-gold/5 px-3 py-1 rounded text-[9px] font-poppins font-bold uppercase tracking-wider text-royal-gold">
              TAMIL
            </button>
            <button className="text-soft-ivory/60 hover:text-royal-gold transition-colors">
              <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
              </svg>
            </button>
          </div>
        </header>

        {/* Main centered box */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 bg-gradient-to-b from-[#090b16] to-[#04050a] relative">
          {/* Toast Notification */}
          <div className="absolute top-8 right-8 flex items-center gap-2.5 bg-[#0b2b1b] border border-emerald-500/20 text-emerald-200 px-4 py-3 rounded shadow-lg z-50 text-xs font-poppins">
            <div className="w-4 h-4 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-300">✓</div>
            <span>System ready for verification.</span>
          </div>

          {/* Card */}
          <div className="w-full max-w-sm bg-[#0a0c1a]/95 border border-royal-gold/15 rounded-2xl p-8 flex flex-col items-center text-center shadow-[0_15px_40px_rgba(0,0,0,0.5)] relative overflow-hidden">
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-royal-gold/5 rounded-full blur-3xl pointer-events-none" />

            {/* Gold Lock Icon */}
            <div className="w-20 h-20 rounded-full bg-[#11142a]/80 border border-royal-gold/20 flex items-center justify-center text-royal-gold shadow-[0_0_20px_rgba(212,175,55,0.05)] mb-6">
              <svg viewBox="0 0 24 24" width="36" height="36" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            </div>

            <h2 className="font-cinzel text-2xl font-bold tracking-wider text-soft-ivory mb-2">
              Admin Portal
            </h2>
            <p className="font-poppins text-xs text-soft-ivory/50 mb-8 max-w-[240px]">
              Sign in with your admin credentials.
            </p>

            {/* Google Sign In Button */}
            <button
              onClick={loginWithGoogle}
              className="w-full bg-[#fafafa] text-[#070708] py-3.5 px-6 rounded-lg font-poppins text-xs font-bold uppercase tracking-wider hover:bg-champagne-gold hover:shadow-[0_0_15px_rgba(255,255,255,0.3)] transition-all duration-300 flex items-center justify-center gap-3 cursor-pointer"
            >
              <svg viewBox="0 0 24 24" width="16" height="16" className="shrink-0">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  fill="#EA4335"
                />
              </svg>
              Sign in with Google
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Analytics helper metrics
  const totalSales = orders.reduce((sum, o) => sum + o.total_amount, 0);
  const totalOrdersCount = orders.length;
  const productsCount = products.length;
  // Unique customers based on email
  const customersCount = new Set(orders.map(o => o.shipping_email.toLowerCase())).size;

  return (
    <div className="min-h-screen bg-[#070913] text-[#fafafa] flex flex-col relative overflow-hidden font-poppins">
      
      {/* Top Header */}
      <header className="w-full py-4 px-6 md:px-12 flex items-center justify-between border-b border-royal-gold/15 bg-[#090b1a]/85 backdrop-blur-md z-50 shrink-0 select-none">
        {/* Left: Brand */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 text-royal-gold shrink-0">
            <svg viewBox="0 0 100 100" className="w-full h-full text-royal-gold filter drop-shadow-[0_0_10px_rgba(212,175,55,0.4)]">
              <path d="M 40,50 C 25,48 10,40 10,25 C 10,20 20,18 28,26 C 33,31 38,40 40,47" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M 42,52 C 28,48 15,44 14,33 C 14,29 22,28 29,33 C 34,37 39,45 42,50" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <path d="M 60,50 C 75,48 90,40 90,25 C 90,20 80,18 72,26 C 67,31 62,40 60,47" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M 58,52 C 72,48 85,44 86,33 C 86,29 78,28 71,33 C 66,37 61,45 58,50" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <rect x="42" y="52" width="16" height="16" rx="1.5" fill="none" stroke="currentColor" strokeWidth="2.5" />
              <path d="M 40,52 L 60,52 M 50,52 L 50,68" stroke="currentColor" strokeWidth="2" />
              <polygon points="50,38 52,43 57,45 52,47 50,52 48,47 43,45 48,43" fill="currentColor" />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="font-cinzel text-sm font-bold tracking-[0.2em] text-gold-gradient leading-none">
              ARTINOVA
            </span>
            <span className="font-poppins text-[8px] uppercase tracking-[0.3em] text-royal-gold/60 mt-0.5">
              Admin Portal
            </span>
          </div>
        </div>

        {/* Center: Administration Mode Pill */}
        <div className="hidden sm:block border border-royal-gold/40 bg-royal-gold/5 px-4 py-1.5 rounded-full text-[9px] uppercase tracking-[0.2em] text-royal-gold font-bold font-poppins">
          ADMINISTRATION MODE
        </div>

        {/* Right: Profile Pic, Logout, Tamil, DarkMode */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-royal-gold/15 border border-royal-gold/30 flex items-center justify-center text-[10px] font-bold text-royal-gold uppercase select-none">
              {user?.full_name?.charAt(0) || 'D'}
            </div>
            <button
              onClick={logout}
              className="text-[10px] font-poppins font-bold uppercase tracking-wider text-soft-ivory/60 hover:text-red-400 transition-colors cursor-pointer"
            >
              Logout
            </button>
          </div>
          <button className="border border-royal-gold/40 bg-royal-gold/5 px-3 py-1 rounded text-[9px] font-poppins font-bold uppercase tracking-wider text-royal-gold">
            TAMIL
          </button>
          <button className="text-soft-ivory/60 hover:text-royal-gold transition-colors">
            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
            </svg>
          </button>
        </div>
      </header>

      {/* Main Workspace: Sidebar + Content */}
      <div className="flex-grow flex w-full relative overflow-hidden">
        
        {/* Sidebar */}
        <aside className="w-64 bg-[#090b1a] border-r border-royal-gold/15 p-6 flex flex-col justify-between shrink-0 select-none">
          <div className="flex flex-col gap-8">
            <div className="flex items-center gap-3 pb-6 border-b border-royal-gold/10">
              <div className="w-10 h-10 rounded-full bg-royal-gold/15 border border-royal-gold/35 flex items-center justify-center text-royal-gold text-lg font-bold">
                {user?.full_name?.charAt(0) || 'D'}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-poppins text-xs font-bold text-soft-ivory truncate">
                  {user?.full_name || 'deepaksabari'}
                </span>
                <span className="font-poppins text-[10px] text-soft-ivory/40 truncate">
                  {user?.email || 'deepaksabari28@gmail.com'}
                </span>
              </div>
            </div>

            <nav className="flex flex-col gap-2">
              <button
                onClick={() => setActiveTab('analytics')}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-lg text-xs font-poppins font-semibold transition-all border cursor-pointer text-left ${
                  activeTab === 'analytics'
                    ? 'bg-royal-gold/10 text-royal-gold border-royal-gold/30'
                    : 'text-soft-ivory/50 hover:bg-royal-gold/5 hover:text-soft-ivory border-transparent'
                }`}
              >
                <span className="w-4 h-4 flex items-center justify-center shrink-0">
                  <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="7" height="9"></rect>
                    <rect x="14" y="3" width="7" height="5"></rect>
                    <rect x="14" y="12" width="7" height="9"></rect>
                    <rect x="3" y="16" width="7" height="5"></rect>
                  </svg>
                </span>
                Dashboard
              </button>

              <button
                onClick={() => setActiveTab('products')}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-lg text-xs font-poppins font-semibold transition-all border cursor-pointer text-left ${
                  activeTab === 'products'
                    ? 'bg-royal-gold/10 text-royal-gold border-royal-gold/30'
                    : 'text-soft-ivory/50 hover:bg-royal-gold/5 hover:text-soft-ivory border-transparent'
                }`}
              >
                <span className="w-4 h-4 flex items-center justify-center shrink-0">
                  <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                  </svg>
                </span>
                Manage Products
              </button>

              <button
                onClick={() => setActiveTab('orders')}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-lg text-xs font-poppins font-semibold transition-all border cursor-pointer text-left ${
                  activeTab === 'orders'
                    ? 'bg-royal-gold/10 text-royal-gold border-royal-gold/30'
                    : 'text-soft-ivory/50 hover:bg-royal-gold/5 hover:text-soft-ivory border-transparent'
                }`}
              >
                <span className="w-4 h-4 flex items-center justify-center shrink-0">
                  <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="9" cy="21" r="1"></circle>
                    <circle cx="20" cy="21" r="1"></circle>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                  </svg>
                </span>
                Manage Orders
              </button>

              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center gap-3.5 px-4 py-3 rounded-lg text-xs font-poppins font-semibold text-soft-ivory/50 hover:bg-royal-gold/5 hover:text-soft-ivory transition-all border border-transparent"
              >
                <span className="w-4 h-4 flex items-center justify-center shrink-0">
                  <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                    <polyline points="15 3 21 3 21 9"></polyline>
                    <line x1="10" y1="14" x2="21" y2="3"></line>
                  </svg>
                </span>
                Live Website
              </a>
            </nav>
          </div>

          <button
            onClick={logout}
            className="w-full flex items-center gap-3.5 px-4 py-3 rounded-lg text-xs font-poppins font-semibold text-red-400 hover:bg-red-500/5 transition-all border border-transparent cursor-pointer text-left"
          >
            <span className="w-4 h-4 flex items-center justify-center shrink-0">
              <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
            </span>
            Sign Out
          </button>
        </aside>

        {/* Content body container */}
        <main className="flex-grow p-6 md:p-8 overflow-y-auto">
          {/* Zoomed Screenshot Overlay Modal */}
          <AnimatePresence>
            {activeScreenshot && (
              <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-matte-black/95 backdrop-blur-md">
                <div className="absolute inset-0" onClick={() => setActiveScreenshot(null)} />
                <div className="relative max-w-2xl max-h-[85vh] z-10 flex flex-col items-center gap-4">
                  <button
                    onClick={() => setActiveScreenshot(null)}
                    className="absolute top-[-40px] right-0 p-2 rounded-full border border-champagne-gold/20 text-soft-ivory hover:text-royal-gold"
                  >
                    <X size={18} />
                  </button>
                  <img
                    src={activeScreenshot}
                    alt="GPay Verification Receipt"
                    className="object-contain rounded border border-champagne-gold/10 max-h-[75vh]"
                  />
                  <span className="font-poppins text-[10px] text-royal-gold uppercase tracking-widest bg-matte-black/60 px-3 py-1 rounded">
                    Inspecting verification token receipt
                  </span>
                </div>
              </div>
            )}
          </AnimatePresence>

          {/* Header Rounded banner */}
          <div className="w-full bg-[#0a0c1a] border border-royal-gold/15 p-6 rounded-2xl mb-8 flex flex-col gap-1.5 shadow-[0_4px_25px_rgba(0,0,0,0.15)] relative overflow-hidden select-none">
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-royal-gold/5 rounded-full blur-2xl pointer-events-none" />
            <h1 className="font-cinzel text-xl md:text-2xl font-extrabold tracking-wider text-soft-ivory uppercase">
              {activeTab === 'analytics' ? 'Dashboard' : activeTab === 'products' ? 'Manage Products' : 'Manage Orders'}
            </h1>
          </div>

          {/* Dashboard view specific Stats Row */}
          {activeTab === 'analytics' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 select-none">
              {/* Card Revenue */}
              <div className="bg-[#0a0c1a]/95 border border-royal-gold/15 rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-lg relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-20 h-20 bg-royal-gold/5 rounded-full blur-xl" />
                <span className="font-poppins text-[10px] text-soft-ivory/50 uppercase tracking-widest mb-1.5">Total Revenue</span>
                <span className="font-poppins text-xl font-bold text-royal-gold">${totalSales.toFixed(2)}</span>
              </div>
              
              {/* Card Orders */}
              <div className="bg-[#0a0c1a]/95 border border-royal-gold/15 rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-lg relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-20 h-20 bg-royal-gold/5 rounded-full blur-xl" />
                <span className="font-poppins text-[10px] text-soft-ivory/50 uppercase tracking-widest mb-1.5">Total Orders</span>
                <span className="font-poppins text-xl font-bold text-champagne-gold">{totalOrdersCount}</span>
              </div>
              
              {/* Card Products */}
              <div className="bg-[#0a0c1a]/95 border border-royal-gold/15 rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-lg relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-20 h-20 bg-royal-gold/5 rounded-full blur-xl" />
                <span className="font-poppins text-[10px] text-soft-ivory/50 uppercase tracking-widest mb-1.5">Active Products</span>
                <span className="font-poppins text-xl font-bold text-champagne-gold">{productsCount}</span>
              </div>
            </div>
          )}

          {/* LOADING INDICATOR */}
          {loading && activeTab !== 'products' && (
            <div className="flex justify-center items-center py-24">
              <Loader2 className="animate-spin text-royal-gold" size={32} />
            </div>
          )}

          {/* Tab 1: ANALYTICS PORTAL */}
          {!loading && activeTab === 'analytics' && (
            <div className="flex flex-col gap-10">
            
            {/* Custom Interactive SVG charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Sales Chart */}
              <div className="glass-card p-6 rounded-lg border border-champagne-gold/10">
                <div className="flex items-center gap-2 mb-6">
                  <TrendingUp size={16} className="text-royal-gold" />
                  <h4 className="font-cinzel text-xs uppercase tracking-widest text-champagne-gold font-semibold">
                    Sales Growth Projection
                  </h4>
                </div>
                
                {/* SVG Chart */}
                <div className="w-full h-64 relative flex items-end">
                  <svg className="w-full h-[85%] text-royal-gold" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="chartGlow" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#d4af37" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#d4af37" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M 0,90 Q 25,60 50,75 T 100,20 L 100,100 L 0,100 Z"
                      fill="url(#chartGlow)"
                    />
                    <path
                      d="M 0,90 Q 25,60 50,75 T 100,20"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                  </svg>
                  {/* Grid labels */}
                  <div className="absolute inset-0 flex flex-col justify-between text-[9px] font-poppins text-soft-ivory/30 pointer-events-none pb-8">
                    <div className="border-b border-champagne-gold/5 w-full pb-1 text-right">Q2 Peak ($12.5k)</div>
                    <div className="border-b border-champagne-gold/5 w-full pb-1 text-right">Mid Projection ($6.8k)</div>
                    <div className="border-b border-champagne-gold/5 w-full pb-1 text-right">Q1 Baseline ($1.2k)</div>
                  </div>
                </div>
                <div className="flex justify-between text-[9px] font-poppins text-soft-ivory/40 mt-4 uppercase tracking-widest">
                  <span>Jan</span>
                  <span>Feb</span>
                  <span>Mar</span>
                  <span>Apr</span>
                  <span>May</span>
                </div>
              </div>

              {/* Category Chart */}
              <div className="glass-card p-6 rounded-lg border border-champagne-gold/10">
                <h4 className="font-cinzel text-xs uppercase tracking-widest text-champagne-gold font-semibold mb-8">
                  Categories Volume Share
                </h4>
                
                <div className="flex flex-col gap-5 mt-2">
                  {[
                    { cat: 'Royal Box', pct: 60, val: '$6,450.00', color: 'bg-royal-gold' },
                    { cat: 'Crystal Craft', pct: 25, val: '$2,680.00', color: 'bg-champagne-gold' },
                    { cat: 'Glass Art', pct: 10, val: '$1,075.00', color: 'bg-[#faf7f2]/30' },
                    { cat: 'Personalized', pct: 5, val: '$530.00', color: 'bg-deep-bronze' }
                  ].map((row) => (
                    <div key={row.cat} className="flex flex-col gap-1.5 font-poppins text-xs">
                      <div className="flex justify-between items-center text-soft-ivory/80">
                        <span>{row.cat} ({row.pct}%)</span>
                        <span className="font-semibold">{row.val}</span>
                      </div>
                      <div className="w-full h-2 bg-matte-black/60 rounded overflow-hidden">
                        <div className={`h-full ${row.color}`} style={{ width: `${row.pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* Tab 2: PRODUCT MANAGER */}
        {!loading && activeTab === 'products' && (
          <div className="flex flex-col gap-8">
            
            {/* Header / Add Toggler */}
            <div className="flex justify-between items-center">
              <h3 className="font-cinzel text-sm uppercase tracking-widest text-champagne-gold font-semibold">
                Boutique Registry
              </h3>
              <button
                onClick={() => {
                  if (showProductForm) {
                    resetForm();
                  } else {
                    setShowProductForm(true);
                  }
                }}
                className="flex items-center gap-2 px-5 py-3 rounded bg-royal-gold text-matte-black font-poppins text-xs font-semibold uppercase tracking-wider hover:bg-champagne-gold transition-colors"
              >
                {showProductForm ? <X size={14} /> : <Plus size={14} />} {showProductForm ? 'Cancel Form' : 'Register New Gift'}
              </button>
            </div>

            {/* Product Creation / Edit Form */}
            <AnimatePresence>
              {showProductForm && (
                <motion.form
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  onSubmit={handleProductSubmit}
                  className="glass-panel p-6 rounded-lg border border-champagne-gold/15 flex flex-col gap-5 overflow-hidden"
                >
                  <h4 className="font-cinzel text-xs uppercase tracking-widest text-champagne-gold font-bold mb-2">
                    {isEditing ? 'Modify Existing Masterpiece' : 'Register New Masterpiece'}
                  </h4>

                  {/* Title & Price */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="font-poppins text-[10px] uppercase tracking-wider text-soft-ivory/50">Product Title</label>
                      <input
                        type="text"
                        required
                        value={pTitle}
                        onChange={(e) => setPTitle(e.target.value)}
                        placeholder="e.g. Royal Keepsake"
                        className="bg-matte-black/55 border border-champagne-gold/15 py-3 px-4 text-xs font-poppins rounded focus:outline-none focus:border-royal-gold/60 text-soft-ivory"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="font-poppins text-[10px] uppercase tracking-wider text-soft-ivory/50">Price ($ USD)</label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={pPrice}
                        onChange={(e) => setPPrice(e.target.value)}
                        placeholder="e.g. 299.00"
                        className="bg-matte-black/55 border border-champagne-gold/15 py-3 px-4 text-xs font-poppins rounded focus:outline-none focus:border-royal-gold/60 text-soft-ivory"
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div className="flex flex-col gap-1.5">
                    <label className="font-poppins text-[10px] uppercase tracking-wider text-soft-ivory/50">Product Description</label>
                    <textarea
                      required
                      rows={3}
                      value={pDescription}
                      onChange={(e) => setPDescription(e.target.value)}
                      placeholder="Meticulously outline product dimensions, wood textures, velvet qualities..."
                      className="bg-matte-black/55 border border-champagne-gold/15 py-3 px-4 text-xs font-poppins rounded focus:outline-none focus:border-royal-gold/60 text-soft-ivory resize-none"
                    />
                  </div>

                  {/* Category & Stock */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="font-poppins text-[10px] uppercase tracking-wider text-soft-ivory/50">Category Group</label>
                      <select
                        value={pCategory}
                        onChange={(e) => setPCategory(e.target.value)}
                        className="bg-matte-black/55 border border-champagne-gold/15 py-3 px-4 text-xs font-poppins rounded focus:outline-none focus:border-royal-gold/60 text-soft-ivory cursor-pointer"
                      >
                        <option value="Royal Box">Royal Box</option>
                        <option value="Crystal Craft">Crystal Craft</option>
                        <option value="Glass Art">Glass Art</option>
                        <option value="Personalized">Personalized</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="font-poppins text-[10px] uppercase tracking-wider text-soft-ivory/50">Boutique Stock Count</label>
                      <input
                        type="number"
                        required
                        value={pStock}
                        onChange={(e) => setPStock(e.target.value)}
                        className="bg-matte-black/55 border border-champagne-gold/15 py-3 px-4 text-xs font-poppins rounded focus:outline-none focus:border-royal-gold/60 text-soft-ivory"
                      />
                    </div>
                  </div>

                  {/* Image upload */}
                  <div className="flex flex-col gap-1.5">
                    <label className="font-poppins text-[10px] uppercase tracking-wider text-soft-ivory/50">Upload Product Photo</label>
                    <div className="relative border border-dashed border-champagne-gold/20 hover:border-royal-gold/50 rounded-lg p-5 transition-colors bg-matte-black/30 flex flex-col items-center justify-center text-center cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      />
                      <Upload className="text-royal-gold/60 mb-1" size={20} />
                      <span className="font-poppins text-xs text-soft-ivory/80 font-medium">Click to select new image</span>
                      <span className="font-poppins text-[9px] text-soft-ivory/40">Base64 embedded image (Max 2MB)</span>
                    </div>
                    {uploadError && <span className="text-[10px] text-red-400 font-poppins">{uploadError}</span>}
                    
                    {pImageBase64 && (
                      <div className="relative w-28 h-28 rounded border border-champagne-gold/10 overflow-hidden bg-matte-black/50 mt-2">
                        <img src={pImageBase64} alt="Upload preview" className="object-cover w-full h-full" />
                      </div>
                    )}
                  </div>

                  {/* Submit buttons */}
                  <div className="flex gap-4 mt-2 justify-end">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-6 py-3 border border-champagne-gold/15 rounded text-xs font-poppins uppercase tracking-wider text-soft-ivory hover:bg-champagne-gold/5"
                    >
                      Clear
                    </button>
                    <button
                      type="submit"
                      className="px-8 py-3 bg-royal-gold text-matte-black rounded text-xs font-poppins uppercase tracking-wider font-semibold hover:bg-champagne-gold"
                    >
                      {isEditing ? 'Update Registry' : 'Commit Registry'}
                    </button>
                  </div>

                </motion.form>
              )}
            </AnimatePresence>

            {/* Products grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="glass-panel p-5 rounded-lg border border-champagne-gold/5 flex items-center justify-between gap-6"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="relative w-16 h-16 rounded border border-champagne-gold/10 overflow-hidden shrink-0">
                      <img src={product.images[0]} alt={product.title} className="object-cover w-full h-full" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-poppins text-[9px] text-royal-gold uppercase tracking-wider">{product.category}</span>
                      <h4 className="font-cinzel text-sm font-bold text-soft-ivory truncate mt-0.5">{product.title}</h4>
                      <span className="font-poppins text-xs text-champagne-gold font-medium mt-1">${product.price.toFixed(2)} &bull; Stock: {product.stock}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    <button
                      onClick={() => handleEditInit(product)}
                      className="p-2 border border-champagne-gold/10 hover:border-royal-gold hover:text-royal-gold text-soft-ivory/50 rounded transition-colors"
                      title="Edit Product"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product.id)}
                      className="p-2 border border-champagne-gold/10 hover:border-red-400 hover:text-red-400 text-soft-ivory/50 rounded transition-colors"
                      title="Delete Product"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* Tab 3: ORDER MANAGER */}
        {!loading && activeTab === 'orders' && (
          <div className="flex flex-col gap-8">
            <h3 className="font-cinzel text-sm uppercase tracking-widest text-champagne-gold font-semibold">
              Commission Registry
            </h3>

            {orders.length === 0 ? (
              <div className="glass-panel p-12 text-center border border-champagne-gold/5 font-poppins text-xs text-soft-ivory/40">
                No client commissions received yet.
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                {orders.map((order) => {
                  const isExpanded = expandedOrderId === order.id;

                  return (
                    <div
                      key={order.id}
                      className={`glass-panel rounded-lg border transition-all ${
                        isExpanded ? 'border-royal-gold/40 shadow-[0_0_15px_rgba(212,175,55,0.05)]' : 'border-champagne-gold/5'
                      }`}
                    >
                      {/* Top Header Row */}
                      <div className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        
                        <div className="flex flex-col gap-1 min-w-0">
                          <span className="font-mono text-[9px] uppercase tracking-widest text-soft-ivory/30">Ref ID: {order.id}</span>
                          <h4 className="font-cinzel text-sm font-bold text-soft-ivory truncate mt-0.5">
                            Client: {order.shipping_name}
                          </h4>
                          <span className="font-poppins text-xs text-soft-ivory/60 mt-1">
                            {order.shipping_email} &bull; {order.shipping_phone}
                          </span>
                        </div>

                        <div className="flex items-center gap-5 shrink-0">
                          <div className="flex flex-col items-start md:items-end text-left md:text-right">
                            <span className="font-poppins text-[10px] text-soft-ivory/30 uppercase tracking-widest">Amount Paid</span>
                            <span className="font-poppins text-sm font-bold text-royal-gold">${order.total_amount.toFixed(2)}</span>
                          </div>

                          <div className="flex flex-col gap-1">
                            <span className="font-poppins text-[9px] text-soft-ivory/30 uppercase tracking-widest text-right">Receipt</span>
                            {order.screenshot_url ? (
                              <button
                                onClick={() => setActiveScreenshot(order.screenshot_url || null)}
                                className="flex items-center gap-1.5 px-3 py-1.5 border border-royal-gold/30 hover:border-royal-gold bg-matte-black/60 rounded text-[9px] font-poppins text-royal-gold uppercase tracking-wider font-semibold transition-colors"
                              >
                                <Eye size={10} /> View Slip
                              </button>
                            ) : (
                              <span className="text-[9px] font-poppins text-red-400 uppercase font-medium">Missing</span>
                            )}
                          </div>
                        </div>

                        <button
                          onClick={() => handleExpandOrder(order.id)}
                          className="w-full md:w-auto px-5 py-3 border border-champagne-gold/15 hover:border-royal-gold rounded text-xs font-poppins text-soft-ivory hover:text-royal-gold transition-colors flex items-center justify-center gap-2"
                        >
                          {isExpanded ? 'Collapse' : 'Manage Pipeline'} <ArrowRight size={12} className={`transform transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                        </button>

                      </div>

                      {/* Collapsible status controls */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="border-t border-champagne-gold/10 bg-matte-black/25 overflow-hidden"
                          >
                            <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
                              
                              {/* Order items details (5 cols) */}
                              <div className="lg:col-span-5 flex flex-col gap-4">
                                <h5 className="font-cinzel text-xs uppercase tracking-widest text-champagne-gold font-bold">Ordered Products</h5>
                                {itemsLoading ? (
                                  <div className="flex items-center gap-2 py-4 text-xs font-poppins text-soft-ivory/40">
                                    <Loader2 className="animate-spin text-royal-gold" size={12} /> Loading items...
                                  </div>
                                ) : (
                                  <div className="flex flex-col gap-3 font-poppins text-xs text-soft-ivory/60">
                                    {expandedOrderItems.map(item => (
                                      <div key={item.id} className="flex justify-between items-center py-1.5 border-b border-champagne-gold/5 last:border-0">
                                        <span>{item.product?.title || 'Custom Craft'} <strong className="text-royal-gold/80">x{item.quantity}</strong></span>
                                        <span className="font-semibold">${(item.price * item.quantity).toFixed(2)}</span>
                                      </div>
                                    ))}
                                    <div className="flex flex-col gap-1 border-t border-champagne-gold/5 pt-3 mt-1">
                                      <span className="text-[10px] text-soft-ivory/30 uppercase tracking-widest">Delivery Address</span>
                                      <span className="text-[11px] leading-relaxed mt-0.5">{order.shipping_address}</span>
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Status actions (7 cols) */}
                              <div className="lg:col-span-7 flex flex-col gap-4 border-l border-champagne-gold/5 lg:pl-8">
                                <h5 className="font-cinzel text-xs uppercase tracking-widest text-champagne-gold font-bold">Update Logistics Status</h5>
                                
                                <div className="flex flex-col gap-3">
                                  
                                  {/* Current Status Badge */}
                                  <div className="flex items-center gap-2 text-xs font-poppins">
                                    <span className="text-soft-ivory/40">Current Status:</span>
                                    <span className="bg-royal-gold/10 border border-royal-gold/30 text-royal-gold px-2.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider">
                                      {order.status}
                                    </span>
                                  </div>

                                  {/* Comment logging input */}
                                  <div className="flex flex-col gap-1">
                                    <label className="font-poppins text-[9px] uppercase tracking-wider text-soft-ivory/40">Update Log comment (optional)</label>
                                    <input
                                      type="text"
                                      value={statusComment}
                                      onChange={(e) => setStatusComment(e.target.value)}
                                      placeholder="e.g. Quality inspection completed successfully. Polishing gold leaf."
                                      className="bg-matte-black/60 border border-champagne-gold/10 py-2.5 px-3 text-xs font-poppins rounded text-soft-ivory focus:outline-none focus:border-royal-gold/50"
                                    />
                                  </div>

                                  {/* Dropdown status update triggers */}
                                  <div className="flex flex-wrap gap-2 mt-1">
                                    {STEPS.map((step) => {
                                      const isCurrent = step === order.status;
                                      return (
                                        <button
                                          key={step}
                                          type="button"
                                          disabled={isCurrent}
                                          onClick={() => handleStatusChange(order.id, step)}
                                          className={`px-3.5 py-2 rounded text-[9px] font-poppins uppercase tracking-wider border transition-colors ${
                                            isCurrent
                                              ? 'bg-royal-gold/10 text-royal-gold border-royal-gold/30 font-semibold'
                                              : 'bg-matte-black/60 border-champagne-gold/10 text-soft-ivory/60 hover:border-royal-gold/40 hover:text-soft-ivory'
                                          }`}
                                        >
                                          {step}
                                        </button>
                                      );
                                    })}
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

        </main>
      </div>
    </div>
  );
}
