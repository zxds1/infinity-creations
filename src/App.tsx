import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'motion/react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import ScrollToTop from './components/ScrollToTop';
import Home from './pages/Home';
import SpaceAnalyzer from './pages/SpaceAnalyzer';
import Shop from './pages/Shop';
import Branding from './pages/Branding';
import Orders from './pages/Orders';
import Admin from './pages/Admin';
import Wishlist from './pages/Wishlist';
import Cart from './pages/Cart';

function AnimatedRoutes() {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageWrapper><Home /></PageWrapper>} />
        <Route path="/analyzer" element={<PageWrapper><SpaceAnalyzer /></PageWrapper>} />
        <Route path="/shop" element={<PageWrapper><Shop /></PageWrapper>} />
        <Route path="/branding" element={<PageWrapper><Branding /></PageWrapper>} />
        <Route path="/orders" element={<PageWrapper><Orders /></PageWrapper>} />
        <Route path="/wishlist" element={<PageWrapper><Wishlist /></PageWrapper>} />
        <Route path="/cart" element={<PageWrapper><Cart /></PageWrapper>} />
        <Route path="/admin" element={<PageWrapper><Admin /></PageWrapper>} />
      </Routes>
    </AnimatePresence>
  );
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
  return (
    <Router>
      <ScrollToTop />
      <div className="min-h-screen bg-brand-cream selection:bg-brand-primary/20 flex flex-col">
        <Header />
        <div className="flex flex-1 flex-col lg:flex-row">
          <Sidebar />
          <main className="flex-1 pb-mobile-nav lg:pb-0 lg:pl-20 transition-all duration-300">
            <AnimatedRoutes />
            <Toaster position="bottom-right" />
            
            <footer className="mt-8 border-t border-brand-primary/10 bg-white py-12 lg:mt-12 lg:py-24">
            <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 gap-10 md:grid-cols-4 md:gap-12">
              <div className="col-span-1 md:col-span-2">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-8 h-8 bg-brand-primary rounded-full flex items-center justify-center text-brand-cream font-serif text-xl italic">M</div>
                  <span className="font-serif text-xl font-semibold tracking-tight text-brand-primary">Maridadi Creations</span>
                </div>
                <p className="text-stone-400 max-w-sm leading-relaxed mb-8">
                  Design, print, and branding services for personal style, spaces, devices, and businesses.
                </p>
                <p className="text-sm font-bold text-stone-500 uppercase tracking-widest">Message us @Maridadi Creations</p>
              </div>
              <div>
                <h4 className="font-bold uppercase tracking-widest text-xs text-stone-900 mb-6">Explore</h4>
                <ul className="space-y-4 text-stone-500 text-sm">
                  <li><Link to="/shop" className="hover:text-brand-primary">Explore</Link></li>
                  <li><Link to="/analyzer" className="hover:text-brand-primary">Customize</Link></li>
                  <li><Link to="/branding" className="hover:text-brand-primary">For Business</Link></li>
                  <li><Link to="/cart" className="hover:text-brand-primary">My Activity</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold uppercase tracking-widest text-xs text-stone-900 mb-6">Contact</h4>
                <ul className="space-y-4 text-stone-500 text-sm">
                  <li>Nairobi, Kenya</li>
                  <li>hello@maridadicreations.com</li>
                  <li>+254 700 000 000</li>
                </ul>
              </div>
            </div>
            <div className="max-w-7xl mx-auto px-4 mt-12 pt-8 border-t border-brand-primary/5 flex flex-col md:flex-row justify-between items-center gap-6 lg:mt-24 lg:pt-12">
              <p className="text-xs text-stone-400 uppercase tracking-widest">© 2026 Maridadi Creations. All rights reserved.</p>
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
);
}
