import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, CheckCircle2, Zap, Palette, Clock, Smartphone, Lightbulb, TrendingUp } from 'lucide-react';
import SEOMeta from '../components/SEOMeta';
import FAQ, { type FAQItem } from '../components/FAQ';

export default function BrandingServicesPage() {
  const faqItems: FAQItem[] = [
    {
      question: 'What branding services do you offer in Nairobi?',
      answer: 'We offer complete branding solutions including logo design, banner printing, vehicle branding, signage, and business identity packages. Custom designs tailored to your business needs.',
    },
    {
      question: 'How much do branding services cost in Nairobi?',
      answer: 'Pricing varies by scope. Logo design starts from KES 5,000. Banner printing from KES 2,500. Vehicle branding from KES 3,000. Shop signage from KES 8,000. Get a personalized quote.',
    },
    {
      question: 'Do you design the branding for me?',
      answer: 'Yes! Our design team creates custom branding that matches your business identity. We handle everything from concept to final production.',
    },
    {
      question: 'How long does branding take?',
      answer: 'Logo design: 3-5 days. Banner printing: 2-5 days. Vehicle branding: 1-3 days application. Rush orders available for urgent needs.',
    },
    {
      question: 'What makes your branding services different?',
      answer: 'We combine affordable pricing, fast turnaround, professional design, and local expertise. Your business gets quality branding without the high corporate agency prices.',
    },
    {
      question: 'Can I use your branding for both online and offline?',
      answer: 'Absolutely! We create versatile branding that works on digital platforms, social media, physical signage, vehicle wraps, and merchandise.',
    },
  ];

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'Maridadi Creations - Branding Services Nairobi',
    description: 'Professional branding services in Nairobi. Logo design, banners, vehicle branding, signage. Complete business branding solutions.',
    url: 'https://maridadi.co.ke/branding-services-nairobi',
    areaServed: { '@type': 'City', name: 'Nairobi', 'areaServed': 'Kenya' },
    priceRange: 'KES 2500 - KES 50000+',
    aggregateRating: { '@type': 'AggregateRating', ratingValue: '4.9', reviewCount: '150' },
  };

  return (
    <div className="pb-12 lg:pb-24">
      <SEOMeta
        title="Branding Services Nairobi | Professional Business Branding Kenya"
        description="Professional branding services in Nairobi. Logo design, custom banners, vehicle branding, shop signage. Expert design, fast turnaround, affordable pricing."
        keywords={[
          'branding services Nairobi',
          'professional branding Kenya',
          'business branding Nairobi',
          'shop branding services',
          'brand identity design Kenya',
          'logo design Nairobi',
        ]}
        canonicalUrl="https://maridadi.co.ke/branding-services-nairobi"
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
              Professional Branding Services Nairobi
            </h1>
            <p className="text-lg md:text-xl text-brand-cream/90 mb-8 max-w-2xl leading-relaxed">
              Complete business branding solutions. Logo design, banners, vehicle branding, shop signage. Affordable. Fast. Professional.
            </p>
            <Link
              to="/shop?query=branding"
              className="inline-flex items-center gap-2 bg-brand-cream text-brand-primary font-bold py-3 px-8 rounded-lg hover:bg-opacity-90 transition-all duration-200 transform hover:scale-105"
            >
              Explore Branding Services <ArrowRight size={20} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Services Overview */}
      <section className="max-w-7xl mx-auto px-4 py-16 lg:py-24">
        <h2 className="text-3xl md:text-4xl font-serif font-bold text-brand-primary mb-12">Complete Branding Solutions</h2>
        
        <div className="grid md:grid-cols-2 gap-8">
          {[
            {
              icon: Palette,
              title: 'Banner Printing Nairobi',
              desc: 'Custom banners for events, shops, and promotions. Vinyl, fabric, and canvas options.',
              link: '/custom-banners-nairobi',
            },
            {
              icon: Smartphone,
              title: 'Vehicle Branding Kenya',
              desc: 'Boda boda branding, van wraps, truck advertising. Mobile marketing solutions.',
              link: '/vehicle-branding-nairobi',
            },
            {
              icon: Lightbulb,
              title: 'Shop Signage Nairobi',
              desc: 'Professional shop signs, window displays, and storefront branding.',
              link: '/shop?query=signage',
            },
            {
              icon: TrendingUp,
              title: 'Business Identity',
              desc: 'Logo design, business cards, complete brand identity packages.',
              link: '/shop?query=business-identity',
            },
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-6 border border-stone-200 rounded-lg hover:border-brand-primary/30 transition-colors group cursor-pointer"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-brand-primary/10 rounded-lg group-hover:bg-brand-primary/20 transition-colors">
                    <Icon size={28} className="text-brand-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-brand-primary mb-2">{item.title}</h3>
                    <p className="text-stone-600 mb-4">{item.desc}</p>
                    <Link
                      to={item.link}
                      className="inline-flex items-center gap-1 text-brand-primary font-semibold hover:gap-2 transition-all text-sm"
                    >
                      Learn more <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Why Choose */}
      <section className="bg-stone-50 py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-brand-primary mb-12">Why Maridadi Creations?</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'Affordable Pricing',
                desc: 'Professional branding without corporate agency prices. Quality products, fair costs.',
              },
              {
                title: 'Fast Turnaround',
                desc: 'Quick production & delivery. Rush orders available for urgent business needs.',
              },
              {
                title: 'Expert Design',
                desc: 'Our team designs custom branding tailored to your business identity.',
              },
              {
                title: 'Nairobi Based',
                desc: 'Local expertise. Quick consultations and installations. Same-day pickups available.',
              },
              {
                title: 'Versatile Services',
                desc: 'Logo design, digital assets, print materials, signage, vehicle wraps.',
              },
              {
                title: 'Customer Support',
                desc: 'Direct communication with designers. Unlimited revisions until perfect.',
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-6"
              >
                <CheckCircle2 className="text-brand-primary mb-4" size={32} />
                <h3 className="font-semibold text-brand-primary mb-2 text-lg">{item.title}</h3>
                <p className="text-stone-600">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="max-w-7xl mx-auto px-4 py-16 lg:py-24">
        <h2 className="text-3xl md:text-4xl font-serif font-bold text-brand-primary mb-12">Our Branding Process</h2>
        
        <div className="grid md:grid-cols-4 gap-6">
          {[
            { icon: Palette, title: 'Consultation', desc: 'Understand your brand & business goals' },
            { icon: Lightbulb, title: 'Design', desc: 'Create custom branding strategy' },
            { icon: CheckCircle2, title: 'Approval', desc: 'Review & approve designs' },
            { icon: Clock, title: 'Production', desc: 'Print, apply, deliver' },
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
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 py-16 lg:py-24">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="bg-gradient-to-r from-brand-primary to-brand-primary/80 text-brand-cream rounded-2xl p-8 md:p-12 text-center"
        >
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-6">Ready to Brand Your Business?</h2>
          <p className="text-lg text-brand-cream/90 mb-8 max-w-2xl mx-auto">
            Get professional branding that stands out. Contact us for a free consultation.
          </p>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 bg-brand-cream text-brand-primary font-bold py-3 px-8 rounded-lg hover:bg-opacity-90 transition-all duration-200 transform hover:scale-105"
          >
            Explore All Services <ArrowRight size={20} />
          </Link>
        </motion.div>
      </section>

      {/* FAQ */}
      <FAQ items={faqItems} title="Branding Services FAQs" />
    </div>
  );
}
