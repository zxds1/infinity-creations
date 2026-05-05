import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, CheckCircle2, Zap, Palette, Clock } from 'lucide-react';
import SEOMeta from '../components/SEOMeta';
import FAQ, { type FAQItem } from '../components/FAQ';

export default function CustomJewelleryPage() {
  const faqItems: FAQItem[] = [
    {
      question: 'What types of custom jewellery do you design?',
      answer: 'We design custom rings, necklaces, bracelets, earrings, and pendants. Any style, any material. From casual to bridal pieces.',
    },
    {
      question: 'How much does custom jewellery cost in Kenya?',
      answer: 'Pricing varies by design complexity and materials. Simple pieces start from KES 5,000, while premium designs can range from KES 15,000-100,000+. Get a quote based on your design.',
    },
    {
      question: 'Can I customize an existing jewellery design?',
      answer: 'Absolutely! Bring a design or photo, and our team will create your custom piece. We work with gold, silver, copper, and mixed metals.',
    },
    {
      question: 'How long does it take to make custom jewellery?',
      answer: 'Custom jewellery typically takes 2-3 weeks depending on complexity. Rush orders available for an additional fee.',
    },
    {
      question: 'Do you offer engraving and personalization?',
      answer: 'Yes! Personal engravings, initials, dates, and special messages can be added to your custom pieces.',
    },
  ];

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'Custom Jewellery Kenya',
    description: 'Custom jewellery design and creation in Nairobi - rings, necklaces, bracelets, personalized pieces',
    url: 'https://maridadi.co.ke/custom-jewellery-kenya',
    brand: { '@type': 'Brand', name: 'Maridadi Creations' },
  };

  return (
    <div className="pb-12 lg:pb-24">
      <SEOMeta
        title="Custom Jewellery Kenya | Personalized Rings & Necklaces Nairobi"
        description="Custom jewellery design in Nairobi. Rings, necklaces, bracelets, personalized pieces. Expert craftsmanship. Bespoke designs."
        keywords={['custom jewellery Kenya', 'personalized rings Nairobi', 'custom necklaces', 'bridal jewellery Kenya', 'jewellery design']}
        canonicalUrl="https://maridadi.co.ke/custom-jewellery-kenya"
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
              Custom Jewellery Design in Kenya
            </h1>
            <p className="text-lg md:text-xl text-brand-cream/90 mb-8 max-w-2xl leading-relaxed">
              Bespoke jewellery crafted just for you. Rings, necklaces, bracelets, and more. Personalized designs with expert craftsmanship.
            </p>
            <Link
              to="/shop?query=jewellery"
              className="inline-flex items-center gap-2 bg-brand-cream text-brand-primary font-bold py-3 px-8 rounded-lg hover:bg-opacity-90 transition-all duration-200 transform hover:scale-105"
            >
              Design Your Jewellery <ArrowRight size={20} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* What We Offer */}
      <section className="max-w-7xl mx-auto px-4 py-16 lg:py-24">
        <h2 className="text-3xl md:text-4xl font-serif font-bold text-brand-primary mb-12">Our Jewellery Services</h2>
        
        <div className="grid md:grid-cols-2 gap-8">
          {[
            {
              title: 'Custom Rings',
              description: 'Engagement rings, wedding bands, and statement rings. Any metal, any design.',
            },
            {
              title: 'Personalized Necklaces',
              description: 'Custom pendants, initials, dates, and meaningful designs.',
            },
            {
              title: 'Bracelets & Bracelets',
              description: 'Personalized bracelets with engravings, messages, or custom designs.',
            },
            {
              title: 'Bridal Jewellery',
              description: 'Complete bridal sets designed to complement your special day.',
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
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-brand-primary mb-12">Our Design Process</h2>
          
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { icon: Palette, title: 'Consult', desc: 'Discuss your vision and preferences' },
              { icon: CheckCircle2, title: 'Design', desc: 'Create detailed 3D mockup' },
              { icon: Zap, title: 'Craft', desc: 'Handcraft your custom piece' },
              { icon: Clock, title: 'Deliver', desc: 'Present your finished jewellery' },
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
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-6">Ready for Custom Jewellery?</h2>
          <p className="text-lg text-brand-cream/90 mb-8 max-w-2xl mx-auto">
            Create meaningful, custom jewellery that tells your story. Bespoke designs with expert craftsmanship.
          </p>
          <Link
            to="/shop?query=jewellery"
            className="inline-flex items-center gap-2 bg-brand-cream text-brand-primary font-bold py-3 px-8 rounded-lg hover:bg-opacity-90 transition-all duration-200 transform hover:scale-105"
          >
            Start Custom Jewellery <ArrowRight size={20} />
          </Link>
        </motion.div>
      </section>

      {/* FAQ */}
      <FAQ items={faqItems} title="Custom Jewellery FAQs" />
    </div>
  );
}
