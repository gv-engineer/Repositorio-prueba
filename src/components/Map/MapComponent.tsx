'use client'

import { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polygon, Polyline } from 'react-leaflet';
import type { Earthquake } from '@/types';
import { getMagnitudeColor } from '@/hooks/useMapState';

interface MapComponentProps {
  center: [number, number];
  zoom: number;
  earthquakes: Earthquake[];
  showMarkers: boolean;
  showBuffers: boolean;
  bufferMultiplier: number;
  onEarthquakeClick: (eq: Earthquake) => void;
  mode: 'global' | 'peru' | 'story' | 'compare' | 'models';
  storyCenter?: [number, number];
  peruZones?: boolean;
}

// Import Leaflet CSS
import 'leaflet/dist/leaflet.css';

export default function MapComponent({
  center,
  zoom,
  earthquakes,
  showMarkers,
  showBuffers,
  bufferMultiplier,
  onEarthquakeClick,
  mode,
  storyCenter,
  peruZones,
}: MapComponentProps) {
  // Calculate buffer radius
  const calculateBufferRadius = (magnitude: number): number => {
    return Math.pow(10, 0.5 * magnitude - 1.5) * bufferMultiplier * 1000;
  };

  // Filter earthquakes for display
  const displayEarthquakes = useMemo(() => {
    if (showMarkers) {
      return earthquakes.slice(0, 2000); // Limit for performance
    }
    return [];
  }, [earthquakes, showMarkers]);

  // Buffer earthquakes
  const bufferEarthquakes = useMemo(() => {
    if (showBuffers) {
      return earthquakes.filter(eq => eq.magnitude >= 4).slice(0, 100);
    }
    return [];
  }, [earthquakes, showBuffers]);

  // Peru seismic zones
  const peruSeismicZones = useMemo(() => {
    if (!peruZones) return [];
    return [
      {
        id: 'costa',
        name: 'Zona Costera',
        positions: [[
          [-18.5, -82.0],
          [-18.5, -70.0],
          [-5.0, -76.0],
          [-5.0, -82.0],
        ]] as [number, number][],
        color: '#ef4444',
        description: 'Alta sismicidad - Subducción',
      },
      {
        id: 'sierra',
        name: 'Zona Sierra',
        positions: [[
          [-18.0, -78.0],
          [-18.0, -69.0],
          [-5.0, -69.0],
          [-5.0, -76.0],
        ]] as [number, number][],
        color: '#f59e0b',
        description: 'Media sismicidad - Fallas continentales',
      },
      {
        id: 'selva',
        name: 'Zona Amazónica',
        positions: [[
          [-13.0, -74.0],
          [-13.0, -69.0],
          [-5.0, -69.0],
          [-5.0, -74.0],
        ]] as [number, number][],
        color: '#10b981',
        description: 'Baja sismicidad',
      },
    ];
  }, [peruZones]);

  // Subduction zone line
  const subductionLine: [number, number][] = useMemo(() => [
    [-5.0, -81.5],
    [-7.0, -81.0],
    [-9.0, -79.5],
    [-11.0, -78.5],
    [-13.0, -77.5],
    [-15.0, -76.5],
    [-17.0, -75.5],
    [-18.5, -74.5],
  ], []);

  return (
      <MapContainer
          center={center}
          zoom={zoom}
          className="h-full w-full"
          dragging={false}
          scrollWheelZoom={true}
          doubleClickZoom={false}
          touchZoom={true}
          zoomControl={true}
          minZoom={zoom}        
          maxZoom={zoom + 5}
>    
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />
      
      {/* Earthquake Markers */}
      {displayEarthquakes.map(eq => (
        <Circle
          key={eq.id}
          center={[eq.coordinates.lat, eq.coordinates.lng]}
          radius={Math.max(5000, eq.magnitude * 5000)}
          pathOptions={{
            fillColor: getMagnitudeColor(eq.magnitude),
            fillOpacity: 0.6,
            color: getMagnitudeColor(eq.magnitude),
            weight: 2,
          }}
          eventHandlers={{
            click: () => onEarthquakeClick(eq),
          }}
        >
          <Popup>
            <div className="text-slate-200 min-w-48">
              <div className="flex items-center gap-2 mb-2">
                <div 
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: getMagnitudeColor(eq.magnitude) }}
                />
                <span className="font-bold">M{eq.magnitude.toFixed(1)}</span>
              </div>
              <p className="text-sm text-slate-300 mb-1">{eq.place}</p>
              <div className="text-xs text-slate-400">
                <p>Depth: {eq.depth.toFixed(1)} km</p>
                {eq.tsunami === 1 && <p className="text-blue-400">Tsunami warning</p>}
              </div>
            </div>
          </Popup>
        </Circle>
      ))}
      
      {/* Buffer Zones */}
      {bufferEarthquakes.map(eq => (
        <Circle
          key={`buffer-${eq.id}`}
          center={[eq.coordinates.lat, eq.coordinates.lng]}
          radius={calculateBufferRadius(eq.magnitude)}
          pathOptions={{
            fillColor: getMagnitudeColor(eq.magnitude),
            fillOpacity: 0.15,
            color: getMagnitudeColor(eq.magnitude),
            weight: 2,
            dashArray: '5, 5',
          }}
        />
      ))}
      
      {/* Story Mode Marker */}
      {mode === 'story' && storyCenter && (
        <Circle
          center={storyCenter}
          radius={100000}
          pathOptions={{
            fillColor: '#f59e0b',
            fillOpacity: 0.3,
            color: '#f59e0b',
            weight: 3,
          }}
        />
      )}
      
      {/* Peru Seismic Zones */}
      {peruZones && peruSeismicZones.map(zone => (
        <Polygon
          key={zone.id}
          positions={zone.positions}
          pathOptions={{
            fillColor: zone.color,
            fillOpacity: 0.15,
            color: zone.color,
            weight: 2,
          }}
        >
          <Popup>
            <div className="text-slate-200">
              <h4 className="font-bold">{zone.name}</h4>
              <p className="text-sm">{zone.description}</p>
            </div>
          </Popup>
        </Polygon>
      ))}
      
      {/* Subduction Zone */}
      {peruZones && (
        <Polyline
          positions={subductionLine}
          pathOptions={{
            color: '#ef4444',
            weight: 3,
            dashArray: '10, 5',
          }}
        />
      )}
    </MapContainer>
  );
}
