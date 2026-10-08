import React, { useState, useEffect } from 'react';
import KSAMLogo from './KSAMLogo';

export default function IntroSplash({ onComplete }: { onComplete: () => void }) {
  const [skip, setSkip] = useState(false);
  const [showSkip, setShowSkip] = useState(false);
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  useEffect(() => {
    try {
      const hasLoaded = sessionStorage.getItem('ksam_intro_played');
      if (hasLoaded) {
        setIsFirstLoad(false);
        // Short version
        const timer = setTimeout(() => {
          onComplete();
        }, 600);
        return () => clearTimeout(timer);
      } else {
        sessionStorage.setItem('ksam_intro_played', 'true');
        // Full version
        const skipTimer = setTimeout(() => setShowSkip(true), 800);
        const endTimer = setTimeout(() => onComplete(), 2500);
        return () => {
          clearTimeout(skipTimer);
          clearTimeout(endTimer);
        };
      }
    } catch (e) {
      onComplete(); // Fallback
    }
  }, [onComplete]);

  useEffect(() => {
    const handleKey = () => setSkip(true);
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  if (skip) {
    onComplete();
    return null;
  }

  // Check prefers-reduced-motion
  const prefersReduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  return (
    <div 
      className={`fixed inset-0 z-[999] flex flex-col items-center justify-center bg-[var(--bg-base)] text-white overflow-hidden transition-all duration-500 ${!isFirstLoad ? 'animate-fade-out-fast' : 'animate-intro-exit'}`}
      onClick={() => setSkip(true)}
      style={{ animationFillMode: 'forwards', animationDelay: isFirstLoad ? '2s' : '0s' }}
    >
      {/* Background aurora */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="aurora"></div>
      </div>

      <div className="relative z-10 flex flex-col items-center">
        {/* Logo Container */}
        <div className={`relative flex items-center justify-center ${prefersReduced ? '' : (isFirstLoad ? 'animate-logo-intro' : 'animate-fade-in')}`}>
          {isFirstLoad && !prefersReduced && (
            <>
              <div className="absolute inset-0 rounded-full border border-[#22D3EE] opacity-0 animate-pulse-ring-1" />
              <div className="absolute inset-0 rounded-full border border-[#22D3EE] opacity-0 animate-pulse-ring-2" />
            </>
          )}
          <KSAMLogo className="w-24 h-24 relative z-10" />
        </div>

        {/* Text Area */}
        {isFirstLoad && (
          <div className="mt-6 flex flex-col items-center text-center">
            <h1 className="text-3xl font-serif tracking-wide relative overflow-hidden flex text-gradient drop-shadow-sm">
              {"KSAM Assistant".split('').map((char, i) => (
                <span 
                  key={i} 
                  className={`inline-block ${prefersReduced ? '' : 'animate-letter-reveal'}`}
                  style={{ animationDelay: `${0.5 + i * 0.04}s`, animationFillMode: 'both' }}
                >
                  {char === ' ' ? '\u00A0' : char}
                </span>
              ))}
              {/* Sweep effect */}
              {!prefersReduced && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 animate-sweep mix-blend-overlay" style={{ animationDelay: '1.2s' }}></div>}
            </h1>
            
            <p className={`text-sm text-[var(--text-muted)] mt-2 font-medium tracking-widest uppercase ${prefersReduced ? '' : 'animate-fade-up'}`} style={{ animationDelay: '1.4s', animationFillMode: 'both' }}>
              Ask. Snap. Create.
            </p>

            {/* Progress line */}
            <div className={`w-32 h-[1px] bg-white/10 mt-6 relative overflow-hidden ${prefersReduced ? 'hidden' : 'animate-fade-in'}`} style={{ animationDelay: '1.8s', animationFillMode: 'both' }}>
              <div className="absolute inset-y-0 left-0 bg-[var(--brand-gradient)] animate-progress-fill" style={{ animationDelay: '1.8s', animationFillMode: 'both' }} />
            </div>
          </div>
        )}
      </div>

      {showSkip && isFirstLoad && (
        <button 
          className="absolute bottom-8 right-8 text-xs text-[var(--text-muted)] hover:text-white transition-colors uppercase tracking-widest font-medium z-20"
          onClick={(e) => { e.stopPropagation(); setSkip(true); }}
        >
          Skip
        </button>
      )}
    </div>
  );
}
