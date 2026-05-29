'use client';

import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';

function RotatingBox({ category }: { category: string }) {
  const mesh = useRef<THREE.Group>(null);

  // Set colors dynamically based on category
  let boxColor = '#d4af37'; // gold default
  let ribbonColor = '#3d2a1c'; // bronze

  if (category === 'Royal Box') {
    boxColor = '#2d0b13'; // Burgundy
    ribbonColor = '#d4af37'; // Gold
  } else if (category === 'Crystal Craft') {
    boxColor = '#0b2647'; // Sapphire Blue
    ribbonColor = '#f5e6c8'; // Champagne
  } else if (category === 'Glass Art') {
    boxColor = '#d4af37';
    ribbonColor = '#faf7f2';
  } else if (category === 'Personalized') {
    boxColor = '#3d2a1c'; // Bronze
    ribbonColor = '#d4af37'; // Gold
  }

  useFrame((state) => {
    if (mesh.current) {
      const time = state.clock.getElapsedTime();
      mesh.current.rotation.y = time * 0.4;
      mesh.current.rotation.x = Math.sin(time * 0.2) * 0.2;
    }
  });

  return (
    <Float speed={1.5} floatIntensity={1} floatingRange={[-0.2, 0.2]}>
      <group ref={mesh}>
        {/* Main Box Body */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[2, 2, 2]} />
          <meshStandardMaterial 
            color={boxColor} 
            metalness={0.9} 
            roughness={0.15} 
          />
        </mesh>
        
        {/* Ribbon Horizontal */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[2.04, 0.25, 2.04]} />
          <meshStandardMaterial color={ribbonColor} metalness={0.8} roughness={0.2} />
        </mesh>

        {/* Ribbon Vertical */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.25, 2.04, 2.04]} />
          <meshStandardMaterial color={ribbonColor} metalness={0.8} roughness={0.2} />
        </mesh>
      </group>
    </Float>
  );
}

export default function Product3DPreview({ category }: { category: string }) {
  return (
    <div className="w-full h-full bg-[#121214]/65 border border-champagne-gold/10 rounded overflow-hidden flex items-center justify-center relative">
      <div className="absolute top-4 left-4 z-10">
        <span className="font-poppins text-[9px] uppercase tracking-wider text-royal-gold bg-matte-black/60 border border-royal-gold/20 px-2 py-0.5 rounded">
          3D Interactive Model
        </span>
      </div>
      <Canvas camera={{ position: [0, 0, 4.5], fov: 45 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[3, 3, 2]} intensity={1.8} color="#f5e6c8" />
        <pointLight position={[-3, -3, -2]} intensity={0.5} />
        <RotatingBox category={category} />
      </Canvas>
    </div>
  );
}
