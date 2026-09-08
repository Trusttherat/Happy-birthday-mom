import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';

interface Particle {
  id: number;
  x: number;
  driftX: number;
  sizeClass: string;
  duration: number;
  delay: number;
  type: 'heart' | 'sparkle' | 'circle' | 'star';
  colorClass: string;
  bgClass: string;
}

export const FloatingParticles: React.FC = () => {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const colorOptions = [
      { text: 'text-pink-400/60', bg: 'bg-pink-400/50' },
      { text: 'text-pink-500/50', bg: 'bg-pink-500/40' },
      { text: 'text-fuchsia-400/50', bg: 'bg-fuchsia-400/40' },
      { text: 'text-rose-400/60', bg: 'bg-rose-400/50' },
      { text: 'text-amber-300/60', bg: 'bg-amber-300/50' },
      { text: 'text-rose-300/60', bg: 'bg-rose-300/50' },
    ];

    const sizeClasses = ['w-3 h-3', 'w-4 h-4', 'w-5 h-5', 'w-6 h-6'];
    const types: ('heart' | 'sparkle' | 'circle' | 'star')[] = ['heart', 'sparkle', 'circle', 'star'];

    const newParticles: Particle[] = Array.from({ length: 22 }).map((_, i) => {
      const color = colorOptions[Math.floor(Math.random() * colorOptions.length)];
      const x = Math.random() * 100;
      return {
        id: i,
        x,
        driftX: x + (Math.random() * 6 - 3),
        sizeClass: sizeClasses[Math.floor(Math.random() * sizeClasses.length)],
        duration: Math.random() * 10 + 12,
        delay: Math.random() * 7,
        type: types[Math.floor(Math.random() * types.length)],
        colorClass: color.text,
        bgClass: color.bg,
      };
    });

    setParticles(newParticles);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ y: '105vh', opacity: 0, x: `${p.x}vw`, rotate: 0 }}
          animate={{
            y: '-10vh',
            opacity: [0, 0.75, 0.75, 0],
            rotate: [0, 45, -45, 90],
            x: [`${p.x}vw`, `${p.driftX}vw`, `${p.x}vw`],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className={`absolute ${p.sizeClass}`}
        >
          {p.type === 'heart' && (
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              className={`w-full h-full drop-shadow-sm ${p.colorClass}`}
            >
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          )}

          {p.type === 'star' && (
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              className={`w-full h-full drop-shadow-sm ${p.colorClass}`}
            >
              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
            </svg>
          )}

          {p.type === 'sparkle' && (
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              className={`w-full h-full drop-shadow-sm ${p.colorClass}`}
            >
              <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
            </svg>
          )}

          {p.type === 'circle' && (
            <div className={`w-full h-full rounded-full blur-[0.5px] ${p.bgClass}`} />
          )}
        </motion.div>
      ))}
    </div>
  );
};
