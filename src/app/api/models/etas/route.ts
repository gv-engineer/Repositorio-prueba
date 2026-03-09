import { NextRequest, NextResponse } from 'next/server';
import { generateETASGrid, calculateETASRate } from '@/lib/seismic-models';
import type { Earthquake } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      earthquakes, 
      mainShock, 
      bounds, 
      gridSize = 1, 
      timeDays = 30,
      params = {} 
    } = body;
    
    if (!earthquakes || !mainShock || !bounds) {
      return NextResponse.json(
        { success: false, error: 'Earthquakes, mainShock, and bounds are required' },
        { status: 400 }
      );
    }
    
    // Convert earthquake times
    const earthquakesData = earthquakes.map((eq: any) => ({
      ...eq,
      time: new Date(eq.time),
    }));
    
    const mainShockData = {
      ...mainShock,
      time: new Date(mainShock.time),
    };
    
    // Generate ETAS grid
    const grid = generateETASGrid(
      earthquakesData as Earthquake[],
      mainShockData as Earthquake,
      bounds,
      gridSize,
      timeDays,
      params
    );
    
    // Calculate statistics
    const maxRate = Math.max(...grid.map(g => g.rate));
    const avgRate = grid.reduce((sum, g) => sum + g.rate, 0) / grid.length;
    const maxTriggeredRate = Math.max(...grid.map(g => g.triggeredRate));
    
    // Create GeoJSON for visualization
    const geojson = {
      type: 'FeatureCollection' as const,
      features: grid.map(g => ({
        type: 'Feature' as const,
        properties: {
          rate: g.rate,
          backgroundRate: g.backgroundRate,
          triggeredRate: g.triggeredRate,
        },
        geometry: {
          type: 'Point' as const,
          coordinates: [g.longitude, g.latitude],
        },
      })),
    };
    
    return NextResponse.json({
      success: true,
      data: {
        grid,
        geojson,
        statistics: {
          gridSize: grid.length,
          maxRate,
          avgRate,
          maxTriggeredRate,
          bounds,
          timeDays,
        },
      },
      timestamp: Date.now(),
    });
    
  } catch (error) {
    console.error('ETAS Model API Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now(),
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Return ETAS model parameters and formula
    return NextResponse.json({
      success: true,
      data: {
        formula: 'λ(t,x,y) = μ + Σ [K*exp(α*M_i)] / [(t-t_i+c)^p * ((x-x_i)² + (y-y_i)² + d)^q]',
        parameters: {
          mu: { description: 'Background seismicity rate', default: 0.1, unit: 'events/day/km²' },
          K: { description: 'Productivity parameter', default: 0.01, unit: 'dimensionless' },
          alpha: { description: 'Magnitude sensitivity', default: 2.0, unit: 'dimensionless' },
          c: { description: 'Time offset constant', default: 0.01, unit: 'days' },
          p: { description: 'Temporal decay exponent', default: 1.0, unit: 'dimensionless' },
          d: { description: 'Spatial offset', default: 100, unit: 'km²' },
          q: { description: 'Spatial decay exponent', default: 1.5, unit: 'dimensionless' },
        },
      },
      timestamp: Date.now(),
    });
    
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
