import { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Building2, Camera, CheckCircle2, Gift, MonitorSmartphone, Paintbrush, Search, Sparkles, Star, Truck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { db, collection, getDocs, query, orderBy, limit } from '../lib/firebase';
import { getProductInsightLabels, getStoredPreferences } from '../lib/behavior';
import { defaultSiteContent, fetchSiteContent, type SiteContent } from '../lib/siteContent';

const onboardingSteps = [
  { title: 'Choose what you want to create', body: 'Start with personal, device, decor, or business work.' },
  { title: 'Customize your design or share your idea', body: 'Add style notes, details, or a reference image.' },
  { title: 'We design, print, and deliver', body: 'Maridadi turns the request into a finished piece.' }
];

const categoryIcons = [Gift, Paintbrush, MonitorSmartphone, Building2];

export default function Home() {
  const [products, setProducts] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [content, setContent] = useState<SiteContent>(defaultSiteContent);
  const navigate = useNavigate();
  const preferences = useMemo(() => getStoredPreferences(), []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [snap, siteContent] = await Promise.all([
          getDocs(query(collection(db, 'products'), orderBy('rating', 'desc'), limit(6))),
          fetchSiteContent()
        ]);
        setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        setContent(siteContent);
      } catch (err) {
        setLoadError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
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
            <p className="mb-3 text-[10px] font-black uppercase tracking-[0.24em] text-white/60 md:mb-4 md:text-[11px]">{content.coreHeadline}</p>
            <h1 className="text-4xl font-semibold leading-[0.98] tracking-normal sm:text-5xl md:text-7xl lg:text-8xl">
              {content.homeHeroTitle}
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/75 md:mt-6 md:text-lg">
              {content.homeHeroSubtitle}
            </p>

            <form onSubmit={submitSearch} className="mt-7 max-w-2xl md:mt-10">
              <div className="flex flex-col gap-2 rounded-[24px] bg-white p-2 shadow-2xl shadow-stone-950/30 sm:flex-row md:rounded-[28px]">
                <div className="flex min-h-14 flex-1 items-center gap-3 px-4">
                  <Search size={20} className="text-stone-400" />
                  <input
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Search banners, portraits, stickers, jewellery..."
                    className="w-full bg-transparent text-sm font-semibold text-stone-900 outline-none placeholder:text-stone-400"
                  />
                </div>
                <button className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-brand-primary px-6 text-xs font-black uppercase tracking-widest text-brand-cream md:min-h-14">
                  Explore <ArrowRight size={16} />
                </button>
              </div>
            </form>

            <div className="mt-5 flex gap-2 overflow-x-auto pb-2 scrollbar-hide md:mt-6 md:flex-wrap md:gap-3">
              {content.categories.map((category, index) => {
                const Icon = categoryIcons[index % categoryIcons.length];
                return (
                  <Link
                    key={category.title}
                    to={`/shop?query=${encodeURIComponent(category.search)}`}
                    className="group inline-flex min-w-[190px] items-center gap-3 rounded-full bg-white/10 px-4 py-3 text-left backdrop-blur-md transition-colors hover:bg-white hover:text-stone-900 md:min-w-0"
                  >
                    <Icon size={18} />
                    <span>
                      <span className="block text-xs font-black uppercase tracking-widest">{category.shortLabel}</span>
                      <span className="block text-[11px] text-white/55 group-hover:text-stone-500">{category.shortDescription}</span>
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

      <section className="mx-auto max-w-7xl px-4 py-12 lg:py-20">
        <div className="mb-8 max-w-3xl">
          <p className="mb-4 text-[10px] font-black uppercase tracking-[0.24em] text-brand-primary">Quick entry</p>
          <h2 className="text-3xl font-serif leading-tight md:text-5xl">What do you want to create today?</h2>
          <p className="mt-4 text-stone-500">{content.coreSubtext}</p>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {content.categories.map((group, index) => (
            <motion.div
              key={group.title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ delay: index * 0.06 }}
            >
              <Link to={`/shop?query=${encodeURIComponent(group.search)}`} className="group block overflow-hidden rounded-[28px] bg-white shadow-sm">
                <div className="aspect-[4/3] overflow-hidden bg-stone-100">
                  <img src={group.image} alt={group.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" referrerPolicy="no-referrer" />
                </div>
                <div className="p-5">
                  <h3 className="text-xl font-bold text-stone-900">{group.shortLabel}</h3>
                  <p className="mt-2 min-h-12 text-sm leading-relaxed text-stone-500">{group.description}</p>
                  <span className="mt-5 inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-brand-primary">
                    Customize <ArrowRight size={14} />
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 py-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-12 lg:py-20">
        <div>
          <div className="mb-5 inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.24em] text-brand-primary">
            <Sparkles size={14} /> Featured work
          </div>
          <h2 className="text-3xl font-serif leading-tight md:text-5xl">{content.featuredTitle}</h2>
          <p className="mt-5 text-stone-500">
            {content.featuredSubtitle}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/shop" className="inline-flex items-center gap-2 rounded-full bg-stone-900 px-5 py-3 text-xs font-black uppercase tracking-widest text-white">
              Explore <ArrowRight size={14} />
            </Link>
            <Link to="/analyzer" className="inline-flex items-center gap-2 rounded-full border border-stone-200 px-5 py-3 text-xs font-black uppercase tracking-widest text-stone-700">
              Customize <Camera size={14} />
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
              <p className="mt-2 text-sm text-stone-500">Something went wrong. Please try again.</p>
              <Link to="/shop" className="mt-5 inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-brand-primary">
                Explore designs <ArrowRight size={14} />
              </Link>
            </div>
          ) : products.length === 0 ? (
            <div className="rounded-[32px] border border-stone-100 bg-white p-8">
              <h3 className="font-bold text-stone-900">Nothing here yet.</h3>
              <p className="mt-2 text-sm text-stone-500">Nothing here yet — start by exploring designs.</p>
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
                      <h3 className="truncate font-bold text-stone-900">Custom {product.name}</h3>
                      <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-stone-400">{product.category}</p>
                    </div>
                    <p className="shrink-0 font-bold text-brand-primary">From KSH {product.price}</p>
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
            <p className="mb-4 text-[10px] font-black uppercase tracking-[0.24em] text-white/50">How it works</p>
            <h2 className="text-3xl font-serif leading-tight md:text-5xl">{content.howItWorksTitle}</h2>
          </div>
          <div className="grid gap-4">
            {[
              { icon: CheckCircle2, text: 'Choose what you want to create.' },
              { icon: Paintbrush, text: 'Customize your design or share your idea.' },
              { icon: Truck, text: 'We design, print, and deliver.' },
              { icon: Star, text: 'Save ideas and return when you are ready.' }
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
