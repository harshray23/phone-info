
"use client";

import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default icon path issue with Webpack in Next.js
// This needs to run only on the client side.
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
  center: L.LatLngExpression;
  zoom: number;
  markerPosition: [number, number] | null;
  popupText: string | null;
}

const MapUpdater: React.FC<MapUpdaterProps> = ({ center, zoom, markerPosition, popupText }) => {
  const map = useMap();
  const markerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (map) {
      map.setView(center, zoom);
    }
  }, [map, center, zoom]);

  useEffect(() => {
    if (map) {
      // Remove existing marker if it exists
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }

      // Add new marker if position is provided
      if (markerPosition) {
        const newMarker = L.marker(markerPosition).addTo(map);
        if (popupText) {
          newMarker.bindPopup(popupText);
          // newMarker.openPopup(); // Optionally open popup immediately
        }
        markerRef.current = newMarker;
      }
    }
    // Cleanup function to remove marker when component unmounts or dependencies change
    return () => {
      if (markerRef.current && map.hasLayer(markerRef.current)) {
         // Check if map still has the layer before trying to remove
        try {
            markerRef.current.remove();
        } catch (e) {
            // console.warn("Could not remove marker during cleanup:", e);
        }
      }
      markerRef.current = null;
    };
  }, [map, markerPosition, popupText]);

  return null; // This component does not render anything itself
};

interface LeafletMapComponentProps {
  center: [number, number];
  zoom: number;
  markerPosition: [number, number] | null;
  popupText: string | null;
}

const LeafletMapComponent: React.FC<LeafletMapComponentProps> = ({
  center,
  zoom,
  markerPosition,
  popupText,
}) => {
  // MapContainer will mount once. Updates are handled by MapUpdater.
  // If LeafletMapComponent itself is unmounted/remounted by its parent, 
  // MapContainer will also unmount/remount, triggering its own cleanup.
  return (
    <MapContainer
      center={center} // Initial center for the map
      zoom={zoom}     // Initial zoom for the map
      scrollWheelZoom={true}
      style={{ height: '100%', width: '100%' }}
      className="rounded-md"
      // No 'key' prop here to prevent re-initialization issues
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {/* MapUpdater handles dynamic changes to center, zoom, and marker */}
      <MapUpdater
        center={center}
        zoom={zoom}
        markerPosition={markerPosition}
        popupText={popupText}
      />
    </MapContainer>
  );
};

export default LeafletMapComponent;
