// Earthquake Types
export interface Earthquake {
  id: string;
  magnitude: number;
  magnitudeType: string;
  place: string;
  time: Date;
  updated: Date;
  url: string;
  detail: string;
  felt: number | null;
  cdi: number | null;
  mmi: number | null;
  alert: 'green' | 'yellow' | 'orange' | 'red' | null;
  status: 'automatic' | 'reviewed' | 'deleted';
  tsunami: number;
  sig: number;
  net: string;
  code: string;
  ids: string;
  sources: string;
  types: string;
  coordinates: Coordinates;
  depth: number;
}

export interface Coordinates {
  lat: number;
  lng: number;
  depth: number;
}

// USGS API Response Types
export interface USGSFeature {
  id: string;
  type: 'Feature';
  properties: {
    mag: number;
    place: string;
    time: number;
    updated: number;
    url: string;
    detail: string;
    felt?: number | null;
    cdi?: number | null;
    mmi?: number | null;
    alert?: 'green' | 'yellow' | 'orange' | 'red' | null;
    status: 'automatic' | 'reviewed' | 'deleted';
    tsunami: number;
    sig: number;
    net: string;
    code: string;
    ids: string;
    sources: string;
    types: string;
    nst?: number;
    dmin?: number;
    rms?: number;
    gap?: number;
    magType: string;
    type: string;
    title: string;
  };
  geometry: {
    type: 'Point';
    coordinates: [number, number, number]; // [lng, lat, depth]
  };
}

export interface USGSResponse {
  type: 'FeatureCollection';
  metadata: {
    generated: number;
    url: string;
    title: string;
    status: number;
    api: string;
    count: number;
  };
  features: USGSFeature[];
  bbox?: [number, number, number, number, number, number];
}

// Filter Types
export interface EarthquakeFilters {
  minMagnitude: number;
  maxMagnitude: number;
  startDate: Date | null;
  endDate: Date | null;
  minDepth: number;
  maxDepth: number;
  eventType: 'all' | 'earthquake' | 'quarry' | 'explosion' | 'other';
  country: string | null;
}

// Map Types
export interface MapState {
  center: [number, number];
  zoom: number;
  bounds: [[number, number], [number, number]] | null;
  activeLayer: 'osm' | 'satellite' | 'terrain';
  showHeatmap: boolean;
  showClusters: boolean;
  showBuffers: boolean;
}

export interface LayerConfig {
  id: string;
  name: string;
  visible: boolean;
  opacity: number;
  type: 'markers' | 'heatmap' | 'clusters' | 'buffer' | 'zones';
}

// Seismic Model Types
export interface BufferModelResult {
  earthquakeId: string;
  center: [number, number];
  radius: number;
  magnitude: number;
  affectedArea: number;
  estimatedPopulation: number;
}

export interface OmoriModelResult {
  time: number; // days since main shock
  rate: number;
  cumulativeCount: number;
  parameters: {
    K: number;
    c: number;
    p: number;
  };
}

export interface ETASModelResult {
  time: number;
  latitude: number;
  longitude: number;
  rate: number;
  backgroundRate: number;
  triggeredRate: number;
}

export interface SeismicModelConfig {
  type: 'buffer' | 'omori' | 'etas';
  mainShock?: Earthquake;
  parameters: {
    // Buffer
    bufferMultiplier?: number;
    // Omori
    K?: number;
    c?: number;
    p?: number;
    // ETAS
    alpha?: number;
    mu?: number;
    d?: number;
    q?: number;
  };
}

// Peru Types
export interface PeruSeismicZone {
  id: string;
  name: string;
  type: 'costa' | 'sierra' | 'selva';
  description: string;
  seismicityLevel: 'alta' | 'media' | 'baja';
  coordinates: {
    minLat: number;
    maxLat: number;
    minLng: number;
    maxLng: number;
  };
  characteristics: string[];
}

export interface PeruHistoricalEvent {
  id: string;
  name: string;
  date: string;
  year: number;
  magnitude: number;
  location: {
    lat: number;
    lng: number;
    region: string;
  };
  depth: number;
  deaths: number;
  injuries: number;
  damage: string;
  tsunami: boolean;
  tsunamiHeight?: number;
  description: string;
  source: string;
}

export interface PeruDepartmentStats {
  department: string;
  totalEvents: number;
  maxMagnitude: number;
  avgDepth: number;
  lastSignificantEvent: string;
  riskLevel: 'alto' | 'medio' | 'bajo';
}

export interface CoulombStressZone {
  id: string;
  name: string;
  coordinates: [number, number][];
  stressChange: number; // positive = increased stress
  probabilityChange: number;
  lastEvent: string;
  description: string;
}

// Narrative Types
export interface StoryChapter {
  id: string;
  title: string;
  description: string;
  center: [number, number];
  zoom: number;
  earthquakes: Earthquake[];
  layers: LayerConfig[];
  narrative: string;
  duration: number; // seconds
  transitions: StoryTransition[];
}

export interface StoryTransition {
  type: 'fly' | 'fade' | 'zoom';
  duration: number;
  targetCenter?: [number, number];
  targetZoom?: number;
}

export interface HistoricalEvent {
  id: string;
  name: string;
  date: Date;
  magnitude: number;
  location: {
    lat: number;
    lng: number;
    place: string;
  };
  deaths: number;
  description: string;
  significance: string;
  imageUrl?: string;
}

// Chart Data Types
export interface MagnitudeDistribution {
  range: string;
  count: number;
  percentage: number;
}

export interface FrequencyData {
  date: string;
  count: number;
  avgMagnitude: number;
}

export interface GutenbergRichterData {
  magnitude: number;
  logCount: number;
  actualCount: number;
  fittedValue: number;
}

export interface EnergyReleaseData {
  date: string;
  energy: number; // in Joules
  cumulative: number;
}

// Country Types
export interface Country {
  code: string;
  name: string;
  center: [number, number];
  zoom: number;
  bounds: [[number, number], [number, number]];
}

// API Response Types
export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: number;
}

// WebSocket Types
export interface RealtimeEarthquakeUpdate {
  type: 'new' | 'updated' | 'deleted';
  earthquake: Earthquake;
  timestamp: number;
}

// Stats Types
export interface EarthquakeStats {
  total: number;
  last24h: number;
  last7d: number;
  last30d: number;
  avgMagnitude: number;
  maxMagnitude: number;
  totalEnergy: number;
  byMagnitude: { range: string; count: number }[];
  byDepth: { range: string; count: number }[];
}

// Time Series Types
export interface TimeSeriesPoint {
  timestamp: number;
  value: number;
}

export interface SeismicTimeSeries {
  id: string;
  name: string;
  data: TimeSeriesPoint[];
  unit: string;
}

// Cluster Types
export interface EarthquakeCluster {
  id: string;
  center: [number, number];
  count: number;
  earthquakes: Earthquake[];
  maxMagnitude: number;
  avgDepth: number;
}

// Export Types
export interface ExportConfig {
  format: 'geojson' | 'csv' | 'kml';
  filters: EarthquakeFilters;
  includeFields: string[];
}
