import { queueRepo } from '@/repo/queueRepo';

export async function getActiveQueueId(stationId: string) {
  const today = new Date().toISOString().split('T')[0];
  const activeQueues = await queueRepo.getActiveByStationIds([stationId], today);
  if (activeQueues.length === 0) {
    throw new Error('No active queue found for this station');
  }
  // If there are multiple (which shouldn't happen), we take the first one
  return activeQueues[0].id;
}
