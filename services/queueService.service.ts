import { queueServiceRepo } from '@/repo/queueServiceRepo';

// Service layer: hanya business logic & aturan bisnis.
// Validasi sudah di action via zod — service tidak tersentuh raw input.
// Sengaja dibungkus object biar di action cukup 1 import.

export const queueServiceService = {
  async getAllServices() {
    return queueServiceRepo.getAll();
  },

  async getServiceById(id: string) {
    const data = await queueServiceRepo.getById(id);
    if (!data) throw new Error('Service not found');
    return data;
  },

  async createService(data: { code: string; name: string; prefix: string; description?: string | null }) {
    const existing = await queueServiceRepo.getByCode(data.code);
    if (existing) throw new Error(`Service code "${data.code}" already exists`);
    return queueServiceRepo.create({
      code: data.code,
      name: data.name,
      prefix: data.prefix,
      description: data.description ?? null,
      isActive: true,
    });
  },

  async updateService(id: string, data: { name?: string; prefix?: string; description?: string | null }) {
    if (!id) throw new Error('ID required');
    const existing = await queueServiceRepo.getById(id);
    if (!existing) throw new Error('Service not found');
    const payload: Record<string, unknown> = {};
    if (data.name !== undefined) payload.name = data.name;
    if (data.prefix !== undefined) payload.prefix = data.prefix;
    if (data.description !== undefined) payload.description = data.description;
    const updated = await queueServiceRepo.update(id, payload as never);
    if (!updated) throw new Error('Failed to update service');
    return updated;
  },

  async toggleServiceStatus(id: string, isActive: boolean) {
    const existing = await queueServiceRepo.getById(id);
    if (!existing) throw new Error('Service not found');
    const updated = await queueServiceRepo.updateStatus(id, isActive);
    if (!updated) throw new Error('Failed to toggle status');
    return updated;
  },
};
