import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, CheckCircle2, Zap, Palette, Clock, Gift, Heart, Sparkles } from 'lucide-react';
import SEOMeta from '../components/SEOMeta';
import FAQ, { type FAQItem } from '../components/FAQ';

export default function PersonalizedGiftsPage() {
  const faqItems: FAQItem[] = [
    {
      question: 'What types of personalized gifts do you offer in Nairobi?',
      answer: 'We create custom gifts including personalized jewellery, engraved items, photo gifts, custom Tshirts, mugs, and more. Perfect for every occasion.',
    },
    {
      question: 'How much do personalized gifts cost?',
      answer: 'Pricing varies by gift type. Personalized bracelets start from KES 2,500. Engraved items from KES 3,000. Photo gifts from KES 2,000. Custom jewellery from KES 5,000+.',
    },
    {
      question: 'Can I customize a gift for a specific occasion?',
      answer: 'Absolutely! Weddings, birthdays, anniversaries, corporate gifts - we create personalized gifts for any occasion. Just tell us your idea.',
    },
    {
      question: 'How long does it take to make personalized gifts?',
      answer: 'Standard personalization: 2-3 days. Custom jewellery: 2-3 weeks. Express orders available for urgent needs.',
    },
    {
      question: 'Can I include names, dates, or special messages?',
      answer: 'Yes! Engraving, embossing, and personalized messaging available on most items. We ensure perfect execution.',
    },
    {
      question: 'Are personalized gifts good for corporate gifting?',
      answer: 'Perfect! Bulk orders with company branding available. Great for employee gifts, client appreciation, and corporate events.',
    },
  ];

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'Personalized Gifts Kenya',
    description: 'Custom personalized gifts in Nairobi. Engraved jewellery, photo gifts, custom items. Perfect for every occasion.',
    url: 'https://infinitycreations.co.ke/personalized-gifts-kenya',
    brand: { '@type': 'Brand', name: 'Infinity Creations' },
  };

  return (
    <div className="pb-12 lg:pb-24">
      <SEOMeta
        title="Personalized Gifts Kenya | Custom Gift Ideas Nairobi"
        description="Personalized gifts in Nairobi. Engraved jewellery, custom gifts, photo gifts. Perfect for weddings, birthdays, anniversaries. Same-day delivery available."
        keywords={[
          'personalized gifts Kenya',
          'personalized gifts Nairobi',
          'custom gifts Kenya',
          'engraved gifts Nairobi',
          'gift ideas Kenya',
          'corporate gifts Nairobi',
          'custom jewellery gifts',
        ]}
        canonicalUrl="https://infinitycreations.co.ke/personalized-gifts-kenya"
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
              Personalized Gifts Kenya
            </h1>
            <p className="text-lg md:text-xl text-brand-cream/90 mb-8 max-w-2xl leading-relaxed">
              Custom gifts that show you care. Engraved jewellery, photo gifts, personalized items. Perfect for every occasion.
            </p>
            <Link
              to="/shop?query=personalized-gifts"
              className="inline-flex items-center gap-2 bg-brand-cream text-brand-primary font-bold py-3 px-8 rounded-lg hover:bg-opacity-90 transition-all duration-200 transform hover:scale-105"
            >
              Shop Personalized Gifts <ArrowRight size={20} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Gift Types */}
      <section className="max-w-7xl mx-auto px-4 py-16 lg:py-24">
        <h2 className="text-3xl md:text-4xl font-serif font-bold text-brand-primary mb-12">Popular Personalized Gifts</h2>
        
        <div className="grid md:grid-cols-2 gap-8">
          {[
            {
              icon: Heart,
              title: 'Personalized Jewellery',
              desc: 'Engraved bracelets, necklaces, rings. Perfect for anniversaries and special moments.',
              link: '/custom-jewellery-kenya',
            },
            {
              icon: Gift,
              title: 'Photo Gifts',
              desc: 'Photo mugs, frames, canvas prints. Memorable gifts featuring special moments.',
              link: '/shop?query=photo-gifts',
            },
            {
              icon: Sparkles,
              title: 'Engraved Items',
              desc: 'Personalized bottles, boxes, plaques. Custom engraving for corporate or personal use.',
              link: '/shop?query=engraved',
            },
            {
              icon: CheckCircle2,
              title: 'Gift Packages',
              desc: 'Custom gift sets. Branded corporate gifts. Bulk orders for events and gifting.',
              link: '/shop?query=gift-packages',
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

      {/* Perfect For */}
      <section className="bg-stone-50 py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-brand-primary mb-12">Perfect for Every Occasion</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { occasion: 'Weddings', examples: 'Engraved bracelets, couple jewelry sets' },
              { occasion: 'Birthdays', examples: 'Photo frames, personalized mugs' },
              { occasion: 'Anniversaries', examples: 'Engraved necklaces, custom gifts' },
              { occasion: 'Baby Gifts', examples: 'Personalized items for new parents' },
              { occasion: 'Corporate', examples: 'Branded gifts, employee recognition' },
              { occasion: 'Holidays', examples: 'Festive personalized gift sets' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-6 rounded-lg border border-stone-200 hover:border-brand-primary/30 transition-colors"
              >
                <Gift className="text-brand-primary mb-4" size={28} />
                <h3 className="font-semibold text-brand-primary mb-2 text-lg">{item.occasion}</h3>
                <p className="text-stone-600 text-sm">{item.examples}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="max-w-7xl mx-auto px-4 py-16 lg:py-24">
        <h2 className="text-3xl md:text-4xl font-serif font-bold text-brand-primary mb-12">How We Create Your Gift</h2>
        
        <div className="grid md:grid-cols-4 gap-6">
          {[
            { icon: Palette, title: 'Select', desc: 'Choose gift type & personalization' },
            { icon: Sparkles, title: 'Customize', desc: 'Add names, dates, messages' },
            { icon: CheckCircle2, title: 'Approve', desc: 'Review design before creation' },
            { icon: Clock, title: 'Receive', desc: 'Beautiful gift ready for giving' },
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
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-6">Create the Perfect Personalized Gift</h2>
          <p className="text-lg text-brand-cream/90 mb-8 max-w-2xl mx-auto">
            Show someone you care with a custom gift. Thoughtful. Personal. Perfect.
          </p>
          <Link
            to="/shop?query=personalized-gifts"
            className="inline-flex items-center gap-2 bg-brand-cream text-brand-primary font-bold py-3 px-8 rounded-lg hover:bg-opacity-90 transition-all duration-200 transform hover:scale-105"
          >
            Browse Gifts <ArrowRight size={20} />
          </Link>
        </motion.div>
      </section>

      {/* FAQ */}
      <FAQ items={faqItems} title="Personalized Gifts FAQs" />
    </div>
  );
}
