import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Clock, Play, CheckCircle } from 'lucide-react';
import type { CourtSession, CourtStatus } from '@/types/court';
import { useCourtTimer, formatTime } from '@/hooks/useCourtTimer';
import { cn } from '@/lib/utils';

interface CourtTileProps {
  courtNumber: number;
  session: CourtSession | null;
  onStartSession: (courtNumber: number) => void;
  onEditSession: (session: CourtSession) => void;
  onTimeExpired?: (courtNumber: number) => void;
  canClaim?: boolean;
  nextPlayerName?: string;
}

export function CourtTile({ 
  courtNumber, 
  session, 
  onStartSession, 
  onEditSession, 
  onTimeExpired,
  canClaim,
  nextPlayerName 
}: CourtTileProps) {
  const { timeRemaining, status } = useCourtTimer(session, () => {
    onTimeExpired?.(courtNumber);
  });

  const getStatusStyles = (status: CourtStatus, canClaim: boolean = false) => {
    if (canClaim) {
      return 'bg-gradient-to-br from-green-500/20 to-green-400/10 border-green-500 animate-pulse';
    }
    switch (status) {
      case 'available':
        return 'bg-court-surface border-court-available';
      case 'claimed':
        return 'bg-gradient-to-br from-blue-500/10 to-blue-400/5 border-blue-500';
    }
  };

  const getStatusBadge = (status: CourtStatus) => {
    switch (status) {
      case 'available':
        return (
          <div className="flex items-center gap-1 text-green-600">
            <CheckCircle size={14} />
            <span className="text-xs font-medium">Available</span>
          </div>
        );
      case 'claimed':
        return (
          <div className="flex items-center gap-1 text-blue-600">
            <Users size={14} />
            <span className="text-xs font-medium">Claimed</span>
          </div>
        );
    }
  };

  return (
    <Card className={cn(
      'p-4 transition-all duration-300 hover:shadow-lg border-2',
      getStatusStyles(status, canClaim)
    )}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-bold text-primary">
          Court {courtNumber}
        </h3>
        {getStatusBadge(status)}
      </div>

      {session ? (
        <div className="space-y-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-blue-600" />
                <span className="font-mono text-lg font-bold text-blue-600">
                  {formatTime(timeRemaining)}
                </span>
              </div>
              <span className="text-xs text-muted-foreground">
                {session.playerCount === 2 ? 'Singles' : 'Doubles'}
              </span>
            </div>
            <div className="text-sm text-muted-foreground">
              <span className="font-medium">Player:</span> {session.playerName}
            </div>
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onEditSession(session)}
            className="w-full"
          >
            Edit Session
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {canClaim && nextPlayerName ? (
            <div className="text-center py-4">
              <CheckCircle size={24} className="mx-auto mb-2 text-green-600 animate-bounce" />
              <p className="text-sm font-medium text-green-700">
                Ready for <span className="font-bold">{nextPlayerName}</span>
              </p>
              <p className="text-xs text-muted-foreground">Next in queue</p>
            </div>
          ) : (
            <div className="text-center py-4">
              <Play size={24} className="mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Court available</p>
            </div>
          )}
          
          <Button 
            onClick={() => onStartSession(courtNumber)}
            className="w-full"
            variant={canClaim ? "default" : "outline"}
          >
            {canClaim && nextPlayerName ? `Claim Court (${nextPlayerName})` : 'Start Session'}
          </Button>
        </div>
      )}
    </Card>
  );
}