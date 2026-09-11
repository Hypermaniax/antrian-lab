'use server';

import { revalidatePath } from 'next/cache';
import { stationService } from '@/services/station.service';
import { stationCreateSchema, stationUpdateSchema, formatZodError } from '@/validations';
import { z } from 'zod';

// Controller layer: terima JSON, validasi zod di sini — service tidak tersentuh raw input.

export async function fetchStations() {
  try {
    const data = await stationService.getAllStations();
    return { success: true as const, data };
  } catch (error) {
    console.error('[fetchStations]', error);
    return { success: false as const, error: 'Failed to fetch stations' };
  }
}

export async function fetchStationsByService(serviceId: string) {
  try {
    const data = await stationService.getStationsByService(serviceId);
    return { success: true as const, data };
  } catch (error) {
    console.error('[fetchStationsByService]', error);
    return { success: false as const, error: 'Failed to fetch stations' };
  }
}

export async function fetchStationsByStage(stage: string) {
  try {
    const data = await stationService.getStationsByStage(stage);
    return { success: true as const, data };
  } catch (error) {
    console.error('[fetchStationsByStage]', error);
    return { success: false as const, error: 'Failed to fetch stations' };
  }
}

export async function createStation(json: { queueServiceId: string; name: string; code: string; stage: string }) {
  let parsed: z.infer<typeof stationCreateSchema>;
  try {
    parsed = stationCreateSchema.parse(json);
  } catch (e) {
    if (e instanceof z.ZodError) return { success: false as const, error: formatZodError(e) };
    throw e;
  }
  try {
    const data = await stationService.createStation(parsed);
    revalidatePath('/stations');
    revalidatePath('/');
    return { success: true as const, data };
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Failed to create station';
    console.error('[createStation]', error);
    return { success: false as const, error: msg };
  }
}

export async function updateStation(id: string, json: { name?: string; stage?: string; queueServiceId?: string }) {
  let parsed: z.infer<typeof stationUpdateSchema>;
  try {
    parsed = stationUpdateSchema.parse(json);
  } catch (e) {
    if (e instanceof z.ZodError) return { success: false as const, error: formatZodError(e) };
    throw e;
  }
  try {
    const data = await stationService.updateStation(id, parsed);
    revalidatePath('/stations');
    return { success: true as const, data };
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Failed to update station';
    console.error('[updateStation]', error);
    return { success: false as const, error: msg };
  }
}

export async function toggleStationStatus(id: string, isActive: boolean) {
  try {
    const data = await stationService.toggleStationStatus(id, isActive);
    revalidatePath('/stations');
    return { success: true as const, data };
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Failed to toggle status';
    console.error('[toggleStationStatus]', error);
    return { success: false as const, error: msg };
  }
}
