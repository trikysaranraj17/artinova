'use client';

import React, { useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';

function GiftBox({ 
  position, 
  color, 
  ribbonColor = '#f5e6c8', 
  size = 1, 
  speed = 1 
}: { 
  position: [number, number, number]; 
  color: string; 
  ribbonColor?: string;
  size?: number; 
  speed?: number 
}) {
  const mesh = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (mesh.current) {
      const time = state.clock.getElapsedTime();
      mesh.current.rotation.x = Math.sin(time * 0.15) * 0.3 * speed;
      mesh.current.rotation.y = (time * 0.1) * speed;
      mesh.current.rotation.z = Math.cos(time * 0.1) * 0.2 * speed;
    }
  });

  return (
    <Float floatIntensity={1.2} floatingRange={[-0.4, 0.4]} speed={speed * 1.5}>
      <group ref={mesh} position={position}>
        {/* Main Box */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[size, size, size]} />
          <meshStandardMaterial 
            color={color} 
            metalness={0.85} 
            roughness={0.12} 
            bumpScale={0.05}
          />
        </mesh>

        {/* Ribbon Horizontal */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[size * 1.02, size * 0.12, size * 1.02]} />
          <meshStandardMaterial 
            color={ribbonColor} 
            metalness={0.9} 
            roughness={0.1} 
          />
        </mesh>

        {/* Ribbon Vertical */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[size * 0.12, size * 1.02, size * 1.02]} />
          <meshStandardMaterial 
            color={ribbonColor} 
            metalness={0.9} 
            roughness={0.1} 
          />
        </mesh>
      </group>
    </Float>
  );
}

function MouseLight() {
  const { pointer } = useThree();
  const lightRef = useRef<THREE.PointLight>(null);

  useFrame(() => {
    if (lightRef.current) {
      // Map mouse -1 -> 1 coords to 3D coordinate space coordinates
      lightRef.current.position.x = pointer.x * 8;
      lightRef.current.position.y = pointer.y * 8;
    }
  });

  return (
    <pointLight 
      ref={lightRef} 
      distance={25} 
      intensity={8} 
      color="#f5e6c8" 
      position={[0, 0, 4]} 
      castShadow
    />
  );
}

function GoldDust({ count = 250 }) {
  const points = useRef<THREE.Points>(null);
  
  const [positions] = useState(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 15;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 15;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 15;
    }
    return arr;
  });

  useFrame(() => {
    if (points.current) {
      points.current.rotation.y += 0.0006;
      points.current.rotation.x += 0.0003;
    }
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#d4af37"
        size={0.06}
        transparent
        opacity={0.7}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

export default function Hero3DCanvas() {
  return (
    <div className="absolute inset-0 w-full h-full -z-10 bg-gradient-to-b from-[#060607] to-[#0d0a09]">
      <Canvas
        camera={{ position: [0, 0, 7.5], fov: 50 }}
        shadows
        gl={{ antialias: true, alpha: true }}
      >
        {/* Soft general scene lighting */}
        <ambientLight intensity={0.4} />
        
        {/* Cinematic bronze key light */}
        <directionalLight 
          position={[5, 5, 2]} 
          intensity={2.5} 
          color="#3d2a1c" 
          castShadow 
        />
        
        {/* Interactive Mouse pointer light */}
        <MouseLight />

        {/* Floating Luxury Gift boxes */}
        {/* Primary Gold Box */}
        <GiftBox position={[0, 0.4, 0]} color="#d4af37" ribbonColor="#3d2a1c" size={1.8} speed={0.9} />
        
        {/* Left Burgundy Box */}
        <GiftBox position={[-2.8, -1.2, -1.5]} color="#2d0b13" ribbonColor="#d4af37" size={1.2} speed={0.7} />
        
        {/* Right Bronze Box */}
        <GiftBox position={[2.8, 1.4, -2]} color="#3d2a1c" ribbonColor="#f5e6c8" size={1.3} speed={0.8} />

        {/* Floating metallic dust particles */}
        <GoldDust count={300} />
      </Canvas>
    </div>
  );
}
