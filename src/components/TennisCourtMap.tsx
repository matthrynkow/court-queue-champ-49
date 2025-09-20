import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { MapPin } from 'lucide-react';

interface TennisCourtMapProps {
  children: React.ReactNode;
  focusedLocation?: {
    name: string;
    coordinates: [number, number]; // Expected as [lng, lat] from parent
  };
}

const TennisCourtMap = ({ children, focusedLocation }: TennisCourtMapProps) => {
  // Convert focused location coordinates from [lng, lat] to [lat, lng] for OSM
  const centerLatLng: [number, number] = focusedLocation 
    ? [focusedLocation.coordinates[1], focusedLocation.coordinates[0]]
    : [40.7831, -73.9712]; // Default to Brian Watkins

  // Create bounding box for the map view
  const bbox = {
    west: centerLatLng[1] - 0.008,
    south: centerLatLng[0] - 0.008,
    east: centerLatLng[1] + 0.008,
    north: centerLatLng[0] + 0.008
  };

  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox.west}%2C${bbox.south}%2C${bbox.east}%2C${bbox.north}&layer=mapnik&marker=${centerLatLng[0]}%2C${centerLatLng[1]}`;

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
        
        <div className="relative h-[60vh]">
          <iframe
            title={`Map of ${focusedLocation ? focusedLocation.name : 'NYC Tennis Court Locations'}`}
            className="w-full h-full rounded-lg border-0"
            src={mapUrl}
            referrerPolicy="no-referrer"
            loading="lazy"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TennisCourtMap;