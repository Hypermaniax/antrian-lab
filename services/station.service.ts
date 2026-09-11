import { stationRepo } from '@/repo/stationRepo';
import { queueServiceRepo } from '@/repo/queueServiceRepo';

// Service layer: hanya business logic. Validasi sudah di action via zod.
// Sengaja object biar di action cukup 1 import.

export const stationService = {
  async getAllStations() {
    return stationRepo.getAll();
  },

  async getStationsByService(serviceId: string) {
    return stationRepo.getByServiceId(serviceId);
  },

  async getStationsByStage(stage: string) {
    return stationRepo.getByStage(stage);
  },

  async createStation(data: { queueServiceId: string; name: string; code: string; stage: string }) {
    const service = await queueServiceRepo.getById(data.queueServiceId);
    if (!service) throw new Error('Queue service not found');
    if (!service.isActive) throw new Error('Queue service is inactive');
    const existing = await stationRepo.getByCode(data.code);
    if (existing) throw new Error(`Station code "${data.code}" already exists`);
    return stationRepo.create({
      queueServiceId: data.queueServiceId,
      name: data.name,
      code: data.code,
      stage: data.stage,
      isActive: true,
    });
  },

  async updateStation(id: string, data: { name?: string; stage?: string; queueServiceId?: string }) {
    if (!id) throw new Error('ID required');
    const existing = await stationRepo.getById(id);
    if (!existing) throw new Error('Station not found');
    const payload: Record<string, unknown> = {};
    if (data.name !== undefined) payload.name = data.name;
    if (data.stage !== undefined) payload.stage = data.stage;
    if (data.queueServiceId !== undefined) {
      const svc = await queueServiceRepo.getById(data.queueServiceId);
      if (!svc) throw new Error('Service not found');
      payload.queueServiceId = data.queueServiceId;
    }
    const updated = await stationRepo.update(id, payload as never);
    if (!updated) throw new Error('Failed to update station');
    return updated;
  },

  async toggleStationStatus(id: string, isActive: boolean) {
    const existing = await stationRepo.getById(id);
    if (!existing) throw new Error('Station not found');
    const updated = await stationRepo.updateStatus(id, isActive);
    if (!updated) throw new Error('Failed to toggle status');
    return updated;
  },
};
