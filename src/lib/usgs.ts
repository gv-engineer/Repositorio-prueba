import type { Earthquake, USGSFeature, USGSResponse, EarthquakeFilters } from '@/types';

const USGS_BASE_URL = 'https://earthquake.usgs.gov/fdsnws/event/1/query';
const USGS_FEED_URL = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary';

export function parseUSGSFeature(feature: USGSFeature): Earthquake {
  const [lng, lat, depth] = feature.geometry.coordinates;
  
  return {
    id: feature.id,
    magnitude: feature.properties.mag ?? 0,
    magnitudeType: feature.properties.magType,
    place: feature.properties.place ?? 'Unknown location',
    time: new Date(feature.properties.time),
    updated: new Date(feature.properties.updated),
    url: feature.properties.url,
    detail: feature.properties.detail,
    felt: feature.properties.felt ?? null,
    cdi: feature.properties.cdi ?? null,
    mmi: feature.properties.mmi ?? null,
    alert: feature.properties.alert ?? null,
    status: feature.properties.status,
    tsunami: feature.properties.tsunami,
    sig: feature.properties.sig,
    net: feature.properties.net,
    code: feature.properties.code,
    ids: feature.properties.ids,
    sources: feature.properties.sources,
    types: feature.properties.types,
    coordinates: { lat, lng, depth },
    depth: depth,
  };
}

export async function fetchEarthquakes(filters: Partial<EarthquakeFilters> = {}): Promise<Earthquake[]> {
  const params = new URLSearchParams({
    format: 'geojson',
    orderby: 'time',
  });

  if (filters.startDate) {
    params.set('starttime', filters.startDate.toISOString().split('T')[0]);
  } else {
    // Default to last 30 days
    const defaultStart = new Date();
    defaultStart.setDate(defaultStart.getDate() - 30);
    params.set('starttime', defaultStart.toISOString().split('T')[0]);
  }

  if (filters.endDate) {
    params.set('endtime', filters.endDate.toISOString().split('T')[0]);
  }

  if (filters.minMagnitude !== undefined) {
    params.set('minmagnitude', filters.minMagnitude.toString());
  }

  if (filters.maxMagnitude !== undefined) {
    params.set('maxmagnitude', filters.maxMagnitude.toString());
  }

  if (filters.minDepth !== undefined) {
    params.set('mindepth', filters.minDepth.toString());
  }

  if (filters.maxDepth !== undefined) {
    params.set('maxdepth', filters.maxDepth.toString());
  }

  if (filters.eventType && filters.eventType !== 'all') {
    params.set('eventtype', filters.eventType);
  }

  params.set('limit', '20000');

  const response = await fetch(`${USGS_BASE_URL}?${params.toString()}`);
  
  if (!response.ok) {
    throw new Error(`USGS API error: ${response.status} ${response.statusText}`);
  }

  const data: USGSResponse = await response.json();
  return data.features.map(parseUSGSFeature);
}

export async function fetchRealtimeFeed(type: 'all_day' | 'all_week' | '4.5_week' | 'significant_month' = 'all_day'): Promise<Earthquake[]> {
  const response = await fetch(`${USGS_FEED_URL}/${type}.geojson`);
  
  if (!response.ok) {
    throw new Error(`USGS Feed error: ${response.status} ${response.statusText}`);
  }

  const data: USGSResponse = await response.json();
  return data.features.map(parseUSGSFeature);
}

export async function fetchEarthquakeById(id: string): Promise<Earthquake | null> {
  const response = await fetch(`${USGS_BASE_URL}?format=geojson&eventid=${id}`);
  
  if (!response.ok) {
    return null;
  }

  const data: USGSResponse = await response.json();
  if (data.features.length === 0) {
    return null;
  }

  return parseUSGSFeature(data.features[0]);
}

export async function fetchEarthquakesByBounds(
  minLat: number,
  maxLat: number,
  minLng: number,
  maxLng: number,
  filters: Partial<EarthquakeFilters> = {}
): Promise<Earthquake[]> {
  const params = new URLSearchParams({
    format: 'geojson',
    orderby: 'time',
    minlatitude: minLat.toString(),
    maxlatitude: maxLat.toString(),
    minlongitude: minLng.toString(),
    maxlongitude: maxLng.toString(),
  });

  if (filters.startDate) {
    params.set('starttime', filters.startDate.toISOString().split('T')[0]);
  }

  if (filters.endDate) {
    params.set('endtime', filters.endDate.toISOString().split('T')[0]);
  }

  if (filters.minMagnitude !== undefined) {
    params.set('minmagnitude', filters.minMagnitude.toString());
  }

  const response = await fetch(`${USGS_BASE_URL}?${params.toString()}`);
  
  if (!response.ok) {
    throw new Error(`USGS API error: ${response.status}`);
  }

  const data: USGSResponse = await response.json();
  return data.features.map(parseUSGSFeature);
}

// Country bounding boxes for quick filtering
export const COUNTRY_BOUNDS: Record<string, { bounds: [[number, number], [number, number]]; center: [number, number]; zoom: number }> = {
  peru: {
    bounds: [[-18.5, -81.5], [-0.5, -68.5]],
    center: [-9.19, -75.02],
    zoom: 5,
  },
  chile: {
    bounds: [[-56.0, -76.0], [-17.5, -66.0]],
    center: [-35.68, -71.54],
    zoom: 4,
  },
  japan: {
    bounds: [[30.0, 129.0], [46.0, 146.0]],
    center: [36.20, 138.25],
    zoom: 5,
  },
  usa: {
    bounds: [[24.0, -125.0], [49.0, -66.0]],
    center: [39.83, -98.58],
    zoom: 4,
  },
  indonesia: {
    bounds: [[-11.0, 95.0], [6.0, 141.0]],
    center: [-0.79, 113.92],
    zoom: 4,
  },
  mexico: {
    bounds: [[14.5, -118.5], [32.5, -86.5]],
    center: [23.63, -102.55],
    zoom: 4,
  },
  turkey: {
    bounds: [[35.8, 26.0], [42.1, 44.8]],
    center: [39.0, 35.0],
    zoom: 5,
  },
  newZealand: {
    bounds: [[-47.0, 165.0], [-34.0, 179.0]],
    center: [-40.90, 174.89],
    zoom: 5,
  },
  italy: {
    bounds: [[36.5, 6.5], [47.1, 18.5]],
    center: [41.87, 12.57],
    zoom: 5,
  },
  greece: {
    bounds: [[34.8, 19.3], [41.8, 28.3]],
    center: [39.07, 21.82],
    zoom: 5,
  },
  world: {
    bounds: [[-85.0, -180.0], [85.0, 180.0]],
    center: [0, 0],
    zoom: 2,
  },
};

export function getCountryConfig(country: string) {
  return COUNTRY_BOUNDS[country.toLowerCase()] || COUNTRY_BOUNDS.world;
}
