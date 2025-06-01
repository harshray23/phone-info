
"use client";

import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L, { type Map as LeafletMapInstance } from 'leaflet';
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
  targetCenter: L.LatLngExpression;
  targetZoom: number;
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
    // Cleanup for the marker when MapUpdater unmounts or dependencies change
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
  targetCenter: [number, number];
  targetZoom: number;
  markerPosition: [number, number] | null;
  popupText: string | null;
}

const LeafletMapComponent: React.FC<LeafletMapComponentProps> = ({
  targetCenter,
  targetZoom,
  markerPosition,
  popupText,
}) => {
  const mapInstanceRef = useRef<LeafletMapInstance | null>(null);
  // const [isMapReady, setIsMapReady] = useState(false); // Could be used if MapUpdater needs to wait

  useEffect(() => {
    // This effect's cleanup runs when LeafletMapComponent unmounts
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []); // Empty dependency array ensures cleanup runs only on unmount

  return (
    <MapContainer
      center={[defaultMapCenter.lat, defaultMapCenter.lng]} // Use fixed default center for initialization
      zoom={defaultMapCenter.zoom || 2}                     // Use fixed default zoom for initialization
      scrollWheelZoom={true}
      style={{ height: '100%', width: '100%' }}
      className="rounded-md"
      whenCreated={(map) => {
        mapInstanceRef.current = map;
        // setIsMapReady(true); // Trigger re-render if child components depend on map instance via state
      }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {/* MapUpdater uses useMap(), so it will get the map instance from context once MapContainer is ready */}
      <MapUpdater
        targetCenter={targetCenter}
        targetZoom={targetZoom}
        markerPosition={markerPosition}
        popupText={popupText}
      />
    </MapContainer>
  );
};

export default LeafletMapComponent;
