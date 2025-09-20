export interface CourtLocation {
  id: string;
  name: string;
  description: string;
  totalCourts: number;
  location: string;
  path: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  // For map display (lng, lat format for OpenStreetMap)
  mapCoordinates: [number, number];
}

export const COURT_LOCATIONS: CourtLocation[] = [
  {
    id: 'brian-watkins',
    name: 'Brian Watkins Tennis Center',
    description: 'Premier tennis facility with 6 courts available for singles and doubles play',
    totalCourts: 6,
    location: 'Manhattan, NY',
    path: '/brian-watkins',
    coordinates: { latitude: 40.7831, longitude: -73.9712 }, // Central Park area
    mapCoordinates: [-73.9712, 40.7831]
  },
  {
    id: 'pier-42',
    name: 'Pier 42 Courts',
    description: 'Waterfront tennis courts with stunning river views',
    totalCourts: 4,
    location: 'Lower East Side, NY',
    path: '/pier-42',
    coordinates: { latitude: 40.7128, longitude: -73.9959 }, // Lower East Side
    mapCoordinates: [-73.9959, 40.7128]
  },
  {
    id: 'cooper-park',
    name: 'Cooper Park',
    description: 'Community tennis courts in a beautiful park setting',
    totalCourts: 2,
    location: 'Williamsburg, Brooklyn',
    path: '/cooper-park',
    coordinates: { latitude: 40.7178, longitude: -73.9442 }, // Williamsburg
    mapCoordinates: [-73.9442, 40.7178]
  }
];