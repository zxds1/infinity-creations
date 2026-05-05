import { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Camera, CheckCircle2, Gem, Paintbrush, Search, ShoppingBag, SlidersHorizontal, Sparkles, Star, Truck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { db, collection, getDocs, query, orderBy, limit } from '../lib/firebase';
import { getProductInsightLabels, getStoredPreferences } from '../lib/behavior';

const quickCategories = [
  { label: 'Furniture', hint: 'Tables, seating, storage', icon: ShoppingBag },
  { label: 'Jewelry', hint: 'Statement pieces and gifts', icon: Gem },
  { label: 'Art Mounts', hint: 'Prints, portraits, wall pieces', icon: Paintbrush }
];

const onboardingSteps = [
  { title: 'Search your style', body: 'Start with a product, room, color, or gift idea.' },
  { title: 'Compare with confidence', body: 'See price, rating, location, and availability side by side.' },
  { title: 'Save your favorites', body: 'Keep the pieces you love and return when you are ready.' }
];

export default function Home() {
  const [products, setProducts] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const navigate = useNavigate();
  const preferences = useMemo(() => getStoredPreferences(), []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const snap = await getDocs(query(collection(db, 'products'), orderBy('rating', 'desc'), limit(6)));
        setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (err) {
        setLoadError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const submitSearch = (event?: React.FormEvent) => {
    event?.preventDefault();
    const query = searchTerm.trim();
    navigate(query ? `/shop?query=${encodeURIComponent(query)}` : '/shop');
  };

  return (
    <div className="pb-12 lg:pb-24">
      <section className="relative min-h-[calc(100svh-64px)] overflow-hidden bg-stone-950 text-white md:min-h-[calc(100svh-80px)]">
        <img
          src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=2200"
          alt="Warm modern interior with curated furniture"
          className="absolute inset-0 h-full w-full object-cover opacity-55"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-stone-950 via-stone-950/70 to-stone-950/10" />

        <div className="relative z-10 mx-auto flex min-h-[calc(100svh-64px)] max-w-7xl flex-col justify-center px-4 py-8 md:min-h-[calc(100svh-80px)] md:py-12">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            className="max-w-3xl"
          >
            <p className="mb-3 text-[10px] font-black uppercase tracking-[0.24em] text-white/60 md:mb-4 md:text-[11px]">Maridadi Creations</p>
            <h1 className="text-4xl font-semibold leading-[0.98] tracking-normal sm:text-5xl md:text-7xl lg:text-8xl">
              Find pieces that feel made for your space.
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/75 md:mt-6 md:text-lg">
              Browse furniture, jewelry, wall art, and custom services with clear pricing, availability, and delivery details.
            </p>

            <form onSubmit={submitSearch} className="mt-7 max-w-2xl md:mt-10">
              <div className="flex flex-col gap-2 rounded-[24px] bg-white p-2 shadow-2xl shadow-stone-950/30 sm:flex-row md:rounded-[28px]">
                <div className="flex min-h-14 flex-1 items-center gap-3 px-4">
                  <Search size={20} className="text-stone-400" />
                  <input
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Search furniture, jewelry, wall art..."
                    className="w-full bg-transparent text-sm font-semibold text-stone-900 outline-none placeholder:text-stone-400"
                  />
                </div>
                <button className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-brand-primary px-6 text-xs font-black uppercase tracking-widest text-brand-cream md:min-h-14">
                  Search <ArrowRight size={16} />
                </button>
              </div>
            </form>

            <div className="mt-5 flex gap-2 overflow-x-auto pb-2 scrollbar-hide md:mt-6 md:flex-wrap md:gap-3">
              {quickCategories.map(category => {
                const Icon = category.icon;
                return (
                  <Link
                    key={category.label}
                    to={`/shop?category=${encodeURIComponent(category.label)}`}
                    className="group inline-flex min-w-[190px] items-center gap-3 rounded-full bg-white/10 px-4 py-3 text-left backdrop-blur-md transition-colors hover:bg-white hover:text-stone-900 md:min-w-0"
                  >
                    <Icon size={18} />
                    <span>
                      <span className="block text-xs font-black uppercase tracking-widest">{category.label}</span>
                      <span className="block text-[11px] text-white/55 group-hover:text-stone-500">{category.hint}</span>
                    </span>
                  </Link>
                );
              })}
            </div>
          </motion.div>

          <div className="mt-7 grid max-w-3xl grid-cols-1 gap-3 sm:grid-cols-3 md:mt-12">
            {onboardingSteps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.08 }}
                className="border-t border-white/20 pt-4"
              >
                <div className="mb-2 text-[10px] font-black uppercase tracking-widest text-white/40">0{index + 1}</div>
                <h2 className="text-sm font-bold">{step.title}</h2>
                <p className="mt-1 text-xs leading-relaxed text-white/55">{step.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 py-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-12 lg:py-20">
        <div>
          <div className="mb-5 inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.24em] text-brand-primary">
            <SlidersHorizontal size={14} /> Popular right now
          </div>
          <h2 className="text-3xl font-serif leading-tight md:text-5xl">Products people are deciding between.</h2>
          <p className="mt-5 text-stone-500">
            Start with popular pieces, compare what matters, and keep your favorites in one place.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/shop" className="inline-flex items-center gap-2 rounded-full bg-stone-900 px-5 py-3 text-xs font-black uppercase tracking-widest text-white">
              Shop the collection <ArrowRight size={14} />
            </Link>
            <Link to="/analyzer" className="inline-flex items-center gap-2 rounded-full border border-stone-200 px-5 py-3 text-xs font-black uppercase tracking-widest text-stone-700">
              Get room ideas <Camera size={14} />
            </Link>
          </div>
        </div>

        <div>
          {loading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {[1, 2, 3, 4].map(item => (
                <div key={item} className="animate-pulse rounded-[28px] bg-white p-4">
                  <div className="aspect-[4/3] rounded-2xl bg-stone-100" />
                  <div className="mt-4 h-4 w-2/3 rounded bg-stone-100" />
                  <div className="mt-3 h-3 w-1/3 rounded bg-stone-100" />
                </div>
              ))}
            </div>
          ) : loadError ? (
            <div className="rounded-[32px] border border-stone-100 bg-white p-8">
              <h3 className="font-bold text-stone-900">Something went wrong.</h3>
              <p className="mt-2 text-sm text-stone-500">Try again from the shop to see current products.</p>
              <Link to="/shop" className="mt-5 inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-brand-primary">
                Open shop <ArrowRight size={14} />
              </Link>
            </div>
          ) : products.length === 0 ? (
            <div className="rounded-[32px] border border-stone-100 bg-white p-8">
              <h3 className="font-bold text-stone-900">No products loaded yet.</h3>
              <p className="mt-2 text-sm text-stone-500">Start exploring to see recommendations and compare options.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {products.slice(0, 4).map((product, index) => (
                <Link key={product.id} to={`/shop?query=${encodeURIComponent(product.name)}`} className="group rounded-[28px] bg-white p-4 shadow-sm transition-transform hover:-translate-y-1">
                  <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-stone-100">
                    <img src={product.image} alt={product.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" referrerPolicy="no-referrer" />
                    <div className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-stone-700">
                      {getProductInsightLabels(product, preferences, index)[0]}
                    </div>
                  </div>
                  <div className="mt-4 flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h3 className="truncate font-bold text-stone-900">{product.name}</h3>
                      <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-stone-400">{product.category}</p>
                    </div>
                    <p className="shrink-0 font-bold text-brand-primary">KSH {product.price}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="mx-4 overflow-hidden rounded-[28px] bg-brand-primary text-brand-cream md:rounded-[40px]">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-5 py-10 md:grid-cols-2 md:items-center md:px-8 md:py-16">
          <div>
            <p className="mb-4 text-[10px] font-black uppercase tracking-[0.24em] text-white/50">Why shop with us</p>
            <h2 className="text-3xl font-serif leading-tight md:text-5xl">Know what to expect before you pay.</h2>
          </div>
          <div className="grid gap-4">
            {[
              { icon: CheckCircle2, text: 'Final pricing is confirmed clearly at checkout.' },
              { icon: Truck, text: 'Delivery estimates are shown before payment.' },
              { icon: Star, text: 'Seller, location, and availability details are easy to review.' },
              { icon: Sparkles, text: 'Your room ideas help personalize future recommendations.' }
            ].map(item => {
              const Icon = item.icon;
              return (
                <div key={item.text} className="flex items-center gap-4 border-t border-white/10 py-4">
                  <Icon size={20} className="shrink-0 text-white" />
                  <span className="text-sm text-white/80">{item.text}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
