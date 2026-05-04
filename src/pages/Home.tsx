import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Camera, Paintbrush, ShoppingBag, ArrowRight, CheckCircle2, Star, Sparkles, Gem, Truck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { db, collection, getDocs, query, orderBy } from '../lib/firebase';
import Tooltip from '../components/Tooltip';

const iconMap: Record<string, any> = {
  Camera,
  Paintbrush,
  ShoppingBag,
  Sparkles,
  Gem,
  Truck
};

export default function Home() {
  const [services, setServices] = useState<any[]>([]);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const snap = await getDocs(query(collection(db, 'services'), orderBy('order', 'asc')));
        if (!snap.empty) {
          setServices(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        } else {
          // Fallback if no services in DB yet
          setServices([
            {
              title: "AI Analyzer",
              description: "Upload a photo of your room and get personalized home decor recommendations in seconds.",
              icon: "Camera",
              link: "/analyzer",
              priceRange: "Free Analysis"
            },
            {
              title: "Custom Furniture",
              description: "Design and customize furniture that fits your style and space perfectly.",
              icon: "ShoppingBag",
              link: "/shop",
              priceRange: "From KSH 5,000"
            },
            {
              title: "Fashion & Branding",
              description: "From luxury apparel branding to vehicle wraps. We design, print, and brand your vision.",
              icon: "Paintbrush",
              link: "/branding",
              priceRange: "Custom Quotes"
            }
          ]);
        }
      } catch (err) {
        console.error("Failed to fetch services");
      }
    };
    fetchServices();
  }, []);

  return (
    <div className="flex flex-col gap-24 pb-24">
      {/* Editorial Hero Section */}
      <section className="relative min-h-screen flex flex-col lg:flex-row overflow-hidden bg-white">
        {/* Left Side: Content */}
        <div className="relative z-10 w-full lg:w-1/2 flex flex-col justify-center px-6 md:px-12 lg:px-20 py-20 lg:py-0">
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: { 
                opacity: 1,
                transition: { 
                  staggerChildren: 0.15,
                  delayChildren: 0.2
                }
              }
            }}
            className="max-w-xl"
          >
            <motion.div
              variants={{
                hidden: { width: 0 },
                visible: { width: "60px", transition: { duration: 1, ease: "circOut" } }
              }}
              className="h-[2px] bg-brand-primary mb-8"
            />
            
            <motion.span 
              variants={{
                hidden: { opacity: 0, x: -20 },
                visible: { opacity: 1, x: 0 }
              }}
              className="text-stone-400 font-medium tracking-[0.4em] uppercase text-xs mb-4 block"
            >
              Est. 2026 • Maridadi Creations
            </motion.span>
            
            <motion.h1 
              variants={{
                hidden: { opacity: 0, y: 30 },
                visible: { opacity: 1, y: 0 }
              }}
              className="text-7xl md:text-8xl lg:text-9xl mb-8 leading-[0.85] tracking-tighter text-stone-900"
            >
              Curated <br />
              <span className="italic font-light text-brand-primary">Elegance</span>
            </motion.h1>
            
            <motion.p 
              variants={{
                hidden: { opacity: 0 },
                visible: { opacity: 1 }
              }}
              className="text-lg text-stone-500 mb-12 max-w-md leading-relaxed font-light"
            >
              Where high-fashion meets bespoke interior design. We redefine spaces and branding through a lens of premium artistry and AI-powered precision.
            </motion.p>
            
            <motion.div 
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 }
              }}
              className="flex flex-wrap gap-6"
            >
              <Link to="/analyzer" className="group flex items-center gap-4 text-stone-900 font-bold uppercase tracking-widest text-sm">
                <span className="w-12 h-12 rounded-full border border-stone-200 flex items-center justify-center group-hover:bg-brand-primary group-hover:border-brand-primary group-hover:text-white transition-all duration-300">
                  <ArrowRight size={20} />
                </span>
                Start AI Analysis
              </Link>
              <Link to="/shop" className="group flex items-center gap-4 text-stone-900 font-bold uppercase tracking-widest text-sm">
                <span className="w-12 h-12 rounded-full border border-stone-200 flex items-center justify-center group-hover:bg-brand-primary group-hover:border-brand-primary group-hover:text-white transition-all duration-300">
                  <ShoppingBag size={20} />
                </span>
                The Collection
              </Link>
            </motion.div>
          </motion.div>

          {/* Vertical Text Accent */}
          <div className="absolute left-6 bottom-12 hidden lg:block">
            <span className="rotate-90 origin-left text-[10px] font-bold tracking-[0.5em] uppercase text-stone-300 block">
              Global Presence • Local Craftsmanship
            </span>
          </div>
        </div>

        {/* Right Side: Visuals */}
        <div className="relative w-full lg:w-1/2 h-[60vh] lg:h-auto overflow-hidden">
          <motion.div 
            initial={{ scale: 1.2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="w-full h-full"
          >
            <img 
              src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=2000" 
              alt="Premium Interior" 
              className="w-full h-full object-cover grayscale-[20%] sepia-[10%] hover:scale-105 transition-transform duration-10000"
              referrerPolicy="no-referrer"
            />
          </motion.div>
          
          {/* Accent Card */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="absolute bottom-12 right-12 bg-white p-8 hidden md:block max-w-xs shadow-2xl skew-x-[-2deg]"
          >
            <div className="flex gap-1 mb-4">
              {[1, 2, 3, 4, 5].map(i => <Star key={i} fill="#5A5A40" className="text-brand-primary" size={12} />)}
            </div>
            <p className="text-stone-900 font-serif italic text-lg leading-snug mb-4">
              "The intersection of fashion and decor has never looked so effortless."
            </p>
            <span className="text-[10px] font-bold tracking-widest uppercase text-stone-400">— Vogue Living</span>
          </motion.div>

          <div className="absolute inset-0 border-[20px] border-white/10 pointer-events-none" />
        </div>
      </section>

      {/* Services Grid - High-end Redesign */}
      <section className="max-w-7xl mx-auto px-4 w-full">
        <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-20">
          <div className="max-w-2xl">
            <h2 className="text-5xl md:text-7xl font-serif mb-6 leading-tight">
              Artisanal <span className="italic font-light text-brand-primary">Capabilities</span>
            </h2>
            <p className="text-stone-500 text-lg leading-relaxed font-light">
              We combine traditional Kenyan craftsmanship with modern AI precision to deliver unparalleled quality in every project.
            </p>
          </div>
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="flex gap-4 mb-4"
          >
            <div className="text-right">
              <span className="block text-3xl font-serif">10+</span>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400">Years Experience</span>
            </div>
            <div className="w-[1px] h-12 bg-stone-100" />
            <div className="text-right">
              <span className="block text-3xl font-serif">2.5k</span>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400">Projects Delivered</span>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 border border-stone-100 rounded-[48px] overflow-hidden bg-white shadow-2xl shadow-stone-200/50">
          {services.map((service, index) => {
            const Icon = iconMap[service.icon] || Camera;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`group relative p-12 border-stone-100 ${index !== services.length - 1 ? 'md:border-r border-b md:border-b-0' : ''} transition-all duration-700 hover:bg-stone-50`}
              >
                <div className="mb-12 relative">
                  <div className="w-20 h-20 rounded-full border border-stone-100 flex items-center justify-center text-stone-900 group-hover:bg-brand-primary group-hover:text-white transition-all duration-500 group-hover:scale-110">
                    <Icon size={32} />
                  </div>
                  <span className="absolute -top-4 -right-4 text-[60px] font-serif opacity-[0.03] select-none group-hover:opacity-[0.08] transition-opacity">0{index + 1}</span>
                </div>

                <div className="space-y-4">
                  <span className="text-[10px] font-bold tracking-[.3em] uppercase text-brand-primary/60">{service.priceRange}</span>
                  <h3 className="text-4xl font-serif">{service.title}</h3>
                  <p className="text-stone-500 font-light leading-relaxed mb-8">{service.description}</p>
                  
                  <Link 
                    to={service.link || "#"} 
                    className="inline-flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-stone-900 group-hover:text-brand-primary transition-colors pt-4 border-t border-stone-50 w-full"
                  >
                    Discover Service
                    <ArrowRight size={14} className="group-hover:translate-x-2 transition-transform" />
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Feature Showcase */}
      <section className="bg-brand-primary text-brand-cream py-24 rounded-[60px] mx-4 overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl md:text-6xl mb-8 leading-tight">We Design, We Print, <br /><span className="italic block mt-2">We Brand.</span></h2>
            <div className="space-y-6">
              {[
                "Custom Photo Mounts & Portraits",
                "Large Format Stickers & Banners",
                "Boda Boda & Vehicle Branding",
                "Graffiti & Personal Decor",
                "Exquisite Jewelry Collection"
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-4 text-white/90">
                  <CheckCircle2 className="text-white" size={24} />
                  <span className="text-lg">{item}</span>
                </div>
              ))}
            </div>
            <Link to="/branding" className="inline-block mt-12 px-8 py-4 bg-white text-brand-primary rounded-full font-bold">
              Get a Quote
            </Link>
          </div>
          <div className="relative">
            <div className="absolute -top-20 -right-20 w-80 h-80 bg-brand-cream/10 rounded-full blur-3xl" />
            <img 
              src="https://picsum.photos/seed/branding/800/800" 
              alt="Branding" 
              className="rounded-3xl shadow-2xl relative z-10 scale-110"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      </section>

      {/* Testimonials or Vibe */}
      <section className="max-w-7xl mx-auto px-4 text-center">
        <div className="flex justify-center gap-2 mb-6">
          {[1, 2, 3, 4, 5].map(i => <Star key={i} fill="#5A5A40" className="text-brand-primary" size={20} />)}
        </div>
        <p className="text-3xl md:text-5xl font-serif max-w-4xl mx-auto leading-tight italic">
          "Maridadi transformed our living room into a sanctuary. The AI analysis was spot on, and the custom photo mounts added the perfect personal touch."
        </p>
        <div className="mt-8">
          <p className="font-bold uppercase tracking-widest text-sm text-stone-500">— Sarah M., Interior Enthusiast</p>
        </div>
      </section>
    </div>
  );
}
