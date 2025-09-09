import { useState, useEffect } from 'react';
import { MapPin, Clock, Users, Timer } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { calculateDistance, formatDistance, estimateWalkingTime, type Coordinates } from '@/utils/distanceCalculator';
import { supabase } from '@/integrations/supabase/client';

interface Court {
  id: string;
  name: string;
  description: string;
  totalCourts: number;
  location: string;
  path: string;
  coordinates: Coordinates;
  activeSessions: number;
  queueLength: number;
  distance?: number;
  walkingTime?: string;
}

interface NearbyCourtsListProps {
  userLocation: Coordinates;
}

const COURT_LOCATIONS: Omit<Court, 'activeSessions' | 'queueLength'>[] = [
  {
    id: 'brian-watkins',
    name: 'Brian Watkins Tennis Center',
    description: 'Premier tennis facility with 6 courts available for singles and doubles play',
    totalCourts: 6,
    location: 'Manhattan, NY',
    path: '/brian-watkins',
    coordinates: { latitude: 40.7831, longitude: -73.9712 } // Central Park
  },
  {
    id: 'pier-42',
    name: 'Pier 42 Courts',
    description: 'Waterfront tennis courts with stunning river views',
    totalCourts: 4,
    location: 'Lower East Side, NY',
    path: '/pier-42',
    coordinates: { latitude: 40.7128, longitude: -73.9959 } // Lower East Side
  },
  {
    id: 'cooper-park',
    name: 'Cooper Park',
    description: 'Community tennis courts in a beautiful park setting',
    totalCourts: 2,
    location: 'Williamsburg, Brooklyn',
    path: '/cooper-park',
    coordinates: { latitude: 40.7178, longitude: -73.9442 } // Williamsburg
  }
];

export function NearbyCourtsList({ userLocation }: NearbyCourtsListProps) {
  const [courts, setCourts] = useState<Court[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCourtData = async () => {
      try {
        // Calculate distances and add to court data
        const courtsWithDistance = COURT_LOCATIONS.map(court => {
          const distance = calculateDistance(userLocation, court.coordinates);
          return {
            ...court,
            distance,
            walkingTime: estimateWalkingTime(distance),
            activeSessions: 0,
            queueLength: 0
          };
        });

        // Fetch real-time data from Supabase
        const { data: locations } = await supabase
          .from('locations')
          .select('*');

        const { data: sessions } = await supabase
          .from('court_sessions')
          .select('location_id')
          .is('ended_at', null);

        const { data: queueEntries } = await supabase
          .from('queue_entries')
          .select('location_id')
          .eq('status', 'waiting');

        // Update courts with real-time data
        const updatedCourts = courtsWithDistance.map(court => {
          const location = locations?.find(loc => loc.slug === court.id);
          const locationId = location?.id;

          const activeSessions = sessions?.filter(session => session.location_id === locationId).length || 0;
          const queueLength = queueEntries?.filter(entry => entry.location_id === locationId).length || 0;

          return {
            ...court,
            activeSessions,
            queueLength
          };
        });

        // Sort by distance
        updatedCourts.sort((a, b) => (a.distance || 0) - (b.distance || 0));
        setCourts(updatedCourts);
      } catch (error) {
        console.error('Error fetching court data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourtData();

    // Set up real-time subscriptions
    const sessionsChannel = supabase
      .channel('court-sessions-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'court_sessions' },
        () => fetchCourtData()
      )
      .subscribe();

    const queueChannel = supabase
      .channel('queue-entries-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'queue_entries' },
        () => fetchCourtData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(sessionsChannel);
      supabase.removeChannel(queueChannel);
    };
  }, [userLocation]);

  const getAvailabilityStatus = (activeSessions: number, totalCourts: number, queueLength: number) => {
    const availableCourts = totalCourts - activeSessions;
    
    if (availableCourts > 0) {
      return {
        status: 'available',
        message: `${availableCourts} court${availableCourts === 1 ? '' : 's'} available`,
        color: 'court-available'
      };
    } else if (queueLength === 0) {
      return {
        status: 'full',
        message: 'All courts occupied',
        color: 'court-warning'
      };
    } else {
      return {
        status: 'queue',
        message: `${queueLength} in queue`,
        color: 'court-overtime'
      };
    }
  };

  const estimateWaitTime = (queueLength: number) => {
    if (queueLength === 0) return 'No wait';
    const avgSessionTime = 90; // 1.5 hours in minutes
    const estimatedMinutes = queueLength * avgSessionTime;
    
    if (estimatedMinutes < 60) {
      return `~${estimatedMinutes} min`;
    } else {
      const hours = Math.floor(estimatedMinutes / 60);
      const minutes = estimatedMinutes % 60;
      return `~${hours}h ${minutes > 0 ? `${minutes}m` : ''}`;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-3 bg-muted rounded w-full"></div>
                <div className="h-3 bg-muted rounded w-2/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground">Nearby Courts</h3>
      {courts.map((court) => {
        const availability = getAvailabilityStatus(court.activeSessions, court.totalCourts, court.queueLength);
        
        return (
          <Card key={court.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-lg">{court.name}</CardTitle>
                  <CardDescription className="text-sm">{court.description}</CardDescription>
                </div>
                <Badge 
                  variant="outline" 
                  className={`ml-2 border-${availability.color} text-${availability.color}`}
                >
                  {availability.message}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin size={14} />
                  <span>{formatDistance(court.distance || 0)}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock size={14} />
                  <span>{court.walkingTime} walk</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users size={14} />
                  <span>{court.totalCourts} courts total</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Timer size={14} />
                  <span>{estimateWaitTime(court.queueLength)}</span>
                </div>
              </div>
              
              <Link to={court.path} className="block">
                <Button className="w-full">
                  View Courts & Join Queue
                </Button>
              </Link>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}