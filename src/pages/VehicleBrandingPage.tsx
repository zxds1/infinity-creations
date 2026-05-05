import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, CheckCircle2, Zap, Palette, Clock } from 'lucide-react';
import SEOMeta from '../components/SEOMeta';
import FAQ, { type FAQItem } from '../components/FAQ';

export default function VehicleBrandingPage() {
  const faqItems: FAQItem[] = [
    {
      question: 'How much does vehicle branding cost in Nairobi?',
      answer: 'Pricing depends on vehicle size and design complexity. Boda boda branding starts from KES 3,000, van branding from KES 8,000, and full vehicle wraps from KES 50,000+. Get a quote based on your vehicle.',
    },
    {
      question: 'How long does vehicle branding last?',
      answer: 'Our high-quality vinyl graphics last 3-5 years in Kenya\'s climate with proper care. UV-resistant materials protect against sun damage.',
    },
    {
      question: 'Can you design the branding for me?',
      answer: 'Yes! Our design team can create custom branding that matches your business identity. We\'ll work with you to get it perfect before application.',
    },
    {
      question: 'How long does it take to apply the branding?',
      answer: 'Application typically takes 1-3 days depending on complexity. We work fast to minimize your vehicle downtime.',
    },
    {
      question: 'Is vehicle branding good for small businesses?',
      answer: 'Absolutely! Vehicle branding is an affordable, effective way to increase visibility. Your boda boda or van becomes a mobile advertisement.',
    },
  ];

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'Infinity Creations - Vehicle Branding Nairobi',
    description: 'Professional vehicle branding and wraps in Nairobi - boda boda branding, van wraps, truck advertising',
    url: 'https://infinitycreations.co.ke/vehicle-branding-nairobi',
    areaServed: {
      '@type': 'City',
      name: 'Nairobi',
      'areaServed': 'Kenya'
    },
  };

  return (
    <div className="pb-12 lg:pb-24">
      <SEOMeta
        title="Vehicle Branding & Wraps in Nairobi | Boda Boda Branding"
        description="Professional vehicle branding in Nairobi. Boda boda branding, van wraps, truck advertising. Custom designs. Fast application."
        keywords={['vehicle branding Nairobi', 'boda boda branding', 'van wraps Kenya', 'truck advertising', 'car branding Nairobi']}
        canonicalUrl="https://infinitycreations.co.ke/vehicle-branding-nairobi"
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
              Vehicle Branding & Wraps in Nairobi
            </h1>
            <p className="text-lg md:text-xl text-brand-cream/90 mb-8 max-w-2xl leading-relaxed">
              Turn your vehicle into a mobile advertisement. Boda boda branding, van wraps, truck advertising. Professional design & installation.
            </p>
            <Link
              to="/shop?query=vehicle-branding"
              className="inline-flex items-center gap-2 bg-brand-cream text-brand-primary font-bold py-3 px-8 rounded-lg hover:bg-opacity-90 transition-all duration-200 transform hover:scale-105"
            >
              Design Your Vehicle Branding <ArrowRight size={20} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* What We Offer */}
      <section className="max-w-7xl mx-auto px-4 py-16 lg:py-24">
        <h2 className="text-3xl md:text-4xl font-serif font-bold text-brand-primary mb-12">Our Services</h2>
        
        <div className="grid md:grid-cols-2 gap-8">
          {[
            {
              title: 'Boda Boda Branding',
              description: 'Cost-effective branding for boda bodas. Logos, contact info, and business details on your bike.',
            },
            {
              title: 'Van & Truck Wraps',
              description: 'Full vehicle braps for vans, delivery trucks, and commercial vehicles. Maximum visibility.',
            },
            {
              title: 'Partial Wraps',
              description: 'Side graphics, roof decals, and window decals. Flexible branding options.',
            },
            {
              title: 'Removal & Replacement',
              description: 'Professional removal of old branding without damage, plus application of new designs.',
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
              { icon: Palette, title: 'Consultation', desc: 'Discuss your branding needs and vehicle specs' },
              { icon: CheckCircle2, title: 'Design', desc: 'Custom design tailored to your brand' },
              { icon: Zap, title: 'Approval', desc: 'Review and approve before production' },
              { icon: Clock, title: 'Installation', desc: 'Professional application or delivery' },
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
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-6">Ready to Brand Your Vehicle?</h2>
          <p className="text-lg text-brand-cream/90 mb-8 max-w-2xl mx-auto">
            Get professional branding that turns your vehicle into an advertisement. Start today.
          </p>
          <Link
            to="/shop?query=vehicle-branding"
            className="inline-flex items-center gap-2 bg-brand-cream text-brand-primary font-bold py-3 px-8 rounded-lg hover:bg-opacity-90 transition-all duration-200 transform hover:scale-105"
          >
            Explore Options <ArrowRight size={20} />
          </Link>
        </motion.div>
      </section>

      {/* FAQ */}
      <FAQ items={faqItems} title="Vehicle Branding FAQs" />
    </div>
  );
}
