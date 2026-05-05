import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { auth, signInWithGoogle, db, collection, getDocs, query, limit } from '../lib/firebase';
import { onAuthStateChanged, User, signOut } from 'firebase/auth';
import { Camera, Home, ShoppingBag, Paintbrush, User as UserIcon, LogOut, Menu, X, Search, Sparkles, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Tooltip from './Tooltip';

export default function Header() {
  const [user, setUser] = useState<User | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{ products: any[], services: any[] }>({ products: [], services: [] });
  const location = useLocation();
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults({ products: [], services: [] });
      return;
    }

    const performSearch = async () => {
      try {
        const prodSnap = await getDocs(query(collection(db, 'products'), limit(20)));
        const servSnap = await getDocs(query(collection(db, 'services'), limit(20)));
        
        const q = searchQuery.toLowerCase();
        
        const filteredProds = prodSnap.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter((p: any) => p.name.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q));
          
        const filteredServs = servSnap.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter((s: any) => s.title.toLowerCase().includes(q) || s.description?.toLowerCase().includes(q));

        setSearchResults({ products: filteredProds, services: filteredServs });
      } catch (err) {
        console.error(err);
      }
    };

    const timer = setTimeout(performSearch, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearching(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navItems = [
    { name: 'Discover', path: '/shop', icon: ShoppingBag },
    { name: 'Design', path: '/analyzer', icon: Camera },
    { name: 'Activity', path: '/orders', icon: UserIcon },
    { name: 'Account', path: '/wishlist', icon: Heart },
  ];

  return (
    <header className="sticky top-0 z-[60] bg-white/60 backdrop-blur-xl border-b border-stone-100">
      <div className="max-w-[1600px] mx-auto px-6 h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center text-brand-cream font-serif text-2xl italic shadow-lg shadow-brand-primary/10">M</div>
          <div className="flex flex-col">
            <span className="font-serif text-xl font-bold tracking-tight text-stone-900 leading-none mb-0.5">Maridadi</span>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-primary/60">Creations</span>
          </div>
        </Link>

        {/* Simplified Desktop Nav - More Spacing */}
        <nav className="hidden lg:flex items-center gap-10 text-[11px] font-black uppercase tracking-[0.15em] text-stone-400">
          {navItems.map((item) => (
            <Link 
              key={item.path}
              to={item.path}
              className={`hover:text-brand-primary transition-all relative ${location.pathname === item.path ? 'text-brand-primary after:content-[""] after:absolute after:-bottom-1 after:left-0 after:w-1/2 after:h-0.5 after:bg-brand-primary' : ''}`}
            >
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-6">
          <div className="relative" ref={searchRef}>
            <button 
              onClick={() => setIsSearching(!isSearching)}
              className="p-3 text-stone-400 hover:text-brand-primary hover:bg-stone-50 rounded-full transition-all"
            >
              <Search size={18} />
            </button>
            
            <AnimatePresence>
              {isSearching && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  className="absolute right-0 mt-4 w-[400px] bg-white rounded-3xl shadow-2xl border border-stone-100 overflow-hidden"
                >
                  <div className="p-4 border-b border-stone-50 bg-stone-50/50">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
                      <input 
                        autoFocus
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search products & services..."
                        className="w-full bg-white border border-stone-200 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-brand-primary"
                      />
                    </div>
                  </div>
                  
                  <div className="max-h-[400px] overflow-y-auto p-4 space-y-6">
                    {searchQuery.length < 2 ? (
                      <div className="text-center py-8">
                        <Sparkles className="mx-auto text-brand-primary/20 mb-3" size={32} />
                        <p className="text-stone-400 text-xs uppercase tracking-widest font-bold">Discover Maridadi</p>
                      </div>
                    ) : (
                      <>
                        {searchResults.products.length > 0 && (
                          <div>
                            <h4 className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-3 px-2">Products</h4>
                            {searchResults.products.map(p => (
                              <Link 
                                key={p.id} 
                                to="/shop" 
                                className="flex items-center gap-3 p-2 rounded-xl h-20 hover:bg-stone-50 transition-colors"
                                onClick={() => setIsSearching(false)}
                              >
                                <img src={p.image} className="w-16 h-full object-cover rounded-lg" />
                                <div className="flex flex-col">
                                  <span className="text-sm font-bold text-stone-800">{p.name}</span>
                                  <span className="text-xs text-brand-primary font-bold">KSH {p.price}</span>
                                </div>
                              </Link>
                            ))}
                          </div>
                        )}
                        {searchResults.services.length > 0 && (
                          <div>
                            <h4 className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-3 px-2">Services</h4>
                            {searchResults.services.map(s => (
                              <Link 
                                key={s.id} 
                                to="/" 
                                className="flex flex-col p-3 rounded-xl hover:bg-stone-50 transition-colors"
                                onClick={() => setIsSearching(false)}
                              >
                                <span className="text-sm font-bold text-stone-800">{s.title}</span>
                                <span className="text-[10px] text-stone-400 line-clamp-1">{s.description}</span>
                              </Link>
                            ))}
                          </div>
                        )}
                        {searchResults.products.length === 0 && searchResults.services.length === 0 && (
                          <p className="text-center py-4 text-sm text-stone-400">No matches found for "{searchQuery}"</p>
                        )}
                      </>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex items-center gap-4">
            <Tooltip content="Order History">
              <Link to="/orders" className="p-3 text-stone-400 hover:text-brand-primary hover:bg-stone-50 rounded-full transition-all">
                <UserIcon size={18} />
              </Link>
            </Tooltip>
            {user ? (
              <div className="flex items-center gap-3">
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName || ''} className="w-8 h-8 rounded-full border border-stone-100 shadow-sm" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center">
                    <UserIcon size={12} className="text-stone-300" />
                  </div>
                )}
              </div>
            ) : (
              <button 
                onClick={signInWithGoogle}
                className="p-3 text-stone-400 hover:text-brand-primary hover:bg-stone-50 rounded-full transition-all text-xs font-bold uppercase tracking-widest flex items-center gap-2"
              >
                <LogOut size={18} className="rotate-180" />
                <span className="hidden sm:inline">Sign In</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
