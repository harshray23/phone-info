
"use client";

import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { defaultMapCenter } from '@/lib/country-coordinates';

// Fix for default Leaflet icon paths in Next.js
// These are workarounds for a common issue with Webpack/Next.js and Leaflet's default icon paths.
const customIcon = new L.Icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});


interface MapUpdaterProps {
  center: L.LatLngExpression;
  zoom: number;
  markerPosition: L.LatLngExpression | null;
  markerPopupText: string | null;
}

function MapUpdater({ center, zoom, markerPosition, markerPopupText }: MapUpdaterProps) {
  const map = useMap();
  const markerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    map.setView(center, zoom);
  }, [map, center, zoom]);

  useEffect(() => {
    // Remove previous marker if it exists
    if (markerRef.current) {
      markerRef.current.remove();
      markerRef.current = null;
    }

    // Add new marker if position is provided
    if (markerPosition) {
      const newMarker = L.marker(markerPosition, { icon: customIcon }).addTo(map);
      if (markerPopupText) {
        newMarker.bindPopup(markerPopupText).openPopup();
      }
      markerRef.current = newMarker;
    }
     // Cleanup marker on component unmount or when markerPosition/Text changes
    return () => {
        if (markerRef.current) {
            markerRef.current.remove();
            markerRef.current = null;
        }
    };
  }, [map, markerPosition, markerPopupText]);

  return null;
}

interface LeafletMapComponentProps {
  targetCenter: L.LatLngExpression;
  targetZoom: number;
  markerPosition: L.LatLngExpression | null;
  markerPopupText: string | null;
}

export function LeafletMapComponent({
  targetCenter,
  targetZoom,
  markerPosition,
  markerPopupText,
}: LeafletMapComponentProps) {
  const mapInstanceRef = useRef<L.Map | null>(null);
  
  // Use a state to ensure MapContainer has a unique key if we need to force re-render,
  // though direct map.remove() on unmount is preferred.
  // For now, relying on the parent component's keying of LocationMap.

  useEffect(() => {
    // This effect is primarily for cleanup.
    const map = mapInstanceRef.current;
    return () => {
      if (map) {
        map.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);


  return (
    <MapContainer
      center={targetCenter || [defaultMapCenter.lat, defaultMapCenter.lng]} // Initial center, updated by MapUpdater
      zoom={targetZoom || defaultMapCenter.zoom || 2} // Initial zoom, updated by MapUpdater
      scrollWheelZoom={true}
      style={{ height: '100%', width: '100%' }}
      whenCreated={(map) => {
        mapInstanceRef.current = map;
      }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapUpdater 
        center={targetCenter || [defaultMapCenter.lat, defaultMapCenter.lng]} 
        zoom={targetZoom || defaultMapCenter.zoom || 2}
        markerPosition={markerPosition} 
        markerPopupText={markerPopupText} 
      />
    </MapContainer>
  );
}
