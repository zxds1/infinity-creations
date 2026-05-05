import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, CheckCircle2, Zap, Palette, Clock, Image, Frame } from 'lucide-react';
import SEOMeta from '../components/SEOMeta';
import FAQ, { type FAQItem } from '../components/FAQ';

export default function PhotoPrintingPage() {
  const faqItems: FAQItem[] = [
    {
      question: 'What are photo printing services and what options do you offer?',
      answer: 'We offer professional photo printing on various materials including canvas, photo paper, acrylic, and foam boards. Perfect for home decor, events, business displays, and gift ideas.',
    },
    {
      question: 'How much does photo printing cost in Nairobi?',
      answer: 'Photo prints start from KES 500-2,000 depending on size and material. Canvas prints from KES 3,000. Photo mounts from KES 1,500. Wall art printing from KES 5,000. Get a quote for your project.',
    },
    {
      question: 'Can I print my photos professionally?',
      answer: 'Yes! We handle everything from photos to canvas. We optimize your images for printing, suggest materials, and ensure professional quality output.',
    },
    {
      question: 'How long does photo printing take?',
      answer: 'Standard printing: 2-3 days. Canvas/specialty prints: 3-7 days. Rush orders available. Photo mounts typically 3-7 days depending on complexity.',
    },
    {
      question: 'What makes good photo prints?',
      answer: 'High-quality image resolution (300 DPI), proper color calibration, and premium materials. We ensure your memories look stunning.',
    },
    {
      question: 'Can I order large format photo prints?',
      answer: 'Absolutely. Large format printing available up to 4m x 3m. Perfect for events, galleries, and large wall displays.',
    },
  ];

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'Infinity Creations - Photo Printing Services Nairobi',
    description: 'Professional photo printing services in Nairobi. Canvas prints, photo mounts, wall art printing. High quality, affordable pricing.',
    url: 'https://infinitycreations.co.ke/photo-printing-nairobi',
    areaServed: { '@type': 'City', name: 'Nairobi', 'areaServed': 'Kenya' },
    priceRange: 'KES 500 - KES 50000',
  };

  return (
    <div className="pb-12 lg:pb-24">
      <SEOMeta
        title="Photo Printing Services Nairobi | Canvas & Wall Art Printing Kenya"
        description="Professional photo printing in Nairobi. Canvas prints, photo mounts, wall art. Large format printing available. High quality, fast delivery."
        keywords={[
          'photo printing Nairobi',
          'photo printing services Kenya',
          'canvas printing Nairobi',
          'wall art printing Kenya',
          'large format printing',
          'photo mount price Nairobi',
        ]}
        canonicalUrl="https://infinitycreations.co.ke/photo-printing-nairobi"
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
              Professional Photo Printing Nairobi
            </h1>
            <p className="text-lg md:text-xl text-brand-cream/90 mb-8 max-w-2xl leading-relaxed">
              Turn your memories into beautiful prints. Canvas, photo mounts, wall art. Professional quality. Same-day printing available.
            </p>
            <Link
              to="/shop?query=photo-printing"
              className="inline-flex items-center gap-2 bg-brand-cream text-brand-primary font-bold py-3 px-8 rounded-lg hover:bg-opacity-90 transition-all duration-200 transform hover:scale-105"
            >
              Order Photo Prints <ArrowRight size={20} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Services */}
      <section className="max-w-7xl mx-auto px-4 py-16 lg:py-24">
        <h2 className="text-3xl md:text-4xl font-serif font-bold text-brand-primary mb-12">Photo Printing Options</h2>
        
        <div className="grid md:grid-cols-2 gap-8">
          {[
            {
              icon: Image,
              title: 'Standard Photo Prints',
              desc: 'High-quality photo paper prints. Affordable pricing. Perfect for albums and displays.',
              link: '/shop?query=photo-prints',
            },
            {
              icon: Frame,
              title: 'Canvas Prints',
              desc: 'Professional canvas printing. Premium look. Long-lasting. Ideal for home decor.',
              link: '/shop?query=canvas',
            },
            {
              icon: Palette,
              title: 'Photo Mounts',
              desc: 'Foam board, wood, or acrylic mounts. Memory walls, events, professional displays.',
              link: '/photo-mounts-nairobi',
            },
            {
              icon: CheckCircle2,
              title: 'Wall Art Printing',
              desc: 'Custom wall art. Large format prints. Professional gallery-quality output.',
              link: '/shop?query=wall-art',
            },
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-6 border border-stone-200 rounded-lg hover:border-brand-primary/30 transition-colors group"
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
                      Explore <ArrowRight size={16} />
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
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-brand-primary mb-12">Why Photo Printing with Infinity?</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: 'Professional Quality', desc: 'Premium materials and color calibration ensure stunning prints.' },
              { title: 'Fast Production', desc: 'Same-day printing available for standard orders.' },
              { title: 'Affordable Pricing', desc: 'High-quality prints at prices that won\'t break the bank.' },
              { title: 'Expert Optimization', desc: 'We optimize images for best print results.' },
              { title: 'Multiple Formats', desc: 'Choose from canvas, paper, acrylic, foam board, and more.' },
              { title: 'Large Format', desc: 'Prints up to 4m x 3m for big, bold displays.' },
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
        <h2 className="text-3xl md:text-4xl font-serif font-bold text-brand-primary mb-12">How We Print Your Photos</h2>
        
        <div className="grid md:grid-cols-4 gap-6">
          {[
            { icon: Palette, title: 'Upload', desc: 'Share your photos online' },
            { icon: Zap, title: 'Optimize', desc: 'We perfect the quality' },
            { icon: CheckCircle2, title: 'Approve', desc: 'Review before printing' },
            { icon: Clock, title: 'Deliver', desc: 'Fast delivery to you' },
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
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-6">Print Your Memories Today</h2>
          <p className="text-lg text-brand-cream/90 mb-8 max-w-2xl mx-auto">
            Professional photo printing. Fast. Affordable. Beautiful results.
          </p>
          <Link
            to="/shop?query=photo-printing"
            className="inline-flex items-center gap-2 bg-brand-cream text-brand-primary font-bold py-3 px-8 rounded-lg hover:bg-opacity-90 transition-all duration-200 transform hover:scale-105"
          >
            Start Printing <ArrowRight size={20} />
          </Link>
        </motion.div>
      </section>

      {/* FAQ */}
      <FAQ items={faqItems} title="Photo Printing FAQs" />
    </div>
  );
}
