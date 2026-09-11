'use server';

import { revalidatePath } from 'next/cache';
import { queueServiceService } from '@/services/queueService.service';
import { queueServiceCreateSchema, queueServiceUpdateSchema, formatZodError } from '@/validations';
import { z } from 'zod';

// Controller layer: terima JSON, validasi via zod di sini — service tidak tersentuh raw input, lebih safe.

export async function fetchQueueServices() {
  try {
    const data = await queueServiceService.getAllServices();
    return { success: true as const, data };
  } catch (error) {
    console.error('[fetchQueueServices]', error);
    return { success: false as const, error: 'Failed to fetch queue services' };
  }
}

export async function fetchQueueServiceById(id: string) {
  try {
    const data = await queueServiceService.getServiceById(id);
    return { success: true as const, data };
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Failed to fetch service';
    return { success: false as const, error: msg };
  }
}

export async function createQueueService(json: { code: string; name: string; prefix: string; description?: string }) {
  let parsed: z.infer<typeof queueServiceCreateSchema>;
  try {
    parsed = queueServiceCreateSchema.parse(json);
  } catch (e) {
    if (e instanceof z.ZodError) return { success: false as const, error: formatZodError(e) };
    throw e;
  }
  try {
    const data = await queueServiceService.createService(parsed);
    revalidatePath('/');
    revalidatePath('/services');
    return { success: true as const, data };
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Failed to create service';
    console.error('[createQueueService]', error);
    return { success: false as const, error: msg };
  }
}

export async function updateQueueService(id: string, json: { name?: string; prefix?: string; description?: string }) {
  let parsed: z.infer<typeof queueServiceUpdateSchema>;
  try {
    parsed = queueServiceUpdateSchema.parse(json);
  } catch (e) {
    if (e instanceof z.ZodError) return { success: false as const, error: formatZodError(e) };
    throw e;
  }
  try {
    const data = await queueServiceService.updateService(id, parsed);
    revalidatePath('/');
    return { success: true as const, data };
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Failed to update service';
    console.error('[updateQueueService]', error);
    return { success: false as const, error: msg };
  }
}

export async function toggleQueueServiceStatus(id: string, isActive: boolean) {
  try {
    const data = await queueServiceService.toggleServiceStatus(id, isActive);
    revalidatePath('/');
    return { success: true as const, data };
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Failed to toggle status';
    console.error('[toggleQueueServiceStatus]', error);
    return { success: false as const, error: msg };
  }
}

export const addQueueService = createQueueService;
export const toggleQueueService = toggleQueueServiceStatus;
