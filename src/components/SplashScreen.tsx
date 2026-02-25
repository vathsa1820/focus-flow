import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [userName, setUserName] = useState<string | null>(() =>
    localStorage.getItem('focus-flow-user-name')
  );
  const [nameInput, setNameInput] = useState('');
  const [phase, setPhase] = useState<'ask' | 'welcome' | 'done'>(
    userName ? 'welcome' : 'ask'
  );

  const prefersReduced = typeof window !== 'undefined'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    if (phase === 'welcome') {
      const timer = setTimeout(() => setPhase('done'), prefersReduced ? 400 : 2400);
      return () => clearTimeout(timer);
    }
  }, [phase, prefersReduced]);

  const handleSubmitName = () => {
    const trimmed = nameInput.trim();
    if (trimmed) {
      localStorage.setItem('focus-flow-user-name', trimmed);
      setUserName(trimmed);
      setPhase('welcome');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmitName();
  };

  return (
    <AnimatePresence onExitComplete={onComplete}>
      {phase !== 'done' && (
        <motion.div
          key="splash"
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center px-6"
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

          {/* App name — always visible */}
          <motion.h1
            className="text-4xl sm:text-5xl font-bold tracking-tight text-gradient relative z-10"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            Focus Flow
          </motion.h1>

          {/* Glow pulse */}
          <motion.div
            className="absolute w-48 h-12 rounded-full blur-2xl pointer-events-none"
            style={{ background: 'hsl(82 85% 55% / 0.15)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.6, 0.2, 0.5, 0.2] }}
            transition={{ duration: 2.4, ease: 'easeInOut' }}
          />

          {phase === 'ask' && (
            <motion.div
              className="mt-8 flex flex-col items-center gap-4 relative z-10 w-full max-w-xs"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              <p className="text-sm text-muted-foreground text-center">What should we call you?</p>
              <input
                type="text"
                value={nameInput}
                onChange={e => setNameInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Your name"
                autoFocus
                className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 text-center text-lg font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-muted-foreground/50"
              />
              <button
                onClick={handleSubmitName}
                disabled={!nameInput.trim()}
                className="w-full bg-primary text-primary-foreground font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-40"
              >
                Let's Go
              </button>
            </motion.div>
          )}

          {phase === 'welcome' && (
            <motion.p
              className="mt-4 text-base sm:text-lg font-light tracking-wide text-muted-foreground relative z-10"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              Welcome,{' '}
              <span className="text-foreground font-medium">{userName}</span>
            </motion.p>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
