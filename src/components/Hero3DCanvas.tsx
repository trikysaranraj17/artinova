'use client';

import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function DriftingParticles({ count = 80 }) {
  const pointsRef = useRef<THREE.Points>(null);
  
  // Create positions once and store them statically
  const [positions] = useState(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 12;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 10;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 8;
    }
    return pos;
  });

  useFrame((state) => {
    if (pointsRef.current) {
      // Animate the entire point cloud's rotation and position using the GPU
      const elapsedTime = state.clock.getElapsedTime();
      pointsRef.current.rotation.y = elapsedTime * 0.02;
      pointsRef.current.rotation.x = elapsedTime * 0.01;
      
      // Drift the entire cloud slowly upwards on the GPU, looping smoothly
      pointsRef.current.position.y = (elapsedTime * 0.08) % 10 - 5;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
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
