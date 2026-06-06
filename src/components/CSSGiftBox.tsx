'use client';

import React, { useState, useRef } from 'react';

export default function CSSGiftBox() {
  const [rotate, setRotate] = useState({ x: -20, y: 35 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    
    // Map mouse position to +/- 20 degrees tilt offset
    const tiltX = -20 - (y / rect.height) * 30;
    const tiltY = 35 + (x / rect.width) * 35;
    
    setRotate({ x: tiltX, y: tiltY });
  };

  const handleMouseLeave = () => {
    setRotate({ x: -20, y: 35 });
  };

  const boxSize = "w-32 h-32 md:w-40 md:h-40";
  const translateDist = "translate-z-[64px] md:translate-z-[80px]";
  const negTranslateDist = "-translate-z-[64px] md:-translate-z-[80px]";

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-64 h-64 flex items-center justify-center cursor-pointer select-none perspective-[800px]"
    >
      {/* Decorative Glow */}
      <div className="absolute w-40 h-40 bg-[#C9A84C]/10 rounded-full blur-[60px] pointer-events-none animate-pulse" />

      {/* 3D Box Wrapper */}
      <div 
        className="relative transform-style-preserve-3d transition-transform duration-500 ease-out"
        style={{
          transform: `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`,
          width: '160px',
          height: '160px'
        }}
      >
        {/* Front Face */}
        <div className={`absolute inset-0 bg-gradient-to-br from-[#1c080e] to-[#2d0b13] border border-[#C9A84C]/20 flex items-center justify-center ${boxSize} ${translateDist}`}>
          {/* Horizontal Ribbon */}
          <div className="absolute w-full h-4 bg-[#C9A84C] shadow-[0_0_8px_#C9A84C]" />
          {/* Vertical Ribbon */}
          <div className="absolute h-full w-4 bg-[#C9A84C] shadow-[0_0_8px_#C9A84C]" />
        </div>

        {/* Back Face */}
        <div className={`absolute inset-0 bg-gradient-to-br from-[#1c080e] to-[#2d0b13] border border-[#C9A84C]/20 flex items-center justify-center rotate-y-180 ${boxSize} ${negTranslateDist}`}>
          <div className="absolute w-full h-4 bg-[#C9A84C] shadow-[0_0_8px_#C9A84C]" />
          <div className="absolute h-full w-4 bg-[#C9A84C] shadow-[0_0_8px_#C9A84C]" />
        </div>

        {/* Left Face */}
        <div className={`absolute inset-0 bg-gradient-to-br from-[#1c080e] to-[#2d0b13] border border-[#C9A84C]/20 flex items-center justify-center -rotate-y-90 origin-left ${boxSize}`} style={{ transform: `rotateY(-90deg) translateZ(80px)` }}>
          <div className="absolute w-full h-4 bg-[#C9A84C] shadow-[0_0_8px_#C9A84C]" />
          <div className="absolute h-full w-4 bg-[#C9A84C] shadow-[0_0_8px_#C9A84C]" />
        </div>

        {/* Right Face */}
        <div className={`absolute inset-0 bg-gradient-to-br from-[#1c080e] to-[#2d0b13] border border-[#C9A84C]/20 flex items-center justify-center rotate-y-90 origin-right ${boxSize}`} style={{ transform: `rotateY(90deg) translateZ(80px)` }}>
          <div className="absolute w-full h-4 bg-[#C9A84C] shadow-[0_0_8px_#C9A84C]" />
          <div className="absolute h-full w-4 bg-[#C9A84C] shadow-[0_0_8px_#C9A84C]" />
        </div>

        {/* Top Face */}
        <div className={`absolute inset-0 bg-gradient-to-br from-[#240a11] to-[#3a0d18] border border-[#C9A84C]/25 flex items-center justify-center -rotate-x-90 origin-top ${boxSize}`} style={{ transform: `rotateX(90deg) translateZ(80px)` }}>
          <div className="absolute w-full h-4 bg-[#C9A84C] shadow-[0_0_8px_#C9A84C]" />
          <div className="absolute h-full w-4 bg-[#C9A84C] shadow-[0_0_8px_#C9A84C]" />
          {/* Bow ribbons */}
          <div className="absolute w-8 h-8 rounded-full border-2 border-[#C9A84C] -translate-x-3 -translate-y-3 rotate-45" />
          <div className="absolute w-8 h-8 rounded-full border-2 border-[#C9A84C] translate-x-3 -translate-y-3 -rotate-45" />
        </div>

        {/* Bottom Face */}
        <div className={`absolute inset-0 bg-gradient-to-br from-[#100306] to-[#1c080e] border border-[#C9A84C]/10 flex items-center justify-center rotate-x-90 origin-bottom ${boxSize}`} style={{ transform: `rotateX(-90deg) translateZ(80px)` }}>
          <div className="absolute w-full h-4 bg-[#C9A84C]" />
          <div className="absolute h-full w-4 bg-[#C9A84C]" />
        </div>
      </div>
    </div>
  );
}
