
import { eq, and } from 'drizzle-orm';
import { db } from '../db';
import { stations } from '../db/schema';
import type { Station, NewStation } from '@/types';

export type { Station, NewStation };

export const stationRepo = {
  async getAll() {
    return db.select().from(stations).orderBy(stations.createdAt);
  },
  
  async getById(id: string) {
    const rows = await db.select().from(stations).where(eq(stations.id, id));
    return rows[0] ?? null;
  },
  
  async getByCode(code: string) {
    const rows = await db.select().from(stations).where(eq(stations.code, code));
    return rows[0] ?? null;
  },
  
  async getByServiceId(serviceId: string) {
    return db.select().from(stations).where(eq(stations.queueServiceId, serviceId));
  },
  
  async getByStage(stage: string) {
    return db.select().from(stations).where(eq(stations.stage, stage));
  },
  
  async getActiveByStage(stage: string) {
    return db
      .select()
      .from(stations)
      .where(and(eq(stations.stage, stage), eq(stations.isActive, true)));
  },
  
  async create(data: NewStation) {
    const rows = await db.insert(stations).values(data).returning();
    return rows[0];
  },
  
  async update(id: string, data: Partial<NewStation>) {
    const rows = await db
      .update(stations)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(stations.id, id))
      .returning();
    return rows[0] ?? null;
  },
  
  async updateStatus(id: string, isActive: boolean) {
    const rows = await db
      .update(stations)
      .set({ isActive, updatedAt: new Date() })
      .where(eq(stations.id, id))
      .returning();
    return rows[0] ?? null;
  },
  
  async remove(id: string) {
    const rows = await db.delete(stations).where(eq(stations.id, id)).returning();
    return rows[0] ?? null;
  }
  
};
