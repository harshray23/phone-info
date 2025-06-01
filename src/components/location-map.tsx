
"use client";

import type { NextPage } from 'next';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin } from 'lucide-react';

interface LocationMapProps {
  latitude: number;
  longitude: number;
  zoom: number;
  locationName: string;
  locationScope: 'Region' | 'Country' | null;
}

const LeafletMapComponent = dynamic(
  () => import('./leaflet-map-component').then(mod => mod.LeafletMapComponent),
  { 
    ssr: false,
    loading: () => (
      <div className="space-y-2">
        <Skeleton className="h-8 w-2/5" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }
);

export const LocationMap: NextPage<LocationMapProps> = ({ latitude, longitude, zoom, locationName, locationScope }) => {
  const mapTitle = `Location Map (${locationScope || 'Area'})`;
  
  return (
    <Card className="w-full shadow-lg overflow-hidden">
      <CardHeader className="bg-gray-50 dark:bg-gray-800">
        <CardTitle className="text-xl font-headline text-primary flex items-center">
          <MapPin className="mr-2 h-6 w-6" /> {mapTitle}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 md:p-0"> {/* Remove padding for map to fill CardContent */}
        <div style={{ height: '400px', width: '100%' }}>
          <LeafletMapComponent
            targetCenter={[latitude, longitude]}
            targetZoom={zoom}
            markerPosition={[latitude, longitude]}
            markerPopupText={locationName}
          />
        </div>
      </CardContent>
    </Card>
  );
};
