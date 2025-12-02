import { useEffect, useRef, useState } from 'react';
import maplibregl, { GeoJSONSource } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Crisis, Category } from '@/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const MAPTILER_KEY = import.meta.env.VITE_MAPTILER_KEY || 'get_your_own_key';

const categoryColors: Record<Category, string> = {
  Conflict: '#ef4444',
  Disaster: '#f97316',
  Health: '#22c55e',
  Humanitarian: '#3b82f6',
  Climate: '#2dd4bf',
};

const CRISIS_LIMITS = [10, 50, 100, 1000, 100000] as const;
type CrisisLimit = (typeof CRISIS_LIMITS)[number];

interface MapViewProps {
  crises: Crisis[];
  selectedCrisis: Crisis | null;
  onSelectCrisis: (crisis: Crisis) => void;
}

// Convert crises to GeoJSON FeatureCollection
function crisesToGeoJSON(crises: Crisis[]): GeoJSON.FeatureCollection<GeoJSON.Point> {
  return {
    type: 'FeatureCollection',
    features: crises.map((crisis) => ({
      type: 'Feature',
      id: crisis.id,
      geometry: {
        type: 'Point',
        coordinates: [crisis.longitude, crisis.latitude],
      },
      properties: {
        id: crisis.id,
        title: crisis.title,
        category: crisis.category,
        severity: crisis.severity,
        country: crisis.country,
        color: categoryColors[crisis.category],
      },
    })),
  };
}

export function MapView({ crises, selectedCrisis, onSelectCrisis }: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [crisisLimit, setCrisisLimit] = useState<CrisisLimit>(100);

  // Get limited crises
  const limitedCrises = crises.slice(0, crisisLimit);
  
  // Debug logging
  console.log('MapView received crises:', crises.length, 'limited:', limitedCrises.length);

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
      
      // Add crisis source with clustering
      map.current!.addSource('crises', {
        type: 'geojson',
        data: crisesToGeoJSON([]),
        cluster: true,
        clusterRadius: 50,
        clusterMaxZoom: 12,
      });

      // Cluster glow layer (outer glow) - shows on hover
      map.current!.addLayer({
        id: 'cluster-glow',
        type: 'circle',
        source: 'crises',
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': [
            'step',
            ['get', 'point_count'],
            '#51bbd6',
            10, '#f1f075',
            100, '#f28cb1',
          ],
          'circle-radius': [
            'step',
            ['get', 'point_count'],
            35,
            10, 45,
            100, 55,
          ],
          'circle-opacity': [
            'case',
            ['boolean', ['feature-state', 'hover'], false],
            0.6,
            0
          ],
          'circle-blur': 0.5,
        },
      });

      // Cluster circle layer
      map.current!.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'crises',
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': [
            'step',
            ['get', 'point_count'],
            '#51bbd6', // 0-9
            10, '#f1f075', // 10-99
            100, '#f28cb1', // 100+
          ],
          'circle-radius': [
            'step',
            ['get', 'point_count'],
            20, // 0-9
            10, 25, // 10-99
            100, 35, // 100+
          ],
          'circle-stroke-width': [
            'case',
            ['boolean', ['feature-state', 'hover'], false],
            3,
            2
          ],
          'circle-stroke-color': [
            'case',
            ['boolean', ['feature-state', 'hover'], false],
            'rgba(255,255,255,0.9)',
            'rgba(255,255,255,0.5)'
          ],
        },
      });

      // Cluster count label layer
      map.current!.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'crises',
        filter: ['has', 'point_count'],
        layout: {
          'text-field': '{point_count_abbreviated}',
          'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
          'text-size': 14,
        },
        paint: {
          'text-color': '#1a1a2e',
        },
      });

      // Unclustered point glow layer (outer glow) - shows on hover
      map.current!.addLayer({
        id: 'unclustered-point-glow',
        type: 'circle',
        source: 'crises',
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-color': ['get', 'color'],
          'circle-radius': [
            'case',
            ['boolean', ['feature-state', 'hover'], false],
            25,
            20
          ],
          'circle-opacity': [
            'case',
            ['boolean', ['feature-state', 'hover'], false],
            0.6,
            0
          ],
          'circle-blur': 0.5,
        },
      });

      // Unclustered point layer
      map.current!.addLayer({
        id: 'unclustered-point',
        type: 'circle',
        source: 'crises',
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-color': ['get', 'color'],
          'circle-radius': [
            'case',
            ['boolean', ['feature-state', 'hover'], false],
            12,
            10
          ],
          'circle-stroke-width': [
            'case',
            ['boolean', ['feature-state', 'hover'], false],
            3,
            2
          ],
          'circle-stroke-color': [
            'case',
            ['boolean', ['feature-state', 'hover'], false],
            'rgba(255,255,255,0.9)',
            'rgba(255,255,255,0.5)'
          ],
        },
      });

      // Click on cluster to zoom
      map.current!.on('click', 'clusters', async (e) => {
        const features = map.current!.queryRenderedFeatures(e.point, {
          layers: ['clusters'],
        });
        if (!features.length) return;
        
        const clusterId = features[0].properties?.cluster_id;
        const source = map.current!.getSource('crises') as GeoJSONSource;
        
        try {
          const zoom = await source.getClusterExpansionZoom(clusterId);
          const coordinates = (features[0].geometry as GeoJSON.Point).coordinates;
          map.current!.easeTo({
            center: [coordinates[0], coordinates[1]],
            zoom: zoom,
          });
        } catch (err) {
          console.error('Error expanding cluster:', err);
        }
      });

      // Click on unclustered point
      map.current!.on('click', 'unclustered-point', (e) => {
        const features = e.features;
        if (!features?.length) return;
        
        const props = features[0].properties;
        if (props?.id) {
          const crisis = crises.find((c) => c.id === props.id);
          if (crisis) {
            onSelectCrisis(crisis);
          }
        }
      });

      // Track hovered feature
      let hoveredClusterId: number | null = null;
      let hoveredPointId: number | null = null;

      // Change cursor and glow on hover - clusters
      map.current!.on('mouseenter', 'clusters', (e) => {
        map.current!.getCanvas().style.cursor = 'pointer';
        if (e.features && e.features.length > 0) {
          if (hoveredClusterId !== null) {
            map.current!.setFeatureState(
              { source: 'crises', id: hoveredClusterId },
              { hover: false }
            );
          }
          hoveredClusterId = e.features[0].id as number;
          map.current!.setFeatureState(
            { source: 'crises', id: hoveredClusterId },
            { hover: true }
          );
        }
      });
      
      map.current!.on('mouseleave', 'clusters', () => {
        map.current!.getCanvas().style.cursor = '';
        if (hoveredClusterId !== null) {
          map.current!.setFeatureState(
            { source: 'crises', id: hoveredClusterId },
            { hover: false }
          );
          hoveredClusterId = null;
        }
      });

      // Change cursor and glow on hover - unclustered points
      map.current!.on('mouseenter', 'unclustered-point', (e) => {
        map.current!.getCanvas().style.cursor = 'pointer';
        if (e.features && e.features.length > 0) {
          if (hoveredPointId !== null) {
            map.current!.setFeatureState(
              { source: 'crises', id: hoveredPointId },
              { hover: false }
            );
          }
          hoveredPointId = e.features[0].properties?.id;
          if (hoveredPointId) {
            map.current!.setFeatureState(
              { source: 'crises', id: hoveredPointId },
              { hover: true }
            );
          }
        }
      });
      
      map.current!.on('mouseleave', 'unclustered-point', () => {
        map.current!.getCanvas().style.cursor = '';
        if (hoveredPointId !== null) {
          map.current!.setFeatureState(
            { source: 'crises', id: hoveredPointId },
            { hover: false }
          );
          hoveredPointId = null;
        }
      });
    });

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // Update source data when crises change
  useEffect(() => {
    if (!map.current || !mapLoaded) {
      console.log('Map not ready:', { hasMap: !!map.current, mapLoaded });
      return;
    }

    const source = map.current.getSource('crises') as GeoJSONSource;
    if (source) {
      const geojson = crisesToGeoJSON(limitedCrises);
      console.log('Updating map source with', limitedCrises.length, 'crises');
      source.setData(geojson);
    } else {
      console.error('Crisis source not found on map');
    }
  }, [limitedCrises, mapLoaded]);

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

      {/* Crisis limit dropdown */}
      <div className="absolute top-4 left-4 glass rounded-xl p-3">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground whitespace-nowrap">Show up to:</span>
          <Select
            value={crisisLimit.toString()}
            onValueChange={(value) => setCrisisLimit(Number(value) as CrisisLimit)}
          >
            <SelectTrigger className="w-24 h-8 text-xs bg-background/50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CRISIS_LIMITS.map((limit) => (
                <SelectItem key={limit} value={limit.toString()}>
                  {limit.toLocaleString()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          Showing {Math.min(limitedCrises.length, crises.length).toLocaleString()} of {crises.length.toLocaleString()}
        </div>
      </div>
      
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

      {/* Cluster legend */}
      <div className="absolute bottom-4 right-4 glass rounded-xl p-3 text-xs">
        <div className="font-medium mb-2 text-muted-foreground">Clusters</div>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#51bbd6' }} />
            <span className="text-foreground/80">&lt; 10 crises</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#f1f075' }} />
            <span className="text-foreground/80">10 - 99 crises</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#f28cb1' }} />
            <span className="text-foreground/80">100+ crises</span>
          </div>
        </div>
      </div>
    </div>
  );
}
