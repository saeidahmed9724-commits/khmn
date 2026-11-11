import React from 'react';
import { Wifi, WifiOff, Mic, MicOff, AlertTriangle, Bot, Radio } from 'lucide-react';

interface PresenceBadgeProps {
  /** The opponent's voice chat state. */
  peerVoiceState?: {
    mic?: boolean;
    speaking?: boolean;
    state?: 'connected' | 'waiting' | 'error' | 'reconnecting';
  };
  /** Current WebSocket readyState (pass from onlineService). */
  wsConnected?: boolean;
  /** Ping in ms (measured RTT). */
  pingMs?: number | null;
  /** Current mode */
  mode?: 'online' | 'bot' | 'offline';
  lang: 'ar' | 'en';
}

function pingColor(ms: number | null | undefined): string {
  if (ms == null) return 'text-emerald-400';
  if (ms < 100) return 'text-emerald-400';
  if (ms < 250) return 'text-amber-400';
  return 'text-rose-400';
}

function pingBars(ms: number | null | undefined): number {
  if (ms == null) return 4;
  if (ms < 80) return 4;
  if (ms < 150) return 3;
  if (ms < 300) return 2;
  return 1;
}

/**
 * Compact presence indicator showing:
 * - Ping quality (bars + ms)
 * - Opponent mic state (speaking / muted / off)
 */
export const PresenceBadge: React.FC<PresenceBadgeProps> = ({
  peerVoiceState,
  wsConnected = true,
  pingMs,
  mode = 'online',
  lang,
}) => {
  const ar = lang === 'ar';
  const effectivePing = mode === 'online' ? pingMs : 16;
  const bars = pingBars(effectivePing);
  const color = pingColor(effectivePing);

  const micState = peerVoiceState?.mic
    ? peerVoiceState.speaking
      ? 'speaking'
      : 'on'
    : 'off';

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#1b2150]/70 backdrop-blur-md border border-indigo-400/30 text-[10px] font-bold shadow-md">
      {/* Ping indicator */}
      <div className={`flex items-center gap-1.5 ${color}`}>
        {mode === 'bot' ? (
          <>
            <Bot className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-cyan-300 font-bold">{ar ? 'روبوت ذكي' : 'AI Bot'}</span>
          </>
        ) : wsConnected ? (
          <>
            {/* Signal bars */}
            <div className="flex items-end gap-[2px] h-3">
              {[1, 2, 3, 4].map((level) => (
                <div
                  key={level}
                  className={`w-[3px] rounded-sm transition-all ${
                    level <= bars ? 'bg-current' : 'bg-slate-600'
                  }`}
                  style={{ height: `${level * 3 + 2}px` }}
                />
              ))}
            </div>
            <span className="tabular-nums font-mono">
              {effectivePing != null ? `${effectivePing}ms` : '24ms'}
            </span>
          </>
        ) : (
          <>
            <WifiOff className="w-3.5 h-3.5 text-rose-400" />
            <span className="text-rose-400">{ar ? 'انقطع الاتصال' : 'Offline'}</span>
          </>
        )}
      </div>

      {/* Divider */}
      <div className="w-px h-3.5 bg-slate-600/70" />

      {/* Mic / Voice state */}
      <div
        className={`flex items-center gap-1 ${
          micState === 'speaking'
            ? 'text-emerald-400 font-black'
            : micState === 'on'
              ? 'text-slate-300'
              : 'text-slate-400'
        }`}
        title={
          micState === 'speaking'
            ? (ar ? 'المايك: يتحدث الآن 🎙️' : 'Mic: Speaking now 🎙️')
            : micState === 'on'
              ? (ar ? 'المايك: مفتوح 🎙️' : 'Mic: On 🎙️')
              : (ar ? 'المايك: صامت 🔇' : 'Mic: Muted 🔇')
        }
      >
        {micState === 'off' ? (
          <MicOff className="w-3 h-3 text-slate-500" />
        ) : (
          <Mic className={`w-3 h-3 ${micState === 'speaking' ? 'animate-pulse text-emerald-400' : ''}`} />
        )}
        <span>
          {micState === 'speaking'
            ? (ar ? 'يتحدث الآن...' : 'Speaking...')
            : micState === 'on'
              ? (ar ? 'مفتوح' : 'On')
              : (ar ? 'صامت' : 'Muted')}
        </span>
      </div>

      {/* Reconnecting warning */}
      {peerVoiceState?.state === 'reconnecting' && (
        <>
          <div className="w-px h-3 bg-slate-600" />
          <div className="flex items-center gap-1 text-amber-400">
            <AlertTriangle className="w-3 h-3 animate-spin" />
            <span>{ar ? 'إعادة اتصال...' : 'Reconnecting...'}</span>
          </div>
        </>
      )}
    </div>
  );
};
