import React, { useEffect, useState } from 'react';
import { WifiOff, RefreshCw, AlertCircle } from 'lucide-react';

interface ReconnectGraceOverlayProps {
  type: 'self' | 'peer';
  initialSeconds?: number;
  peerName?: string;
  lang: 'ar' | 'en';
}

export const ReconnectGraceOverlay: React.FC<ReconnectGraceOverlayProps> = ({
  type,
  initialSeconds = 45,
  peerName = 'الخصم',
  lang,
}) => {
  const [remaining, setRemaining] = useState<number>(initialSeconds);
  const ar = lang === 'ar';

  useEffect(() => {
    setRemaining(initialSeconds);
    const interval = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [initialSeconds]);

  return (
    <div className="fixed top-4 inset-x-4 z-50 max-w-md mx-auto pointer-events-none animate-slide-down">
      <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-950/90 via-slate-900/95 to-amber-950/90 border-2 border-amber-400/80 shadow-2xl backdrop-blur-md text-white flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center shrink-0">
            {type === 'self' ? (
              <RefreshCw className="w-5 h-5 text-amber-300 animate-spin" />
            ) : (
              <WifiOff className="w-5 h-5 text-amber-400 animate-pulse" />
            )}
          </div>
          <div className="min-w-0">
            <div className="text-xs font-black text-amber-300">
              {type === 'self'
                ? (ar ? 'جاري إعادة الاتصال باللعبة...' : 'Reconnecting to game...')
                : (ar ? `انقطع اتصال ${peerName}` : `${peerName} disconnected`)}
            </div>
            <p className="text-[10px] text-slate-300 font-bold truncate">
              {type === 'self'
                ? (ar ? 'يتم استرجاع غرفتك وحالة الطاولة' : 'Restoring room and table state')
                : (ar ? 'مهلة 45 ثانية لعودته دون احتسابه خاسراً' : '45s grace period before forfeit')}
            </p>
          </div>
        </div>

        {/* Circular Countdown badge */}
        <div className="shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-amber-400 text-slate-950 font-black font-mono text-sm shadow-md">
          {remaining}s
        </div>
      </div>
    </div>
  );
};
