import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, Environment, Stars } from '@react-three/drei';
import * as THREE from 'three';

// Crisis Data Points Component
function CrisisMarkers({ mousePosition }: { mousePosition: { x: number; y: number } }) {
  const groupRef = useRef<THREE.Group>(null);

  const crisisPoints = useMemo(() => [
    { lat: 40.7128, lon: -74.0060, severity: 'high', name: 'Crisis Point 1' },
    { lat: 51.5074, lon: -0.1278, severity: 'medium', name: 'Crisis Point 2' },
    { lat: 35.6762, lon: 139.6503, severity: 'high', name: 'Crisis Point 3' },
    { lat: -33.8688, lon: 151.2093, severity: 'low', name: 'Crisis Point 4' },
    { lat: 19.4326, lon: -99.1332, severity: 'medium', name: 'Crisis Point 5' },
  ], []);

  const latLonToVector3 = (lat: number, lon: number, radius: number) => {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);
    
    const x = -(radius * Math.sin(phi) * Math.cos(theta));
    const z = radius * Math.sin(phi) * Math.sin(theta);
    const y = radius * Math.cos(phi);
    
    return new THREE.Vector3(x, y, z);
  };

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.001;
    }
  });

  return (
    <group ref={groupRef}>
      {crisisPoints.map((point, i) => {
        const position = latLonToVector3(point.lat, point.lon, 2.05);
        const color = point.severity === 'high' ? '#ff4444' : point.severity === 'medium' ? '#ffaa00' : '#44aaff';
        
        return (
          <group key={i} position={position}>
            {/* Marker Cylinder */}
            <mesh>
              <cylinderGeometry args={[0.02, 0.02, 0.15, 8]} />
              <meshStandardMaterial
                color={color}
                emissive={color}
                emissiveIntensity={2}
                transparent
                opacity={0.8}
              />
            </mesh>
            
            {/* Pulsing Glow */}
            <mesh>
              <sphereGeometry args={[0.05, 16, 16]} />
              <meshBasicMaterial
                color={color}
                transparent
                opacity={0.6}
              />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

// Holographic Scan Rings
function ScanRings() {
  const ringsRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (ringsRef.current) {
      const time = state.clock.getElapsedTime();
      ringsRef.current.children.forEach((ring, i) => {
        const offset = i * (Math.PI / 3);
        ring.scale.setScalar(1 + Math.sin(time * 0.5 + offset) * 0.05);
        const mesh = ring as THREE.Mesh;
        const material = mesh.material as THREE.MeshBasicMaterial;
        if (material) {
          material.opacity = 0.3 + Math.sin(time * 0.5 + offset) * 0.2;
        }
      });
    }
  });

  return (
    <group ref={ringsRef}>
      {[0, 1, 2].map((i) => (
        <mesh key={i} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[2.2 + i * 0.1, 0.01, 16, 100]} />
          <meshBasicMaterial
            color="#00ffff"
            transparent
            opacity={0.3}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
}

// Earth Globe Component
function EarthGlobe({ mousePosition }: { mousePosition: { x: number; y: number } }) {
  const earthRef = useRef<THREE.Mesh>(null);
  const atmosphereRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (earthRef.current) {
      earthRef.current.rotation.y += 0.001;
      earthRef.current.rotation.x = mousePosition.y * 0.1;
      earthRef.current.rotation.z = mousePosition.x * 0.05;
    }
    
    if (atmosphereRef.current) {
      atmosphereRef.current.rotation.y += 0.0005;
    }
  });

  // Create Earth texture (simple gradient for now, can be replaced with actual texture)
  const earthTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d')!;
    
    // Create ocean blue base
    ctx.fillStyle = '#0a1929';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add some land masses (simplified)
    ctx.fillStyle = '#1a3a2a';
    for (let i = 0; i < 100; i++) {
      ctx.beginPath();
      ctx.arc(
        Math.random() * canvas.width,
        Math.random() * canvas.height,
        Math.random() * 100 + 50,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }
    
    return new THREE.CanvasTexture(canvas);
  }, []);

  return (
    <>
      {/* Main Earth */}
      <mesh ref={earthRef}>
        <sphereGeometry args={[2, 64, 64]} />
        <meshStandardMaterial
          map={earthTexture}
          roughness={0.8}
          metalness={0.2}
        />
      </mesh>

      {/* Atmosphere Glow */}
      <mesh ref={atmosphereRef} scale={1.05}>
        <sphereGeometry args={[2, 64, 64]} />
        <meshBasicMaterial
          color="#4488ff"
          transparent
          opacity={0.15}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Outer Atmosphere */}
      <mesh scale={1.1}>
        <sphereGeometry args={[2, 32, 32]} />
        <meshBasicMaterial
          color="#2266ff"
          transparent
          opacity={0.05}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Crisis Markers */}
      <CrisisMarkers mousePosition={mousePosition} />

      {/* Scan Rings */}
      <ScanRings />
    </>
  );
}

// Main Scene Component
export function Earth3DScene({ mousePosition }: { mousePosition: { x: number; y: number } }) {
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Canvas
        camera={{ position: [0, 0, 8], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        {/* Lighting */}
        <ambientLight intensity={0.3} />
        <directionalLight position={[5, 3, 5]} intensity={1.5} />
        <pointLight position={[-5, -3, -5]} intensity={0.5} color="#4488ff" />

        {/* Stars Background */}
        <Stars
          radius={100}
          depth={50}
          count={5000}
          factor={4}
          saturation={0}
          fade
          speed={0.5}
        />

        {/* Earth */}
        <EarthGlobe mousePosition={mousePosition} />

        {/* Environment */}
        <Environment preset="night" />
      </Canvas>
    </div>
  );
}
