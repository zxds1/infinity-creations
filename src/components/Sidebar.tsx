import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { auth, db, doc, getDocFromServer, signInWithGoogle } from '../lib/firebase';
import { onAuthStateChanged, User, signOut } from 'firebase/auth';
import { Camera, ShoppingBag, Paintbrush, User as UserIcon, LogOut, X, Facebook, Instagram, Twitter, ChevronRight, Settings, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Sidebar() {
  const [user, setUser] = useState<User | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (!u) {
        setIsAdmin(false);
        return;
      }
      try {
        const adminSnap = await getDocFromServer(doc(db, 'admins', u.uid));
        setIsAdmin(adminSnap.exists());
      } catch {
        setIsAdmin(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const navItems = [
    { name: 'Discover', path: '/shop', icon: ShoppingBag },
    { name: 'Design', path: '/analyzer', icon: Camera },
    { name: 'Saved', path: '/wishlist', icon: Heart },
    { name: 'Cart', path: '/cart', icon: ShoppingBag },
    { name: 'Activity', path: '/orders', icon: UserIcon },
    { name: 'Branding', path: '/branding', icon: Paintbrush },
  ];

  const mobileNavItems = navItems.slice(0, 5);

  const sidebarVariants = {
    expanded: { width: '280px' },
    collapsed: { width: '80px' }
  };

  return (
    <>
      <nav className="bottom-safe fixed inset-x-0 bottom-0 z-[75] border-t border-stone-100 bg-white/95 px-2 pt-2 shadow-2xl shadow-stone-900/10 backdrop-blur-xl lg:hidden">
        <div className="mx-auto grid max-w-md grid-cols-5 gap-1">
          {mobileNavItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex min-h-[58px] flex-col items-center justify-center gap-1 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-colors ${active ? 'bg-brand-primary text-brand-cream' : 'text-stone-400'}`}
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
          <div className="min-w-[48px] h-[48px] bg-brand-primary rounded-2xl flex items-center justify-center text-brand-cream font-serif text-2xl italic shadow-lg shadow-brand-primary/20">M</div>
          <AnimatePresence>
            {isExpanded && (
              <motion.span 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="font-serif text-xl font-semibold tracking-tight text-brand-primary whitespace-nowrap"
              >
                Maridadi
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

          {isAdmin && (
            <Link
              to="/admin"
              className={`flex items-center gap-4 p-3 rounded-2xl transition-all ${location.pathname === '/admin' ? 'bg-stone-900 text-white shadow-lg' : 'text-stone-400 hover:bg-stone-50'}`}
            >
              <div className="min-w-[24px] flex items-center justify-center">
                <Settings size={24} />
              </div>
              <AnimatePresence>
                {isExpanded && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="font-bold text-sm tracking-widest uppercase whitespace-nowrap"
                  >
                    Admin Panel
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          )}
        </nav>

        <div className="mt-auto space-y-6">
          {user ? (
            <div className="flex flex-col gap-4">
              <div className={`flex items-center gap-3 p-2 rounded-2xl bg-stone-50 overflow-hidden ${isExpanded ? 'px-4' : 'justify-center'}`}>
                {user.photoURL ? (
                  <img src={user.photoURL} alt="User" className="min-w-[32px] h-[32px] rounded-full" referrerPolicy="no-referrer" />
                ) : (
                  <UserIcon size={32} className="text-stone-300" />
                )}
                {isExpanded && (
                  <div className="flex flex-col overflow-hidden">
                    <span className="text-xs font-bold text-stone-900 truncate">{user.displayName}</span>
                    <button onClick={() => signOut(auth)} className="text-[10px] font-bold text-stone-400 hover:text-red-500 text-left uppercase tracking-widest">Sign Out</button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <button 
              onClick={signInWithGoogle}
              className={`w-full flex items-center justify-center p-3 rounded-2xl bg-brand-primary text-brand-cream hover:opacity-90 transition-opacity ${isExpanded ? 'gap-3 px-4' : ''}`}
            >
              <LogOut size={24} className="rotate-180" />
              {isExpanded && <span className="font-bold text-sm tracking-widest uppercase">Sign In</span>}
            </button>
          )}

          {isExpanded && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-center gap-6 pt-6 border-t border-stone-100 text-stone-300"
            >
              <Facebook size={18} className="hover:text-brand-primary cursor-pointer" />
              <Instagram size={18} className="hover:text-brand-primary cursor-pointer" />
              <Twitter size={18} className="hover:text-brand-primary cursor-pointer" />
            </motion.div>
          )}
        </div>
      </motion.aside>

    </>
  );
}
