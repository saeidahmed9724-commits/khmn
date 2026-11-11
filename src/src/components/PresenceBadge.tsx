import React, { useState, useEffect, useRef } from 'react';
import { Wifi, WifiOff, Mic, MicOff, AlertTriangle } from 'lucide-react';

interface PresenceBadgeProps {
  /** The opponent's voice chat state. */
  peerVoiceState?: {
    mic?: boolean;
    speaking?: boolean;
    state?: 'connected' | 'waiting' | 'error' | 'reconnecting';
  };
  /** Current WebSocket readyState (pass from onlineService). */
  wsConnected: boolean;
  /** Ping in ms (measured RTT). */
  pingMs?: number | null;
  lang: 'ar' | 'en';
}

function pingColor(ms: number | null | undefined): string {
  if (ms == null) return 'text-slate-500';
  if (ms < 100) return 'text-emerald-400';
  if (ms < 250) return 'text-amber-400';
  return 'text-rose-400';
}

function pingBars(ms: number | null | undefined): number {
  if (ms == null) return 0;
  if (ms < 80) return 4;
  if (ms < 150) return 3;
  if (ms < 300) return 2;
  return 1;
}

function pingLabel(ms: number | null | undefined, lang: 'ar' | 'en'): string {
  if (ms == null) return lang === 'ar' ? 'غير متصل' : 'Offline';
  return `${ms}ms`;
}

/**
 * Compact presence indicator showing:
 * - Ping quality (bars + ms)
 * - Opponent mic state (speaking / muted / off)
 */
export const PresenceBadge: React.FC<PresenceBadgeProps> = ({
  peerVoiceState,
  wsConnected,
  pingMs,
  lang,
}) => {
  const ar = lang === 'ar';
  const bars = pingBars(pingMs);
  const color = pingColor(pingMs);

  const micState = peerVoiceState?.mic
    ? peerVoiceState.speaking
      ? 'speaking'
      : 'on'
    : 'off';

  return (
    <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-[#1b2150]/60 backdrop-blur-md border border-slate-700/60 text-[10px] font-bold">
      {/* Ping indicator */}
      <div className={`flex items-center gap-1 ${color}`} title={pingLabel(pingMs, lang)}>
        {wsConnected ? (
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
            <span className="tabular-nums">{pingMs != null ? `${pingMs}ms` : '—'}</span>
          </>
        ) : (
          <>
            <WifiOff className="w-3 h-3 text-rose-400" />
            <span className="text-rose-400">{ar ? 'منقطع' : 'Lost'}</span>
          </>
        )}
      </div>

      {/* Divider */}
      <div className="w-px h-3 bg-slate-600" />

      {/* Mic / Voice state */}
      <div
        className={`flex items-center gap-1 ${
          micState === 'speaking'
            ? 'text-emerald-400'
            : micState === 'on'
              ? 'text-slate-300'
              : 'text-slate-500'
        }`}
        title={
          micState === 'speaking'
            ? (ar ? 'يتحدث الآن' : 'Speaking now')
            : micState === 'on'
              ? (ar ? 'المايك مفتوح' : 'Mic on')
              : (ar ? 'المايك مقفول' : 'Mic off')
        }
      >
        {micState === 'off' ? (
          <MicOff className="w-3 h-3" />
        ) : (
          <Mic className={`w-3 h-3 ${micState === 'speaking' ? 'animate-pulse' : ''}`} />
        )}
        <span>
          {micState === 'speaking'
            ? (ar ? 'يتحدث' : 'Speaking')
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
            <AlertTriangle className="w-3 h-3" />
            <span>{ar ? 'إعادة اتصال' : 'Reconnecting'}</span>
          </div>
        </>
      )}
    </div>
  );
};
