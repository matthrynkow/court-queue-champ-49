import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface QueueDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddToQueue: (name: string, playerCount: 2 | 4) => void;
}

export function QueueDialog({ open, onOpenChange, onAddToQueue }: QueueDialogProps) {
  const [name, setName] = useState('');
  const [playerCount, setPlayerCount] = useState<'2' | '4'>('2');

  const handleSubmit = () => {
    if (name.trim()) {
      onAddToQueue(name.trim(), parseInt(playerCount) as 2 | 4);
      onOpenChange(false);
      setName('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Join Queue</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <Label htmlFor="player-name" className="text-base font-medium">Player Name</Label>
            <Input
              id="player-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className="mt-2"
            />
          </div>

          <div>
            <Label className="text-base font-medium">Number of Players</Label>
            <RadioGroup
              value={playerCount}
              onValueChange={(value) => setPlayerCount(value as '2' | '4')}
              className="mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="2" id="queue-singles" />
                <Label htmlFor="queue-singles">2 Players (Singles)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="4" id="queue-doubles" />
                <Label htmlFor="queue-doubles">4 Players (Doubles)</Label>
              </div>
            </RadioGroup>
          </div>

          <Button onClick={handleSubmit} className="w-full" disabled={!name.trim()}>
            Join Queue
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}