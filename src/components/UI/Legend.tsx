'use client';

import { useMapStore } from '@/hooks/useEarthquakes';
import { cn, getMagnitudeColor } from '@/lib/utils';
import { Thermometer, Layers } from 'lucide-react';

export function Legend() {
  const { mapState, layers } = useMapStore();
  
  const magnitudeRanges = [
    { range: '0 - 3', color: getMagnitudeColor(2), label: 'Menor' },
    { range: '3 - 5', color: getMagnitudeColor(4), label: 'Moderado' },
    { range: '5 - 6', color: getMagnitudeColor(5.5), label: 'Fuerte' },
    { range: '6 - 7', color: getMagnitudeColor(6.5), label: 'Mayor' },
    { range: '7 - 8', color: getMagnitudeColor(7.5), label: 'Grande' },
    { range: '8+', color: getMagnitudeColor(8.5), label: 'Extremo' },
  ];

  const depthRanges = [
    { range: '0 - 70 km', label: 'Superficial', class: 'bg-emerald-500' },
    { range: '70 - 300 km', label: 'Intermedio', class: 'bg-amber-500' },
    { range: '300+ km', label: 'Profundo', class: 'bg-rose-500' },
  ];

  const visibleLayers = layers.filter(l => l.visible);

  return (
    <div className="absolute bottom-6 right-6 z-40 bg-slate-900/95 backdrop-blur rounded-lg border border-slate-700 p-4 shadow-xl max-w-xs">
      <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
        <Layers className="w-4 h-4" />
        Leyenda
      </h3>

      {/* Magnitude Scale */}
      <div className="mb-4">
        <p className="text-xs text-slate-400 mb-2">Magnitud</p>
        <div className="space-y-1">
          {magnitudeRanges.map((item) => (
            <div key={item.range} className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded-full border border-slate-600"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-xs text-slate-300">{item.range}</span>
              <span className="text-xs text-slate-500">({item.label})</span>
            </div>
          ))}
        </div>
      </div>

      {/* Depth Scale */}
      <div className="mb-4">
        <p className="text-xs text-slate-400 mb-2 flex items-center gap-1">
          <Thermometer className="w-3 h-3" />
          Profundidad
        </p>
        <div className="space-y-1">
          {depthRanges.map((item) => (
            <div key={item.range} className="flex items-center gap-2">
              <div className={cn("w-4 h-2 rounded", item.class)} />
              <span className="text-xs text-slate-300">{item.range}</span>
              <span className="text-xs text-slate-500">({item.label})</span>
            </div>
          ))}
        </div>
      </div>

      {/* Active Layers */}
      <div>
        <p className="text-xs text-slate-400 mb-2">Capas Activas</p>
        <div className="flex flex-wrap gap-1">
          {visibleLayers.length > 0 ? (
            visibleLayers.map((layer) => (
              <span
                key={layer.id}
                className="text-xs px-2 py-1 bg-slate-700 rounded text-slate-300"
              >
                {layer.name}
              </span>
            ))
          ) : (
            <span className="text-xs text-slate-500">Sin capas activas</span>
          )}
        </div>
      </div>

      {/* Current View Info */}
      {mapState.showHeatmap && (
        <div className="mt-3 pt-3 border-t border-slate-700">
          <p className="text-xs text-amber-400 flex items-center gap-1">
            <Thermometer className="w-3 h-3" />
            Mapa de calor activo
          </p>
        </div>
      )}
    </div>
  );
}
