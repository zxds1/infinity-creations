import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, CheckCircle2, Zap, Palette, Clock } from 'lucide-react';
import SEOMeta from '../components/SEOMeta';
import FAQ, { type FAQItem } from '../components/FAQ';

export default function PhotoMountsPage() {
  const faqItems: FAQItem[] = [
    {
      question: 'What are photo mounts and when should I use them?',
      answer: 'Photo mounts display photos without framing. Perfect for events, memory walls, home decor, and professional displays. They\'re affordable and custom-made to your specifications.',
    },
    {
      question: 'How much do custom photo mounts cost?',
      answer: 'Pricing depends on size and material. Small photo mounts start from KES 1,500, while large custom displays start from KES 5,000. Bulk orders available at discounted rates.',
    },
    {
      question: 'What materials do you use for photo mounts?',
      answer: 'We use foam board, corrugated cardboard, wood, and acrylic depending on your needs. Each material offers different durability and aesthetic.',
    },
    {
      question: 'Can I make custom photo arrangements?',
      answer: 'Yes! Create collages, memory walls, or themed displays. We can design the layout for you.',
    },
    {
      question: 'How long does it take to get photo mounts?',
      answer: 'Custom photo mounts typically take 3-7 days. Rush options available for urgent needs.',
    },
  ];

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'Custom Photo Mounts Kenya',
    description: 'Custom photo mounts in Nairobi - foam board mounts, wood mounts, acrylic displays',
    url: 'https://infinitycreations.co.ke/photo-mounts-kenya',
    brand: { '@type': 'Brand', name: 'Infinity Creations' },
  };

  return (
    <div className="pb-12 lg:pb-24">
      <SEOMeta
        title="Custom Photo Mounts Kenya | Photo Display Prints Nairobi"
        description="Custom photo mounts in Nairobi. Foam board, wood, and acrylic displays. Perfect for events, memories, and home decor."
        keywords={['photo mounts Kenya', 'photo mounts Nairobi', 'foam board mounts', 'photo displays', 'custom photo printing']}
        canonicalUrl="https://infinitycreations.co.ke/photo-mounts-kenya"
        schema={schema}
      />

      {/* Hero */}
      <section className="relative min-h-[60vh] bg-gradient-to-b from-brand-primary to-brand-primary/90 text-brand-cream overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,.2)_25%,rgba(255,255,255,.2)_50%,transparent_50%,transparent_75%,rgba(255,255,255,.2)_75%,rgba(255,255,255,.2))] bg-[length:20px_20px]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 py-16 lg:py-24 flex flex-col justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold mb-6 leading-tight">
              Custom Photo Mounts in Kenya
            </h1>
            <p className="text-lg md:text-xl text-brand-cream/90 mb-8 max-w-2xl leading-relaxed">
              Display your memories beautifully. Foam board, wood, and acrylic photo mounts. Perfect for events, weddings, and home decor.
            </p>
            <Link
              to="/shop?query=photo-mounts"
              className="inline-flex items-center gap-2 bg-brand-cream text-brand-primary font-bold py-3 px-8 rounded-lg hover:bg-opacity-90 transition-all duration-200 transform hover:scale-105"
            >
              Create Photo Display <ArrowRight size={20} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* What We Offer */}
      <section className="max-w-7xl mx-auto px-4 py-16 lg:py-24">
        <h2 className="text-3xl md:text-4xl font-serif font-bold text-brand-primary mb-12">Our Photo Mount Options</h2>
        
        <div className="grid md:grid-cols-2 gap-8">
          {[
            {
              title: 'Foam Board Mounts',
              description: 'Lightweight, affordable, and versatile. Perfect for temporary displays and events.',
            },
            {
              title: 'Wood Photo Mounts',
              description: 'Premium wood backing for professional, gallery-quality displays.',
            },
            {
              title: 'Acrylic Photo Stands',
              description: 'Modern, clear acrylic for sleek desktop or shelf displays.',
            },
            {
              title: 'Custom Collages',
              description: 'Multi-photo arrangements designed to your specifications.',
            },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-6 border border-stone-200 rounded-lg hover:border-brand-primary/30 transition-colors"
            >
              <h3 className="text-xl font-semibold text-brand-primary mb-3">{item.title}</h3>
              <p className="text-stone-600">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Process */}
      <section className="bg-stone-50 py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-brand-primary mb-12">How We Create Your Photo Mounts</h2>
          
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { icon: Palette, title: 'Upload Photos', desc: 'Share your photos and preferences' },
              { icon: CheckCircle2, title: 'Design', desc: 'We arrange and design your display' },
              { icon: Zap, title: 'Print & Mount', desc: 'High-quality printing and mounting' },
              { icon: Clock, title: 'Ready to Display', desc: 'Beautiful display for your space' },
            ].map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={i} className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-primary text-brand-cream rounded-full mb-4">
                    <Icon size={32} />
                  </div>
                  <h3 className="font-semibold text-brand-primary mb-2">{step.title}</h3>
                  <p className="text-stone-600 text-sm">{step.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 py-16 lg:py-24">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="bg-gradient-to-r from-brand-primary to-brand-primary/80 text-brand-cream rounded-2xl p-8 md:p-12 text-center"
        >
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-6">Display Your Memories</h2>
          <p className="text-lg text-brand-cream/90 mb-8 max-w-2xl mx-auto">
            Turn your favorite photos into beautiful displays. Custom photo mounts designed and printed by experts.
          </p>
          <Link
            to="/shop?query=photo-mounts"
            className="inline-flex items-center gap-2 bg-brand-cream text-brand-primary font-bold py-3 px-8 rounded-lg hover:bg-opacity-90 transition-all duration-200 transform hover:scale-105"
          >
            Order Photo Mounts <ArrowRight size={20} />
          </Link>
        </motion.div>
      </section>

      {/* FAQ */}
      <FAQ items={faqItems} title="Photo Mounts FAQs" />
    </div>
  );
}
