import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { MapPin } from 'lucide-react';

// Fix for default markers in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const tennisLocations = [
  {
    name: 'Brian Watkins Tennis Center',
    coordinates: [40.7831, -73.9712] as [number, number],
    courts: 6,
    description: 'Premier tennis facility with 6 courts'
  },
  {
    name: 'Pier 42 Courts',
    coordinates: [40.7128, -73.9857] as [number, number],
    courts: 4,
    description: 'Waterfront courts with stunning river views'
  },
  {
    name: 'Cooper Park',
    coordinates: [40.7282, -73.9442] as [number, number],
    courts: 2,
    description: 'Community courts in beautiful park setting'
  }
];

interface TennisCourtMapProps {
  children: React.ReactNode;
  focusedLocation?: {
    name: string;
    coordinates: [number, number]; // Expected as [lng, lat] from parent
  };
}

// Custom green marker icon
const customIcon = L.divIcon({
  className: 'custom-tennis-marker',
  html: `
    <div style="
      background-color: #22c55e;
      width: 25px;
      height: 25px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      border: 2px solid #16a34a;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    "></div>
  `,
  iconSize: [25, 25],
  iconAnchor: [12.5, 25],
});

const TennisCourtMap = ({ children, focusedLocation }: TennisCourtMapProps) => {
  console.log('TennisCourtMap render', { focusedLocation });

  // Convert focused location coordinates from [lng, lat] to [lat, lng] for Leaflet
  const focusCoords = focusedLocation 
    ? [focusedLocation.coordinates[1], focusedLocation.coordinates[0]] as [number, number]
    : [40.7831, -73.9712] as [number, number]; // Default to Brian Watkins

  const zoomLevel = focusedLocation ? 15 : 11;

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin size={20} />
            {focusedLocation ? focusedLocation.name : 'NYC Tennis Court Locations'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 min-h-[500px] relative">
          <MapContainer
            center={focusCoords}
            zoom={zoomLevel}
            style={{ height: '100%', width: '100%', minHeight: '500px' }}
            className="rounded-lg"
          >
            <TileLayer
              attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {tennisLocations.map((location) => (
              <Marker 
                key={location.name} 
                position={location.coordinates}
                icon={customIcon}
              >
                <Popup>
                  <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                    <h3 style={{ margin: '0 0 8px 0', fontWeight: 'bold', fontSize: '16px' }}>
                      {location.name}
                    </h3>
                    <p style={{ margin: '0 0 4px 0', color: '#666', fontSize: '14px' }}>
                      {location.description}
                    </p>
                    <p style={{ margin: '0', fontSize: '14px' }}>
                      <strong>{location.courts} courts available</strong>
                    </p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TennisCourtMap;