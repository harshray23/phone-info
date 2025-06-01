
export interface Coordinates {
  lat: number;
  lng: number;
  zoom?: number;
}

export const countryCoordinates: { [key: string]: Coordinates } = {
  US: { lat: 37.0902, lng: -95.7129, zoom: 4 },
  GB: { lat: 55.3781, lng: -3.4360, zoom: 5 },
  IN: { lat: 20.5937, lng: 78.9629, zoom: 4 },
  DE: { lat: 51.1657, lng: 10.4515, zoom: 5 },
  FR: { lat: 46.603354, lng: 1.8883335, zoom: 5 },
  BR: { lat: -14.2350, lng: -51.9253, zoom: 4 },
  AU: { lat: -25.2744, lng: 133.7751, zoom: 4 },
  CA: { lat: 56.1304, lng: -106.3468, zoom: 3 },
  JP: { lat: 36.2048, lng: 138.2529, zoom: 5 },
  CN: { lat: 35.8617, lng: 104.1954, zoom: 4 },
  // Add more country codes and their coordinates as needed
};

export const defaultMapCenter: Coordinates = { lat: 20, lng: 0, zoom: 2 };
