
"use client";

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { countryCoordinates, defaultMapCenter } from '@/lib/country-coordinates';
import type { Coordinates } from '@/lib/country-coordinates';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { MapPin } from 'lucide-react';

// Dynamically import the Leaflet map component
const LeafletMap = dynamic(() => import('@/components/leaflet-map-component'), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col items-center justify-center h-[400px] bg-muted/50 rounded-md p-4">
      <MapPin className="w-12 h-12 text-muted-foreground mb-4 animate-pulse" />
      <Skeleton className="h-6 w-3/4 mb-2" />
      <Skeleton className="h-4 w-1/2" />
      <p className="text-sm text-muted-foreground mt-2">Loading map...</p>
    </div>
  ),
});

interface LocationMapProps {
  countryCode: string | null;
}

export function LocationMap({ countryCode }: LocationMapProps) {
  const [mapProps, setMapProps] = useState<{
    center: [number, number];
    zoom: number;
    markerPosition: [number, number] | null;
    countryName: string | null;
  }>({
    center: [defaultMapCenter.lat, defaultMapCenter.lng],
    zoom: defaultMapCenter.zoom || 2,
    markerPosition: null,
    countryName: null,
  });

  useEffect(() => {
    if (countryCode && countryCoordinates[countryCode.toUpperCase()]) {
      const coords: Coordinates = countryCoordinates[countryCode.toUpperCase()];
      setMapProps({
        center: [coords.lat, coords.lng],
        zoom: coords.zoom || defaultMapCenter.zoom || 2,
        markerPosition: [coords.lat, coords.lng],
        countryName: countryCode.toUpperCase(), // Ideally, get a full name
      });
    } else {
      setMapProps({
        center: [defaultMapCenter.lat, defaultMapCenter.lng],
        zoom: defaultMapCenter.zoom || 2,
        markerPosition: null,
        countryName: null,
      });
    }
  }, [countryCode]);

  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-headline text-primary">Approximate Location</CardTitle>
      </CardHeader>
      <CardContent>
        <div style={{ height: '400px', width: '100%' }} className="rounded-md overflow-hidden border bg-muted">
          <LeafletMap
            center={mapProps.center}
            zoom={mapProps.zoom}
            markerPosition={mapProps.markerPosition}
            popupText={mapProps.countryName}
          />
        </div>
      </CardContent>
    </Card>
  );
}
