'use client'

import L from 'leaflet';

// Create custom div icon for earthquakes
export function createEarthquakeIcon(magnitude: number): L.DivIcon {
  const size = Math.max(8, Math.min(40, magnitude * 5));
  const color = getMagnitudeColor(magnitude);
  
  return L.divIcon({
    className: 'earthquake-marker',
    html: `
      <div style="
        width: ${size}px;
        height: ${size}px;
        background-color: ${color};
        border-radius: 50%;
        border: 2px solid white;
        box-shadow: 0 0 10px ${color};
        cursor: pointer;
        transition: transform 0.2s ease;
      "></div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

// Create pulsing icon for story mode
export function createPulsingIcon(magnitude: number): L.DivIcon {
  const size = Math.max(20, Math.min(60, magnitude * 6));
  const color = '#f59e0b';
  
  return L.divIcon({
    className: 'pulsing-marker',
    html: `
      <div style="
        width: ${size}px;
        height: ${size}px;
        background-color: ${color};
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 0 20px ${color}, 0 0 40px ${color};
        animation: pulse 2s infinite;
      "></div>
      <style>
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.2); opacity: 0.8; }
        }
      </style>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

// Create cluster icon
export function createClusterIcon(count: number, maxMagnitude: number): L.DivIcon {
  const size = Math.max(30, Math.min(60, 30 + count * 0.5));
  const color = getMagnitudeColor(maxMagnitude);
  
  return L.divIcon({
    className: 'cluster-marker',
    html: `
      <div style="
        width: ${size}px;
        height: ${size}px;
        background-color: ${color}40;
        border-radius: 50%;
        border: 2px solid ${color};
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: ${size * 0.35}px;
      ">${count}</div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

function getMagnitudeColor(magnitude: number): string {
  if (magnitude < 2) return '#10b981';
  if (magnitude < 3) return '#34d399';
  if (magnitude < 4) return '#6ee7b7';
  if (magnitude < 5) return '#fcd34d';
  if (magnitude < 6) return '#fbbf24';
  if (magnitude < 7) return '#f59e0b';
  if (magnitude < 8) return '#f97316';
  return '#ef4444';
}
