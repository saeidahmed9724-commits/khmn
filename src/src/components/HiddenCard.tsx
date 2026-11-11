import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { sound } from '../utils/audio';
import { hapticImpact, hapticTap } from '../utils/haptics';

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
}

/** The face-down "secret picture" card shown inside the game (public/hidden-card.webp). */
export const HiddenCard: React.FC<HiddenCardProps> = ({
  label,
  active = false,
  className = '',
  discarded = false,
  onDiscardComplete,
}) => {
  // Normal state: card is visible with optional active glow
  // Discarded state: card flips 3D to the back, drops down, and fades out

  return (
    <AnimatePresence
      onExitComplete={() => {
        onDiscardComplete?.();
      }}
    >
      {!discarded && (
        <motion.div
          role="img"
          aria-label={label}
          className={`relative w-full aspect-[2/3] rounded-[22px] overflow-hidden select-none ${
            active
              ? 'ring-4 ring-amber-300/80 shadow-[0_0_30px_rgba(251,191,36,0.45)]'
              : 'shadow-[0_0_22px_rgba(59,100,246,0.35)]'
          } ${className}`}
          style={{
            transformStyle: 'preserve-3d',
            WebkitTransformStyle: 'preserve-3d',
            perspective: 800,
          }}
          initial={false}
          animate={{
            scale: active ? 1.02 : 1,
            rotateY: 0,
            rotateX: 0,
            y: 0,
            opacity: 1,
          }}
          exit={{
            rotateY: -160,
            rotateX: 15,
            y: 120,
            opacity: 0,
            scale: 0.7,
            transition: {
              duration: 0.65,
              ease: [0.36, 0, 0.66, -0.56], // custom overshoot for "physics" feel
            },
          }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          onAnimationStart={(definition) => {
            // Trigger haptic + sound only on the exit (discard) animation
            if (definition === 'exit' || (typeof definition === 'object' && 'opacity' in definition && (definition as any).opacity === 0)) {
              hapticImpact();
              sound.playCardLock();
            }
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
        </motion.div>
      )}
    </AnimatePresence>
  );
};
