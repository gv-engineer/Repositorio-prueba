import type { PeruSeismicZone, PeruHistoricalEvent, PeruDepartmentStats, CoulombStressZone } from '@/types';

export const PERU_SEISMIC_ZONES: PeruSeismicZone[] = [
  {
    id: 'costa',
    name: 'Zona Costera',
    type: 'costa',
    description: 'Zona de subducción donde la placa Nazca se sumerge bajo la placa Sudamericana. Alta actividad sísmica con eventos de gran magnitud.',
    seismicityLevel: 'alta',
    coordinates: {
      minLat: -18.5,
      maxLat: -5.0,
      minLng: -82.0,
      maxLng: -70.0,
    },
    characteristics: [
      'Subducción de la placa Nazca',
      'Terremotos de gran magnitud (M>7)',
      'Tsunamis frecuentes',
      'Profundidad variable (0-100 km)',
      'Actividad sísmica continua',
    ],
  },
  {
    id: 'sierra',
    name: 'Zona Sierra',
    type: 'sierra',
    description: 'Región andina con fallas continentales activas. Sismicidad moderada asociada a deformación cortical.',
    seismicityLevel: 'media',
    coordinates: {
      minLat: -18.0,
      maxLat: -5.0,
      minLng: -78.0,
      maxLng: -69.0,
    },
    characteristics: [
      'Fallas continentales activas',
      'Sismicidad cortical',
      'Profundidad superficial (<50 km)',
      'Eventos moderados (M5-7)',
      'Deslizamientos inducidos',
    ],
  },
  {
    id: 'selva',
    name: 'Zona Amazónica',
    type: 'selva',
    description: 'Región oriental con baja sismicidad. Actividad asociada al basamento precámbrico.',
    seismicityLevel: 'baja',
    coordinates: {
      minLat: -13.0,
      maxLat: -5.0,
      minLng: -74.0,
      maxLng: -69.0,
    },
    characteristics: [
      'Baja actividad sísmica',
      'Eventos de magnitud moderada',
      'Profundidad variable',
      'Asociado al basamento antiguo',
      'Riesgo sísmico menor',
    ],
  },
];

export const PERU_HISTORICAL_EVENTS: PeruHistoricalEvent[] = [
  {
    id: 'peru-1746',
    name: 'Terremoto de Lima-Callao 1746',
    date: '1746-10-28',
    year: 1746,
    magnitude: 8.6,
    location: {
      lat: -12.05,
      lng: -77.05,
      region: 'Lima-Callao',
    },
    depth: 30,
    deaths: 5000,
    injuries: 0,
    damage: 'Destrucción total de Callao, tsunami con olas de hasta 24 metros. Lima severamente dañada.',
    tsunami: true,
    tsunamiHeight: 24,
    description: 'Uno de los terremotos más destructivos de la historia de Perú. El tsunami destruyó completamente el puerto de Callao. Solo sobrevivieron 200 de los 5000 habitantes.',
    source: 'Archivo Histórico Nacional',
  },
  {
    id: 'peru-1868',
    name: 'Terremoto de Arica 1868',
    date: '1868-08-13',
    year: 1868,
    magnitude: 8.5,
    location: {
      lat: -18.48,
      lng: -70.33,
      region: 'Arica (entonces Perú)',
    },
    depth: 25,
    deaths: 25000,
    injuries: 0,
    damage: 'Destrucción total de Arica, Tacna y Moquegua. Tsunami que afectó hasta Hawái y Japón.',
    tsunami: true,
    tsunamiHeight: 16,
    description: 'Terremoto del sur de Perú (hoy norte de Chile). Generó tsunami transpacífico observado en Japón y Hawái.',
    source: 'USGS Historical Earthquake Catalog',
  },
  {
    id: 'peru-1970',
    name: 'Terremoto de Áncash 1970',
    date: '1970-05-31',
    year: 1970,
    magnitude: 7.9,
    location: {
      lat: -9.25,
      lng: -78.85,
      region: 'Áncash',
    },
    depth: 45,
    deaths: 66000,
    injuries: 143000,
    damage: 'Alud del Huascarán sepultó Yungay y Ranrahirca. Destrucción masiva en Huaraz y el Callejón de Huaylas.',
    tsunami: false,
    description: 'El terremoto más mortífero de la historia de Perú. El alud provocado por el sismo sepultó la ciudad de Yungay bajo millones de toneladas de hielo y roca.',
    source: 'USGS, INDECI',
  },
  {
    id: 'peru-2001',
    name: 'Terremoto del Sur del Perú 2001',
    date: '2001-06-23',
    year: 2001,
    magnitude: 8.4,
    location: {
      lat: -16.27,
      lng: -73.64,
      region: 'Arequipa, Moquegua, Tacna',
    },
    depth: 33,
    deaths: 145,
    injuries: 2689,
    damage: 'Daños severos en Arequipa, Moquegua y Tacna. Tsunami local de hasta 8 metros.',
    tsunami: true,
    tsunamiHeight: 8,
    description: 'El terremoto más fuerte en Perú desde 1868. Afectó más de 200,000 viviendas y causó daños significativos a infraestructura.',
    source: 'IGP, USGS',
  },
  {
    id: 'peru-2007',
    name: 'Terremoto de Pisco 2007',
    date: '2007-08-15',
    year: 2007,
    magnitude: 7.9,
    location: {
      lat: -13.39,
      lng: -76.60,
      region: 'Pisco, Ica',
    },
    depth: 39,
    deaths: 596,
    injuries: 1292,
    damage: 'Destrucción del 80% de Pisco. Daños severos en Ica y Chincha. Pérdidas estimadas en $1.2 billones.',
    tsunami: false,
    description: 'Terremoto destructivo que afectó la región central de la costa peruana. La ciudad de Pisco fue la más afectada con el 80% de sus edificaciones destruidas.',
    source: 'IGP, INDECI',
  },
  {
    id: 'peru-2019',
    name: 'Terremoto de Lagunas 2019',
    date: '2019-05-26',
    year: 2019,
    magnitude: 8.0,
    location: {
      lat: -5.81,
      lng: -75.25,
      region: 'Lagunas, Loreto',
    },
    depth: 122,
    deaths: 2,
    injuries: 30,
    damage: 'Daños moderados en Yurimaguas y Lagunas. El sismo fue sentido en gran parte del Perú y Ecuador.',
    tsunami: false,
    description: 'Terremoto profundo en la región amazónica. A pesar de su magnitud, la profundidad redujo su impacto en superficie.',
    source: 'IGP, USGS',
  },
  {
    id: 'peru-2021',
    name: 'Terremoto de Barranca 2021',
    date: '2021-11-28',
    year: 2021,
    magnitude: 7.5,
    location: {
      lat: -4.51,
      lng: -76.88,
      region: 'Barranca, Loreto',
    },
    depth: 112,
    deaths: 1,
    injuries: 20,
    damage: 'Daños en Yurimaguas y poblaciones aledañas. Sentido en Lima y Ecuador.',
    tsunami: false,
    description: 'Otro terremoto profundo en la región amazónica norte, asociado a la subducción de la placa Nazca a gran profundidad.',
    source: 'IGP, USGS',
  },
];

export const PERU_DEPARTMENT_STATS: PeruDepartmentStats[] = [
  { department: 'Lima', totalEvents: 1250, maxMagnitude: 8.6, avgDepth: 45, lastSignificantEvent: '2023-03-18', riskLevel: 'alto' },
  { department: 'Arequipa', totalEvents: 980, maxMagnitude: 8.4, avgDepth: 35, lastSignificantEvent: '2023-06-15', riskLevel: 'alto' },
  { department: 'Ica', totalEvents: 850, maxMagnitude: 7.9, avgDepth: 40, lastSignificantEvent: '2022-11-20', riskLevel: 'alto' },
  { department: 'Áncash', totalEvents: 720, maxMagnitude: 7.9, avgDepth: 50, lastSignificantEvent: '2023-04-10', riskLevel: 'alto' },
  { department: 'Moquegua', totalEvents: 650, maxMagnitude: 8.5, avgDepth: 38, lastSignificantEvent: '2023-05-22', riskLevel: 'alto' },
  { department: 'Tacna', totalEvents: 580, maxMagnitude: 8.5, avgDepth: 42, lastSignificantEvent: '2023-07-08', riskLevel: 'alto' },
  { department: 'La Libertad', totalEvents: 520, maxMagnitude: 7.5, avgDepth: 48, lastSignificantEvent: '2023-02-28', riskLevel: 'medio' },
  { department: 'Piura', totalEvents: 480, maxMagnitude: 7.0, avgDepth: 55, lastSignificantEvent: '2022-09-15', riskLevel: 'medio' },
  { department: 'Cusco', totalEvents: 350, maxMagnitude: 6.5, avgDepth: 35, lastSignificantEvent: '2023-03-05', riskLevel: 'medio' },
  { department: 'Junín', totalEvents: 320, maxMagnitude: 6.8, avgDepth: 40, lastSignificantEvent: '2022-12-12', riskLevel: 'medio' },
  { department: 'Cajamarca', totalEvents: 280, maxMagnitude: 6.0, avgDepth: 30, lastSignificantEvent: '2023-01-18', riskLevel: 'medio' },
  { department: 'Ayacucho', totalEvents: 220, maxMagnitude: 5.8, avgDepth: 25, lastSignificantEvent: '2022-08-22', riskLevel: 'bajo' },
  { department: 'Loreto', totalEvents: 180, maxMagnitude: 8.0, avgDepth: 120, lastSignificantEvent: '2021-11-28', riskLevel: 'medio' },
  { department: 'Puno', totalEvents: 150, maxMagnitude: 5.5, avgDepth: 28, lastSignificantEvent: '2022-06-30', riskLevel: 'bajo' },
  { department: 'Amazonas', totalEvents: 120, maxMagnitude: 5.0, avgDepth: 45, lastSignificantEvent: '2022-04-15', riskLevel: 'bajo' },
];

export const COULOMB_STRESS_ZONES: CoulombStressZone[] = [
  {
    id: 'lima-stress',
    name: 'Zona de Brecha Sísmica de Lima',
    coordinates: [
      [-12.5, -77.5],
      [-11.0, -77.0],
      [-11.5, -76.0],
      [-12.0, -76.5],
    ],
    stressChange: 0.8,
    probabilityChange: 25,
    lastEvent: '1746-10-28',
    description: 'Brecha sísmica con alta acumulación de esfuerzo. Último gran evento hace más de 250 años.',
  },
  {
    id: 'central-stress',
    name: 'Zona Centro',
    coordinates: [
      [-13.0, -77.0],
      [-11.5, -76.5],
      [-12.0, -75.5],
      [-13.5, -76.0],
    ],
    stressChange: -0.3,
    probabilityChange: -15,
    lastEvent: '2007-08-15',
    description: 'Zona de liberación reciente tras el terremoto de Pisco 2007.',
  },
  {
    id: 'south-stress',
    name: 'Zona Sur',
    coordinates: [
      [-17.0, -72.0],
      [-15.5, -71.5],
      [-16.0, -70.5],
      [-17.5, -71.0],
    ],
    stressChange: -0.5,
    probabilityChange: -20,
    lastEvent: '2001-06-23',
    description: 'Liberación parcial tras el terremoto de 2001. Algunos segmentos aún con acumulación.',
  },
  {
    id: 'north-stress',
    name: 'Zona Norte',
    coordinates: [
      [-7.0, -80.0],
      [-5.5, -79.5],
      [-6.0, -78.5],
      [-7.5, -79.0],
    ],
    stressChange: 0.4,
    probabilityChange: 15,
    lastEvent: '1996-11-12',
    description: 'Acumulación moderada de esfuerzo. Último evento significativo en 1996.',
  },
];

// GeoJSON for Peru seismic zones
export const PERU_SEISMIC_ZONES_GEOJSON = {
  type: 'FeatureCollection' as const,
  features: [
    {
      type: 'Feature' as const,
      properties: {
        id: 'costa',
        name: 'Zona Costera',
        type: 'subduccion',
        seismicity: 'alta',
        description: 'Zona de subducción activa',
      },
      geometry: {
        type: 'Polygon' as const,
        coordinates: [[
          [-82.0, -18.5],
          [-70.0, -18.5],
          [-70.0, -5.0],
          [-76.0, -5.0],
          [-76.0, -10.0],
          [-78.0, -14.0],
          [-82.0, -18.5],
        ]],
      },
    },
    {
      type: 'Feature' as const,
      properties: {
        id: 'sierra',
        name: 'Zona Sierra',
        type: 'cortical',
        seismicity: 'media',
        description: 'Fallas continentales andinas',
      },
      geometry: {
        type: 'Polygon' as const,
        coordinates: [[
          [-78.0, -18.0],
          [-69.0, -18.0],
          [-69.0, -5.0],
          [-76.0, -5.0],
          [-76.0, -10.0],
          [-78.0, -14.0],
          [-78.0, -18.0],
        ]],
      },
    },
    {
      type: 'Feature' as const,
      properties: {
        id: 'selva',
        name: 'Zona Amazónica',
        type: 'basamento',
        seismicity: 'baja',
        description: 'Basamento precámbrico',
      },
      geometry: {
        type: 'Polygon' as const,
        coordinates: [[
          [-74.0, -13.0],
          [-69.0, -13.0],
          [-69.0, -5.0],
          [-74.0, -5.0],
          [-74.0, -13.0],
        ]],
      },
    },
  ],
};

// Tectonic plates data for visualization
export const TECTONIC_PLATES_PERU = {
  type: 'FeatureCollection' as const,
  features: [
    {
      type: 'Feature' as const,
      properties: {
        name: 'Placa Sudamericana',
        type: 'continental',
        direction: 'E',
        speed: 25, // mm/year
      },
      geometry: {
        type: 'Polygon' as const,
        coordinates: [[
          [-85, -20],
          [-50, -20],
          [-50, 10],
          [-85, 10],
          [-85, -20],
        ]],
      },
    },
    {
      type: 'Feature' as const,
      properties: {
        name: 'Placa Nazca',
        type: 'oceanica',
        direction: 'E',
        speed: 61, // mm/year
      },
      geometry: {
        type: 'Polygon' as const,
        coordinates: [[
          [-90, -30],
          [-75, -30],
          [-75, 0],
          [-90, 0],
          [-90, -30],
        ]],
      },
    },
  ],
};

// Subduction zone trace
export const SUBDUCTION_ZONE_LINE = {
  type: 'Feature' as const,
  properties: {
    name: 'Fosa Perú-Chile',
    type: 'subduction',
    convergenceRate: 61, // mm/year
  },
  geometry: {
    type: 'LineString' as const,
    coordinates: [
      [-81.5, -5.0],
      [-81.0, -7.0],
      [-79.5, -9.0],
      [-78.5, -11.0],
      [-77.5, -13.0],
      [-76.5, -15.0],
      [-75.5, -17.0],
      [-74.5, -18.5],
    ],
  },
};

// Calculate Peru-specific statistics
export function calculatePeruStats(earthquakes: { magnitude: number; time: Date; coordinates: { lat: number; lng: number; depth: number } }[]) {
  const peruBounds = PERU_SEISMIC_ZONES[0].coordinates;
  
  const peruQuakes = earthquakes.filter(eq => 
    eq.coordinates.lat >= peruBounds.minLat &&
    eq.coordinates.lat <= peruBounds.maxLat &&
    eq.coordinates.lng >= peruBounds.minLng &&
    eq.coordinates.lng <= peruBounds.maxLng
  );

  const total = peruQuakes.length;
  const avgMagnitude = peruQuakes.reduce((sum, eq) => sum + eq.magnitude, 0) / total || 0;
  const maxMagnitude = Math.max(...peruQuakes.map(eq => eq.magnitude), 0);
  const avgDepth = peruQuakes.reduce((sum, eq) => sum + eq.coordinates.depth, 0) / total || 0;

  const last24h = peruQuakes.filter(eq => {
    const hours = (Date.now() - eq.time.getTime()) / (1000 * 60 * 60);
    return hours <= 24;
  }).length;

  const last7d = peruQuakes.filter(eq => {
    const days = (Date.now() - eq.time.getTime()) / (1000 * 60 * 60 * 24);
    return days <= 7;
  }).length;

  return {
    total,
    last24h,
    last7d,
    avgMagnitude: Math.round(avgMagnitude * 100) / 100,
    maxMagnitude,
    avgDepth: Math.round(avgDepth),
  };
}
