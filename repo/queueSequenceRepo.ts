/* eslint-disable @typescript-eslint/no-explicit-any */
import { eq, and, sql } from 'drizzle-orm';
import { db } from '../db';
import { queueSequences } from '../db/schema';
import type { QueueSequence, NewQueueSequence } from '@/types';

export type { QueueSequence, NewQueueSequence };

export const queueSequenceRepo = {
  async getByServiceAndDate(queueServiceId: string, queueDate: string) {
    const rows = await db
      .select()
      .from(queueSequences)
      .where(and(eq(queueSequences.queueServiceId, queueServiceId), eq(queueSequences.queueDate, queueDate)));
    return rows[0] ?? null;
  },
  
  async create(data: NewQueueSequence) {
    const rows = await db.insert(queueSequences).values(data).returning();
    return rows[0];
  },
  
  async upsertIncrement(queueServiceId: string, queueDate: string) {
    // For usage inside transaction: atomic increment
    // Caller must handle transaction wrapper
    // This is pure query helper, actual logic in actions
    return { queueServiceId, queueDate };
  },
  
  async incrementLastNumber(id: string, newLastNumber: number) {
    const rows = await db
      .update(queueSequences)
      .set({ lastNumber: newLastNumber, updatedAt: new Date() })
      .where(eq(queueSequences.id, id))
      .returning();
    return rows[0] ?? null;
  },
  
  async getAll() {
    return db.select().from(queueSequences);
  },

  // Tx-aware helpers untuk service (transaksi atomic)
  async findForUpdateTx(tx: any, queueServiceId: string, queueDate: string) {
    const rows = await tx
      .select()
      .from(queueSequences)
      .where(and(eq(queueSequences.queueServiceId, queueServiceId), eq(queueSequences.queueDate, queueDate)))
      .for('update');
    return rows;
  },

  async createTx(tx: any, data: NewQueueSequence) {
    const rows = await tx.insert(queueSequences).values(data).returning();
    return rows[0];
  },

  async updateLastNumberTx(tx: any, id: string, newLastNumber: number) {
    const rows = await tx
      .update(queueSequences)
      .set({ lastNumber: newLastNumber, updatedAt: new Date() })
      .where(eq(queueSequences.id, id))
      .returning();
    return rows[0];
  },
};
