import { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Building2, Camera, CheckCircle2, Gift, Image as ImageIcon, MessageCircle, MonitorSmartphone, Paintbrush, Search, Send, Sparkles, Truck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, db, collection, getDocs, query, orderBy, limit, addDoc, serverTimestamp } from '../lib/firebase';
import { getProductInsightLabels, getStoredPreferences } from '../lib/behavior';
import { defaultSiteContent, fetchSiteContent, type SiteContent } from '../lib/siteContent';
import { toast } from 'react-hot-toast';

const categoryIcons = [Gift, Paintbrush, MonitorSmartphone, Building2];

export default function Home() {
  const [products, setProducts] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [content, setContent] = useState<SiteContent>(defaultSiteContent);
  const [activeTestimonialIndex, setActiveTestimonialIndex] = useState(0);
  const [testimonialView, setTestimonialView] = useState<'before' | 'after'>('after');
  const [testimonialForm, setTestimonialForm] = useState({ clientName: '', project: '', quote: '', beforeImage: '', afterImage: '' });
  const [submittingTestimonial, setSubmittingTestimonial] = useState(false);
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

  const visibleTestimonials = content.testimonials.filter(testimonial => testimonial.quote.trim());
  const activeTestimonial = visibleTestimonials[activeTestimonialIndex % Math.max(visibleTestimonials.length, 1)];

  const submitTestimonial = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!testimonialForm.clientName.trim() || !testimonialForm.quote.trim()) {
      toast.error('Name and testimonial are required');
      return;
    }

    setSubmittingTestimonial(true);
    try {
      await addDoc(collection(db, 'testimonialSubmissions'), {
        ...testimonialForm,
        clientName: testimonialForm.clientName.trim(),
        project: testimonialForm.project.trim(),
        quote: testimonialForm.quote.trim(),
        status: 'pending',
        userId: auth.currentUser?.uid || 'guest',
        createdAt: serverTimestamp()
      });
      setTestimonialForm({ clientName: '', project: '', quote: '', beforeImage: '', afterImage: '' });
      toast.success('Thanks. Your testimonial was sent for review.');
    } catch {
      toast.error('Could not send testimonial. Please try again.');
    } finally {
      setSubmittingTestimonial(false);
    }
  };

  return (
    <div className="pb-12 lg:pb-24">
      <section className="relative min-h-[calc(100svh-64px)] overflow-hidden bg-stone-950 text-white md:min-h-[calc(100svh-80px)]">
        <img
          src={content.homeHeroImage}
          alt="Design, print, and branding work"
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
              {content.coreHeadline}
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/75 md:mt-6 md:text-lg">
              {content.coreSubtext}
            </p>

            <form onSubmit={submitSearch} className="mt-7 max-w-2xl md:mt-10">
              <label className="mb-3 block text-sm font-bold text-white md:text-lg">{content.homeHeroTitle}</label>
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
                  Start creating <ArrowRight size={16} />
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
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 lg:py-20">
        <div className="mb-8 max-w-3xl">
          <p className="mb-4 text-[10px] font-black uppercase tracking-[0.24em] text-brand-primary">Quick entry</p>
          <h2 className="text-3xl font-serif leading-tight md:text-5xl">Quick categories</h2>
          <p className="mt-4 text-stone-500">Choose a starting point, then customize it in Explore.</p>
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
                  <p className="mt-2 min-h-12 text-sm leading-relaxed text-stone-500">{group.shortDescription}</p>
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
          <h2 className="text-3xl font-serif leading-tight md:text-5xl">Popular Right Now</h2>
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
                  <div className="mt-4">
                    <h3 className="truncate font-bold text-stone-900">Custom {product.name}</h3>
                    <p className="mt-1 text-sm text-stone-500">Designed and printed for you</p>
                    <span className="mt-5 inline-flex items-center gap-2 rounded-full bg-brand-primary px-4 py-2 text-[10px] font-black uppercase tracking-widest text-brand-cream">
                      Customize <ArrowRight size={13} />
                    </span>
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
              { icon: CheckCircle2, text: 'Choose what to create.' },
              { icon: Paintbrush, text: 'Customize or share your idea.' },
              { icon: Truck, text: 'We design, print, deliver.' }
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

      {visibleTestimonials.length > 0 && activeTestimonial && (
        <section className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 py-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-start lg:gap-14 lg:py-20">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.24em] text-brand-primary">
              <MessageCircle size={14} /> Testimonials
            </div>
            <h2 className="text-3xl font-serif leading-tight md:text-5xl">{content.testimonialsTitle}</h2>
            <p className="mt-5 max-w-xl text-stone-500">{content.testimonialsSubtitle}</p>

            <div className="mt-8 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {visibleTestimonials.map((testimonial, index) => (
                <button
                  key={testimonial.id}
                  onClick={() => setActiveTestimonialIndex(index)}
                  className={`min-h-12 whitespace-nowrap rounded-full px-5 text-[10px] font-black uppercase tracking-widest transition-colors ${index === activeTestimonialIndex ? 'bg-brand-primary text-brand-cream' : 'bg-white text-stone-500 hover:text-brand-primary'}`}
                >
                  {testimonial.project || testimonial.clientName}
                </button>
              ))}
            </div>

            <blockquote className="mt-10 border-l-4 border-brand-primary pl-6">
              <p className="text-2xl font-serif leading-snug text-stone-900 md:text-3xl">"{activeTestimonial.quote}"</p>
              <footer className="mt-5 text-sm font-bold text-stone-500">
                {activeTestimonial.clientName}
                {activeTestimonial.project && <span className="text-stone-300"> · {activeTestimonial.project}</span>}
              </footer>
            </blockquote>
          </div>

          <div className="overflow-hidden rounded-[32px] bg-white p-3 shadow-sm md:rounded-[40px]">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[24px] bg-stone-100 md:rounded-[32px]">
              <img
                src={testimonialView === 'before' ? activeTestimonial.beforeImage : activeTestimonial.afterImage}
                alt={`${testimonialView} ${activeTestimonial.project || 'testimonial project'}`}
                className="h-full w-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute left-4 top-4 inline-flex rounded-full bg-white/90 p-1 text-[10px] font-black uppercase tracking-widest shadow-sm backdrop-blur">
                {(['before', 'after'] as const).map(view => (
                  <button
                    key={view}
                    onClick={() => setTestimonialView(view)}
                    className={`rounded-full px-4 py-2 transition-colors ${testimonialView === view ? 'bg-brand-primary text-brand-cream' : 'text-stone-500'}`}
                  >
                    {view}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="mx-4 overflow-hidden rounded-[28px] bg-white md:rounded-[40px]">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-5 py-10 md:grid-cols-[0.85fr_1.15fr] md:px-8 md:py-16">
          <div>
            <p className="mb-4 text-[10px] font-black uppercase tracking-[0.24em] text-brand-primary">Add testimonial</p>
            <h2 className="text-3xl font-serif leading-tight md:text-5xl">Share your Maridadi result</h2>
            <p className="mt-5 text-stone-500">Tell us what changed. Add before and after image links if you have them.</p>
          </div>
          <form onSubmit={submitTestimonial} className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <input
              value={testimonialForm.clientName}
              onChange={(event) => setTestimonialForm(prev => ({ ...prev, clientName: event.target.value }))}
              placeholder="Your name"
              className="min-h-12 rounded-2xl border border-stone-100 bg-stone-50 px-4 text-sm outline-none focus:border-brand-primary"
            />
            <input
              value={testimonialForm.project}
              onChange={(event) => setTestimonialForm(prev => ({ ...prev, project: event.target.value }))}
              placeholder="Project type"
              className="min-h-12 rounded-2xl border border-stone-100 bg-stone-50 px-4 text-sm outline-none focus:border-brand-primary"
            />
            <textarea
              value={testimonialForm.quote}
              onChange={(event) => setTestimonialForm(prev => ({ ...prev, quote: event.target.value }))}
              placeholder="What did we create for you?"
              className="min-h-28 rounded-2xl border border-stone-100 bg-stone-50 p-4 text-sm outline-none focus:border-brand-primary md:col-span-2"
            />
            <div className="relative">
              <ImageIcon size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                value={testimonialForm.beforeImage}
                onChange={(event) => setTestimonialForm(prev => ({ ...prev, beforeImage: event.target.value }))}
                placeholder="Before image URL"
                className="min-h-12 w-full rounded-2xl border border-stone-100 bg-stone-50 pl-11 pr-4 text-sm outline-none focus:border-brand-primary"
              />
            </div>
            <div className="relative">
              <ImageIcon size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                value={testimonialForm.afterImage}
                onChange={(event) => setTestimonialForm(prev => ({ ...prev, afterImage: event.target.value }))}
                placeholder="After image URL"
                className="min-h-12 w-full rounded-2xl border border-stone-100 bg-stone-50 pl-11 pr-4 text-sm outline-none focus:border-brand-primary"
              />
            </div>
            <button
              disabled={submittingTestimonial}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-stone-900 px-6 text-[10px] font-black uppercase tracking-widest text-white disabled:opacity-60 md:col-span-2"
            >
              {submittingTestimonial ? 'Sending...' : 'Send testimonial'} <Send size={14} />
            </button>
          </form>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 lg:py-20">
        <div className="flex flex-col items-start justify-between gap-6 border-t border-stone-200 pt-10 md:flex-row md:items-center">
          <div>
            <p className="mb-3 text-[10px] font-black uppercase tracking-[0.24em] text-brand-primary">Contact</p>
            <h2 className="text-3xl font-serif leading-tight md:text-5xl">{content.contact.heading}</h2>
            <p className="mt-4 max-w-2xl text-stone-500">{content.contact.subtext}</p>
          </div>
          <a href={content.contact.ctaHref} className="inline-flex items-center gap-2 rounded-full bg-stone-900 px-6 py-4 text-xs font-black uppercase tracking-widest text-white">
            {content.contact.ctaLabel} <Sparkles size={16} />
          </a>
        </div>
      </section>
    </div>
  );
}
