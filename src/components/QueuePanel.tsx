import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Clock, Crown } from 'lucide-react';
import type { QueueEntry } from '@/types/court';
import { cn } from '@/lib/utils';

interface QueuePanelProps {
  queue: QueueEntry[];
  onAddToQueue: () => void;
  onRemoveFromQueue: (id: string) => void;
  shouldShowQueue: boolean;
  canClaimDirectly: boolean;
}

export function QueuePanel({ queue, onAddToQueue, onRemoveFromQueue, shouldShowQueue, canClaimDirectly }: QueuePanelProps) {
  if (!shouldShowQueue && queue.length === 0 && canClaimDirectly) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg">Queue</CardTitle>
          <Button onClick={onAddToQueue}>
            Claim Court
          </Button>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">
            Courts available - claim one directly!
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!shouldShowQueue && queue.length === 0 && !canClaimDirectly) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg">Queue</CardTitle>
          <Button onClick={onAddToQueue}>
            Join Queue
          </Button>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">
            All courts claimed - join the queue to save your spot!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg">
          Queue {!shouldShowQueue && queue.length > 0 && '(Courts Available)'}
        </CardTitle>
        <Button onClick={onAddToQueue}>
          {canClaimDirectly ? 'Claim Court' : 'Join Queue'}
        </Button>
      </CardHeader>
      <CardContent>
        {queue.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">No one in queue</p>
        ) : (
          <div className="space-y-3">
            {queue.map((entry, index) => (
              <div 
                key={entry.id}
                className={cn(
                  "flex items-center justify-between p-3 border rounded-lg transition-all",
                  entry.isNext && "border-green-500 bg-green-50 dark:bg-green-950"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    {entry.isNext && <Crown size={16} className="text-green-600" />}
                    <span className={cn(
                      "font-bold", 
                      entry.isNext ? "text-green-600" : "text-primary"
                    )}>
                      #{index + 1}
                    </span>
                  </div>
                  <div>
                    <p className={cn(
                      "font-medium",
                      entry.isNext && "text-green-700 dark:text-green-300"
                    )}>
                      {entry.name} {entry.isNext && '(Next!)'}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Users size={14} />
                        <span>{entry.playerCount === 2 ? 'Singles' : 'Doubles'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock size={14} />
                        <span>
                          {new Date(entry.addedAt).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                      </div>
                      {entry.expectedStartTime && (
                        <span className="text-xs">
                          Expected: {entry.expectedStartTime.toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                      )}
                      {entry.expectedCourtNumber && (
                        <span className="text-xs">
                          Court {entry.expectedCourtNumber}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => onRemoveFromQueue(entry.id)}
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}