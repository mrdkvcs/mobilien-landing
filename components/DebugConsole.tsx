"use client";

import { useEffect } from 'react';

export default function DebugConsole() {
  useEffect(() => {
    // Csak kliens oldalon fut
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isIOS || isMobile) {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/eruda';
      script.onload = function() {
        if ((window as any).eruda) {
          (window as any).eruda.init();
          console.log('🐛 Eruda debug console loaded for iOS/Mobile');
        }
      };
      document.head.appendChild(script);
    }
  }, []);

  return null;
}

