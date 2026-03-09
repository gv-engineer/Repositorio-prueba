'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { format, subDays } from 'date-fns';
import dynamic from 'next/dynamic';
import { 
  Globe, Map, Layers, Filter, Play, Pause, ChevronLeft, ChevronRight,
  Activity, AlertTriangle, X, Clock, Thermometer, Database, BarChart3, Target,
  Flag, BookOpen, GitCompare, RefreshCw
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

import type { Earthquake, EarthquakeFilters, MapState } from '@/types';
import { COUNTRY_BOUNDS } from '@/lib/usgs';
import { PERU_HISTORICAL_EVENTS, PERU_SEISMIC_ZONES } from '@/lib/peru-data';
import { getMagnitudeColor, useIsClient } from '@/hooks/useMapState';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Dynamic import for Map component (SSR safe)
const MapComponent = dynamic(() => import('@/components/Map/MapComponent'), { 
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-slate-900 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-400">Loading map...</p>
      </div>
    </div>
  )
});

// Mode types
type AppMode = 'global' | 'peru' | 'story' | 'compare' | 'models';
type ActiveModel = 'buffer' | 'omori' | 'etas' | null;

// Historical events for story mode
const GLOBAL_HISTORICAL_EVENTS = [
  { id: '1906-sf', name: 'San Francisco 1906', lat: 37.75, lng: -122.55, magnitude: 7.9, year: 1906, deaths: 3000, description: 'Devastating earthquake that destroyed 80% of San Francisco.' },
  { id: '1960-chile', name: 'Valdivia, Chile 1960', lat: -39.8, lng: -73.2, magnitude: 9.5, year: 1960, deaths: 6000, description: 'Most powerful earthquake ever recorded.' },
  { id: '2004-sumatra', name: 'Sumatra 2004', lat: 3.3, lng: 95.8, magnitude: 9.1, year: 2004, deaths: 227898, description: 'Deadliest tsunami in history.' },
  { id: '2011-japan', name: 'Tohoku, Japan 2011', lat: 38.3, lng: 142.4, magnitude: 9.0, year: 2011, deaths: 15894, description: 'Fukushima nuclear disaster.' },
  { id: '2015-nepal', name: 'Nepal 2015', lat: 28.1, lng: 84.6, magnitude: 7.8, year: 2015, deaths: 8964, description: 'Devastating earthquake in Kathmandu.' },
  { id: '2023-turkey', name: 'Turkey-Syria 2023', lat: 37.2, lng: 37.0, magnitude: 7.8, year: 2023, deaths: 59000, description: 'Deadliest earthquake of the decade.' },
];

// Country list
const COUNTRIES = [
  { code: 'world', name: 'Global View', flag: '🌍' },
  { code: 'peru', name: 'Perú', flag: '🇵🇪' },
  { code: 'chile', name: 'Chile', flag: '🇨🇱' },
  { code: 'japan', name: 'Japan', flag: '🇯🇵' },
  { code: 'usa', name: 'USA', flag: '🇺🇸' },
  { code: 'indonesia', name: 'Indonesia', flag: '🇮🇩' },
  { code: 'mexico', name: 'Mexico', flag: '🇲🇽' },
];

export default function WebGISPlatform() {
  const isClient = useIsClient();
  
  // State
  const [mode, setMode] = useState<AppMode>('global');
  const [activeModel, setActiveModel] = useState<ActiveModel>(null);
  const [earthquakes, setEarthquakes] = useState<Earthquake[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEarthquake, setSelectedEarthquake] = useState<Earthquake | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [rightPanelOpen, setRightPanelOpen] = useState(false);
  
  // Filters
  const [filters, setFilters] = useState<EarthquakeFilters>({
    minMagnitude: 0,
    maxMagnitude: 10,
    startDate: subDays(new Date(), 30),
    endDate: new Date(),
    minDepth: 0,
    maxDepth: 700,
    eventType: 'all',
    country: null,
  });
  
  // Map state
  const [mapState, setMapState] = useState<MapState>({
    center: [0, 0],
    zoom: 2,
    bounds: null,
    activeLayer: 'osm',
    showHeatmap: false,
    showClusters: true,
    showBuffers: false,
  });
  
  // Story mode state
  const [storyIndex, setStoryIndex] = useState(0);
  const [storyPlaying, setStoryPlaying] = useState(false);
  const storyEvents = mode === 'peru' ? PERU_HISTORICAL_EVENTS : GLOBAL_HISTORICAL_EVENTS;
  const storyIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Model state
  const [modelParams, setModelParams] = useState({
    bufferMultiplier: 1,
    omoriK: 10,
    omoriC: 0.1,
    omoriP: 1.0,
  });
  
  // Fetch earthquakes
  const fetchEarthquakes = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams();
      params.set('minMagnitude', filters.minMagnitude.toString());
      if (filters.startDate) params.set('startDate', filters.startDate.toISOString());
      if (filters.endDate) params.set('endDate', filters.endDate.toISOString());
      
      const response = await fetch(`/api/earthquakes?${params.toString()}`);
      const data = await response.json();
      
      if (data.success) {
        setEarthquakes(data.data);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch earthquakes');
    } finally {
      setLoading(false);
    }
  }, [filters]);
  
  useEffect(() => {
    fetchEarthquakes();
  }, [fetchEarthquakes]);
  
  // Story mode auto-play
  useEffect(() => {
    if (storyPlaying && mode === 'story') {
      storyIntervalRef.current = setInterval(() => {
        setStoryIndex(prev => (prev + 1) % storyEvents.length);
      }, 5000);
    }
    return () => {
      if (storyIntervalRef.current) clearInterval(storyIntervalRef.current);
    };
  }, [storyPlaying, mode, storyEvents.length]);
  
  // Country change handler
  const handleCountryChange = (countryCode: string) => {
    const config = COUNTRY_BOUNDS[countryCode] || COUNTRY_BOUNDS.world;
    setMapState(prev => ({
      ...prev,
      center: config.center,
      zoom: config.zoom,
    }));
    if (countryCode === 'peru') setMode('peru');
    else setMode('global');
    setFilters(prev => ({ ...prev, country: countryCode }));
  };
  
  // Statistics
 const stats = useMemo(() => ({
    total: earthquakes.length,
    last24h: earthquakes.filter(eq => (Date.now() - new Date(eq.time).getTime()) / (1000 * 60 * 60) <= 24).length,
    last7d: earthquakes.filter(eq => (Date.now() - new Date(eq.time).getTime()) / (1000 * 60 * 60 * 24) <= 7).length,
    avgMagnitude: earthquakes.length > 0 ? (earthquakes.reduce((sum, eq) => sum + eq.magnitude, 0) / earthquakes.length).toFixed(2) : '0',
    maxMagnitude: earthquakes.length > 0 ? Math.max(...earthquakes.map(eq => eq.magnitude)).toFixed(1) : '0',
  }), [earthquakes]);
  
  // Chart data
const magnitudeDistribution = useMemo(() => {
    const ranges = [
      { min: 0, max: 2, label: '0-2', color: '#10b981' },
      { min: 2, max: 3, label: '2-3', color: '#34d399' },
      { min: 3, max: 4, label: '3-4', color: '#6ee7b7' },
      { min: 4, max: 5, label: '4-5', color: '#fcd34d' },
      { min: 5, max: 6, label: '5-6', color: '#fbbf24' },
      { min: 6, max: 7, label: '6-7', color: '#f59e0b' },
      { min: 7, max: 8, label: '7-8', color: '#f97316' },
      { min: 8, max: 10, label: '8+', color: '#ef4444' },
    ];
    
    const dataWithLabels = ranges
      .map(r => ({
        label: r.label,
        count: earthquakes.filter(eq => eq.magnitude >= r.min && eq.magnitude < r.max).length,
        color: r.color
      }))
      .filter(d => d.count > 0);
    
    return {
      labels: dataWithLabels.map(d => d.label),
      datasets: [{
        data: dataWithLabels.map(d => d.count),
        backgroundColor: dataWithLabels.map(d => d.color),
        borderRadius: 4,
      }]
    };
  }, [earthquakes]);
  
  const timeSeriesData = useMemo(() => ({
    labels: Array.from({ length: 30 }, (_, i) => format(subDays(new Date(), 29 - i), 'MMM dd')),
    datasets: [{
      data: Array.from({ length: 30 }, (_, i) => {
        const date = subDays(new Date(), 29 - i);
        return earthquakes.filter(eq => new Date(eq.time).toDateString() === date.toDateString()).length;
      }),
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      fill: true,
      tension: 0.4,
    }]
  }), [earthquakes]);
  
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { color: 'rgba(255, 255, 255, 0.1)' }, ticks: { color: '#94a3b8' } },
      y: { grid: { color: 'rgba(255, 255, 255, 0.1)' }, ticks: { color: '#94a3b8' } },
    },
  };

  // Get story center
  const storyCenter = useMemo((): [number, number] | undefined => {
    if (mode !== 'story') return undefined;
    const event = storyEvents[storyIndex];
    if (!event) return undefined;
    const lat = 'lat' in event ? event.lat : event.location.lat;
    const lng = 'lng' in event ? event.lng : event.location.lng;
    return [lat, lng];
  }, [mode, storyEvents, storyIndex]);

  // Omori chart data
  const omoriData = useMemo(() => {
    if (activeModel !== 'omori' || !selectedEarthquake) return null;
    const K = modelParams.omoriK * Math.pow(10, 0.5 * selectedEarthquake.magnitude - 1);
    return {
      labels: Array.from({ length: 90 }, (_, i) => `Day ${i + 1}`),
      datasets: [{
        data: Array.from({ length: 90 }, (_, i) => K / Math.pow(modelParams.omoriC + i + 1, modelParams.omoriP)),
        borderColor: '#f59e0b',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        fill: true,
        tension: 0.4,
      }]
    };
  }, [activeModel, selectedEarthquake, modelParams]);

  // ETAS model data for chart - shows probability of aftershocks over distance
  const etasData = useMemo(() => {
    if (activeModel !== 'etas' || !selectedEarthquake) return null;
    const M = selectedEarthquake.magnitude;
    // ETAS parameters
    const mu = 0.1; // background rate
    const K = 0.01;
    const alpha = 2.0;
    const c = 0.01;
    const p = 1.0;
    
    // Calculate triggered rate at different distances
    const distances = [10, 20, 30, 50, 75, 100, 150, 200];
    const rates = distances.map(d => {
      const triggeredRate = (K * Math.exp(alpha * M)) / Math.pow(d * d + 100, 1.5);
      return mu + triggeredRate;
    });
    
    return {
      labels: distances.map(d => `${d} km`),
      datasets: [{
        label: 'Tasa de actividad',
        data: rates,
        borderColor: '#8b5cf6',
        backgroundColor: 'rgba(139, 92, 246, 0.2)',
        fill: true,
        tension: 0.4,
      }]
    };
  }, [activeModel, selectedEarthquake]);

  if (!isClient) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading WebGIS Platform...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-slate-800/90 backdrop-blur-sm border-b border-slate-700 px-4 py-2 z-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Globe className="w-8 h-8 text-blue-500" />
              <div>
                <h1 className="text-lg font-bold">WebGIS Sísmico</h1>
                <p className="text-xs text-slate-400">Plataforma Multimodelo de Análisis Espacio-Temporal</p>
              </div>
            </div>
            
            {/* Mode Tabs */}
            <div className="flex items-center bg-slate-700/50 rounded-lg p-1 ml-4">
              {[
                { id: 'global', icon: Globe, label: 'Global' },
                { id: 'peru', icon: Flag, label: 'Perú' },
                { id: 'story', icon: BookOpen, label: 'Story' },
                { id: 'compare', icon: GitCompare, label: 'Compare' },
                { id: 'models', icon: Activity, label: 'Models' },
              ].map(m => (
                <button
                  key={m.id}
                  onClick={() => setMode(m.id as AppMode)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                    mode === m.id ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-600/50'
                  }`}
                >
                  <m.icon className="w-4 h-4" />
                  {m.label}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <select
              value={filters.country || 'world'}
              onChange={(e) => handleCountryChange(e.target.value)}
              className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.flag} {c.name}</option>)}
            </select>
            
            <div className="flex items-center gap-2 text-xs">
              <span className="bg-red-500/20 text-red-400 px-2 py-1 rounded-full">{stats.last24h} / 24h</span>
              <span className="bg-orange-500/20 text-orange-400 px-2 py-1 rounded-full">{stats.last7d} / 7d</span>
              <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full">{stats.total} total</span>
            </div>
            
            <button onClick={fetchEarthquakes} disabled={loading} className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 transition-colors">
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <div className="flex-1 flex relative">
        {/* Left Sidebar */}
        <aside className={`${sidebarOpen ? 'w-80' : 'w-0'} bg-slate-800/95 backdrop-blur-sm border-r border-slate-700 transition-all duration-300 overflow-hidden z-40`}>
          <div className="w-80 h-full flex flex-col">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="absolute top-2 z-50 p-1 bg-slate-700 rounded-r-md border border-l-0 border-slate-600 hover:bg-slate-600 transition-colors"
              style={{ left: sidebarOpen ? '320px' : '0' }}
            >
              {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
            
            {/* Filters Panel */}
            <div className="p-4 border-b border-slate-700">
              <h3 className="font-semibold flex items-center gap-2 mb-3"><Filter className="w-4 h-4 text-blue-500" />Filters</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Magnitude Range</label>
                  <div className="flex items-center gap-2">
                    <input type="number" value={filters.minMagnitude} onChange={(e) => setFilters(prev => ({ ...prev, minMagnitude: parseFloat(e.target.value) || 0 }))} className="w-full bg-slate-700 border border-slate-600 rounded px-2 py-1 text-sm" min={0} max={10} step={0.1} />
                    <span className="text-slate-500">-</span>
                    <input type="number" value={filters.maxMagnitude} onChange={(e) => setFilters(prev => ({ ...prev, maxMagnitude: parseFloat(e.target.value) || 10 }))} className="w-full bg-slate-700 border border-slate-600 rounded px-2 py-1 text-sm" min={0} max={10} step={0.1} />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Date Range</label>
                  <div className="flex items-center gap-2">
                    <input type="date" value={filters.startDate ? format(filters.startDate, 'yyyy-MM-dd') : ''} onChange={(e) => setFilters(prev => ({ ...prev, startDate: new Date(e.target.value) }))} className="w-full bg-slate-700 border border-slate-600 rounded px-2 py-1 text-sm" />
                    <input type="date" value={filters.endDate ? format(filters.endDate, 'yyyy-MM-dd') : ''} onChange={(e) => setFilters(prev => ({ ...prev, endDate: new Date(e.target.value) }))} className="w-full bg-slate-700 border border-slate-600 rounded px-2 py-1 text-sm" />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Layers Panel */}
            <div className="p-4 border-b border-slate-700">
              <h3 className="font-semibold flex items-center gap-2 mb-3"><Layers className="w-4 h-4 text-green-500" />Layers</h3>
              <div className="space-y-2">
                {[
                  { key: 'showClusters', label: 'Earthquake Markers', icon: Map },
                  { key: 'showBuffers', label: 'Buffer Zones', icon: Target },
                ].map(layer => (
                  <label key={layer.key} className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={mapState[layer.key as keyof MapState] as boolean} onChange={(e) => setMapState(prev => ({ ...prev, [layer.key]: e.target.checked }))} className="w-4 h-4 rounded border-slate-600 text-blue-500 focus:ring-blue-500 bg-slate-700" />
                    <layer.icon className="w-4 h-4 text-slate-400" />
                    <span className="text-sm">{layer.label}</span>
                  </label>
                ))}
              </div>
            </div>
            
            {/* Models Panel */}
            {mode === 'models' && (
              <div className="p-4 border-b border-slate-700">
                <h3 className="font-semibold flex items-center gap-2 mb-3"><Activity className="w-4 h-4 text-purple-500" />Seismic Models</h3>
                <div className="space-y-2">
                  {[
                    { id: 'buffer', label: 'Buffer Spatial', desc: 'R = 10^(0.5M-1.5) km' },
                    { id: 'omori', label: 'Omori Temporal', desc: 'n(t) = K/(c+t)^p' },
                    { id: 'etas', label: 'ETAS Model', desc: 'Epidemic Aftershock' },
                  ].map(model => (
                    <button key={model.id} onClick={() => setActiveModel(activeModel === model.id ? null : model.id as ActiveModel)} className={`w-full text-left p-2 rounded-lg transition-colors ${activeModel === model.id ? 'bg-purple-600/30 border border-purple-500' : 'bg-slate-700/50 border border-slate-600 hover:bg-slate-600/50'}`}>
                      <div className="font-medium text-sm">{model.label}</div>
                      <div className="text-xs text-slate-400">{model.desc}</div>
                    </button>
                  ))}
                </div>
                {activeModel === 'buffer' && (
                  <div className="mt-4 space-y-3 bg-slate-700/30 p-3 rounded-lg">
                    <div>
                      <label className="text-xs text-slate-400">Buffer Multiplier</label>
                      <input type="range" min={0.5} max={3} step={0.1} value={modelParams.bufferMultiplier} onChange={(e) => setModelParams(prev => ({ ...prev, bufferMultiplier: parseFloat(e.target.value) }))} className="w-full accent-blue-500" />
                      <span className="text-xs text-blue-400">{modelParams.bufferMultiplier}x</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-2">
                      Activa "Buffer Zones" en Layers para visualizar las zonas de afectación en el mapa.
                    </p>
                  </div>
                )}
                {activeModel === 'omori' && (
                  <div className="mt-4 space-y-3 bg-slate-700/30 p-3 rounded-lg">
                    <div>
                      <label className="text-xs text-slate-400">K (Productividad)</label>
                      <input type="number" value={modelParams.omoriK} onChange={(e) => setModelParams(prev => ({ ...prev, omoriK: parseFloat(e.target.value) || 10 }))} className="w-full bg-slate-700 border border-slate-600 rounded px-2 py-1 text-sm" />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400">c (Tiempo offset)</label>
                      <input type="number" step={0.01} value={modelParams.omoriC} onChange={(e) => setModelParams(prev => ({ ...prev, omoriC: parseFloat(e.target.value) || 0.1 }))} className="w-full bg-slate-700 border border-slate-600 rounded px-2 py-1 text-sm" />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400">p (Decaimiento)</label>
                      <input type="number" step={0.1} value={modelParams.omoriP} onChange={(e) => setModelParams(prev => ({ ...prev, omoriP: parseFloat(e.target.value) || 1.0 }))} className="w-full bg-slate-700 border border-slate-600 rounded px-2 py-1 text-sm" />
                    </div>
                    <p className="text-xs text-slate-400 mt-2">
                      Selecciona un terremoto en el mapa para ver el gráfico de decaimiento de réplicas.
                    </p>
                  </div>
                )}
                {activeModel === 'etas' && (
                  <div className="mt-4 space-y-3 bg-purple-900/30 p-3 rounded-lg border border-purple-500/30">
                    <h4 className="text-sm font-semibold text-purple-400">Modelo ETAS</h4>
                    <div className="text-xs text-slate-300 space-y-2">
                      <p><strong>Epidemic Type Aftershock Sequence</strong></p>
                      <p className="text-slate-400">Modelo estadístico que describe la actividad sísmica como un proceso epidémico donde cada terremoto puede generar réplicas.</p>
                    </div>
                    <div className="bg-slate-800/50 p-2 rounded text-xs font-mono text-green-400">
                      λ(t,x,y) = μ + Σ[K·e^(αM)]/[(t+c)^p · (r²+d)^q]
                    </div>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between"><span className="text-slate-400">μ (fondo):</span><span>0.1 eventos/día</span></div>
                      <div className="flex justify-between"><span className="text-slate-400">K (productividad):</span><span>0.01</span></div>
                      <div className="flex justify-between"><span className="text-slate-400">α (sensibilidad):</span><span>2.0</span></div>
                      <div className="flex justify-between"><span className="text-slate-400">p (decaimiento temp.):</span><span>1.0</span></div>
                      <div className="flex justify-between"><span className="text-slate-400">q (decaimiento esp.):</span><span>1.5</span></div>
                    </div>
                    <div className="mt-3 p-2 bg-blue-500/10 rounded border border-blue-500/30">
                      <p className="text-xs text-blue-300">
                        💡 El modelo ETAS calcula la probabilidad de ocurrencia de réplicas basándose en la magnitud del evento principal y la distribución espacio-temporal de eventos previos.
                      </p>
                    </div>
                    <div className="mt-2">
                      <p className="text-xs text-amber-400">⚠️ Selecciona un terremoto M≥5 para calcular la probabilidad de réplicas.</p>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {/* Story Mode Panel */}
            {mode === 'story' && (
              <div className="p-4 border-b border-slate-700">
                <h3 className="font-semibold flex items-center gap-2 mb-3"><BookOpen className="w-4 h-4 text-amber-500" />Story Mode</h3>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-slate-400">{storyIndex + 1} / {storyEvents.length}</span>
                  <button onClick={() => setStoryPlaying(!storyPlaying)} className={`p-2 rounded-lg ${storyPlaying ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                    {storyPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </button>
                </div>
                <div className="relative h-2 bg-slate-700 rounded-full mb-4">
                  <div className="absolute h-full bg-amber-500 rounded-full transition-all" style={{ width: `${((storyIndex + 1) / storyEvents.length) * 100}%` }} />
                  <input type="range" min={0} max={storyEvents.length - 1} value={storyIndex} onChange={(e) => setStoryIndex(parseInt(e.target.value))} className="absolute inset-0 w-full opacity-0 cursor-pointer" />
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {storyEvents.map((event, idx) => (
                    <button key={event.id} onClick={() => setStoryIndex(idx)} className={`w-full text-left p-2 rounded-lg transition-all ${idx === storyIndex ? 'bg-amber-500/20 border border-amber-500' : 'bg-slate-700/30 hover:bg-slate-600/30'}`}>
                      <div className="font-medium text-sm truncate">{event.name || `${event.year} - M${event.magnitude}`}</div>
                      <div className="text-xs text-slate-400">{event.year || new Date(event.date).getFullYear()} • M{event.magnitude}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Peru Module Panel */}
            {mode === 'peru' && (
              <div className="p-4 border-b border-slate-700">
                <h3 className="font-semibold flex items-center gap-2 mb-3"><Flag className="w-4 h-4 text-red-500" />Módulo Perú</h3>
                <div className="space-y-2 mb-4">
                  <h4 className="text-xs text-slate-400 uppercase">Zonificación Sísmica</h4>
                  {PERU_SEISMIC_ZONES.map(zone => (
                    <div key={zone.id} className="p-2 rounded-lg bg-slate-700/30 border border-slate-600">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">{zone.name}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${zone.seismicityLevel === 'alta' ? 'bg-red-500/20 text-red-400' : zone.seismicityLevel === 'media' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400'}`}>{zone.seismicityLevel}</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">{zone.description}</p>
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  <h4 className="text-xs text-slate-400 uppercase">Eventos Históricos</h4>
                  {PERU_HISTORICAL_EVENTS.slice(0, 5).map(event => (
                    <div key={event.id} className="p-2 rounded-lg bg-slate-700/30 border border-slate-600 cursor-pointer hover:bg-slate-600/30" onClick={() => setMapState(prev => ({ ...prev, center: [event.location.lat, event.location.lng], zoom: 8 }))}>
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">{event.name}</span>
                        <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded">M{event.magnitude}</span>
                      </div>
                      <div className="text-xs text-slate-400">{event.year} • {event.deaths.toLocaleString()} fallecidos</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Statistics Charts */}
            <div className="flex-1 p-4 overflow-y-auto">
              <h3 className="font-semibold flex items-center gap-2 mb-3"><BarChart3 className="w-4 h-4 text-cyan-500" />Statistics</h3>
              <div className="space-y-4">
                <div className="h-48 bg-slate-700/30 rounded-lg p-3">
                  <h4 className="text-xs text-slate-400 mb-2">Magnitude Distribution</h4>
                  <Bar data={magnitudeDistribution} options={chartOptions} />
                </div>
                <div className="h-48 bg-slate-700/30 rounded-lg p-3">
                  <h4 className="text-xs text-slate-400 mb-2">30-Day Timeline</h4>
                  <Line data={timeSeriesData} options={chartOptions} />
                </div>
                {omoriData && (
                  <div className="h-48 bg-purple-900/30 rounded-lg p-3 border border-purple-500/30">
                    <h4 className="text-xs text-slate-400 mb-2">Omori Decay - M{selectedEarthquake?.magnitude}</h4>
                    <Line data={omoriData} options={chartOptions} />
                  </div>
                )}
                {etasData && (
                  <div className="h-48 bg-indigo-900/30 rounded-lg p-3 border border-indigo-500/30">
                    <h4 className="text-xs text-slate-400 mb-2">ETAS - Tasa vs Distancia (M{selectedEarthquake?.magnitude})</h4>
                    <Bar data={etasData} options={chartOptions} />
                  </div>
                )}
              </div>
            </div>
          </div>
        </aside>
        
        {/* Map Container */}
        <main className="flex-1 relative">
          {loading && (
            <div className="absolute inset-0 bg-slate-900/80 z-50 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-slate-400">Loading earthquake data...</p>
              </div>
            </div>
          )}
          
          {error && (
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-red-500/90 text-white px-4 py-2 rounded-lg z-50">Error: {error}</div>
          )}
          
          <MapComponent
            center={mapState.center}
            zoom={mapState.zoom}
            earthquakes={earthquakes}
            showMarkers={mapState.showClusters}
            showBuffers={mapState.showBuffers && activeModel === 'buffer'}
            bufferMultiplier={modelParams.bufferMultiplier}
            onEarthquakeClick={(eq) => { setSelectedEarthquake(eq); setRightPanelOpen(true); }}
            mode={mode}
            storyCenter={storyCenter}
            peruZones={mode === 'peru'}
          />
          
          {/* Legend */}
          <div className="absolute bottom-4 left-4 bg-slate-800/90 backdrop-blur-sm rounded-lg p-3 border border-slate-700 z-[9999]">
            <h4 className="text-xs font-semibold mb-2 text-slate-400">Magnitude Scale</h4>
            <div className="flex items-center gap-1">
              {[{ mag: 1, color: '#10b981' }, { mag: 3, color: '#34d399' }, { mag: 4, color: '#fcd34d' }, { mag: 5, color: '#fbbf24' }, { mag: 6, color: '#f59e0b' }, { mag: 7, color: '#f97316' }, { mag: 8, color: '#ef4444' }].map(item => (
                <div key={item.mag} className="flex flex-col items-center">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-[10px] text-slate-500">{item.mag}</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Story Info Overlay */}
          {mode === 'story' && storyEvents[storyIndex] && (
            <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 bg-slate-800/95 backdrop-blur-sm rounded-lg p-4 border border-amber-500/50 max-w-md z-40">
              <h3 className="font-bold text-lg text-amber-400 mb-1">{storyEvents[storyIndex].name || `${storyEvents[storyIndex].year}`}</h3>
              <p className="text-sm text-slate-300 mb-2">{'description' in storyEvents[storyIndex] ? storyEvents[storyIndex].description : `Magnitude ${storyEvents[storyIndex].magnitude} earthquake`}</p>
              <div className="flex items-center gap-4 text-xs text-slate-400">
                <span>M{storyEvents[storyIndex].magnitude}</span>
                <span>{'year' in storyEvents[storyIndex] ? storyEvents[storyIndex].year : storyEvents[storyIndex].date}</span>
                {'deaths' in storyEvents[storyIndex] && <span className="text-red-400">{storyEvents[storyIndex].deaths?.toLocaleString()} deaths</span>}
              </div>
            </div>
          )}
        </main>
        
        {/* Right Panel - Earthquake Details */}
        {rightPanelOpen && selectedEarthquake && (
          <aside className="w-96 bg-slate-800/95 backdrop-blur-sm border-l border-slate-700 z-40 overflow-y-auto">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg">Earthquake Details</h3>
                <button onClick={() => setRightPanelOpen(false)} className="p-1 hover:bg-slate-700 rounded"><X className="w-5 h-5" /></button>
              </div>
              
              <div className="space-y-4">
                <div className="bg-slate-700/30 rounded-lg p-3">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold" style={{ backgroundColor: getMagnitudeColor(selectedEarthquake.magnitude) }}>{selectedEarthquake.magnitude.toFixed(1)}</div>
                    <div>
                      <p className="font-semibold">Magnitude</p>
                      <p className="text-xs text-slate-400">{selectedEarthquake.magnitudeType}</p>
                    </div>
                  </div>
                  <p className="text-sm">{selectedEarthquake.place}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-slate-700/30 rounded-lg p-3">
                    <p className="text-xs text-slate-400">Date & Time</p>
                    <p className="font-medium">{format(selectedEarthquake.time, 'PP')}</p>
                    <p className="text-sm">{format(selectedEarthquake.time, 'pp')}</p>
                  </div>
                  <div className="bg-slate-700/30 rounded-lg p-3">
                    <p className="text-xs text-slate-400">Depth</p>
                    <p className="font-medium">{selectedEarthquake.depth.toFixed(1)} km</p>
                  </div>
                  <div className="bg-slate-700/30 rounded-lg p-3">
                    <p className="text-xs text-slate-400">Coordinates</p>
                    <p className="text-sm">{selectedEarthquake.coordinates.lat.toFixed(4)}, {selectedEarthquake.coordinates.lng.toFixed(4)}</p>
                  </div>
                  <div className="bg-slate-700/30 rounded-lg p-3">
                    <p className="text-xs text-slate-400">Status</p>
                    <p className="text-sm capitalize">{selectedEarthquake.status}</p>
                  </div>
                </div>
                
                {selectedEarthquake.tsunami === 1 && (
                  <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-blue-400">
                      <AlertTriangle className="w-5 h-5" />
                      <span className="font-semibold">Tsunami Warning</span>
                    </div>
                  </div>
                )}
                
                <a href={selectedEarthquake.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 rounded-lg p-2 text-sm font-medium transition-colors">
                  <Database className="w-4 h-4" />
                  View on USGS
                </a>
              </div>
            </div>
          </aside>
        )}
      </div>
      
      {/* Footer */}
      <footer className="bg-slate-800/90 backdrop-blur-sm border-t border-slate-700 px-4 py-2 z-50">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-4">
            <span>Data: USGS Earthquake API</span>
            <span>•</span>
            <span>Map: © OpenStreetMap contributors</span>
            <span>•</span>
            <span>Models: Buffer, Omori, ETAS</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              Live Data
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
