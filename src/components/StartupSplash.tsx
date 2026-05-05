import { useEffect, useState } from 'react';

export default function StartupSplash() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setVisible(false), 1450);
    return () => window.clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-brand-cream text-brand-primary startup-splash">
      <div className="flex flex-col items-center gap-6">
        <div className="relative flex h-28 w-28 items-center justify-center rounded-[32px] bg-stone-950 shadow-2xl shadow-stone-950/15">
          <svg viewBox="0 0 160 100" className="h-20 w-24" aria-label="Infinity Creations startup icon">
            <path
              className="startup-infinity-path"
              d="M20 50c16-30 36-38 58-16l14 14c22 22 40 14 50-6 7-15 2-31-11-38-18-10-40 0-62 38l-8 13c-24 39-49 54-70 38-18-14-16-42 1-56 18-15 42-8 66 15l16 15c24 23 45 18 61-15"
              fill="none"
              stroke="#F5F5F0"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="12"
            />
            <path
              d="M44 82h62"
              fill="none"
              stroke="#D7A64A"
              strokeLinecap="round"
              strokeWidth="8"
              className="startup-gold-line"
            />
          </svg>
        </div>
        <div className="text-center">
          <div className="font-serif text-3xl font-semibold text-stone-900">Infinity Creations</div>
          <div className="mt-2 text-[10px] font-black uppercase tracking-[0.28em] text-brand-primary/60">Design. Print. Brand.</div>
        </div>
      </div>
    </div>
  );
}
