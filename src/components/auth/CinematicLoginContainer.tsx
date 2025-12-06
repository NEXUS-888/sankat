import { useState, useRef, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { RealEarth } from '@/components/3d/RealEarth';
import { GlassmorphicCard } from './GlassmorphicCard';
import { CinematicLoginForm } from './CinematicLoginForm';
import { CinematicSignupForm } from './CinematicSignupForm';
import { FeatureCard } from './FeatureCard';
import './CinematicLogin.css';

export const CinematicLoginContainer = () => {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const throttleTimeout = useRef<number | null>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Throttle mouse updates to reduce re-renders
      if (throttleTimeout.current !== null) return;
      
      throttleTimeout.current = window.setTimeout(() => {
        throttleTimeout.current = null;
      }, 50); // Update max once per 50ms
      
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left - rect.width / 2) / rect.width;
        const y = (e.clientY - rect.top - rect.height / 2) / rect.height;
        setMousePosition({ x, y });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (throttleTimeout.current !== null) {
        clearTimeout(throttleTimeout.current);
      }
    };
  }, []);

  // Crisis markers for RealEarth (memoized to prevent recreation)
  const crisisMarkers = useMemo(() => [
    { lat: 50.4501, lng: 30.5234, severity: 'high' as const, id: 'ukraine' },
    { lat: 33.5138, lng: 36.2765, severity: 'high' as const, id: 'syria' },
    { lat: 18.5944, lng: -72.3074, severity: 'medium' as const, id: 'haiti' },
    { lat: 15.5527, lng: 48.5164, severity: 'high' as const, id: 'yemen' },
    { lat: 16.8661, lng: 96.1951, severity: 'medium' as const, id: 'myanmar' },
  ], []);

  const features = [
    {
      title: 'Real-Time Crisis Tracking',
      description: 'Monitor global crises as they unfold',
      severity: 'urgent',
      icon: '🌍',
    },
    {
      title: 'Verified Relief Networks',
      description: 'Connect with trusted organizations',
      severity: 'general',
      icon: '🤝',
    },
    {
      title: 'Impact Visualization',
      description: 'See the difference you make',
      severity: 'general',
      icon: '📊',
    },
  ];

  return (
    <div className="cinematic-login-wrapper" ref={containerRef}>
      {/* Background Effects */}
      <div className="starfield-background" />
      <div className="volumetric-haze" />
      <div className="grid-overlay" />

      {/* Main Container */}
      <div className="cinematic-container">
        {/* Left Side - 3D Earth Panel */}
        <motion.div
          className="earth-panel"
          style={{
            transform: `perspective(1000px) rotateY(${mousePosition.x * 2}deg) rotateX(${-mousePosition.y * 2}deg)`,
          }}
        >
          <div className="earth-scene-wrapper">
            <RealEarth markers={crisisMarkers} autoRotate={true} />
          </div>

          {/* Feature Cards */}
          <div className="feature-cards-container">
            {features.map((feature, index) => (
              <FeatureCard
                key={index}
                {...feature}
                index={index}
                mousePosition={mousePosition}
              />
            ))}
          </div>
        </motion.div>

        {/* Right Side - Login Panel */}
        <motion.div
          className="login-panel"
          style={{
            transform: `perspective(1000px) rotateY(${mousePosition.x * -3}deg) rotateX(${-mousePosition.y * 3}deg)`,
          }}
        >
          <GlassmorphicCard className="login-card" mousePosition={mousePosition}>
            {/* Logo and Title */}
            <div className="login-header">
              <motion.div
                className="logo-wrapper"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              >
                <div className="logo-glow" />
                <span className="logo-text">SANKAT</span>
              </motion.div>
              <motion.h1
                className="login-title"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                Mission Control Access
              </motion.h1>
              <motion.p
                className="login-subtitle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                Global Crisis Visualization Platform
              </motion.p>
            </div>

            {/* Tabs */}
            <div className="auth-tabs">
              <div className="tabs-wrapper">
                <button
                  className={`tab-button ${activeTab === 'login' ? 'active' : ''}`}
                  onClick={() => setActiveTab('login')}
                >
                  Login
                </button>
                <button
                  className={`tab-button ${activeTab === 'signup' ? 'active' : ''}`}
                  onClick={() => setActiveTab('signup')}
                >
                  Sign Up
                </button>
                <motion.div
                  className="tab-indicator"
                  animate={{
                    x: activeTab === 'login' ? 0 : '100%',
                  }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              </div>
            </div>

            {/* Forms */}
            <div className="auth-forms">
              {activeTab === 'login' ? (
                <CinematicLoginForm />
              ) : (
                <CinematicSignupForm />
              )}
            </div>
          </GlassmorphicCard>
        </motion.div>
      </div>
    </div>
  );
};
