import React, { useState } from 'react';
import { LOGO_SRC } from '../lib/brand';

export default function KSAMLogo({ className = "w-8 h-8", style }: { className?: string, style?: React.CSSProperties }) {
  const [error, setError] = useState(false);

  if (error) {
    return (
      <div 
        className={`flex items-center justify-center rounded-full bg-gradient-to-br from-[#2BFF9A] to-[#38BDF8] text-[#031A1A] font-bold ${className}`}
        style={style}
      >
        K
      </div>
    );
  }

  return (
    <img 
      src={LOGO_SRC} 
      alt="KSAM Logo" 
      className={`object-contain ${className}`}
      style={style}
      onError={(e) => {
        console.warn(`Failed to load logo from path: ${LOGO_SRC}`);
        setError(true);
      }}
    />
  );
}
