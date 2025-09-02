import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPin } from 'lucide-react';

const tennisLocations = [
  {
    name: 'Brian Watkins Tennis Center',
    coordinates: [-73.9712, 40.7831] as [number, number],
    courts: 6,
    description: 'Premier tennis facility with 6 courts'
  },
  {
    name: 'Pier 42 Courts',
    coordinates: [-73.9857, 40.7128] as [number, number],
    courts: 4,
    description: 'Waterfront courts with stunning river views'
  },
  {
    name: 'Cooper Park',
    coordinates: [-73.9442, 40.7282] as [number, number],
    courts: 2,
    description: 'Community courts in beautiful park setting'
  }
];

interface TennisCourtMapProps {
  children: React.ReactNode;
}

const TennisCourtMap = ({ children }: TennisCourtMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState<string>('');
  const [tokenSet, setTokenSet] = useState<boolean>(false);

  const initializeMap = (token: string) => {
    if (!mapContainer.current || !token) return;

    mapboxgl.accessToken = token;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [-73.9712, 40.7831], // Center on NYC
      zoom: 11,
    });

    // Add markers for each tennis location
    tennisLocations.forEach((location) => {
      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(
        `<div>
          <h3 style="margin: 0 0 8px 0; font-weight: bold;">${location.name}</h3>
          <p style="margin: 0; color: #666;">${location.description}</p>
          <p style="margin: 4px 0 0 0; font-size: 14px;"><strong>${location.courts} courts available</strong></p>
        </div>`
      );

      const marker = new mapboxgl.Marker({ color: '#22c55e' })
        .setLngLat(location.coordinates)
        .setPopup(popup)
        .addTo(map.current!);
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
  };

  const handleTokenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mapboxToken.trim()) {
      initializeMap(mapboxToken);
      setTokenSet(true);
    }
  };

  useEffect(() => {
    return () => {
      map.current?.remove();
    };
  }, []);

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin size={20} />
            NYC Tennis Court Locations
          </DialogTitle>
        </DialogHeader>
        
        {!tokenSet ? (
          <div className="flex flex-col items-center justify-center h-full space-y-4">
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold">Mapbox Token Required</h3>
              <p className="text-muted-foreground">
                To display the map, please enter your Mapbox public token.
              </p>
              <p className="text-sm text-muted-foreground">
                Get your free token at{' '}
                <a 
                  href="https://mapbox.com/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  mapbox.com
                </a>
              </p>
            </div>
            
            <form onSubmit={handleTokenSubmit} className="w-full max-w-md space-y-4">
              <div>
                <Label htmlFor="mapbox-token">Mapbox Public Token</Label>
                <Input
                  id="mapbox-token"
                  type="text"
                  placeholder="pk.eyJ1IjoieW91cnVzZXJuYW1lIiwi..."
                  value={mapboxToken}
                  onChange={(e) => setMapboxToken(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Load Map
              </Button>
            </form>
          </div>
        ) : (
          <div className="relative flex-1">
            <div ref={mapContainer} className="absolute inset-0 rounded-lg" />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default TennisCourtMap;