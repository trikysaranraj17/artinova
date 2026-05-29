import { supabase, isSupabaseConfigured } from './supabase';

export interface Product {
  id: string;
  title: string;
  price: number;
  description: string;
  category: string;
  images: string[];
  stock: number;
  created_at?: string;
}

export interface Order {
  id: string;
  user_id?: string;
  shipping_name: string;
  shipping_phone: string;
  shipping_email: string;
  shipping_address: string;
  status: string; // 'Order received', 'Crafting in progress', 'Quality check', 'Packed', 'Shipped', 'Out for delivery', 'Delivered'
  total_amount: number;
  screenshot_url?: string;
  delivery_estimate: string;
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
  product?: Product;
}

export interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  product?: Product;
}

export interface TrackingUpdate {
  id: string;
  order_id: string;
  status: string;
  comment?: string;
  updated_at: string;
}

// Initial mock products for seeding/fallback
const MOCK_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    title: 'The Royal Monarch Gift Box',
    price: 299.00,
    description: 'A handcrafted luxury wooden keepsake box, lined with plush royal burgundy velvet and decorated with metallic gold wing filigree. Ideal for securing heirlooms or gifting high-end jewelry.',
    category: 'Royal Box',
    images: ['https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800&auto=format&fit=crop&q=80'],
    stock: 12,
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'prod-2',
    title: 'Midnight Sapphire Trinket',
    price: 180.00,
    description: 'An elegantly hand-blown deep sapphire crystal container featuring gold leaf rim details and structural brass accents. Creates a stunning display of premium craftsmanship on any dressing table.',
    category: 'Crystal Craft',
    images: ['https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1607344645866-009c320c5ab8?w=800&auto=format&fit=crop&q=80'],
    stock: 8,
    created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'prod-3',
    title: 'Aura Wings Champagne Flutes',
    price: 145.00,
    description: 'A set of two custom-engraved premium crystal champagne glasses with golden hand-painted bases and majestic wings sculpted into the glass stems. Each flute is a toast to luxury.',
    category: 'Glass Art',
    images: ['https://images.unsplash.com/photo-1574926053821-79c5e338a933?w=800&auto=format&fit=crop&q=80'],
    stock: 15,
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'prod-4',
    title: 'The Golden Horizon Letter Opener',
    price: 95.00,
    description: 'Polished solid bronze envelope blade featuring a customized handle molded in glowing amber composite with encapsulated micro gold dust. Elevates the simple act of opening correspondence.',
    category: 'Desk Accents',
    images: ['https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=800&auto=format&fit=crop&q=80'],
    stock: 20,
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'prod-5',
    title: 'Artinova Custom Couple Album',
    price: 220.00,
    description: 'Hand-sewn premium Italian grain leather scrapbook with personalized gold foil lettering and heavy gilt-edged archival pages. Designed to preserve your most intimate memories for a lifetime.',
    category: 'Personalized',
    images: ['https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&auto=format&fit=crop&q=80'],
    stock: 5,
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'prod-6',
    title: "Emperor's Crimson Trinket Chest",
    price: 350.00,
    description: 'Crafted from rare Honduras mahogany and finished in a deep burgundy wash with custom hand-carved imperial gold scroll patterns. Includes secret compartments and dual combination brass locks.',
    category: 'Royal Box',
    images: ['https://images.unsplash.com/photo-1537243912501-8b27429117f7?w=800&auto=format&fit=crop&q=80'],
    stock: 3,
    created_at: new Date().toISOString()
  }
];

// Helper to get local data
const getLocalData = (key: string, defaultVal: any) => {
  if (typeof window === 'undefined') return defaultVal;
  const item = localStorage.getItem(key);
  return item ? JSON.parse(item) : defaultVal;
};

// Helper to set local data
const setLocalData = (key: string, data: any) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(key, JSON.stringify(data));
  }
};

// Initialize localStorage with Mock Data
if (typeof window !== 'undefined') {
  if (!localStorage.getItem('artinova_products')) {
    localStorage.setItem('artinova_products', JSON.stringify(MOCK_PRODUCTS));
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
}

// ---------------- PRODUCTS OPERATIONS ----------------

export async function getProducts(): Promise<Product[]> {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    if (!error && data) return data as Product[];
    console.warn('Supabase getProducts error, falling back:', error);
  }
  return getLocalData('artinova_products', MOCK_PRODUCTS);
}

export async function getProductById(id: string): Promise<Product | null> {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from('products').select('*').eq('id', id).single();
    if (!error && data) return data as Product;
    console.warn('Supabase getProductById error, falling back:', error);
  }
  const products = getLocalData('artinova_products', MOCK_PRODUCTS);
  return products.find((p: Product) => p.id === id) || null;
}

export async function createProduct(product: Omit<Product, 'id'>): Promise<Product> {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from('products').insert([product]).select().single();
    if (!error && data) return data as Product;
    throw new Error(error?.message || 'Error inserting product in Supabase');
  }
  const products = getLocalData('artinova_products', MOCK_PRODUCTS);
  const newProduct: Product = {
    ...product,
    id: `prod-${Date.now()}`,
    created_at: new Date().toISOString()
  };
  products.unshift(newProduct);
  setLocalData('artinova_products', products);
  return newProduct;
}

export async function updateProduct(id: string, product: Partial<Product>): Promise<Product> {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from('products').update(product).eq('id', id).select().single();
    if (!error && data) return data as Product;
    throw new Error(error?.message || 'Error updating product in Supabase');
  }
  const products = getLocalData('artinova_products', MOCK_PRODUCTS);
  const index = products.findIndex((p: Product) => p.id === id);
  if (index === -1) throw new Error('Product not found');
  const updatedProduct = { ...products[index], ...product };
  products[index] = updatedProduct;
  setLocalData('artinova_products', products);
  return updatedProduct;
}

export async function deleteProduct(id: string): Promise<boolean> {
  if (isSupabaseConfigured) {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (!error) return true;
    console.error('Supabase deleteProduct error:', error);
    return false;
  }
  const products = getLocalData('artinova_products', MOCK_PRODUCTS);
  const filtered = products.filter((p: Product) => p.id !== id);
  setLocalData('artinova_products', filtered);
  return true;
}


// ---------------- ORDER OPERATIONS ----------------

export async function getOrders(userId?: string): Promise<Order[]> {
  if (isSupabaseConfigured) {
    let query = supabase.from('orders').select('*').order('created_at', { ascending: false });
    if (userId) {
      query = query.eq('user_id', userId);
    }
    const { data, error } = await query;
    if (!error && data) return data as Order[];
    console.warn('Supabase getOrders error, falling back:', error);
  }
  const orders = getLocalData('artinova_orders', []);
  if (userId) {
    return orders.filter((o: Order) => o.user_id === userId);
  }
  return orders;
}

export async function getOrderById(id: string): Promise<Order | null> {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from('orders').select('*').eq('id', id).single();
    if (!error && data) return data as Order;
    console.warn('Supabase getOrderById error, falling back:', error);
  }
  const orders = getLocalData('artinova_orders', []);
  return orders.find((o: Order) => o.id === id) || null;
}

export async function getOrderItems(orderId: string): Promise<OrderItem[]> {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from('order_items').select('*, product:products(*)').eq('order_id', orderId);
    if (!error && data) return data as OrderItem[];
    console.warn('Supabase getOrderItems error, falling back:', error);
  }
  const items = getLocalData('artinova_order_items', []);
  const filtered = items.filter((item: any) => item.order_id === orderId);
  const products = getLocalData('artinova_products', MOCK_PRODUCTS);
  return filtered.map((item: any) => ({
    ...item,
    product: products.find((p: Product) => p.id === item.product_id)
  }));
}

export async function createOrder(
  order: Omit<Order, 'id' | 'status' | 'created_at'>,
  items: Array<{ product_id: string; quantity: number; price: number }>
): Promise<Order> {
  const orderId = isSupabaseConfigured ? undefined : `order-${Date.now()}`;
  const newOrder: Order = {
    ...order,
    id: orderId || '',
    status: 'Order received',
    created_at: new Date().toISOString()
  };

  if (isSupabaseConfigured) {
    // 1. Insert order
    const { data: ordData, error: ordErr } = await supabase.from('orders').insert([newOrder]).select().single();
    if (ordErr || !ordData) throw new Error(ordErr?.message || 'Error inserting order in Supabase');
    
    // 2. Insert items
    const itemsWithOrderId = items.map(item => ({
      order_id: ordData.id,
      product_id: item.product_id,
      quantity: item.quantity,
      price: item.price
    }));
    const { error: itemsErr } = await supabase.from('order_items').insert(itemsWithOrderId);
    if (itemsErr) console.error('Error inserting order items in Supabase:', itemsErr);

    // 3. Create initial tracking update
    await createTrackingUpdate(ordData.id, 'Order received', 'Your order was successfully submitted.');
    
    return ordData as Order;
  }

  // Fallback Local Storage
  newOrder.id = `order-${Date.now()}`;
  const orders = getLocalData('artinova_orders', []);
  orders.unshift(newOrder);
  setLocalData('artinova_orders', orders);

  const localItems = getLocalData('artinova_order_items', []);
  const newItems = items.map(item => ({
    id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    order_id: newOrder.id,
    product_id: item.product_id,
    quantity: item.quantity,
    price: item.price
  }));
  setLocalData('artinova_order_items', [...localItems, ...newItems]);

  // Create initial tracking
  await createTrackingUpdate(newOrder.id, 'Order received', 'Your order was successfully submitted.');

  return newOrder;
}

export async function updateOrderStatus(orderId: string, status: string, comment?: string): Promise<boolean> {
  if (isSupabaseConfigured) {
    const { error } = await supabase.from('orders').update({ status }).eq('id', orderId);
    if (error) {
      console.error('Supabase updateOrderStatus error:', error);
      return false;
    }
    await createTrackingUpdate(orderId, status, comment || `Status updated to ${status}.`);
    return true;
  }

  const orders = getLocalData('artinova_orders', []);
  const index = orders.findIndex((o: Order) => o.id === orderId);
  if (index === -1) return false;
  orders[index].status = status;
  setLocalData('artinova_orders', orders);

  await createTrackingUpdate(orderId, status, comment || `Status updated to ${status}.`);
  return true;
}


// ---------------- TRACKING OPERATIONS ----------------

export async function getTrackingUpdates(orderId: string): Promise<TrackingUpdate[]> {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from('tracking_updates').select('*').eq('order_id', orderId).order('updated_at', { ascending: true });
    if (!error && data) return data as TrackingUpdate[];
    console.error('Supabase getTrackingUpdates error, falling back:', error);
  }
  const tracking = getLocalData('artinova_tracking', []);
  return tracking
    .filter((t: TrackingUpdate) => t.order_id === orderId)
    .sort((a: TrackingUpdate, b: TrackingUpdate) => new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime());
}

export async function createTrackingUpdate(orderId: string, status: string, comment?: string): Promise<TrackingUpdate> {
  const update: Omit<TrackingUpdate, 'id'> = {
    order_id: orderId,
    status,
    comment: comment || `Status updated to ${status}.`,
    updated_at: new Date().toISOString()
  };

  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from('tracking_updates').insert([update]).select().single();
    if (!error && data) return data as TrackingUpdate;
    console.warn('Supabase createTrackingUpdate error, continuing with fallback:', error);
  }

  const tracking = getLocalData('artinova_tracking', []);
  const newUpdate: TrackingUpdate = {
    ...update,
    id: `track-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  };
  tracking.push(newUpdate);
  setLocalData('artinova_tracking', tracking);
  return newUpdate;
}


// ---------------- CART OPERATIONS ----------------

export async function getCart(userId: string): Promise<CartItem[]> {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from('cart_items').select('*, product:products(*)').eq('user_id', userId);
    if (!error && data) return data as CartItem[];
    console.warn('Supabase getCart error, falling back:', error);
  }
  const cart = getLocalData('artinova_cart', []);
  const filtered = cart.filter((item: any) => item.user_id === userId);
  const products = getLocalData('artinova_products', MOCK_PRODUCTS);
  return filtered.map((item: any) => ({
    ...item,
    product: products.find((p: Product) => p.id === item.product_id)
  }));
}

export async function addToCart(userId: string, productId: string, quantity: number = 1): Promise<boolean> {
  if (isSupabaseConfigured) {
    const { error } = await supabase.from('cart_items').upsert(
      { user_id: userId, product_id: productId, quantity },
      { onConflict: 'user_id,product_id' }
    );
    if (!error) return true;
    console.error('Supabase addToCart error:', error);
  }
  const cart = getLocalData('artinova_cart', []);
  const index = cart.findIndex((item: any) => item.user_id === userId && item.product_id === productId);
  if (index !== -1) {
    cart[index].quantity += quantity;
  } else {
    cart.push({
      id: `cart-${Date.now()}`,
      user_id: userId,
      product_id: productId,
      quantity
    });
  }
  setLocalData('artinova_cart', cart);
  return true;
}

export async function updateCartQuantity(userId: string, productId: string, quantity: number): Promise<boolean> {
  if (isSupabaseConfigured) {
    const { error } = await supabase.from('cart_items').update({ quantity }).match({ user_id: userId, product_id: productId });
    if (!error) return true;
    console.error('Supabase updateCartQuantity error:', error);
  }
  const cart = getLocalData('artinova_cart', []);
  const index = cart.findIndex((item: any) => item.user_id === userId && item.product_id === productId);
  if (index !== -1) {
    cart[index].quantity = quantity;
    setLocalData('artinova_cart', cart);
    return true;
  }
  return false;
}

export async function removeFromCart(userId: string, productId: string): Promise<boolean> {
  if (isSupabaseConfigured) {
    const { error } = await supabase.from('cart_items').delete().match({ user_id: userId, product_id: productId });
    if (!error) return true;
    console.error('Supabase removeFromCart error:', error);
  }
  const cart = getLocalData('artinova_cart', []);
  const filtered = cart.filter((item: any) => !(item.user_id === userId && item.product_id === productId));
  setLocalData('artinova_cart', filtered);
  return true;
}

export async function clearCart(userId: string): Promise<boolean> {
  if (isSupabaseConfigured) {
    const { error } = await supabase.from('cart_items').delete().eq('user_id', userId);
    if (!error) return true;
    console.error('Supabase clearCart error:', error);
  }
  const cart = getLocalData('artinova_cart', []);
  const filtered = cart.filter((item: any) => item.user_id !== userId);
  setLocalData('artinova_cart', filtered);
  return true;
}


// ---------------- WISHLIST OPERATIONS ----------------

export async function getWishlist(userId: string): Promise<Product[]> {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from('wishlist').select('product:products(*)').eq('user_id', userId);
    if (!error && data) {
      return (data as any[]).map(item => item.product).filter(Boolean) as Product[];
    }
    console.warn('Supabase getWishlist error, falling back:', error);
  }
  const wishlist = getLocalData('artinova_wishlist', []);
  const filtered = wishlist.filter((item: any) => item.user_id === userId);
  const products = getLocalData('artinova_products', MOCK_PRODUCTS);
  return filtered.map((item: any) => products.find((p: Product) => p.id === item.product_id)).filter(Boolean) as Product[];
}

export async function toggleWishlist(userId: string, productId: string): Promise<boolean> {
  const wishlist = getLocalData('artinova_wishlist', []);
  const index = wishlist.findIndex((item: any) => item.user_id === userId && item.product_id === productId);
  const exists = index !== -1;

  if (isSupabaseConfigured) {
    if (exists) {
      const { error } = await supabase.from('wishlist').delete().match({ user_id: userId, product_id: productId });
      if (error) console.error('Supabase delete wishlist error:', error);
    } else {
      const { error } = await supabase.from('wishlist').insert({ user_id: userId, product_id: productId });
      if (error) console.error('Supabase insert wishlist error:', error);
    }
  }

  // Fallback Local Storage
  if (exists) {
    wishlist.splice(index, 1);
  } else {
    wishlist.push({
      id: `wish-${Date.now()}`,
      user_id: userId,
      product_id: productId
    });
  }
  setLocalData('artinova_wishlist', wishlist);
  return !exists;
}
