
/* eslint-disable @typescript-eslint/no-explicit-any */
import { eq, desc } from 'drizzle-orm';
import { db } from '../db';
import { queueEvents } from '../db/schema';
import type { QueueEvent, NewQueueEvent } from '@/types';

export type { QueueEvent, NewQueueEvent };

export const queueEventRepo = {
  async getByQueueId(queueId: string) {
    return db
      .select()
      .from(queueEvents)
      .where(eq(queueEvents.queueId, queueId))
      .orderBy(desc(queueEvents.createdAt));
  },
  
  async getAll() {
    return db.select().from(queueEvents).orderBy(desc(queueEvents.createdAt));
  },
  
  async getRecent(limit = 50) {
    return db.select().from(queueEvents).orderBy(desc(queueEvents.createdAt)).limit(limit);
  },
  
  async create(data: NewQueueEvent) {
    const rows = await db.insert(queueEvents).values(data).returning();
    return rows[0];
  },
  
  async createMany(data: NewQueueEvent[]) {
    if (data.length === 0) return [];
    return db.insert(queueEvents).values(data).returning();
  },

  async createTx(tx: any, data: NewQueueEvent) {
    const rows = await tx.insert(queueEvents).values(data).returning();
    return rows[0];
  },
};
