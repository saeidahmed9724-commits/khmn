import React, { useState, useEffect } from 'react';
import { Download, Sparkles, X } from 'lucide-react';
import { sound } from '../utils/audio';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface InstallPwaPromptProps {
  lang: 'ar' | 'en';
}

export const InstallPwaPrompt: React.FC<InstallPwaPromptProps> = ({ lang }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState<boolean>(() => {
    return localStorage.getItem('khmn_pwa_dismissed') === 'true';
  });

  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  if (!deferredPrompt || dismissed) return null;

  const handleInstallClick = async () => {
    sound.playCardFlip();
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem('khmn_pwa_dismissed', 'true');
  };

  const ar = lang === 'ar';

  return (
    <div className="relative mx-auto w-full max-w-md p-3 rounded-2xl bg-gradient-to-r from-blue-900/60 via-purple-900/60 to-blue-900/60 border border-indigo-400/40 backdrop-blur-md shadow-xl flex items-center justify-between gap-3 animate-fade-in my-2">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-slate-950 font-black shadow-md shrink-0">
          <Download className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <div className="text-xs font-black text-white flex items-center gap-1">
            <span>{ar ? 'تثبيت اللعبة على الشاشة' : 'Install Game on Phone'}</span>
            <Sparkles className="w-3 h-3 text-amber-300" />
          </div>
          <p className="text-[10px] text-indigo-200/90 truncate">
            {ar ? 'ملء الشاشة، تحميل فوري بدون باقة، وسرعة فائقة' : 'Full-screen app mode with instant card caching'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <button
          type="button"
          onClick={handleInstallClick}
          className="px-3.5 py-1.5 rounded-xl text-xs font-black bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 shadow-md cursor-pointer active:scale-95 transition-all"
        >
          {ar ? 'تثبيت' : 'Install'}
        </button>
        <button
          type="button"
          onClick={handleDismiss}
          className="p-1 rounded-lg text-slate-400 hover:text-slate-200 cursor-pointer"
          title={ar ? 'إغلاق' : 'Dismiss'}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
