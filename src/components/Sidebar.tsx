import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { auth } from '../lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { Camera, ShoppingBag, Paintbrush, User as UserIcon, X, ChevronRight, Settings, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import SocialIcon from './SocialIcon';
import { defaultSiteContent, fetchSiteContent, type SiteContent } from '../lib/siteContent';
import LogoMark from './LogoMark';

export default function Sidebar() {
  const [user, setUser] = useState<User | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [siteContent, setSiteContent] = useState<SiteContent>(defaultSiteContent);
  const location = useLocation();
  const sidebarSocialLinks = siteContent.socialLinks.filter(link => link.href.trim());

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    fetchSiteContent().then(setSiteContent).catch(() => undefined);
  }, []);

  const navItems = [
    { name: 'Explore', path: '/shop', icon: ShoppingBag },
    { name: 'Customize', path: '/analyzer', icon: Camera },
    { name: 'For Business', path: '/branding', icon: Paintbrush },
    { name: 'Saved', path: '/wishlist', icon: Heart },
    { name: 'Cart', path: '/cart', icon: ShoppingBag },
    { name: 'My Activity', path: '/orders', icon: UserIcon },
    { name: 'Admin', path: '/admin', icon: Settings },
  ];

  const mobileNavItems = [
    { name: 'Explore', path: '/shop', icon: ShoppingBag },
    { name: 'Customize', path: '/analyzer', icon: Camera },
    { name: 'Business', path: '/branding', icon: Paintbrush },
    { name: 'Saved', path: '/wishlist', icon: Heart },
    { name: 'Activity', path: '/orders', icon: UserIcon },
    { name: 'Admin', path: '/admin', icon: Settings },
  ];

  const sidebarVariants = {
    expanded: { width: '280px' },
    collapsed: { width: '80px' }
  };

  return (
    <>
      <nav className="bottom-safe fixed inset-x-0 bottom-0 z-[75] border-t border-stone-100 bg-white/95 px-2 pt-2 shadow-2xl shadow-stone-900/10 backdrop-blur-xl lg:hidden">
        <div className="mx-auto grid max-w-lg grid-cols-6 gap-1">
          {mobileNavItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex min-h-[58px] flex-col items-center justify-center gap-1 rounded-2xl text-[8px] font-black uppercase tracking-normal transition-colors sm:text-[9px] sm:tracking-widest ${active ? 'bg-brand-primary text-brand-cream' : 'text-stone-400'}`}
              >
                <item.icon size={20} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Desktop Sidebar Toggle Tab */}
      {!isExpanded && (
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => setIsExpanded(true)}
          className="hidden lg:flex fixed left-0 top-1/2 -translate-y-1/2 z-[60] bg-white border border-stone-100 border-l-0 rounded-r-2xl py-8 px-1.5 text-stone-300 hover:text-brand-primary hover:bg-stone-50 transition-all shadow-sm group"
        >
          <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
        </motion.button>
      )}

      {/* Desktop Sidebar */}
      <motion.aside
        initial="collapsed"
        animate={isExpanded ? 'expanded' : 'collapsed'}
        variants={sidebarVariants}
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
        className="hidden lg:flex fixed left-0 top-0 bottom-0 z-50 bg-white border-r border-brand-primary/5 flex-col py-8 px-4 transition-all duration-300 ease-in-out"
      >
        <div className="flex items-center gap-3 px-2 mb-12 overflow-hidden relative shrink-0">
          <LogoMark className="h-12 w-12 min-w-12 rounded-2xl shadow-lg shadow-brand-primary/20" />
          <AnimatePresence>
            {isExpanded && (
              <motion.span 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="font-serif text-xl font-semibold tracking-tight text-brand-primary whitespace-nowrap"
              >
                Infinity
              </motion.span>
            )}
          </AnimatePresence>
          {isExpanded && (
            <button 
              onClick={() => setIsExpanded(false)}
              className="absolute right-0 p-1 text-stone-300 hover:text-brand-primary transition-colors"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <nav className="flex-1 space-y-2 overflow-y-auto scrollbar-hide">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-4 p-3 rounded-2xl transition-all ${location.pathname === item.path ? 'bg-brand-primary text-brand-cream shadow-lg shadow-brand-primary/20' : 'text-stone-400 hover:bg-stone-50 hover:text-brand-primary'}`}
            >
              <div className="min-w-[24px] flex items-center justify-center">
                <item.icon size={24} />
              </div>
              <AnimatePresence>
                {isExpanded && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="font-bold text-sm tracking-widest uppercase whitespace-nowrap"
                  >
                    {item.name}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          ))}

        </nav>

        <div className="mt-auto space-y-6">
          <div className="flex flex-col gap-4">
            <div className={`flex items-center gap-3 p-2 rounded-2xl bg-stone-50 overflow-hidden ${isExpanded ? 'px-4' : 'justify-center'}`}>
              {user?.photoURL ? (
                <img src={user.photoURL} alt="User" className="min-w-[32px] h-[32px] rounded-full" referrerPolicy="no-referrer" />
              ) : (
                <UserIcon size={32} className="text-stone-300" />
              )}
              {isExpanded && (
                <div className="flex flex-col overflow-hidden">
                  <span className="text-xs font-bold text-stone-900 truncate">{user?.displayName || 'Demo client'}</span>
                  <span className="text-[10px] font-bold text-stone-400 text-left uppercase tracking-widest">No sign in needed</span>
                </div>
              )}
            </div>
          </div>

          {isExpanded && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-center gap-6 pt-6 border-t border-stone-100 text-stone-300"
            >
              {sidebarSocialLinks.map(link => {
                return (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={link.label}
                    className="flex h-8 w-8 items-center justify-center rounded-full transition-transform hover:-translate-y-0.5"
                    style={{
                      color: link.brandColor,
                      backgroundColor: link.id === 'x' || link.id === 'tiktok' ? '#ffffff' : `${link.brandColor}12`
                    }}
                  >
                    <SocialIcon id={link.id} size={18} />
                  </a>
                );
              })}
            </motion.div>
          )}
        </div>
      </motion.aside>

    </>
  );
}
