
"use client";

import React, { useEffect } from 'react';
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

interface ChangeViewProps {
  center: L.LatLngExpression;
  zoom: number;
}

const ChangeView: React.FC<ChangeViewProps> = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (map) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);
  return null;
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
  // A key to help React re-render the map if center/zoom changes drastically,
  // though ChangeView handles most dynamic updates.
  const mapKey = `${center.join(',')}-${zoom}-${markerPosition ? markerPosition.join(',') : 'no-marker'}`;

  return (
    <MapContainer
      key={mapKey}
      center={center}
      zoom={zoom}
      scrollWheelZoom={true}
      style={{ height: '100%', width: '100%' }}
      className="rounded-md"
    >
      <ChangeView center={center} zoom={zoom} />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {markerPosition && (
        <Marker position={markerPosition}>
          {popupText && <Popup>{popupText}</Popup>}
        </Marker>
      )}
    </MapContainer>
  );
};

export default LeafletMapComponent;
