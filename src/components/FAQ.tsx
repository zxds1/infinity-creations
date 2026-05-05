import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQProps {
  items: FAQItem[];
  title?: string;
}

export default function FAQ({ items, title = 'Frequently Asked Questions' }: FAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  // Create Schema.org structured data
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map(item => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };

  return (
    <div className="max-w-4xl mx-auto py-12 lg:py-24 px-4">
      <script type="application/ld+json">
        {JSON.stringify(faqSchema)}
      </script>
      
      <h2 className="text-3xl md:text-4xl font-serif font-bold text-brand-primary mb-12 text-center">
        {title}
      </h2>

      <div className="space-y-4">
        {items.map((item, index) => (
          <div
            key={index}
            className="border border-stone-200 rounded-lg overflow-hidden bg-white hover:border-brand-primary/30 transition-colors"
          >
            <button
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-stone-50 transition-colors text-left"
            >
              <span className="font-semibold text-stone-900 pr-4">{item.question}</span>
              {openIndex === index ? (
                <ChevronUp className="flex-shrink-0 text-brand-primary" size={20} />
              ) : (
                <ChevronDown className="flex-shrink-0 text-stone-400" size={20} />
              )}
            </button>

            {openIndex === index && (
              <div className="px-6 py-4 border-t border-stone-200 bg-stone-50 text-stone-700 leading-relaxed">
                {item.answer}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export { type FAQItem };
