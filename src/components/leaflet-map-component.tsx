
"use client";

import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { defaultMapCenter } from '@/lib/country-coordinates';

// Fix for default icon path issue with Webpack in Next.js
if (typeof window !== 'undefined') {
  // @ts-ignore In case this part of L.Icon.Default is not recognized by TS
  delete L.Icon.Default.prototype._getIconUrl;

  L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png').default,
    iconUrl: require('leaflet/dist/images/marker-icon.png').default,
    shadowUrl: require('leaflet/dist/images/marker-shadow.png').default,
  });
}

interface MapUpdaterProps {
  targetCenter: L.LatLngExpression; // Renamed from 'center'
  targetZoom: number;           // Renamed from 'zoom'
  markerPosition: [number, number] | null;
  popupText: string | null;
}

const MapUpdater: React.FC<MapUpdaterProps> = ({ targetCenter, targetZoom, markerPosition, popupText }) => {
  const map = useMap();
  const markerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (map) {
      map.setView(targetCenter, targetZoom);
    }
  }, [map, targetCenter, targetZoom]);

  useEffect(() => {
    if (map) {
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }

      if (markerPosition) {
        const newMarker = L.marker(markerPosition).addTo(map);
        if (popupText) {
          newMarker.bindPopup(popupText);
        }
        markerRef.current = newMarker;
      }
    }
    return () => {
      if (markerRef.current && map && map.hasLayer(markerRef.current)) {
        try {
          markerRef.current.remove();
        } catch (e) {
          // console.warn("Could not remove marker during cleanup:", e);
        }
      }
      markerRef.current = null;
    };
  }, [map, markerPosition, popupText]);

  return null;
};

interface LeafletMapComponentProps {
  targetCenter: [number, number]; // The actual center we want the map to be at
  targetZoom: number;         // The actual zoom we want the map to be at
  markerPosition: [number, number] | null;
  popupText: string | null;
}

const LeafletMapComponent: React.FC<LeafletMapComponentProps> = ({
  targetCenter,
  targetZoom,
  markerPosition,
  popupText,
}) => {
  return (
    <MapContainer
      center={[defaultMapCenter.lat, defaultMapCenter.lng]} // Use fixed default center for initialization
      zoom={defaultMapCenter.zoom || 2}                     // Use fixed default zoom for initialization
      scrollWheelZoom={true}
      style={{ height: '100%', width: '100%' }}
      className="rounded-md"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapUpdater
        targetCenter={targetCenter} // Pass the dynamic target values to MapUpdater
        targetZoom={targetZoom}
        markerPosition={markerPosition}
        popupText={popupText}
      />
    </MapContainer>
  );
};

export default LeafletMapComponent;
