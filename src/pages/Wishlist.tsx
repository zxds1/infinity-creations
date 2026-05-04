import { useState, useEffect } from 'react';
import { db, auth, query, collection, where, onSnapshot, OperationType, handleFirestoreError, deleteDoc, doc, addDoc, serverTimestamp, getDocs } from '../lib/firebase';
import { Heart, ShoppingBag, ArrowRight, Package, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { assertProductExists, getProductInsightLabels, getProductPreferenceScore, getStoredPreferences, trackEvent } from '../lib/behavior';

interface WishlistItem {
  id: string;
  productId: string;
  productName: string;
  price: number;
  image: string;
  createdAt: any;
}

export default function Wishlist() {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const preferences = getStoredPreferences();

  useEffect(() => {
    if (!auth.currentUser) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'wishlist'),
      where('userId', '==', auth.currentUser.uid)
    );

    getDocs(collection(db, 'products'))
      .then(snapshot => setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))))
      .catch(() => undefined);

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as WishlistItem[];
      setItems(data);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'wishlist');
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const removeFromWishlist = async (id: string) => {
    try {
      const item = items.find(i => i.id === id);
      await deleteDoc(doc(db, 'wishlist', id));
      if (item) {
        trackEvent({ eventType: 'wishlist', productId: item.productId, metadata: { action: 'remove-from-core' } }).catch(() => undefined);
      }
      toast.success("Removed from wishlist");
    } catch (err) {
      toast.error("Failed to remove");
    }
  };

  const moveToCart = async (item: WishlistItem) => {
    if (!auth.currentUser) return;
    
    try {
      await assertProductExists(item.productId);
      await addDoc(collection(db, 'cart'), {
        userId: auth.currentUser.uid,
        productId: item.productId,
        productName: item.productName,
        price: item.price,
        image: item.image,
        quantity: 1,
        deliveryAddress: "Standard Address", // Default
        createdAt: serverTimestamp()
      });
      trackEvent({ eventType: 'cart', productId: item.productId, metadata: { source: 'wishlist' } }).catch(() => undefined);
      await deleteDoc(doc(db, 'wishlist', item.id));
      toast.success("Moved to cart!");
    } catch (err) {
      toast.error("Failed to move to cart");
    }
  };

  const recommendedProducts = products
    .filter(product => !items.some(item => item.productId === product.id))
    .sort((a, b) => getProductPreferenceScore(b, preferences) - getProductPreferenceScore(a, preferences))
    .slice(0, 3);

  if (!auth.currentUser) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center">
        <Heart size={64} className="text-stone-200 mx-auto mb-6" />
        <h1 className="text-4xl mb-6">Sign in to view your wishlist</h1>
        <p className="text-stone-500 mb-8">Save your favorite pieces and come back to them later.</p>
        <Link to="/" className="bg-brand-primary text-brand-cream px-8 py-4 rounded-2xl font-bold uppercase tracking-widest text-xs">
          Explore Collection
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
      <div className="mb-12">
        <h1 className="text-5xl md:text-7xl mb-4 italic font-light">High-Intent <span className="font-serif not-italic">Signals</span></h1>
        <p className="text-stone-500">Saved items, similar options, and availability cues from your strongest product interest.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-12 h-12 rounded-full border-2 border-brand-primary/10 border-t-brand-primary animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-[40px] p-24 text-center border border-brand-primary/5">
          <div className="w-20 h-20 rounded-full bg-stone-50 flex items-center justify-center mx-auto mb-6 text-stone-300">
            <Heart size={40} />
          </div>
          <h3 className="text-2xl mb-2 font-serif">No high-intent items yet</h3>
          <p className="text-stone-400 mb-8">Start saving products to unlock stronger recommendations and comparison context.</p>
          <Link to="/shop" className="text-brand-primary font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:gap-4 transition-all">
            Browse Shop <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <div className="space-y-14">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence>
              {items.map((item, idx) => {
                const product = products.find(p => p.id === item.productId);
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-white rounded-[32px] overflow-hidden border border-brand-primary/5 group"
                  >
                    <div className="aspect-square relative overflow-hidden">
                      <img src={item.image} alt={item.productName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
                      <button
                        onClick={() => removeFromWishlist(item.id)}
                        className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center text-red-500 hover:bg-white transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                      <div className="absolute bottom-4 left-4 right-4 flex flex-wrap gap-2">
                        {(product ? getProductInsightLabels(product, preferences, idx) : ['Saved intent']).slice(0, 2).map(label => (
                          <span key={label} className="rounded-full bg-white/85 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-stone-600 backdrop-blur">
                            {label}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="p-6 text-center">
                      <h3 className="text-xl font-bold mb-1">{item.productName}</h3>
                      <p className="text-brand-primary font-bold mb-6">KSH {item.price}</p>
                      <button
                        onClick={() => moveToCart(item)}
                        className="w-full bg-stone-900 text-white py-4 rounded-2xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-brand-primary transition-colors"
                      >
                        <ShoppingBag size={16} /> Confirm Intent
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {recommendedProducts.length > 0 && (
            <section className="border-t border-brand-primary/10 pt-10">
              <div className="mb-6 flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-3xl font-serif">Similar items</h2>
                  <p className="text-sm text-stone-400">Recommendations improve as you compare and save more products.</p>
                </div>
                <Link to="/shop" className="text-[10px] font-black uppercase tracking-widest text-brand-primary flex items-center gap-2">
                  Compare more <ArrowRight size={14} />
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {recommendedProducts.map(product => (
                  <Link key={product.id} to="/shop" className="group flex gap-4 rounded-3xl bg-white p-4 border border-stone-100 hover:border-brand-primary/20 transition-colors">
                    <img src={product.image} alt={product.name} className="h-24 w-24 rounded-2xl object-cover" referrerPolicy="no-referrer" />
                    <div className="min-w-0 py-1">
                      <h3 className="truncate font-bold text-stone-900">{product.name}</h3>
                      <p className="text-sm font-bold text-brand-primary">KSH {product.price}</p>
                      <p className="mt-2 text-[10px] font-black uppercase tracking-widest text-stone-400">{product.category}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
