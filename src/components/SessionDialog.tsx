import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import type { CourtSession } from '@/types/court';

interface SessionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courtNumber: number;
  existingSession?: CourtSession | null;
  onSave: (session: Omit<CourtSession, 'id'>) => void;
  onDelete?: () => void;
  suggestedPlayerName?: string;
}

export function SessionDialog({ 
  open, 
  onOpenChange, 
  courtNumber, 
  existingSession, 
  onSave, 
  onDelete,
  suggestedPlayerName 
}: SessionDialogProps) {
  const [duration, setDuration] = useState(60);
  const [playerCount, setPlayerCount] = useState<2 | 4>(2);
  const [playerName, setPlayerName] = useState('');

  // Update duration when player count changes
  useEffect(() => {
    if (!existingSession) {
      const defaultDuration = playerCount === 2 ? 60 : 120;
      setDuration(defaultDuration);
    }
  }, [playerCount, existingSession]);

  useEffect(() => {
    if (existingSession) {
      setDuration(existingSession.duration);
      setPlayerCount(existingSession.playerCount);
      setPlayerName(existingSession.playerName);
    } else {
      setDuration(playerCount === 2 ? 60 : 120);
      setPlayerCount(2);
      setPlayerName(suggestedPlayerName || '');
    }
  }, [existingSession, open, suggestedPlayerName]);

  const handleSave = () => {
    if (!playerName.trim()) return;
    
    onSave({
      courtNumber,
      startTime: new Date(),
      duration,
      playerCount,
      playerName: playerName.trim(),
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {existingSession ? 'Edit' : 'Start'} Session - Court {courtNumber}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="playerName">Player Name</Label>
            <Input
              id="playerName"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Enter player name"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="duration">Duration (minutes)</Label>
            <Input
              id="duration"
              type="number"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              min="5"
              max={playerCount === 2 ? "60" : "120"}
            />
          </div>
          
          <div className="space-y-2">
            <Label>Game Type</Label>
            <RadioGroup 
              value={playerCount.toString()} 
              onValueChange={(value) => setPlayerCount(Number(value) as 2 | 4)}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="2" id="singles" />
                <Label htmlFor="singles">Singles (2 players)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="4" id="doubles" />
                <Label htmlFor="doubles">Doubles (4 players)</Label>
              </div>
            </RadioGroup>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          {onDelete && (
            <Button variant="destructive" onClick={onDelete}>
              Delete Session
            </Button>
          )}
          <Button onClick={handleSave} disabled={!playerName.trim()}>
            {existingSession ? 'Update' : 'Start'} Session
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}