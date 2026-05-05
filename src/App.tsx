import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { HelmetProvider } from 'react-helmet-async';
import { motion, AnimatePresence } from 'motion/react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import ScrollToTop from './components/ScrollToTop';
import SocialIcon from './components/SocialIcon';
import PWAInstallBanner from './components/PWAInstallBanner';
import LogoMark from './components/LogoMark';
import StartupSplash from './components/StartupSplash';
import Home from './pages/Home';
import SpaceAnalyzer from './pages/SpaceAnalyzer';
import Shop from './pages/Shop';
import Branding from './pages/Branding';
import Orders from './pages/Orders';
import Admin from './pages/Admin';
import Wishlist from './pages/Wishlist';
import Cart from './pages/Cart';
import CustomBannersPage from './pages/CustomBannersPage';
import VehicleBrandingPage from './pages/VehicleBrandingPage';
import PhotoMountsPage from './pages/PhotoMountsPage';
import CustomStickersPage from './pages/CustomStickersPage';
import CustomJewelleryPage from './pages/CustomJewelleryPage';
import BrandingServicesPage from './pages/BrandingServicesPage';
import PhotoPrintingPage from './pages/PhotoPrintingPage';
import PersonalizedGiftsPage from './pages/PersonalizedGiftsPage';
import { defaultSiteContent, fetchSiteContent, type SiteContent } from './lib/siteContent';

function AnimatedRoutes() {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageWrapper><Home /></PageWrapper>} />
        <Route path="/analyzer" element={<PageWrapper><SpaceAnalyzer /></PageWrapper>} />
        <Route path="/customize" element={<PageWrapper><SpaceAnalyzer /></PageWrapper>} />
        <Route path="/shop" element={<PageWrapper><Shop /></PageWrapper>} />
        <Route path="/explore" element={<PageWrapper><Shop /></PageWrapper>} />
        <Route path="/branding" element={<PageWrapper><Branding /></PageWrapper>} />
        <Route path="/business" element={<PageWrapper><Branding /></PageWrapper>} />
        <Route path="/for-business" element={<PageWrapper><Branding /></PageWrapper>} />
        <Route path="/orders" element={<PageWrapper><Orders /></PageWrapper>} />
        <Route path="/activity" element={<PageWrapper><Orders /></PageWrapper>} />
        <Route path="/wishlist" element={<PageWrapper><Wishlist /></PageWrapper>} />
        <Route path="/saved" element={<PageWrapper><Wishlist /></PageWrapper>} />
        <Route path="/cart" element={<PageWrapper><Cart /></PageWrapper>} />
        <Route path="/admin" element={<PageWrapper><Admin /></PageWrapper>} />
        
        {/* SEO Category Pages */}
        {/* CLUSTER: Branding Services */}
        <Route path="/branding-services-nairobi" element={<PageWrapper><BrandingServicesPage /></PageWrapper>} />
        <Route path="/branding-services" element={<PageWrapper><BrandingServicesPage /></PageWrapper>} />
        <Route path="/custom-banners-nairobi" element={<PageWrapper><CustomBannersPage /></PageWrapper>} />
        <Route path="/banner-printing-nairobi" element={<PageWrapper><CustomBannersPage /></PageWrapper>} />
        <Route path="/banners" element={<PageWrapper><CustomBannersPage /></PageWrapper>} />
        <Route path="/vehicle-branding-nairobi" element={<PageWrapper><VehicleBrandingPage /></PageWrapper>} />
        <Route path="/vehicle-branding" element={<PageWrapper><VehicleBrandingPage /></PageWrapper>} />
        
        {/* CLUSTER: Photo Printing & Decor */}
        <Route path="/photo-printing-nairobi" element={<PageWrapper><PhotoPrintingPage /></PageWrapper>} />
        <Route path="/photo-printing" element={<PageWrapper><PhotoPrintingPage /></PageWrapper>} />
        <Route path="/photo-mounts-nairobi" element={<PageWrapper><PhotoMountsPage /></PageWrapper>} />
        <Route path="/photo-mounts-kenya" element={<PageWrapper><PhotoMountsPage /></PageWrapper>} />
        <Route path="/photo-mounts" element={<PageWrapper><PhotoMountsPage /></PageWrapper>} />
        
        {/* CLUSTER: Stickers */}
        <Route path="/custom-stickers-nairobi" element={<PageWrapper><CustomStickersPage /></PageWrapper>} />
        <Route path="/stickers" element={<PageWrapper><CustomStickersPage /></PageWrapper>} />
        <Route path="/laptop-stickers" element={<PageWrapper><CustomStickersPage /></PageWrapper>} />
        
        {/* CLUSTER: Personal Items & Gifts */}
        <Route path="/personalized-gifts-kenya" element={<PageWrapper><PersonalizedGiftsPage /></PageWrapper>} />
        <Route path="/personalized-gifts" element={<PageWrapper><PersonalizedGiftsPage /></PageWrapper>} />
        <Route path="/custom-jewellery-kenya" element={<PageWrapper><CustomJewelleryPage /></PageWrapper>} />
        <Route path="/jewellery" element={<PageWrapper><CustomJewelleryPage /></PageWrapper>} />
        
        <Route path="*" element={<PageWrapper><CatchAllRoute /></PageWrapper>} />
      </Routes>
    </AnimatePresence>
  );
}

function CatchAllRoute() {
  return <Home />;
}

function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

export default function App() {
  const [siteContent, setSiteContent] = useState<SiteContent>(defaultSiteContent);
  const footerSocialLinks = siteContent.socialLinks.filter(link => link.href.trim());

  useEffect(() => {
    fetchSiteContent().then(setSiteContent).catch(() => undefined);
  }, []);

  return (
    <HelmetProvider>
      <Router>
        <StartupSplash />
        <ScrollToTop />
        <div className="min-h-screen bg-brand-cream selection:bg-brand-primary/20 flex flex-col transition-colors">
          <Header />
          <div className="flex flex-1 flex-col lg:flex-row">
            <Sidebar />
            <main className="flex-1 pb-mobile-nav lg:pb-0 lg:pl-20 transition-all duration-300">
              <AnimatedRoutes />
              <Toaster position="bottom-right" />
              <PWAInstallBanner />
            
            <footer className="mt-8 border-t border-brand-primary/10 bg-white py-12 lg:mt-12 lg:py-24">
            <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 gap-10 md:grid-cols-4 md:gap-12">
              <div className="col-span-1 md:col-span-2">
                <div className="flex items-center gap-2 mb-6">
                  <LogoMark className="h-8 w-8 rounded-full" />
                  <span className="font-serif text-xl font-semibold tracking-tight text-brand-primary">Infinity Creations</span>
                </div>
                <p className="text-stone-400 max-w-sm leading-relaxed mb-8">
                  Design, print, and branding services for personal style, spaces, devices, and businesses.
                </p>
                <div className="flex flex-wrap gap-3">
                  {footerSocialLinks.map(link => {
                    return (
                      <a
                        key={link.label}
                        href={link.href}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex min-h-11 items-center gap-2 rounded-full border border-stone-100 px-4 text-[10px] font-black uppercase tracking-widest text-stone-500 transition-colors hover:border-current"
                        style={{
                          color: link.brandColor,
                          backgroundColor: link.id === 'x' || link.id === 'tiktok' ? '#ffffff' : `${link.brandColor}12`
                        }}
                      >
                        <SocialIcon id={link.id} size={15} />
                        {link.label}
                      </a>
                    );
                  })}
                </div>
              </div>
              <div>
                <h4 className="font-bold uppercase tracking-widest text-xs text-stone-900 mb-6">Explore</h4>
                <ul className="space-y-4 text-stone-500 text-sm">
                  <li><Link to="/shop" className="hover:text-brand-primary">Explore</Link></li>
                  <li><Link to="/analyzer" className="hover:text-brand-primary">Customize</Link></li>
                  <li><Link to="/branding" className="hover:text-brand-primary">For Business</Link></li>
                  <li><Link to="/orders" className="hover:text-brand-primary">My Activity</Link></li>
                  <li><Link to="/admin" className="hover:text-brand-primary">Admin</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold uppercase tracking-widest text-xs text-stone-900 mb-6">Contact</h4>
                <ul className="space-y-4 text-stone-500 text-sm">
                  <li>{siteContent.contact.location}</li>
                  <li><a href={`mailto:${siteContent.contact.email}`} className="hover:text-brand-primary">{siteContent.contact.email}</a></li>
                  <li><a href={`tel:${siteContent.contact.phone.replace(/\s+/g, '')}`} className="hover:text-brand-primary">{siteContent.contact.phone}</a></li>
                  {footerSocialLinks[0] && (
                    <li><a href={footerSocialLinks[0].href} target="_blank" rel="noreferrer" className="font-bold text-brand-primary hover:text-stone-900">Message us @Infinity Creations</a></li>
                  )}
                </ul>
              </div>
            </div>
            <div className="max-w-7xl mx-auto px-4 mt-12 pt-8 border-t border-brand-primary/5 flex flex-col md:flex-row justify-between items-center gap-6 lg:mt-24 lg:pt-12">
              <p className="text-xs text-stone-400 uppercase tracking-widest">© 2026 Infinity Creations. All rights reserved.</p>
              <div className="flex gap-8 text-xs font-bold text-stone-400 uppercase tracking-widest">
                <a href="#" className="hover:text-brand-primary transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-brand-primary transition-colors">Terms of Service</a>
              </div>
            </div>
          </footer>
        </main>
      </div>
    </div>
    </Router>
    </HelmetProvider>
);
}
