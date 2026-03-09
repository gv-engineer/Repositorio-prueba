'use client';

import { useState } from 'react';
import { 
  Globe, 
  Layers, 
  Filter, 
  GitBranch, 
  BookOpen, 
  MapPin,
  ChevronDown,
  Moon,
  Sun,
  Activity,
  BarChart3
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useUIStore, useMapStore } from '@/hooks/useEarthquakes';
import { COUNTRY_BOUNDS } from '@/lib/usgs';
import { cn } from '@/lib/utils';

const countries = [
  { code: 'world', name: 'Mundial', icon: Globe },
  { code: 'peru', name: 'Perú', icon: MapPin },
  { code: 'chile', name: 'Chile', icon: MapPin },
  { code: 'japan', name: 'Japón', icon: MapPin },
  { code: 'usa', name: 'EE.UU.', icon: MapPin },
  { code: 'indonesia', name: 'Indonesia', icon: MapPin },
  { code: 'mexico', name: 'México', icon: MapPin },
  { code: 'turkey', name: 'Turquía', icon: MapPin },
  { code: 'newZealand', name: 'Nueva Zelanda', icon: MapPin },
  { code: 'italy', name: 'Italia', icon: MapPin },
  { code: 'greece', name: 'Grecia', icon: MapPin },
];

interface HeaderProps {
  totalEarthquakes: number;
  lastUpdate: Date | null;
  onRefresh: () => void;
}

export function Header({ totalEarthquakes, lastUpdate, onRefresh }: HeaderProps) {
  const { activeTab, setActiveTab, toggleSidebar } = useUIStore();
  const { setMapCenter, setMapZoom, setShowPeruModule } = useMapStore();
  const [selectedCountry, setSelectedCountry] = useState('world');

  const handleCountrySelect = (countryCode: string) => {
    setSelectedCountry(countryCode);
    const config = COUNTRY_BOUNDS[countryCode] || COUNTRY_BOUNDS.world;
    setMapCenter(config.center);
    setMapZoom(config.zoom);
    
    if (countryCode === 'peru') {
      setShowPeruModule(true);
    } else {
      setShowPeruModule(false);
    }
  };

  const tabs = [
    { id: 'filters' as const, label: 'Filtros', icon: Filter },
    { id: 'layers' as const, label: 'Capas', icon: Layers },
    { id: 'models' as const, label: 'Modelos', icon: GitBranch },
    { id: 'story' as const, label: 'Narrativa', icon: BookOpen },
    { id: 'peru' as const, label: 'Perú', icon: MapPin },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur border-b border-slate-700">
      <div className="flex items-center justify-between px-4 h-14">
        {/* Logo and Title */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">WebGIS Sísmico</h1>
              <p className="text-xs text-slate-400">Análisis Multimodelo</p>
            </div>
          </div>
        </div>

        {/* Center Tabs */}
        <div className="flex items-center gap-1 bg-slate-800 rounded-lg p-1">
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              variant="ghost"
              size="sm"
              onClick={() => {
                setActiveTab(tab.id);
                if (!useUIStore.getState().sidebarOpen) {
                  toggleSidebar();
                }
              }}
              className={cn(
                "gap-2 text-slate-300 hover:text-white hover:bg-slate-700",
                activeTab === tab.id && "bg-slate-700 text-white"
              )}
            >
              <tab.icon className="w-4 h-4" />
              <span className="hidden md:inline">{tab.label}</span>
            </Button>
          ))}
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {/* Stats */}
          <div className="hidden lg:flex items-center gap-4 px-4 py-1 bg-slate-800 rounded-lg">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-400" />
              <div className="text-sm">
                <span className="text-slate-400">Eventos: </span>
                <span className="text-white font-semibold">{totalEarthquakes.toLocaleString()}</span>
              </div>
            </div>
            {lastUpdate && (
              <div className="text-xs text-slate-400">
                Actualizado: {lastUpdate.toLocaleTimeString()}
              </div>
            )}
          </div>

          {/* Country Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2 bg-slate-800 border-slate-700 text-white">
                <Globe className="w-4 h-4" />
                <span>{countries.find(c => c.code === selectedCountry)?.name || 'Mundial'}</span>
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-slate-800 border-slate-700">
              {countries.map((country) => (
                <DropdownMenuItem
                  key={country.code}
                  onClick={() => handleCountrySelect(country.code)}
                  className="text-slate-300 hover:text-white hover:bg-slate-700 focus:bg-slate-700"
                >
                  <country.icon className="w-4 h-4 mr-2" />
                  {country.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Refresh Button */}
          <Button
            variant="outline"
            size="icon"
            onClick={onRefresh}
            className="bg-slate-800 border-slate-700 text-white hover:bg-slate-700"
          >
            <Activity className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
