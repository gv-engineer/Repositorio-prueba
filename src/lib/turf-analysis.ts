import * as turf from '@turf/turf';
import type { Earthquake, BufferModelResult } from '@/types';

/**
 * Create a buffer around a point
 */
export function createPointBuffer(
  lat: number,
  lng: number,
  radiusKm: number,
  steps: number = 64
): turf.Polygon {
  const point = turf.point([lng, lat]);
  const buffer = turf.buffer(point, radiusKm, { units: 'kilometers', steps });
  
  if (!buffer) {
    throw new Error('Failed to create buffer');
  }
  
  return buffer.geometry as turf.Polygon;
}

/**
 * Create buffers for multiple earthquakes
 */
export function createEarthquakeBuffers(
  earthquakes: Earthquake[],
  magnitudeThreshold: number = 4.0,
  radiusMultiplier: number = 1
): turf.FeatureCollection<turf.Polygon> {
  const features: turf.Feature<turf.Polygon>[] = earthquakes
    .filter(eq => eq.magnitude >= magnitudeThreshold)
    .map(eq => {
      const radius = Math.pow(10, 0.5 * eq.magnitude - 1.5) * radiusMultiplier;
      const buffer = createPointBuffer(eq.coordinates.lat, eq.coordinates.lng, radius);
      
      return turf.feature(buffer, {
        id: eq.id,
        magnitude: eq.magnitude,
        radius,
        time: eq.time.toISOString(),
        place: eq.place,
      });
    });

  return turf.featureCollection(features);
}

/**
 * Check if a point is within a buffer
 */
export function isPointInBuffer(
  lat: number,
  lng: number,
  buffer: turf.Polygon
): boolean {
  const point = turf.point([lng, lat]);
  const polygon = turf.polygon(buffer.coordinates);
  return turf.booleanPointInPolygon(point, polygon);
}

/**
 * Find all earthquakes within a buffer
 */
export function findEarthquakesInBuffer(
  earthquakes: Earthquake[],
  centerLat: number,
  centerLng: number,
  radiusKm: number
): Earthquake[] {
  const center = turf.point([centerLng, centerLat]);
  
  return earthquakes.filter(eq => {
    const point = turf.point([eq.coordinates.lng, eq.coordinates.lat]);
    const distance = turf.distance(center, point, { units: 'kilometers' });
    return distance <= radiusKm;
  });
}

/**
 * Calculate distance between two earthquakes
 */
export function distanceBetweenEarthquakes(
  eq1: Earthquake,
  eq2: Earthquake,
  unit: 'kilometers' | 'miles' = 'kilometers'
): number {
  const point1 = turf.point([eq1.coordinates.lng, eq1.coordinates.lat]);
  const point2 = turf.point([eq2.coordinates.lng, eq2.coordinates.lat]);
  
  return turf.distance(point1, point2, { units: unit });
}

/**
 * Find nearest earthquake to a point
 */
export function findNearestEarthquake(
  earthquakes: Earthquake[],
  lat: number,
  lng: number
): { earthquake: Earthquake; distance: number } | null {
  if (earthquakes.length === 0) return null;

  const targetPoint = turf.point([lng, lat]);
  let nearest: Earthquake | null = null;
  let minDistance = Infinity;

  for (const eq of earthquakes) {
    const point = turf.point([eq.coordinates.lng, eq.coordinates.lat]);
    const distance = turf.distance(targetPoint, point, { units: 'kilometers' });
    
    if (distance < minDistance) {
      minDistance = distance;
      nearest = eq;
    }
  }

  return nearest ? { earthquake: nearest, distance: minDistance } : null;
}

/**
 * Create a heatmap grid from earthquake points
 */
export function createHeatmapGrid(
  earthquakes: Earthquake[],
  bounds: { minLat: number; maxLat: number; minLng: number; maxLng: number },
  cellSizeKm: number = 50
): { lat: number; lng: number; count: number; intensity: number }[][] {
  const cellSizeDeg = cellSizeKm / 111; // Approximate degrees
  const latSteps = Math.ceil((bounds.maxLat - bounds.minLat) / cellSizeDeg);
  const lngSteps = Math.ceil((bounds.maxLng - bounds.minLng) / cellSizeDeg);

  const grid: { lat: number; lng: number; count: number; intensity: number }[][] = [];

  for (let i = 0; i < latSteps; i++) {
    const row: { lat: number; lng: number; count: number; intensity: number }[] = [];
    const lat = bounds.minLat + (i + 0.5) * cellSizeDeg;

    for (let j = 0; j < lngSteps; j++) {
      const lng = bounds.minLng + (j + 0.5) * cellSizeDeg;
      const cellCenter = turf.point([lng, lat]);
      
      let count = 0;
      let intensity = 0;

      for (const eq of earthquakes) {
        const point = turf.point([eq.coordinates.lng, eq.coordinates.lat]);
        const distance = turf.distance(cellCenter, point, { units: 'kilometers' });
        
        if (distance <= cellSizeKm) {
          count++;
          intensity += eq.magnitude;
        }
      }

      row.push({ lat, lng, count, intensity });
    }

    grid.push(row);
  }

  return grid;
}

/**
 * Cluster earthquakes by proximity
 */
export function clusterEarthquakes(
  earthquakes: Earthquake[],
  maxDistanceKm: number = 50
): Map<number, Earthquake[]> {
  const visited = new Set<string>();
  const clusters = new Map<number, Earthquake[]>();
  let clusterId = 0;

  for (const eq of earthquakes) {
    if (visited.has(eq.id)) continue;

    const cluster: Earthquake[] = [eq];
    visited.add(eq.id);

    for (const other of earthquakes) {
      if (visited.has(other.id)) continue;

      const distance = distanceBetweenEarthquakes(eq, other);
      if (distance <= maxDistanceKm) {
        cluster.push(other);
        visited.add(other.id);
      }
    }

    clusters.set(clusterId++, cluster);
  }

  return clusters;
}

/**
 * Calculate convex hull of earthquake points
 */
export function calculateConvexHull(
  earthquakes: Earthquake[]
): turf.Polygon | null {
  if (earthquakes.length < 3) return null;

  const points = earthquakes.map(eq => 
    turf.point([eq.coordinates.lng, eq.coordinates.lat])
  );
  const featureCollection = turf.featureCollection(points);
  
  try {
    const hull = turf.convex(featureCollection);
    return hull?.geometry as turf.Polygon || null;
  } catch {
    return null;
  }
}

/**
 * Calculate centroid of earthquake distribution
 */
export function calculateCentroid(
  earthquakes: Earthquake[]
): { lat: number; lng: number } | null {
  if (earthquakes.length === 0) return null;

  const points = earthquakes.map(eq => 
    turf.point([eq.coordinates.lng, eq.coordinates.lat])
  );
  const featureCollection = turf.featureCollection(points);
  const centroid = turf.centroid(featureCollection);

  return {
    lng: centroid.geometry.coordinates[0],
    lat: centroid.geometry.coordinates[1],
  };
}

/**
 * Calculate area affected by earthquakes
 */
export function calculateAffectedArea(
  earthquakes: Earthquake[],
  magnitudeThreshold: number = 5.0
): number {
  const buffers = createEarthquakeBuffers(earthquakes, magnitudeThreshold);
  
  if (buffers.features.length === 0) return 0;

  // Union all buffers
  let union: turf.Feature<turf.Polygon | turf.MultiPolygon> | null = null;
  
  for (const feature of buffers.features) {
    if (!union) {
      union = feature;
    } else {
      try {
        const result = turf.union(union, feature);
        if (result) union = result;
      } catch {
        // Skip invalid unions
      }
    }
  }

  if (!union) return 0;

  return turf.area(union) / 1_000_000; // Convert to km²
}

/**
 * Generate points along a line (for subduction zone visualization)
 */
export function generatePointsAlongLine(
  coordinates: [number, number][],
  intervalKm: number = 100
): { lat: number; lng: number }[] {
  const line = turf.lineString(coordinates.map(c => [c[1], c[0]]));
  const length = turf.length(line, { units: 'kilometers' });
  const points: { lat: number; lng: number }[] = [];

  for (let distance = 0; distance <= length; distance += intervalKm) {
    const point = turf.along(line, distance, { units: 'kilometers' });
    points.push({
      lng: point.geometry.coordinates[0],
      lat: point.geometry.coordinates[1],
    });
  }

  return points;
}

/**
 * Spatial join - find earthquakes within polygon
 */
export function spatialJoinEarthquakes(
  earthquakes: Earthquake[],
  polygon: turf.Polygon
): Earthquake[] {
  return earthquakes.filter(eq => {
    const point = turf.point([eq.coordinates.lng, eq.coordinates.lat]);
    return turf.booleanPointInPolygon(point, polygon);
  });
}

/**
 * Calculate earthquake density per unit area
 */
export function calculateDensity(
  earthquakes: Earthquake[],
  bounds: { minLat: number; maxLat: number; minLng: number; maxLng: number }
): number {
  const polygon = turf.polygon([[
    [bounds.minLng, bounds.minLat],
    [bounds.maxLng, bounds.minLat],
    [bounds.maxLng, bounds.maxLat],
    [bounds.minLng, bounds.maxLat],
    [bounds.minLng, bounds.minLat],
  ]]);

  const area = turf.area(polygon) / 1_000_000; // km²
  const count = spatialJoinEarthquakes(earthquakes, polygon.geometry as turf.Polygon).length;

  return count / area; // earthquakes per km²
}

/**
 * Create Voronoi diagram from earthquake points
 */
export function createVoronoiDiagram(
  earthquakes: Earthquake[],
  bounds: { minLat: number; maxLat: number; minLng: number; maxLng: number }
): turf.FeatureCollection<turf.Polygon> | null {
  if (earthquakes.length < 3) return null;

  const points = earthquakes.map(eq => 
    turf.point([eq.coordinates.lng, eq.coordinates.lat], { id: eq.id, magnitude: eq.magnitude })
  );

  const bbox: turf.BBox = [bounds.minLng, bounds.minLat, bounds.maxLng, bounds.maxLat];

  try {
    const voronoi = turf.voronoi(turf.featureCollection(points), { bbox });
    return voronoi as turf.FeatureCollection<turf.Polygon>;
  } catch {
    return null;
  }
}
