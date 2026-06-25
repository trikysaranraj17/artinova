'use client';

import { useEffect, useRef, useState } from 'react';

export default function CustomCursor() {
  const haloRef = useRef<HTMLDivElement>(null);
  const coreRef = useRef<HTMLDivElement>(null);
  const [isMobileDevice, setIsMobileDevice] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isMobile = window.innerWidth <= 1024 || window.matchMedia('(hover: none)').matches;
      setIsMobileDevice(isMobile);
      if (isMobile) return;
    }

    let mouseX = -100;
    let mouseY = -100;
    let haloX = -100;
    let haloY = -100;
    let isHovered = false;
    let frameId: number;

    const updatePosition = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
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
        isHovered = true;
        haloRef.current?.classList.add('hovered');
        coreRef.current?.classList.add('hovered');
      } else {
        isHovered = false;
        haloRef.current?.classList.remove('hovered');
        coreRef.current?.classList.remove('hovered');
      }
    };

    const handleMouseOut = () => {
      isHovered = false;
      haloRef.current?.classList.remove('hovered');
      coreRef.current?.classList.remove('hovered');
    };

    // Click particle burst
    const handleClick = (e: MouseEvent) => {
      const burstCount = 6;
      const container = document.getElementById('cursor-particle-container');
      if (!container) return;

      for (let i = 0; i < burstCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 80 + 40; // distance in pixels
        const tx = Math.cos(angle) * speed;
        const ty = Math.sin(angle) * speed;
        const color = Math.random() > 0.5 ? '#d4af37' : '#f5e6c8';

        const particle = document.createElement('div');
        particle.className = 'click-particle';
        particle.style.setProperty('--tx', `${tx}px`);
        particle.style.setProperty('--ty', `${ty}px`);
        particle.style.left = `${e.clientX}px`;
        particle.style.top = `${e.clientY}px`;
        particle.style.backgroundColor = color;
        particle.style.boxShadow = `0 0 4px ${color}`;

        container.appendChild(particle);
        particle.addEventListener('animationend', () => {
          particle.remove();
        });
      }
    };

    // Performance-optimized animation loop
    const tick = () => {
      // Direct positioning for core cursor
      if (coreRef.current) {
        coreRef.current.style.transform = `translate3d(${mouseX - 4}px, ${mouseY - 4}px, 0) ${isHovered ? 'scale(0.6)' : 'scale(1)'}`;
      }

      // Smooth lag interpolation for outer halo
      const ease = 0.15; // interpolation factor
      haloX += (mouseX - haloX) * ease;
      haloY += (mouseY - haloY) * ease;

      if (haloRef.current) {
        haloRef.current.style.transform = `translate3d(${haloX - 30}px, ${haloY - 30}px, 0) ${isHovered ? 'scale(1.5)' : 'scale(1)'}`;
      }

      frameId = requestAnimationFrame(tick);
    };

    window.addEventListener('mousemove', updatePosition, { passive: true });
    window.addEventListener('mouseover', handleMouseOver, { passive: true });
    window.addEventListener('mouseout', handleMouseOut, { passive: true });
    window.addEventListener('click', handleClick, { passive: true });

    // Start animation loop
    frameId = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('mousemove', updatePosition);
      window.removeEventListener('mouseover', handleMouseOver);
      window.removeEventListener('mouseout', handleMouseOut);
      window.removeEventListener('click', handleClick);
      cancelAnimationFrame(frameId);
    };
  }, []);

  if (isMobileDevice) return null;

  return (
    <>
      {/* Particle Container */}
      <div id="cursor-particle-container" className="fixed inset-0 pointer-events-none z-[99999]" />

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
          transition: 'background-color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease'
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
          boxShadow: '0 0 8px #d4af37'
        }}
      />

      <style jsx global>{`
        .custom-cursor-halo.hovered {
          background-color: rgba(212, 175, 55, 0.05) !important;
          border-color: rgba(212, 175, 55, 0.6) !important;
          box-shadow: 0 0 15px rgba(212, 175, 55, 0.2) !important;
        }
        .click-particle {
          position: fixed;
          width: 3px;
          height: 3px;
          border-radius: 50%;
          pointer-events: none;
          z-index: 99999;
          animation: particle-burst-animation 0.6s cubic-bezier(0.1, 0.8, 0.25, 1) forwards;
        }
        @keyframes particle-burst-animation {
          0% {
            transform: translate3d(-50%, -50%, 0) scale(1);
            opacity: 0.8;
          }
          100% {
            transform: translate3d(calc(-50% + var(--tx)), calc(-50% + var(--ty)), 0) scale(0.2);
            opacity: 0;
          }
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
