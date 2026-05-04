import { useState, useEffect } from 'react';
import { db, auth, query, collection, where, onSnapshot, OperationType, handleFirestoreError, updateDoc, doc, limit, serverTimestamp, addDoc } from '../lib/firebase';
import { Package, Clock, CheckCircle2, ChevronRight, XCircle, Filter, RefreshCw, ArrowRight, Truck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'react-hot-toast';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { assertProductExists, trackEvent } from '../lib/behavior';

interface Order {
  id: string;
  type: string;
  details: any;
  status: string;
  totalAmount?: number;
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
      setOrders([]);
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

  const handleCancelOrder = async (orderId: string) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;

    try {
      await updateDoc(doc(db, 'orders', orderId), {
        status: 'cancelled',
        updatedAt: new Date()
      });
      toast.success("Order cancelled");
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `orders/${orderId}`);
      toast.error("Failed to cancel order");
    }
  };

  const handleReturnOrder = async (orderId: string) => {
    if (!window.confirm("Are you sure you want to request a return for this order?")) return;

    try {
      await updateDoc(doc(db, 'orders', orderId), {
        status: 'Returned',
        updatedAt: new Date()
      });
      toast.success("Return request submitted");
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `orders/${orderId}`);
      toast.error("Failed to submit return request");
    }
  };

  const handleReorder = async (order: Order) => {
    if (!auth.currentUser) return;
    try {
      if (order.details.productId) {
        await assertProductExists(order.details.productId);
      }
      const cartItem = {
        userId: auth.currentUser.uid,
        productId: order.details.productId || "reorder",
        productName: order.details.productName || "Reordered Item",
        price: order.totalAmount || 0,
        image: order.details.image || "",
        quantity: order.details.quantity || 1,
        deliveryAddress: order.details.deliveryAddress || "",
        createdAt: serverTimestamp()
      };
      await addDoc(collection(db, 'cart'), cartItem);
      trackEvent({ eventType: 'cart', productId: cartItem.productId, metadata: { source: 'activity-reorder' } }).catch(() => undefined);
      toast.success("Added to cart for reorder!");
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
      case 'pending': return <Clock className="text-amber-500" size={18} />;
      case 'delivered': return <CheckCircle2 className="text-emerald-500" size={18} />;
      case 'cancelled': return <XCircle className="text-red-500" size={18} />;
      default: return <Package className="text-blue-500" size={18} />;
    }
  };

  if (authReady && !user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center">
        <h1 className="text-4xl mb-6">Sign in to view activity</h1>
        <p className="text-stone-500">Track confirmed intent, custom requests, and follow-up status here.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <div className="mb-12 flex flex-col gap-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-5xl md:text-6xl mb-4">Your <span className="italic font-light">Activity</span></h1>
            <p className="text-stone-500">Confirmed intent and custom request history. This is not a payment ledger.</p>
          </div>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400 w-16">Status</span>
              <div className="flex flex-wrap gap-2">
                {['All', 'Pending', 'Delivered', 'Cancelled', 'Shipped'].map(f => (
                  <button
                    key={f}
                    onClick={() => setStatusFilter(f)}
                    className={`px-4 py-1 rounded-full text-[10px] font-bold transition-all border ${statusFilter === f ? 'bg-brand-primary text-brand-cream border-brand-primary' : 'bg-transparent text-stone-500 border-stone-200 hover:border-brand-primary'}`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400 w-16">Type</span>
              <div className="flex flex-wrap gap-2">
                {['All', 'Furniture', 'Branding', 'Print', 'Jewelry'].map(f => (
                  <button
                    key={f}
                    onClick={() => setTypeFilter(f)}
                    className={`px-4 py-1 rounded-full text-[10px] font-bold transition-all border ${typeFilter === f ? 'bg-brand-primary text-brand-cream border-brand-primary' : 'bg-transparent text-stone-500 border-stone-200 hover:border-brand-primary'}`}
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
        <div className="bg-white rounded-[40px] p-24 text-center border border-brand-primary/5">
          <div className="w-20 h-20 rounded-full bg-stone-50 flex items-center justify-center mx-auto mb-6 text-stone-300">
            <Package size={40} />
          </div>
          <h3 className="text-2xl mb-2 font-serif">No {statusFilter !== 'All' ? statusFilter.toLowerCase() : ''} activity yet</h3>
          <p className="text-stone-400">Compare products or request a custom service to start building your activity trail.</p>
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
                className="bg-white rounded-[32px] p-8 border border-brand-primary/5 hover:shadow-xl hover:shadow-brand-primary/5 transition-all flex flex-col gap-8 cursor-pointer"
                onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}
              >
                <div className="flex flex-col md:flex-row gap-8 items-center">
                  <div className="w-20 h-20 rounded-2xl bg-brand-cream overflow-hidden flex items-center justify-center shrink-0">
                    {order.type === 'furniture' ? <Package className="text-brand-primary" size={32} /> : <CheckCircle2 className="text-brand-primary" size={32} />}
                  </div>
                  
                  <div className="flex-1 text-center md:text-left">
                    <div className="flex flex-wrap items-center gap-3 justify-center md:justify-start mb-2">
                      <span className="bg-brand-primary/5 text-brand-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">{order.type}</span>
                      <span className="text-stone-400 text-xs font-medium">#{order.id.slice(-6).toUpperCase()}</span>
                    </div>
                    <h3 className="text-xl font-bold text-stone-800">
                      {order.details.productName || order.details.serviceName || "Custom Project"}
                    </h3>
                    
                    {/* Enhanced Status Timeline */}
                    <div className="mt-8 mb-10 hidden sm:block">
                      <div className="relative flex justify-between">
                        {/* Timeline Line */}
                        <div className="absolute top-[15px] left-0 w-full h-[2px] bg-stone-100 z-0" />
                        <div 
                          className={`absolute top-[15px] left-0 h-[2px] z-0 transition-all duration-1000 ${
                            order.status === 'cancelled' ? 'bg-red-200' : 'bg-brand-primary'
                          }`} 
                          style={{ 
                            width: order.status === 'pending' ? '0%' : 
                                  order.status === 'processing' ? '33.3%' : 
                                  order.status === 'shipped' ? '66.6%' : 
                                  order.status === 'delivered' ? '100%' : '0%' 
                          }} 
                        />
                        
                        {[
                          { id: 'pending', label: 'Intent Captured', icon: Clock },
                          { id: 'processing', label: 'Follow-up Active', icon: RefreshCw },
                          { id: 'shipped', label: 'In Fulfillment', icon: Truck },
                          { id: 'delivered', label: 'Closed', icon: CheckCircle2 }
                        ].map((step, idx) => {
                          const steps = ['pending', 'processing', 'shipped', 'delivered'];
                          const currentIdx = steps.indexOf((order.status || '').toLowerCase());
                          const isCompleted = idx < currentIdx;
                          const isCurrent = idx === currentIdx;
                          const StepIcon = step.icon;
                          
                          return (
                            <div key={step.id} className="relative z-10 flex flex-col items-center">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-4 border-white transition-all duration-700 ${
                                order.status === 'cancelled' ? 'bg-stone-200 text-stone-400' :
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
                                    Current Stage
                                  </motion.span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <p className="text-stone-400 text-sm mt-1">
                      {order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Processing...'}
                    </p>
                  </div>

                  <div className="flex flex-col items-center md:items-end gap-3">
                    <div className="flex items-center gap-2 bg-stone-50 px-4 py-2 rounded-full border border-stone-100">
                      {getStatusIcon(order.status)}
                      <span className="font-bold text-sm uppercase tracking-widest text-stone-600">{order.status}</span>
                    </div>
                    {order.totalAmount && <span className="text-lg font-bold text-brand-primary">KSH {order.totalAmount}</span>}
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
                          <h4 className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-4">Activity Details</h4>
                          <div className="bg-stone-50 p-6 rounded-3xl space-y-4">
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium text-stone-600">{order.details.productName || order.details.serviceName}</span>
                              <span className="text-sm font-bold text-stone-900">x{order.details.quantity || 1}</span>
                            </div>
                            {order.details.selectedColor && (
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-stone-400 uppercase tracking-widest">Color:</span>
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: order.details.selectedColor }} />
                              </div>
                            )}
                            <div className="pt-4 border-t border-stone-100 flex justify-between">
                              <span className="text-sm font-bold">Total</span>
                              <span className="text-sm font-bold text-brand-primary">KSH {order.totalAmount}</span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-4">Delivery Information</h4>
                          <div className="bg-stone-50 p-6 rounded-3xl">
                            <p className="text-sm leading-relaxed text-stone-600">
                              {order.details.deliveryAddress || "Self collection at Maridadi Studio, Nairobi"}
                            </p>
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
                            {order.status === 'pending' && (
                              <button 
                                onClick={(e) => { e.stopPropagation(); handleCancelOrder(order.id); }}
                                className="flex-1 bg-red-50 text-red-500 py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-red-100 transition-all"
                              >
                                <XCircle size={18} /> Cancel Order
                              </button>
                            )}
                            <button 
                              onClick={(e) => { e.stopPropagation(); toast.success("Invoice download started..."); }}
                              className="px-6 py-4 rounded-2xl border border-stone-200 text-stone-400 font-bold text-sm hover:bg-stone-50 transition-all"
                            >
                              Download Invoice
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
