import { useState, useEffect } from 'react';
import { db, collection, getDocs, getDocFromServer, addDoc, updateDoc, deleteDoc, doc, query, orderBy, setDoc } from '../lib/firebase';
import { Package, ShoppingBag, Paintbrush, Plus, Trash2, Edit3, Settings, CheckCircle2, Truck, Clock, Sparkles, Users, DollarSign, RefreshCw, Bike, Zap, Home, Camera, Heart, Star, Type, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'react-hot-toast';
import { generateAdminInsights } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';
import { defaultSiteContent, mergeSiteContent, type ServiceOffering, type SiteContent } from '../lib/siteContent';
import SocialIcon from '../components/SocialIcon';
import { defaultSocialLinks, type SocialLink, type SocialLinkId } from '../lib/socialLinks';

const emptyServiceForm = {
  id: '',
  title: '',
  description: '',
  category: '',
  icon: 'Paintbrush',
  image: '',
  priceRange: '',
  search: '',
  order: 0
};

export default function Admin() {
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'catalog' | 'services' | 'categories' | 'content' | 'insights'>('overview');
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [aiInsights, setAiInsights] = useState<string>("");
  const [generatingInsights, setGeneratingInsights] = useState(false);
  const [siteContent, setSiteContent] = useState<SiteContent>(defaultSiteContent);
  const [savingContent, setSavingContent] = useState(false);

  // Form states
  const [newProduct, setNewProduct] = useState({ 
    name: '', 
    price: 0, 
    category: 'Custom',
    image: '', 
    description: '', 
    variations: [] as any[],
    stockQuantity: 0,
    tags: ''
  });
  const [variationInput, setVariationInput] = useState({ name: '', image: '', price: 0 });
  const [newService, setNewService] = useState(emptyServiceForm);
  const [newCategory, setNewCategory] = useState({ name: '', slug: '', order: 0 });
  
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  
  const generateInsights = async () => {
    if (orders.length === 0 && products.length === 0) {
      toast.error("Not enough data to create insights");
      return;
    }
    setGeneratingInsights(true);
    try {
      const insights = await generateAdminInsights(orders, products);
      setAiInsights(insights);
      setActiveTab('insights');
      toast.success("Store insights created");
    } catch (err) {
      toast.error("Failed to create insights");
    } finally {
      setGeneratingInsights(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const orderSnap = await getDocs(query(collection(db, 'orders'), orderBy('createdAt', 'desc')));
        setOrders(orderSnap.docs.map(d => ({ id: d.id, ...d.data() })));

        const productSnap = await getDocs(collection(db, 'products'));
        setProducts(productSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        
        const categorySnap = await getDocs(query(collection(db, 'categories'), orderBy('order', 'asc')));
        setCategories(categorySnap.docs.map(d => ({ id: d.id, ...d.data() })));

        const contentSnap = await getDocFromServer(doc(db, 'siteContent', 'main'));
        setSiteContent(mergeSiteContent(contentSnap.exists() ? contentSnap.data() as Partial<SiteContent> : null));
      } catch (err) {
        toast.error("Failed to fetch admin data");
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, target: 'product' | 'variation' | 'service' | 'hero' | 'category', categoryIndex?: number) => {
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
      } else if (target === 'hero') {
        setSiteContent(prev => ({ ...prev, homeHeroImage: base64 }));
      } else if (target === 'category' && typeof categoryIndex === 'number') {
        updateSiteCategory(categoryIndex, 'image', base64);
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
        category: 'Custom',
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

  const popularIcons = ['Truck', 'Bike', 'Paintbrush', 'ShoppingBag', 'Zap', 'Home', 'Camera', 'Package', 'Clock', 'Settings', 'Heart', 'Star', 'Sparkles'];

  const getOrderTotal = (order: any) => {
    const possibleTotal = order.amounts?.total ?? order.total ?? order.totalAmount ?? order.details?.total;
    const numericTotal = Number(possibleTotal);
    return Number.isFinite(numericTotal) ? numericTotal : 0;
  };

  const formatCurrency = (value: number) => value > 0
    ? new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 }).format(value)
    : 'KES 0';

  const totalRevenue = orders.reduce((sum, order) => sum + getOrderTotal(order), 0);
  const pendingOrders = orders.filter(order => ['pending', 'pending_payment', 'received'].includes(String(order.status || '').toLowerCase())).length;
  const catalogReadyCount = products.filter(product => product.name && product.description && product.image && Number(product.price) > 0).length;
  const catalogReadiness = products.length ? Math.round((catalogReadyCount / products.length) * 100) : 0;
  const configuredCategoryCount = new Set([
    ...categories.map(category => category.name || category.slug).filter(Boolean),
    ...siteContent.categories.map(category => category.title).filter(Boolean)
  ]).size;
  const adminStats = [
    { label: 'Revenue', value: formatCurrency(totalRevenue), sub: 'From saved orders', icon: DollarSign },
    { label: 'Orders', value: orders.length, sub: `${pendingOrders} waiting`, icon: Package },
    { label: 'Catalog Items', value: products.length, sub: `${catalogReadyCount} complete`, icon: ShoppingBag },
    { label: 'Services', value: siteContent.services.length, sub: `${configuredCategoryCount} categories`, icon: Paintbrush }
  ];
  const incompleteProducts = products.filter(product => !product.name || !product.description || !product.image || Number(product.price || 0) <= 0);
  const activeSocialLinks = siteContent.socialLinks.filter(link => link.href.trim());
  const socialReadiness = siteContent.socialLinks.length ? Math.round((activeSocialLinks.length / siteContent.socialLinks.length) * 100) : 0;
  const recentOrders = orders.slice(0, 5);
  const controlTasks = [
    {
      label: 'Orders waiting',
      value: pendingOrders,
      action: 'Review orders',
      tab: 'orders' as const,
      done: pendingOrders === 0
    },
    {
      label: 'Catalog items missing details',
      value: incompleteProducts.length,
      action: 'Fix catalog',
      tab: 'catalog' as const,
      done: incompleteProducts.length === 0
    },
    {
      label: 'Active social links',
      value: `${activeSocialLinks.length}/${siteContent.socialLinks.length}`,
      action: 'Edit content',
      tab: 'content' as const,
      done: activeSocialLinks.length > 0
    },
    {
      label: 'Configured services',
      value: siteContent.services.length,
      action: 'Manage services',
      tab: 'services' as const,
      done: siteContent.services.length > 0
    }
  ];

  const addService = async () => {
    try {
      if (!newService.title.trim()) {
        toast.error("Service title required");
        return;
      }
      const serviceToSave: ServiceOffering = {
        id: editingServiceId || newService.id || newService.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || `service-${Date.now()}`,
        title: newService.title.trim(),
        description: newService.description.trim(),
        category: newService.category.trim() || 'Custom',
        icon: newService.icon || 'Paintbrush',
        image: newService.image,
        priceRange: newService.priceRange.trim() || 'Custom quote',
        search: newService.search.trim() || `${newService.title} ${newService.category}`.trim(),
        order: Number(newService.order || 0)
      };
      const nextContent = {
        ...siteContent,
        services: editingServiceId
          ? siteContent.services.map(service => service.id === editingServiceId ? serviceToSave : service).sort((a, b) => Number(a.order || 0) - Number(b.order || 0))
          : [...siteContent.services, serviceToSave].sort((a, b) => Number(a.order || 0) - Number(b.order || 0))
      };
      await setDoc(doc(db, 'siteContent', 'main'), nextContent);
      setSiteContent(nextContent);
      toast.success(editingServiceId ? "Service updated" : "Service added");
      setEditingServiceId(null);
      setNewService({ ...emptyServiceForm, order: nextContent.services.length });
    } catch (err) {
      toast.error("Failed to save service");
    }
  };

  const removeContentService = async (serviceId: string) => {
    if (!window.confirm("Remove this service from the site?")) return;
    try {
      const nextContent = {
        ...siteContent,
        services: siteContent.services.filter(service => service.id !== serviceId)
      };
      await setDoc(doc(db, 'siteContent', 'main'), nextContent);
      setSiteContent(nextContent);
      if (editingServiceId === serviceId) {
        setEditingServiceId(null);
        setNewService({ ...emptyServiceForm, order: nextContent.services.length });
      }
      toast.success("Service removed");
    } catch {
      toast.error("Failed to remove service");
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

  const updateSiteCategory = (index: number, key: keyof SiteContent['categories'][number], value: string) => {
    setSiteContent(prev => ({
      ...prev,
      categories: prev.categories.map((category, categoryIndex) =>
        categoryIndex === index ? { ...category, [key]: value } : category
      )
    }));
  };

  const updateSocialLink = (index: number, key: keyof SocialLink, value: string) => {
    setSiteContent(prev => ({
      ...prev,
      socialLinks: prev.socialLinks.map((link, linkIndex) => {
        if (linkIndex !== index) return link;
        if (key === 'id') {
          const preset = defaultSocialLinks.find(item => item.id === value);
          return {
            ...link,
            id: value as SocialLinkId,
            label: preset?.label || link.label,
            brandColor: preset?.brandColor || link.brandColor
          };
        }
        return { ...link, [key]: value };
      })
    }));
  };

  const addSocialLink = () => {
    const nextPreset = defaultSocialLinks.find(link => !siteContent.socialLinks.some(existing => existing.id === link.id)) || defaultSocialLinks[0];
    setSiteContent(prev => ({
      ...prev,
      socialLinks: [...prev.socialLinks, { ...nextPreset, href: '' }]
    }));
  };

  const removeSocialLink = (index: number) => {
    setSiteContent(prev => ({
      ...prev,
      socialLinks: prev.socialLinks.filter((_, linkIndex) => linkIndex !== index)
    }));
  };

  const saveSiteContent = async () => {
    setSavingContent(true);
    try {
      await setDoc(doc(db, 'siteContent', 'main'), siteContent);
      toast.success("Site content updated");
    } catch {
      toast.error("Failed to save site content");
    } finally {
      setSavingContent(false);
    }
  };

  return (
    <div className="flex-1 bg-stone-50/50 min-h-screen">
      {/* Control Center Dashboard Header */}
      <div className="bg-white border-b border-stone-100 px-4 md:px-8 py-8 md:py-12 mb-8 shadow-sm">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
            <div>
              <div className="flex items-center gap-2 text-brand-primary font-bold uppercase tracking-[0.2em] text-[10px] mb-2">
                <Settings size={14} className="animate-spin-slow" />
                Maridadi Admin
              </div>
              <h1 className="text-4xl md:text-5xl font-serif italic font-light leading-tight">
                Control <span className="not-italic font-bold">Center</span>
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
              {generatingInsights ? 'Reviewing...' : 'Create store insights'}
            </button>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {adminStats.map((stat, i) => (
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
                  <span className="text-[10px] font-black tracking-widest text-emerald-500 font-mono">CURRENT</span>
                </div>
                <div className="text-xl md:text-2xl font-bold text-stone-900 mb-1">{stat.value}</div>
                <div className="text-[10px] text-stone-400 uppercase tracking-widest font-bold">{stat.label}</div>
                <div className="mt-2 text-[10px] font-bold uppercase tracking-widest text-stone-300">{stat.sub}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 lg:px-8 pb-24">
        {/* Tab Selection Redesign */}
        <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide mb-8">
          {[
            { id: 'overview', icon: Settings, label: 'Overview' },
            { id: 'orders', icon: Clock, label: 'Orders' },
            { id: 'catalog', icon: ShoppingBag, label: 'Catalog' },
            { id: 'services', icon: Paintbrush, label: 'Services' },
            { id: 'categories', icon: Settings, label: 'Categories' },
            { id: 'content', icon: Type, label: 'Content' },
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
        {activeTab === 'overview' && (
          <motion.div key="overview" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="mx-auto max-w-7xl space-y-8 px-4 lg:px-8">
            <div className="grid grid-cols-1 gap-8 xl:grid-cols-[1.15fr_0.85fr]">
              <div className="rounded-[32px] border border-stone-100 bg-white p-6 shadow-sm md:p-8">
                <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h3 className="text-2xl font-serif">Today at a glance</h3>
                    <p className="mt-2 text-sm text-stone-500">Track orders, catalog readiness, services, and contact channels from one place.</p>
                  </div>
                  <button
                    onClick={generateInsights}
                    disabled={generatingInsights}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-stone-900 px-5 py-3 text-[10px] font-black uppercase tracking-widest text-white disabled:opacity-50"
                  >
                    <Sparkles size={14} />
                    {generatingInsights ? 'Reviewing...' : 'Create insights'}
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {controlTasks.map(task => (
                    <button
                      key={task.label}
                      onClick={() => setActiveTab(task.tab)}
                      className="flex min-h-28 items-center justify-between gap-5 rounded-3xl border border-stone-100 bg-stone-50 p-5 text-left transition-colors hover:bg-white"
                    >
                      <div>
                        <div className="text-2xl font-bold text-stone-900">{task.value}</div>
                        <div className="mt-1 text-[10px] font-black uppercase tracking-widest text-stone-400">{task.label}</div>
                        <div className="mt-3 text-[10px] font-black uppercase tracking-widest text-brand-primary">{task.action}</div>
                      </div>
                      <div className={`flex h-10 w-10 items-center justify-center rounded-full ${task.done ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                        {task.done ? <CheckCircle2 size={18} /> : <Clock size={18} />}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-[32px] border border-stone-100 bg-white p-6 shadow-sm md:p-8">
                <h3 className="text-2xl font-serif">Readiness</h3>
                <p className="mt-2 text-sm text-stone-500">Completion checks based on the current saved data.</p>
                <div className="mt-8 space-y-6">
                  {[
                    { label: 'Catalog', value: catalogReadiness, detail: `${catalogReadyCount} of ${products.length} items complete` },
                    { label: 'Social links', value: socialReadiness, detail: `${activeSocialLinks.length} active links` },
                    { label: 'Services', value: siteContent.services.length > 0 ? 100 : 0, detail: `${siteContent.services.length} services configured` }
                  ].map(item => (
                    <div key={item.label}>
                      <div className="mb-2 flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                        <span className="text-stone-400">{item.label}</span>
                        <span className="text-brand-primary">{item.value}%</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-stone-100">
                        <div className="h-full rounded-full bg-brand-primary" style={{ width: `${item.value}%` }} />
                      </div>
                      <p className="mt-2 text-xs text-stone-400">{item.detail}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-8 xl:grid-cols-3">
              <div className="rounded-[32px] border border-stone-100 bg-white p-6 shadow-sm md:p-8 xl:col-span-2">
                <div className="mb-6 flex items-center justify-between">
                  <h3 className="text-2xl font-serif">Recent orders</h3>
                  <button onClick={() => setActiveTab('orders')} className="text-[10px] font-black uppercase tracking-widest text-brand-primary">View all</button>
                </div>
                {recentOrders.length > 0 ? (
                  <div className="divide-y divide-stone-50">
                    {recentOrders.map(order => (
                      <div key={order.id} className="flex flex-col gap-3 py-4 md:flex-row md:items-center md:justify-between">
                        <div>
                          <p className="font-bold text-stone-900">{order.details?.productName || order.details?.serviceName || 'Custom Request'}</p>
                          <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-stone-400">#{order.id.slice(-6).toUpperCase()} · {order.type || 'Order'}</p>
                        </div>
                        <span className="w-fit rounded-full bg-stone-100 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-stone-500">{order.status || 'received'}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="rounded-2xl bg-stone-50 p-5 text-sm text-stone-400">No orders yet.</p>
                )}
              </div>

              <div className="rounded-[32px] border border-stone-100 bg-white p-6 shadow-sm md:p-8">
                <div className="mb-6 flex items-center justify-between">
                  <h3 className="text-2xl font-serif">Live channels</h3>
                  <button onClick={() => setActiveTab('content')} className="text-[10px] font-black uppercase tracking-widest text-brand-primary">Edit</button>
                </div>
                <div className="space-y-3">
                  {activeSocialLinks.length > 0 ? activeSocialLinks.map(link => (
                    <a
                      key={link.id}
                      href={link.href}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between rounded-2xl bg-stone-50 p-4"
                    >
                      <span className="flex items-center gap-3 text-sm font-bold text-stone-700">
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white" style={{ color: link.brandColor }}>
                          <SocialIcon id={link.id} size={17} />
                        </span>
                        {link.label}
                      </span>
                      <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Active</span>
                    </a>
                  )) : (
                    <p className="rounded-2xl bg-stone-50 p-5 text-sm text-stone-400">No social links are active yet.</p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

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
                              const tracking = window.prompt("Enter tracking number:");
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
                        const tracking = window.prompt("Enter tracking number:");
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
                  {categories.length === 0 && siteContent.categories.map(category => <option key={category.title} value={category.title}>{category.title}</option>)}
                  {categories.length === 0 && siteContent.categories.length === 0 && <option>Custom</option>}
                </select>
                <input type="number" placeholder="Stock quantity" className="p-4 rounded-xl border border-stone-100 focus:outline-brand-primary" value={newProduct.stockQuantity} onChange={e => setNewProduct({...newProduct, stockQuantity: Number(e.target.value)})} />
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
                    <input type="number" placeholder="Variation price (KSH)" className="p-3 bg-white rounded-xl border border-stone-100 text-sm" value={variationInput.price} onChange={e => setVariationInput({...variationInput, price: Number(e.target.value)})} />
                    <div className="flex flex-col gap-1">
                      <input type="text" placeholder="Variation image URL" className="p-3 bg-white rounded-xl border border-stone-100 text-sm" value={variationInput.image} onChange={e => setVariationInput({...variationInput, image: e.target.value})} />
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
                <button onClick={addProduct} className="bg-brand-primary text-brand-cream p-4 rounded-xl font-bold flex items-center justify-center gap-2 md:col-span-4">
                  <Plus size={20} /> Add to Catalog
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {products.map(product => (
                <div key={product.id} className="bg-white rounded-[32px] border border-stone-100 shadow-sm overflow-hidden group">
                   <div className="aspect-square bg-stone-100 relative">
                     {product.image ? (
                       <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                     ) : (
                       <div className="flex h-full w-full flex-col items-center justify-center gap-3 p-6 text-center text-stone-300">
                         <ImageIcon size={36} />
                         <span className="text-[10px] font-black uppercase tracking-widest">Add product image</span>
                       </div>
                     )}
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
              <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                <div>
                  <h3 className="text-xl font-serif">{editingServiceId ? 'Edit Service' : 'Add New Service'}</h3>
                  <p className="mt-2 text-sm text-stone-500">These services appear on Customize and For Business. Add, edit, or remove them here.</p>
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-brand-primary">{siteContent.services.length} active</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <input type="text" placeholder="Service Title" className="p-4 rounded-xl border border-stone-100 focus:outline-brand-primary" value={newService.title} onChange={e => setNewService({...newService, title: e.target.value})} />
                <input type="text" placeholder="Category (Personal, Devices, Business...)" className="p-4 rounded-xl border border-stone-100 focus:outline-brand-primary" value={newService.category} onChange={e => setNewService({...newService, category: e.target.value})} />
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
                        {iconName === 'Sparkles' && <Sparkles size={16} />}
                        {!['Truck', 'Bike', 'Paintbrush', 'ShoppingBag', 'Zap', 'Home', 'Camera', 'Package', 'Clock', 'Settings', 'Heart', 'Star', 'Sparkles'].includes(iconName) && <Plus size={16} />}
                      </button>
                    ))}
                  </div>
                </div>
                <textarea placeholder="Description" className="p-4 rounded-xl border border-stone-100 focus:outline-brand-primary md:col-span-2" value={newService.description} onChange={e => setNewService({...newService, description: e.target.value})} />
                <input type="text" placeholder="Search terms" className="p-4 rounded-xl border border-stone-100 focus:outline-brand-primary" value={newService.search} onChange={e => setNewService({...newService, search: e.target.value})} />
                <input type="number" placeholder="Display order" className="p-4 rounded-xl border border-stone-100 focus:outline-brand-primary" value={newService.order} onChange={e => setNewService({...newService, order: Number(e.target.value)})} />
                <input type="text" placeholder="Image URL (optional)" className="p-4 rounded-xl border border-stone-100 focus:outline-brand-primary" value={newService.image} onChange={e => setNewService({...newService, image: e.target.value})} />
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
                      onClick={() => { setEditingServiceId(null); setNewService({ ...emptyServiceForm, order: siteContent.services.length }); }}
                      className="px-6 rounded-xl border border-stone-200 text-stone-400 font-bold"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {siteContent.services.map(s => (
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
                       {s.icon === 'Sparkles' && <Sparkles size={20} />}
                       {!['Truck', 'Bike', 'Paintbrush', 'ShoppingBag', 'Zap', 'Home', 'Camera', 'Package', 'Clock', 'Settings', 'Heart', 'Star', 'Sparkles'].includes(s.icon) && <Settings size={20} />}
                     </div>
                     <h4 className="font-bold text-lg">{s.title}</h4>
                   </div>
                   <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-brand-primary">{s.category} · {s.priceRange}</p>
                   <p className="text-stone-400 text-sm mb-4 line-clamp-2">{s.description}</p>
                   <div className="flex gap-2">
                     <button 
                        onClick={() => {
                          setEditingServiceId(s.id);
                          setNewService({ id: s.id, title: s.title, description: s.description, category: s.category || '', icon: s.icon, image: s.image || '', priceRange: s.priceRange || '', search: s.search || '', order: s.order });
                        }}
                        className="flex-1 bg-stone-50 text-stone-400 py-3 rounded-xl hover:bg-stone-100 transition-colors"
                      >
                        <Edit3 size={18} className="mx-auto" />
                      </button>
                     <button onClick={() => removeContentService(s.id)} className="flex-1 bg-red-50 text-red-400 py-3 rounded-xl hover:bg-red-100 transition-colors"><Trash2 size={18} className="mx-auto" /></button>
                   </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'categories' && (
          <motion.div key="categories" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8">
            <div className="bg-white p-8 rounded-3xl border border-stone-100 shadow-sm transition-all duration-500">
              <h3 className="text-xl font-serif mb-6">{editingCategoryId ? 'Edit Category' : 'Add Explore Category'}</h3>
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

        {activeTab === 'content' && (
          <motion.div key="content" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8">
            <div className="rounded-[32px] border border-stone-100 bg-white p-6 shadow-sm md:p-8">
              <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="text-2xl font-serif">Site Content</h3>
                  <p className="mt-2 max-w-2xl text-sm text-stone-500">Edit the main customer-facing text and entry categories used on Home, Explore, Customize, and For Business.</p>
                </div>
                <button
                  onClick={saveSiteContent}
                  disabled={savingContent}
                  className="rounded-2xl bg-brand-primary px-6 py-4 text-xs font-black uppercase tracking-widest text-brand-cream disabled:opacity-60"
                >
                  {savingContent ? 'Saving...' : 'Save content'}
                </button>
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                {[
                  ['homeHeroTitle', 'Homepage title'],
                  ['homeHeroSubtitle', 'Homepage subtitle'],
                  ['coreHeadline', 'Core message'],
                  ['coreSubtext', 'Core message subtext'],
                  ['featuredTitle', 'Featured work title'],
                  ['featuredSubtitle', 'Featured work subtitle'],
                  ['howItWorksTitle', 'How it works title'],
                  ['exploreTitle', 'Explore title'],
                  ['exploreSubtitle', 'Explore subtitle'],
                  ['customizeTitle', 'Customize title'],
                  ['customizeSubtitle', 'Customize subtitle'],
                  ['businessTitle', 'Business title'],
                  ['businessSubtitle', 'Business subtitle']
                ].map(([key, label]) => (
                  <label key={key} className="block">
                    <span className="mb-2 block text-[10px] font-black uppercase tracking-widest text-stone-400">{label}</span>
                    <textarea
                      value={String(siteContent[key as keyof SiteContent] || '')}
                      onChange={(event) => setSiteContent(prev => ({ ...prev, [key]: event.target.value }))}
                      className="min-h-20 w-full rounded-2xl border border-stone-100 bg-stone-50 p-4 text-sm outline-none focus:border-brand-primary"
                    />
                  </label>
                ))}
              </div>
            </div>

            <div className="rounded-[32px] border border-stone-100 bg-white p-6 shadow-sm md:p-8">
              <div className="mb-8">
                <h3 className="text-2xl font-serif">Site Images</h3>
                <p className="mt-2 text-sm text-stone-500">Manage the images used across the customer-facing app.</p>
              </div>
              <div className="grid grid-cols-1 gap-5 lg:grid-cols-[0.85fr_1.15fr]">
                <div className="overflow-hidden rounded-3xl bg-stone-100">
                  {siteContent.homeHeroImage ? (
                    <img src={siteContent.homeHeroImage} alt="Homepage hero preview" className="aspect-video w-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="flex aspect-video items-center justify-center text-stone-300">
                      <ImageIcon size={40} />
                    </div>
                  )}
                </div>
                <label className="block">
                  <span className="mb-2 block text-[10px] font-black uppercase tracking-widest text-stone-400">Homepage hero image</span>
                  <input
                    value={siteContent.homeHeroImage}
                    onChange={(event) => setSiteContent(prev => ({ ...prev, homeHeroImage: event.target.value }))}
                    placeholder="Image URL"
                    className="w-full rounded-2xl border border-stone-100 bg-stone-50 p-4 text-sm outline-none focus:border-brand-primary"
                  />
                  <div className="mt-3 flex items-center gap-3">
                    <span className="text-[10px] font-black uppercase tracking-widest text-stone-400">Or upload</span>
                    <input type="file" className="text-[10px] text-stone-400" accept="image/*" onChange={event => handleFileUpload(event, 'hero')} />
                  </div>
                </label>
              </div>
            </div>

            <div className="rounded-[32px] border border-stone-100 bg-white p-6 shadow-sm md:p-8">
              <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="text-2xl font-serif">Social Links</h3>
                  <p className="mt-2 text-sm text-stone-500">These links power the footer and sidebar contact buttons.</p>
                </div>
                <button
                  onClick={addSocialLink}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-stone-900 px-5 py-3 text-[10px] font-black uppercase tracking-widest text-white"
                >
                  <Plus size={14} />
                  Add link
                </button>
              </div>

              <div className="space-y-4">
                {siteContent.socialLinks.map((link, index) => (
                  <div key={`${link.id}-${index}`} className="grid grid-cols-1 gap-3 rounded-3xl bg-stone-50 p-4 lg:grid-cols-[150px_1fr_140px_auto] lg:items-center">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white" style={{ color: link.brandColor }}>
                        <SocialIcon id={link.id} size={18} />
                      </span>
                      <select
                        value={link.id}
                        onChange={(event) => updateSocialLink(index, 'id', event.target.value)}
                        className="min-h-11 rounded-2xl border border-stone-100 bg-white px-3 text-xs font-bold outline-none focus:border-brand-primary"
                      >
                        {defaultSocialLinks.map(option => <option key={option.id} value={option.id}>{option.label}</option>)}
                      </select>
                    </div>
                    <input
                      value={link.href}
                      onChange={(event) => updateSocialLink(index, 'href', event.target.value)}
                      placeholder="Social profile URL"
                      className="min-h-11 rounded-2xl border border-stone-100 bg-white px-4 text-sm outline-none focus:border-brand-primary"
                    />
                    <input
                      value={link.brandColor}
                      onChange={(event) => updateSocialLink(index, 'brandColor', event.target.value)}
                      placeholder="#000000"
                      className="min-h-11 rounded-2xl border border-stone-100 bg-white px-4 text-sm outline-none focus:border-brand-primary"
                    />
                    <button
                      onClick={() => removeSocialLink(index)}
                      className="flex min-h-11 items-center justify-center rounded-2xl bg-red-50 px-4 text-red-400 hover:bg-red-100"
                      aria-label={`Remove ${link.label}`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[32px] border border-stone-100 bg-white p-6 shadow-sm md:p-8">
              <div className="mb-8">
                <h3 className="text-2xl font-serif">Entry Categories</h3>
                <p className="mt-2 text-sm text-stone-500">These categories power the quick entry options on Home, Explore, and Customize.</p>
              </div>
              <div className="space-y-6">
                {siteContent.categories.map((category, index) => (
                  <div key={`${category.title}-${index}`} className="rounded-3xl bg-stone-50 p-5">
                    <div className="mb-4 text-[10px] font-black uppercase tracking-widest text-brand-primary">Category {index + 1}</div>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <input value={category.title} onChange={(event) => updateSiteCategory(index, 'title', event.target.value)} placeholder="Category title" className="rounded-2xl border border-stone-100 bg-white p-4 text-sm outline-none focus:border-brand-primary" />
                      <input value={category.shortLabel} onChange={(event) => updateSiteCategory(index, 'shortLabel', event.target.value)} placeholder="Short label" className="rounded-2xl border border-stone-100 bg-white p-4 text-sm outline-none focus:border-brand-primary" />
                      <textarea value={category.description} onChange={(event) => updateSiteCategory(index, 'description', event.target.value)} placeholder="Long description" className="min-h-24 rounded-2xl border border-stone-100 bg-white p-4 text-sm outline-none focus:border-brand-primary" />
                      <textarea value={category.shortDescription} onChange={(event) => updateSiteCategory(index, 'shortDescription', event.target.value)} placeholder="Short description" className="min-h-24 rounded-2xl border border-stone-100 bg-white p-4 text-sm outline-none focus:border-brand-primary" />
                      <input value={category.search} onChange={(event) => updateSiteCategory(index, 'search', event.target.value)} placeholder="Search terms" className="rounded-2xl border border-stone-100 bg-white p-4 text-sm outline-none focus:border-brand-primary md:col-span-2" />
                      <input value={category.image} onChange={(event) => updateSiteCategory(index, 'image', event.target.value)} placeholder="Image URL" className="rounded-2xl border border-stone-100 bg-white p-4 text-sm outline-none focus:border-brand-primary md:col-span-2" />
                      <div className="md:col-span-2 flex flex-col gap-3 rounded-2xl border border-stone-100 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3">
                          {category.image ? (
                            <img src={category.image} alt={category.title} className="h-14 w-14 rounded-xl object-cover" referrerPolicy="no-referrer" />
                          ) : (
                            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-stone-100 text-stone-300">
                              <ImageIcon size={22} />
                            </div>
                          )}
                          <span className="text-[10px] font-black uppercase tracking-widest text-stone-400">Category image</span>
                        </div>
                        <input type="file" className="text-[10px] text-stone-400" accept="image/*" onChange={event => handleFileUpload(event, 'category', index)} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
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
                      <h3 className="text-2xl font-serif">Store <span className="italic">Insights</span></h3>
                      <p className="text-xs text-stone-400 uppercase tracking-widest">Based on orders and catalog activity</p>
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
                    <p className="text-stone-300 max-w-md mx-auto mt-2 text-sm leading-relaxed">Create practical store insights from your current orders and catalog activity.</p>
                    <button 
                      onClick={generateInsights}
                      className="mt-8 bg-stone-900 text-white px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-brand-primary transition-all shadow-xl shadow-stone-900/10"
                    >
                      Create insights
                    </button>
                  </div>
                )}
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="bg-white p-8 rounded-[32px] border border-stone-100 shadow-sm">
                 <h4 className="text-sm font-bold uppercase tracking-widest text-brand-primary mb-6">Configured Services</h4>
                 <div className="space-y-4">
                   {siteContent.services.length > 0 ? siteContent.services.slice(0, 5).map(service => (
                     <div key={service.id} className="flex justify-between gap-4 p-4 bg-stone-50 rounded-2xl">
                       <div>
                         <span className="block font-bold text-stone-700 text-sm">{service.title}</span>
                         <span className="mt-1 block text-[10px] font-bold uppercase tracking-widest text-stone-400">{service.category}</span>
                       </div>
                       <span className="shrink-0 text-[10px] bg-emerald-100 text-emerald-600 px-2 py-1 rounded-full font-black uppercase tracking-widest">Active</span>
                     </div>
                   )) : (
                     <p className="rounded-2xl bg-stone-50 p-5 text-sm text-stone-400">No services configured yet.</p>
                   )}
                 </div>
               </div>
               <div className="bg-white p-8 rounded-[32px] border border-stone-100 shadow-sm">
                 <h4 className="text-sm font-bold uppercase tracking-widest text-stone-400 mb-6 font-mono">Catalog Readiness</h4>
                 <div className="flex flex-col items-center justify-center py-4">
                   <div className="w-24 h-24 rounded-full border-8 border-stone-50 border-t-brand-primary flex items-center justify-center font-bold text-2xl">{catalogReadiness}%</div>
                   <p className="mt-4 text-[10px] text-stone-400 text-center uppercase tracking-widest font-bold">{catalogReadyCount} of {products.length} catalog items complete</p>
                   <p className="mt-3 max-w-xs text-center text-xs text-stone-400">A complete item has a name, description, image, and price.</p>
                 </div>
               </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
