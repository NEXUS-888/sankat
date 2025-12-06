// ============================================================================
// COPY-PASTE READY: Replace Your Hero Section with RealEarth
// ============================================================================

// FILE: src/components/HeroSection.tsx

import { RealEarth } from '@/components/3d/RealEarth';
import './HeroSection.css';

export function HeroSection() {
  // Real-world crisis coordinates (sample data)
  const crisisMarkers = [
    { id: 'crisis-1', lat: 50.4501, lng: 30.5234, severity: 'high' as const },    // Ukraine
    { id: 'crisis-2', lat: 33.5138, lng: 36.2765, severity: 'high' as const },    // Syria
    { id: 'crisis-3', lat: 18.5944, lng: -72.3074, severity: 'medium' as const }, // Haiti
    { id: 'crisis-4', lat: 15.5527, lng: 48.5164, severity: 'high' as const },    // Yemen
    { id: 'crisis-5', lat: 16.8661, lng: 96.1951, severity: 'medium' as const },  // Myanmar
  ];

  return (
    <div className="hero-section">
      {/* Background effects */}
      <div className="hero-bg"></div>

      {/* Main content container */}
      <div className="hero-container">
        
        {/* LEFT: 3D Earth */}
        <div className="hero-earth">
          <RealEarth markers={crisisMarkers} autoRotate={true} />
        </div>

        {/* RIGHT: Content */}
        <div className="hero-content">
          <div className="hero-badge">
            <span className="badge-pulse"></span>
            LIVE MONITORING
          </div>

          <h1 className="hero-title">
            Global Crisis
            <br />
            <span className="title-gradient">Visualization</span>
          </h1>

          <p className="hero-description">
            Real-time tracking and response to worldwide emergencies.
            Connect with verified relief organizations and monitor
            the impact of humanitarian efforts across the globe.
          </p>

          <div className="hero-buttons">
            <button className="btn-primary">
              <span>View Crisis Map</span>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button className="btn-secondary">
              Learn More
            </button>
          </div>

          <div className="hero-stats">
            <div className="stat-item">
              <div className="stat-value">{crisisMarkers.length}</div>
              <div className="stat-label">Active Crises</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">43K</div>
              <div className="stat-label">Partners</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">$2.4M</div>
              <div className="stat-label">Aid Today</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

// ============================================================================
// FILE: src/components/HeroSection.css
// ============================================================================

/*
.hero-section {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
  background: linear-gradient(135deg, #0a0e1a 0%, #1e293b 100%);
}

.hero-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(ellipse at 30% 40%, rgba(59, 130, 246, 0.15) 0%, transparent 50%),
    radial-gradient(ellipse at 70% 60%, rgba(34, 211, 238, 0.1) 0%, transparent 50%);
  pointer-events: none;
}

.hero-container {
  display: flex;
  min-height: 100vh;
  position: relative;
  z-index: 1;
}

.hero-earth {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.hero-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 80px 100px 80px 60px;
  max-width: 650px;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 20px;
  color: #ef4444;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  width: fit-content;
  margin-bottom: 30px;
}

.badge-pulse {
  width: 6px;
  height: 6px;
  background: #ef4444;
  border-radius: 50%;
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(1.3);
  }
}

.hero-title {
  font-size: 4rem;
  font-weight: 800;
  line-height: 1.1;
  color: #fff;
  margin: 0 0 30px 0;
}

.title-gradient {
  background: linear-gradient(135deg, #3b82f6 0%, #22d3ee 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-description {
  font-size: 1.125rem;
  line-height: 1.7;
  color: #94a3b8;
  margin: 0 0 40px 0;
}

.hero-buttons {
  display: flex;
  gap: 16px;
  margin-bottom: 60px;
}

.btn-primary,
.btn-secondary {
  padding: 16px 32px;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: none;
}

.btn-primary {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: #fff;
  box-shadow: 0 8px 24px rgba(59, 130, 246, 0.3);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 32px rgba(59, 130, 246, 0.4);
}

.btn-primary svg {
  transition: transform 0.3s ease;
}

.btn-primary:hover svg {
  transform: translateX(4px);
}

.btn-secondary {
  background: transparent;
  color: #e2e8f0;
  border: 1px solid rgba(59, 130, 246, 0.3);
}

.btn-secondary:hover {
  background: rgba(59, 130, 246, 0.1);
  border-color: rgba(59, 130, 246, 0.5);
}

.hero-stats {
  display: flex;
  gap: 50px;
}

.stat-item {
  text-align: left;
}

.stat-value {
  font-size: 2.5rem;
  font-weight: 700;
  color: #22d3ee;
  line-height: 1;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 0.875rem;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

@media (max-width: 1200px) {
  .hero-container {
    flex-direction: column;
  }

  .hero-earth {
    height: 50vh;
  }

  .hero-content {
    padding: 60px 40px;
    max-width: 100%;
  }

  .hero-title {
    font-size: 3rem;
  }
}

@media (max-width: 768px) {
  .hero-earth {
    height: 40vh;
    padding: 20px;
  }

  .hero-content {
    padding: 40px 20px;
  }

  .hero-title {
    font-size: 2.5rem;
  }

  .hero-buttons {
    flex-direction: column;
  }

  .hero-stats {
    gap: 30px;
  }

  .stat-value {
    font-size: 2rem;
  }
}
*/

// ============================================================================
// USAGE IN APP
// ============================================================================

// FILE: src/App.tsx or src/pages/Index.tsx

/*
import { HeroSection } from '@/components/HeroSection';

function App() {
  return (
    <>
      <HeroSection />
      // ... rest of your app
    </>
  );
}
*/

// ============================================================================
// OR: Quick inline version (no separate component)
// ============================================================================

/*
import { RealEarth } from '@/components/3d/RealEarth';

function App() {
  return (
    <div style={{ 
      display: 'flex', 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0e1a 0%, #1e293b 100%)'
    }}>
      // Earth - Left Side
      <div style={{ flex: 1, padding: '40px' }}>
        <RealEarth 
          markers={[
            { lat: 50.4501, lng: 30.5234, severity: 'high' },
            { lat: 33.5138, lng: 36.2765, severity: 'high' },
            { lat: 18.5944, lng: -72.3074, severity: 'medium' },
          ]}
          autoRotate={true}
        />
      </div>

      // Content - Right Side
      <div style={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '80px'
      }}>
        <h1 style={{ fontSize: '3.5rem', color: 'white' }}>
          Global Crisis Platform
        </h1>
        <p style={{ fontSize: '1.25rem', color: '#94a3b8', marginTop: '20px' }}>
          Real-time monitoring and response
        </p>
      </div>
    </div>
  );
}
*/

// ============================================================================
// CONNECT TO YOUR BACKEND API
// ============================================================================

/*
import { useEffect, useState } from 'react';
import { RealEarth, CrisisMarkerData } from '@/components/3d/RealEarth';

function App() {
  const [markers, setMarkers] = useState<CrisisMarkerData[]>([]);

  useEffect(() => {
    // Fetch from your FastAPI backend
    fetch('http://localhost:8000/api/crises')
      .then(res => res.json())
      .then(data => {
        const mapped = data.map(crisis => ({
          id: crisis.id,
          lat: crisis.latitude,
          lng: crisis.longitude,
          severity: crisis.severity_level.toLowerCase() as 'low' | 'medium' | 'high',
        }));
        setMarkers(mapped);
      })
      .catch(err => console.error('Failed to fetch crises:', err));
  }, []);

  return (
    <div style={{ height: '100vh' }}>
      <RealEarth markers={markers} autoRotate={true} />
    </div>
  );
}
*/

// ============================================================================
// THAT'S IT! 🚀
// ============================================================================

/*
  Copy any of the above code snippets and paste into your project.
  The RealEarth component is already created and ready to use!

  Files created:
  ✅ /src/components/3d/RealEarth.tsx          - Main component
  ✅ /src/components/3d/RealEarth.example.tsx  - Usage examples
  ✅ REALEARTH_INTEGRATION.md                   - Integration guide
  ✅ EARTH_MIGRATION_GUIDE.md                   - Migration from old component
  ✅ REALEARTH_DOCS.md                          - Full documentation
  ✅ COPYPASTE_HERO.tsx                         - This file!

  Next steps:
  1. Copy the HeroSection code above
  2. Create src/components/HeroSection.tsx
  3. Create src/components/HeroSection.css
  4. Import in your App.tsx
  5. View in browser at http://localhost:5173
  6. (Optional) Add real Earth textures to /public/textures/
  7. Ship it! 🎉
*/
