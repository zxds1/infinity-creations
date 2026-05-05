import { useState, useEffect } from 'react';
import { db, auth, query, collection, where, onSnapshot, OperationType, handleFirestoreError, deleteDoc, doc, updateDoc, addDoc, serverTimestamp, getDocs } from '../lib/firebase';
import { ShoppingBag, Trash2, Plus, Minus, MapPin, ArrowRight, CreditCard, Bookmark, Edit3, ShieldCheck, Phone, WalletCards, Clock3, Building2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { trackEvent } from '../lib/behavior';
import { createCheckout, type CheckoutResponse, type PaymentMethod } from '../lib/payments';
import { DEMO_USER_ID, addDemoOrder, getDemoAddresses, getDemoCart, saveDemoAddresses, saveDemoCart } from '../lib/demoMode';

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
      setItems(getDemoCart<CartItem>());
      setAddresses(getDemoAddresses<Address>());
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
    if (!user) {
      const next = items.map(item => item.id === id ? { ...item, quantity: newQty } : item);
      setItems(next);
      saveDemoCart(next);
      return;
    }
    try {
      await updateDoc(doc(db, 'cart', id), { quantity: newQty });
    } catch (err) {
      toast.error("Failed to update quantity");
    }
  };

  const updateAddress = async (id: string, address: string) => {
    if (!user) {
      const next = items.map(item => item.id === id ? { ...item, deliveryAddress: address } : item);
      setItems(next);
      saveDemoCart(next);
      return;
    }
    try {
      await updateDoc(doc(db, 'cart', id), { deliveryAddress: address });
    } catch (err) {
      toast.error("Failed to update address");
    }
  };

  const saveNewAddress = async () => {
    if (!newAddress.label || !newAddress.address) return;
    if (!auth.currentUser) {
      const nextAddress = {
        id: editingAddressId || `demo-address-${Date.now()}`,
        ...newAddress,
        isDefault: addresses.length === 0
      };
      const next = editingAddressId
        ? addresses.map(address => address.id === editingAddressId ? { ...address, ...newAddress } : address)
        : [...addresses, nextAddress];
      setAddresses(next);
      saveDemoAddresses(next);
      toast.success(editingAddressId ? "Address updated!" : "Address saved!");
      setNewAddress({ label: '', address: '' });
      setEditingAddressId(null);
      setShowAddressModal(false);
      return;
    }
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
    if (!auth.currentUser) {
      const next = addresses.filter(address => address.id !== id);
      setAddresses(next);
      saveDemoAddresses(next);
      toast.success("Address deleted");
      return;
    }
    try {
      await deleteDoc(doc(db, `users/${auth.currentUser.uid}/addresses`, id));
      toast.success("Address deleted");
    } catch (err) {
      toast.error("Failed to delete address");
    }
  };

  const setAddressAsDefault = async (id: string) => {
    if (!auth.currentUser) {
      const next = addresses.map(address => ({ ...address, isDefault: address.id === id }));
      setAddresses(next);
      saveDemoAddresses(next);
      toast.success("Default address updated");
      return;
    }
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
      if (!user) {
        const next = items.filter(cartItem => cartItem.id !== id);
        setItems(next);
        saveDemoCart(next);
        toast.success("Removed from cart");
        return;
      }
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
      if (!user) {
        const subtotal = total;
        const demoResult: CheckoutResponse = {
          orderId: `DEMO-${Date.now().toString().slice(-6)}`,
          status: 'pending_payment',
          paymentStatus: 'Demo order',
          paymentInstructions: {
            title: 'Demo checkout created',
            message: 'This preview order was created without sign-in. No payment was charged.',
            provider: paymentMethod === 'mpesa' ? 'M-Pesa demo' : 'Card demo'
          },
          amounts: {
            currency: 'KES',
            subtotal,
            deliveryFee: 500,
            total: subtotal + 500
          },
          deliveryEstimate: '3-7 business days'
        };
        addDemoOrder({
          id: demoResult.orderId,
          userId: DEMO_USER_ID,
          type: 'Checkout',
          details: { items, deliveryAddress: checkoutAddress, contact },
          status: 'pending_payment',
          amounts: demoResult.amounts,
          paymentStatus: demoResult.paymentStatus,
          createdAt: { seconds: Math.floor(Date.now() / 1000) }
        });
        setCheckoutResult(demoResult);
        setCheckoutStep('payment');
        toast.success("Demo order created.");
        return;
      }
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
      toast.success("Order created. Complete payment with the details shown.");
    } catch (error) {
      trackEvent({ eventType: 'payment_failed', metadata: { reason: error instanceof Error ? error.message : 'checkout-failed' } }).catch(() => undefined);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setProcessingCheckout(false);
    }
  };

  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div className="max-w-6xl mx-auto px-3 py-8 sm:px-4 md:py-16">
      <div className="mb-8 md:mb-12">
        <h1 className="mb-3 text-4xl italic font-light leading-none md:mb-4 md:text-7xl">Your <span className="font-serif not-italic">Order</span></h1>
        <p className="text-stone-500">Review your custom service requests, confirm delivery details, then choose how you want to pay.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-12 h-12 rounded-full border-2 border-brand-primary/10 border-t-brand-primary animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-[32px] p-10 text-center border border-brand-primary/5 md:rounded-[40px] md:p-24">
          <div className="w-20 h-20 rounded-full bg-stone-50 flex items-center justify-center mx-auto mb-6 text-stone-300">
            <ShoppingBag size={40} />
          </div>
          <h3 className="text-2xl mb-2 font-serif">Nothing here yet</h3>
          <p className="text-stone-400 mb-8">Start by exploring designs and add what you want to create.</p>
          <Link to="/shop" className="text-brand-primary font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:gap-4 transition-all">
            Explore designs <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-12">
          <div className="lg:col-span-2 space-y-6">
            <div className="sticky top-16 z-30 bg-white rounded-[24px] p-2 border border-brand-primary/5 md:rounded-[32px] md:p-4 lg:static">
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
                      className={`flex min-h-12 items-center justify-center gap-1 rounded-2xl px-2 py-3 text-[9px] font-black uppercase tracking-widest transition-all md:gap-2 md:px-3 md:py-4 md:text-[10px] ${active ? 'bg-brand-primary text-brand-cream' : 'bg-stone-50 text-stone-400 hover:text-brand-primary'}`}
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
                    <div key={item.id} className="bg-white rounded-[28px] p-4 border border-brand-primary/5 flex flex-col gap-4 md:flex-row md:gap-6 md:rounded-[32px] md:p-6">
                      <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden bg-stone-100 shrink-0 md:w-32 md:aspect-square">
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
                <motion.div key="delivery" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="bg-white rounded-[28px] p-5 border border-brand-primary/5 space-y-6 md:rounded-[32px] md:p-8 md:space-y-8">
                  <div>
                    <h2 className="text-2xl font-serif mb-2 md:text-3xl">Your Details</h2>
                    <p className="text-sm text-stone-400">Where should we deliver?</p>
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
                      <p className="text-xs text-stone-400 mt-1">Secure checkout. We will confirm your order before processing.</p>
                    </div>
                  </div>

                  <button onClick={() => setCheckoutStep('payment')} className="w-full bg-stone-900 text-white py-5 rounded-2xl font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2">
                    Continue to payment <ArrowRight size={16} />
                  </button>
                </motion.div>
              )}

              {checkoutStep === 'payment' && (
                <motion.div key="payment" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="bg-white rounded-[28px] p-5 border border-brand-primary/5 space-y-6 md:rounded-[32px] md:p-8 md:space-y-8">
                  <div>
                    <h2 className="text-2xl font-serif mb-2 md:text-3xl">Complete your order</h2>
                    <p className="text-sm text-stone-400">Choose your preferred payment method.</p>
                  </div>

                  <div className="rounded-3xl border border-stone-100 bg-stone-50 p-6">
                    <div className="mb-5 flex items-center justify-between gap-4">
                      <div>
                        <h3 className="font-bold text-stone-900">Order Summary</h3>
                        <p className="text-xs text-stone-400 mt-1">Review your items and total cost.</p>
                      </div>
                      <ShieldCheck size={22} className="text-brand-primary" />
                    </div>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between gap-4">
                        <span className="text-stone-500">Items</span>
                        <span className="font-bold text-stone-900">{items.length}</span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-stone-500">Subtotal</span>
                        <span className="font-bold text-stone-900">KSH {total}</span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-stone-500">Estimated delivery</span>
                        <span className="font-bold text-stone-900">KSH 500</span>
                      </div>
                      <div className="flex justify-between gap-4 border-t border-stone-200 pt-3">
                        <span className="font-bold text-stone-900">Total</span>
                        <span className="font-bold text-brand-primary">KSH {total + 500}</span>
                      </div>
                    </div>
                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl bg-white p-4">
                        <span className="block text-[10px] font-black uppercase tracking-widest text-stone-400">Fulfilled by</span>
                        <span className="mt-1 block text-sm font-bold text-stone-800">Maridadi Creations</span>
                      </div>
                      <div className="rounded-2xl bg-white p-4">
                        <span className="block text-[10px] font-black uppercase tracking-widest text-stone-400">Delivery time</span>
                        <span className="mt-1 block text-sm font-bold text-stone-800">3-7 business days</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { id: 'mpesa', label: 'M-Pesa', description: 'Pay with a secure phone prompt' },
                      { id: 'card', label: 'Card', description: 'Pay securely by card' }
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
                          <p className="text-[10px] font-black uppercase tracking-widest text-brand-primary mb-1">Your order is confirmed</p>
                          <h3 className="font-bold text-lg">{checkoutResult.paymentInstructions.title}</h3>
                          <p className="text-sm text-stone-600 mt-2">We have received your request. Our team will begin working on your design and contact you if needed.</p>
                          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                            <div className="rounded-2xl bg-white p-4">
                              <span className="block text-[10px] font-black uppercase tracking-widest text-stone-400">Order ID</span>
                              <span className="font-mono text-xs">{checkoutResult.orderId}</span>
                            </div>
                            <div className="rounded-2xl bg-white p-4">
                              <span className="block text-[10px] font-black uppercase tracking-widest text-stone-400">Exact amount</span>
                              <span className="font-bold">KSH {checkoutResult.amounts.total}</span>
                            </div>
                            <div className="rounded-2xl bg-white p-4">
                              <span className="block text-[10px] font-black uppercase tracking-widest text-stone-400">Status</span>
                              <span className="font-bold uppercase text-brand-primary">{checkoutResult.paymentStatus}</span>
                            </div>
                            <div className="rounded-2xl bg-white p-4">
                              <span className="block text-[10px] font-black uppercase tracking-widest text-stone-400">Next step</span>
                              <span className="font-bold">Complete {paymentMethod === 'mpesa' ? 'M-Pesa' : 'card'} payment</span>
                            </div>
                          </div>
                          <div className="mt-5 rounded-2xl bg-white p-4">
                            <p className="text-sm font-bold text-stone-900">Next steps</p>
                            <p className="mt-1 text-xs leading-relaxed text-stone-500">
                              After payment is confirmed, your order moves to processing. You can track every update from Activity.
                            </p>
                            <Link to="/orders" className="mt-4 inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-brand-primary">
                              Track in Activity <ArrowRight size={14} />
                            </Link>
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
                    {processingCheckout ? 'Creating your order...' : 'Confirm and pay'}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-[28px] p-5 border border-stone-100 shadow-sm md:rounded-[40px] md:p-8">
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

            <div className="bg-brand-primary text-brand-cream rounded-[28px] p-5 shadow-2xl lg:sticky lg:top-8 md:rounded-[40px] md:p-8">
              <h2 className="text-2xl font-serif mb-6 italic md:mb-8 md:text-3xl">Order Summary</h2>
              
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
                <CreditCard size={20} /> {checkoutStep === 'payment' ? 'Confirm and pay' : 'Proceed to checkout'}
              </button>
              
              <p className="text-[10px] text-white/40 mt-6 text-center italic">
                Your final total is confirmed before payment starts.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
