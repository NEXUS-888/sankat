import { useRef, useEffect, memo } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// ============================================================================
// TYPES
// ============================================================================

export interface CrisisMarkerData {
  lat: number;
  lng: number;
  severity: 'low' | 'medium' | 'high';
  id?: string;
}

interface RealEarthProps {
  markers?: CrisisMarkerData[];
  autoRotate?: boolean;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const RealEarthComponent = ({ markers = [], autoRotate = true }: RealEarthProps) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // --- 1. Scene Setup ---
    const scene = new THREE.Scene();
    scene.background = null; // Transparent background

    // Camera
    const camera = new THREE.PerspectiveCamera(
      45,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 3);

    // Renderer (Optimized for performance)
    const renderer = new THREE.WebGLRenderer({ 
      antialias: false, // Disable antialiasing for better performance
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1)); // Cap at 1x for performance
    mountRef.current.appendChild(renderer.domElement);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = true;
    controls.enablePan = false;
    controls.minDistance = 2;
    controls.maxDistance = 4;
    controls.autoRotate = autoRotate;
    controls.autoRotateSpeed = 0.5;
    controls.rotateSpeed = 0.5;

    // --- 2. Texture Loading (Real Earth Maps) ---
    const textureLoader = new THREE.TextureLoader();
    const earthMap = textureLoader.load(
      'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_atmos_2048.jpg'
    );
    const earthSpecular = textureLoader.load(
      'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_specular_2048.jpg'
    );
    const earthNormal = textureLoader.load(
      'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_normal_2048.jpg'
    );

    // --- 3. The Earth Sphere (Reduced geometry for performance) ---
    const earthRadius = 1.2;
    const earthGeometry = new THREE.SphereGeometry(earthRadius, 48, 48);
    const earthMaterial = new THREE.MeshPhongMaterial({
      map: earthMap,
      specularMap: earthSpecular,
      normalMap: earthNormal,
      specular: new THREE.Color(0x333333),
      shininess: 15,
    });
    const earth = new THREE.Mesh(earthGeometry, earthMaterial);
    scene.add(earth);

    // --- 4. Crisis Markers (Optimized) ---
    const markersGroup = new THREE.Group();
    earth.add(markersGroup);

    const markerGeometry = new THREE.SphereGeometry(0.015, 8, 8); // Reduced geometry
    const markerMeshes: Array<{ mesh: THREE.Mesh; phase: number; speed: number }> = [];

    // Function to convert lat/lon to 3D vector
    const latLonToVector3 = (lat: number, lon: number, radius: number) => {
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lon + 180) * (Math.PI / 180);
      const x = -(radius * Math.sin(phi) * Math.cos(theta));
      const z = radius * Math.sin(phi) * Math.sin(theta);
      const y = radius * Math.cos(phi);
      return new THREE.Vector3(x, y, z);
    };

    // Create markers from props
    markers.forEach((markerData) => {
      let color: number;
      switch (markerData.severity) {
        case 'high':
          color = 0xff3333; // Red
          break;
        case 'medium':
          color = 0xffaa00; // Orange
          break;
        case 'low':
          color = 0x00ffff; // Cyan
          break;
        default:
          color = 0x00ffff;
      }

      const material = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.9,
      });

      const marker = new THREE.Mesh(markerGeometry, material);
      const position = latLonToVector3(markerData.lat, markerData.lng, earthRadius + 0.02);
      marker.position.copy(position);

      // Add outer glow (Optimized)
      const glowMaterial = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.3,
      });
      const glowMarker = new THREE.Mesh(
        new THREE.SphereGeometry(0.03, 8, 8), // Reduced geometry
        glowMaterial
      );
      glowMarker.position.copy(position);
      markersGroup.add(glowMarker);

      markersGroup.add(marker);
      markerMeshes.push({
        mesh: marker,
        phase: Math.random() * Math.PI * 2,
        speed: 0.5 + Math.random() * 2.0,
      });
    });

    // --- 5. Holographic Scanning Effect ---
    const scanVertexShader = `
      varying vec3 vNormal;
      varying vec3 vPosition;
      void main() {
        vNormal = normalize( normalMatrix * normal );
        vPosition = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
      }
    `;

    const scanFragmentShader = `
      uniform float time;
      varying vec3 vNormal;
      varying vec3 vPosition;

      void main() {
        // Holographic Grid
        float gridSize = 20.0;
        float gridX = step(0.98, fract(vPosition.x * gridSize));
        float gridY = step(0.98, fract(vPosition.y * gridSize));
        float gridZ = step(0.98, fract(vPosition.z * gridSize));
        float grid = max(max(gridX, gridY), gridZ);

        // Radar Sweep
        float angle = atan(vPosition.z, vPosition.x);
        float sweep = smoothstep(0.0, 0.5, sin(angle + time * 2.0));

        // Fresnel Glow
        float fresnel = pow(0.6 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 3.0);
        
        vec3 techColor = vec3(0.0, 0.8, 1.0);
        
        float alpha = (fresnel * 0.4) + (grid * 0.3) + (sweep * 0.15);
        
        gl_FragColor = vec4(techColor, alpha * 0.5);
      }
    `;

    const scanMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0.0 },
      },
      vertexShader: scanVertexShader,
      fragmentShader: scanFragmentShader,
      blending: THREE.AdditiveBlending,
      side: THREE.FrontSide,
      transparent: true,
      depthWrite: false,
    });

    const scanGeometry = new THREE.SphereGeometry(earthRadius + 0.05, 32, 32);
    const scanMesh = new THREE.Mesh(scanGeometry, scanMaterial);
    scene.add(scanMesh);

    // --- 6. Atmosphere Glow ---
    const spriteMaterial = new THREE.SpriteMaterial({
      map: new THREE.CanvasTexture(
        (() => {
          const canvas = document.createElement('canvas');
          canvas.width = 128;
          canvas.height = 128;
          const context = canvas.getContext('2d');
          if (!context) throw new Error('Could not get canvas context');
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
    glow.scale.set(3.5, 3.5, 1);
    scene.add(glow);

    // --- 7. Lighting ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 0.5);
    sunLight.position.set(5, 2, 3);
    scene.add(sunLight);

    // --- 8. Starfield (Reduced for Performance) ---
    const starsGeometry = new THREE.BufferGeometry();
    const starPositions = [];
    for (let i = 0; i < 1000; i++) {
      const x = (Math.random() - 0.5) * 200;
      const y = (Math.random() - 0.5) * 200;
      const z = (Math.random() - 0.5) * 200;
      starPositions.push(x, y, z);
    }
    starsGeometry.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(starPositions, 3)
    );
    const starsMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.5,
      transparent: true,
      opacity: 0.8,
    });
    const stars = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(stars);

    // --- 9. Animation Loop ---
    const clock = new THREE.Clock();
    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const elapsed = clock.getElapsedTime();

      // Rotate earth slowly
      earth.rotation.y += 0.0005;

      // Update scanning effect
      scanMaterial.uniforms.time.value = elapsed;

      // Animate Markers (Pulse)
      markerMeshes.forEach(({ mesh, phase, speed }) => {
        const scale = 0.8 + (Math.sin(elapsed * speed + phase) * 0.2);
        mesh.scale.setScalar(scale);
      });

      // Slowly drift stars
      stars.rotation.y += 0.0001;

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    // --- 10. Handle Resize ---
    const handleResize = () => {
      if (!mountRef.current) return;
      const width = mountRef.current.clientWidth;
      const height = mountRef.current.clientHeight;

      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };

    window.addEventListener('resize', handleResize);

    // --- 11. Cleanup ---
    return () => {
      // Cancel animation frame to stop the loop!
      cancelAnimationFrame(animationFrameId);
      
      window.removeEventListener('resize', handleResize);
      if (mountRef.current && renderer.domElement) {
        try {
          mountRef.current.removeChild(renderer.domElement);
        } catch (e) {
          // Element might already be removed
        }
      }
      
      // Dispose all geometries and materials
      earthGeometry.dispose();
      earthMaterial.dispose();
      markerGeometry.dispose();
      scanGeometry.dispose();
      scanMaterial.dispose();
      starsGeometry.dispose();
      starsMaterial.dispose();
      
      // Dispose textures
      earthMap.dispose();
      earthSpecular.dispose();
      earthNormal.dispose();
      
      // Dispose renderer
      renderer.dispose();
      controls.dispose();
    };
  }, []); // Empty deps - only initialize once

  return (
    <div style={{ width: '100%', height: '100%', minHeight: '400px' }}>
      <div ref={mountRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
}

// Memoize to prevent unnecessary re-renders
export const RealEarth = memo(RealEarthComponent);
export default RealEarth;
