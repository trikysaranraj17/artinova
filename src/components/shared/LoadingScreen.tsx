'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function LoadingScreen() {
  const [visible, setVisible] = useState(false);
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; size: number; duration: number }>>([]);

  useEffect(() => {
    // Check sessionStorage
    if (typeof window !== 'undefined') {
      const visited = sessionStorage.getItem('artinova_visited');
      if (!visited) {
        setVisible(true);
        sessionStorage.setItem('artinova_visited', 'true');
        
        // Generate gold particles
        const tempParticles = Array.from({ length: 40 }).map((_, i) => ({
          id: i,
          x: Math.random() * 100, // percentage
          y: Math.random() * 100 + 100, // starting below
          size: Math.random() * 3 + 1,
          duration: Math.random() * 3 + 2
        }));
        setParticles(tempParticles);

        const timer = setTimeout(() => {
          setVisible(false);
        }, 2500); // 2.5s total time for elegant transitions
        return () => clearTimeout(timer);
      }
    }
  }, []);

  const logoText = "ARTINOVA";

  if (!visible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="fixed inset-0 z-[9999] bg-[#0A0A0A] flex flex-col items-center justify-center overflow-hidden select-none"
      >
        {/* Particle Canvas */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {particles.map((p) => (
            <motion.div
              key={p.id}
              initial={{ x: `${p.x}vw`, y: '110vh', opacity: 0 }}
              animate={{ 
                y: '-10vh', 
                opacity: [0, 0.7, 0.7, 0],
                x: [`${p.x}vw`, `${p.x + (Math.random() * 10 - 5)}vw`]
              }}
              transition={{ 
                duration: p.duration, 
                ease: "easeOut",
                repeat: Infinity,
                delay: Math.random() * 2
              }}
              className="absolute rounded-full"
              style={{
                width: p.size,
                height: p.size,
                background: 'radial-gradient(circle, #F5F0E8, #C9A84C)',
                boxShadow: '0 0 8px rgba(201, 168, 76, 0.6)'
              }}
            />
          ))}
        </div>

        {/* Cinematic Vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(circle,transparent_40%,#0A0A0A_100%)] pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center px-6">
          {/* Logo Staggered Letters */}
          <div className="flex overflow-hidden mb-4">
            {logoText.split("").map((char, index) => (
              <motion.span
                key={index}
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{
                  duration: 0.8,
                  ease: [0.16, 1, 0.3, 1],
                  delay: index * 0.08
                }}
                className="font-display text-4xl sm:text-6xl font-bold tracking-[0.25em] text-[#F5F0E8] select-none"
                style={{ textShadow: '0 0 15px rgba(201, 168, 76, 0.2)' }}
              >
                {char}
              </motion.span>
            ))}
          </div>

          {/* Thin Gold Underline Sweep */}
          <div className="w-48 sm:w-64 h-[1px] bg-rgba(201,168,76,0.1) relative overflow-hidden mb-4">
            <motion.div
              initial={{ left: '-100%' }}
              animate={{ left: '100%' }}
              transition={{
                duration: 1.2,
                ease: 'easeInOut',
                delay: 0.6
              }}
              className="absolute top-0 bottom-0 w-2/3 bg-gradient-to-r from-transparent via-[#C9A84C] to-transparent"
            />
          </div>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 1.2,
              ease: [0.16, 1, 0.3, 1],
              delay: 1.1
            }}
            className="font-display italic text-[#C9A84C] text-sm sm:text-lg tracking-wide text-center"
          >
            Crafting Emotions Into Luxury Gifts
          </motion.p>
        </div>

        {/* Loading Bar bottom of screen */}
        <div className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-[#111111]">
          <motion.div
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{
              duration: 2.2,
              ease: 'linear'
            }}
            className="h-full bg-gradient-to-r from-[#B8860B] via-[#C9A84C] to-[#F5F0E8]"
          />
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
