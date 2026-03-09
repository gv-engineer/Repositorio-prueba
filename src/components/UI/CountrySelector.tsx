'use client';

import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMapStore } from '@/hooks/useEarthquakes';
import { COUNTRY_BOUNDS } from '@/lib/usgs';

const countries = [
  { code: 'world', name: 'Mundial', flag: '🌍' },
  { code: 'peru', name: 'Perú', flag: '🇵🇪' },
  { code: 'chile', name: 'Chile', flag: '🇨🇱' },
  { code: 'japan', name: 'Japón', flag: '🇯🇵' },
  { code: 'usa', name: 'EE.UU.', flag: '🇺🇸' },
  { code: 'indonesia', name: 'Indonesia', flag: '🇮🇩' },
  { code: 'mexico', name: 'México', flag: '🇲🇽' },
  { code: 'turkey', name: 'Turquía', flag: '🇹🇷' },
  { code: 'newZealand', name: 'Nueva Zelanda', flag: '🇳🇿' },
  { code: 'italy', name: 'Italia', flag: '🇮🇹' },
];

interface CountrySelectorProps {
  selectedCountry: string;
  onSelect: (country: string) => void;
}

export function CountrySelector({ selectedCountry, onSelect }: CountrySelectorProps) {
  const { setMapCenter, setMapZoom, setShowPeruModule } = useMapStore();

  const handleSelect = (countryCode: string) => {
    onSelect(countryCode);
    const config = COUNTRY_BOUNDS[countryCode] || COUNTRY_BOUNDS.world;
    setMapCenter(config.center);
    setMapZoom(config.zoom);
    setShowPeruModule(countryCode === 'peru');
  };

  return (
    <div className="grid grid-cols-2 gap-1">
      {countries.map((country) => (
        <button
          key={country.code}
          onClick={() => handleSelect(country.code)}
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors",
            "hover:bg-slate-700",
            selectedCountry === country.code
              ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
              : "text-slate-300 border border-transparent"
          )}
        >
          <span className="text-lg">{country.flag}</span>
          <span className="flex-1 text-left">{country.name}</span>
          {selectedCountry === country.code && (
            <Check className="w-4 h-4 text-blue-400" />
          )}
        </button>
      ))}
    </div>
  );
}
