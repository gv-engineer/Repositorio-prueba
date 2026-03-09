import { NextRequest, NextResponse } from 'next/server';
import { 
  PERU_SEISMIC_ZONES, 
  PERU_HISTORICAL_EVENTS, 
  PERU_DEPARTMENT_STATS, 
  COULOMB_STRESS_ZONES,
  PERU_SEISMIC_ZONES_GEOJSON,
  TECTONIC_PLATES_PERU,
  SUBDUCTION_ZONE_LINE,
  calculatePeruStats
} from '@/lib/peru-data';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'all';
    
    switch (type) {
      case 'zones':
        return NextResponse.json({
          success: true,
          data: PERU_SEISMIC_ZONES,
          geojson: PERU_SEISMIC_ZONES_GEOJSON,
          timestamp: Date.now(),
        });
        
      case 'historical':
        return NextResponse.json({
          success: true,
          data: PERU_HISTORICAL_EVENTS,
          timestamp: Date.now(),
        });
        
      case 'departments':
        return NextResponse.json({
          success: true,
          data: PERU_DEPARTMENT_STATS,
          timestamp: Date.now(),
        });
        
      case 'coulomb':
        return NextResponse.json({
          success: true,
          data: COULOMB_STRESS_ZONES,
          timestamp: Date.now(),
        });
        
      case 'tectonic':
        return NextResponse.json({
          success: true,
          data: {
            plates: TECTONIC_PLATES_PERU,
            subduction: SUBDUCTION_ZONE_LINE,
          },
          timestamp: Date.now(),
        });
        
      case 'all':
      default:
        return NextResponse.json({
          success: true,
          data: {
            zones: PERU_SEISMIC_ZONES,
            zonesGeoJSON: PERU_SEISMIC_ZONES_GEOJSON,
            historical: PERU_HISTORICAL_EVENTS,
            departments: PERU_DEPARTMENT_STATS,
            coulomb: COULOMB_STRESS_ZONES,
            tectonic: {
              plates: TECTONIC_PLATES_PERU,
              subduction: SUBDUCTION_ZONE_LINE,
            },
          },
          timestamp: Date.now(),
        });
    }
    
  } catch (error) {
    console.error('Peru API Error:', error);
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
