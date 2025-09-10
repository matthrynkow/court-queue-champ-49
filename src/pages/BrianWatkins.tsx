import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CourtTile } from '@/components/CourtTile';
import { QueuePanel } from '@/components/QueuePanel';
import { SessionDialog } from '@/components/SessionDialog';
import { QueueDialog } from '@/components/QueueDialog';
import { RefreshCw, RotateCcw, MapPin } from 'lucide-react';
import TennisCourtMap from '@/components/TennisCourtMap';
import type { CourtSession, QueueEntry } from '@/types/court';
import { useQueueLogic } from '@/hooks/useQueueLogic';

const BrianWatkins = () => {
  const [sessions, setSessions] = useState<Record<number, CourtSession>>({});
  const [queue, setQueue] = useState<QueueEntry[]>([]);
  const [sessionDialogOpen, setSessionDialogOpen] = useState(false);
  const [queueDialogOpen, setQueueDialogOpen] = useState(false);
  const [selectedCourt, setSelectedCourt] = useState<number>(1);
  const [editingSession, setEditingSession] = useState<CourtSession | null>(null);

  const courts = [1, 2, 3, 4, 5, 6];
  const { availableCourts, shouldShowQueue, queueWithNext, canClaimDirectly } = useQueueLogic(sessions, queue, courts.length);

  const handleStartSession = (courtNumber: number) => {
    const nextPlayer = queueWithNext.find(entry => entry.isNext);
    setSelectedCourt(courtNumber);
    setEditingSession(null);
    setSessionDialogOpen(true);
    
    // If there's a next player, remove them from queue when starting session
    if (nextPlayer) {
      setQueue(prev => prev.filter(entry => entry.id !== nextPlayer.id));
    }
  };

  const handleEditSession = (session: CourtSession) => {
    setSelectedCourt(session.courtNumber);
    setEditingSession(session);
    setSessionDialogOpen(true);
  };

  const handleSaveSession = (sessionData: Omit<CourtSession, 'id'>) => {
    const newSession: CourtSession = {
      ...sessionData,
      id: editingSession?.id || Date.now().toString(),
    };
    
    setSessions(prev => ({
      ...prev,
      [sessionData.courtNumber]: newSession
    }));
  };

  const handleDeleteSession = () => {
    if (editingSession) {
      setSessions(prev => {
        const updated = { ...prev };
        delete updated[editingSession.courtNumber];
        return updated;
      });
      setSessionDialogOpen(false);
      setEditingSession(null);
    }
  };

  const handleAddToQueue = (name: string, playerCount: 2 | 4) => {
    // If courts are available, start session directly instead of adding to queue
    if (canClaimDirectly) {
      const availableCourtNumber = courts.find(court => !sessions[court]);
      if (availableCourtNumber) {
        const newSession: CourtSession = {
          id: Date.now().toString(),
          courtNumber: availableCourtNumber,
          startTime: new Date(),
          duration: 60, // Default duration
          playerCount,
          playerName: name,
        };
        setSessions(prev => ({
          ...prev,
          [availableCourtNumber]: newSession
        }));
        return;
      }
    }

    const newEntry: QueueEntry = {
      id: Date.now().toString(),
      name,
      playerCount,
      addedAt: new Date(),
    };
    
    setQueue(prev => [...prev, newEntry]);
  };

  const handleRemoveFromQueue = (id: string) => {
    setQueue(prev => prev.filter(entry => entry.id !== id));
  };

  const handleTimeExpired = (courtNumber: number) => {
    setSessions(prev => {
      const updated = { ...prev };
      delete updated[courtNumber];
      return updated;
    });
  };

  const handleDailyReset = () => {
    setSessions({});
    setQueue([]);
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-primary">Brian Watkins Tennis Center</h1>
            <p className="text-muted-foreground">Track court times and manage the queue</p>
          </div>
          
          <div className="flex gap-2">
            <TennisCourtMap focusedLocation={{
              name: 'Brian Watkins Tennis Center',
              coordinates: [-73.9712, 40.7831]
            }}>
              <Button
                variant="outline"
                className="flex items-center gap-2"
              >
                <MapPin size={16} />
                See on Map
              </Button>
            </TennisCourtMap>
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
              className="flex items-center gap-2"
            >
              <RefreshCw size={16} />
              Refresh
            </Button>
            <Button
              variant="destructive"
              onClick={handleDailyReset}
              className="flex items-center gap-2"
            >
              <RotateCcw size={16} />
              Daily Reset
            </Button>
          </div>
        </div>

        {/* Courts Grid - 2 rows of 3 courts to match physical layout */}
        <div className="grid grid-cols-3 gap-4">
          {courts.map((courtNumber) => (
            <CourtTile
              key={courtNumber}
              courtNumber={courtNumber}
              session={sessions[courtNumber] || null}
              onStartSession={handleStartSession}
              onEditSession={handleEditSession}
            />
          ))}
        </div>

        {/* Queue Panel */}
        <QueuePanel
          queue={queueWithNext}
          onAddToQueue={() => setQueueDialogOpen(true)}
          onRemoveFromQueue={handleRemoveFromQueue}
          shouldShowQueue={shouldShowQueue}
          canClaimDirectly={canClaimDirectly}
        />

        {/* Dialogs */}
        <SessionDialog
          open={sessionDialogOpen}
          onOpenChange={setSessionDialogOpen}
          courtNumber={selectedCourt}
          existingSession={editingSession}
          onSave={handleSaveSession}
          onDelete={editingSession ? handleDeleteSession : undefined}
          suggestedPlayerName={queueWithNext.find(entry => entry.isNext)?.name}
        />

        <QueueDialog
          open={queueDialogOpen}
          onOpenChange={setQueueDialogOpen}
          onAddToQueue={handleAddToQueue}
        />
      </div>
    </div>
  );
};

export default BrianWatkins;
