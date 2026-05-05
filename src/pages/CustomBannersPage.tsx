import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, CheckCircle2, Zap, Palette, Clock } from 'lucide-react';
import SEOMeta from '../components/SEOMeta';
import FAQ, { type FAQItem } from '../components/FAQ';

export default function CustomBannersPage() {
  const faqItems: FAQItem[] = [
    {
      question: 'How much does a custom banner cost in Nairobi?',
      answer: 'Pricing depends on size, material, and design complexity. Small banners start from KES 2,500, while large custom designs can range from KES 5,000-50,000. Get a personalized quote by starting your design in our analyzer.',
    },
    {
      question: 'How long does it take to design and print a banner?',
      answer: 'Design typically takes 1-3 days, and printing takes 2-5 days depending on complexity. Rush orders available for an additional fee. You can track your order in real-time.',
    },
    {
      question: 'Do you design the banner for me?',
      answer: 'Yes! You can use our space analyzer tool for custom design suggestions, or our design team can create a custom design for you. Either way, you approve before we print.',
    },
    {
      question: 'What materials are best for outdoor banners?',
      answer: 'We use weather-resistant vinyl banners for outdoor use. They handle rain, sun, and wind. For temporary events, fabric banners are lighter and more portable.',
    },
    {
      question: 'Can I customize the size of my banner?',
      answer: 'Absolutely. Custom sizes available from 0.5m to 10m long. Just let us know your space, and we\'ll suggest the perfect dimensions.',
    },
  ];

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'Infinity Creations - Custom Banners Nairobi',
    description: 'Professional custom banner design and printing services in Nairobi, Kenya',
    url: 'https://infinitycreations.co.ke/custom-banners-nairobi',
    telephone: '+254712345678',
    areaServed: {
      '@type': 'City',
      name: 'Nairobi',
      'areaServed': 'Kenya'
    },
    priceRange: 'KES 2500 - KES 50000',
  };

  return (
    <div className="pb-12 lg:pb-24">
      <SEOMeta
        title="Custom Banners Design & Printing in Nairobi"
        description="Professional custom banner printing in Nairobi. Wide vinyl banners, event banners, shop displays. Design included. Quick turnaround."
        keywords={['custom banners Nairobi', 'banner printing Kenya', 'vinyl banners', 'event banners Nairobi', 'shop banner design']}
        canonicalUrl="https://infinitycreations.co.ke/custom-banners-nairobi"
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
              Custom Banner Design & Printing in Nairobi
            </h1>
            <p className="text-lg md:text-xl text-brand-cream/90 mb-8 max-w-2xl leading-relaxed">
              Professional custom banners for events, shops, promotions, and displays. Design included. Fast turnaround. Made in Nairobi.
            </p>
            <Link
              to="/shop?query=banners"
              className="inline-flex items-center gap-2 bg-brand-cream text-brand-primary font-bold py-3 px-8 rounded-lg hover:bg-opacity-90 transition-all duration-200 transform hover:scale-105"
            >
              Start Your Design <ArrowRight size={20} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* What We Offer */}
      <section className="max-w-7xl mx-auto px-4 py-16 lg:py-24">
        <h2 className="text-3xl md:text-4xl font-serif font-bold text-brand-primary mb-12">What We Offer</h2>
        
        <div className="grid md:grid-cols-2 gap-8">
          {[
            {
              title: 'Event Banners',
              description: 'Wedding, conference, graduation, and party banners. Customizable designs with your branding.',
            },
            {
              title: 'Shop Display Banners',
              description: 'Eye-catching banners for retail spaces, sales promotions, and storefront displays.',
            },
            {
              title: 'Vehicle Banners',
              description: 'Mobile advertising banners for events and promotions.',
            },
            {
              title: 'Custom Printing',
              description: 'Vinyl, fabric, or canvas. Any size, any design. Weather-resistant options available.',
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

      {/* How It Works */}
      <section className="bg-stone-50 py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-brand-primary mb-12">How It Works</h2>
          
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { icon: Palette, title: 'Design', desc: 'Upload or customize your banner design' },
              { icon: CheckCircle2, title: 'Review', desc: 'Approve design before printing' },
              { icon: Zap, title: 'Print', desc: 'We print with premium materials' },
              { icon: Clock, title: 'Deliver', desc: 'Quick delivery across Nairobi' },
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
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-6">Ready for Custom Banners?</h2>
          <p className="text-lg text-brand-cream/90 mb-8 max-w-2xl mx-auto">
            Design, customize, and order your professional banners today. Quality printing, fast delivery.
          </p>
          <Link
            to="/shop?query=banners"
            className="inline-flex items-center gap-2 bg-brand-cream text-brand-primary font-bold py-3 px-8 rounded-lg hover:bg-opacity-90 transition-all duration-200 transform hover:scale-105"
          >
            Browse Banners <ArrowRight size={20} />
          </Link>
        </motion.div>
      </section>

      {/* FAQ */}
      <FAQ items={faqItems} title="Custom Banners FAQs" />
    </div>
  );
}
