import { MapPin, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useGeolocation } from '@/hooks/useGeolocation';

interface LocationPromptProps {
  onLocationGranted?: (coordinates: { latitude: number; longitude: number }) => void;
}

export function LocationPrompt({ onLocationGranted }: LocationPromptProps) {
  const { coordinates, isLoading, error, permissionStatus, requestLocation } = useGeolocation();

  // Call callback when location is granted
  if (coordinates && onLocationGranted) {
    onLocationGranted(coordinates);
  }

  if (permissionStatus === 'granted' && coordinates) {
    return null; // Hide the prompt once location is granted
  }

  if (permissionStatus === 'denied') {
    return (
      <Card className="border-court-warning bg-gradient-to-r from-court-warning/10 to-accent/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-court-warning">
            <MapPin size={20} />
            Location Access Denied
          </CardTitle>
          <CardDescription>
            To see real-time court status and wait times based on your location, please enable location services in your browser settings.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="border-primary bg-gradient-to-r from-primary/10 to-accent/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <Navigation size={20} />
          Enable Location Services
        </CardTitle>
        <CardDescription>
          Get real-time court availability and estimated wait times based on your current location.
          See which courts are closest to you and plan your visit accordingly.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button 
          onClick={requestLocation} 
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2" />
              Getting Location...
            </>
          ) : (
            <>
              <MapPin size={16} className="mr-2" />
              Enable Location Services
            </>
          )}
        </Button>
        {error && (
          <p className="text-sm text-destructive mt-2">{error}</p>
        )}
      </CardContent>
    </Card>
  );
}