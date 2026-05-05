import { useEffect, useState } from 'react';
import { usePWAInstall } from '../lib/pwaInstall';
import { X, Download } from 'lucide-react';

export default function PWAInstallBanner() {
  const { isInstallable, promptToInstall, dismissPrompt } = usePWAInstall();
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Show banner after a short delay to avoid jarring UX
    if (isInstallable) {
      const timer = setTimeout(() => setShowBanner(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [isInstallable]);

  if (!showBanner || !isInstallable) return null;

  const handleInstall = async () => {
    await promptToInstall();
    setShowBanner(false);
  };

  const handleDismiss = () => {
    dismissPrompt();
    setShowBanner(false);
  };

  return (
    <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-gradient-to-r from-brand-primary via-brand-primary to-brand-primary/80 text-brand-cream rounded-lg shadow-2xl backdrop-blur-sm border border-brand-primary/20 p-4 z-40 animate-fade-in">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Download size={18} className="flex-shrink-0" />
            <h3 className="font-bold text-sm md:text-base">Install App</h3>
          </div>
          <p className="text-xs md:text-sm text-brand-cream/90">
            Get quick access to Maridadi Creations right from your home screen
          </p>
        </div>
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 p-1 hover:bg-white/20 rounded transition-colors"
          aria-label="Dismiss install prompt"
        >
          <X size={18} />
        </button>
      </div>
      <button
        onClick={handleInstall}
        className="mt-3 w-full bg-brand-cream text-brand-primary font-semibold py-2 px-4 rounded-lg hover:bg-opacity-90 transition-all duration-200 transform hover:scale-105 active:scale-95"
      >
        Install Now
      </button>
    </div>
  );
}
