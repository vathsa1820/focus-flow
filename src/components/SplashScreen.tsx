import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [visible, setVisible] = useState(true);
  const prefersReduced = typeof window !== 'undefined'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), prefersReduced ? 400 : 2400);
    return () => clearTimeout(timer);
  }, [prefersReduced]);

  return (
    <AnimatePresence onExitComplete={onComplete}>
      {visible && (
        <motion.div
          key="splash"
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center"
          style={{
            background: 'radial-gradient(ellipse at 50% 40%, hsl(82 85% 55% / 0.06) 0%, hsl(240 10% 4%) 70%)',
          }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
        >
          {/* Subtle glow orb */}
          <div
            className="absolute w-64 h-64 rounded-full opacity-20 blur-3xl pointer-events-none"
            style={{ background: 'hsl(82 85% 55% / 0.3)' }}
          />

          {/* App name */}
          <motion.h1
            className="text-4xl sm:text-5xl font-bold tracking-tight text-gradient relative z-10"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            Focus Flow
          </motion.h1>

          {/* Glow pulse on text */}
          <motion.div
            className="absolute w-48 h-12 rounded-full blur-2xl pointer-events-none"
            style={{ background: 'hsl(82 85% 55% / 0.15)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.6, 0.2, 0.5, 0.2] }}
            transition={{ duration: 2.4, ease: 'easeInOut' }}
          />

          {/* Welcome text */}
          <motion.p
            className="mt-4 text-base sm:text-lg font-light tracking-wide text-muted-foreground relative z-10"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            Welcome,{' '}
            <span className="text-foreground font-medium">vathsa</span>
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
