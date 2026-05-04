import { useState, useEffect } from 'react';
import { ShoppingBag, Star, Plus, MapPin, Package, Heart, Truck, Info, Minus, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'react-hot-toast';
import { db, auth, collection, getDocs, addDoc, serverTimestamp, query, where, orderBy, deleteDoc, doc } from '../lib/firebase';

export default function Shop() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>(["All", "Furniture", "Photography", "Art Mounts", "Jewelry"]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [isZoomed, setIsZoomed] = useState(false);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  
  // Cart state for the current item being added
  const [quantity, setQuantity] = useState(1);
  const [deliveryAddress, setDeliveryAddress] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const productSnap = await getDocs(collection(db, 'products'));
        const productsData = productSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setProducts(productsData);

        const categorySnap = await getDocs(collection(db, 'categories'));
        const categoriesData = ["All", ...categorySnap.docs.map(doc => doc.data().name)];
        setCategories(categoriesData);

        if (auth.currentUser) {
          const wishSnap = await getDocs(query(collection(db, 'wishlist'), where('userId', '==', auth.currentUser.uid)));
          setWishlist(wishSnap.docs.map(doc => doc.data().productId));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedProduct) {
      fetchReviews(selectedProduct.id);
    }
  }, [selectedProduct]);

  const filteredProducts = activeCategory === "All" 
    ? products 
    : products.filter(p => p.category === activeCategory);

  const handleProductClick = (product: any) => {
    setSelectedProduct(product);
    setQuantity(1);
    setDeliveryAddress("");
    setIsZoomed(false);
    setSelectedColor(product.variations?.[0]?.name || null);
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
    if (!auth.currentUser) {
      toast.error("Please sign in to save items");
      return;
    }

    const isWishlisted = wishlist.includes(product.id);
    try {
      if (isWishlisted) {
        const wishSnap = await getDocs(query(collection(db, 'wishlist'), where('userId', '==', auth.currentUser.uid), where('productId', '==', product.id)));
        wishSnap.forEach(async (d) => await deleteDoc(doc(db, 'wishlist', d.id)));
        setWishlist(prev => prev.filter(id => id !== product.id));
        toast.success("Removed from wishlist");
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
        toast.success("Added to wishlist!");
      }
    } catch (err) {
      toast.error("Action failed");
    }
  };

  const handleSubmitReview = async () => {
    if (!auth.currentUser || !selectedProduct) return;
    if (!newReview.comment.trim()) {
      toast.error("Please add a comment");
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
    if (!auth.currentUser) {
      toast.error("Please sign in to use the cart");
      return;
    }

    if (!deliveryAddress.trim()) {
      toast.error("Please provide a delivery address");
      return;
    }

    const currentVariation = product.variations?.find((v: any) => v.name === selectedColor);
    const finalPrice = currentVariation?.price || product.price;

    try {
      await addDoc(collection(db, 'cart'), {
        userId: auth.currentUser.uid,
        productId: product.id,
        productName: product.name,
        price: Number(finalPrice),
        image: currentVariation?.image || product.image,
        quantity,
        deliveryAddress,
        variationName: selectedColor,
        createdAt: serverTimestamp()
      });
      toast.success(`${product.name} added to cart!`);
      setQuantity(1);
      setDeliveryAddress("");
      setSelectedProduct(null);
    } catch (error) {
      console.error(error);
      toast.error("Failed to add to cart");
    }
  };

  const handleOrder = async (product: typeof products[0]) => {
    if (!auth.currentUser) {
      toast.error("Please sign in to place an order");
      return;
    }

    try {
      await addDoc(collection(db, 'orders'), {
        userId: auth.currentUser.uid,
        type: product.category.toLowerCase().includes('furniture') ? 'furniture' : (product.category.toLowerCase().includes('jewelry') ? 'jewelry' : 'print'),
        details: {
          productId: product.id,
          productName: product.name,
          price: product.price
        },
        status: "pending",
        totalAmount: product.price,
        createdAt: serverTimestamp()
      });
      toast.success("Order request sent! We will contact you shortly.");
      setSelectedProduct(null);
    } catch (error) {
      console.error(error);
      toast.error("Order failed. Please try again.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-16">
        <div className="w-full md:w-auto overflow-hidden relative">
          <h1 className="text-5xl md:text-7xl mb-6">Curated <span className="italic font-light">Collection</span></h1>
          <div className="relative">
            <div className="absolute right-0 top-0 bottom-4 w-12 bg-gradient-to-l from-brand-cream to-transparent z-10 pointer-events-none md:hidden" />
            <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide snap-x transition-all">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-8 py-2 rounded-full text-xs font-bold transition-all border whitespace-nowrap snap-start ${activeCategory === cat ? 'bg-brand-primary text-brand-cream border-brand-primary shadow-lg shadow-brand-primary/20' : 'bg-transparent text-stone-500 border-stone-200 hover:border-brand-primary'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 text-stone-400 font-bold uppercase tracking-widest text-xs">
          <MapPin size={16} /> Delivery available worldwide
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-12 h-12 rounded-full border-2 border-brand-primary/10 border-t-brand-primary animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
          {filteredProducts.map((product, idx) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="group cursor-pointer"
              onClick={() => handleProductClick(product)}
            >
              <div className="aspect-[4/5] rounded-[40px] overflow-hidden bg-stone-100 relative mb-6">
                <motion.img 
                  src={product.image} 
                  alt={product.name} 
                  whileHover={{ scale: 1.15 }}
                  transition={{ duration: 0.8 }}
                  className="w-full h-full object-cover origin-center"
                  referrerPolicy="no-referrer"
                />
                
                {/* Quick View Overlay */}
                <div className="absolute inset-0 bg-stone-900/0 group-hover:bg-stone-900/20 transition-all duration-500 flex items-center justify-center">
                  <motion.button 
                    initial={{ opacity: 0, y: 10 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => { e.stopPropagation(); handleProductClick(product); }}
                    className="opacity-0 group-hover:opacity-100 bg-white text-stone-900 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl transition-all duration-300"
                  >
                    Quick View
                  </motion.button>
                </div>

                <div className="absolute top-6 right-6 flex flex-col gap-2 z-10">
                  <button 
                    onClick={(e) => handleToggleWishlist(e, product)}
                    className={`w-12 h-12 rounded-full bg-white flex items-center justify-center transition-all shadow-sm ${wishlist.includes(product.id) ? 'text-red-500 scale-110' : 'text-stone-400 hover:text-red-500'}`}
                  >
                    <Heart size={20} fill={wishlist.includes(product.id) ? "currentColor" : "none"} />
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleProductClick(product); }}
                    className="w-12 h-12 rounded-full bg-brand-primary text-brand-cream flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                  >
                    <Plus size={24} />
                  </button>
                </div>
              <div className="absolute bottom-6 left-6 right-6">
                <div className="bg-white/80 backdrop-blur-md p-4 rounded-2xl flex justify-between items-center shadow-sm">
                  <span className="font-bold text-lg">KSH {product.price}</span>
                  <div className="flex items-center gap-1 text-xs font-bold text-brand-primary">
                    <Star size={14} fill="#5A5A40" /> {product.rating}
                  </div>
                </div>
              </div>
            </div>
            <h3 className="text-2xl mb-1">{product.name}</h3>
            <p className="text-stone-400 text-sm font-medium uppercase tracking-widest">{product.category}</p>
          </motion.div>
        ))}
        </div>
      )}

      {/* Product Detail Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProduct(null)}
              className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-brand-cream w-full max-w-5xl rounded-[40px] overflow-hidden flex flex-col md:flex-row relative z-10 shadow-2xl max-h-[90vh]"
            >
              <div className="md:w-1/2 overflow-hidden relative cursor-zoom-in group/image bg-stone-100" onClick={() => setIsZoomed(!isZoomed)}>
                <motion.img 
                  key={selectedColor}
                  initial={{ opacity: 0.8, scale: 1.1 }}
                  animate={{ opacity: 1, scale: isZoomed ? 1.8 : 1 }}
                  src={selectedProduct.variations?.find((v: any) => v.name === selectedColor)?.image || selectedProduct.image} 
                  alt={selectedProduct.name} 
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  className="w-full h-full object-cover origin-center max-h-[50vh] md:max-h-full" 
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
              <div className="md:w-1/2 p-8 md:p-12 flex flex-col overflow-y-auto scroll-smooth custom-scrollbar relative max-h-full">
                <button 
                  onClick={() => setSelectedProduct(null)}
                  className="sticky top-0 ml-auto p-3 text-stone-300 hover:text-brand-primary hover:bg-stone-50 rounded-full transition-all z-20 bg-white/80 backdrop-blur-md shadow-sm mb-4"
                >
                  <Plus className="rotate-45" size={24} />
                </button>

                <div className="flex items-center gap-2 text-brand-primary font-bold uppercase tracking-[0.2em] text-[10px] mb-4">
                  <Package size={12} /> Artisanal Item
                </div>
                
                <h2 className="text-4xl md:text-5xl font-serif mb-6 leading-tight">{selectedProduct.name}</h2>
                
                <div className="flex items-center gap-6 mb-8 border-b border-stone-100 pb-8">
                  <div>
                    <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest block mb-1">Price</span>
                    <span className="text-3xl font-bold text-brand-primary font-mono">
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

                {/* Prominent Add to Cart for Modal */}
                <button 
                  onClick={() => handleAddToCart(selectedProduct)}
                  className="w-full bg-brand-primary text-brand-cream py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 hover:scale-[1.02] transition-transform shadow-xl shadow-brand-primary/20 mb-8"
                >
                  <ShoppingBag size={24} /> Add to Cart
                </button>

                {/* Custom Options: Quantity & Address */}
                <div className="space-y-6 mb-8">
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
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-2">Delivery Address</label>
                    <textarea 
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      placeholder="Enter full delivery details..."
                      className="w-full bg-stone-50 border border-stone-100 rounded-2xl p-4 text-sm focus:outline-brand-primary min-h-[80px]"
                    />
                  </div>
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

                  {auth.currentUser && (
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
                  )}
                </div>

                <div className="mt-auto space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => handleAddToCart(selectedProduct)}
                      className="bg-stone-100 text-stone-900 py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-stone-200 transition-colors"
                    >
                      <Plus size={20} /> Cart
                    </button>
                    <button 
                      onClick={() => handleOrder(selectedProduct)}
                      className="bg-brand-primary text-brand-cream py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform shadow-lg shadow-brand-primary/20"
                    >
                      <ShoppingBag size={20} /> Buy
                    </button>
                  </div>
                  <button className="w-full border border-stone-200 text-stone-600 py-4 rounded-2xl font-bold hover:bg-stone-50 transition-colors">
                    Custom Request
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
