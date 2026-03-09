import { create } from 'zustand';
import type { Earthquake, EarthquakeFilters, MapState, LayerConfig } from '@/types';

interface EarthquakeState {
  earthquakes: Earthquake[];
  filteredEarthquakes: Earthquake[];
  selectedEarthquake: Earthquake | null;
  loading: boolean;
  error: string | null;
  filters: EarthquakeFilters;
  
  // Actions
  setEarthquakes: (earthquakes: Earthquake[]) => void;
  setFilteredEarthquakes: (earthquakes: Earthquake[]) => void;
  setSelectedEarthquake: (earthquake: Earthquake | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setFilters: (filters: Partial<EarthquakeFilters>) => void;
  resetFilters: () => void;
}

const defaultFilters: EarthquakeFilters = {
  minMagnitude: 0,
  maxMagnitude: 10,
  startDate: null,
  endDate: null,
  minDepth: 0,
  maxDepth: 700,
  eventType: 'all',
  country: null,
};

export const useEarthquakeStore = create<EarthquakeState>((set) => ({
  earthquakes: [],
  filteredEarthquakes: [],
  selectedEarthquake: null,
  loading: false,
  error: null,
  filters: defaultFilters,
  
  setEarthquakes: (earthquakes) => set({ earthquakes }),
  setFilteredEarthquakes: (filteredEarthquakes) => set({ filteredEarthquakes }),
  setSelectedEarthquake: (selectedEarthquake) => set({ selectedEarthquake }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setFilters: (newFilters) => set((state) => ({
    filters: { ...state.filters, ...newFilters },
  })),
  resetFilters: () => set({ filters: defaultFilters }),
}));

interface MapStoreState {
  mapState: MapState;
  layers: LayerConfig[];
  showPeruModule: boolean;
  
  // Actions
  setMapCenter: (center: [number, number]) => void;
  setMapZoom: (zoom: number) => void;
  setMapBounds: (bounds: [[number, number], [number, number]] | null) => void;
  setActiveLayer: (layer: 'osm' | 'satellite' | 'terrain') => void;
  toggleHeatmap: () => void;
  toggleClusters: () => void;
  toggleBuffers: () => void;
  toggleLayer: (layerId: string) => void;
  setLayerOpacity: (layerId: string, opacity: number) => void;
  setShowPeruModule: (show: boolean) => void;
}

const defaultLayers: LayerConfig[] = [
  { id: 'markers', name: 'Marcadores', visible: true, opacity: 1, type: 'markers' },
  { id: 'heatmap', name: 'Mapa de Calor', visible: false, opacity: 0.7, type: 'heatmap' },
  { id: 'clusters', name: 'Clusters', visible: true, opacity: 1, type: 'clusters' },
  { id: 'buffer', name: 'Buffer Espacial', visible: false, opacity: 0.5, type: 'buffer' },
  { id: 'zones', name: 'Zonas Sísmicas', visible: false, opacity: 0.4, type: 'zones' },
];

export const useMapStore = create<MapStoreState>((set) => ({
  mapState: {
    center: [0, 0],
    zoom: 2,
    bounds: null,
    activeLayer: 'osm',
    showHeatmap: false,
    showClusters: true,
    showBuffers: false,
  },
  layers: defaultLayers,
  showPeruModule: false,
  
  setMapCenter: (center) => set((state) => ({
    mapState: { ...state.mapState, center },
  })),
  setMapZoom: (zoom) => set((state) => ({
    mapState: { ...state.mapState, zoom },
  })),
  setMapBounds: (bounds) => set((state) => ({
    mapState: { ...state.mapState, bounds },
  })),
  setActiveLayer: (activeLayer) => set((state) => ({
    mapState: { ...state.mapState, activeLayer },
  })),
  toggleHeatmap: () => set((state) => ({
    mapState: { ...state.mapState, showHeatmap: !state.mapState.showHeatmap },
  })),
  toggleClusters: () => set((state) => ({
    mapState: { ...state.mapState, showClusters: !state.mapState.showClusters },
  })),
  toggleBuffers: () => set((state) => ({
    mapState: { ...state.mapState, showBuffers: !state.mapState.showBuffers },
  })),
  toggleLayer: (layerId) => set((state) => ({
    layers: state.layers.map((layer) =>
      layer.id === layerId ? { ...layer, visible: !layer.visible } : layer
    ),
  })),
  setLayerOpacity: (layerId, opacity) => set((state) => ({
    layers: state.layers.map((layer) =>
      layer.id === layerId ? { ...layer, opacity } : layer
    ),
  })),
  setShowPeruModule: (showPeruModule) => set({ showPeruModule }),
}));

interface ModelStoreState {
  activeModel: 'none' | 'buffer' | 'omori' | 'etas';
  modelParams: {
    bufferMultiplier: number;
    magnitudeThreshold: number;
    omoriK: number;
    omoriC: number;
    omoriP: number;
    etasMu: number;
    etasAlpha: number;
  };
  selectedMainShock: Earthquake | null;
  
  // Actions
  setActiveModel: (model: 'none' | 'buffer' | 'omori' | 'etas') => void;
  setModelParams: (params: Partial<ModelStoreState['modelParams']>) => void;
  setSelectedMainShock: (earthquake: Earthquake | null) => void;
}

export const useModelStore = create<ModelStoreState>((set) => ({
  activeModel: 'none',
  modelParams: {
    bufferMultiplier: 1,
    magnitudeThreshold: 4.0,
    omoriK: 10,
    omoriC: 0.1,
    omoriP: 1.0,
    etasMu: 0.1,
    etasAlpha: 2.0,
  },
  selectedMainShock: null,
  
  setActiveModel: (activeModel) => set({ activeModel }),
  setModelParams: (params) => set((state) => ({
    modelParams: { ...state.modelParams, ...params },
  })),
  setSelectedMainShock: (selectedMainShock) => set({ selectedMainShock }),
}));

interface StoryStoreState {
  activeStory: string | null;
  currentChapter: number;
  isPlaying: boolean;
  playbackSpeed: number;
  
  // Actions
  setActiveStory: (storyId: string | null) => void;
  setCurrentChapter: (chapter: number) => void;
  nextChapter: () => void;
  prevChapter: () => void;
  togglePlayback: () => void;
  setPlaybackSpeed: (speed: number) => void;
}

export const useStoryStore = create<StoryStoreState>((set) => ({
  activeStory: null,
  currentChapter: 0,
  isPlaying: false,
  playbackSpeed: 1,
  
  setActiveStory: (activeStory) => set({ activeStory, currentChapter: 0 }),
  setCurrentChapter: (currentChapter) => set({ currentChapter }),
  nextChapter: () => set((state) => ({ currentChapter: state.currentChapter + 1 })),
  prevChapter: () => set((state) => ({ currentChapter: Math.max(0, state.currentChapter - 1) })),
  togglePlayback: () => set((state) => ({ isPlaying: !state.isPlaying })),
  setPlaybackSpeed: (playbackSpeed) => set({ playbackSpeed }),
}));

interface ComparisonStoreState {
  isEnabled: boolean;
  period1Start: Date;
  period1End: Date;
  period2Start: Date;
  period2End: Date;
  syncMaps: boolean;
  
  // Actions
  toggleComparison: () => void;
  setPeriod1: (start: Date, end: Date) => void;
  setPeriod2: (start: Date, end: Date) => void;
  toggleSyncMaps: () => void;
}

const thirtyDaysAgo = new Date();
thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

const sixtyDaysAgo = new Date();
sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

const ninetyDaysAgo = new Date();
ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

export const useComparisonStore = create<ComparisonStoreState>((set) => ({
  isEnabled: false,
  period1Start: thirtyDaysAgo,
  period1End: new Date(),
  period2Start: ninetyDaysAgo,
  period2End: sixtyDaysAgo,
  syncMaps: true,
  
  toggleComparison: () => set((state) => ({ isEnabled: !state.isEnabled })),
  setPeriod1: (period1Start, period1End) => set({ period1Start, period1End }),
  setPeriod2: (period2Start, period2End) => set({ period2Start, period2End }),
  toggleSyncMaps: () => set((state) => ({ syncMaps: !state.syncMaps })),
}));

interface UIStoreState {
  sidebarOpen: boolean;
  activeTab: 'filters' | 'layers' | 'models' | 'story' | 'peru';
  showStats: boolean;
  showLegend: boolean;
  
  // Actions
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setActiveTab: (tab: UIStoreState['activeTab']) => void;
  toggleStats: () => void;
  toggleLegend: () => void;
}

export const useUIStore = create<UIStoreState>((set) => ({
  sidebarOpen: true,
  activeTab: 'filters',
  showStats: true,
  showLegend: true,
  
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  setActiveTab: (activeTab) => set({ activeTab }),
  toggleStats: () => set((state) => ({ showStats: !state.showStats })),
  toggleLegend: () => set((state) => ({ showLegend: !state.showLegend })),
}));
