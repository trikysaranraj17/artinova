'use client';

import React, { useState, useEffect, useRef } from 'react';
import NextLink from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { getProductBySlug, getProducts, getReviews, createReview, Product, Review } from '../../../lib/db';
import { useAuthStore } from '../../../store/authStore';
import { useCartStore } from '../../../store/cartStore';
import { useWishlistStore } from '../../../store/wishlistStore';
import { Heart, ShoppingCart, ArrowLeft, ShieldCheck, Sparkles, Share2, Upload, Star, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const { user } = useAuthStore();
  const { addItem, setCartDrawerOpen } = useCartStore();
  const { items: wishlistItems, toggleItem, hasItem } = useWishlistStore();

  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Gallery
  const [activeImage, setActiveImage] = useState('');
  const [qty, setQty] = useState(1);

  // Magnifier Lens State
  const [lensShow, setLensShow] = useState(false);
  const [lensPos, setLensPos] = useState({ x: 0, y: 0 });
  const [lensBgPos, setLensBgPos] = useState('0% 0%');
  const imgContainerRef = useRef<HTMLDivElement>(null);

  // Customization
  const [engravingText, setEngravingText] = useState('');
  const [selectedVariant, setSelectedVariant] = useState('Standard Size');
  const [uploadedPhoto, setUploadedPhoto] = useState<string | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);

  // Review Form
  const [newRating, setNewRating] = useState(5);
  const [newReviewText, setNewReviewText] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  // Share
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    async function loadProductData() {
      setLoading(true);
      try {
        const item = await getProductBySlug(slug);
        if (item) {
          setProduct(item);
          setActiveImage(item.images[0] || 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800');
          
          const revs = await getReviews(item.id);
          setReviews(revs);
          
          const allProds = await getProducts();
          // related products are items in the same category
          const filtered = allProds.filter(p => p.id !== item.id && p.category_id === item.category_id).slice(0, 4);
          setRelatedProducts(filtered);
        }
      } catch (err) {
        console.error('Error loading product details:', err);
      } finally {
        setLoading(false);
      }
    }
    loadProductData();
  }, [slug]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imgContainerRef.current) return;
    const { left, top, width, height } = imgContainerRef.current.getBoundingClientRect();
    
    // Calculate mouse position relative to container
    const x = e.clientX - left;
    const y = e.clientY - top;

    // Boundary check
    if (x < 0 || x > width || y < 0 || y > height) {
      setLensShow(false);
      return;
    }

    setLensShow(true);

    // Position lens center at cursor
    const lensSize = 150; // matching CSS
    const px = x - lensSize / 2;
    const py = y - lensSize / 2;

    setLensPos({ x: px, y: py });

    // Calculate background position of the zoomed image
    const rx = (x / width) * 100;
    const ry = (y / height) * 100;
    setLensBgPos(`${rx}% ${ry}%`);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploadLoading(true);
    // Convert to base64 for mockup upload
    const reader = new FileReader();
    reader.onloadend = () => {
      setUploadedPhoto(reader.result as string);
      setFormSuccess('Photo uploaded successfully.');
      setUploadLoading(false);
    };
    reader.readAsDataURL(file);
  };

  const [formSuccess, setFormSuccess] = useState('');

  const handleAddToCart = () => {
    if (!product) return;
    const customization = {
      engravingText: engravingText || undefined,
      variantSize: selectedVariant,
      photoUrl: uploadedPhoto || undefined
    };
    
    const uId = user?.id || 'guest';
    addItem(uId, product.id, qty, customization);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    router.push('/cart');
  };

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || !newReviewText) return;

    try {
      const rev = await createReview({
        product_id: product.id,
        user_id: user?.id || 'guest',
        user_name: user?.full_name || 'Bespoke Patron',
        rating: newRating,
        review: newReviewText,
        is_verified: !!user
      });
      setReviews(prev => [rev, ...prev]);
      setReviewSubmitted(true);
      setNewReviewText('');
      setTimeout(() => setReviewSubmitted(false), 4000);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center text-[#C9A84C]">
        <div className="w-10 h-10 border-2 border-[#C9A84C] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center text-center p-6 gap-4">
        <h1 className="font-display text-3xl text-[#F5F0E8]">Creations Not Found</h1>
        <NextLink href="/shop" className="btn-solid-gold">
          Return to Boutique
        </NextLink>
      </div>
    );
  }

  const isWishlisted = hasItem(product.id);
  const saveAmt = product.original_price ? product.original_price - product.price : 0;

  return (
    <div className="min-h-screen pt-32 pb-24 px-6 bg-[#0A0A0A] text-[#F5F0E8] font-body relative">
      <div className="max-w-7xl mx-auto">
        
        {/* Back Link */}
        <NextLink
          href="/shop"
          className="inline-flex items-center gap-2 text-xs font-accent uppercase tracking-widest text-[#9A8F7E] hover:text-[#C9A84C] mb-8 transition-colors"
        >
          <ArrowLeft size={13} /> Back to Boutique
        </NextLink>

        {/* 2-Column Product Detail Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
          
          {/* LEFT: Product Gallery */}
          <div className="flex flex-col gap-5">
            {/* Main Image Magnifier Container */}
            <div 
              ref={imgContainerRef}
              onMouseMove={handleMouseMove}
              onMouseLeave={() => setLensShow(false)}
              className="relative aspect-square w-full border border-[#C9A84C]/15 rounded-lg bg-[#111111] overflow-hidden shadow-2xl"
            >
              <img 
                src={activeImage} 
                alt={product.name} 
                className="w-full h-full object-cover"
              />

              {/* Magnifier Lens Overlay */}
              {lensShow && (
                <div 
                  className="magnifier-lens"
                  style={{
                    display: 'block',
                    left: `${lensPos.x}px`,
                    top: `${lensPos.y}px`,
                    backgroundImage: `url(${activeImage})`,
                    backgroundPosition: lensBgPos,
                    backgroundSize: '800px 800px' // adjust based on zoom scale
                  }}
                />
              )}

              {/* 360° View Badge */}
              <span className="absolute bottom-4 left-4 bg-[#0A0A0A]/80 border border-[#C9A84C]/35 px-3 py-1 rounded text-[8px] font-accent uppercase tracking-widest text-[#C9A84C]">
                ✦ 360° View Ready
              </span>

              {/* Heart Toggle */}
              <button 
                onClick={() => toggleItem(user?.id || 'guest', product.id)}
                className="absolute top-4 right-4 z-10 p-2.5 rounded-full bg-[#0A0A0A]/70 border border-[#C9A84C]/15 hover:border-[#C9A84C] text-[#F5F0E8]/70 hover:text-red-400 transition-all cursor-pointer"
              >
                <Heart size={16} fill={isWishlisted ? '#ef4444' : 'none'} className={isWishlisted ? 'text-red-500' : ''} />
              </button>
            </div>

            {/* Thumbnail selector strip */}
            <div className="grid grid-cols-4 gap-3">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  className={`aspect-square relative rounded overflow-hidden border transition-all ${
                    activeImage === img 
                      ? 'border-[#C9A84C] scale-95 shadow-[0_0_8px_rgba(201,168,76,0.3)]' 
                      : 'border-[#C9A84C]/15 hover:border-[#C9A84C]/45'
                  }`}
                >
                  <img src={img} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* RIGHT: Product Info details */}
          <div className="flex flex-col gap-6">
            
            {/* Badges */}
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 bg-[#111111] border border-[#C9A84C]/30 text-[#C9A84C] rounded text-[8px] font-accent uppercase tracking-widest font-bold">
                Luxury Keepsake
              </span>
              {product.is_featured && (
                <span className="px-2.5 py-1 bg-[#C9A84C] text-[#0A0A0A] rounded text-[8px] font-accent uppercase tracking-widest font-extrabold shadow-sm">
                  Bestseller
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-wide text-[#F5F0E8]">
              {product.name}
            </h1>

            {/* Reviews summary */}
            <div className="flex items-center gap-1">
              <div className="flex text-[#C9A84C] text-[11px]">
                {Array.from({ length: 5 }).map((_, i) => <span key={i}>★</span>)}
              </div>
              <span className="text-[#9A8F7E] text-xs font-semibold ml-2">
                4.9 ({reviews.length || 128} reviews)
              </span>
            </div>

            {/* Prices panel */}
            <div className="flex flex-col gap-1 border-y border-[#C9A84C]/15 py-4 select-none">
              <div className="flex items-baseline gap-4">
                <span className="font-display text-3xl font-semibold text-[#C9A84C]">
                  ₹{product.price.toLocaleString()}
                </span>
                {product.original_price && (
                  <span className="font-body text-[#9A8F7E]/50 line-through text-sm">
                    ₹{product.original_price.toLocaleString()}
                  </span>
                )}
              </div>
              {saveAmt > 0 && (
                <span className="text-emerald-400 font-accent text-[9px] uppercase tracking-widest font-bold mt-1">
                  You save ₹{saveAmt.toLocaleString()} (Free wrap included)
                </span>
              )}
            </div>

            {/* Description */}
            <div className="flex flex-col gap-2">
              <h4 className="font-accent text-[10px] uppercase tracking-widest text-[#C9A84C] font-semibold">The Description</h4>
              <p className="font-body text-xs sm:text-sm text-[#9A8F7E] leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Features lists */}
            <div className="grid grid-cols-2 gap-3 text-xs text-[#F5F0E8]/80 font-body py-2">
              <div className="flex items-center gap-2">
                <span className="text-[#C9A84C]">✦</span>
                <span>Handcrafted in India</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#C9A84C]">✦</span>
                <span>Premium Resins & Crystals</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#C9A84C]">✦</span>
                <span>Fully Customizable Details</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#C9A84C]">✦</span>
                <span>Luxury Signature Packaging</span>
              </div>
            </div>

            {/* Customizations options (conditional) */}
            {product.is_customizable && (
              <div className="p-6 rounded-lg bg-[#111111] border border-[#C9A84C]/15 flex flex-col gap-4">
                <h3 className="font-accent text-xs font-bold uppercase tracking-widest text-[#C9A84C] flex items-center gap-2">
                  <span>🛠️</span> Customization panel
                </h3>

                {/* Name / Message text box */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] uppercase tracking-widest text-[#9A8F7E] font-bold">Custom Engraving Text / Monogram</label>
                  <input 
                    type="text" 
                    placeholder="e.g. John & Kiara - 15.08.2026"
                    value={engravingText}
                    onChange={(e) => setEngravingText(e.target.value)}
                    className="bg-[#0A0A0A] border border-[#C9A84C]/10 py-2.5 px-3 text-xs text-[#F5F0E8] outline-none rounded focus:border-[#C9A84C]"
                  />
                </div>

                {/* Photo uploader (if applicable to photo gifts) */}
                {(product.slug.includes('photo') || product.slug.includes('frame') || product.slug.includes('accordion')) && (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] uppercase tracking-widest text-[#9A8F7E] font-bold">Memory Photo Upload</label>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center justify-center gap-2 border border-dashed border-[#C9A84C]/30 bg-[#0A0A0A] py-3.5 px-6 rounded text-xs font-accent uppercase tracking-wider text-[#C9A84C] cursor-pointer hover:border-[#C9A84C] transition-all">
                        <Upload size={13} /> {uploadLoading ? 'Uploading...' : 'Choose File'}
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          className="hidden" 
                        />
                      </label>
                      {uploadedPhoto && (
                        <div className="w-10 h-10 rounded overflow-hidden border border-[#C9A84C]">
                          <img src={uploadedPhoto} className="w-full h-full object-cover" alt="Custom upload" />
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Size Swatch variants */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] uppercase tracking-widest text-[#9A8F7E] font-bold">Size Swatch Swatch</label>
                  <div className="flex gap-2">
                    {['Standard Size', 'Grande Deluxe (+₹1,500)', 'Royal Sovereign (+₹3,000)'].map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedVariant(size)}
                        className={`px-3 py-2 border rounded text-[10px] font-accent uppercase tracking-wider transition-all cursor-pointer ${selectedVariant === size ? 'border-[#C9A84C] text-[#C9A84C] bg-[#C9A84C]/5' : 'border-[#C9A84C]/15 text-[#9A8F7E]'}`}
                      >
                        {size.split(' ')[0]}
                      </button>
                    ))}
                  </div>
                </div>

                {formSuccess && (
                  <span className="text-emerald-400 text-[10px] font-accent uppercase tracking-wider animate-pulse">{formSuccess}</span>
                )}
              </div>
            )}

            {/* Qty and Actions */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4">
                {/* Quantity */}
                <div className="flex items-center border border-[#C9A84C]/20 bg-[#111111] px-2 h-12 rounded">
                  <button 
                    onClick={() => setQty(prev => Math.max(1, prev - 1))}
                    className="px-3 text-[#9A8F7E] hover:text-[#C9A84C] text-lg font-bold cursor-pointer"
                  >
                    -
                  </button>
                  <span className="w-10 text-center text-xs font-bold">{qty}</span>
                  <button 
                    onClick={() => setQty(prev => prev + 1)}
                    className="px-3 text-[#9A8F7E] hover:text-[#C9A84C] text-lg font-bold cursor-pointer"
                  >
                    +
                  </button>
                </div>
                
                <span className="text-[11px] text-[#9A8F7E] font-body">
                  Estimated Delivery: 5–7 Business Days
                </span>
              </div>

              {/* Buttons */}
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={handleAddToCart}
                  className="btn-solid-gold h-14 w-full flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ShoppingCart size={14} /> Add To Cart
                </button>
                <button 
                  onClick={handleBuyNow}
                  className="btn-gold h-14 w-full flex items-center justify-center cursor-pointer"
                >
                  Buy Now
                </button>
              </div>

              {/* Secondary links */}
              <div className="flex items-center gap-4 text-xs font-accent uppercase tracking-widest text-[#9A8F7E] mt-2 select-none">
                <button 
                  onClick={() => toggleItem(user?.id || 'guest', product.id)}
                  className="hover:text-[#C9A84C] transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Heart size={13} fill={isWishlisted ? '#ef4444' : 'none'} className={isWishlisted ? 'text-red-500' : ''} /> {isWishlisted ? 'Wishlisted' : 'Add to Wishlist'}
                </button>
                <span className="text-[#C9A84C]/20">|</span>
                <button 
                  onClick={handleShare}
                  className="hover:text-[#C9A84C] transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Share2 size={13} /> {copiedLink ? 'Link Copied!' : 'Share Creation'}
                </button>
              </div>
            </div>

            {/* Premium Guarantee */}
            <div className="p-5 rounded-lg bg-[#111111] border border-[#C9A84C]/10 flex gap-4">
              <ShieldCheck className="text-[#C9A84C] shrink-0" size={18} />
              <div className="flex flex-col gap-1">
                <span className="font-accent text-xs font-bold text-[#C9A84C]">Artinova Trust Guarantee</span>
                <p className="font-body text-[10px] text-[#9A8F7E] leading-normal">
                  All custom keepsakes are packaged inside wooden transit crates. Secure payments verified within 2 hours. Handcrafted individually by local Indian artisans.
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* BELOW FOLD: Reviews and Star breakdown */}
        <div className="mt-28 border-t border-[#C9A84C]/15 pt-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* Reviews Breakdown (Left - 4 cols) */}
            <div className="lg:col-span-4 flex flex-col gap-6 select-none">
              <h3 className="font-display text-2xl font-bold">Patron Review Metrics</h3>
              
              <div className="flex items-baseline gap-2">
                <span className="font-display text-5xl font-extrabold text-[#C9A84C]">4.9</span>
                <span className="text-[#9A8F7E] text-sm">out of 5 stars</span>
              </div>

              {/* Star bars */}
              <div className="flex flex-col gap-2">
                {[
                  { star: 5, pct: '92%' },
                  { star: 4, pct: '6%' },
                  { star: 3, pct: '2%' }
                ].map((row) => (
                  <div key={row.star} className="flex items-center gap-3 text-xs text-[#9A8F7E]">
                    <span className="w-12 text-right">{row.star} stars</span>
                    <div className="flex-grow h-[3px] bg-[#111111] relative rounded">
                      <div className="absolute top-0 bottom-0 left-0 bg-[#C9A84C] rounded" style={{ width: row.pct }} />
                    </div>
                    <span className="w-8">{row.pct}</span>
                  </div>
                ))}
              </div>

              {/* Review submit form */}
              <form onSubmit={handleReviewSubmit} className="mt-6 p-5 rounded-lg bg-[#111111] border border-[#C9A84C]/10 flex flex-col gap-4">
                <h4 className="font-accent text-[10px] uppercase tracking-widest text-[#C9A84C] font-bold">Write a Review</h4>
                
                {/* Rating selection */}
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] uppercase tracking-widest text-[#9A8F7E]">Your Rating</label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNewRating(star)}
                        className="text-[#C9A84C] text-lg hover:scale-110 transition-transform cursor-pointer"
                      >
                        {star <= newRating ? '★' : '☆'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] uppercase tracking-widest text-[#9A8F7E]">Your Review</label>
                  <textarea 
                    rows={3} 
                    required
                    value={newReviewText}
                    onChange={(e) => setNewReviewText(e.target.value)}
                    placeholder="Describe your unboxing and curation experience..."
                    className="bg-[#0A0A0A] border border-[#C9A84C]/10 p-2.5 text-xs text-[#F5F0E8] outline-none rounded"
                  />
                </div>

                <button type="submit" className="btn-solid-gold py-3 text-[9px] font-accent uppercase tracking-widest font-extrabold cursor-pointer">
                  Submit Review
                </button>
                {reviewSubmitted && (
                  <span className="text-emerald-400 text-[10px] font-accent uppercase tracking-wider text-center animate-pulse">Review saved. Awaiting validation.</span>
                )}
              </form>
            </div>

            {/* Reviews list (Right - 8 cols) */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              <h3 className="font-display text-2xl font-bold mb-4">Patron Testimonials</h3>
              
              {reviews.length === 0 ? (
                <div className="text-center py-10 bg-[#111111] border border-[#C9A84C]/5 rounded-lg">
                  <span className="text-lg italic text-[#9A8F7E]">No reviews logged yet. Be the first to share.</span>
                </div>
              ) : (
                <div className="flex flex-col gap-6">
                  {reviews.map((rev) => (
                    <div key={rev.id} className="p-6 rounded-lg bg-[#111111] border border-[#C9A84C]/5 flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-[#C9A84C]/10 border border-[#C9A84C]/35 flex items-center justify-center text-[10px] text-[#C9A84C] font-extrabold">
                            {rev.user_name?.charAt(0) || 'P'}
                          </div>
                          <span className="text-xs font-bold">{rev.user_name}</span>
                          {rev.is_verified && (
                            <span className="text-[8px] font-accent uppercase tracking-widest text-emerald-400 bg-emerald-950/20 px-1.5 py-0.5 rounded border border-emerald-500/25">Verified Buyer</span>
                          )}
                        </div>
                        <span className="text-[10px] text-[#9A8F7E]/40 font-body">12 June 2025</span>
                      </div>

                      <div className="flex text-[#C9A84C] text-[10px]">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <span key={i}>{i < rev.rating ? '★' : '☆'}</span>
                        ))}
                      </div>

                      <p className="font-body text-xs text-[#9A8F7E] leading-relaxed">
                        "{rev.review}"
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Related Products Grid */}
        {relatedProducts.length > 0 && (
          <div className="mt-28 border-t border-[#C9A84C]/15 pt-20">
            <h2 className="font-display text-3xl font-bold mb-10 text-center sm:text-left">Complementary Masterpieces</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((p) => {
                const inWish = hasItem(p.id);
                return (
                  <div key={p.id} className="group luxury-card relative flex flex-col h-full bg-[#161616]">
                    <div className="absolute top-3 right-3 z-10">
                      <button 
                        onClick={() => toggleItem(user?.id || 'guest', p.id)}
                        className="p-2 rounded-full bg-[#0A0A0A]/60 border border-[#C9A84C]/10 text-[#F5F0E8]/70 hover:text-red-400 transition-colors cursor-pointer"
                      >
                        <Heart size={12} fill={inWish ? '#ef4444' : 'none'} className={inWish ? 'text-red-500' : ''} />
                      </button>
                    </div>

                    <NextLink href={`/products/${p.slug}`} className="relative aspect-square w-full overflow-hidden block">
                      <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    </NextLink>

                    <div className="p-4 flex flex-col flex-grow gap-2 border-t border-[#C9A84C]/10 bg-[#111111]">
                      <NextLink href={`/products/${p.slug}`} className="font-display text-[15px] text-[#F5F0E8] line-clamp-1 hover:text-[#C9A84C] transition-colors">
                        {p.name}
                      </NextLink>
                      <span className="font-body text-[#C9A84C] font-bold text-xs mt-auto">
                        ₹{p.price.toLocaleString()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
