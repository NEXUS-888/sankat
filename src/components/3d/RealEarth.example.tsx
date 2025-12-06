// ============================================================================
// REAL EARTH USAGE EXAMPLE
// ============================================================================

import { RealEarth, CrisisMarkerData } from '@/components/3d/RealEarth';

// Sample crisis markers with real-world coordinates
const sampleMarkers: CrisisMarkerData[] = [
  {
    id: 'ukraine',
    lat: 50.4501,
    lng: 30.5234,
    severity: 'high', // Kyiv, Ukraine
  },
  {
    id: 'syria',
    lat: 33.5138,
    lng: 36.2765,
    severity: 'high', // Damascus, Syria
  },
  {
    id: 'haiti',
    lat: 18.5944,
    lng: -72.3074,
    severity: 'medium', // Port-au-Prince, Haiti
  },
  {
    id: 'yemen',
    lat: 15.5527,
    lng: 48.5164,
    severity: 'high', // Sana'a, Yemen
  },
  {
    id: 'myanmar',
    lat: 16.8661,
    lng: 96.1951,
    severity: 'medium', // Yangon, Myanmar
  },
];

// ============================================================================
// EXAMPLE 1: Basic usage in Hero Section
// ============================================================================

export function HeroWithEarth() {
  return (
    <div style={{ width: '100%', height: '600px', position: 'relative' }}>
      <RealEarth markers={sampleMarkers} autoRotate={true} />
      
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50px',
        transform: 'translateY(-50%)',
        color: 'white',
        zIndex: 10,
      }}>
        <h1>Global Crisis Monitoring</h1>
        <p>Real-time tracking of worldwide emergencies</p>
      </div>
    </div>
  );
}

// ============================================================================
// EXAMPLE 2: Side-by-side with content
// ============================================================================

export function SplitLayoutWithEarth() {
  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      {/* Earth visualization - left side */}
      <div style={{ flex: 1, background: '#0a0e1a' }}>
        <RealEarth markers={sampleMarkers} autoRotate={true} />
      </div>
      
      {/* Content - right side */}
      <div style={{ 
        flex: 1, 
        padding: '40px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}>
        <h2>Crisis Overview</h2>
        <ul>
          {sampleMarkers.map(marker => (
            <li key={marker.id}>
              {marker.id}: {marker.severity} severity
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// ============================================================================
// EXAMPLE 3: Fullscreen background
// ============================================================================

export function FullscreenEarthBackground() {
  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      {/* Earth as background */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 0,
      }}>
        <RealEarth markers={sampleMarkers} autoRotate={true} />
      </div>
      
      {/* Content overlay */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        padding: '100px 50px',
        background: 'linear-gradient(to bottom, rgba(10,14,26,0.8), rgba(10,14,26,0.95))',
      }}>
        <h1 style={{ color: 'white', fontSize: '3rem' }}>
          SANKAT Global Platform
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '1.5rem' }}>
          Monitoring and responding to crises worldwide
        </p>
      </div>
    </div>
  );
}

// ============================================================================
// EXAMPLE 4: Responsive card layout
// ============================================================================

export function ResponsiveEarthCard() {
  return (
    <div style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '20px',
    }}>
      <div style={{
        background: 'rgba(15, 23, 42, 0.6)',
        backdropFilter: 'blur(20px)',
        borderRadius: '20px',
        border: '1px solid rgba(59, 130, 246, 0.2)',
        overflow: 'hidden',
      }}>
        <div style={{ height: '500px' }}>
          <RealEarth markers={sampleMarkers} autoRotate={true} />
        </div>
        
        <div style={{ padding: '30px' }}>
          <h3 style={{ color: 'white', marginBottom: '20px' }}>
            Active Crisis Zones
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '15px',
          }}>
            {sampleMarkers.map(marker => (
              <div
                key={marker.id}
                style={{
                  padding: '15px',
                  background: 'rgba(30, 41, 59, 0.5)',
                  borderRadius: '10px',
                  border: `1px solid ${
                    marker.severity === 'high' ? '#ef4444' :
                    marker.severity === 'medium' ? '#f59e0b' :
                    '#3b82f6'
                  }`,
                }}
              >
                <div style={{ 
                  color: 'white', 
                  fontWeight: 'bold',
                  textTransform: 'capitalize',
                }}>
                  {marker.id}
                </div>
                <div style={{ 
                  color: '#94a3b8', 
                  fontSize: '0.9rem',
                  marginTop: '5px',
                }}>
                  Severity: {marker.severity}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// EXAMPLE 5: Dynamic markers (for real-time updates)
// ============================================================================

import { useState, useEffect } from 'react';

export function DynamicEarthMonitor() {
  const [markers, setMarkers] = useState<CrisisMarkerData[]>(sampleMarkers);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      // In a real app, fetch from your API
      // For demo, we'll just toggle severity
      setMarkers(prev => prev.map(marker => ({
        ...marker,
        severity: Math.random() > 0.5 ? 'high' : 'medium',
      })));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{
        padding: '20px',
        background: 'rgba(15, 23, 42, 0.9)',
        borderBottom: '1px solid rgba(59, 130, 246, 0.2)',
      }}>
        <h1 style={{ color: 'white', margin: 0 }}>
          Live Crisis Monitor
        </h1>
        <p style={{ color: '#94a3b8', margin: '5px 0 0' }}>
          {markers.length} active situations
        </p>
      </header>
      
      <div style={{ flex: 1 }}>
        <RealEarth markers={markers} autoRotate={true} />
      </div>
    </div>
  );
}

// ============================================================================
// TEXTURE SETUP GUIDE
// ============================================================================

/*
To use real Earth textures:

1. Download high-quality Earth textures from:
   - NASA Visible Earth: https://visibleearth.nasa.gov/
   - Solar System Scope: https://www.solarsystemscope.com/textures/
   - Planet Pixel Emporium: http://planetpixelemporium.com/earth.html

2. Recommended textures:
   - earth_day.jpg (8K resolution): Equirectangular color map showing continents and oceans
   - earth_bump.jpg (4K resolution): Grayscale height map for terrain depth
   - earth_specular.jpg (4K resolution): Specular map for ocean reflections
   - earth_night.jpg (4K resolution): City lights for the dark side

3. Place textures in: /public/textures/

4. File structure:
   public/
   └── textures/
       ├── earth_day.jpg
       ├── earth_bump.jpg
       ├── earth_specular.jpg
       └── earth_night.jpg

5. The component will automatically load them. If textures are not found,
   it will fall back to a procedurally generated Earth texture.

6. For best performance:
   - Use JPG format (smaller file size)
   - 4K resolution is ideal balance (8K for day map if needed)
   - Compress images to ~1-2MB each
   - Consider using a CDN for production
*/
