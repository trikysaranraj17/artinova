'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';

export default function LenisScroll() {
  useEffect(() => {
    // Check if device is touch, we might disable Lenis on small screens to respect normal scroll
    if (window.innerWidth <= 1024) return;

    const lenis = new Lenis({
      duration: 1.4,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }

    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  return null;
}
