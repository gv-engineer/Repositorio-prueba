import { NextRequest, NextResponse } from 'next/server';
import { generateBufferModel, calculateBufferRadius } from '@/lib/seismic-models';
import { createEarthquakeBuffers } from '@/lib/turf-analysis';
import type { Earthquake } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { earthquakes, magnitudeThreshold = 4.0, bufferMultiplier = 1 } = body;
    
    if (!earthquakes || !Array.isArray(earthquakes)) {
      return NextResponse.json(
        { success: false, error: 'Earthquakes array is required' },
        { status: 400 }
      );
    }
    
    // Generate buffer model results
    const bufferResults = generateBufferModel(
      earthquakes as Earthquake[],
      magnitudeThreshold,
      bufferMultiplier
    );
    
    // Generate GeoJSON buffers
    const geoJSONBuffers = createEarthquakeBuffers(
      earthquakes as Earthquake[],
      magnitudeThreshold,
      bufferMultiplier
    );
    
    // Calculate statistics
    const totalAffectedArea = bufferResults.reduce((sum, r) => sum + r.affectedArea, 0);
    const avgRadius = bufferResults.length > 0 
      ? bufferResults.reduce((sum, r) => sum + r.radius, 0) / bufferResults.length 
      : 0;
    
    return NextResponse.json({
      success: true,
      data: {
        results: bufferResults,
        geojson: geoJSONBuffers,
        statistics: {
          totalBuffers: bufferResults.length,
          totalAffectedArea,
          avgRadius,
          magnitudeThreshold,
          bufferMultiplier,
        },
      },
      timestamp: Date.now(),
    });
    
  } catch (error) {
    console.error('Buffer Model API Error:', error);
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
    const magnitude = parseFloat(searchParams.get('magnitude') || '5');
    const multiplier = parseFloat(searchParams.get('multiplier') || '1');
    
    const radius = calculateBufferRadius(magnitude, multiplier);
    const area = Math.PI * radius * radius;
    
    return NextResponse.json({
      success: true,
      data: {
        magnitude,
        multiplier,
        radius,
        area,
        formula: 'R = 10^(0.5*M - 1.5) km',
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
