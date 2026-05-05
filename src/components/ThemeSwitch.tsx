import { Monitor, Moon, Sun } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { useThemeMode, type ThemeMode } from '../lib/theme';

const themeOptions: { id: ThemeMode; label: string; icon: typeof Sun }[] = [
  { id: 'light', label: 'Light', icon: Sun },
  { id: 'dark', label: 'Dark', icon: Moon },
  { id: 'system', label: 'System', icon: Monitor }
];

export default function ThemeSwitch() {
  const { themeMode, setThemeMode } = useThemeMode();
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const activeOption = themeOptions.find(option => option.id === themeMode) || themeOptions[2];
  const ActiveIcon = activeOption.icon;

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  return (
    <div ref={wrapperRef} className="relative" aria-label="Theme preference">
      <button
        type="button"
        onClick={() => setOpen(value => !value)}
        className="flex min-h-11 min-w-11 items-center justify-center rounded-full border border-stone-100 bg-stone-50 text-stone-500 transition-all hover:text-brand-primary"
        title={`${activeOption.label} theme`}
        aria-label="Change theme"
        aria-expanded={open}
      >
        <ActiveIcon size={17} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.14, ease: 'easeOut' }}
            className="absolute right-0 top-full z-[90] mt-3 min-w-40 overflow-hidden rounded-2xl border border-stone-100 bg-white p-1 shadow-2xl shadow-stone-900/10"
          >
            {themeOptions.map(option => {
              const Icon = option.icon;
              const active = themeMode === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => {
                    setThemeMode(option.id);
                    setOpen(false);
                  }}
                  className={`flex w-full min-h-11 items-center gap-3 rounded-xl px-3 text-left text-xs font-black uppercase tracking-widest transition-all ${active ? 'bg-brand-primary text-brand-cream' : 'text-stone-400 hover:bg-stone-50 hover:text-brand-primary'}`}
                  aria-pressed={active}
                >
                  <Icon size={15} />
                  {option.label}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
