import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Crisis, Category } from '@/types';

const MAPTILER_KEY = import.meta.env.VITE_MAPTILER_KEY || 'get_your_own_key';

const categoryColors: Record<Category, string> = {
  Conflict: '#ef4444',
  Disaster: '#f97316',
  Health: '#22c55e',
  Humanitarian: '#3b82f6',
  Climate: '#2dd4bf',
};

interface MapViewProps {
  crises: Crisis[];
  selectedCrisis: Crisis | null;
  onSelectCrisis: (crisis: Crisis) => void;
}

export function MapView({ crises, selectedCrisis, onSelectCrisis }: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const markers = useRef<maplibregl.Marker[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: `https://api.maptiler.com/maps/dataviz-dark/style.json?key=${MAPTILER_KEY}`,
      center: [20, 20],
      zoom: 1.5,
      attributionControl: false,
    });

    map.current.addControl(
      new maplibregl.NavigationControl({ showCompass: false }),
      'bottom-right'
    );

    map.current.on('load', () => {
      setMapLoaded(true);
    });

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // Update markers when crises change
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    // Clear existing markers
    markers.current.forEach((marker) => marker.remove());
    markers.current = [];

    // Add new markers
    crises.forEach((crisis) => {
      const el = document.createElement('div');
      el.className = 'crisis-marker';
      el.style.cssText = `
        width: 24px;
        height: 24px;
        background: ${categoryColors[crisis.category]};
        border: 2px solid rgba(255,255,255,0.3);
        border-radius: 50%;
        cursor: pointer;
        transition: all 0.2s ease;
        box-shadow: 0 0 10px ${categoryColors[crisis.category]}80;
      `;

      if (crisis.severity === 'Critical' || crisis.severity === 'High') {
        el.style.animation = 'pulse 2s ease-in-out infinite';
      }

      el.addEventListener('mouseenter', () => {
        el.style.transform = 'scale(1.3)';
        el.style.boxShadow = `0 0 20px ${categoryColors[crisis.category]}`;
      });

      el.addEventListener('mouseleave', () => {
        el.style.transform = 'scale(1)';
        el.style.boxShadow = `0 0 10px ${categoryColors[crisis.category]}80`;
      });

      el.addEventListener('click', () => {
        onSelectCrisis(crisis);
      });

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([crisis.longitude, crisis.latitude])
        .addTo(map.current!);

      markers.current.push(marker);
    });
  }, [crises, mapLoaded, onSelectCrisis]);

  // Fly to selected crisis
  useEffect(() => {
    if (!map.current || !selectedCrisis) return;

    map.current.flyTo({
      center: [selectedCrisis.longitude, selectedCrisis.latitude],
      zoom: 5,
      duration: 1500,
    });
  }, [selectedCrisis]);

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden">
      <div ref={mapContainer} className="w-full h-full" />
      
      {/* Overlay gradient */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-background/20 to-transparent" />
      
      {/* Legend */}
      <div className="absolute bottom-4 left-4 glass rounded-xl p-3 text-xs">
        <div className="font-medium mb-2 text-muted-foreground">Categories</div>
        <div className="space-y-1.5">
          {Object.entries(categoryColors).map(([category, color]) => (
            <div key={category} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: color }}
              />
              <span className="text-foreground/80">{category}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Pulse animation style */}
      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.2); opacity: 0.7; }
        }
      `}</style>
    </div>
  );
}
