import { useMemo } from 'react';
import type { CourtSession, QueueEntry } from '@/types/court';

export function useQueueLogic(
  sessions: Record<number, CourtSession>, 
  queue: QueueEntry[], 
  totalCourts: number
) {
  const availableCourts = useMemo(() => {
    return totalCourts - Object.keys(sessions).length;
  }, [sessions, totalCourts]);

  const shouldShowQueue = useMemo(() => {
    return queue.length > 0 && availableCourts === 0;
  }, [queue.length, availableCourts]);

  const queueWithNext = useMemo(() => {
    return queue.map((entry, index) => ({
      ...entry,
      isNext: index === 0 && availableCourts > 0
    }));
  }, [queue, availableCourts]);

  return {
    availableCourts,
    shouldShowQueue,
    queueWithNext,
    canClaimDirectly: availableCourts > 0 && queue.length === 0
  };
}