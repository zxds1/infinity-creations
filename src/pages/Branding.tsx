import { useState, useEffect } from 'react';
import { Paintbrush, Truck, Bike, Megaphone, Image as ImageIcon, Send, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'react-hot-toast';
import { auth, db, collection, addDoc, serverTimestamp, getDocs } from '../lib/firebase';
import { trackEvent } from '../lib/behavior';
import { defaultSiteContent, fetchSiteContent, type SiteContent } from '../lib/siteContent';

export default function Branding() {
  const [brandingServices, setBrandingServices] = useState<any[]>([]);
  const [selectedService, setSelectedService] = useState<any | null>(null);
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState<SiteContent>(defaultSiteContent);
  const [sellerProfile, setSellerProfile] = useState({
    businessType: '',
    positioning: '',
    targetCustomers: ''
  });

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const [snap, siteContent] = await Promise.all([
          getDocs(collection(db, 'services')),
          fetchSiteContent()
        ]);
        setContent(siteContent);
        const servicesData = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        if (servicesData.length === 0) {
          const initial = [
            { id: 'v1', name: "Vehicle Branding", icon: "Truck", price: "KSH 15,000", desc: "Full or partial wraps for cars and trucks." },
            { id: 'b1', name: "Boda Boda Design", icon: "Bike", price: "KSH 4,500", desc: "Custom motifs and branding for motorcycles." },
            { id: 'Fashion', name: "Fashion Labeling", icon: "Paintbrush", price: "KSH 2,000", desc: "Labels and branding for luxury apparel." }
          ];
          setBrandingServices(initial);
          setSelectedService(initial[0]);
        } else {
          setBrandingServices(servicesData);
          setSelectedService(servicesData[0]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitRequest = async () => {
    if (!auth.currentUser) {
      toast.error("Please sign in to send a request");
      return;
    }
    if (!description.trim()) {
      toast.error("Please describe your project");
      return;
    }

    setSubmitting(true);
    try {
      const serviceName = selectedService.name || selectedService.title || 'Branding service';
      const sellerSignal = {
        businessType: sellerProfile.businessType.trim(),
        positioning: sellerProfile.positioning.trim(),
        targetCustomers: sellerProfile.targetCustomers.trim()
      };

      await addDoc(collection(db, 'purchaseRequests'), {
        userId: auth.currentUser.uid,
        type: 'branding',
        details: {
          serviceId: selectedService.id,
          serviceName,
          userDescription: description,
          referenceImage: image,
          sellerSignal
        },
        status: "requested",
        createdAt: serverTimestamp()
      });
      await addDoc(collection(db, 'sellerSignals'), {
        userId: auth.currentUser.uid,
        serviceId: selectedService.id,
        serviceName,
        ...sellerSignal,
        createdAt: serverTimestamp()
      });
      trackEvent({
        eventType: 'branding',
        metadata: { serviceId: selectedService.id, serviceName, ...sellerSignal }
      }).catch(() => undefined);
      toast.success("Branding request submitted! Our designers will contact you.");
      setDescription("");
      setImage(null);
      setSellerProfile({ businessType: '', positioning: '', targetCustomers: '' });
    } catch (error) {
      toast.error("Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 md:py-20">
      <div className="mb-12 overflow-hidden rounded-[32px] bg-stone-950 p-6 text-white md:rounded-[40px] md:p-10">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="mb-4 text-[10px] font-black uppercase tracking-[0.24em] text-white/45">For business</p>
            <h1 className="max-w-3xl text-4xl font-semibold leading-none md:text-7xl">{content.businessTitle}</h1>
            <p className="mt-5 max-w-2xl text-sm leading-relaxed text-white/65 md:text-lg">
              {content.businessSubtitle}
            </p>
          </div>
          <div className="rounded-[28px] border border-white/10 bg-white/5 p-6">
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-white/40">Business services</p>
            <div className="mt-6 space-y-5">
              {[
                'Banners & signage',
                'Vehicle branding',
                'Custom branding'
              ].map(item => (
                <div key={item} className="border-t border-white/10 pt-5">
                  <p className="text-lg font-bold">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
        <div>
          <h2 className="text-4xl md:text-6xl mb-6 leading-[0.95]">Start your <span className="italic font-light">branding</span></h2>
          <p className="text-lg text-stone-500 mb-8 max-w-lg leading-relaxed">
            Pick the closest starting point. Your final design can still be customized for your brand, colors, size, and message.
          </p>

          <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {[
              { icon: Megaphone, title: 'Banners & Signage', text: 'Professional designs for shops, events, and promotions.' },
              { icon: Truck, title: 'Vehicle Branding', text: 'Make your boda boda or vehicle stand out.' },
              { icon: Paintbrush, title: 'Custom Branding', text: 'Unique designs tailored to your business identity.' }
            ].map(item => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="rounded-[24px] bg-white p-5 shadow-sm">
                  <Icon size={20} className="text-brand-primary" />
                  <h3 className="mt-4 font-bold text-stone-900">{item.title}</h3>
                  <p className="mt-1 text-sm text-stone-500">{item.text}</p>
                </div>
              );
            })}
          </div>

          <div className="space-y-4">
            {loading ? (
              <div className="animate-pulse space-y-4">
                {[1,2,3].map(i => <div key={i} className="h-20 bg-stone-100 rounded-3xl" />)}
              </div>
            ) : brandingServices.map(service => {
              const IconComp = service.icon === 'Bike' ? Bike : service.icon === 'Truck' ? Truck : Paintbrush;
              return (
                <button
                  key={service.id}
                  onClick={() => setSelectedService(service)}
                  className={`w-full text-left p-6 rounded-3xl border transition-all flex items-center justify-between group ${selectedService?.id === service.id ? 'border-brand-primary bg-brand-primary/5' : 'border-stone-100 hover:border-brand-primary/20 bg-white shadow-sm'}`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${selectedService?.id === service.id ? 'bg-brand-primary text-brand-cream' : 'bg-stone-100 text-stone-400 group-hover:bg-brand-primary/10 group-hover:text-brand-primary'}`}>
                      <IconComp size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{service.name || service.title}</h3>
                      <p className="text-stone-400 text-sm">{service.price || service.priceRange}</p>
                    </div>
                  </div>
                  {selectedService?.id === service.id && <ArrowRight className="text-brand-primary" size={20} />}
                </button>
              );
            })}
          </div>
        </div>

        <div className="sticky top-32">
          {selectedService && (
            <motion.div 
              key={selectedService.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-brand-primary text-brand-cream rounded-[40px] p-12 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
              
              <h2 className="text-4xl mb-4 font-serif">Request a design</h2>
              <p className="text-white/70 mb-8">{selectedService.desc || selectedService.description}</p>

            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold uppercase mb-2 tracking-widest text-white/50">Reference image (optional)</label>
                <div 
                  onClick={() => document.getElementById('branding-upload')?.click()}
                  className="w-full aspect-video rounded-2xl border border-white/20 bg-white/5 flex flex-col items-center justify-center cursor-pointer hover:bg-white/10 transition-colors overflow-hidden"
                >
                  {image ? (
                    <img src={image} alt="Reference" className="w-full h-full object-cover" />
                  ) : (
                    <>
                      <ImageIcon className="text-white/30 mb-2" size={32} />
                      <span className="text-xs text-white/50 font-bold uppercase tracking-widest">Upload a reference image</span>
                    </>
                  )}
                  <input id="branding-upload" type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase mb-2 tracking-widest text-white/50">Your idea</label>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tell us what you are branding, size, wording, colors, deadline, or vehicle/shop details..."
                  className="w-full bg-white/10 border border-white/20 rounded-2xl p-4 min-h-[120px] text-white placeholder:text-white/30 focus:outline-none focus:border-white transition-colors text-sm"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase mb-2 tracking-widest text-white/50">Business type</label>
                  <input
                    value={sellerProfile.businessType}
                    onChange={(e) => setSellerProfile({ ...sellerProfile, businessType: e.target.value })}
                    placeholder="Salon, cafe, boda fleet..."
                    className="w-full bg-white/10 border border-white/20 rounded-2xl p-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase mb-2 tracking-widest text-white/50">Positioning</label>
                  <input
                    value={sellerProfile.positioning}
                    onChange={(e) => setSellerProfile({ ...sellerProfile, positioning: e.target.value })}
                    placeholder="Premium, playful, practical..."
                    className="w-full bg-white/10 border border-white/20 rounded-2xl p-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase mb-2 tracking-widest text-white/50">Customers</label>
                  <input
                    value={sellerProfile.targetCustomers}
                    onChange={(e) => setSellerProfile({ ...sellerProfile, targetCustomers: e.target.value })}
                    placeholder="Students, families, executives..."
                    className="w-full bg-white/10 border border-white/20 rounded-2xl p-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white"
                  />
                </div>
              </div>

              <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                <p className="text-sm text-white/80 leading-relaxed italic">
                  After you send the request, our design team reviews the brief, confirms details, and follows up with the next step.
                </p>
              </div>

              <button 
                onClick={handleSubmitRequest}
                disabled={submitting}
                className={`w-full bg-white text-brand-primary py-5 rounded-2xl font-bold text-xl flex items-center justify-center gap-3 transition-transform hover:scale-[1.02] ${submitting ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {submitting ? 'Sending...' : 'Request design'} <Send size={20} />
              </button>
            </div>
          </motion.div>
        )}
      </div>
      </div>
    </div>
  );
}
