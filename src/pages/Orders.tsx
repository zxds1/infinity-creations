import { useState, useEffect } from 'react';
import { db, auth, query, collection, where, onSnapshot, OperationType, handleFirestoreError, serverTimestamp, addDoc } from '../lib/firebase';
import { Package, Clock, CheckCircle2, ChevronRight, XCircle, Filter, RefreshCw, ArrowRight, Truck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'react-hot-toast';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { assertProductExists, trackEvent } from '../lib/behavior';
import { DEMO_USER_ID, addDemoCartItem, getDemoOrders } from '../lib/demoMode';

interface Order {
  id: string;
  type: string;
  details: any;
  status: string;
  totalAmount?: number;
  amounts?: {
    currency: string;
    subtotal: number;
    deliveryFee: number;
    total: number;
  };
  paymentStatus?: string;
  fulfillmentStatus?: string;
  deliveryEstimate?: string;
  createdAt: any;
}

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, currentUser => {
      setUser(currentUser);
      setAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!authReady) return;
    if (!user) {
      setOrders(getDemoOrders<Order>());
      setLoading(false);
      return;
    }

    const q = query(collection(db, 'orders'), where('userId', '==', user.uid));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Order[];
      
      // Sort by createdAt manually if needed or via Firestore index
      ordersData.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      
      setOrders(ordersData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'orders');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [authReady, user]);

  const handleReorder = async (order: Order) => {
    try {
      const firstItem = order.details?.items?.[0];
      const productId = firstItem?.productId || order.details.productId;
      if (productId) {
        await assertProductExists(productId);
      }
      if (!auth.currentUser) {
        addDemoCartItem({
          userId: DEMO_USER_ID,
          productId,
          productName: firstItem?.productName || order.details.productName || "Reordered Item",
          price: firstItem?.unitPrice || order.totalAmount || 0,
          image: firstItem?.image || order.details.image || "",
          quantity: firstItem?.quantity || order.details.quantity || 1,
          deliveryAddress: order.details.deliveryAddress || order.details?.deliveryAddress || "",
          createdAt: new Date().toISOString()
        });
        toast.success("Added to your order.");
        return;
      }
      const cartItem = {
        userId: auth.currentUser.uid,
        productId,
        productName: firstItem?.productName || order.details.productName || "Reordered Item",
        price: firstItem?.unitPrice || order.totalAmount || 0,
        image: firstItem?.image || order.details.image || "",
        quantity: firstItem?.quantity || order.details.quantity || 1,
        deliveryAddress: order.details.deliveryAddress || order.details?.deliveryAddress || "",
        createdAt: serverTimestamp()
      };
      await addDoc(collection(db, 'cart'), cartItem);
      trackEvent({ eventType: 'cart', productId: cartItem.productId, metadata: { source: 'activity-reorder' } }).catch(() => undefined);
      toast.success("Added to your order.");
    } catch (err) {
      toast.error("Failed to reorder");
    }
  };

  const filteredOrders = orders.filter(o => {
    const matchesStatus = statusFilter === 'All' || o.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesType = typeFilter === 'All' || o.type.toLowerCase() === typeFilter.toLowerCase();
    return matchesStatus && matchesType;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending_payment': return <Clock className="text-amber-500" size={18} />;
      case 'paid': return <CheckCircle2 className="text-emerald-500" size={18} />;
      case 'payment_failed': return <XCircle className="text-red-500" size={18} />;
      case 'processing': return <RefreshCw className="text-blue-500" size={18} />;
      case 'shipped': return <Truck className="text-blue-500" size={18} />;
      case 'delivered': return <CheckCircle2 className="text-emerald-500" size={18} />;
      default: return <Package className="text-blue-500" size={18} />;
    }
  };

  const getOrderTitle = (order: Order) => {
    const items = order.details?.items;
    if (Array.isArray(items) && items.length > 0) {
      return items.length === 1 ? items[0].productName : `${items[0].productName} + ${items.length - 1} more`;
    }
    return order.details?.productName || order.details?.serviceName || "Custom order";
  };

  const getOrderTotal = (order: Order) => order.amounts?.total || order.totalAmount || 0;

  const getTimelineProgress = (status: string) => {
    switch ((status || '').toLowerCase()) {
      case 'pending_payment': return '0%';
      case 'paid': return '25%';
      case 'processing': return '50%';
      case 'shipped': return '75%';
      case 'delivered': return '100%';
      default: return '0%';
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-3 py-8 sm:px-4 md:py-16">
      <div className="mb-8 flex flex-col gap-6 md:mb-12 md:gap-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="mb-3 text-4xl leading-none md:mb-4 md:text-6xl">Your <span className="italic font-light">Activity</span></h1>
            <p className="text-stone-500">Track your orders, saved designs, and custom requests.</p>
          </div>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
              <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400 sm:w-16">Status</span>
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide sm:flex-wrap">
                {[
                  { label: 'All', value: 'All' },
                  { label: 'Order received', value: 'pending_payment' },
                  { label: 'Confirmed', value: 'Paid' },
                  { label: 'Design in progress', value: 'Processing' },
                  { label: 'Printing', value: 'Shipped' },
                  { label: 'Ready / Delivered', value: 'Delivered' },
                  { label: 'Payment issue', value: 'payment_failed' }
                ].map(f => (
                  <button
                    key={f.value}
                    onClick={() => setStatusFilter(f.value)}
                    className={`min-h-9 whitespace-nowrap px-4 py-1 rounded-full text-[10px] font-bold transition-all border ${statusFilter === f.value ? 'bg-brand-primary text-brand-cream border-brand-primary' : 'bg-transparent text-stone-500 border-stone-200 hover:border-brand-primary'}`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400 sm:w-16">Type</span>
              <div className="flex flex-wrap gap-2">
                {['All', 'Order'].map(f => (
                  <button
                    key={f}
                    onClick={() => setTypeFilter(f === 'Order' ? 'Checkout' : f)}
                    className={`px-4 py-1 rounded-full text-[10px] font-bold transition-all border ${(f === 'Order' ? typeFilter === 'Checkout' : typeFilter === f) ? 'bg-brand-primary text-brand-cream border-brand-primary' : 'bg-transparent text-stone-500 border-stone-200 hover:border-brand-primary'}`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-12 h-12 rounded-full border-2 border-brand-primary/10 border-t-brand-primary animate-spin" />
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white rounded-[32px] p-10 text-center border border-brand-primary/5 md:rounded-[40px] md:p-24">
          <div className="w-20 h-20 rounded-full bg-stone-50 flex items-center justify-center mx-auto mb-6 text-stone-300">
            <Package size={40} />
          </div>
          <h3 className="text-2xl mb-2 font-serif">Nothing here yet</h3>
          <p className="text-stone-400">Nothing here yet - start by exploring designs.</p>
        </div>
      ) : (
        <div className="space-y-6">
          <AnimatePresence>
            {filteredOrders.map((order, idx) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white rounded-[28px] p-5 border border-brand-primary/5 hover:shadow-xl hover:shadow-brand-primary/5 transition-all flex flex-col gap-6 cursor-pointer md:rounded-[32px] md:p-8 md:gap-8"
                onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}
              >
                <div className="flex flex-col gap-5 md:flex-row md:gap-8 md:items-center">
                  <div className="w-20 h-20 rounded-2xl bg-brand-cream overflow-hidden flex items-center justify-center shrink-0">
                    {order.type === 'furniture' ? <Package className="text-brand-primary" size={32} /> : <CheckCircle2 className="text-brand-primary" size={32} />}
                  </div>
                  
                  <div className="flex-1 text-center md:text-left">
                    <div className="flex flex-wrap items-center gap-3 justify-center md:justify-start mb-2">
                      <span className="bg-brand-primary/5 text-brand-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">{order.type}</span>
                      <span className="text-stone-400 text-xs font-medium">#{order.id.slice(-6).toUpperCase()}</span>
                    </div>
                    <h3 className="text-xl font-bold text-stone-800">
                      {getOrderTitle(order)}
                    </h3>
                    
                    {/* Status timeline */}
                    <div className="mt-8 mb-10 hidden sm:block">
                      <div className="relative flex justify-between">
                        {/* Timeline Line */}
                        <div className="absolute top-[15px] left-0 w-full h-[2px] bg-stone-100 z-0" />
                        <div 
                          className={`absolute top-[15px] left-0 h-[2px] z-0 transition-all duration-1000 ${
                            order.status === 'payment_failed' ? 'bg-red-200' : 'bg-brand-primary'
                          }`} 
                          style={{ width: getTimelineProgress(order.status) }}
                        />
                        
                        {[
                          { id: 'pending_payment', label: 'Order received', icon: Clock },
                          { id: 'paid', label: 'Confirmed', icon: CheckCircle2 },
                          { id: 'processing', label: 'Design in progress', icon: RefreshCw },
                          { id: 'shipped', label: 'Printing', icon: Truck },
                          { id: 'delivered', label: 'Ready / Delivered', icon: CheckCircle2 }
                        ].map((step, idx) => {
                          const steps = ['pending_payment', 'paid', 'processing', 'shipped', 'delivered'];
                          const currentIdx = steps.indexOf((order.status || '').toLowerCase());
                          const isCompleted = idx < currentIdx;
                          const isCurrent = idx === currentIdx;
                          const StepIcon = step.icon;
                          
                          return (
                            <div key={step.id} className="relative z-10 flex flex-col items-center">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-4 border-white transition-all duration-700 ${
                                order.status === 'payment_failed' ? 'bg-stone-200 text-stone-400' :
                                isCompleted || isCurrent ? 'bg-brand-primary text-brand-cream scale-110 shadow-lg shadow-brand-primary/20' : 'bg-stone-100 text-stone-300'
                              }`}>
                                {isCompleted ? <CheckCircle2 size={14} /> : <StepIcon size={14} className={isCurrent ? 'animate-pulse' : ''} />}
                              </div>
                              <div className="mt-3 text-center">
                                <p className={`text-[9px] font-bold uppercase tracking-widest transition-colors ${isCurrent ? 'text-brand-primary' : 'text-stone-400'}`}>
                                  {step.label}
                                </p>
                                {isCurrent && (
                                  <motion.span 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-[7px] text-brand-primary/60 font-black uppercase tracking-tighter"
                                  >
                                    Current step
                                  </motion.span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <p className="text-stone-400 text-sm mt-1">
                      {order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Preparing your options...'}
                    </p>
                  </div>

                  <div className="flex flex-col items-center md:items-end gap-3">
                    <div className="flex items-center gap-2 bg-stone-50 px-4 py-2 rounded-full border border-stone-100">
                      {getStatusIcon(order.status)}
                      <span className="font-bold text-sm uppercase tracking-widest text-stone-600">{order.status}</span>
                    </div>
                    {getOrderTotal(order) > 0 && <span className="text-lg font-bold text-brand-primary">KSH {getOrderTotal(order)}</span>}
                  </div>

                  <div className={`p-4 rounded-full hover:bg-stone-50 transition-all text-stone-300 ${expandedOrderId === order.id ? 'rotate-90' : ''}`}>
                    <ChevronRight size={24} />
                  </div>
                </div>

                <AnimatePresence>
                  {expandedOrderId === order.id && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden border-t border-stone-50 pt-8"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                          <h4 className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-4">Order Details</h4>
                          <div className="bg-stone-50 p-6 rounded-3xl space-y-4">
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium text-stone-600">{getOrderTitle(order)}</span>
                              <span className="text-sm font-bold text-stone-900">x{order.details?.items?.length || order.details?.quantity || 1}</span>
                            </div>
                            {order.details.selectedColor && (
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-stone-400 uppercase tracking-widest">Color:</span>
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: order.details.selectedColor }} />
                              </div>
                            )}
                            <div className="pt-4 border-t border-stone-100 flex justify-between">
                              <span className="text-sm font-bold">Total</span>
                              <span className="text-sm font-bold text-brand-primary">KSH {getOrderTotal(order)}</span>
                            </div>
                            <div className="pt-4 border-t border-stone-100 flex justify-between">
                              <span className="text-sm font-bold">Payment</span>
                              <span className="text-sm font-bold uppercase text-stone-500">{order.paymentStatus || order.status}</span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-4">Delivery Information</h4>
                          <div className="bg-stone-50 p-6 rounded-3xl">
                            <p className="text-sm leading-relaxed text-stone-600">
                              {order.details.deliveryAddress || "Self collection at Infinity Studio, Nairobi"}
                            </p>
                            {order.deliveryEstimate && (
                              <p className="mt-4 text-xs font-bold uppercase tracking-widest text-brand-primary">{order.deliveryEstimate}</p>
                            )}
                          </div>

                          <div className="mt-8 flex gap-4">
                            {order.status === 'delivered' && (
                              <button 
                                onClick={(e) => { e.stopPropagation(); handleReorder(order); }}
                                className="flex-1 bg-brand-primary text-brand-cream py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:shadow-lg transition-all"
                              >
                                <RefreshCw size={18} /> Reorder Now
                              </button>
                            )}
                            <button 
                              onClick={(e) => { e.stopPropagation(); toast.success("Support request noted"); }}
                              className="px-6 py-4 rounded-2xl border border-stone-200 text-stone-400 font-bold text-sm hover:bg-stone-50 transition-all"
                            >
                              Contact Support
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
