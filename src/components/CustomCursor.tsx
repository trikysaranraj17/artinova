'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
}

export default function CustomCursor() {
  const haloRef = useRef<HTMLDivElement>(null);
  const coreRef = useRef<HTMLDivElement>(null);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [isMobileDevice, setIsMobileDevice] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isMobile = window.innerWidth <= 1024 || window.matchMedia('(hover: none)').matches;
      setIsMobileDevice(isMobile);
      if (isMobile) return;
    }

    let particleId = 0;
    let lastX = 0;
    let lastY = 0;

    const updateStyles = (x: number, y: number) => {
      if (coreRef.current) {
        const isHover = coreRef.current.classList.contains('hovered');
        coreRef.current.style.transform = `translate3d(${x - 4}px, ${y - 4}px, 0) scale(${isHover ? 0.6 : 1})`;
      }
      if (haloRef.current) {
        const isHover = haloRef.current.classList.contains('hovered');
        haloRef.current.style.transform = `translate3d(${x - 30}px, ${y - 30}px, 0) scale(${isHover ? 1.5 : 1})`;
      }
    };

    const updatePosition = (e: MouseEvent) => {
      lastX = e.clientX;
      lastY = e.clientY;
      requestAnimationFrame(() => updateStyles(lastX, lastY));
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target) return;

      const isInteractive = 
        target.tagName === 'A' ||
        target.tagName === 'BUTTON' ||
        target.tagName === 'INPUT' ||
        target.tagName === 'SELECT' ||
        target.tagName === 'TEXTAREA' ||
        target.closest('a') ||
        target.closest('button') ||
        target.closest('.cursor-pointer');

      if (isInteractive) {
        haloRef.current?.classList.add('hovered');
        coreRef.current?.classList.add('hovered');
      } else {
        haloRef.current?.classList.remove('hovered');
        coreRef.current?.classList.remove('hovered');
      }
      updateStyles(lastX, lastY);
    };

    const handleMouseOut = () => {
      haloRef.current?.classList.remove('hovered');
      coreRef.current?.classList.remove('hovered');
      updateStyles(lastX, lastY);
    };

    // Click particle burst
    const handleClick = (e: MouseEvent) => {
      const burstCount = 6;
      const newParticles: Particle[] = [];
      
      for (let i = 0; i < burstCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 3 + 1;
        newParticles.push({
          id: particleId++,
          x: e.clientX,
          y: e.clientY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          color: Math.random() > 0.5 ? '#d4af37' : '#f5e6c8'
        });
      }
      
      setParticles((prev) => [...prev, ...newParticles].slice(-15));
    };

    window.addEventListener('mousemove', updatePosition, { passive: true });
    window.addEventListener('mouseover', handleMouseOver, { passive: true });
    window.addEventListener('mouseout', handleMouseOut, { passive: true });
    window.addEventListener('click', handleClick, { passive: true });

    return () => {
      window.removeEventListener('mousemove', updatePosition);
      window.removeEventListener('mouseover', handleMouseOver);
      window.removeEventListener('mouseout', handleMouseOut);
      window.removeEventListener('click', handleClick);
    };
  }, []);

  // Update particles positions
  useEffect(() => {
    if (particles.length === 0 || isMobileDevice) return;

    const frame = requestAnimationFrame(() => {
      setParticles((prev) =>
        prev
          .map((p) => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            vx: p.vx * 0.94,
            vy: p.vy * 0.94
          }))
          .filter((p) => Math.abs(p.vx) > 0.15 || Math.abs(p.vy) > 0.15)
      );
    });

    return () => cancelAnimationFrame(frame);
  }, [particles, isMobileDevice]);

  if (isMobileDevice) return null;

  return (
    <>
      {/* Click Particles */}
      <AnimatePresence>
        {particles.map((p) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0.8, scale: 1 }}
            animate={{ opacity: 0, scale: 0.2 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            style={{
              position: 'fixed',
              top: p.y,
              left: p.x,
              width: '3px',
              height: '3px',
              backgroundColor: p.color,
              borderRadius: '50%',
              pointerEvents: 'none',
              zIndex: 99999,
              boxShadow: `0 0 4px ${p.color}`
            }}
          />
        ))}
      </AnimatePresence>

      {/* Outer Halo Glow */}
      <div
        ref={haloRef}
        className="custom-cursor-halo"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '60px',
          height: '60px',
          border: '1px solid rgba(212, 175, 55, 0.3)',
          borderRadius: '50%',
          pointerEvents: 'none',
          zIndex: 99999,
          willChange: 'transform',
          transition: 'transform 0.08s cubic-bezier(0.25, 1, 0.5, 1), background-color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease'
        }}
      />

      {/* Main Cursor Core */}
      <div
        ref={coreRef}
        className="custom-cursor-core"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '8px',
          height: '8px',
          backgroundColor: '#d4af37',
          borderRadius: '50%',
          pointerEvents: 'none',
          zIndex: 100000,
          willChange: 'transform',
          boxShadow: '0 0 8px #d4af37',
          transition: 'transform 0.02s linear'
        }}
      />

      <style jsx global>{`
        .custom-cursor-halo.hovered {
          background-color: rgba(212, 175, 55, 0.05) !important;
          border-color: rgba(212, 175, 55, 0.6) !important;
          box-shadow: 0 0 15px rgba(212, 175, 55, 0.2) !important;
        }
        @media (max-width: 1024px) {
          .custom-cursor-halo,
          .custom-cursor-core {
            display: none !important;
          }
        }
        @media (hover: none) and (pointer: coarse) {
          .custom-cursor-halo,
          .custom-cursor-core {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
}
