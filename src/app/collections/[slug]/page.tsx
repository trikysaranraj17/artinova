'use client';

import React, { useState, useEffect } from 'react';
import NextLink from 'next/link';
import { useParams } from 'next/navigation';
import { getCollectionProducts, getCollections, Product, Collection } from '../../../lib/db';
import { useCartStore } from '../../../store/cartStore';
import { useWishlistStore } from '../../../store/wishlistStore';
import { useAuthStore } from '../../../store/authStore';
import { Heart, Sparkles } from 'lucide-react';

export default function CollectionPage() {
  const params = useParams();
  const slug = params.slug as string;

  const { user } = useAuthStore();
  const { addItem } = useCartStore();
  const { toggleItem, hasItem } = useWishlistStore();

  const [products, setProducts] = useState<Product[]>([]);
  const [collection, setCollection] = useState<Collection | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const cols = await getCollections();
        const currentCol = cols.find(c => c.slug === slug) || null;
        setCollection(currentCol);

        if (currentCol) {
          const items = await getCollectionProducts(slug);
          setProducts(items);
        }
      } catch (err) {
        console.error('Error fetching collection products:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [slug]);

  // Set collection specific banner background fallbacks
  const getBannerUrl = () => {
    if (collection?.banner_url) return collection.banner_url;
    switch (slug) {
      case 'wedding-gifts': return 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=1200';
      case 'couple-gifts': return 'https://images.unsplash.com/photo-1513201099705-a9746e1e201f?w=1200';
      case 'birthday-gifts': return 'https://images.unsplash.com/photo-1606744824163-985d376605aa?w=1200';
      case 'corporate-gifts': return 'https://images.unsplash.com/photo-1589256469067-ea99122bbec4?w=1200';
      case 'photo-gifts': return 'https://images.unsplash.com/photo-1512909006721-3d6018887383?w=1200';
      case 'resin-art': return 'https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?w=1200';
      case 'luxury-hampers': return 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=1200';
      default: return 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=1200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center text-[#C9A84C]">
        <div className="w-10 h-10 border-2 border-[#C9A84C] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center text-center p-6 gap-4">
        <h1 className="font-display text-3xl text-[#F5F0E8]">Collection Not Found</h1>
        <NextLink href="/shop" className="btn-solid-gold">
          Return to Shop
        </NextLink>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F5F0E8] font-body pb-24">
      {/* Editorial Banner */}
      <section className="relative min-h-[300px] sm:min-h-[400px] pt-[88px] md:pt-[104px] pb-12 w-full flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src={getBannerUrl()} 
            alt={collection.name} 
            className="w-full h-full object-cover opacity-35"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/60 to-transparent" />
        </div>
        
        <div className="relative z-10 text-center px-6 max-w-3xl flex flex-col items-center gap-4">
          <span className="font-accent text-[9px] uppercase tracking-[0.3em] text-[#C9A84C]">ARTINOVA CURATED</span>
          <h1 className="font-display text-4xl sm:text-6xl font-semibold tracking-wide text-gold-gradient leading-none">
            {collection.name}
          </h1>
          {collection.description && (
            <p className="font-display italic text-[#9A8F7E] text-sm sm:text-base max-w-xl">
              "{collection.description}"
            </p>
          )}
        </div>
      </section>

      {/* Main Grid Content */}
      <section className="max-w-7xl mx-auto px-6 mt-16">
        
        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-20 gap-4">
            <span className="text-[#C9A84C] text-2xl">✦</span>
            <p className="font-display italic text-lg text-[#9A8F7E]">No items in this collection yet.</p>
            <p className="text-xs text-[#9A8F7E]/60">Our artisans are currently crafting new pieces. Check back soon.</p>
            <NextLink href="/shop" className="btn-gold mt-2">
              Browse All Products
            </NextLink>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((p) => {
              const inWishlist = hasItem(p.id);
              return (
                <div key={p.id} className="group luxury-card relative flex flex-col h-full bg-[#161616]">
                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 z-20 flex flex-col gap-1.5 pointer-events-none">
                    {p.is_featured && (
                      <span className="px-2 py-0.5 bg-[#C9A84C] text-[#0A0A0A] text-[7.5px] font-accent uppercase tracking-widest font-extrabold rounded-sm shadow-md">
                        Bestseller
                      </span>
                    )}
                    {p.is_customizable && (
                      <span className="px-2 py-0.5 bg-[#111111]/90 border border-[#C9A84C]/30 text-[#C9A84C] text-[7.5px] font-accent uppercase tracking-widest font-extrabold rounded-sm">
                        Custom
                      </span>
                    )}
                  </div>

                  {/* Wishlist Heart */}
                  <button 
                    onClick={() => toggleItem(user?.id || 'guest', p.id)}
                    className="absolute top-3 right-3 z-20 p-2 rounded-full bg-[#0A0A0A]/60 border border-[#C9A84C]/10 hover:border-[#C9A84C] text-[#F5F0E8]/70 hover:text-red-400 transition-all cursor-pointer"
                  >
                    <Heart size={13} fill={inWishlist ? '#ef4444' : 'none'} className={inWishlist ? 'text-red-500' : ''} />
                  </button>

                  {/* Image wrapper */}
                  <NextLink href={`/products/${p.slug}`} className="relative aspect-square w-full overflow-hidden block">
                    <img 
                      src={p.images[0]} 
                      alt={p.name} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                    />
                    <div className="absolute inset-0 bg-[#0A0A0A]/0 group-hover:bg-[#0A0A0A]/70 transition-all duration-300 flex items-center justify-center">
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 px-4 py-2 border border-[#C9A84C] bg-[#0A0A0A] text-[#C9A84C] font-accent text-[9px] uppercase tracking-widest font-bold">
                        Quick View
                      </span>
                    </div>
                  </NextLink>

                  {/* Info details */}
                  <div className="p-4 flex flex-col flex-grow gap-2 border-t border-[#C9A84C]/10">
                    <h3 className="font-display text-[15px] text-[#F5F0E8] line-clamp-1 group-hover:text-[#C9A84C] transition-colors">
                      {p.name}
                    </h3>
                    
                    {/* Rating */}
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, starIdx) => (
                        <span key={starIdx} className="text-[#C9A84C] text-[10px]">★</span>
                      ))}
                      <span className="text-[#9A8F7E] text-[9px] ml-1">({p.review_count})</span>
                    </div>

                    <div className="flex items-center justify-between mt-auto pt-2 border-t border-[#C9A84C]/5">
                      <span className="font-body text-[#C9A84C] font-bold text-sm">
                        ₹{p.price.toLocaleString()}
                      </span>
                      {p.original_price && (
                        <span className="font-body text-[#9A8F7E]/50 line-through text-xs">
                          ₹{p.original_price.toLocaleString()}
                        </span>
                      )}
                    </div>
                    
                    <button 
                      onClick={() => addItem(user?.id || 'guest', p.id, 1)}
                      className="w-full bg-[#111111] border border-[#C9A84C]/30 text-[#C9A84C] hover:bg-[#C9A84C] hover:text-[#0A0A0A] py-2 mt-2 text-[9px] font-accent uppercase tracking-widest font-bold transition-all duration-300 cursor-pointer"
                    >
                      Add To Cart
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Section Description */}
        <div className="mt-24 p-8 rounded-lg bg-[#111111] border border-[#C9A84C]/10 text-center max-w-3xl mx-auto flex flex-col items-center gap-3">
          <h3 className="font-accent text-xs tracking-[0.2em] uppercase text-[#C9A84C] font-bold">About the {collection.name}</h3>
          <p className="font-body text-xs text-[#9A8F7E] leading-relaxed">
            Every creation in this collection is designed in our specialized studio using organic botanical flowers, hand-wrapped gold leafing, and royal pigment blends. Our processes ensure premium durability, safe transit, and emotional aesthetics that last a lifetime.
          </p>
        </div>

      </section>
    </div>
  );
}
