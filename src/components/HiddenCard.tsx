import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { sound } from '../utils/audio';
import { hapticImpact, hapticTap } from '../utils/haptics';
import { RefreshCw, Eye, EyeOff } from 'lucide-react';

interface HiddenCardProps {
  /** Short text read by screen readers (the picture itself is decorative art). */
  label: string;
  /** Highlights the card while it is its owner's turn. */
  active?: boolean;
  className?: string;
  /** When true, the card plays a 3D flip-back & drop-out exit animation (discard). */
  discarded?: boolean;
  /** Called after the discard exit animation finishes. */
  onDiscardComplete?: () => void;
  /** Secret picture URL (if available to peek) */
  secretImageUrl?: string;
  /** Secret title */
  secretTitle?: string;
  /** Allow clicking to flip/peek 3D */
  interactive?: boolean;
  lang?: 'ar' | 'en';
}

/**
 * 3D Physics-enabled Hidden Card:
 * - Realistic 3D perspective flip (back / front) on click with mechanical sound & haptic feedback.
 * - 3D Discard drop animation with physics easing.
 * - Interactive peek toggle.
 */
export const HiddenCard: React.FC<HiddenCardProps> = ({
  label,
  active = false,
  className = '',
  discarded = false,
  onDiscardComplete,
  secretImageUrl,
  secretTitle,
  interactive = true,
  lang = 'ar',
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const ar = lang === 'ar';

  const handleCardClick = () => {
    if (!interactive) return;
    const nextFlipped = !isFlipped;
    setIsFlipped(nextFlipped);

    // Realistic mechanical sound + haptic feedback
    if (nextFlipped) {
      sound.playCardFlip();
      hapticTap();
    } else {
      sound.playCardLock();
      hapticImpact();
    }
  };

  return (
    <div className="flex flex-col items-center w-full">
      <AnimatePresence onExitComplete={onDiscardComplete}>
        {!discarded && (
          <motion.div
            role="img"
            aria-label={label}
            className={`perspective-1000 relative w-full aspect-[2/3] rounded-[22px] select-none cursor-pointer ${className}`}
            onClick={handleCardClick}
            whileHover={{ scale: 1.03, rotateZ: active ? 0 : 1 }}
            whileTap={{ scale: 0.97 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0, scale: active ? 1.02 : 1 }}
            exit={{
              rotateY: -160,
              rotateX: 25,
              y: 160,
              opacity: 0,
              scale: 0.6,
              transition: {
                duration: 0.7,
                ease: [0.36, 0, 0.66, -0.56],
              },
            }}
          >
            {/* 3D Flipping Card Container */}
            <motion.div
              className={`relative w-full h-full rounded-[22px] transition-all duration-500 ${
                active
                  ? 'ring-4 ring-amber-300/80 shadow-[0_0_30px_rgba(251,191,36,0.5)]'
                  : 'shadow-[0_0_22px_rgba(59,100,246,0.35)]'
              }`}
              style={{
                transformStyle: 'preserve-3d',
                WebkitTransformStyle: 'preserve-3d',
              }}
              animate={{
                rotateY: isFlipped ? 180 : 0,
              }}
              transition={{
                duration: 0.6,
                ease: [0.23, 1, 0.32, 1],
              }}
            >
              {/* Card Back: The Hidden mystery card */}
              <div
                className="absolute inset-0 rounded-[22px] overflow-hidden border-2 border-indigo-400/40 bg-[#0F172A]"
                style={{
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                }}
              >
                <img
                  src="/hidden-card.webp"
                  alt=""
                  draggable={false}
                  loading="eager"
                  decoding="async"
                  className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex flex-col justify-end p-2.5 text-center">
                  <span className="text-[10px] font-black text-amber-300/90 flex items-center justify-center gap-1">
                    <span>🔒</span>
                    <span>{ar ? 'اضغط لقلب البطاقة 3D' : 'Tap to Flip 3D'}</span>
                  </span>
                </div>
              </div>

              {/* Card Front: Peek revealed picture or placeholder */}
              <div
                className="absolute inset-0 rounded-[22px] overflow-hidden border-2 border-amber-400/70 bg-gradient-to-br from-[#1E293B] to-[#0B132B] p-3 flex flex-col items-center justify-between rotate-y-180 shadow-2xl"
                style={{
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                }}
              >
                <div className="w-full flex items-center justify-between text-[10px] font-bold text-amber-300">
                  <span>{ar ? 'معاينة سرية 👁️' : 'Secret Peek 👁️'}</span>
                  <span className="text-slate-400 text-[9px]">{ar ? 'أنت فقط' : 'You only'}</span>
                </div>

                <div className="aspect-square w-full rounded-xl bg-[#070D1E] border border-slate-700/80 flex items-center justify-center p-2 overflow-hidden shadow-inner my-auto">
                  {secretImageUrl ? (
                    <img
                      src={secretImageUrl}
                      alt={secretTitle || ''}
                      className="w-full h-full object-contain drop-shadow-md"
                    />
                  ) : (
                    <div className="text-center p-2 text-slate-400 text-xs">
                      <span className="text-3xl block mb-1">🎭</span>
                      <span className="font-bold">{secretTitle || (ar ? 'بطاقتك السرية' : 'Secret Card')}</span>
                    </div>
                  )}
                </div>

                {secretTitle && (
                  <div className="text-xs font-black text-amber-300 truncate max-w-full">
                    {secretTitle}
                  </div>
                )}

                <div className="text-[9px] text-slate-400 font-bold">
                  {ar ? 'اضغط للقفل 🔒' : 'Tap to Lock 🔒'}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Interactive 3D Flip Quick Action Button */}
      {interactive && !discarded && (
        <button
          type="button"
          onClick={handleCardClick}
          className="mt-1.5 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-800/80 hover:bg-slate-700 border border-slate-600/50 text-[10px] font-bold text-slate-300 hover:text-white cursor-pointer active:scale-95 transition-all shadow-xs"
          title={ar ? 'اقلب البطاقة ثلاثية الأبعاد' : 'Flip 3D Card'}
        >
          <RefreshCw className={`w-3 h-3 text-amber-400 ${isFlipped ? 'rotate-180' : ''} transition-transform duration-300`} />
          <span>{isFlipped ? (ar ? 'قفل البطاقة 🔒' : 'Lock Card 🔒') : (ar ? 'اقلب واكشف 3D' : 'Flip 3D')}</span>
        </button>
      )}
    </div>
  );
};
