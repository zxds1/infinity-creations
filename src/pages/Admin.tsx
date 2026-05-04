import { useState, useEffect } from 'react';
import { db, auth, collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from '../lib/firebase';
import { Package, ShoppingBag, Paintbrush, Plus, Trash2, Edit3, Settings, CheckCircle2, Truck, XCircle, Clock, Sparkles, TrendingUp, Users, DollarSign, RefreshCw, Bike, Zap, Home, Camera, Heart, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'react-hot-toast';
import { generateAdminInsights } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';

export default function Admin() {
  const [activeTab, setActiveTab] = useState<'orders' | 'catalog' | 'services' | 'categories' | 'insights'>('orders');
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiInsights, setAiInsights] = useState<string>("");
  const [generatingInsights, setGeneratingInsights] = useState(false);

  // Form states
  const [newProduct, setNewProduct] = useState({ 
    name: '', 
    price: 0, 
    category: 'Furniture', 
    image: '', 
    description: '', 
    variations: [] as any[],
    stockQuantity: 0,
    tags: ''
  });
  const [variationInput, setVariationInput] = useState({ name: '', image: '', price: 0 });
  const [newService, setNewService] = useState({ title: '', description: '', icon: '', image: '', priceRange: '', order: 0 });
  const [newCategory, setNewCategory] = useState({ name: '', slug: '', order: 0 });
  
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  
  const generateInsights = async () => {
    if (orders.length === 0 && products.length === 0) {
      toast.error("Not enough data to generate strategy");
      return;
    }
    setGeneratingInsights(true);
    try {
      const insights = await generateAdminInsights(orders, products);
      setAiInsights(insights);
      setActiveTab('insights');
      toast.success("Strategic insights generated");
    } catch (err) {
      toast.error("Failed to generate AI strategy");
    } finally {
      setGeneratingInsights(false);
    }
  };

  useEffect(() => {
    // Auth bypass for client testing
    const fetchData = async () => {
      setLoading(true);
      try {
        const orderSnap = await getDocs(query(collection(db, 'orders'), orderBy('createdAt', 'desc')));
        setOrders(orderSnap.docs.map(d => ({ id: d.id, ...d.data() })));

        const productSnap = await getDocs(collection(db, 'products'));
        setProducts(productSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        
        const serviceSnap = await getDocs(collection(db, 'services'));
        setServices(serviceSnap.docs.map(d => ({ id: d.id, ...d.data() })));

        const categorySnap = await getDocs(query(collection(db, 'categories'), orderBy('order', 'asc')));
        setCategories(categorySnap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (err) {
        toast.error("Failed to fetch admin data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const updateOrderStatus = async (orderId: string, status: string, trackingNumber?: string) => {
    try {
      const updateData: any = { status };
      if (trackingNumber) updateData.trackingNumber = trackingNumber;
      await updateDoc(doc(db, 'orders', orderId), updateData);
      setOrders(orders.map(o => o.id === orderId ? { ...o, ...updateData } : o));
      toast.success(`Order status updated to ${status}`);
    } catch (err) {
      toast.error("Update failed");
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, target: 'product' | 'variation' | 'service') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      if (target === 'product') {
        setNewProduct(prev => ({ ...prev, image: base64 }));
      } else if (target === 'variation') {
        setVariationInput(prev => ({ ...prev, image: base64 }));
      } else if (target === 'service') {
        setNewService(prev => ({ ...prev, image: base64 }));
      }
      toast.success("Image uploaded successfully");
    };
    reader.readAsDataURL(file);
  };

  const addVariation = () => {
    if (!variationInput.name || !variationInput.image) {
      toast.error("Variation name and image required");
      return;
    }
    setNewProduct({
      ...newProduct,
      variations: [...newProduct.variations, variationInput]
    });
    setVariationInput({ name: '', image: '', price: newProduct.price });
  };

  const addProduct = async () => {
    try {
      const productToSave = {
        ...newProduct,
        tags: newProduct.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== ""),
        createdAt: new Date(),
        stockQuantity: Number(newProduct.stockQuantity)
      };
      const docRef = await addDoc(collection(db, 'products'), productToSave);
      setProducts([...products, { id: docRef.id, ...productToSave }]);
      toast.success("Product added to catalog");
      setNewProduct({ 
        name: '', 
        price: 0, 
        category: 'Furniture', 
        image: '', 
        description: '', 
        variations: [],
        stockQuantity: 0,
        tags: ''
      });
    } catch (err) {
      toast.error("Failed to add product");
    }
  };

  const popularIcons = ['Truck', 'Bike', 'Paintbrush', 'ShoppingBag', 'Zap', 'Home', 'Camera', 'Package', 'Clock', 'Settings', 'Heart', 'Star'];

  const addService = async () => {
    try {
      if (editingServiceId) {
        await updateDoc(doc(db, 'services', editingServiceId), newService);
        setServices(services.map(s => s.id === editingServiceId ? { id: editingServiceId, ...newService } : s));
        toast.success("Service updated");
        setEditingServiceId(null);
      } else {
        const docRef = await addDoc(collection(db, 'services'), newService);
        setServices([...services, { id: docRef.id, ...newService }]);
        toast.success("Service added");
      }
      setNewService({ title: '', description: '', icon: '', image: '', priceRange: '', order: services.length });
    } catch (err) {
      toast.error("Failed to add service");
    }
  };

  const addCategory = async () => {
    try {
      if (editingCategoryId) {
        await updateDoc(doc(db, 'categories', editingCategoryId), newCategory);
        setCategories(categories.map(c => c.id === editingCategoryId ? { id: editingCategoryId, ...newCategory } : c));
        toast.success("Category updated");
        setEditingCategoryId(null);
      } else {
        const docRef = await addDoc(collection(db, 'categories'), newCategory);
        setCategories([...categories, { id: docRef.id, ...newCategory }]);
        toast.success("Category added");
      }
      setNewCategory({ name: '', slug: '', order: categories.length });
    } catch (err) {
      toast.error("Failed to add category");
    }
  };

  if (false) { // Auth bypass for client testing
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
        <XCircle size={64} className="text-red-400 mb-6" />
        <h1 className="text-4xl font-serif mb-4">Access Denied</h1>
        <p className="text-stone-500">Only authorized creators can access the Maridadi command center.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-stone-50/50 min-h-screen">
      {/* Control Center Dashboard Header */}
      <div className="bg-white border-b border-stone-100 px-4 md:px-8 py-8 md:py-12 mb-8 shadow-sm">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
            <div>
              <div className="flex items-center gap-2 text-brand-primary font-bold uppercase tracking-[0.2em] text-[10px] mb-2">
                <Settings size={14} className="animate-spin-slow" />
                Maridadi Command Center
              </div>
              <h1 className="text-4xl md:text-5xl font-serif italic font-light leading-tight">
                Business <span className="not-italic font-bold">Logistics</span>
              </h1>
            </div>
            <button 
              onClick={generateInsights}
              disabled={generatingInsights}
              className="flex items-center gap-3 bg-stone-900 text-brand-cream px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-brand-primary transition-all shadow-xl shadow-stone-900/10 disabled:opacity-50"
            >
              {generatingInsights ? (
                <RefreshCw size={14} className="animate-spin" />
              ) : (
                <Sparkles size={14} />
              )}
              {generatingInsights ? 'Analyzing...' : 'Generate AI Strategy'}
            </button>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Revenue', value: 'KSH 124K', sub: 'Last 30 days', icon: DollarSign },
              { label: 'Orders', value: orders.length, sub: 'All time', icon: Package },
              { label: 'Creators', value: '4', sub: 'Active', icon: Users },
              { label: 'Growth', value: '+12%', sub: 'Vs last mo', icon: TrendingUp }
            ].map((stat, i) => (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                key={stat.label} 
                className="bg-stone-50 border border-stone-100 p-5 rounded-3xl"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2.5 rounded-xl bg-white border border-stone-100 text-stone-400">
                    <stat.icon size={18} />
                  </div>
                  <span className="text-[10px] font-black tracking-widest text-emerald-500 font-mono">LIVE</span>
                </div>
                <div className="text-xl md:text-2xl font-bold text-stone-900 mb-1">{stat.value}</div>
                <div className="text-[10px] text-stone-400 uppercase tracking-widest font-bold">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 lg:px-8 pb-24">
        {/* Tab Selection Redesign */}
        <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide mb-8">
          {[
            { id: 'orders', icon: Clock, label: 'Orders' },
            { id: 'catalog', icon: ShoppingBag, label: 'Catalog' },
            { id: 'services', icon: Paintbrush, label: 'Services' },
            { id: 'categories', icon: Settings, label: 'Shop' },
            { id: 'insights', icon: Sparkles, label: 'Insights' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-3 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap shadow-sm ${activeTab === tab.id ? 'bg-stone-900 text-brand-cream border-stone-900' : 'bg-white text-stone-400 border border-stone-100 hover:bg-stone-50'}`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'orders' && (
          <motion.div key="orders" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            {/* Desktop Table View */}
            <div className="hidden lg:block bg-white rounded-3xl border border-stone-100 overflow-hidden shadow-sm">
              <table className="w-full text-left">
                <thead className="bg-stone-50 text-stone-400 uppercase text-[10px] tracking-widest font-bold">
                  <tr>
                    <th className="px-8 py-6">Order ID</th>
                    <th className="px-8 py-6">Project</th>
                    <th className="px-8 py-6">Customer</th>
                    <th className="px-8 py-6">Status</th>
                    <th className="px-8 py-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-50">
                  {orders.map(order => (
                    <tr key={order.id} className="hover:bg-stone-50/50 transition-colors">
                      <td className="px-8 py-6">
                        <span className="font-mono text-xs text-stone-400">#{order.id.slice(-6).toUpperCase()}</span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col">
                          <span className="font-bold text-stone-900">{order.details?.productName || order.details?.serviceName || "Custom Request"}</span>
                          <span className="text-[10px] text-stone-400 uppercase tracking-widest">{order.type}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="text-sm text-stone-600">{order.userId.slice(0, 8)}...</span>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                          order.status === 'pending' ? 'bg-amber-50 text-amber-600' :
                          order.status === 'delivered' ? 'bg-emerald-50 text-emerald-600' :
                          'bg-stone-100 text-stone-500'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-wrap justify-end gap-2">
                          <button onClick={() => updateOrderStatus(order.id, 'processing')} className="p-2 rounded-lg bg-stone-100 text-stone-400 hover:text-stone-900" title="Process"><Edit3 size={16} /></button>
                          <button 
                            onClick={() => {
                              const tracking = window.prompt("Enter Tracking Number:");
                              if (tracking) updateOrderStatus(order.id, 'shipped', tracking);
                            }} 
                            className="p-2 rounded-lg bg-blue-50 text-blue-400 hover:text-blue-900" title="Ship"
                          >
                            <Truck size={16} />
                          </button>
                          <button onClick={() => updateOrderStatus(order.id, 'delivered')} className="p-2 rounded-lg bg-emerald-50 text-emerald-400 hover:text-emerald-900" title="Complete"><CheckCircle2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden space-y-4">
              {orders.map(order => (
                <div key={order.id} className="bg-white p-6 rounded-[32px] border border-stone-100 shadow-sm space-y-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-mono text-[10px] text-stone-400 uppercase tracking-widest">#{order.id.slice(-6).toUpperCase()}</span>
                      <h4 className="font-bold text-lg text-stone-900 mt-1">{order.details?.productName || order.details?.serviceName || "Custom Request"}</h4>
                      <p className="text-[10px] text-stone-400 uppercase tracking-widest mt-1 font-black">{order.type}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      order.status === 'pending' ? 'bg-amber-50 text-amber-600' :
                      order.status === 'delivered' ? 'bg-emerald-50 text-emerald-600' :
                      'bg-stone-100 text-stone-500'
                    }`}>
                      {order.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 py-4 border-y border-stone-50">
                    <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center">
                      <Users size={12} className="text-stone-400" />
                    </div>
                    <div className="text-xs text-stone-500">Customer ID: <span className="font-mono">{order.userId.slice(0, 8)}...</span></div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <button onClick={() => updateOrderStatus(order.id, 'processing')} className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-stone-50 text-stone-400 hover:bg-stone-900 hover:text-white transition-all">
                      <Edit3 size={16} />
                      <span className="text-[8px] font-black uppercase tracking-widest">Process</span>
                    </button>
                    <button 
                      onClick={() => {
                        const tracking = window.prompt("Enter Tracking Number:");
                        if (tracking) updateOrderStatus(order.id, 'shipped', tracking);
                      }}
                      className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-stone-50 text-stone-400 hover:bg-blue-500 hover:text-white transition-all shadow-sm"
                    >
                      <Truck size={16} />
                      <span className="text-[8px] font-black uppercase tracking-widest">Ship</span>
                    </button>
                    <button onClick={() => updateOrderStatus(order.id, 'delivered')} className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-stone-50 text-stone-400 hover:bg-emerald-500 hover:text-white transition-all">
                      <CheckCircle2 size={16} />
                      <span className="text-[8px] font-black uppercase tracking-widest">Done</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'catalog' && (
          <motion.div key="catalog" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8">
            <div className="bg-white p-8 rounded-3xl border border-stone-100 shadow-sm">
              <h3 className="text-xl font-serif mb-6">Add New Product</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <input type="text" placeholder="Product Name" className="p-4 rounded-xl border border-stone-100 focus:outline-brand-primary" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} />
                <input type="number" placeholder="Price (KSH)" className="p-4 rounded-xl border border-stone-100 focus:outline-brand-primary" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: Number(e.target.value)})} />
                <select className="p-4 rounded-xl border border-stone-100 focus:outline-brand-primary" value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})}>
                  {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                  {categories.length === 0 && (
                    <>
                      <option>Furniture</option>
                      <option>Photography</option>
                      <option>Jewelry</option>
                      <option>Art Mounts</option>
                    </>
                  )}
                </select>
                <input type="number" placeholder="Stock Qty" className="p-4 rounded-xl border border-stone-100 focus:outline-brand-primary" value={newProduct.stockQuantity} onChange={e => setNewProduct({...newProduct, stockQuantity: Number(e.target.value)})} />
                <input type="text" placeholder="Tags (comma separated)" className="p-4 rounded-xl border border-stone-100 focus:outline-brand-primary" value={newProduct.tags} onChange={e => setNewProduct({...newProduct, tags: e.target.value})} />
                <div className="md:col-span-1 flex flex-col gap-2">
                  <input type="text" placeholder="Stock Image URL" className="p-4 rounded-xl border border-stone-100 focus:outline-brand-primary" value={newProduct.image} onChange={e => setNewProduct({...newProduct, image: e.target.value})} />
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-stone-400 font-bold uppercase tracking-widest whitespace-nowrap">Or Local File:</span>
                    <input type="file" className="text-[10px] text-stone-400" accept="image/*" onChange={e => handleFileUpload(e, 'product')} />
                  </div>
                </div>
                <textarea placeholder="Description" className="p-4 rounded-xl border border-stone-100 focus:outline-brand-primary md:col-span-3" value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} />
                
                {/* Variation Management UI */}
                <div className="md:col-span-4 bg-stone-50/50 p-6 rounded-3xl border border-stone-100 mt-4">
                  <h4 className="text-sm font-bold uppercase tracking-widest text-stone-400 mb-6 flex items-center gap-2">
                    <Paintbrush size={16} /> Color Variations
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <input type="text" placeholder="Variation Name (e.g. Oak)" className="p-3 bg-white rounded-xl border border-stone-100 text-sm" value={variationInput.name} onChange={e => setVariationInput({...variationInput, name: e.target.value})} />
                    <input type="number" placeholder="Var. Price (KSH)" className="p-3 bg-white rounded-xl border border-stone-100 text-sm" value={variationInput.price} onChange={e => setVariationInput({...variationInput, price: Number(e.target.value)})} />
                    <div className="flex flex-col gap-1">
                      <input type="text" placeholder="Var. Image URL" className="p-3 bg-white rounded-xl border border-stone-100 text-sm" value={variationInput.image} onChange={e => setVariationInput({...variationInput, image: e.target.value})} />
                      <input type="file" className="text-[8px] text-stone-400" accept="image/*" onChange={e => handleFileUpload(e, 'variation')} />
                    </div>
                    <button onClick={addVariation} className="bg-stone-900 text-white p-3 rounded-xl font-bold text-sm tracking-widest uppercase hover:bg-brand-primary transition-all">
                      Add Variation
                    </button>
                  </div>

                  {newProduct.variations.length > 0 && (
                    <div className="flex flex-wrap gap-4">
                      {newProduct.variations.map((v, idx) => (
                        <div key={idx} className="relative group bg-white p-2 rounded-2xl border border-stone-100 flex items-center gap-3">
                          <img src={v.image} className="w-12 h-12 rounded-xl object-cover" />
                          <div className="pr-4">
                            <p className="text-xs font-bold">{v.name}</p>
                            <p className="text-[10px] text-brand-primary font-mono">KSH {v.price}</p>
                          </div>
                          <button 
                            onClick={() => setNewProduct({ ...newProduct, variations: newProduct.variations.filter((_, i) => i !== idx) })}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="md:col-span-4 grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                  {[
                    { name: 'Furniture', url: 'https://images.unsplash.com/photo-1592078615290-033ee584e267' },
                    { name: 'Jewelry', url: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338' },
                    { name: 'Photography', url: 'https://images.unsplash.com/photo-1554048612-b6a482bc67e5' },
                    { name: 'Art Mounts', url: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5' }
                  ].map(preset => (
                    <button 
                      key={preset.name}
                      onClick={() => setNewProduct({...newProduct, image: preset.url, category: preset.name})}
                      className="flex items-center gap-2 p-3 bg-stone-50 rounded-xl hover:bg-stone-100 transition-all border border-stone-100 text-left"
                    >
                      <img src={preset.url} className="w-8 h-8 rounded-lg object-cover" />
                      <span className="text-[10px] font-black uppercase tracking-widest">{preset.name}</span>
                    </button>
                  ))}
                </div>
                <button onClick={addProduct} className="bg-brand-primary text-brand-cream p-4 rounded-xl font-bold flex items-center justify-center gap-2 md:col-span-4">
                  <Plus size={20} /> Add to Catalog
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {products.map(product => (
                <div key={product.id} className="bg-white rounded-[32px] border border-stone-100 shadow-sm overflow-hidden group">
                   <div className="aspect-square bg-stone-100 relative">
                     <img src={product.image || "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5"} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                     <div className="absolute top-4 right-4 bg-white/90 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">{product.category}</div>
                   </div>
                   <div className="p-6">
                     <div className="flex justify-between items-start mb-1">
                       <h4 className="font-bold text-lg">{product.name}</h4>
                       <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${product.stockQuantity > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                         {product.stockQuantity > 0 ? `${product.stockQuantity} in stock` : 'Out of stock'}
                       </span>
                     </div>
                     <p className="text-brand-primary font-mono text-sm mb-3">KSH {product.price}</p>
                     
                     {product.tags && product.tags.length > 0 && (
                       <div className="flex flex-wrap gap-1 mb-4">
                         {Array.isArray(product.tags) && product.tags.map((tag: string, i: number) => (
                           <span key={i} className="text-[8px] font-bold text-stone-400 border border-stone-100 px-1.5 py-0.5 rounded-md">#{tag}</span>
                         ))}
                       </div>
                     )}

                     <div className="flex gap-2">
                       <button className="flex-1 bg-stone-50 text-stone-400 py-3 rounded-xl hover:bg-stone-100 transition-colors"><Edit3 size={18} className="mx-auto" /></button>
                       <button onClick={async () => {
                         if(window.confirm("Delete this product?")) {
                           await deleteDoc(doc(db, 'products', product.id));
                           setProducts(products.filter(p => p.id !== product.id));
                         }
                       }} className="flex-1 bg-red-50 text-red-400 py-3 rounded-xl hover:bg-red-100 transition-colors"><Trash2 size={18} className="mx-auto" /></button>
                     </div>
                   </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
        {activeTab === 'services' && (
          <motion.div key="services" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8">
            <div className="bg-white p-8 rounded-3xl border border-stone-100 shadow-sm transition-all duration-500">
              <h3 className="text-xl font-serif mb-6">{editingServiceId ? 'Edit Service' : 'Add New Service'}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <input type="text" placeholder="Service Title" className="p-4 rounded-xl border border-stone-100 focus:outline-brand-primary" value={newService.title} onChange={e => setNewService({...newService, title: e.target.value})} />
                <input type="text" placeholder="Price Range" className="p-4 rounded-xl border border-stone-100 focus:outline-brand-primary" value={newService.priceRange} onChange={e => setNewService({...newService, priceRange: e.target.value})} />
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] text-stone-400 font-bold uppercase tracking-widest pl-2">Select Icon</span>
                  <div className="flex flex-wrap gap-2 p-3 bg-stone-50 rounded-xl border border-stone-100 max-h-[120px] overflow-y-auto">
                    {popularIcons.map(iconName => (
                      <button 
                        key={iconName}
                        onClick={() => setNewService({...newService, icon: iconName})}
                        className={`p-2 rounded-lg transition-all ${newService.icon === iconName ? 'bg-brand-primary text-white scale-110 shadow-md' : 'bg-white text-stone-400 hover:text-stone-900 border border-stone-100'}`}
                        title={iconName}
                      >
                        {iconName === 'Truck' && <Truck size={16} />}
                        {iconName === 'Bike' && <Bike size={16} />}
                        {iconName === 'Paintbrush' && <Paintbrush size={16} />}
                        {iconName === 'ShoppingBag' && <ShoppingBag size={16} />}
                        {iconName === 'Zap' && <Zap size={16} />}
                        {iconName === 'Home' && <Home size={16} />}
                        {iconName === 'Camera' && <Camera size={16} />}
                        {iconName === 'Package' && <Package size={16} />}
                        {iconName === 'Clock' && <Clock size={16} />}
                        {iconName === 'Settings' && <Settings size={16} />}
                        {iconName === 'Heart' && <Heart size={16} />}
                        {iconName === 'Star' && <Star size={16} />}
                        {!['Truck', 'Bike', 'Paintbrush', 'ShoppingBag', 'Zap', 'Home', 'Camera', 'Package', 'Clock', 'Settings', 'Heart', 'Star'].includes(iconName) && <Plus size={16} />}
                      </button>
                    ))}
                  </div>
                </div>
                <textarea placeholder="Description" className="p-4 rounded-xl border border-stone-100 focus:outline-brand-primary md:col-span-2" value={newService.description} onChange={e => setNewService({...newService, description: e.target.value})} />
                <div className="flex gap-4">
                  <button 
                    onClick={addService} 
                    className={`flex-1 ${editingServiceId ? 'bg-amber-500 text-white' : 'bg-brand-primary text-brand-cream'} p-4 rounded-xl font-bold flex items-center justify-center gap-2`}
                  >
                    {editingServiceId ? <CheckCircle2 size={20} /> : <Plus size={20} />}
                    {editingServiceId ? 'Update Service' : 'Add Service'}
                  </button>
                  {editingServiceId && (
                    <button 
                      onClick={() => { setEditingServiceId(null); setNewService({ title: '', description: '', icon: '', image: '', priceRange: '', order: 0 }); }}
                      className="px-6 rounded-xl border border-stone-200 text-stone-400 font-bold"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {services.map(s => (
                <div key={s.id} className="bg-white p-6 rounded-3xl border border-stone-100 shadow-sm group">
                   <div className="flex items-center gap-3 mb-3">
                     <div className="p-2 rounded-xl bg-stone-50 text-brand-primary">
                       {s.icon === 'Truck' && <Truck size={20} />}
                       {s.icon === 'Bike' && <Bike size={20} />}
                       {s.icon === 'Paintbrush' && <Paintbrush size={20} />}
                       {s.icon === 'ShoppingBag' && <ShoppingBag size={20} />}
                       {s.icon === 'Zap' && <Zap size={20} />}
                       {s.icon === 'Home' && <Home size={20} />}
                       {s.icon === 'Camera' && <Camera size={20} />}
                       {s.icon === 'Package' && <Package size={20} />}
                       {s.icon === 'Clock' && <Clock size={20} />}
                       {s.icon === 'Settings' && <Settings size={20} />}
                       {s.icon === 'Heart' && <Heart size={20} />}
                       {s.icon === 'Star' && <Star size={20} />}
                       {!['Truck', 'Bike', 'Paintbrush', 'ShoppingBag', 'Zap', 'Home', 'Camera', 'Package', 'Clock', 'Settings', 'Heart', 'Star'].includes(s.icon) && <Settings size={20} />}
                     </div>
                     <h4 className="font-bold text-lg">{s.title}</h4>
                   </div>
                   <p className="text-stone-400 text-sm mb-4 line-clamp-2">{s.description}</p>
                   <div className="flex gap-2">
                     <button 
                        onClick={() => {
                          setEditingServiceId(s.id);
                          setNewService({ title: s.title, description: s.description, icon: s.icon, image: s.image || '', priceRange: s.priceRange || '', order: s.order });
                        }}
                        className="flex-1 bg-stone-50 text-stone-400 py-3 rounded-xl hover:bg-stone-100 transition-colors"
                      >
                        <Edit3 size={18} className="mx-auto" />
                      </button>
                     <button onClick={async () => {
                       if (window.confirm("Delete this service?")) {
                         await deleteDoc(doc(db, 'services', s.id));
                         setServices(services.filter(x => x.id !== s.id));
                       }
                     }} className="flex-1 bg-red-50 text-red-400 py-3 rounded-xl hover:bg-red-100 transition-colors"><Trash2 size={18} className="mx-auto" /></button>
                   </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'categories' && (
          <motion.div key="categories" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8">
            <div className="bg-white p-8 rounded-3xl border border-stone-100 shadow-sm transition-all duration-500">
              <h3 className="text-xl font-serif mb-6">{editingCategoryId ? 'Edit Category' : 'Add Shop Category'}</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <input type="text" placeholder="Category Name" className="p-4 rounded-xl border border-stone-100 focus:outline-brand-primary" value={newCategory.name} onChange={e => setNewCategory({...newCategory, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-')})} />
                <input type="number" placeholder="Order" className="p-4 rounded-xl border border-stone-100 focus:outline-brand-primary" value={newCategory.order} onChange={e => setNewCategory({...newCategory, order: Number(e.target.value)})} />
                <div className="flex gap-4">
                  <button 
                    onClick={addCategory} 
                    className={`flex-1 ${editingCategoryId ? 'bg-amber-500 text-white' : 'bg-brand-primary text-brand-cream'} p-4 rounded-xl font-bold flex items-center justify-center gap-2`}
                  >
                    {editingCategoryId ? <CheckCircle2 size={20} /> : <Plus size={20} />}
                    {editingCategoryId ? 'Update Category' : 'Add Category'}
                  </button>
                  {editingCategoryId && (
                    <button 
                      onClick={() => { setEditingCategoryId(null); setNewCategory({ name: '', slug: '', order: 0 }); }}
                      className="px-6 rounded-xl border border-stone-200 text-stone-400 font-bold"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {categories.map(c => (
                <div key={c.id} className="bg-white p-6 rounded-3xl border border-stone-100 shadow-sm flex flex-col gap-4">
                   <div className="flex justify-between items-center">
                     <div>
                       <h4 className="font-bold">{c.name}</h4>
                       <p className="text-[10px] text-stone-400 uppercase tracking-widest">{c.slug}</p>
                     </div>
                   </div>
                   <div className="flex gap-2">
                     <button 
                        onClick={() => {
                          setEditingCategoryId(c.id);
                          setNewCategory({ name: c.name, slug: c.slug, order: c.order });
                        }}
                        className="flex-1 p-2 bg-stone-50 text-stone-400 rounded-lg hover:bg-stone-100"
                      >
                        <Edit3 size={16} className="mx-auto" />
                      </button>
                     <button onClick={async () => {
                       if (window.confirm("Delete this category?")) {
                         await deleteDoc(doc(db, 'categories', c.id));
                         setCategories(categories.filter(x => x.id !== c.id));
                       }
                     }} className="flex-1 p-2 bg-red-50 text-red-400 rounded-lg hover:bg-red-100"><Trash2 size={16} className="mx-auto" /></button>
                   </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'insights' && (
          <motion.div key="insights" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8">
             <div className="bg-white p-6 md:p-10 rounded-[40px] border border-stone-100 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl opacity-50" />
                
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 border-b border-stone-50 pb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-stone-900 flex items-center justify-center text-brand-cream">
                      <Sparkles size={24} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-serif">Strategy <span className="italic">Analysis</span></h3>
                      <p className="text-xs text-stone-400 uppercase tracking-widest">Powered by Gemini Creative Intelligence</p>
                    </div>
                  </div>
                  <button 
                    onClick={generateInsights}
                    disabled={generatingInsights}
                    className="bg-stone-50 text-stone-600 px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-stone-100 transition-all flex items-center gap-2"
                  >
                    <RefreshCw size={14} className={generatingInsights ? 'animate-spin' : ''} />
                    Recalculate
                  </button>
                </div>

                {aiInsights ? (
                  <div className="prose prose-stone max-w-none prose-p:leading-relaxed prose-h1:font-serif prose-h2:font-serif prose-h3:font-serif prose-p:text-stone-600">
                    <ReactMarkdown>{aiInsights}</ReactMarkdown>
                  </div>
                ) : (
                  <div className="py-24 text-center">
                    <Sparkles size={48} className="mx-auto text-stone-200 mb-6 animate-pulse" />
                    <h4 className="text-xl font-serif text-stone-400">Ready for growth?</h4>
                    <p className="text-stone-300 max-w-md mx-auto mt-2 text-sm leading-relaxed">Generate a custom business strategy based on your current catalog performance and artisanal trends.</p>
                    <button 
                      onClick={generateInsights}
                      className="mt-8 bg-stone-900 text-white px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-brand-primary transition-all shadow-xl shadow-stone-900/10"
                    >
                      Initialize Analysis
                    </button>
                  </div>
                )}
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="bg-white p-8 rounded-[32px] border border-stone-100 shadow-sm">
                 <h4 className="text-sm font-bold uppercase tracking-widest text-brand-primary mb-6">Market Trends</h4>
                 <div className="space-y-4">
                   {['Modern Tribalism', 'Teak Sustainability', 'Minimalist Portraits'].map(trend => (
                     <div key={trend} className="flex justify-between items-center p-4 bg-stone-50 rounded-2xl">
                       <span className="font-bold text-stone-700 text-sm">{trend}</span>
                       <span className="text-[10px] bg-emerald-100 text-emerald-600 px-2 py-1 rounded-full font-black uppercase tracking-widest">Rising</span>
                     </div>
                   ))}
                 </div>
               </div>
               <div className="bg-white p-8 rounded-[32px] border border-stone-100 shadow-sm">
                 <h4 className="text-sm font-bold uppercase tracking-widest text-stone-400 mb-6 font-mono">System Health</h4>
                 <div className="flex flex-col items-center justify-center py-4">
                   <div className="w-24 h-24 rounded-full border-8 border-stone-50 border-t-brand-primary flex items-center justify-center font-bold text-2xl">84%</div>
                   <p className="mt-4 text-[10px] text-stone-400 text-center uppercase tracking-widest font-bold">Inventory Diversity Score</p>
                 </div>
               </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
