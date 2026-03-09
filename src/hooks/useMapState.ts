'use client'

import { useSyncExternalStore, useMemo } from 'react';

// Empty subscription functions for SSR compatibility
const emptySubscribe = () => () => {};

// Hook para verificar si el código se ejecuta en el cliente
export function useIsClient() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

// Hook para manejar el estado del mapa
export function useMapState(initialState: {
  center: [number, number];
  zoom: number;
}) {
  return useMemo(() => ({
    center: initialState.center,
    zoom: initialState.zoom,
    bounds: null as [[number, number], [number, number]] | null,
  }), [initialState.center, initialState.zoom]);
}

// Función para obtener el color según la magnitud
export function getMagnitudeColor(magnitude: number): string {
  if (magnitude < 2) return '#10b981';
  if (magnitude < 3) return '#34d399';
  if (magnitude < 4) return '#6ee7b7';
  if (magnitude < 5) return '#fcd34d';
  if (magnitude < 6) return '#fbbf24';
  if (magnitude < 7) return '#f59e0b';
  if (magnitude < 8) return '#f97316';
  return '#ef4444';
}

// Función para obtener el tamaño del marcador según la magnitud
export function getMagnitudeSize(magnitude: number): number {
  return Math.max(4, Math.min(30, magnitude * 4));
}

// Función para calcular el radio del buffer
export function calculateBufferRadius(magnitude: number, multiplier: number = 1): number {
  // R = 10^(0.5*M - 1.5) km, converted to meters
  return Math.pow(10, 0.5 * magnitude - 1.5) * multiplier * 1000;
}

// Función para la ley de Omori
export function omoriDecay(t: number, K: number, c: number, p: number): number {
  return K / Math.pow(c + t, p);
}

// Función para calcular la energía sísmica
export function calculateEnergy(magnitude: number): number {
  // E = 10^(1.5*M + 4.8) Joules
  return Math.pow(10, 1.5 * magnitude + 4.8);
}

// Función para Gutenberg-Richter
export function gutenbergRichter(magnitude: number, a: number, b: number): number {
  return a - b * magnitude;
}

// Generate mock earthquakes for demonstration
export function generateMockEarthquakes(count: number = 100) {
  const mockData = [];
  for (let i = 0; i < count; i++) {
    const lat = (Math.random() * 140) - 70;
    const lng = (Math.random() * 360) - 180;
    const magnitude = Math.random() * 8 + 1;
    const depth = Math.random() * 300;
    
    mockData.push({
      id: `mock-${i}`,
      magnitude,
      magnitudeType: 'Mw',
      place: 'Mock Location',
      time: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      updated: new Date(),
      url: 'https://earthquake.usgs.gov/',
      detail: '',
      felt: null,
      cdi: null,
      mmi: null,
      alert: null as const,
      status: 'reviewed' as const,
      tsunami: 0,
      sig: Math.floor(magnitude * 100),
      net: 'us',
      code: `${i}`,
      ids: `${i}`,
      sources: 'us',
      types: 'earthquake',
      coordinates: { lat, lng, depth },
      depth,
    });
  }
  return mockData;
}
