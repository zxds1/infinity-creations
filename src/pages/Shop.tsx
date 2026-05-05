import { Fragment, useState, useEffect } from 'react';
import { ShoppingBag, Star, Plus, MapPin, Package, Info, Minus, Check, Search, SlidersHorizontal, ShieldCheck, Store, Sparkles, ArrowRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'react-hot-toast';
import { Link, useSearchParams } from 'react-router-dom';
import { db, auth, collection, getDocs, addDoc, serverTimestamp, query, where, orderBy, deleteDoc, doc } from '../lib/firebase';
import {
  assertProductExists,
  getProductInsightLabels,
  getProductPreferenceScore,
  getStoredPreferences,
  trackEvent,
  type DesignPreferences
} from '../lib/behavior';
import { defaultSiteContent, fetchSiteContent, type SiteContent } from '../lib/siteContent';
import { DEMO_USER_ID, addDemoCartItem, getDemoWishlist, saveDemoWishlist } from '../lib/demoMode';

const DEFAULT_MAX_PRICE = 100000;

export default function Shop() {
  const [searchParams] = useSearchParams();
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState(searchParams.get('query') || '');
  const [priceRange, setPriceRange] = useState({ min: 0, max: DEFAULT_MAX_PRICE });
  const [sortMode, setSortMode] = useState('Recommended');
  const [viewMode, setViewMode] = useState<'inspiration' | 'browse'>('inspiration');
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>(["All", ...defaultSiteContent.categories.map(category => category.title)]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [isZoomed, setIsZoomed] = useState(false);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [compareIds, setCompareIds] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      return JSON.parse(window.localStorage.getItem('maridadi.compareIds') || '[]');
    } catch {
      return [];
    }
  });
  const [preferences, setPreferences] = useState<DesignPreferences>(() => getStoredPreferences());
  const [content, setContent] = useState<SiteContent>(defaultSiteContent);
  
  // Cart state for the current item being added
  const [quantity, setQuantity] = useState(1);
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [customizationNotes, setCustomizationNotes] = useState("");
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productSnap, siteContent] = await Promise.all([
          getDocs(collection(db, 'products')),
          fetchSiteContent()
        ]);
        const productsData = productSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setProducts(productsData);
        setContent(siteContent);
        const highestPrice = Math.max(DEFAULT_MAX_PRICE, ...productsData.map((product: any) => Number(product.price || 0)));
        setPriceRange({ min: 0, max: highestPrice });

        const categorySnap = await getDocs(collection(db, 'categories'));
        const adminCategories = categorySnap.docs.map(doc => doc.data().name).filter(Boolean);
        const categoriesData = ["All", ...(adminCategories.length > 0 ? adminCategories : siteContent.categories.map(category => category.title))];
        setCategories(categoriesData);

        if (auth.currentUser) {
          const wishSnap = await getDocs(query(collection(db, 'wishlist'), where('userId', '==', auth.currentUser.uid)));
          setWishlist(wishSnap.docs.map(doc => doc.data().productId));
        } else {
          setWishlist(getDemoWishlist());
        }
      } catch (err) {
        console.error(err);
        setLoadError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const category = searchParams.get('category');
    const query = searchParams.get('query');
    if (category) setActiveCategory(category);
    if (query) setSearchQuery(query);
  }, [searchParams]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem('maridadi.compareIds', JSON.stringify(compareIds));
  }, [compareIds]);

  useEffect(() => {
    if (selectedProduct) {
      fetchReviews(selectedProduct.id);
    }
  }, [selectedProduct]);

  const getProductLocation = (product: any) => product.location || product.sellerLocation || 'Nairobi, Kenya';
  const getSellerName = (product: any) => product.sellerName || product.seller || 'Maridadi Creations';
  const getAvailability = (product: any) => {
    const stock = Number(product.stockQuantity ?? 8);
    if (stock <= 0) return 'Made to order';
    if (stock <= 3) return `${stock} left`;
    return 'Available';
  };

  const getServiceTitle = (product: any) => {
    const name = product.name || 'Custom project';
    if (name.toLowerCase().startsWith('custom')) return `${name} — designed for you`;
    return `Custom ${name} — designed for you`;
  };

  const prefersStructuredCategory = (category: string) => /business|banner|vehicle|branding/i.test(category);

  const handleCustomizeProduct = (product: any) => {
    trackEvent({
      eventType: 'intent',
      productId: product.id,
      metadata: { source: 'explore-inline-customize', category: product.category }
    }).catch(() => undefined);
    handleProductClick(product);
    setCustomizationNotes(`I want to customize ${product.name || 'this item'} for my style, size, colors, wording, and finish.`);
  };

  const priceMatches = (product: any) => {
    const price = Number(product.price || 0);
    return price >= priceRange.min && price <= priceRange.max;
  };

  const catalogMaxPrice = Math.max(DEFAULT_MAX_PRICE, ...products.map(product => Number(product.price || 0)));

  const textMatches = (product: any) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    return [product.name, product.category, product.description, ...(Array.isArray(product.tags) ? product.tags : [])]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
      .includes(q);
  };

  const getValueScore = (product: any) => {
    const rating = Number(product.rating || 0);
    const price = Math.max(Number(product.price || 1), 1);
    return rating / price;
  };

  const getQualityScore = (product: any) => {
    const rating = Number(product.rating || 0);
    const stock = Number(product.stockQuantity ?? 8);
    return rating + (stock > 0 ? 0.1 : 0);
  };

  const filteredProducts = products.filter(product => {
    const categoryMatch = activeCategory === "All" || product.category === activeCategory;
    return categoryMatch && priceMatches(product) && textMatches(product);
  }).slice().sort((a, b) => {
    if (sortMode === 'Price low') return Number(a.price || 0) - Number(b.price || 0);
    if (sortMode === 'Price high') return Number(b.price || 0) - Number(a.price || 0);
    if (sortMode === 'Popular') return Number(b.rating || 0) - Number(a.rating || 0);
    const scoreDelta = getProductPreferenceScore(b, preferences) - getProductPreferenceScore(a, preferences);
    return scoreDelta || Number(b.rating || 0) - Number(a.rating || 0);
  });

  const comparedProducts = compareIds
    .map(id => products.find(product => product.id === id))
    .filter(Boolean);

  const bestValueProduct = comparedProducts.length > 0
    ? comparedProducts.slice().sort((a: any, b: any) => getValueScore(b) - getValueScore(a))[0]
    : null;

  const bestQualityProduct = comparedProducts.length > 0
    ? comparedProducts.slice().sort((a: any, b: any) => getQualityScore(b) - getQualityScore(a))[0]
    : null;

  const handleProductClick = (product: any) => {
    setSelectedProduct(product);
    setQuantity(1);
    setDeliveryAddress("");
    setCustomizationNotes("");
    setIsZoomed(false);
    setSelectedColor(product.variations?.[0]?.name || null);
    trackEvent({ eventType: 'view', productId: product.id, metadata: { category: product.category } }).catch(() => undefined);
  };

  const getMasonrySpan = (index: number) => {
    const estimatedImageHeight = [220, 280, 190, 250, 320, 210][index % 6];
    const estimatedContentHeight = 88;
    return Math.ceil((estimatedImageHeight + estimatedContentHeight) / 8);
  };

  const similarProducts = selectedProduct
    ? products
        .filter(product => product.id !== selectedProduct.id && (product.category === selectedProduct.category || getProductPreferenceScore(product, preferences) > 0))
        .sort((a, b) => getProductPreferenceScore(b, preferences) - getProductPreferenceScore(a, preferences))
        .slice(0, 3)
    : [];

  const handleToggleCompare = (e: React.MouseEvent, product: any) => {
    e.stopPropagation();
    const exists = compareIds.includes(product.id);
    const next = exists ? compareIds.filter(id => id !== product.id) : [...compareIds, product.id].slice(-4);
    setCompareIds(next);
    if (exists && next.length < 2) setIsCompareOpen(false);
    trackEvent({
      eventType: 'compare',
      productId: product.id,
      metadata: { action: exists ? 'remove' : 'add', category: product.category }
    }).catch(() => undefined);
  };

  const fetchReviews = async (productId: string) => {
    setLoadingReviews(true);
    try {
      const snap = await getDocs(query(collection(db, `products/${productId}/reviews`), orderBy('createdAt', 'desc')));
      setReviews(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingReviews(false);
    }
  };

  const handleToggleWishlist = async (e: React.MouseEvent, product: any) => {
    e.stopPropagation();
    const isWishlisted = wishlist.includes(product.id);
    try {
      await assertProductExists(product.id);
      if (!auth.currentUser) {
        const next = isWishlisted ? wishlist.filter(id => id !== product.id) : [...wishlist, product.id];
        setWishlist(next);
        saveDemoWishlist(next);
        toast.success(isWishlisted ? "Removed from saved ideas." : "Saved for later.");
        return;
      }
      if (isWishlisted) {
        const wishSnap = await getDocs(query(collection(db, 'wishlist'), where('userId', '==', auth.currentUser.uid), where('productId', '==', product.id)));
        wishSnap.forEach(async (d) => await deleteDoc(doc(db, 'wishlist', d.id)));
        setWishlist(prev => prev.filter(id => id !== product.id));
        toast.success("Removed from saved ideas.");
      } else {
        await addDoc(collection(db, 'wishlist'), {
          userId: auth.currentUser.uid,
          productId: product.id,
          productName: product.name,
          price: product.price,
          image: product.image,
          createdAt: serverTimestamp()
        });
        setWishlist(prev => [...prev, product.id]);
        toast.success("Saved for later.");
      }
      trackEvent({
        eventType: 'wishlist',
        productId: product.id,
        metadata: { action: isWishlisted ? 'remove' : 'add', category: product.category }
      }).catch(() => undefined);
    } catch (err) {
      toast.error("Something went wrong. Please try again.");
    }
  };

  const handleSubmitReview = async () => {
    if (!selectedProduct) return;
    if (!newReview.comment.trim()) {
      toast.error("Please add a comment");
      return;
    }

    if (!auth.currentUser) {
      const reviewData = {
        id: `demo-review-${Date.now()}`,
        userId: DEMO_USER_ID,
        userName: 'Demo client',
        userPhoto: '',
        rating: newReview.rating,
        comment: newReview.comment,
        createdAt: new Date()
      };
      setReviews([reviewData, ...reviews]);
      setNewReview({ rating: 5, comment: '' });
      toast.success("Review added in demo mode.");
      return;
    }

    try {
      const reviewData = {
        userId: auth.currentUser.uid,
        userName: auth.currentUser.displayName || 'Anonymous',
        userPhoto: auth.currentUser.photoURL || '',
        rating: newReview.rating,
        comment: newReview.comment,
        createdAt: serverTimestamp()
      };
      await addDoc(collection(db, `products/${selectedProduct.id}/reviews`), reviewData);
      setReviews([reviewData, ...reviews]);
      setNewReview({ rating: 5, comment: '' });
      toast.success("Review submitted!");
    } catch (err) {
      toast.error("Failed to submit review");
    }
  };

  const handleAddToCart = async (product: any) => {
    if (!customizationNotes.trim()) {
      toast.error("Please add your customization details");
      return;
    }
    if (!deliveryAddress.trim()) {
      toast.error("Please provide pickup or delivery details");
      return;
    }

    const currentVariation = product.variations?.find((v: any) => v.name === selectedColor);
    const finalPrice = currentVariation?.price || product.price;

    try {
      await assertProductExists(product.id);
      if (!auth.currentUser) {
        addDemoCartItem({
          productId: product.id,
          productName: product.name,
          price: Number(finalPrice),
          image: currentVariation?.image || product.image,
          quantity,
          deliveryAddress,
          customNotes: customizationNotes.trim(),
          variationName: selectedColor,
          createdAt: new Date().toISOString()
        });
        toast.success(`${product.name} customized and added to cart.`);
        setQuantity(1);
        setDeliveryAddress("");
        setCustomizationNotes("");
        setSelectedProduct(null);
        return;
      }
      await addDoc(collection(db, 'cart'), {
        userId: auth.currentUser.uid,
        productId: product.id,
        productName: product.name,
        price: Number(finalPrice),
        image: currentVariation?.image || product.image,
        quantity,
        deliveryAddress,
        customNotes: customizationNotes.trim(),
        variationName: selectedColor,
        createdAt: serverTimestamp()
      });
      trackEvent({
        eventType: 'cart',
        productId: product.id,
        metadata: { quantity, variationName: selectedColor, category: product.category, customized: true }
      }).catch(() => undefined);
      toast.success(`${product.name} customized and added to cart.`);
      setQuantity(1);
      setDeliveryAddress("");
      setCustomizationNotes("");
      setSelectedProduct(null);
    } catch (error) {
      console.error(error);
      toast.error("Failed to add to cart");
    }
  };

  const handleOrder = async (product: typeof products[0]) => {
    try {
      await assertProductExists(product.id);
      if (!auth.currentUser) {
        addDemoCartItem({
          productId: product.id,
          productName: product.name,
          price: Number(product.price || 0),
          image: product.image,
          quantity: 1,
          deliveryAddress: 'Delivery details to be confirmed',
          createdAt: new Date().toISOString()
        });
        toast.success("Added to your demo order.");
        setSelectedProduct(null);
        return;
      }
      await addDoc(collection(db, 'purchaseRequests'), {
        userId: auth.currentUser.uid,
        type: product.category.toLowerCase().includes('furniture') ? 'furniture' : (product.category.toLowerCase().includes('jewelry') ? 'jewelry' : 'print'),
        details: {
          productId: product.id,
          productName: product.name,
          price: product.price
        },
        status: "requested",
        totalAmount: product.price,
        createdAt: serverTimestamp()
      });
      trackEvent({
        eventType: 'intent',
        productId: product.id,
        metadata: { source: 'shop-request', category: product.category, price: product.price }
      }).catch(() => undefined);
      toast.success("Added to your requests. We will confirm your design before processing.");
      setSelectedProduct(null);
    } catch (error) {
      console.error(error);
      toast.error("Order failed. Please try again.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-3 py-8 sm:px-4 md:py-16">
      <div className="mb-6 flex flex-col gap-4 md:mb-8 md:flex-row md:items-end md:justify-between">
        <div className="max-w-3xl">
          <div className="mb-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.24em] text-brand-primary">
            <SlidersHorizontal size={14} /> Explore
          </div>
          <h1 className="mb-3 text-4xl leading-none md:mb-4 md:text-7xl">{content.exploreTitle}</h1>
          <p className="max-w-2xl text-stone-500">{content.exploreSubtitle}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {(['inspiration', 'browse'] as const).map(mode => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`inline-flex min-h-11 items-center gap-2 rounded-full px-5 text-[10px] font-black uppercase tracking-widest transition-colors ${viewMode === mode ? 'bg-stone-900 text-white' : 'border border-stone-200 text-stone-600 hover:border-brand-primary hover:text-brand-primary'}`}
            >
              {mode === 'inspiration' ? 'Inspiration' : 'Browse'}
            </button>
          ))}
          <Link to="/analyzer" className="inline-flex min-h-11 items-center gap-2 rounded-full border border-stone-200 px-5 text-[10px] font-black uppercase tracking-widest text-stone-600 hover:border-brand-primary hover:text-brand-primary">
            Start customizing <Sparkles size={14} />
          </Link>
        </div>
      </div>

      <div className="sticky top-16 z-40 mb-8 rounded-[24px] border border-stone-100 bg-brand-cream/95 p-2 backdrop-blur-xl shadow-sm md:top-20 md:mb-12 md:rounded-[28px] md:p-3">
        <div className={`grid grid-cols-1 gap-3 xl:items-center ${viewMode === 'browse' ? 'xl:grid-cols-[1fr_auto_minmax(220px,320px)_auto]' : 'xl:grid-cols-[1fr_auto_auto]'}`}>
          <div className="flex min-h-12 items-center gap-3 rounded-2xl bg-white px-4">
            <Search size={18} className="text-stone-400" />
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search banners, portraits, stickers, mounts..."
              className="w-full bg-transparent text-sm font-semibold outline-none placeholder:text-stone-400"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => {
                  setActiveCategory(cat);
                  if (prefersStructuredCategory(cat)) setViewMode('browse');
                }}
                className={`min-h-12 whitespace-nowrap rounded-2xl px-4 text-[10px] font-black uppercase tracking-widest transition-all ${activeCategory === cat ? 'bg-brand-primary text-brand-cream shadow-lg shadow-brand-primary/20' : 'bg-white text-stone-500 hover:text-brand-primary'}`}
              >
                {cat}
              </button>
            ))}
          </div>

          {viewMode === 'browse' ? (
            <>
              <div className="rounded-2xl bg-white px-4 py-3">
                <div className="mb-2 flex items-center justify-between gap-3 text-[10px] font-black uppercase tracking-widest text-stone-400">
                  <span>Starting price</span>
                  <span>KSH {priceRange.min} - {priceRange.max}</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="range"
                    min="0"
                    max={catalogMaxPrice}
                    step="500"
                    value={priceRange.min}
                    onChange={(event) => setPriceRange(prev => ({ ...prev, min: Math.min(Number(event.target.value), prev.max) }))}
                    className="accent-brand-primary"
                  />
                  <input
                    type="range"
                    min="0"
                    max={catalogMaxPrice}
                    step="500"
                    value={priceRange.max}
                    onChange={(event) => setPriceRange(prev => ({ ...prev, max: Math.max(Number(event.target.value), prev.min) }))}
                    className="accent-brand-primary"
                  />
                </div>
              </div>

              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {['Recommended', 'Popular', 'Price low', 'Price high'].map(mode => (
                  <button
                    key={mode}
                    onClick={() => setSortMode(mode)}
                    className={`min-h-12 whitespace-nowrap rounded-2xl px-4 text-[10px] font-black uppercase tracking-widest transition-all ${sortMode === mode ? 'bg-white text-brand-primary shadow-sm' : 'bg-white/60 text-stone-500 hover:text-brand-primary'}`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div className="flex min-h-12 items-center rounded-2xl bg-white/60 px-4 text-[10px] font-black uppercase tracking-widest text-stone-500">
              Visual discovery first. Tap View to decide.
            </div>
          )}
        </div>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2 px-1 text-[9px] font-black uppercase tracking-widest text-stone-400 md:mt-3 md:text-[10px]">
          <span>{filteredProducts.length} option{filteredProducts.length === 1 ? '' : 's'} in {activeCategory} · {viewMode === 'browse' ? `sorted by ${sortMode}` : 'inspiration mode'}</span>
          <span className="inline-flex items-center gap-2"><MapPin size={13} /> Custom work coordinated from Nairobi</span>
        </div>
      </div>

      {(preferences.styles.length > 0 || preferences.colors.length > 0 || preferences.layouts.length > 0) && (
        <div className="mb-8 flex gap-2 overflow-x-auto border-y border-brand-primary/10 py-3 scrollbar-hide md:mb-10 md:flex-wrap md:gap-3 md:py-4">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-primary">Personalized for you</span>
          {[...preferences.styles, ...preferences.colors, ...preferences.layouts].slice(0, 6).map(term => (
            <span key={term} className="rounded-full bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-stone-500 border border-stone-100">
              {term}
            </span>
          ))}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-2 gap-[10px] md:grid-cols-3 md:gap-[14px] xl:grid-cols-4 xl:gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(item => (
            <div key={item} className="animate-pulse rounded-2xl bg-white p-2">
              <div className={`${item % 3 === 0 ? 'aspect-[3/4]' : item % 2 === 0 ? 'aspect-square' : 'aspect-[4/5]'} rounded-xl bg-stone-100`} />
              <div className="mt-3 h-4 w-2/3 rounded bg-stone-100" />
              <div className="mt-2 h-3 w-1/2 rounded bg-stone-100" />
            </div>
          ))}
        </div>
      ) : loadError ? (
        <div className="rounded-[36px] border border-stone-100 bg-white p-12 text-center">
          <Package size={42} className="mx-auto mb-4 text-stone-300" />
          <h2 className="text-2xl font-serif">Something went wrong.</h2>
          <p className="mt-2 text-stone-400">Something went wrong. Please try again.</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="rounded-[36px] border border-stone-100 bg-white p-12 text-center">
          <Search size={42} className="mx-auto mb-4 text-stone-300" />
          <h2 className="text-2xl font-serif">Nothing here yet.</h2>
          <p className="mt-2 text-stone-400">Nothing here yet — start by exploring designs.</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setActiveCategory('All');
              setPriceRange({ min: 0, max: catalogMaxPrice });
            }}
            className="mt-6 rounded-full bg-brand-primary px-6 py-3 text-[10px] font-black uppercase tracking-widest text-brand-cream"
          >
            Reset filters
          </button>
        </div>
      ) : viewMode === 'inspiration' ? (
        <div
          className="grid grid-cols-2 gap-[10px] [grid-auto-rows:8px] md:grid-cols-3 md:gap-[14px] xl:grid-cols-4 xl:gap-4"
        >
          {filteredProducts.map((product, idx) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(idx * 0.04, 0.35) }}
              className="group overflow-hidden rounded-2xl bg-white shadow-sm md:rounded-[20px]"
              style={{ gridRowEnd: `span ${getMasonrySpan(idx)}` }}
            >
              <button
                onClick={() => handleProductClick(product)}
                className="block w-full text-left"
              >
                <div className={`relative overflow-hidden rounded-xl bg-stone-100 ${idx % 5 === 0 ? 'aspect-[3/4]' : idx % 3 === 0 ? 'aspect-[4/5]' : idx % 2 === 0 ? 'aspect-square' : 'aspect-[4/3]'}`}>
                  {!loadedImages[product.id] && (
                    <div className="absolute inset-0 animate-pulse bg-stone-200 blur-sm" />
                  )}
                  <img
                    src={product.image}
                    alt={product.name}
                    loading="lazy"
                    onLoad={() => setLoadedImages(prev => ({ ...prev, [product.id]: true }))}
                    className={`h-full w-full object-cover transition-all duration-500 group-hover:scale-105 ${loadedImages[product.id] ? 'opacity-100 blur-0' : 'opacity-0 blur-md'}`}
                    referrerPolicy="no-referrer"
                  />
                  <span className="absolute left-2 top-2 inline-flex rounded-full bg-white/80 px-2.5 py-1 text-[8px] font-black uppercase tracking-widest text-stone-700 backdrop-blur md:left-3 md:top-3">
                      {getProductInsightLabels(product, preferences, idx)[0] || 'Popular'}
                  </span>
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent p-3 opacity-100 md:p-4">
                    <h3 className="line-clamp-2 text-sm font-bold leading-tight text-white md:text-base">{product.name}</h3>
                    <p className="mt-1 text-[9px] font-black uppercase tracking-widest text-white/70">{product.category || 'Custom'}</p>
                  </div>
                </div>
              </button>
              <div className="grid grid-cols-2 gap-2 p-2 md:p-3">
                  <button
                    onClick={(event) => handleToggleWishlist(event, product)}
                    className={`min-h-9 rounded-xl px-2 text-[9px] font-black uppercase tracking-widest ${wishlist.includes(product.id) ? 'bg-brand-primary text-brand-cream' : 'bg-stone-50 text-stone-500 hover:text-brand-primary'}`}
                  >
                    {wishlist.includes(product.id) ? 'Saved' : 'Save'}
                  </button>
                  <button
                    onClick={() => handleProductClick(product)}
                    className="min-h-9 rounded-xl bg-stone-900 px-2 text-[9px] font-black uppercase tracking-widest text-white"
                  >
                    View
                  </button>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
          {filteredProducts.map((product, idx) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="group cursor-pointer rounded-[28px] bg-white p-4 shadow-sm transition-transform hover:-translate-y-1 md:rounded-[32px]"
              onClick={() => handleProductClick(product)}
            >
              <div className="relative mb-5 aspect-[4/5] overflow-hidden rounded-[24px] bg-stone-100 md:rounded-[28px]">
                <motion.img 
                  src={product.image} 
                  alt={product.name} 
                  loading="lazy"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.45 }}
                  className="h-full w-full origin-center object-cover"
                  referrerPolicy="no-referrer"
                />
                <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-stone-700 shadow-sm backdrop-blur">
                  {getProductInsightLabels(product, preferences, idx)[0] || 'Popular'}
                </span>
              </div>

              <div className="px-1 pb-1">
                <h3 className="text-xl font-bold text-stone-900">{getServiceTitle(product)}</h3>
                <p className="mt-2 text-sm text-stone-500">Designed and printed for you</p>
                <div className="mt-3 flex items-center justify-between gap-3 text-xs text-stone-400">
                  <span className="font-bold uppercase tracking-widest">{product.category}</span>
                  <span className="font-bold text-brand-primary">From KSH {product.price}</span>
                </div>
                <div className="mt-5 grid grid-cols-2 gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleCustomizeProduct(product); }}
                    className="inline-flex min-h-11 items-center justify-center rounded-2xl bg-brand-primary px-4 text-[10px] font-black uppercase tracking-widest text-brand-cream"
                  >
                    Customize
                  </button>
                  <button
                    onClick={(e) => handleToggleCompare(e, product)}
                    className={`inline-flex min-h-11 items-center justify-center rounded-2xl border px-4 text-[10px] font-black uppercase tracking-widest transition-colors ${compareIds.includes(product.id) ? 'border-brand-primary bg-brand-primary/5 text-brand-primary' : 'border-stone-200 text-stone-600 hover:border-brand-primary hover:text-brand-primary'}`}
                  >
                    {compareIds.includes(product.id) ? 'Compared' : 'Compare'}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {isCompareOpen && comparedProducts.length >= 2 && (
          <div className="fixed inset-0 z-[85] flex items-end justify-center p-2 md:items-center md:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCompareOpen(false)}
              className="absolute inset-0 bg-stone-950/50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, y: 28, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 28, scale: 0.98 }}
              className="relative z-10 max-h-[86svh] w-full max-w-6xl overflow-hidden rounded-t-[32px] bg-white shadow-2xl md:max-h-[88vh] md:rounded-[36px]"
            >
              <div className="flex items-start justify-between gap-4 border-b border-stone-100 p-4 md:gap-6 md:p-6">
                <div>
                  <div className="mb-2 text-[10px] font-black uppercase tracking-[0.24em] text-brand-primary">Compare options</div>
                  <h2 className="text-2xl font-serif md:text-3xl">Compare starting points.</h2>
                  <p className="mt-2 max-w-2xl text-sm text-stone-500">Side-by-side starting price, rating, availability, and fit cues before you request a custom version.</p>
                </div>
                <button
                  onClick={() => setIsCompareOpen(false)}
                  className="rounded-full bg-stone-50 p-3 text-stone-400 hover:text-brand-primary"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="grid gap-3 border-b border-stone-100 p-4 md:grid-cols-2 md:gap-4 md:p-6">
                {bestValueProduct && (
                  <div className="rounded-3xl bg-brand-primary/5 p-5">
                    <div className="text-[10px] font-black uppercase tracking-widest text-brand-primary">Best for value</div>
                    <div className="mt-2 flex items-center gap-3">
                      <img src={(bestValueProduct as any).image} alt={(bestValueProduct as any).name} className="h-14 w-14 rounded-2xl object-cover" referrerPolicy="no-referrer" />
                      <div>
                        <div className="font-bold text-stone-900">{(bestValueProduct as any).name}</div>
                        <div className="text-xs text-stone-500">Strong rating for the price.</div>
                      </div>
                    </div>
                  </div>
                )}
                {bestQualityProduct && (
                  <div className="rounded-3xl bg-stone-50 p-5">
                    <div className="text-[10px] font-black uppercase tracking-widest text-stone-500">Best for quality</div>
                    <div className="mt-2 flex items-center gap-3">
                      <img src={(bestQualityProduct as any).image} alt={(bestQualityProduct as any).name} className="h-14 w-14 rounded-2xl object-cover" referrerPolicy="no-referrer" />
                      <div>
                        <div className="font-bold text-stone-900">{(bestQualityProduct as any).name}</div>
                        <div className="text-xs text-stone-500">Highest rating with strong availability.</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="overflow-auto p-4 md:p-6">
                <div className="min-w-[760px]">
                  <div className="grid gap-3" style={{ gridTemplateColumns: `160px repeat(${comparedProducts.length}, minmax(150px, 1fr))` }}>
                    <div />
                    {comparedProducts.map((product: any) => (
                      <div key={product.id} className="rounded-3xl bg-stone-50 p-3">
                        <img src={product.image} alt={product.name} className="mb-3 h-28 w-full rounded-2xl object-cover" referrerPolicy="no-referrer" />
                        <div className="line-clamp-2 min-h-10 font-bold text-stone-900">{product.name}</div>
                        <button
                          onClick={() => {
                            setIsCompareOpen(false);
                            handleProductClick(product);
                          }}
                          className="mt-3 text-[10px] font-black uppercase tracking-widest text-brand-primary"
                        >
                          View details
                        </button>
                      </div>
                    ))}

                    {[
                      ['Price', (product: any) => `KSH ${product.price}`],
                      ['Rating', (product: any) => `${product.rating || 'New'} / 5`],
                      ['Category', (product: any) => product.category || 'Service'],
                      ['Availability', (product: any) => getAvailability(product)],
                      ['Seller', (product: any) => getSellerName(product)],
                      ['Location', (product: any) => getProductLocation(product)],
                      ['Key difference', (product: any, index: number) => getProductInsightLabels(product, preferences, index)[0]],
                    ].map(([label, resolver]) => (
                      <Fragment key={label as string}>
                        <div key={`${label}-label`} className="rounded-2xl bg-stone-900 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-white">
                          {label as string}
                        </div>
                        {comparedProducts.map((product: any, index) => (
                          <div key={`${product.id}-${label}`} className="rounded-2xl border border-stone-100 px-4 py-3 text-sm font-semibold text-stone-700">
                            {(resolver as (product: any, index: number) => string)(product, index)}
                          </div>
                        ))}
                      </Fragment>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {comparedProducts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
          className="fixed bottom-[calc(5.75rem+env(safe-area-inset-bottom))] left-1/2 z-[70] w-[calc(100%-1rem)] max-w-4xl -translate-x-1/2 rounded-3xl bg-stone-900 text-white shadow-2xl lg:bottom-6 lg:left-auto lg:right-6 lg:w-80 lg:translate-x-0"
          >
            <div className="flex flex-col gap-3 p-3 md:flex-row md:items-center md:justify-between md:p-4">
              <div>
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Comparison set</div>
                <div className="mt-1 text-sm font-bold">Compare ({comparedProducts.length}) service idea{comparedProducts.length === 1 ? '' : 's'} selected</div>
              </div>
              <div className="flex min-w-0 flex-1 gap-2 overflow-x-auto scrollbar-hide md:justify-end md:gap-3 lg:hidden">
                {comparedProducts.map((product: any) => (
                  <button
                    key={product.id}
                    onClick={(e) => handleToggleCompare(e, product)}
                    className="flex min-w-[150px] items-center gap-3 rounded-2xl bg-white/10 p-2 text-left hover:bg-white/15 md:min-w-[180px]"
                  >
                    <img src={product.image} alt={product.name} className="h-12 w-12 rounded-xl object-cover" referrerPolicy="no-referrer" />
                    <div className="min-w-0">
                      <div className="truncate text-xs font-bold">{product.name}</div>
                      <div className="text-[10px] font-black uppercase tracking-widest text-white/40">KSH {product.price}</div>
                    </div>
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                {comparedProducts.length >= 2 && (
                  <button
                    onClick={() => setIsCompareOpen(true)}
                    className="rounded-2xl bg-brand-primary px-5 py-3 text-[10px] font-black uppercase tracking-widest text-brand-cream"
                  >
                    Compare now
                  </button>
                )}
                <button
                  onClick={() => setCompareIds([])}
                  className="rounded-2xl bg-white px-5 py-3 text-[10px] font-black uppercase tracking-widest text-stone-900"
                >
                  Clear
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Product Detail Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <div className="fixed inset-0 z-[60] flex items-end justify-center p-0 md:items-stretch md:justify-end md:p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProduct(null)}
              className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, y: 28, x: 0 }}
              animate={{ opacity: 1, y: 0, x: 0 }}
              exit={{ opacity: 0, y: 28, x: 0 }}
              className="relative z-10 flex max-h-[92svh] w-full flex-col overflow-hidden rounded-t-[32px] bg-brand-cream shadow-2xl md:h-full md:max-h-none md:max-w-xl md:rounded-[32px]"
            >
              <div className="h-[34svh] overflow-hidden relative cursor-zoom-in group/image bg-stone-100 md:h-72 md:w-full" onClick={() => setIsZoomed(!isZoomed)}>
                <motion.img 
                  key={selectedColor}
                  initial={{ opacity: 0.8, scale: 1.1 }}
                  animate={{ opacity: 1, scale: isZoomed ? 1.8 : 1 }}
                  src={selectedProduct.variations?.find((v: any) => v.name === selectedColor)?.image || selectedProduct.image} 
                  alt={selectedProduct.name} 
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  className="w-full h-full object-cover origin-center"
                  referrerPolicy="no-referrer" 
                />
                <div className={`absolute inset-0 bg-black/10 backdrop-blur-[2px] pointer-events-none transition-opacity duration-300 ${isZoomed ? 'opacity-100' : 'opacity-0'}`} />
                {isZoomed && (
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none px-4 py-2 bg-brand-primary/20 backdrop-blur-md rounded-full text-white text-[10px] font-bold uppercase tracking-[0.3em] border border-white/20">
                    Zoom Active
                  </div>
                )}
                
                {/* Variant indicator dots */}
                {selectedProduct.variations?.length > 1 && (
                  <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-1.5 z-10">
                    {selectedProduct.variations.map((v: any) => (
                      <div 
                        key={v.name}
                        className={`h-0.5 rounded-full transition-all duration-500 ${selectedColor === v.name ? 'w-6 bg-brand-primary' : 'w-2 bg-white/50'}`}
                      />
                    ))}
                  </div>
                )}
              </div>
              <div className="relative flex flex-1 flex-col overflow-y-auto scroll-smooth p-5 custom-scrollbar md:p-8">
                <button 
                  onClick={() => setSelectedProduct(null)}
                  className="sticky top-0 ml-auto p-3 text-stone-300 hover:text-brand-primary hover:bg-stone-50 rounded-full transition-all z-20 bg-white/80 backdrop-blur-md shadow-sm mb-4"
                >
                  <Plus className="rotate-45" size={24} />
                </button>

                <div className="flex items-center gap-2 text-brand-primary font-bold uppercase tracking-[0.2em] text-[10px] mb-4">
                  <Package size={12} /> Custom service
                </div>
                
                <h2 className="mb-5 text-3xl font-serif leading-tight md:mb-6 md:text-5xl">{getServiceTitle(selectedProduct)}</h2>
                
                <div className="mb-6 flex items-center gap-5 border-b border-stone-100 pb-6 md:mb-8 md:gap-6 md:pb-8">
                  <div>
                    <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest block mb-1">Starts from</span>
                    <span className="text-2xl font-bold text-brand-primary font-mono md:text-3xl">
                      KSH {selectedProduct.variations?.find((v: any) => v.name === selectedColor)?.price || selectedProduct.price}
                    </span>
                  </div>
                  <div className="h-10 w-px bg-stone-100" />
                  <div>
                    <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest block mb-1">Rating</span>
                    <div className="flex items-center gap-2">
                      <Star size={18} fill="#f59e0b" className="text-amber-500" />
                      <span className="text-xl font-bold text-stone-900">{selectedProduct.rating}</span>
                      <span className="text-xs text-stone-400">({reviews.length})</span>
                    </div>
                  </div>
                </div>

                <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3 md:mb-8">
                  <div className="rounded-2xl bg-white p-4 border border-stone-100">
                    <Store size={18} className="mb-3 text-brand-primary" />
                    <span className="block text-[10px] font-black uppercase tracking-widest text-stone-400">Studio</span>
                    <span className="mt-1 block text-sm font-bold text-stone-800">{getSellerName(selectedProduct)}</span>
                  </div>
                  <div className="rounded-2xl bg-white p-4 border border-stone-100">
                    <MapPin size={18} className="mb-3 text-brand-primary" />
                    <span className="block text-[10px] font-black uppercase tracking-widest text-stone-400">Location</span>
                    <span className="mt-1 block text-sm font-bold text-stone-800">{getProductLocation(selectedProduct)}</span>
                  </div>
                  <div className="rounded-2xl bg-white p-4 border border-stone-100">
                    <ShieldCheck size={18} className="mb-3 text-brand-primary" />
                    <span className="block text-[10px] font-black uppercase tracking-widest text-stone-400">Production</span>
                    <span className="mt-1 block text-sm font-bold text-stone-800">{getAvailability(selectedProduct)}</span>
                  </div>
                </div>

                {/* Color Variations Swatches */}
                {selectedProduct.variations && selectedProduct.variations.length > 0 && (
                  <div className="mb-8">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-3 block">Available Variations</span>
                    <div className="flex flex-wrap gap-4">
                      {selectedProduct.variations.map((v: any, i: number) => (
                        <button 
                          key={i}
                          onClick={() => setSelectedColor(v.name)}
                          className={`group relative flex flex-col items-center gap-2 transition-all ${selectedColor === v.name ? 'scale-110' : 'opacity-60 hover:opacity-100'}`}
                        >
                          <div className={`w-14 h-14 rounded-2xl border-2 p-0.5 overflow-hidden transition-all ${selectedColor === v.name ? 'border-brand-primary' : 'border-stone-100'}`}>
                            <img src={v.image} className="w-full h-full object-cover rounded-xl" />
                          </div>
                          <span className={`text-[8px] font-black uppercase tracking-tighter transition-colors ${selectedColor === v.name ? 'text-brand-primary' : 'text-stone-400'}`}>
                            {v.name}
                          </span>
                          {selectedColor === v.name && (
                            <motion.div layoutId="variation-indicator" className="absolute -top-1 -right-1 w-4 h-4 bg-brand-primary rounded-full flex items-center justify-center text-white border-2 border-brand-cream">
                              <Check size={8} className="stroke-[4px]" />
                            </motion.div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <p className="text-stone-600 mb-8 leading-relaxed">
                  {selectedProduct.description}
                </p>

                <div className="mb-8 grid grid-cols-1 gap-3">
                  {getProductInsightLabels(selectedProduct, preferences, 0).map(label => (
                    <div key={label} className="flex items-center gap-3 rounded-2xl border border-stone-100 bg-white p-4 text-sm font-bold text-stone-700">
                      <Info size={16} className="text-brand-primary" />
                      {label}
                    </div>
                  ))}
                </div>

                {similarProducts.length > 0 && (
                  <div className="mb-8 border-y border-stone-100 py-6">
                    <div className="mb-4 flex items-center justify-between gap-4">
                      <h3 className="text-lg font-bold">Compare with similar</h3>
                      <span className="text-[10px] font-black uppercase tracking-widest text-stone-400">People also viewed</span>
                    </div>
                    <div className="grid gap-3">
                      {similarProducts.map(product => (
                        <button
                          key={product.id}
                          onClick={() => {
                            setSelectedProduct(product);
                            setSelectedColor(product.variations?.[0]?.name || null);
                            setQuantity(1);
                            setDeliveryAddress('');
                            setCustomizationNotes('');
                          }}
                          className="flex items-center gap-3 rounded-2xl bg-white p-3 text-left hover:bg-stone-50"
                        >
                          <img src={product.image} alt={product.name} className="h-14 w-14 rounded-xl object-cover" referrerPolicy="no-referrer" />
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-sm font-bold">{product.name}</div>
                            <div className="text-[10px] font-black uppercase tracking-widest text-stone-400">KSH {product.price} · {getAvailability(product)}</div>
                          </div>
                          <ArrowRight size={14} className="text-stone-300" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Custom Options: Quantity, item notes, and delivery */}
                <div className="space-y-6 mb-8">
                  <div>
                    <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-stone-400">Customize this order</label>
                    <textarea
                      data-customization-notes
                      value={customizationNotes}
                      onChange={(e) => setCustomizationNotes(e.target.value)}
                      placeholder="Colors, size, wording, finish, occasion, logo placement, or anything you want changed..."
                      className="min-h-[120px] w-full rounded-2xl border border-stone-100 bg-stone-50 p-4 text-sm focus:outline-brand-primary"
                    />
                  </div>

                  <div className="flex items-center justify-between bg-stone-50 p-4 rounded-2xl border border-stone-100">
                    <span className="text-xs font-bold uppercase tracking-widest text-stone-400">Quantity</span>
                    <div className="flex items-center gap-4">
                      <button 
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-8 h-8 rounded-lg bg-white border border-stone-200 flex items-center justify-center text-stone-600"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="font-bold w-4 text-center">{quantity}</span>
                      <button 
                        onClick={() => setQuantity(quantity + 1)}
                        className="w-8 h-8 rounded-lg bg-white border border-stone-200 flex items-center justify-center text-stone-600"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-2">Pickup or delivery details</label>
                    <textarea 
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      placeholder="Delivery address, pickup preference, phone note, or location details..."
                      className="w-full bg-stone-50 border border-stone-100 rounded-2xl p-4 text-sm focus:outline-brand-primary min-h-[80px]"
                    />
                  </div>

                  <button
                    onClick={() => handleAddToCart(selectedProduct)}
                    className="flex w-full items-center justify-center gap-3 rounded-2xl bg-brand-primary py-4 text-base font-bold text-brand-cream shadow-xl shadow-brand-primary/20 transition-transform hover:scale-[1.02] md:py-5 md:text-lg"
                  >
                    <ShoppingBag size={24} /> Add customized order to cart
                  </button>
                </div>

                {/* Reviews Section */}
                <div className="border-t border-stone-100 pt-8 mb-8">
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                    Reviews <span className="text-xs font-normal text-stone-400">({reviews.length})</span>
                  </h3>
                  
                  <div className="space-y-6 max-h-[300px] overflow-y-auto pr-2 mb-8">
                    {loadingReviews ? (
                      <div className="py-4 animate-pulse space-y-4">
                        {[1,2].map(i => <div key={i} className="h-16 bg-stone-50 rounded-xl" />)}
                      </div>
                    ) : reviews.length === 0 ? (
                      <p className="text-sm text-stone-400 italic">No reviews yet. Be the first to share your experience!</p>
                    ) : reviews.map((review, i) => (
                      <div key={i} className="bg-stone-50 p-4 rounded-2xl">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-brand-primary/10 flex items-center justify-center text-[10px] font-bold">
                              {review.userName[0]}
                            </div>
                            <span className="font-bold text-xs">{review.userName}</span>
                          </div>
                          <div className="flex gap-0.5">
                            {[...Array(5)].map((_, idx) => (
                              <Star key={idx} size={10} fill={idx < review.rating ? "#f59e0b" : "none"} className={idx < review.rating ? "text-amber-500" : "text-stone-300"} />
                            ))}
                          </div>
                        </div>
                        <p className="text-xs text-stone-600">{review.comment}</p>
                      </div>
                    ))}
                  </div>

                  <div className="bg-white border border-stone-100 p-4 rounded-2xl">
                    <div className="flex gap-2 mb-3">
                      {[1,2,3,4,5].map(star => (
                        <button key={star} onClick={() => setNewReview({...newReview, rating: star})}>
                          <Star size={16} fill={star <= newReview.rating ? "#f59e0b" : "none"} className={star <= newReview.rating ? "text-amber-500" : "text-stone-300"} />
                        </button>
                      ))}
                    </div>
                    <textarea 
                      value={newReview.comment}
                      onChange={(e) => setNewReview({...newReview, comment: e.target.value})}
                      placeholder="Write a review..."
                      className="w-full text-xs p-2 focus:outline-none min-h-[60px]"
                    />
                    <button 
                      onClick={handleSubmitReview}
                      className="mt-2 text-[10px] font-bold bg-stone-900 text-white px-4 py-2 rounded-lg uppercase tracking-widest hover:bg-brand-primary transition-colors"
                    >
                      Post Review
                    </button>
                  </div>
                </div>

                <div className="mt-auto space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => document.querySelector<HTMLTextAreaElement>('[data-customization-notes]')?.focus()}
                      className="bg-stone-100 text-stone-900 py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-stone-200 transition-colors"
                    >
                      <Sparkles size={20} /> Edit details
                    </button>
                    <button 
                      onClick={(event) => handleToggleCompare(event, selectedProduct)}
                      className="bg-brand-primary text-brand-cream py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform shadow-lg shadow-brand-primary/20"
                    >
                      <Plus size={20} /> Compare
                    </button>
                  </div>
                  <button onClick={() => handleAddToCart(selectedProduct)} className="w-full border border-stone-200 text-stone-600 py-4 rounded-2xl font-bold hover:bg-stone-50 transition-colors">
                    Save customization for checkout
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
