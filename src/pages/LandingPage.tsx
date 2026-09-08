import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Heart, ArrowRight, Gift, PartyPopper } from 'lucide-react';
import { GlowButton } from '../components/GlowButton';

interface LandingPageProps {
  onNavigateToAbout: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigateToAbout }) => {
  const [hasPopped, setHasPopped] = useState(false);
  const [isWished, setIsWished] = useState(false);

  const handleSurprise = () => {
    setHasPopped(true);
    setTimeout(() => setHasPopped(false), 3500);
  };

  return (
    <div className="relative min-h-[92vh] flex flex-col justify-between items-center px-4 py-8 md:py-12 overflow-hidden">
      {/* Soft pastel decorative gradient aura */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] sm:w-[550px] md:w-[700px] h-[320px] sm:h-[550px] md:h-[700px] rounded-full bg-gradient-to-tr from-pink-200/50 via-rose-200/40 to-fuchsia-200/40 blur-3xl pointer-events-none -z-10 animate-pulse" />

      {/* Top subtle badge */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="text-center pt-2"
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/70 backdrop-blur-md border border-pink-200/80 shadow-sm text-pink-700 text-xs sm:text-sm font-semibold tracking-wide">
          <Sparkles className="w-4 h-4 text-pink-500 animate-pulse" />
          <span>Celebrating The Most Wonderful Person</span>
          <Heart className="w-4 h-4 text-rose-500 fill-rose-500 animate-bounce" />
        </div>
      </motion.div>

      {/* Main Centered Content: "Happy Birthday Mom" in bold, elegant font */}
      <div className="my-auto text-center max-w-4xl w-full px-2 py-6 flex flex-col items-center justify-center relative">
        {/* Decorative Floating Sparkle Icons */}
        <motion.div
          animate={{ y: [-6, 6, -6], rotate: [0, 8, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-6 left-6 md:left-16 text-pink-400 opacity-70 hidden sm:block pointer-events-none"
        >
          <Sparkles className="w-8 h-8" />
        </motion.div>

        <motion.div
          animate={{ y: [6, -6, 6], rotate: [0, -8, 0] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-4 right-6 md:right-16 text-fuchsia-400 opacity-70 hidden sm:block pointer-events-none"
        >
          <PartyPopper className="w-8 h-8" />
        </motion.div>

        {/* Script Subheading */}
        <motion.p
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.1 }}
          className="font-script text-3xl sm:text-4xl md:text-5xl text-pink-500 tracking-wider mb-2"
        >
          To Our Queen & Guiding Light
        </motion.p>

        {/* The Mandatory Centered Text: "Happy Birthday Mom" */}
        <motion.h1
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1, delay: 0.2, type: 'spring', damping: 15 }}
          className="font-serif-display font-black text-5xl sm:text-7xl md:text-8xl lg:text-9xl tracking-tight leading-none text-slate-900 drop-shadow-sm select-none"
        >
          <span className="block text-slate-900">Happy</span>
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-pink-600 via-rose-500 to-fuchsia-600 py-1">
            Birthday
          </span>
          <span className="block text-slate-900 font-extrabold">Mom</span>
        </motion.h1>

        {/* Delicate descriptive sentence */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-6 text-base sm:text-lg md:text-xl text-slate-600 max-w-2xl font-medium leading-relaxed"
        >
          Today and every day, we celebrate your infinite love, radiant warmth, and the gentle beauty you bring into all of our lives.
        </motion.p>

        {/* Interactive birthday candle / surprise button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-6 flex flex-wrap items-center justify-center gap-3"
        >
          <button
            id="make-wish-btn"
            onClick={() => {
              setIsWished(!isWished);
              handleSurprise();
            }}
            className="glow-btn px-4 py-2 rounded-full text-xs font-bold bg-white/80 hover:bg-white text-pink-700 border border-pink-200/90 shadow-sm flex items-center gap-2 cursor-pointer transition-all"
          >
            <Gift className="w-3.5 h-3.5 text-pink-500" />
            <span>{isWished ? '✨ Wish Sent to the Stars!' : '🎂 Tap to Make a Birthday Wish'}</span>
          </button>
        </motion.div>

        {/* Confetti celebration burst */}
        <AnimatePresence>
          {hasPopped && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              {Array.from({ length: 30 }).map((_, i) => {
                const angle = (i / 30) * 360;
                const distance = 140 + Math.random() * 160;
                const x = Math.cos((angle * Math.PI) / 180) * distance;
                const y = Math.sin((angle * Math.PI) / 180) * distance;
                const bgClasses = ['bg-pink-500', 'bg-rose-500', 'bg-fuchsia-500', 'bg-amber-400', 'bg-pink-400'];
                const bgClass = bgClasses[i % bgClasses.length];

                return (
                  <motion.div
                    key={i}
                    initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
                    animate={{
                      x,
                      y,
                      scale: [0, 1.4, 0.8],
                      opacity: [1, 1, 0],
                      rotate: 360,
                    }}
                    transition={{ duration: 1.8, ease: 'easeOut' }}
                    className={`absolute w-3 h-3 rounded-full ${bgClass}`}
                  />
                );
              })}
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Mandatory centered button at the bottom leading to "About Mom" */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.7 }}
        className="w-full flex flex-col items-center justify-center pb-4 sm:pb-8 pt-4"
      >
        <GlowButton
          id="landing-to-about-btn"
          size="lg"
          variant="primary"
          onClick={onNavigateToAbout}
          icon={<ArrowRight className="w-5 h-5 ml-1 transition-transform duration-300 group-hover:translate-x-1" />}
          className="shadow-xl px-8 py-4 text-base sm:text-lg font-bold"
        >
          Discover About Mom
        </GlowButton>

        <p className="text-xs text-pink-700/80 font-semibold tracking-wider mt-3 uppercase">
          Chapter 1 of 5
        </p>
      </motion.div>
    </div>
  );
};
