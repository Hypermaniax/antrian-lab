'use server';

import { revalidatePath } from 'next/cache';
import { queueService } from '@/services/queue.service';
import { queueCreateSchema, formatZodError } from '@/validations';
import { z } from 'zod';

// Controller layer: terima JSON, validasi zod di sini — service tidak tersentuh raw input.

export async function createQueue(json: { queueServiceId: string; patientName?: string; patientId?: string }) {
  let parsed: z.infer<typeof queueCreateSchema>;
  try {
    parsed = queueCreateSchema.parse(json);
  } catch (e) {
    if (e instanceof z.ZodError) return { success: false as const, error: formatZodError(e) };
    throw e;
  }
  try {
    const data = await queueService.createQueue(parsed);
    revalidatePath('/');
    revalidatePath('/queues');
    return { success: true as const, data };
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Failed to create queue';
    console.error('[createQueue]', error);
    if (msg.includes('unique')) return { success: false as const, error: 'Duplicate queue number, please retry' };
    return { success: false as const, error: msg };
  }
}

export async function callNextQueue(json: string | { stationId: string }) {
  const stationId = typeof json === 'object' ? json.stationId : String(json);
  try {
    const data = await queueService.callNextQueue(stationId);
    revalidatePath('/');
    return { success: true as const, data };
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Failed to call queue';
    console.error('[callNextQueue]', error);
    return { success: false as const, error: msg };
  }
}

export async function recallQueue(
  json: string | { queueId: string; stationId: string },
  stationId?: string
) {
  const queueId = typeof json === 'object' ? json.queueId : String(json);
  const sId = typeof json === 'object' ? json.stationId : String(stationId);
  try {
    const data = await queueService.recallQueue(queueId, sId);
    revalidatePath('/');
    return { success: true as const, data };
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Failed to recall queue';
    console.error('[recallQueue]', error);
    return { success: false as const, error: msg };
  }
}

export async function startQueueService(
  json: string | { queueId: string; stationId: string },
  stationId?: string
) {
  const queueId = typeof json === 'object' ? json.queueId : String(json);
  const sId = typeof json === 'object' ? json.stationId : String(stationId);
  try {
    const data = await queueService.startQueueService(queueId, sId);
    revalidatePath('/');
    return { success: true as const, data };
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Failed to start service';
    console.error('[startQueueService]', error);
    return { success: false as const, error: msg };
  }
}

export async function completeQueueService(
  json: string | { queueId: string; stationId: string },
  stationId?: string
) {
  const queueId = typeof json === 'object' ? json.queueId : String(json);
  const sId = typeof json === 'object' ? json.stationId : String(stationId);
  try {
    const data = await queueService.completeQueueService(queueId, sId);
    revalidatePath('/');
    return { success: true as const, data };
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Failed to complete service';
    console.error('[completeQueueService]', error);
    return { success: false as const, error: msg };
  }
}

export async function fetchQueues() {
  try {
    const data = await queueService.getAllQueues();
    return { success: true as const, data };
  } catch (error) {
    console.error('[fetchQueues]', error);
    return { success: false as const, error: 'Failed to fetch queues' };
  }
}

export async function fetchQueueById(id: string) {
  try {
    const data = await queueService.getQueueById(id);
    return { success: true as const, data };
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Failed to fetch queue';
    return { success: false as const, error: msg };
  }
}

export async function fetchQueuesByStage(stage: string) {
  try {
    const data = await queueService.getWaitingByStage(stage);
    return { success: true as const, data };
  } catch (error) {
    console.error('[fetchQueuesByStage]', error);
    return { success: false as const, error: 'Failed to fetch queues' };
  }
}

export async function fetchDisplayData(date?: string) {
  try {
    const data = await queueService.getDisplayData(date);
    return { success: true as const, data };
  } catch (error) {
    console.error('[fetchDisplayData]', error);
    return { success: false as const, error: 'Failed to fetch display data' };
  }
}

export async function resetTodayQueuesAction() {
  try {
    await queueService.resetToday();
    revalidatePath('/');
    revalidatePath('/queues');
    revalidatePath('/admin');
    return { success: true as const };
  } catch (error) {
    console.error('[resetTodayQueuesAction]', error);
    return { success: false as const, error: 'Failed to reset queues' };
  }
}

