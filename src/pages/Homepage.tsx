import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Clock, Users, Map } from 'lucide-react';
import { Link } from 'react-router-dom';
import TennisCourtMap from '@/components/TennisCourtMap';
import AuthButton from '@/components/AuthButton';

const sites = [
  {
    id: 'brian-watkins',
    name: 'Brian Watkins Tennis Center',
    description: 'Premier tennis facility with 6 courts available for singles and doubles play',
    courts: 6,
    location: 'Manhattan, NY',
    path: '/brian-watkins'
  },
  {
    id: 'pier-42',
    name: 'Pier 42 Courts', 
    description: 'Waterfront tennis courts with stunning river views',
    courts: 4,
    location: 'Lower East Side, NY',
    path: '/pier-42'
  },
  {
    id: 'cooper-park',
    name: 'Cooper Park',
    description: 'Community tennis courts in a beautiful park setting',
    courts: 2,
    location: 'Williamsburg, Brooklyn',
    path: '/cooper-park'
  }
];

const Homepage = () => {
  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div className="text-center flex-1 space-y-4">
            <h1 className="text-4xl font-bold text-primary">NYC Tennis Court Tracker</h1>
            <p className="text-lg text-muted-foreground">
              Track court times and manage queues across NYC's premier tennis facilities
            </p>
          </div>
          <div className="ml-4">
            <AuthButton />
          </div>
        </div>
        
        <div className="text-center">
          <TennisCourtMap>
            <Button variant="outline" className="flex items-center gap-2">
              <Map size={16} />
              View Tennis Court Map
            </Button>
          </TennisCourtMap>
        </div>

        {/* Sites Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sites.map((site) => (
            <Card key={site.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-xl">{site.name}</CardTitle>
                <CardDescription>{site.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin size={16} />
                  <span>{site.location}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users size={16} />
                  <span>{site.courts} courts available</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock size={16} />
                  <span>Singles: 1hr • Doubles: 2hrs</span>
                </div>
                <Link to={site.path}>
                  <Button className="w-full">
                    View Courts
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground pt-8">
          <p>Real-time court tracking • Queue management • Fair play timing</p>
        </div>
      </div>
    </div>
  );
};

export default Homepage;