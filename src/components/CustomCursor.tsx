'use client';

import React, { useEffect, useRef, useState } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  tx: number;
  ty: number;
}

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    let mouseX = -100;
    let mouseY = -100;
    let isVisible = false;

    // Use direct DOM styling updates on mousemove to avoid React reconciliation lag
    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      
      if (!isVisible) {
        dot.style.opacity = '1';
        ring.style.opacity = '1';
        isVisible = true;
      }

      // Translate 3D is hardware accelerated and achieves instant responsive alignment
      dot.style.transform = `translate3d(${mouseX - 4}px, ${mouseY - 4}px, 0)`;
      ring.style.transform = `translate3d(${mouseX - 16}px, ${mouseY - 16}px, 0)`;
    };

    const onMouseLeave = () => {
      dot.style.opacity = '0';
      ring.style.opacity = '0';
      isVisible = false;
    };

    const onMouseDown = (e: MouseEvent) => {
      setIsClicked(true);
      
      // Spawn golden particle bursts moving outwards in circular coordinates
      const newParticles = Array.from({ length: 8 }).map((_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        const distance = 30 + Math.random() * 40;
        return {
          id: Date.now() + i + Math.random(),
          x: e.clientX,
          y: e.clientY,
          tx: Math.cos(angle) * distance,
          ty: Math.sin(angle) * distance
        };
      });
      
      setParticles((prev) => [...prev.slice(-16), ...newParticles]);
    };

    const onMouseUp = () => {
      setIsClicked(false);
    };

    const addHoverListeners = () => {
      const targets = document.querySelectorAll('button, a, input, select, textarea, [role="button"], .interactive-hover, label, select option');
      targets.forEach((target) => {
        target.addEventListener('mouseenter', () => setIsHovered(true));
        target.addEventListener('mouseleave', () => setIsHovered(false));
      });
    };

    window.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseleave', onMouseLeave);
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);

    // Watch for dynamically loaded client components
    const observer = new MutationObserver(addHoverListeners);
    observer.observe(document.body, { childList: true, subtree: true });
    addHoverListeners();

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseleave', onMouseLeave);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      observer.disconnect();
    };
  }, []);

  // Cleanup expired particles to keep memory clean
  useEffect(() => {
    if (particles.length > 0) {
      const timer = setTimeout(() => {
        setParticles((prev) => prev.slice(8));
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [particles]);

  if (typeof window !== 'undefined' && window.innerWidth <= 1024) return null;

  return (
    <>
      {/* Outer Ring */}
      <div
        ref={ringRef}
        className="fixed top-0 left-0 w-8 h-8 rounded-full border border-royal-gold pointer-events-none z-[9999] opacity-0 transition-opacity duration-300 pointer-events-none"
        style={{
          // Use cubic bezier transitions for organic yet instant tracking
          transition: 'transform 0.08s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.3s ease',
          transform: 'translate3d(-100px, -100px, 0)',
          scale: isHovered ? '1.5' : isClicked ? '0.7' : '1',
          backgroundColor: isHovered ? 'rgba(212, 175, 55, 0.12)' : 'transparent',
          boxShadow: isHovered ? '0 0 15px rgba(212, 175, 55, 0.4)' : 'none',
        }}
      />
      
      {/* Inner Dot */}
      <div
        ref={dotRef}
        className="fixed top-0 left-0 w-2 h-2 rounded-full bg-champagne-gold pointer-events-none z-[9999] opacity-0 transition-opacity duration-300 pointer-events-none"
        style={{
          transition: 'transform 0.005s linear, opacity 0.3s ease',
          transform: 'translate3d(-100px, -100px, 0)',
          scale: isHovered ? '0.5' : '1',
          boxShadow: '0 0 8px rgba(245, 230, 200, 0.8)',
        }}
      />

      {/* Click Particles (CSS-animated for hardware acceleration) */}
      {particles.map((p) => (
        <div
          key={p.id}
          className="fixed w-1 h-1 rounded-full bg-royal-gold pointer-events-none z-[9999] animate-particle"
          style={{
            left: p.x,
            top: p.y,
            // @ts-ignore
            '--x': `${p.tx}px`,
            // @ts-ignore
            '--y': `${p.ty}px`,
            boxShadow: '0 0 4px rgba(212, 175, 55, 0.8)',
          }}
        />
      ))}
    </>
  );
}
