import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, CheckCircle2, Zap, Palette, Clock } from 'lucide-react';
import SEOMeta from '../components/SEOMeta';
import FAQ, { type FAQItem } from '../components/FAQ';

export default function CustomStickersPage() {
  const faqItems: FAQItem[] = [
    {
      question: 'How much do custom stickers cost in Nairobi?',
      answer: 'Custom stickers start from KES 500 per unit for small orders. Bulk orders get better pricing. Laptop sticker packs start from KES 2,000. Get a personalized quote on our platform.',
    },
    {
      question: 'What types of stickers do you offer?',
      answer: 'We offer vinyl stickers, waterproof stickers, holographic stickers, and transparent stickers. Perfect for laptops, water bottles, cars, bikes, and merchandise.',
    },
    {
      question: 'Can I order custom branded stickers for my business?',
      answer: 'Absolutely! We create custom branded stickers for businesses, events, and merchandise. Great for promotions and building brand awareness.',
    },
    {
      question: 'How long do stickers last?',
      answer: 'Our vinyl stickers last 2-3 years outdoors and 3-5 years indoors. UV-resistant materials help them withstand sun exposure.',
    },
    {
      question: 'What\'s the minimum order for custom stickers?',
      answer: 'No minimum order typically. We can do single custom stickers or bulk orders. The more you order, the better the price per unit.',
    },
  ];

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'Custom Stickers Nairobi',
    description: 'Custom vinyl stickers in Nairobi - laptop stickers, waterproof stickers, branded stickers',
    url: 'https://infinitycreations.co.ke/custom-stickers-nairobi',
    brand: { '@type': 'Brand', name: 'Infinity Creations' },
  };

  return (
    <div className="pb-12 lg:pb-24">
      <SEOMeta
        title="Custom Stickers Nairobi | Laptop & Vinyl Stickers Kenya"
        description="Custom vinyl stickers in Nairobi. Laptop stickers, waterproof stickers, branded stickers. Design included. Fast production."
        keywords={['custom stickers Nairobi', 'laptop stickers Kenya', 'vinyl stickers', 'waterproof stickers Kenya', 'branded stickers']}
        canonicalUrl="https://infinitycreations.co.ke/custom-stickers-nairobi"
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
              Custom Stickers & Vinyl in Nairobi
            </h1>
            <p className="text-lg md:text-xl text-brand-cream/90 mb-8 max-w-2xl leading-relaxed">
              Laptop stickers, waterproof vinyl stickers, and branded merchandise. Fully customizable. Great for personal style or business promotions.
            </p>
            <Link
              to="/shop?query=stickers"
              className="inline-flex items-center gap-2 bg-brand-cream text-brand-primary font-bold py-3 px-8 rounded-lg hover:bg-opacity-90 transition-all duration-200 transform hover:scale-105"
            >
              Design Your Stickers <ArrowRight size={20} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* What We Offer */}
      <section className="max-w-7xl mx-auto px-4 py-16 lg:py-24">
        <h2 className="text-3xl md:text-4xl font-serif font-bold text-brand-primary mb-12">Sticker Types</h2>
        
        <div className="grid md:grid-cols-2 gap-8">
          {[
            {
              title: 'Laptop Stickers',
              description: 'Waterproof stickers for laptops, MacBooks, and devices. Express your personality.',
            },
            {
              title: 'Vinyl Stickers',
              description: 'Durable vinyl for cars, bikes, water bottles. UV-resistant and long-lasting.',
            },
            {
              title: 'Branded Merchandise',
              description: 'Custom stickers for businesses, events, and promotions. Build brand awareness.',
            },
            {
              title: 'Holographic & Specialty',
              description: 'Unique holographic, metallic, and special finish stickers for premium look.',
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
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-brand-primary mb-12">Our Process</h2>
          
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { icon: Palette, title: 'Design', desc: 'Create your custom sticker design' },
              { icon: CheckCircle2, title: 'Approve', desc: 'Review mockup and approve' },
              { icon: Zap, title: 'Print', desc: 'High-quality printing with precision' },
              { icon: Clock, title: 'Deliver', desc: 'Quick delivery throughout Nairobi' },
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
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-6">Ready for Custom Stickers?</h2>
          <p className="text-lg text-brand-cream/90 mb-8 max-w-2xl mx-auto">
            Express yourself with custom stickers. Design, print, and order online. Fast delivery.
          </p>
          <Link
            to="/shop?query=stickers"
            className="inline-flex items-center gap-2 bg-brand-cream text-brand-primary font-bold py-3 px-8 rounded-lg hover:bg-opacity-90 transition-all duration-200 transform hover:scale-105"
          >
            Create Stickers <ArrowRight size={20} />
          </Link>
        </motion.div>
      </section>

      {/* FAQ */}
      <FAQ items={faqItems} title="Custom Stickers FAQs" />
    </div>
  );
}
