import { NextRequest, NextResponse } from 'next/server';
import { generateOmoriModel, omoriDecay } from '@/lib/seismic-models';
import type { Earthquake } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { mainShock, days = 365, K, c = 0.1, p = 1.0 } = body;
    
    if (!mainShock) {
      return NextResponse.json(
        { success: false, error: 'Main shock data is required' },
        { status: 400 }
      );
    }
    
    // Ensure time is a Date object
    const mainShockData = {
      ...mainShock,
      time: new Date(mainShock.time),
    };
    
    const results = generateOmoriModel(
      mainShockData as Earthquake,
      days,
      K,
      c,
      p
    );
    
    // Calculate key statistics
    const totalAftershocks = results[results.length - 1]?.cumulativeCount || 0;
    const initialRate = results[0]?.rate || 0;
    const finalRate = results[results.length - 1]?.rate || 0;
    
    return NextResponse.json({
      success: true,
      data: {
        timeSeries: results,
        parameters: {
          K: results[0]?.parameters.K || K,
          c: results[0]?.parameters.c || c,
          p: results[0]?.parameters.p || p,
        },
        statistics: {
          totalAftershocks: Math.round(totalAftershocks),
          initialRate,
          finalRate,
          decayRatio: initialRate > 0 ? finalRate / initialRate : 0,
        },
      },
      timestamp: Date.now(),
    });
    
  } catch (error) {
    console.error('Omori Model API Error:', error);
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
    const days = parseInt(searchParams.get('days') || '365');
    const K = parseFloat(searchParams.get('K') || '10');
    const c = parseFloat(searchParams.get('c') || '0.1');
    const p = parseFloat(searchParams.get('p') || '1.0');
    
    // Generate sample time series
    const results = [];
    let cumulative = 0;
    
    for (let day = 0; day <= days; day++) {
      const rate = omoriDecay(day, K, c, p);
      cumulative += rate;
      results.push({ time: day, rate, cumulativeCount: cumulative });
    }
    
    return NextResponse.json({
      success: true,
      data: {
        timeSeries: results,
        parameters: { K, c, p },
        formula: 'n(t) = K / (c + t)^p',
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
