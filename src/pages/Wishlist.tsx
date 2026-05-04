import { useState, useEffect } from 'react';
import { db, auth, query, collection, where, onSnapshot, OperationType, handleFirestoreError, deleteDoc, doc, addDoc, serverTimestamp } from '../lib/firebase';
import { Heart, ShoppingBag, ArrowRight, Package, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'wishlist'),
      where('userId', '==', auth.currentUser.uid)
    );

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
      await deleteDoc(doc(db, 'wishlist', id));
      toast.success("Removed from wishlist");
    } catch (err) {
      toast.error("Failed to remove");
    }
  };

  const moveToCart = async (item: WishlistItem) => {
    if (!auth.currentUser) return;
    
    try {
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
      await deleteDoc(doc(db, 'wishlist', item.id));
      toast.success("Moved to cart!");
    } catch (err) {
      toast.error("Failed to move to cart");
    }
  };

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
        <h1 className="text-5xl md:text-7xl mb-4 italic font-light">My <span className="font-serif not-italic">Wishlist</span></h1>
        <p className="text-stone-500">Items you've fallen in love with.</p>
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
          <h3 className="text-2xl mb-2 font-serif">Your wishlist is empty</h3>
          <p className="text-stone-400 mb-8">Start exploring our collection to find something special.</p>
          <Link to="/shop" className="text-brand-primary font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:gap-4 transition-all">
            Browse Shop <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence>
            {items.map((item, idx) => (
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
                </div>
                <div className="p-6 text-center">
                  <h3 className="text-xl font-bold mb-1">{item.productName}</h3>
                  <p className="text-brand-primary font-bold mb-6">KSH {item.price}</p>
                  <button 
                    onClick={() => moveToCart(item)}
                    className="w-full bg-stone-900 text-white py-4 rounded-2xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-brand-primary transition-colors"
                  >
                    <ShoppingBag size={16} /> Move to Cart
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
