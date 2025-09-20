import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { MapPin } from 'lucide-react';
import { COURT_LOCATIONS } from '@/data/courtLocations';

interface TennisCourtMapProps {
  children: React.ReactNode;
  focusedLocation?: {
    name: string;
    coordinates: [number, number]; // Expected as [lng, lat] from parent
  };
}

const TennisCourtMap = ({ children, focusedLocation }: TennisCourtMapProps) => {
  // If focused on one location, show just that court. Otherwise show all courts.
  const mapUrl = focusedLocation 
    ? getSingleCourtMapUrl(focusedLocation)
    : getAllCourtsMapUrl();

  function getSingleCourtMapUrl(location: { name: string; coordinates: [number, number] }) {
    // Convert focused location coordinates from [lng, lat] to [lat, lng] for OSM
    const centerLatLng: [number, number] = [location.coordinates[1], location.coordinates[0]];
    
    // Create bounding box for single court view
    const bbox = {
      west: centerLatLng[1] - 0.008,
      south: centerLatLng[0] - 0.008,
      east: centerLatLng[1] + 0.008,
      north: centerLatLng[0] + 0.008
    };

    return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox.west}%2C${bbox.south}%2C${bbox.east}%2C${bbox.north}&layer=mapnik&marker=${centerLatLng[0]}%2C${centerLatLng[1]}`;
  }

  function getAllCourtsMapUrl() {
    // Calculate bounding box that includes all courts
    const lats = COURT_LOCATIONS.map(court => court.coordinates.latitude);
    const lngs = COURT_LOCATIONS.map(court => court.coordinates.longitude);
    
    const minLat = Math.min(...lats) - 0.01;
    const maxLat = Math.max(...lats) + 0.01;
    const minLng = Math.min(...lngs) - 0.01;
    const maxLng = Math.max(...lngs) + 0.01;

    // Create markers for all courts
    const markers = COURT_LOCATIONS.map(court => 
      `marker=${court.coordinates.latitude}%2C${court.coordinates.longitude}`
    ).join('&');

    return `https://www.openstreetmap.org/export/embed.html?bbox=${minLng}%2C${minLat}%2C${maxLng}%2C${maxLat}&layer=mapnik&${markers}`;
  }

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