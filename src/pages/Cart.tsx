import { useState, useEffect } from 'react';
import { db, auth, query, collection, where, onSnapshot, OperationType, handleFirestoreError, deleteDoc, doc, updateDoc, addDoc, serverTimestamp, getDocs } from '../lib/firebase';
import { ShoppingBag, Trash2, Plus, Minus, MapPin, ArrowRight, CreditCard, Bookmark, Edit3, ShieldCheck, Phone, WalletCards, Clock3, Building2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { trackEvent } from '../lib/behavior';
import { createCheckout, type CheckoutResponse, type PaymentMethod } from '../lib/payments';

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
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<'review' | 'delivery' | 'payment'>('review');
  const [checkoutAddress, setCheckoutAddress] = useState('');
  const [contact, setContact] = useState({ name: '', email: '', phone: '' });
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('mpesa');
  const [checkoutResult, setCheckoutResult] = useState<CheckoutResponse | null>(null);
  const [processingCheckout, setProcessingCheckout] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, currentUser => {
      setUser(currentUser);
      setContact(prev => ({
        name: prev.name || currentUser?.displayName || '',
        email: prev.email || currentUser?.email || '',
        phone: prev.phone
      }));
      setAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!authReady) return;
    if (!user) {
      setItems([]);
      setAddresses([]);
      setLoading(false);
      return;
    }
    
    const q = query(
      collection(db, 'cart'),
      where('userId', '==', user.uid)
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
      collection(db, `users/${user.uid}/addresses`),
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
  }, [authReady, user]);

  useEffect(() => {
    if (checkoutAddress) return;
    const defaultAddress = addresses.find(address => address.isDefault)?.address || items[0]?.deliveryAddress || '';
    if (defaultAddress) setCheckoutAddress(defaultAddress);
  }, [addresses, items, checkoutAddress]);

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
      const item = items.find(i => i.id === id);
      await deleteDoc(doc(db, 'cart', id));
      if (item) {
        trackEvent({ eventType: 'cart', productId: item.productId, metadata: { action: 'remove-intent' } }).catch(() => undefined);
      }
      toast.success("Removed from cart");
    } catch (err) {
      toast.error("Failed to remove");
    }
  };

  const getIdempotencyKey = () => {
    const existing = window.sessionStorage.getItem('maridadi.checkoutIdempotencyKey');
    if (existing) return existing;
    const key = window.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    window.sessionStorage.setItem('maridadi.checkoutIdempotencyKey', key);
    return key;
  };

  const startCheckout = async () => {
    if (!items.length) return;
    if (!contact.name.trim() || !contact.email.trim() || !contact.phone.trim() || !checkoutAddress.trim()) {
      toast.error("Add contact and delivery details first");
      setCheckoutStep('delivery');
      return;
    }

    setProcessingCheckout(true);
    try {
      const result = await createCheckout({
        cartItemIds: items.map(item => item.id),
        contact,
        deliveryAddress: checkoutAddress,
        paymentMethod,
        idempotencyKey: getIdempotencyKey()
      });
      setCheckoutResult(result);
      setCheckoutStep('payment');
      trackEvent({
        eventType: 'payment_attempted',
        metadata: { orderId: result.orderId, paymentMethod, total: result.amounts.total }
      }).catch(() => undefined);
      toast.success("Order created. Complete payment using the verified instructions.");
    } catch (error) {
      trackEvent({ eventType: 'payment_failed', metadata: { reason: error instanceof Error ? error.message : 'checkout-failed' } }).catch(() => undefined);
      toast.error("Checkout failed. Please review your cart.");
    } finally {
      setProcessingCheckout(false);
    }
  };

  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  if (authReady && !user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center">
        <ShoppingBag size={64} className="text-stone-200 mx-auto mb-6" />
        <h1 className="text-4xl mb-6">Sign in to review your intent list</h1>
        <Link to="/" className="bg-brand-primary text-brand-cream px-8 py-4 rounded-2xl font-bold uppercase tracking-widest text-xs">
          Start Exploring
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
      <div className="mb-12">
        <h1 className="text-5xl md:text-7xl mb-4 italic font-light">Secure <span className="font-serif not-italic">Checkout</span></h1>
        <p className="text-stone-500">Review items, confirm delivery details, then pay through a server-verified order.</p>
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
          <h3 className="text-2xl mb-2 font-serif">No confirmed intent yet</h3>
          <p className="text-stone-400 mb-8">Compare products or save items to help us understand what you are considering.</p>
          <Link to="/shop" className="text-brand-primary font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:gap-4 transition-all">
            Browse signals <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-[32px] p-4 border border-brand-primary/5">
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'review', label: 'Review', icon: ShoppingBag },
                  { id: 'delivery', label: 'Delivery', icon: MapPin },
                  { id: 'payment', label: 'Payment', icon: CreditCard }
                ].map((step) => {
                  const StepIcon = step.icon;
                  const active = checkoutStep === step.id;
                  return (
                    <button
                      key={step.id}
                      onClick={() => setCheckoutStep(step.id as typeof checkoutStep)}
                      className={`flex items-center justify-center gap-2 rounded-2xl px-3 py-4 text-[10px] font-black uppercase tracking-widest transition-all ${active ? 'bg-brand-primary text-brand-cream' : 'bg-stone-50 text-stone-400 hover:text-brand-primary'}`}
                    >
                      <StepIcon size={16} />
                      {step.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <AnimatePresence>
              {checkoutStep === 'review' && (
                <motion.div key="review" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6">
                  {items.map((item) => (
                    <div key={item.id} className="bg-white rounded-[32px] p-6 border border-brand-primary/5 flex flex-col md:flex-row gap-6">
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
                            <p className="mt-1 text-xs font-bold uppercase tracking-widest text-stone-400">
                              Line subtotal: KSH {item.price * item.quantity}
                            </p>
                          </div>
                          <button onClick={() => removeItem(item.id)} className="text-stone-300 hover:text-red-500 transition-colors">
                            <Trash2 size={20} />
                          </button>
                        </div>

                        <div className="flex items-center gap-4 bg-stone-50 px-4 py-2 rounded-xl w-fit">
                          <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="text-stone-400 hover:text-stone-900"><Minus size={16} /></button>
                          <span className="font-bold min-w-[20px] text-center">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="text-stone-400 hover:text-stone-900"><Plus size={16} /></button>
                        </div>
                      </div>
                    </div>
                  ))}

                  <button onClick={() => setCheckoutStep('delivery')} className="w-full bg-stone-900 text-white py-5 rounded-2xl font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2">
                    Continue to delivery <ArrowRight size={16} />
                  </button>
                </motion.div>
              )}

              {checkoutStep === 'delivery' && (
                <motion.div key="delivery" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="bg-white rounded-[32px] p-8 border border-brand-primary/5 space-y-8">
                  <div>
                    <h2 className="text-3xl font-serif mb-2">Delivery and contact</h2>
                    <p className="text-sm text-stone-400">Maridadi uses this for payment confirmation, delivery coordination, and support.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input value={contact.name} onChange={(e) => setContact({ ...contact, name: e.target.value })} placeholder="Full name" className="rounded-2xl border border-stone-100 bg-stone-50 p-4 text-sm outline-none focus:border-brand-primary" />
                    <input value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} placeholder="Email address" className="rounded-2xl border border-stone-100 bg-stone-50 p-4 text-sm outline-none focus:border-brand-primary" />
                    <input value={contact.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value })} placeholder="Phone number" className="rounded-2xl border border-stone-100 bg-stone-50 p-4 text-sm outline-none focus:border-brand-primary" />
                  </div>

                  <div>
                    <div className="flex items-center justify-between gap-4 mb-3">
                      <label className="text-[10px] font-black uppercase tracking-widest text-stone-400">Delivery address</label>
                      {addresses.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {addresses.map(addr => (
                            <button
                              key={addr.id}
                              onClick={() => setCheckoutAddress(addr.address)}
                              className={`rounded-full px-3 py-1 text-[8px] font-black uppercase tracking-widest ${checkoutAddress === addr.address ? 'bg-brand-primary text-white' : 'bg-stone-100 text-stone-400'}`}
                            >
                              {addr.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <textarea value={checkoutAddress} onChange={(e) => setCheckoutAddress(e.target.value)} placeholder="Building, street, town, delivery notes..." className="min-h-[120px] w-full rounded-3xl border border-stone-100 bg-stone-50 p-5 text-sm outline-none focus:border-brand-primary" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="rounded-2xl bg-stone-50 p-5">
                      <Clock3 size={20} className="text-brand-primary mb-3" />
                      <h3 className="font-bold text-sm">Delivery estimate</h3>
                      <p className="text-xs text-stone-400 mt-1">3-7 business days after payment confirmation.</p>
                    </div>
                    <div className="rounded-2xl bg-stone-50 p-5">
                      <Building2 size={20} className="text-brand-primary mb-3" />
                      <h3 className="font-bold text-sm">Fulfilled by</h3>
                      <p className="text-xs text-stone-400 mt-1">Maridadi Creations, Nairobi, Kenya.</p>
                    </div>
                    <div className="rounded-2xl bg-stone-50 p-5">
                      <Phone size={20} className="text-brand-primary mb-3" />
                      <h3 className="font-bold text-sm">Support</h3>
                      <p className="text-xs text-stone-400 mt-1">Payment and delivery help by email after checkout.</p>
                    </div>
                    <div className="rounded-2xl bg-stone-50 p-5 md:col-span-3">
                      <ShieldCheck size={20} className="text-brand-primary mb-3" />
                      <h3 className="font-bold text-sm">Secure checkout</h3>
                      <p className="text-xs text-stone-400 mt-1">The backend recalculates item prices, delivery fee, and total before payment instructions are issued.</p>
                    </div>
                  </div>

                  <button onClick={() => setCheckoutStep('payment')} className="w-full bg-stone-900 text-white py-5 rounded-2xl font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2">
                    Continue to payment <ArrowRight size={16} />
                  </button>
                </motion.div>
              )}

              {checkoutStep === 'payment' && (
                <motion.div key="payment" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="bg-white rounded-[32px] p-8 border border-brand-primary/5 space-y-8">
                  <div>
                    <h2 className="text-3xl font-serif mb-2">Payment</h2>
                    <p className="text-sm text-stone-400">The backend recalculates your cart before creating an order. The client total is display-only.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { id: 'mpesa', label: 'M-Pesa', description: 'STK push callback verified' },
                      { id: 'card', label: 'Card', description: 'Provider callback verified' }
                    ].map(method => (
                      <button
                        key={method.id}
                        onClick={() => setPaymentMethod(method.id as PaymentMethod)}
                        className={`rounded-3xl border p-6 text-left transition-all ${paymentMethod === method.id ? 'border-brand-primary bg-brand-primary/5' : 'border-stone-100 bg-stone-50 hover:border-brand-primary/20'}`}
                      >
                        <WalletCards size={24} className="text-brand-primary mb-4" />
                        <h3 className="font-bold">{method.label}</h3>
                        <p className="text-xs text-stone-400 mt-1">{method.description}</p>
                      </button>
                    ))}
                  </div>

                  {checkoutResult && (
                    <div className="rounded-3xl border border-brand-primary/10 bg-brand-primary/5 p-6">
                      <div className="flex items-start gap-4">
                        <ShieldCheck size={28} className="text-brand-primary shrink-0" />
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-brand-primary mb-1">Server verified order</p>
                          <h3 className="font-bold text-lg">{checkoutResult.paymentInstructions.title}</h3>
                          <p className="text-sm text-stone-600 mt-2">{checkoutResult.paymentInstructions.message}</p>
                          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                            <div className="rounded-2xl bg-white p-4">
                              <span className="block text-[10px] font-black uppercase tracking-widest text-stone-400">Order ID</span>
                              <span className="font-mono text-xs">{checkoutResult.orderId}</span>
                            </div>
                            <div className="rounded-2xl bg-white p-4">
                              <span className="block text-[10px] font-black uppercase tracking-widest text-stone-400">Exact amount</span>
                              <span className="font-bold">KSH {checkoutResult.amounts.total}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={startCheckout}
                    disabled={processingCheckout}
                    className="w-full bg-brand-primary text-brand-cream py-5 rounded-2xl font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:scale-[1.01] transition-transform disabled:opacity-60"
                  >
                    <CreditCard size={18} />
                    {processingCheckout ? 'Creating verified order...' : 'Create order and start payment'}
                  </button>
                </motion.div>
              )}
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
              <h2 className="text-3xl font-serif mb-8 italic">Checkout Summary</h2>
              
              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-white/60 text-sm">
                  <span>Subtotal</span>
                  <span>KSH {total}</span>
                </div>
                <div className="flex justify-between text-white/60 text-sm">
                  <span>Estimated delivery</span>
                  <span>KSH 500</span>
                </div>
                <div className="pt-4 border-t border-white/10 flex justify-between font-bold text-xl">
                  <span>Total</span>
                  <span>KSH {total + 500}</span>
                </div>
              </div>

              <button
                onClick={() => checkoutStep === 'payment' ? startCheckout() : setCheckoutStep(checkoutStep === 'review' ? 'delivery' : 'payment')}
                disabled={processingCheckout}
                className="w-full bg-white text-brand-primary py-5 rounded-2xl font-bold uppercase tracking-widest text-sm flex items-center justify-center gap-3 hover:scale-[1.02] transition-transform shadow-xl"
              >
                <CreditCard size={20} /> {checkoutStep === 'payment' ? 'Start Payment' : 'Continue'}
              </button>
              
              <p className="text-[10px] text-white/40 mt-6 text-center italic">
                Final total is recalculated by the backend before payment starts.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
