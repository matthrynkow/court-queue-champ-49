export interface CourtSession {
  id: string;
  courtNumber: number;
  startTime: Date;
  playerCount: 2 | 4;
  duration: number; // in minutes
  playerName: string;
}

export interface QueueEntry {
  id: string;
  name: string;
  playerCount: 2 | 4;
  addedAt: Date;
  expectedCourtNumber?: number;
  expectedStartTime?: Date;
  isNext?: boolean; // Indicates if this is the next person to claim
}

export type CourtStatus = 'available' | 'claimed';