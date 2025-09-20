import React, { useEffect, useRef, useState } from 'react';
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

const TennisCourtMap = ({ children, focusedLocation }: TennisCourtMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [showFallback, setShowFallback] = useState(false);

  useEffect(() => {
    console.log('TennisCourtMap effect', { isOpen, hasContainer: !!mapContainer.current });
    if (!mapContainer.current || !isOpen) return;

    // Clear any existing map
    if (map.current) {
      map.current.remove();
      map.current = null;
    }

    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      if (!mapContainer.current) return;

      // Convert focused location coordinates from [lng, lat] to [lat, lng] for Leaflet
      const focusCoords = focusedLocation 
        ? [focusedLocation.coordinates[1], focusedLocation.coordinates[0]] as [number, number]
        : [40.7831, -73.9712] as [number, number]; // Default to Brian Watkins

      try {
        // Initialize the map
        map.current = L.map(mapContainer.current, {
          attributionControl: true,
          zoomControl: true,
        }).setView(focusCoords, focusedLocation ? 15 : 11);

        // Add OpenStreetMap tiles
        const tile = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
        }).addTo(map.current);

        tile.once('load', () => {
          setMapReady(true);
          setShowFallback(false);
        });

        // Add markers for each tennis location
        tennisLocations.forEach((location) => {
          const popupContent = `
            <div style="font-family: system-ui, -apple-system, sans-serif; padding: 8px;">
              <h3 style="margin: 0 0 8px 0; font-weight: bold; font-size: 16px;">${location.name}</h3>
              <p style="margin: 0 0 4px 0; color: #666; font-size: 14px;">${location.description}</p>
              <p style="margin: 0; font-size: 14px;"><strong>${location.courts} courts available</strong></p>
            </div>
          `;

          // Create a custom green marker
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

          const marker = L.marker(location.coordinates, { icon: customIcon })
            .addTo(map.current!)
            .bindPopup(popupContent);

          // If this is the focused location, open its popup
          if (focusedLocation && location.name === focusedLocation.name) {
            marker.openPopup();
          }
        });

        // Ensure proper sizing after initialization and after CSS transitions
        map.current.whenReady(() => {
          if (map.current) map.current.invalidateSize();
          setTimeout(() => { if (map.current) map.current.invalidateSize(); }, 300);
          setTimeout(() => { if (map.current) map.current.invalidateSize(); }, 800);
        });

      } catch (error) {
        console.error('Error initializing map:', error);
      }
    }, 100);

    // Cleanup function
    return () => {
      clearTimeout(timer);
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [focusedLocation, isOpen]);

  const centerLatLng: [number, number] = focusedLocation 
    ? [focusedLocation.coordinates[1], focusedLocation.coordinates[0]]
    : [40.7831, -73.9712];

  // Manage fallback if tiles don't load in time
  useEffect(() => {
    if (!isOpen) return;
    // Start fresh for each open
    const t = setTimeout(() => {
      if (!mapReady) setShowFallback(true);
    }, 1500);
    return () => clearTimeout(t);
  }, [isOpen, mapReady]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
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
          <div 
            ref={mapContainer} 
            className="w-full h-full rounded-lg"
            style={{ zIndex: 1 }}
          />

          {showFallback && (
            <iframe
              title="Map fallback"
              className="absolute inset-0 w-full h-full rounded-lg border-0"
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${centerLatLng[1]-0.01}%2C${centerLatLng[0]-0.01}%2C${centerLatLng[1]+0.01}%2C${centerLatLng[0]+0.01}&layer=mapnik&marker=${centerLatLng[0]}%2C${centerLatLng[1]}`}
              referrerPolicy="no-referrer"
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TennisCourtMap;