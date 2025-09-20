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
    coordinates: { latitude: 40.7151832292486, longitude: -73.97536625397828 },
    mapCoordinates: [-73.97536625397828, 40.7151832292486]
  },
  {
    id: 'pier-42',
    name: 'Pier 42 Courts',
    description: 'Waterfront tennis courts with stunning river views',
    totalCourts: 4,
    location: 'Lower East Side, NY',
    path: '/pier-42',
    coordinates: { latitude: 40.71059971311849, longitude: -73.98053250864272 },
    mapCoordinates: [-73.98053250864272, 40.71059971311849]
  },
  {
    id: 'cooper-park',
    name: 'Cooper Park',
    description: 'Community tennis courts in a beautiful park setting',
    totalCourts: 2,
    location: 'Williamsburg, Brooklyn',
    path: '/cooper-park',
    coordinates: { latitude: 40.71591838384588, longitude: -73.93632707498023 },
    mapCoordinates: [-73.93632707498023, 40.71591838384588]
  }
];