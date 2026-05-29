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
  const blurRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const dot = dotRef.current;
    const ring = ringRef.current;
    const blur = blurRef.current;
    if (!dot || !ring || !blur) return;

    let mouseX = -100;
    let mouseY = -100;
    let isVisible = false;

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      
      if (!isVisible) {
        dot.style.opacity = '1';
        ring.style.opacity = '1';
        blur.style.opacity = '1';
        isVisible = true;
      }

      // Translate3d achieves hardware-accelerated rendering
      dot.style.transform = `translate3d(${mouseX - 4}px, ${mouseY - 4}px, 0)`;
      ring.style.transform = `translate3d(${mouseX - 16}px, ${mouseY - 16}px, 0)`;
      blur.style.transform = `translate3d(${mouseX - 400}px, ${mouseY - 400}px, 0)`;
    };

    const onMouseLeave = () => {
      dot.style.opacity = '0';
      ring.style.opacity = '0';
      blur.style.opacity = '0';
      isVisible = false;
    };

    const onMouseDown = (e: MouseEvent) => {
      setIsClicked(true);
      
      // Spawn royal gold particle bursts moving outwards in circular coordinates
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

    // Watch for dynamically loaded client elements (like popups or lazy loaded items)
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
      {/* 1. Large Ambient Background Follower (Deep Purple Radial Blur with lag transition) */}
      <div
        ref={blurRef}
        className="fixed top-0 left-0 w-[800px] h-[800px] rounded-full pointer-events-none z-[-9999] opacity-0"
        style={{
          background: 'radial-gradient(circle, rgba(109, 40, 217, 0.08), transparent 60%)',
          transition: 'transform 0.8s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.5s ease',
          transform: 'translate3d(-400px, -400px, 0)',
        }}
      />

      {/* 2. Outer Ring */}
      <div
        ref={ringRef}
        className="fixed top-0 left-0 w-8 h-8 rounded-full border border-[var(--color-royal-violet)] pointer-events-none z-[9999] opacity-0"
        style={{
          transition: 'transform 0.08s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.3s ease',
          transform: 'translate3d(-100px, -100px, 0)',
          scale: isHovered ? '1.5' : isClicked ? '0.7' : '1',
          backgroundColor: isHovered ? 'rgba(109, 40, 217, 0.08)' : 'transparent',
          boxShadow: isHovered ? '0 0 15px rgba(109, 40, 217, 0.3)' : 'none',
        }}
      />
      
      {/* 3. Inner Dot */}
      <div
        ref={dotRef}
        className="fixed top-0 left-0 w-2.5 h-2.5 rounded-full bg-[var(--color-royal-violet)] pointer-events-none z-[9999] opacity-0"
        style={{
          transition: 'transform 0.005s linear, opacity 0.3s ease',
          transform: 'translate3d(-100px, -100px, 0)',
          scale: isHovered ? '0.5' : '1',
          boxShadow: '0 0 10px var(--color-purple)',
        }}
      />

      {/* 4. Click Particles (CSS-animated for hardware acceleration) */}
      {particles.map((p) => (
        <div
          key={p.id}
          className="fixed w-1 h-1 rounded-full bg-[var(--color-royal-gold)] pointer-events-none z-[9999] animate-particle"
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
