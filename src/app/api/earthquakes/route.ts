import { NextRequest, NextResponse } from 'next/server';
import { fetchEarthquakes, fetchRealtimeFeed, fetchEarthquakesByBounds } from '@/lib/usgs';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const feed = searchParams.get('feed');
    const bounds = searchParams.get('bounds');
    
    // If requesting a specific feed
    if (feed) {
      const feedType = feed as 'all_day' | 'all_week' | '4.5_week' | 'significant_month';
      const earthquakes = await fetchRealtimeFeed(feedType);
      return NextResponse.json({
        success: true,
        data: earthquakes,
        count: earthquakes.length,
        timestamp: Date.now(),
      });
    }
    
    // If requesting by bounds
    if (bounds) {
      const [minLat, maxLat, minLng, maxLng] = bounds.split(',').map(Number);
      const earthquakes = await fetchEarthquakesByBounds(minLat, maxLat, minLng, maxLng, {
        minMagnitude: parseFloat(searchParams.get('minMagnitude') || '0'),
        startDate: searchParams.get('startDate') ? new Date(searchParams.get('startDate')!) : undefined,
        endDate: searchParams.get('endDate') ? new Date(searchParams.get('endDate')!) : undefined,
      });
      
      return NextResponse.json({
        success: true,
        data: earthquakes,
        count: earthquakes.length,
        timestamp: Date.now(),
      });
    }
    
    // Standard query with filters
    const filters = {
      minMagnitude: searchParams.get('minMagnitude') ? parseFloat(searchParams.get('minMagnitude')!) : undefined,
      maxMagnitude: searchParams.get('maxMagnitude') ? parseFloat(searchParams.get('maxMagnitude')!) : undefined,
      minDepth: searchParams.get('minDepth') ? parseFloat(searchParams.get('minDepth')!) : undefined,
      maxDepth: searchParams.get('maxDepth') ? parseFloat(searchParams.get('maxDepth')!) : undefined,
      startDate: searchParams.get('startDate') ? new Date(searchParams.get('startDate')!) : undefined,
      endDate: searchParams.get('endDate') ? new Date(searchParams.get('endDate')!) : undefined,
      eventType: searchParams.get('eventType') as 'all' | 'earthquake' | 'quarry' | 'explosion' | 'other' | undefined,
    };
    
    const earthquakes = await fetchEarthquakes(filters);
    
    return NextResponse.json({
      success: true,
      data: earthquakes,
      count: earthquakes.length,
      timestamp: Date.now(),
    });
    
  } catch (error) {
    console.error('Earthquake API Error:', error);
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
