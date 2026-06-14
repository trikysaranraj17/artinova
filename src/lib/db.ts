import { supabase, isSupabaseConfigured } from './supabase';

export interface Profile {
  id: string;
  full_name: string;
  phone?: string;
  avatar_url?: string;
  created_at?: string;
}

export interface Address {
  id: string;
  user_id: string;
  label: string;
  full_name: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  is_default: boolean;
  created_at?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image_url?: string;
  display_order?: number;
}

export interface Collection {
  id: string;
  name: string;
  slug: string;
  description?: string;
  banner_url?: string;
  is_featured: boolean;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  original_price?: number;
  category_id?: string;
  category_name?: string; // Mapped fallback helper
  stock: number;
  is_customizable: boolean;
  customization_fields: any[]; // JSON array of custom options
  is_featured: boolean;
  is_active: boolean;
  rating?: number;
  review_count?: number;
  meta_title?: string;
  meta_description?: string;
  created_at?: string;
  images: string[]; // Standardized wrapper
}

export interface Order {
  id: string;
  order_number: string;
  user_id?: string;
  address_id?: string;
  subtotal: number;
  gst: number;
  shipping: number;
  total: number;
  gift_note?: string;
  payment_status: 'pending' | 'verified' | 'rejected';
  order_status: 'received' | 'verified' | 'design' | 'crafting' | 'quality' | 'packaging' | 'shipped' | 'delivered';
  payment_screenshot_url?: string;
  tracking_number?: string;
  courier?: string;
  admin_notes?: string;
  created_at: string;
  updated_at: string;
  shipping_name?: string; // Mapped fallback field
  shipping_phone?: string; // Mapped fallback field
  shipping_address?: string; // Mapped fallback field
  shipping_email?: string; // Mapped fallback field
}

export interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  product?: Product;
  customization?: {
    engravingText?: string;
    variantSize?: string;
    photoUrl?: string;
  };
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  product_image?: string;
  quantity: number;
  price: number;
  customization: any;
  product?: Product;
}

export interface TrackingUpdate {
  id: string;
  order_id: string;
  stage: string;
  note?: string;
  updated_by?: string;
  created_at: string;
}

export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  user_name?: string;
  rating: number;
  review: string;
  is_verified: boolean;
  created_at: string;
}

// ---------------- MOCK DATA FOR SEEDING ----------------
const MOCK_CATEGORIES: Category[] = [
  { id: 'cat-frames', name: 'Luxury Frames', slug: 'luxury-frames', display_order: 1 },
  { id: 'cat-hampers', name: 'Premium Hampers', slug: 'premium-hampers', display_order: 2 },
  { id: 'cat-art', name: 'Resin Art Masterpieces', slug: 'resin-art-masterpieces', display_order: 3 },
  { id: 'cat-accessories', name: 'Custom Accessories', slug: 'custom-accessories', display_order: 4 },
  { id: 'cat-keepsakes', name: 'Bespoke Keepsakes', slug: 'bespoke-keepsakes', display_order: 5 }
];

const MOCK_COLLECTIONS: Collection[] = [
  { id: 'col-wedding', name: 'Wedding Gifts', slug: 'wedding-gifts', description: 'Curated royal wedding gifts and customized couples coordinates.', is_featured: true },
  { id: 'col-couple', name: 'Couple Gifts', slug: 'couple-gifts', description: 'Handcrafted items to celebrate unions, engagements, and anniversaries.', is_featured: true },
  { id: 'col-birthday', name: 'Birthday Gifts', slug: 'birthday-gifts', description: 'Unique personalized keepsakes that make birthdays unforgettable.', is_featured: false },
  { id: 'col-corporate', name: 'Corporate Gifts', slug: 'corporate-gifts', description: 'White-label luxury executive presentation sets for brands.', is_featured: true },
  { id: 'col-photo', name: 'Photo Gifts', slug: 'photo-gifts', description: 'Turn frozen visual memories into physical gold-leafed glass frames.', is_featured: false },
  { id: 'col-resin', name: 'Resin Art', slug: 'resin-art', description: 'Indulge in liquid-gold resin geodes and bespoke preservation pieces.', is_featured: true },
  { id: 'col-hampers', name: 'Luxury Hampers', slug: 'luxury-hampers', description: 'Grand gift trunks containing fine sandlewood and custom keepsakes.', is_featured: true }
];

const MOCK_PRODUCTS: Product[] = [];

// Helper to get local data
const getLocal = (key: string, fallback: any) => {
  if (typeof window === 'undefined') return fallback;
  const item = localStorage.getItem(key);
  return item ? JSON.parse(item) : fallback;
};

// Helper to set local data
const setLocal = (key: string, val: any) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(key, JSON.stringify(val));
  }
};

// Initialize localStorage with structured mock data
if (typeof window !== 'undefined') {
  if (!localStorage.getItem('artinova_categories')) {
    localStorage.setItem('artinova_categories', JSON.stringify(MOCK_CATEGORIES));
  }
  if (!localStorage.getItem('artinova_collections')) {
    localStorage.setItem('artinova_collections', JSON.stringify(MOCK_COLLECTIONS));
  }
  if (!localStorage.getItem('artinova_products') || localStorage.getItem('artinova_needs_clear_v4') !== 'true') {
    localStorage.setItem('artinova_products', JSON.stringify(MOCK_PRODUCTS));
    localStorage.setItem('artinova_needs_clear_v4', 'true');
  }
  if (!localStorage.getItem('artinova_product_collections')) {
    const pcMapping = [
      { product_id: 'prod-clock', collection_id: 'col-resin' },
      { product_id: 'prod-clock', collection_id: 'col-couple' },
      { product_id: 'prod-frame', collection_id: 'col-wedding' },
      { product_id: 'prod-frame', collection_id: 'col-photo' },
      { product_id: 'prod-coasters', collection_id: 'col-resin' },
      { product_id: 'prod-coasters', collection_id: 'col-couple' },
      { product_id: 'prod-wedding-hamper', collection_id: 'col-wedding' },
      { product_id: 'prod-wedding-hamper', collection_id: 'col-hampers' },
      { product_id: 'prod-keepsake-box', collection_id: 'col-corporate' },
      { product_id: 'prod-accordion', collection_id: 'col-photo' },
      { product_id: 'prod-accordion', collection_id: 'col-couple' },
      { product_id: 'prod-dish', collection_id: 'col-birthday' },
      { product_id: 'prod-dish', collection_id: 'col-resin' },
      { product_id: 'prod-corp-chest', collection_id: 'col-corporate' },
      { product_id: 'prod-corp-chest', collection_id: 'col-hampers' }
    ];
    localStorage.setItem('artinova_product_collections', JSON.stringify(pcMapping));
  }
  if (!localStorage.getItem('artinova_orders')) {
    localStorage.setItem('artinova_orders', JSON.stringify([]));
  }
  if (!localStorage.getItem('artinova_order_items')) {
    localStorage.setItem('artinova_order_items', JSON.stringify([]));
  }
  if (!localStorage.getItem('artinova_tracking')) {
    localStorage.setItem('artinova_tracking', JSON.stringify([]));
  }
  if (!localStorage.getItem('artinova_wishlist')) {
    localStorage.setItem('artinova_wishlist', JSON.stringify([]));
  }
  if (!localStorage.getItem('artinova_cart')) {
    localStorage.setItem('artinova_cart', JSON.stringify([]));
  }
  if (!localStorage.getItem('artinova_reviews')) {
    localStorage.setItem('artinova_reviews', JSON.stringify([]));
  }
  if (!localStorage.getItem('artinova_settings')) {
    const settings = {
      gpay_upi_id: 'akashselva18@okhdfcbank',
      gpay_qr_url: '/qr-code.jpg',
      whatsapp_number: '+91 99942 03670',
      gst_rate: '18',
      free_shipping_threshold: '999'
    };
    localStorage.setItem('artinova_settings', JSON.stringify(settings));
  }
}

// ---------------- PRODUCTS ----------------
export async function getProducts(): Promise<Product[]> {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    if (!error && data) {
      // Map images array
      const mapped = data.map(async p => {
        const { data: imgData } = await supabase.from('product_images').select('url').eq('product_id', p.id).order('display_order');
        return {
          ...p,
          images: imgData && imgData.length > 0 ? imgData.map(i => i.url) : ['/images/placeholder.jpg']
        };
      });
      return Promise.all(mapped);
    }
  }
  return getLocal('artinova_products', MOCK_PRODUCTS);
}

export async function getProductById(id: string): Promise<Product | null> {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from('products').select('*').eq('id', id).single();
    if (!error && data) {
      const { data: imgData } = await supabase.from('product_images').select('url').eq('product_id', id).order('display_order');
      return {
        ...data,
        images: imgData && imgData.length > 0 ? imgData.map(i => i.url) : ['/images/placeholder.jpg']
      };
    }
  }
  const products = getLocal('artinova_products', MOCK_PRODUCTS);
  return products.find((p: Product) => p.id === id) || null;
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from('products').select('*').eq('slug', slug).single();
    if (!error && data) {
      const { data: imgData } = await supabase.from('product_images').select('url').eq('product_id', data.id).order('display_order');
      return {
        ...data,
        images: imgData && imgData.length > 0 ? imgData.map(i => i.url) : ['/images/placeholder.jpg']
      };
    }
  }
  const products = getLocal('artinova_products', MOCK_PRODUCTS);
  return products.find((p: Product) => p.slug === slug) || null;
}

export async function createProduct(product: Omit<Product, 'id' | 'images'>, imageUrls: string[] = []): Promise<Product> {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from('products').insert([product]).select().single();
    if (error) throw error;
    
    if (imageUrls.length > 0) {
      const insertImages = imageUrls.map((url, index) => ({
        product_id: data.id,
        url,
        display_order: index,
        is_primary: index === 0
      }));
      await supabase.from('product_images').insert(insertImages);
    }
    return { ...data, images: imageUrls };
  }

  const products = getLocal('artinova_products', MOCK_PRODUCTS);
  const newProduct: Product = {
    ...product,
    id: `prod-${Date.now()}`,
    images: imageUrls.length > 0 ? imageUrls : ['https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=600'],
    created_at: new Date().toISOString(),
    rating: 5.0,
    review_count: 0
  };
  products.unshift(newProduct);
  setLocal('artinova_products', products);
  return newProduct;
}

export async function updateProduct(id: string, product: Partial<Product>, imageUrls?: string[]): Promise<Product> {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from('products').update(product).eq('id', id).select().single();
    if (error) throw error;

    if (imageUrls) {
      await supabase.from('product_images').delete().eq('product_id', id);
      const insertImages = imageUrls.map((url, index) => ({
        product_id: id,
        url,
        display_order: index,
        is_primary: index === 0
      }));
      await supabase.from('product_images').insert(insertImages);
    }
    return { ...data, images: imageUrls || [] };
  }

  const products = getLocal('artinova_products', MOCK_PRODUCTS);
  const idx = products.findIndex((p: Product) => p.id === id);
  if (idx === -1) throw new Error('Product not found.');
  const updated = {
    ...products[idx],
    ...product,
    images: imageUrls || products[idx].images
  };
  products[idx] = updated;
  setLocal('artinova_products', products);
  return updated;
}

export async function deleteProduct(id: string): Promise<boolean> {
  if (isSupabaseConfigured) {
    const { error } = await supabase.from('products').delete().eq('id', id);
    return !error;
  }
  const products = getLocal('artinova_products', MOCK_PRODUCTS);
  const filtered = products.filter((p: Product) => p.id !== id);
  setLocal('artinova_products', filtered);
  return true;
}

// ---------------- CATEGORIES ----------------
export async function getCategories(): Promise<Category[]> {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from('categories').select('*').order('display_order');
    if (!error && data) return data;
  }
  return getLocal('artinova_categories', MOCK_CATEGORIES);
}

export async function createCategory(cat: Omit<Category, 'id'>): Promise<Category> {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from('categories').insert([cat]).select().single();
    if (error) throw error;
    return data;
  }
  const cats = getLocal('artinova_categories', MOCK_CATEGORIES);
  const newCat = { ...cat, id: `cat-${Date.now()}` };
  cats.push(newCat);
  setLocal('artinova_categories', cats);
  return newCat;
}

// ---------------- COLLECTIONS ----------------
export async function getCollections(): Promise<Collection[]> {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from('collections').select('*');
    if (!error && data) return data;
  }
  return getLocal('artinova_collections', MOCK_COLLECTIONS);
}

export async function getCollectionProducts(collectionSlug: string): Promise<Product[]> {
  if (isSupabaseConfigured) {
    // Select products via junction table
    const { data, error } = await supabase
      .from('collections')
      .select('id')
      .eq('slug', collectionSlug)
      .single();
    if (data) {
      const { data: prods } = await supabase
        .from('product_collections')
        .select('product_id')
        .eq('collection_id', data.id);
      if (prods && prods.length > 0) {
        const ids = prods.map(p => p.product_id);
        const { data: finalProds } = await supabase.from('products').select('*').in('id', ids);
        if (finalProds) {
          const mapped = finalProds.map(async p => {
            const { data: imgData } = await supabase.from('product_images').select('url').eq('product_id', p.id).order('display_order');
            return {
              ...p,
              images: imgData && imgData.length > 0 ? imgData.map(i => i.url) : ['/images/placeholder.jpg']
            };
          });
          return Promise.all(mapped);
        }
      }
    }
    return [];
  }

  const collections = getLocal('artinova_collections', MOCK_COLLECTIONS);
  const targetCol = collections.find((c: Collection) => c.slug === collectionSlug);
  if (!targetCol) return [];
  
  const mappings = getLocal('artinova_product_collections', []);
  const matchingProductIds = mappings
    .filter((m: any) => m.collection_id === targetCol.id)
    .map((m: any) => m.product_id);
    
  const products = getLocal('artinova_products', MOCK_PRODUCTS);
  return products.filter((p: Product) => matchingProductIds.includes(p.id));
}

// ---------------- CART OPERATIONS ----------------
export async function getCart(userId: string): Promise<CartItem[]> {
  if (isSupabaseConfigured && userId !== 'guest') {
    const { data, error } = await supabase.from('cart_items').select('*, product:products(*)').eq('user_id', userId);
    if (!error && data) {
      const mapped = data.map(async item => {
        if (item.product) {
          const { data: imgData } = await supabase.from('product_images').select('url').eq('product_id', item.product.id).order('display_order');
          item.product.images = imgData && imgData.length > 0 ? imgData.map(i => i.url) : ['/images/placeholder.jpg'];
        }
        return item;
      });
      return Promise.all(mapped);
    }
  }
  const cart = getLocal('artinova_cart', []);
  const filtered = cart.filter((item: any) => item.user_id === userId);
  const products = getLocal('artinova_products', MOCK_PRODUCTS);
  return filtered.map((item: any) => ({
    ...item,
    product: products.find((p: Product) => p.id === item.product_id)
  }));
}

export async function addToCart(userId: string, productId: string, quantity: number = 1, customization: any = {}): Promise<boolean> {
  if (isSupabaseConfigured && userId !== 'guest') {
    const { error } = await supabase.from('cart_items').upsert(
      { user_id: userId, product_id: productId, quantity, customization },
      { onConflict: 'user_id,product_id' }
    );
    return !error;
  }
  const cart = getLocal('artinova_cart', []);
  const index = cart.findIndex((item: any) => item.user_id === userId && item.product_id === productId);
  if (index !== -1) {
    cart[index].quantity += quantity;
    if (Object.keys(customization).length > 0) {
      cart[index].customization = { ...cart[index].customization, ...customization };
    }
  } else {
    cart.push({
      id: `cart-${Date.now()}`,
      user_id: userId,
      product_id: productId,
      quantity,
      customization
    });
  }
  setLocal('artinova_cart', cart);
  return true;
}

export async function updateCartQuantity(userId: string, productId: string, quantity: number): Promise<boolean> {
  if (isSupabaseConfigured && userId !== 'guest') {
    const { error } = await supabase.from('cart_items').update({ quantity }).match({ user_id: userId, product_id: productId });
    return !error;
  }
  const cart = getLocal('artinova_cart', []);
  const index = cart.findIndex((item: any) => item.user_id === userId && item.product_id === productId);
  if (index !== -1) {
    cart[index].quantity = quantity;
    setLocal('artinova_cart', cart);
    return true;
  }
  return false;
}

export async function removeFromCart(userId: string, productId: string): Promise<boolean> {
  if (isSupabaseConfigured && userId !== 'guest') {
    const { error } = await supabase.from('cart_items').delete().match({ user_id: userId, product_id: productId });
    return !error;
  }
  const cart = getLocal('artinova_cart', []);
  const filtered = cart.filter((item: any) => !(item.user_id === userId && item.product_id === productId));
  setLocal('artinova_cart', filtered);
  return true;
}

export async function clearCart(userId: string): Promise<boolean> {
  if (isSupabaseConfigured && userId !== 'guest') {
    const { error } = await supabase.from('cart_items').delete().eq('user_id', userId);
    return !error;
  }
  const cart = getLocal('artinova_cart', []);
  const filtered = cart.filter((item: any) => item.user_id !== userId);
  setLocal('artinova_cart', filtered);
  return true;
}

// ---------------- WISHLIST ----------------
export async function getWishlist(userId: string): Promise<Product[]> {
  if (isSupabaseConfigured && userId !== 'guest') {
    const { data, error } = await supabase.from('wishlist').select('product:products(*)').eq('user_id', userId);
    if (!error && data) {
      const mapped = (data as any[]).map(item => item.product).filter(Boolean);
      const finalMapped = mapped.map(async p => {
        const { data: imgData } = await supabase.from('product_images').select('url').eq('product_id', p.id).order('display_order');
        p.images = imgData && imgData.length > 0 ? imgData.map(i => i.url) : ['/images/placeholder.jpg'];
        return p;
      });
      return Promise.all(finalMapped);
    }
  }
  const wishlist = getLocal('artinova_wishlist', []);
  const filtered = wishlist.filter((item: any) => item.user_id === userId);
  const products = getLocal('artinova_products', MOCK_PRODUCTS);
  return filtered.map((item: any) => products.find((p: Product) => p.id === item.product_id)).filter(Boolean) as Product[];
}

export async function toggleWishlist(userId: string, productId: string): Promise<boolean> {
  const wishlist = getLocal('artinova_wishlist', []);
  const idx = wishlist.findIndex((item: any) => item.user_id === userId && item.product_id === productId);
  const exists = idx !== -1;

  if (isSupabaseConfigured && userId !== 'guest') {
    if (exists) {
      await supabase.from('wishlist').delete().match({ user_id: userId, product_id: productId });
    } else {
      await supabase.from('wishlist').insert({ user_id: userId, product_id: productId });
    }
  }

  if (exists) {
    wishlist.splice(idx, 1);
  } else {
    wishlist.push({
      id: `wish-${Date.now()}`,
      user_id: userId,
      product_id: productId
    });
  }
  setLocal('artinova_wishlist', wishlist);
  return !exists;
}

// ---------------- ORDERS & BILLING ----------------
export async function getOrders(userId?: string): Promise<Order[]> {
  if (isSupabaseConfigured) {
    let query = supabase.from('orders').select('*').order('created_at', { ascending: false });
    if (userId && userId !== 'guest') {
      query = query.eq('user_id', userId);
    }
    const { data, error } = await query;
    if (!error && data) {
      // Map temporary fallback address data
      return data.map(o => ({
        ...o,
        shipping_name: o.shipping_name || 'Bespoke Patron',
        shipping_phone: o.shipping_phone || '+91 98765 43210',
        shipping_address: o.shipping_address || '100 Golden Geode, Chennai'
      }));
    }
  }
  const orders = getLocal('artinova_orders', []);
  if (userId) {
    return orders.filter((o: Order) => o.user_id === userId);
  }
  return orders;
}

export async function getOrderById(id: string): Promise<Order | null> {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from('orders').select('*, profiles(*)').eq('id', id).single();
    if (!error && data) {
      return {
        ...data,
        shipping_name: data.shipping_name || data.profiles?.full_name || 'Bespoke Patron',
        shipping_phone: data.shipping_phone || data.profiles?.phone || '+91 98765 43210',
        shipping_address: data.shipping_address || '100 Golden Geode, Chennai'
      };
    }
  }
  const orders = getLocal('artinova_orders', []);
  return orders.find((o: Order) => o.id === id) || null;
}

export async function getOrderItems(orderId: string): Promise<OrderItem[]> {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from('order_items').select('*, product:products(*)').eq('order_id', orderId);
    if (!error && data) return data as OrderItem[];
  }
  const items = getLocal('artinova_order_items', []);
  const filtered = items.filter((item: any) => item.order_id === orderId);
  const products = getLocal('artinova_products', MOCK_PRODUCTS);
  return filtered.map((item: any) => ({
    ...item,
    product: products.find((p: Product) => p.id === item.product_id)
  }));
}

export async function createOrder(
  order: Omit<Order, 'id' | 'order_number' | 'payment_status' | 'order_status' | 'created_at' | 'updated_at'>,
  items: Array<{ product_id: string; quantity: number; price: number; customization?: any }>
): Promise<Order> {
  const orderNumber = `ART-2026-${Math.floor(10000 + Math.random() * 90000)}`;
  const orderId = `order-${Date.now()}`;
  const newOrder: Order = {
    ...order,
    id: isSupabaseConfigured ? '' : orderId,
    order_number: orderNumber,
    payment_status: 'pending',
    order_status: 'received',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  if (isSupabaseConfigured) {
    // 1. Insert order
    const { data: ordData, error: ordErr } = await supabase.from('orders').insert([newOrder]).select().single();
    if (ordErr || !ordData) throw new Error(ordErr?.message || 'Error inserting order in Supabase');

    // 2. Fetch product names and images to store in order_items
    const itemsToInsert = await Promise.all(items.map(async item => {
      const p = await getProductById(item.product_id);
      return {
        order_id: ordData.id,
        product_id: item.product_id,
        product_name: p?.name || 'Handcrafted Gift',
        product_image: p?.images?.[0] || '',
        quantity: item.quantity,
        price: item.price,
        customization: item.customization || {}
      };
    }));

    const { error: itemsErr } = await supabase.from('order_items').insert(itemsToInsert);
    if (itemsErr) console.error('Error inserting order items:', itemsErr);

    // 3. Log initial tracking
    await createTrackingUpdate(ordData.id, 'received', 'Order placed successfully. Awaiting payment validation.');
    
    return ordData as Order;
  }

  // Fallback Local Storage
  const orders = getLocal('artinova_orders', []);
  orders.unshift(newOrder);
  setLocal('artinova_orders', orders);

  const localItems = getLocal('artinova_order_items', []);
  const products = getLocal('artinova_products', MOCK_PRODUCTS);
  const newItems = items.map(item => {
    const p = products.find((pr: Product) => pr.id === item.product_id);
    return {
      id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      order_id: newOrder.id,
      product_id: item.product_id,
      product_name: p?.name || 'Handcrafted Gift',
      product_image: p?.images?.[0] || '',
      quantity: item.quantity,
      price: item.price,
      customization: item.customization || {}
    };
  });
  setLocal('artinova_order_items', [...localItems, ...newItems]);

  await createTrackingUpdate(newOrder.id, 'received', 'Order placed successfully. Awaiting payment validation.');

  return newOrder;
}

export async function updateOrderStatus(
  orderId: string,
  orderStatus: string,
  paymentStatus: 'pending' | 'verified' | 'rejected',
  courier?: string,
  trackingNumber?: string,
  adminNotes?: string
): Promise<boolean> {
  const updateData = {
    order_status: orderStatus,
    payment_status: paymentStatus,
    courier,
    tracking_number: trackingNumber,
    admin_notes: adminNotes,
    updated_at: new Date().toISOString()
  };

  if (isSupabaseConfigured) {
    const { error } = await supabase.from('orders').update(updateData).eq('id', orderId);
    if (error) {
      console.error('Supabase updateOrderStatus error:', error);
      return false;
    }
    await createTrackingUpdate(orderId, orderStatus, `Order status advanced to ${orderStatus}. ${adminNotes || ''}`);
    return true;
  }

  const orders = getLocal('artinova_orders', []);
  const idx = orders.findIndex((o: Order) => o.id === orderId);
  if (idx === -1) return false;
  orders[idx] = { ...orders[idx], ...updateData };
  setLocal('artinova_orders', orders);

  await createTrackingUpdate(orderId, orderStatus, `Order status advanced to ${orderStatus}. ${adminNotes || ''}`);
  return true;
}

// ---------------- TRACKING TIMELINE ----------------
export async function getTrackingUpdates(orderId: string): Promise<TrackingUpdate[]> {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from('tracking_updates').select('*').eq('order_id', orderId).order('created_at', { ascending: true });
    if (!error && data) return data as TrackingUpdate[];
  }
  const tracking = getLocal('artinova_tracking', []);
  return tracking
    .filter((t: TrackingUpdate) => t.order_id === orderId)
    .sort((a: TrackingUpdate, b: TrackingUpdate) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
}

export async function createTrackingUpdate(orderId: string, stage: string, note?: string): Promise<TrackingUpdate> {
  const update: Omit<TrackingUpdate, 'id' | 'created_at'> = {
    order_id: orderId,
    stage,
    note: note || `Stage updated to ${stage}.`
  };

  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from('tracking_updates').insert([update]).select().single();
    if (!error && data) return data as TrackingUpdate;
  }

  const tracking = getLocal('artinova_tracking', []);
  const newUpdate: TrackingUpdate = {
    ...update,
    id: `track-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    created_at: new Date().toISOString()
  };
  tracking.push(newUpdate);
  setLocal('artinova_tracking', tracking);
  return newUpdate;
}

// ---------------- SETTINGS ----------------
export async function getSettings(): Promise<any> {
  const settingsData: any = {};
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase.from('settings').select('*');
      if (!error && data) {
        data.forEach(item => {
          settingsData[item.key] = item.value;
        });
      }
    } catch (err) {
      console.warn('Error reading settings from Supabase:', err);
    }
  } else {
    const localData = getLocal('artinova_settings', {});
    Object.assign(settingsData, localData);
  }

  // Ensure fresh defaults are set if empty or containing old placeholders
  const finalSettings = {
    gpay_upi_id: (!settingsData.gpay_upi_id || settingsData.gpay_upi_id === 'artinova@upi') 
      ? 'akashselva18@okhdfcbank' 
      : settingsData.gpay_upi_id,
    gpay_qr_url: (!settingsData.gpay_qr_url || settingsData.gpay_qr_url.includes('unsplash.com')) 
      ? '/qr-code.jpg' 
      : settingsData.gpay_qr_url,
    whatsapp_number: settingsData.whatsapp_number || '+91 99942 03670',
    gst_rate: settingsData.gst_rate || '18',
    free_shipping_threshold: settingsData.free_shipping_threshold || '999'
  };

  return finalSettings;
}

export async function updateSettings(key: string, value: string): Promise<boolean> {
  if (isSupabaseConfigured) {
    const { error } = await supabase.from('settings').upsert({ key, value });
    return !error;
  }
  const settings = getLocal('artinova_settings', {});
  settings[key] = value;
  setLocal('artinova_settings', settings);
  return true;
}

// ---------------- CONTACT REQUESTS ----------------
export async function createContactRequest(req: { name: string; email: string; phone: string; message: string; type?: string }): Promise<boolean> {
  if (isSupabaseConfigured) {
    const { error } = await supabase.from('contact_requests').insert([req]);
    return !error;
  }
  const requests = getLocal('artinova_contact_requests', []);
  requests.push({ ...req, id: `req-${Date.now()}`, created_at: new Date().toISOString() });
  setLocal('artinova_contact_requests', requests);
  return true;
}

export async function getContactRequests(): Promise<any[]> {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from('contact_requests').select('*').order('created_at', { ascending: false });
    if (!error && data) return data;
  }
  return getLocal('artinova_contact_requests', []);
}

// ---------------- REVIEWS ----------------
export async function getReviews(productId: string): Promise<Review[]> {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from('reviews').select('*, profiles(*)').eq('product_id', productId).order('created_at', { ascending: false });
    if (!error && data) {
      return data.map(item => ({
        id: item.id,
        product_id: item.product_id,
        user_id: item.user_id,
        user_name: item.profiles?.full_name || 'Bespoke Patron',
        rating: item.rating,
        review: item.review,
        is_verified: item.is_verified,
        created_at: item.created_at
      }));
    }
  }
  const reviews = getLocal('artinova_reviews', []);
  return reviews.filter((r: Review) => r.product_id === productId);
}

export async function createReview(review: Omit<Review, 'id' | 'created_at'>): Promise<Review> {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from('reviews').insert([review]).select().single();
    if (error) throw error;
    return data as Review;
  }
  const reviews = getLocal('artinova_reviews', []);
  const newRev: Review = {
    ...review,
    id: `rev-${Date.now()}`,
    created_at: new Date().toISOString()
  };
  reviews.push(newRev);
  setLocal('artinova_reviews', reviews);
  return newRev;
}
