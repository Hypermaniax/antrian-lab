'use server';

import { queueEventRepo } from "@/repo/queueEventRepo";

export async function fetchQueueEvents(queueId: string) {
  try {
    const data = await queueEventRepo.getByQueueId(queueId);
    return { success: true as const, data };
  } catch (error) {
    console.error('[fetchQueueEvents]', error);
    return { success: false as const, error: 'Failed to fetch events' };
  }
}

export async function fetchRecentEvents(limit = 50) {
  try {
    const data = await queueEventRepo.getRecent(limit);
    return { success: true as const, data };
  } catch (error) {
    console.error('[fetchRecentEvents]', error);
    return { success: false as const, error: 'Failed to fetch recent events' };
  }
}
