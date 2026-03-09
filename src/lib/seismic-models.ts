import type { Earthquake, BufferModelResult, OmoriModelResult, ETASModelResult } from '@/types';

/**
 * Calculate buffer radius based on magnitude
 * Formula: R = 10^(0.5*M - 1.5) km
 * This is based on Wells & Coppersmith (1994) empirical relationships
 */
export function calculateBufferRadius(magnitude: number, multiplier: number = 1): number {
  const baseRadius = Math.pow(10, 0.5 * magnitude - 1.5);
  return baseRadius * multiplier;
}

/**
 * Generate buffer model results for a set of earthquakes
 */
export function generateBufferModel(
  earthquakes: Earthquake[],
  magnitudeThreshold: number = 4.0,
  bufferMultiplier: number = 1
): BufferModelResult[] {
  return earthquakes
    .filter(eq => eq.magnitude >= magnitudeThreshold)
    .map(eq => ({
      earthquakeId: eq.id,
      center: [eq.coordinates.lat, eq.coordinates.lng] as [number, number],
      radius: calculateBufferRadius(eq.magnitude, bufferMultiplier),
      magnitude: eq.magnitude,
      affectedArea: Math.PI * Math.pow(calculateBufferRadius(eq.magnitude, bufferMultiplier), 2),
      estimatedPopulation: estimatePopulationInBuffer(eq.magnitude),
    }));
}

/**
 * Estimate population affected based on magnitude
 * Simplified empirical relationship
 */
function estimatePopulationInBuffer(magnitude: number): number {
  const radius = calculateBufferRadius(magnitude);
  const area = Math.PI * radius * radius;
  // Assuming average population density of 100 people/km² in seismically active areas
  const avgDensity = 100;
  return Math.round(area * avgDensity);
}

/**
 * Omori Law for aftershock decay
 * n(t) = K / (c + t)^p
 * 
 * @param t - Time since main shock (days)
 * @param K - Productivity parameter (total aftershocks)
 * @param c - Time offset constant (typically small, 0.01-0.1)
 * @param p - Decay exponent (typically 0.9-1.2)
 */
export function omoriDecay(
  t: number,
  K: number = 10,
  c: number = 0.1,
  p: number = 1.0
): number {
  if (t < 0) return 0;
  return K / Math.pow(c + t, p);
}

/**
 * Generate Omori model time series
 */
export function generateOmoriModel(
  mainShock: Earthquake,
  days: number = 365,
  K?: number,
  c: number = 0.1,
  p: number = 1.0
): OmoriModelResult[] {
  // Estimate K based on main shock magnitude if not provided
  const estimatedK = K ?? Math.pow(10, 0.5 * mainShock.magnitude - 1);
  
  const results: OmoriModelResult[] = [];
  let cumulative = 0;

  for (let day = 0; day <= days; day++) {
    const rate = omoriDecay(day, estimatedK, c, p);
    cumulative += rate;
    
    results.push({
      time: day,
      rate,
      cumulativeCount: cumulative,
      parameters: { K: estimatedK, c, p },
    });
  }

  return results;
}

/**
 * ETAS (Epidemic Type Aftershock Sequence) Model
 * λ(t,x,y) = μ + Σ K*exp(α*M_i) / ((t-t_i+c)^p * ((x-x_i)² + (y-y_i)² + d)^q)
 */
export function calculateETASRate(
  t: number,
  lat: number,
  lng: number,
  earthquakes: Earthquake[],
  mainShockTime: Date,
  params: {
    mu?: number;      // Background rate
    K?: number;       // Productivity
    alpha?: number;   // Magnitude sensitivity
    c?: number;       // Time offset
    p?: number;       // Temporal decay
    d?: number;       // Spatial offset
    q?: number;       // Spatial decay
  } = {}
): { rate: number; backgroundRate: number; triggeredRate: number } {
  const {
    mu = 0.1,
    K = 0.01,
    alpha = 2.0,
    c = 0.01,
    p = 1.0,
    d = 100,  // km²
    q = 1.5,
  } = params;

  let triggeredRate = 0;

  for (const eq of earthquakes) {
    const t_i = (eq.time.getTime() - mainShockTime.getTime()) / (1000 * 60 * 60 * 24); // days
    
    if (t_i > t) continue; // Only consider events before time t
    
    const dt = t - t_i;
    if (dt < 0) continue;

    // Convert lat/lng difference to approximate km
    const dLat = (lat - eq.coordinates.lat) * 111; // ~111 km per degree latitude
    const dLng = (lng - eq.coordinates.lng) * 111 * Math.cos(lat * Math.PI / 180);
    const spatialDist = dLat * dLat + dLng * dLng;

    const triggerContribution = 
      (K * Math.exp(alpha * eq.magnitude)) / 
      (Math.pow(c + dt, p) * Math.pow(spatialDist + d, q));
    
    triggeredRate += triggerContribution;
  }

  return {
    rate: mu + triggeredRate,
    backgroundRate: mu,
    triggeredRate,
  };
}

/**
 * Generate ETAS model grid
 */
export function generateETASGrid(
  earthquakes: Earthquake[],
  mainShock: Earthquake,
  bounds: { minLat: number; maxLat: number; minLng: number; maxLng: number },
  gridSize: number = 1, // degrees
  timeDays: number = 30,
  params: {
    mu?: number;
    K?: number;
    alpha?: number;
    c?: number;
    p?: number;
    d?: number;
    q?: number;
  } = {}
): ETASModelResult[] {
  const results: ETASModelResult[] = [];
  const mainShockTime = mainShock.time;

  for (let lat = bounds.minLat; lat <= bounds.maxLat; lat += gridSize) {
    for (let lng = bounds.minLng; lng <= bounds.maxLng; lng += gridSize) {
      const rateResult = calculateETASRate(
        timeDays,
        lat,
        lng,
        earthquakes,
        mainShockTime,
        params
      );

      results.push({
        time: timeDays,
        latitude: lat,
        longitude: lng,
        rate: rateResult.rate,
        backgroundRate: rateResult.backgroundRate,
        triggeredRate: rateResult.triggeredRate,
      });
    }
  }

  return results;
}

/**
 * Calculate seismic energy release
 * E = 10^(1.5*M + 4.8) Joules
 */
export function calculateEnergy(magnitude: number): number {
  return Math.pow(10, 1.5 * magnitude + 4.8);
}

/**
 * Calculate total energy for multiple earthquakes
 */
export function calculateTotalEnergy(earthquakes: Earthquake[]): number {
  return earthquakes.reduce((sum, eq) => sum + calculateEnergy(eq.magnitude), 0);
}

/**
 * Gutenberg-Richter relationship
 * log10(N) = a - b*M
 */
export function gutenbergRichter(
  magnitude: number,
  a: number,
  b: number
): number {
  return a - b * magnitude;
}

/**
 * Fit Gutenberg-Richter parameters to data
 */
export function fitGutenbergRichter(
  earthquakes: Earthquake[],
  minMagnitude: number = 3.0
): { a: number; b: number; r2: number } {
  // Count earthquakes by magnitude bin
  const bins = new Map<number, number>();
  const binWidth = 0.1;

  earthquakes
    .filter(eq => eq.magnitude >= minMagnitude)
    .forEach(eq => {
      const bin = Math.floor(eq.magnitude / binWidth) * binWidth;
      bins.set(bin, (bins.get(bin) ?? 0) + 1);
    });

  const magnitudes = Array.from(bins.keys()).sort((a, b) => a - b);
  const counts = magnitudes.map(m => bins.get(m) ?? 0);
  const logCounts = counts.map(n => Math.log10(n));

  // Linear regression: log10(N) = a - b*M
  const n = magnitudes.length;
  if (n < 2) return { a: 0, b: 1, r2: 0 };

  const sumX = magnitudes.reduce((a, b) => a + b, 0);
  const sumY = logCounts.reduce((a, b) => a + b, 0);
  const sumXY = magnitudes.reduce((sum, x, i) => sum + x * logCounts[i], 0);
  const sumX2 = magnitudes.reduce((sum, x) => sum + x * x, 0);

  const b = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const a = (sumY + b * sumX) / n;

  // Calculate R²
  const yMean = sumY / n;
  const ssTotal = logCounts.reduce((sum, y) => sum + Math.pow(y - yMean, 2), 0);
  const ssResidual = magnitudes.reduce((sum, x, i) => {
    const predicted = a - b * x;
    return sum + Math.pow(logCounts[i] - predicted, 2);
  }, 0);
  const r2 = 1 - ssResidual / ssTotal;

  return { a, b: -b, r2 };
}

/**
 * Estimate probability of earthquake in time window
 * Using Poisson distribution with rate from Gutenberg-Richter
 */
export function estimateEarthquakeProbability(
  magnitudeThreshold: number,
  timeWindowDays: number,
  a: number,
  b: number
): number {
  // Annual rate for magnitude >= threshold
  const annualRate = Math.pow(10, a - b * magnitudeThreshold);
  
  // Rate for time window
  const windowRate = annualRate * (timeWindowDays / 365);
  
  // Probability of at least one event: P = 1 - e^(-rate)
  return 1 - Math.exp(-windowRate);
}

/**
 * Calculate b-value uncertainty
 */
export function calculateBUncertainty(
  earthquakes: Earthquake[],
  b: number,
  minMagnitude: number = 3.0
): number {
  const n = earthquakes.filter(eq => eq.magnitude >= minMagnitude).length;
  if (n < 2) return 0;
  
  // Standard error of b-value (Shi & Bolt, 1982)
  return b / Math.sqrt(n - 1);
}
