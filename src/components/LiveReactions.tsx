import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { sound } from '../utils/audio';
import { hapticNotification } from '../utils/haptics';

export type ReactionEmoji = '❤️' | '🔥' | '❗' | '😂' | '👏' | '😱';

export const REACTION_OPTIONS: ReactionEmoji[] = ['❤️', '🔥', '❗', '😂', '👏', '😱'];

interface FloatingReaction {
  id: number;
  emoji: ReactionEmoji;
  x: number; // percentage from left (0-100)
  startY: number; // starting Y offset from bottom
}

interface LiveReactionsProps {
  /** Incoming reactions from the opponent (received via WebSocket). */
  incomingReaction?: { emoji: ReactionEmoji; timestamp: number } | null;
  /** Called when the local player sends a reaction. */
  onSendReaction?: (emoji: ReactionEmoji) => void;
  /** Whether to show the reaction bar (send buttons). */
  showBar?: boolean;
  lang: 'ar' | 'en';
}

let reactionIdCounter = 0;

/**
 * Live emoji reactions overlay: floating emojis that pop up from the bottom.
 * Also renders a compact reaction bar for sending.
 */
export const LiveReactions: React.FC<LiveReactionsProps> = ({
  incomingReaction,
  onSendReaction,
  showBar = true,
  lang,
}) => {
  const [floatingReactions, setFloatingReactions] = useState<FloatingReaction[]>([]);
  const lastIncomingTs = useRef<number>(0);

  const spawnReaction = useCallback((emoji: ReactionEmoji) => {
    const id = ++reactionIdCounter;
    const x = 10 + Math.random() * 80; // random horizontal position
    const startY = Math.random() * 40;
    setFloatingReactions((prev) => [...prev.slice(-12), { id, emoji, x, startY }]);

    // Auto-remove after animation
    setTimeout(() => {
      setFloatingReactions((prev) => prev.filter((r) => r.id !== id));
    }, 2200);
  }, []);

  // Handle incoming reactions from opponent
  useEffect(() => {
    if (incomingReaction && incomingReaction.timestamp !== lastIncomingTs.current) {
      lastIncomingTs.current = incomingReaction.timestamp;
      spawnReaction(incomingReaction.emoji);
      hapticNotification();
    }
  }, [incomingReaction, spawnReaction]);

  const handleSend = (emoji: ReactionEmoji) => {
    spawnReaction(emoji);
    sound.playReactionPop();
    onSendReaction?.(emoji);
  };

  return (
    <>
      {/* Floating reactions overlay */}
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        <AnimatePresence>
          {floatingReactions.map((r) => (
            <motion.div
              key={r.id}
              className="absolute text-3xl sm:text-4xl select-none pointer-events-none"
              style={{ left: `${r.x}%`, bottom: `${10 + r.startY}%` }}
              initial={{ opacity: 0, scale: 0.3, y: 0 }}
              animate={{
                opacity: [0, 1, 1, 0.8, 0],
                scale: [0.3, 1.3, 1, 0.9, 0.6],
                y: [0, -60, -140, -220, -320],
                x: [0, (Math.random() - 0.5) * 40, (Math.random() - 0.5) * 60],
              }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ duration: 2, ease: 'easeOut' }}
            >
              {r.emoji}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Reaction send bar */}
      {showBar && (
        <div className="flex items-center justify-center gap-1.5 py-1">
          <span className="text-[10px] font-bold text-slate-500 mr-1">
            {lang === 'ar' ? 'تفاعل' : 'React'}
          </span>
          {REACTION_OPTIONS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => handleSend(emoji)}
              className="w-8 h-8 rounded-full bg-slate-800/60 hover:bg-slate-700/80 border border-slate-600/40 flex items-center justify-center text-base cursor-pointer active:scale-90 transition-all hover:scale-110"
              title={`${lang === 'ar' ? 'أرسل' : 'Send'} ${emoji}`}
            >
              {emoji}
            </button>
          ))}
        </div>
      )}
    </>
  );
};
