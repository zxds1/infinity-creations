import { useState, useEffect } from 'react';
import { db, auth, query, collection, where, onSnapshot, OperationType, handleFirestoreError, deleteDoc, doc, updateDoc, addDoc, serverTimestamp, getDocs } from '../lib/firebase';
import { ShoppingBag, Trash2, Plus, Minus, MapPin, ArrowRight, CreditCard, Bookmark, PlusCircle, Check, Edit3 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';

interface CartItem {
  id: string;
  productId: string;
  productName: string;
  price: number;
  image: string;
  quantity: number;
  deliveryAddress: string;
  variationName?: string;
  createdAt: any;
}

interface Address {
  id: string;
  label: string;
  address: string;
  isDefault: boolean;
}

export default function Cart() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [newAddress, setNewAddress] = useState({ label: '', address: '' });

  useEffect(() => {
    const userId = auth.currentUser?.uid || "guest_test_user";
    
    const q = query(
      collection(db, 'cart'),
      where('userId', '==', userId)
    );

    const unsubscribeCart = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as CartItem[];
      setItems(data);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'cart');
      setLoading(false);
    });

    const unsubscribeAddresses = onSnapshot(
      collection(db, `users/${auth.currentUser.uid}/addresses`),
      (snapshot) => {
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Address[];
        setAddresses(data);
      }
    );

    return () => {
      unsubscribeCart();
      unsubscribeAddresses();
    };
  }, []);

  const updateQuantity = async (id: string, newQty: number) => {
    if (newQty < 1) return;
    try {
      await updateDoc(doc(db, 'cart', id), { quantity: newQty });
    } catch (err) {
      toast.error("Failed to update quantity");
    }
  };

  const updateAddress = async (id: string, address: string) => {
    try {
      await updateDoc(doc(db, 'cart', id), { deliveryAddress: address });
    } catch (err) {
      toast.error("Failed to update address");
    }
  };

  const saveNewAddress = async () => {
    if (!auth.currentUser || !newAddress.label || !newAddress.address) return;
    try {
      if (editingAddressId) {
        await updateDoc(doc(db, `users/${auth.currentUser.uid}/addresses`, editingAddressId), {
          ...newAddress
        });
        toast.success("Address updated!");
      } else {
        await addDoc(collection(db, `users/${auth.currentUser.uid}/addresses`), {
          ...newAddress,
          isDefault: addresses.length === 0,
          createdAt: serverTimestamp()
        });
        toast.success("Address saved!");
      }
      setNewAddress({ label: '', address: '' });
      setEditingAddressId(null);
      setShowAddressModal(false);
    } catch (err) {
      toast.error("Failed to save address");
    }
  };

  const deleteAddress = async (id: string) => {
    if (!auth.currentUser) return;
    try {
      await deleteDoc(doc(db, `users/${auth.currentUser.uid}/addresses`, id));
      toast.success("Address deleted");
    } catch (err) {
      toast.error("Failed to delete address");
    }
  };

  const setAddressAsDefault = async (id: string) => {
    if (!auth.currentUser) return;
    try {
      const updates = addresses.map(addr => 
        updateDoc(doc(db, `users/${auth.currentUser.uid}/addresses`, addr.id), {
          isDefault: addr.id === id
        })
      );
      await Promise.all(updates);
      toast.success("Default address updated");
    } catch (err) {
      toast.error("Failed to set default");
    }
  };

  const removeItem = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'cart', id));
      toast.success("Removed from cart");
    } catch (err) {
      toast.error("Failed to remove");
    }
  };

  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  if (!auth.currentUser && false) { // Bypass for testing
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center">
        <ShoppingBag size={64} className="text-stone-200 mx-auto mb-6" />
        <h1 className="text-4xl mb-6">Sign in to view your cart</h1>
        <Link to="/" className="bg-brand-primary text-brand-cream px-8 py-4 rounded-2xl font-bold uppercase tracking-widest text-xs">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
      <div className="mb-12">
        <h1 className="text-5xl md:text-7xl mb-4 italic font-light">My <span className="font-serif not-italic">Cart</span></h1>
        <p className="text-stone-500">Review your selected pieces and prepare for delivery.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-12 h-12 rounded-full border-2 border-brand-primary/10 border-t-brand-primary animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-[40px] p-24 text-center border border-brand-primary/5">
          <div className="w-20 h-20 rounded-full bg-stone-50 flex items-center justify-center mx-auto mb-6 text-stone-300">
            <ShoppingBag size={40} />
          </div>
          <h3 className="text-2xl mb-2 font-serif">Your cart is empty</h3>
          <Link to="/shop" className="text-brand-primary font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:gap-4 transition-all">
            Browse Shop <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-6">
            <AnimatePresence>
              {items.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-white rounded-[32px] p-6 border border-brand-primary/5 flex flex-col md:flex-row gap-6"
                >
                  <div className="w-full md:w-32 aspect-square rounded-2xl overflow-hidden bg-stone-100 shrink-0">
                    <img src={item.image} alt={item.productName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold">{item.productName}</h3>
                        {item.variationName && (
                          <div className="text-[10px] font-black uppercase tracking-widest text-stone-400 mt-1">
                            Style: <span className="text-brand-primary">{item.variationName}</span>
                          </div>
                        )}
                        <p className="text-brand-primary font-bold text-lg mt-1">KSH {item.price}</p>
                      </div>
                      <button onClick={() => removeItem(item.id)} className="text-stone-300 hover:text-red-500 transition-colors">
                        <Trash2 size={20} />
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-6 items-end">
                      <div className="flex items-center gap-4 bg-stone-50 px-4 py-2 rounded-xl">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="text-stone-400 hover:text-stone-900"><Minus size={16} /></button>
                        <span className="font-bold min-w-[20px] text-center">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="text-stone-400 hover:text-stone-900"><Plus size={16} /></button>
                      </div>

                      <div className="flex-1 min-w-[200px]">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-stone-400">
                            <MapPin size={10} /> Delivery Address
                          </div>
                          {addresses.length > 0 && (
                            <div className="flex gap-2">
                              {addresses.map(addr => (
                                <button 
                                  key={addr.id}
                                  onClick={() => updateAddress(item.id, addr.address)}
                                  className={`text-[8px] font-bold uppercase py-1 px-2 rounded-md transition-colors ${item.deliveryAddress === addr.address ? 'bg-brand-primary text-white' : 'bg-stone-100 text-stone-400 hover:bg-stone-200'}`}
                                >
                                  {addr.label}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="relative group">
                          <input 
                            type="text" 
                            value={item.deliveryAddress}
                            onChange={(e) => updateAddress(item.id, e.target.value)}
                            className="w-full bg-transparent border-b border-stone-200 focus:border-brand-primary outline-none text-sm py-1"
                          />
                          <button 
                            onClick={() => setShowAddressModal(true)}
                            className="absolute right-0 bottom-1 text-stone-300 hover:text-brand-primary transition-colors opacity-0 group-hover:opacity-100"
                            title="Save this address"
                          >
                            <Bookmark size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-[40px] p-8 border border-stone-100 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-serif italic">My Addresses</h3>
                <button 
                  onClick={() => {
                    setNewAddress({ label: '', address: '' });
                    setEditingAddressId(null);
                    setShowAddressModal(true);
                  }}
                  className="text-brand-primary font-bold text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-brand-primary/5 px-3 py-2 rounded-xl transition-all"
                >
                  <Plus size={14} /> Add
                </button>
              </div>
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {addresses.length === 0 ? (
                    <div className="p-8 text-center bg-stone-50 rounded-2xl border border-stone-100">
                      <MapPin size={24} className="mx-auto text-stone-300 mb-2" />
                      <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">No saved addresses</p>
                    </div>
                ) : (
                  addresses.map(addr => (
                    <div key={addr.id} className={`p-4 rounded-2xl border transition-all ${addr.isDefault ? 'border-brand-primary/20 bg-brand-primary/[0.02]' : 'border-stone-100 bg-white hover:border-stone-200'}`}>
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-widest">{addr.label}</span>
                          {addr.isDefault && <span className="text-[8px] px-2 py-0.5 bg-brand-primary text-white rounded-full font-black uppercase tracking-widest">Default</span>}
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => {
                            setEditingAddressId(addr.id);
                            setNewAddress({ label: addr.label, address: addr.address });
                            setShowAddressModal(true);
                          }} className="text-stone-300 hover:text-stone-900 transition-colors">
                            <Edit3 size={12} />
                          </button>
                          <button onClick={() => deleteAddress(addr.id)} className="text-stone-300 hover:text-red-500 transition-colors">
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                      <p className="text-[10px] text-stone-500 leading-relaxed overflow-hidden text-ellipsis line-clamp-2">{addr.address}</p>
                      {!addr.isDefault && (
                        <button onClick={() => setAddressAsDefault(addr.id)} className="text-[8px] font-black uppercase tracking-tighter text-brand-primary hover:underline mt-2">
                          Set as default
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="bg-brand-primary text-brand-cream rounded-[40px] p-8 sticky top-8 shadow-2xl">
              <h2 className="text-3xl font-serif mb-8 italic">Order Summary</h2>
              
              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-white/60 text-sm">
                  <span>Subtotal</span>
                  <span>KSH {total}</span>
                </div>
                <div className="flex justify-between text-white/60 text-sm">
                  <span>Delivery</span>
                  <span>KSH 500</span>
                </div>
                <div className="pt-4 border-t border-white/10 flex justify-between font-bold text-xl">
                  <span>Total</span>
                  <span>KSH {total + 500}</span>
                </div>
              </div>

              <button className="w-full bg-white text-brand-primary py-5 rounded-2xl font-bold uppercase tracking-widest text-sm flex items-center justify-center gap-3 hover:scale-[1.02] transition-transform shadow-xl">
                <CreditCard size={20} /> Checkout
              </button>
              
              <p className="text-[10px] text-white/40 mt-6 text-center italic">
                Secure payment powered by Pesapal & DPO
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
