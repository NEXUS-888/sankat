import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export const GlobeAnimation = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    if (!mountRef.current) return;

    // --- 1. Scene Setup ---
    const scene = new THREE.Scene();
    scene.background = null; // Transparent for our custom background

    // Camera
    const camera = new THREE.PerspectiveCamera(
      45,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 18);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = true;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5;

    // --- 2. Texture Loading (Real Earth Map) ---
    const textureLoader = new THREE.TextureLoader();
    
    const earthMap = textureLoader.load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_atmos_2048.jpg');
    const earthSpecular = textureLoader.load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_specular_2048.jpg');
    const earthNormal = textureLoader.load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_normal_2048.jpg');

    // --- 3. The Earth Sphere ---
    const earthGeometry = new THREE.SphereGeometry(5, 64, 64);
    const earthMaterial = new THREE.MeshPhongMaterial({
      map: earthMap,
      specularMap: earthSpecular,
      normalMap: earthNormal,
      specular: new THREE.Color(0x333333),
      shininess: 15,
    });
    const earth = new THREE.Mesh(earthGeometry, earthMaterial);
    scene.add(earth);

    // Atmosphere Glow (Sprite)
    const spriteMaterial = new THREE.SpriteMaterial({
      map: new THREE.CanvasTexture(
        (() => {
          const canvas = document.createElement('canvas');
          canvas.width = 128;
          canvas.height = 128;
          const context = canvas.getContext('2d')!;
          const gradient = context.createRadialGradient(64, 64, 0, 64, 64, 64);
          gradient.addColorStop(0, 'rgba(60, 100, 255, 0.4)');
          gradient.addColorStop(0.2, 'rgba(60, 100, 255, 0.1)');
          gradient.addColorStop(0.5, 'rgba(0, 0, 0, 0)');
          context.fillStyle = gradient;
          context.fillRect(0, 0, 128, 128);
          return canvas;
        })()
      ),
      blending: THREE.AdditiveBlending,
      color: 0x4488ff,
    });
    const glow = new THREE.Sprite(spriteMaterial);
    glow.scale.set(15.5, 15.5, 1);
    scene.add(glow);

    // --- 4. The Satellite/Debris Cloud (Crisis Markers as Green Dots) ---
    const particlesGeometry = new THREE.BufferGeometry();
    const particleCount = 3000;

    const posArray = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
      const phi = Math.acos(-1 + (2 * i) / particleCount);
      const theta = Math.sqrt(particleCount * Math.PI) * phi;
      
      const r = 5.6 + Math.random() * 4.0;

      const x = r * Math.cos(theta) * Math.sin(phi);
      const y = r * Math.sin(theta) * Math.sin(phi);
      const z = r * Math.cos(phi);

      posArray[i * 3] = x;
      posArray[i * 3 + 1] = y;
      posArray[i * 3 + 2] = z;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.08,
      color: 0x66ff66,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });

    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    // --- 5. Lighting ---
    const ambientLight = new THREE.AmbientLight(0x111111);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 2);
    sunLight.position.set(50, 20, 30);
    scene.add(sunLight);
    
    const rimLight = new THREE.SpotLight(0x2244ff, 3);
    rimLight.position.set(-20, 10, -20);
    rimLight.lookAt(earth.position);
    scene.add(rimLight);

    // --- 6. Animation Loop ---
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      
      earth.rotation.y += 0.0005;
      
      particlesMesh.rotation.y += 0.0008;
      particlesMesh.rotation.x += 0.0001;

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    // --- 7. Handle Resize ---
    const handleResize = () => {
      if (!mountRef.current) return;
      const width = mountRef.current.clientWidth;
      const height = mountRef.current.clientHeight;
      
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (mountRef.current && renderer.domElement && mountRef.current.contains(renderer.domElement)) {
        mountRef.current.removeChild(renderer.domElement);
      }
      earthGeometry.dispose();
      earthMaterial.dispose();
      particlesGeometry.dispose();
      particlesMaterial.dispose();
      renderer.dispose();
      controls.dispose();
    };
  }, []);

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      {/* Dark gradient background with noise texture */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a0f1e] via-[#0f172a] to-[#1e1b4b]">
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' /%3E%3C/svg%3E")`,
            backgroundSize: '200px 200px'
          }}
        />
      </div>
      
      {/* 3D Globe Container - positioned to not overlap with stat bubbles */}
      <div 
        ref={mountRef} 
        className="relative z-10 w-full h-full pb-40 cursor-move"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        role="img"
        aria-label="3D Interactive Earth Globe showing global crisis locations"
      />
      
      {/* Clean stat bubbles with soft float animation */}
      <div className="absolute bottom-8 right-8 w-80 flex flex-col gap-3 z-20">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ 
            opacity: 1, 
            y: [0, -5, 0],
          }}
          transition={{ 
            opacity: { delay: 0.5, duration: 0.8 },
            y: { delay: 1, duration: 3, repeat: Infinity, ease: "easeInOut" }
          }}
          className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-gradient-to-r from-red-500/10 to-orange-500/10 backdrop-blur-xl border border-red-500/20 shadow-lg"
        >
          <div className="w-2 h-2 rounded-full bg-red-400 shadow-lg shadow-red-500/50 animate-pulse" />
          <span className="text-sm text-gray-200 font-medium">🔴 Live Crises Updating in Real-Time</span>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ 
            opacity: 1, 
            y: [0, -5, 0],
          }}
          transition={{ 
            opacity: { delay: 0.7, duration: 0.8 },
            y: { delay: 1.2, duration: 3.2, repeat: Infinity, ease: "easeInOut" }
          }}
          className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-gradient-to-r from-cyan-500/10 to-blue-500/10 backdrop-blur-xl border border-cyan-500/20 shadow-lg"
        >
          <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-lg shadow-cyan-500/50 animate-pulse" />
          <span className="text-sm text-gray-200 font-medium">🌍 Global Coverage & Severity Mapping</span>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ 
            opacity: 1, 
            y: [0, -5, 0],
          }}
          transition={{ 
            opacity: { delay: 0.9, duration: 0.8 },
            y: { delay: 1.4, duration: 3.4, repeat: Infinity, ease: "easeInOut" }
          }}
          className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-xl border border-blue-500/20 shadow-lg"
        >
          <div className="w-2 h-2 rounded-full bg-blue-400 shadow-lg shadow-blue-500/50 animate-pulse" />
          <span className="text-sm text-gray-200 font-medium">🟦 Verified Humanitarian Data</span>
        </motion.div>
      </div>
    </div>
  );
};
