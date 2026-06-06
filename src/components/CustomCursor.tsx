'use client';

import { useEffect, useState } from 'react';
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
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [trail, setTrail] = useState<{ x: number; y: number; id: number }[]>([]);
  const [isHovered, setIsHovered] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    let idCounter = 0;
    let particleId = 0;

    const updatePosition = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });

      setTrail((prev) => {
        const newTrail = [...prev, { x: e.clientX, y: e.clientY, id: idCounter++ }];
        if (newTrail.length > 8) newTrail.shift();
        return newTrail;
      });

      clearTimeout(timeout);
      timeout = setTimeout(() => {
        setTrail([]);
      }, 150);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'A' ||
        target.tagName === 'BUTTON' ||
        target.tagName === 'INPUT' ||
        target.tagName === 'SELECT' ||
        target.tagName === 'TEXTAREA' ||
        target.closest('a') ||
        target.closest('button') ||
        target.closest('.cursor-pointer')
      ) {
        setIsHovered(true);
      } else {
        setIsHovered(false);
      }
    };

    const handleMouseOut = () => {
      setIsHovered(false);
    };

    // Click particle burst
    const handleClick = (e: MouseEvent) => {
      const burstCount = 10;
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
      
      setParticles((prev) => [...prev, ...newParticles]);
    };

    window.addEventListener('mousemove', updatePosition);
    window.addEventListener('mouseover', handleMouseOver);
    window.addEventListener('mouseout', handleMouseOut);
    window.addEventListener('click', handleClick);

    return () => {
      window.removeEventListener('mousemove', updatePosition);
      window.removeEventListener('mouseover', handleMouseOver);
      window.removeEventListener('mouseout', handleMouseOut);
      window.removeEventListener('click', handleClick);
      clearTimeout(timeout);
    };
  }, []);

  // Update particles positions
  useEffect(() => {
    if (particles.length === 0) return;

    const frame = requestAnimationFrame(() => {
      setParticles((prev) =>
        prev
          .map((p) => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            vx: p.vx * 0.96, // friction
            vy: p.vy * 0.96
          }))
          .filter((p) => Math.abs(p.vx) > 0.1 || Math.abs(p.vy) > 0.1)
      );
    });

    return () => cancelAnimationFrame(frame);
  }, [particles]);

  if (typeof window !== 'undefined' && window.innerWidth <= 1024) return null;

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
            transition={{ duration: 0.8, ease: 'easeOut' }}
            style={{
              position: 'fixed',
              top: p.y,
              left: p.x,
              width: '4px',
              height: '4px',
              backgroundColor: p.color,
              borderRadius: '50%',
              pointerEvents: 'none',
              zIndex: 99999,
              boxShadow: `0 0 6px ${p.color}`
            }}
          />
        ))}
      </AnimatePresence>

      {/* Outer Halo Glow */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          transform: `translate(${position.x - 30}px, ${position.y - 30}px) scale(${isHovered ? 1.5 : 1})`,
          width: '60px',
          height: '60px',
          border: '1px solid rgba(212, 175, 55, 0.3)',
          backgroundColor: isHovered ? 'rgba(212, 175, 55, 0.05)' : 'transparent',
          borderRadius: '50%',
          pointerEvents: 'none',
          zIndex: 99999,
          transition: 'transform 0.15s ease-out, background-color 0.3s ease, border-color 0.3s ease',
          boxShadow: isHovered ? '0 0 15px rgba(212, 175, 55, 0.2)' : 'none'
        }}
      />

      {/* Main Cursor Core */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          transform: `translate(${position.x - 4}px, ${position.y - 4}px) scale(${isHovered ? 0.6 : 1})`,
          width: '8px',
          height: '8px',
          backgroundColor: '#d4af37',
          borderRadius: '50%',
          pointerEvents: 'none',
          zIndex: 100000,
          transition: 'transform 0.1s ease-out',
          boxShadow: '0 0 8px #d4af37'
        }}
      />

      {/* Laser trail lines */}
      {trail.map((point, index) => (
        <div
          key={point.id}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            transform: `translate(${point.x - 2}px, ${point.y - 2}px)`,
            width: '4px',
            height: '4px',
            backgroundColor: '#d4af37',
            borderRadius: '50%',
            pointerEvents: 'none',
            zIndex: 99998,
            opacity: (index / trail.length) * 0.4,
            boxShadow: '0 0 4px #d4af37'
          }}
        />
      ))}
    </>
  );
}
