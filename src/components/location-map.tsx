
"use client";

import React, { useState, useEffect } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';
import { countryCoordinates, defaultMapCenter, type Coordinates } from '@/lib/country-coordinates';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin } from 'lucide-react';

interface LocationMapProps {
  countryCode: string | null; // e.g., "US"
}

export function LocationMap({ countryCode }: LocationMapProps) {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [mapConfig, setMapConfig] = useState<Coordinates>(defaultMapCenter);
  const [markerPosition, setMarkerPosition] = useState<Coordinates | null>(null);

  useEffect(() => {
    // API Key must be accessed on client-side to avoid exposing it during SSR if it wasn't public
    const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || null;
    setApiKey(key);
  }, []);

  useEffect(() => {
    if (countryCode && countryCoordinates[countryCode.toUpperCase()]) {
      const coords = countryCoordinates[countryCode.toUpperCase()];
      setMapConfig(coords);
      setMarkerPosition(coords);
    } else {
      setMapConfig(defaultMapCenter);
      setMarkerPosition(null);
    }
  }, [countryCode]);

  if (!apiKey) {
    return (
      <Card className="w-full shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-headline text-primary">Approximate Location</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-64 bg-muted/50 rounded-md p-4">
            <MapPin className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">
              Google Maps API key is not configured. Please set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY environment variable to display the map.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-headline text-primary">Approximate Location</CardTitle>
      </CardHeader>
      <CardContent>
        <div style={{ height: '400px', width: '100%' }} className="rounded-md overflow-hidden border">
          <APIProvider apiKey={apiKey}>
            <Map
              key={mapConfig.lat + '-' + mapConfig.lng + '-' + mapConfig.zoom} // Force re-render on config change
              center={{ lat: mapConfig.lat, lng: mapConfig.lng }}
              zoom={mapConfig.zoom || defaultMapCenter.zoom}
              mapId="phoneNumberMap"
              gestureHandling={'greedy'}
              disableDefaultUI={true}
              className="rounded-md"
            >
              {markerPosition && (
                <AdvancedMarker position={{ lat: markerPosition.lat, lng: markerPosition.lng }}>
                  <Pin
                    background={'hsl(var(--accent))'}
                    borderColor={'hsl(var(--accent-foreground))'}
                    glyphColor={'hsl(var(--accent-foreground))'}
                  />
                </AdvancedMarker>
              )}
            </Map>
          </APIProvider>
        </div>
      </CardContent>
    </Card>
  );
}
