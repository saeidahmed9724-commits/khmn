import React, { useState, useEffect } from 'react';
import { Download, Sparkles, X, Smartphone, CheckCircle2, Share } from 'lucide-react';
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
  const [showInstructionsModal, setShowInstructionsModal] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const ar = lang === 'ar';

  useEffect(() => {
    // Check if app is already running as installed standalone PWA
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
      setIsStandalone(true);
    }

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  // If already installed and opened as app, show a small badge or hide
  if (isStandalone) {
    return (
      <div className="w-full text-center py-1">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/15 border border-emerald-500/30 rounded-full text-[11px] font-bold text-emerald-300">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>{ar ? 'تطبيق مثبت ✅ (الكروت محفوظة في الكاش)' : 'Installed App ✅ (Cards cached)'}</span>
        </span>
      </div>
    );
  }

  const handleInstallClick = async () => {
    sound.playCardFlip();
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else {
      // Browser didn't expose native prompt (iOS Safari, Desktop Chrome, etc.) -> show guide modal
      setShowInstructionsModal(true);
    }
  };

  return (
    <>
      {/* Prominent PWA Install Card on HomeScreen */}
      <div className="relative mx-auto w-full p-3 rounded-2xl bg-gradient-to-r from-blue-900/60 via-purple-900/60 to-blue-900/60 border border-indigo-400/40 backdrop-blur-md shadow-xl flex items-center justify-between gap-3 animate-fade-in my-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-slate-950 font-black shadow-md shrink-0">
            <Download className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-black text-white flex items-center gap-1">
              <span>{ar ? 'تثبيت اللعبة كتطبيق (PWA)' : 'Install as PWA App'}</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            </div>
            <p className="text-[10px] text-indigo-200/90 truncate">
              {ar ? 'ملء الشاشة، سرعة فائقة، وحفظ الكروت بدون باقة' : 'Full-screen app with cached cards & offline support'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleInstallClick}
          className="shrink-0 px-4 py-2 rounded-xl text-xs font-black bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 shadow-md cursor-pointer active:scale-95 transition-all flex items-center gap-1.5"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>{ar ? 'تثبيت الآن' : 'Install'}</span>
        </button>
      </div>

      {/* Installation Instructions Modal (For iOS Safari or desktop when native prompt unavailable) */}
      {showInstructionsModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-3xl bg-[#0F172A] border-2 border-indigo-400/50 p-5 shadow-2xl text-white space-y-4 animate-scale-up text-start">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-black text-base text-amber-300">
                <Smartphone className="w-5 h-5 text-amber-400" />
                <span>{ar ? 'تثبيت التطبيق على جهازك' : 'Install PWA App'}</span>
              </div>
              <button
                type="button"
                onClick={() => setShowInstructionsModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-1">
                <div className="font-bold text-amber-300 flex items-center gap-1.5">
                  <Share className="w-4 h-4 text-blue-400" />
                  <span>{ar ? 'لهواتف iPhone (متصفح Safari):' : 'For iPhone (Safari):'}</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  {ar
                    ? '1. اضغط على زر المشاركة (Share) أسفل المتصفح.\n2. اختر "إضافة إلى الصفحة الرئيسية (Add to Home Screen)".'
                    : '1. Tap the Share button in Safari.\n2. Select "Add to Home Screen".'}
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-1">
                <div className="font-bold text-amber-300 flex items-center gap-1.5">
                  <Download className="w-4 h-4 text-emerald-400" />
                  <span>{ar ? 'لهواتف Android والكمبيوتر (Chrome/Edge):' : 'For Android / PC (Chrome/Edge):'}</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  {ar
                    ? 'اضغط على زر القائمة (⋮) أعلى المتصفح ثم اختر "تثبيت التطبيق (Install App)".'
                    : 'Click browser menu (⋮) and choose "Install app".'}
                </p>
              </div>

              <div className="flex items-center gap-2 p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[11px] font-bold">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{ar ? 'تم تفعيل Service Worker وحفظ الكروت الافتراضية في الكاش!' : 'Service Worker active: default cards cached!'}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowInstructionsModal(false)}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs cursor-pointer active:scale-95 transition-all shadow-md"
            >
              {ar ? 'فهمت، شكراً' : 'Got it, thanks'}
            </button>
          </div>
        </div>
      )}
    </>
  );
};
