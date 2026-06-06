'use client';

import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function DriftingParticles({ count = 80 }) {
  const pointsRef = useRef<THREE.Points>(null);
  
  // Create positions and velocities for drifting upward
  const [particleData] = useState(() => {
    const pos = new Float32Array(count * 3);
    const vels = new Float32Array(count); // Y velocity
    for (let i = 0; i < count; i++) {
      // spread particles across screen [-6 to 6] horizontally, [-5 to 5] vertically, [-4 to 4] depth
      pos[i * 3] = (Math.random() - 0.5) * 12;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 10;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 8;
      vels[i] = Math.random() * 0.006 + 0.002; // slow upward drift speed
    }
    return { pos, vels };
  });

  useFrame(() => {
    if (pointsRef.current) {
      const geo = pointsRef.current.geometry;
      const positions = geo.attributes.position.array as Float32Array;
      
      for (let i = 0; i < count; i++) {
        // Drift upward
        positions[i * 3 + 1] += particleData.vels[i];
        
        // Add subtle horizontal wave drift
        positions[i * 3] += Math.sin(Date.now() * 0.001 + i) * 0.002;

        // Reset if it drifts off the top of the screen
        if (positions[i * 3 + 1] > 5) {
          positions[i * 3 + 1] = -5;
          positions[i * 3] = (Math.random() - 0.5) * 12;
        }
      }
      geo.attributes.position.needsUpdate = true;
      
      // Slow rotation of entire particle system
      pointsRef.current.rotation.y += 0.0003;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[particleData.pos, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#C9A84C"
        size={0.08}
        transparent
        opacity={0.4}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

export default function Hero3DCanvas() {
  return (
    <div className="absolute inset-0 w-full h-full -z-10 bg-gradient-to-b from-[#0A0A0A] to-[#111111]">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 60 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.5} />
        <DriftingParticles count={80} />
      </Canvas>
    </div>
  );
}
