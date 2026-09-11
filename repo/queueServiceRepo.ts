
import { eq } from 'drizzle-orm';
import { db } from '../db';
import { queueServices } from '../db/schema';
import type { QueueService, NewQueueService } from '@/types';

export type { QueueService, NewQueueService };

export const queueServiceRepo = {
  async getAll() {
    return db.select().from(queueServices).orderBy(queueServices.createdAt);
  },

  async getAllActive() {
    return db.select().from(queueServices).where(eq(queueServices.isActive, true));
  },

  async getById(id: string) {
    const rows = await db.select().from(queueServices).where(eq(queueServices.id, id));
    return rows[0] ?? null;
  },

  async getByCode(code: string) {
    const rows = await db.select().from(queueServices).where(eq(queueServices.code, code));
    return rows[0] ?? null;
  },

  async create(data: NewQueueService) {
    const rows = await db.insert(queueServices).values(data).returning();
    return rows[0];
  },

  async update(id: string, data: Partial<NewQueueService>) {
    const rows = await db
      .update(queueServices)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(queueServices.id, id))
      .returning();
    return rows[0] ?? null;
  },

  async updateStatus(id: string, isActive: boolean) {
    const rows = await db
      .update(queueServices)
      .set({ isActive, updatedAt: new Date() })
      .where(eq(queueServices.id, id))
      .returning();
    return rows[0] ?? null;
  },

  async remove(id: string) {
    const rows = await db.delete(queueServices).where(eq(queueServices.id, id)).returning();
    return rows[0] ?? null;
  },

  // Aliases
  getAllQueueServices: async () => db.select().from(queueServices).orderBy(queueServices.createdAt),
  getQueueServiceById: async (id: string) => {
    const rows = await db.select().from(queueServices).where(eq(queueServices.id, id));
    return rows[0] ?? null;
  },
  createQueueService: async (data: NewQueueService) => {
    const rows = await db.insert(queueServices).values(data).returning();
    return rows[0];
  },
  updateQueueServiceStatus: async (id: string, isActive: boolean) => {
    const rows = await db
      .update(queueServices)
      .set({ isActive, updatedAt: new Date() })
      .where(eq(queueServices.id, id))
      .returning();
    return rows[0] ?? null;
  },
};
