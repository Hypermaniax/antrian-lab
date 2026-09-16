
/* eslint-disable @typescript-eslint/no-explicit-any */
import { eq, and, asc, desc, sql, inArray, or, count } from 'drizzle-orm';
import { db } from '../db';
import { queues, stations, queueEvents } from '../db/schema';
import type { Queue, NewQueue } from '@/types';

export type { Queue, NewQueue };

export const queueRepo = {
  async getAll() {
    return db.select().from(queues).orderBy(desc(queues.createdAt));
  },
  
  async getById(id: string) {
    const rows = await db.select().from(queues).where(eq(queues.id, id));
    return rows[0] ?? null;
  },
  
  async getByDate(queueDate: string) {
    return db.select().from(queues).where(eq(queues.queueDate, queueDate));
  },
  
  async getByServiceAndDate(queueServiceId: string, queueDate: string) {
    return db
      .select()
      .from(queues)
      .where(and(eq(queues.queueServiceId, queueServiceId), eq(queues.queueDate, queueDate)))
      .orderBy(asc(queues.sequenceNumber));
  },
  
  async getWaitingByStage(stage: string, queueDate: string) {
    return db
      .select()
      .from(queues)
      .where(and(eq(queues.currentStage, stage), eq(queues.status, 'WAITING'), eq(queues.queueDate, queueDate)))
      .orderBy(asc(queues.sequenceNumber), asc(queues.createdAt));
  },
  
  async getNextWaiting(stage: string, queueDate: string) {
    const rows = await db
      .select()
      .from(queues)
      .where(and(eq(queues.currentStage, stage), eq(queues.status, 'WAITING'), eq(queues.queueDate, queueDate)))
      .orderBy(asc(queues.sequenceNumber), asc(queues.createdAt))
      .limit(1);
    return rows[0] ?? null;
  },
  
  async create(data: NewQueue) {
    const rows = await db.insert(queues).values(data).returning();
    return rows[0];
  },
  
  async update(id: string, data: Partial<NewQueue>) {
    const rows = await db
      .update(queues)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(queues.id, id))
      .returning();
    return rows[0] ?? null;
  },
  
  async updateStatus(
    id: string,
    data: Pick<NewQueue, 'status' | 'currentStage' | 'currentStationId'> & Partial<NewQueue>
  ) {
    const rows = await db
      .update(queues)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(queues.id, id))
      .returning();
    return rows[0] ?? null;
  },
  
  async getCalledByStation(stationId: string, queueDate: string) {
    return db
      .select()
      .from(queues)
      .where(
        and(eq(queues.currentStationId, stationId), eq(queues.queueDate, queueDate), eq(queues.status, 'CALLED'))
      );
  },
  
  async countByServiceAndDate(queueServiceId: string, queueDate: string) {
    const result = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(queues)
      .where(and(eq(queues.queueServiceId, queueServiceId), eq(queues.queueDate, queueDate)));
    return result[0]?.count ?? 0;
  },

  // ── tambahan untuk service — semua query terpusat di repo ──
  async getRecent(limit = 6) {
    return db.select().from(queues).orderBy(desc(queues.createdAt)).limit(limit);
  },

  async getPaginated(page: number, limit: number, stageFilter?: string, dateFilter?: string) {
    const offset = (page - 1) * limit;
    
    const conditions = [];
    if (stageFilter) conditions.push(eq(queues.currentStage, stageFilter));
    if (dateFilter) conditions.push(eq(queues.queueDate, dateFilter));
    
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    
    const [countRes] = await db
      .select({ count: sql<number>`count(*)` })
      .from(queues)
      .where(whereClause);
      
    const total = Number(countRes.count);
    
    const data = await db
      .select()
      .from(queues)
      .where(whereClause)
      .orderBy(desc(queues.createdAt))
      .limit(limit)
      .offset(offset);
      
    return { data, total, page, limit };
  },

  async getActiveByStationIds(stationIds: string[], queueDate: string) {
    if (stationIds.length === 0) return [];
    return db
      .select()
      .from(queues)
      .where(
        and(
          eq(queues.queueDate, queueDate),
          inArray(queues.currentStationId, stationIds),
          or(eq(queues.status, 'CALLED'), eq(queues.status, 'SERVING'))
        )
      )
      .orderBy(asc(queues.createdAt));
  },

  async getDashboardStats(queueDate: string) {
    const [allToday] = await db.select({ c: count() }).from(queues).where(eq(queues.queueDate, queueDate));
    const [waitingReg] = await db
      .select({ c: count() })
      .from(queues)
      .where(and(eq(queues.queueDate, queueDate), eq(queues.currentStage, 'REGISTRATION'), eq(queues.status, 'WAITING')));
    const [waitingBlood] = await db
      .select({ c: count() })
      .from(queues)
      .where(and(eq(queues.queueDate, queueDate), eq(queues.currentStage, 'BLOOD_COLLECTION'), eq(queues.status, 'WAITING')));
    const [completed] = await db.select({ c: count() }).from(queues).where(and(eq(queues.queueDate, queueDate), eq(queues.status, 'COMPLETED')));
    const [stationsCount] = await db.select({ c: count() }).from(stations);
    return {
      total: allToday?.c ?? 0,
      waitingReg: waitingReg?.c ?? 0,
      waitingBlood: waitingBlood?.c ?? 0,
      completed: completed?.c ?? 0,
      stations: stationsCount?.c ?? 0,
      date: queueDate,
    };
  },

  async getDisplayData(queueDate: string) {
    const getLatestForStage = async (stage: string, calledEvents: string[]) => {
      const raw = await db
        .select({ q: queues, eventAt: queueEvents.createdAt })
        .from(queueEvents)
        .innerJoin(queues, eq(queueEvents.queueId, queues.id))
        .where(and(eq(queues.queueDate, queueDate), eq(queueEvents.stage, stage), inArray(queueEvents.event, calledEvents)))
        .orderBy(desc(queueEvents.createdAt))
        .limit(1)
        .then(r => r[0] ?? null);
      if (!raw) return null;
      let displayStatus = 'COMPLETED';
      if (raw.q.currentStage === stage) displayStatus = raw.q.status;
      return { ...raw.q, displayStatus, lastCallTime: raw.eventAt.toISOString() };
    };

    const loket1 = await getLatestForStage('REGISTRATION', ['REGISTRATION_CALLED', 'REGISTRATION_RECALLED', 'AUTO_CALLED']);
    const loket2 = await getLatestForStage('RESULT_PICKUP', ['RESULT_PICKUP_CALLED', 'RESULT_PICKUP_RECALLED', 'AUTO_CALLED']);
    
    const mejaStations = await db.select().from(stations).where(eq(stations.stage, 'BLOOD_COLLECTION')).orderBy(stations.code);
    
    const bloodDisplayData: any[] = [];
    for (const st of mejaStations) {
      const raw = await db
        .select({ q: queues, eventAt: queueEvents.createdAt })
        .from(queueEvents)
        .innerJoin(queues, eq(queueEvents.queueId, queues.id))
        .where(and(eq(queues.queueDate, queueDate), eq(queueEvents.stationId, st.id), inArray(queueEvents.event, ['BLOOD_COLLECTION_CALLED', 'BLOOD_COLLECTION_RECALLED', 'AUTO_CALLED'])))
        .orderBy(desc(queueEvents.createdAt))
        .limit(1)
        .then(r => r[0] ?? null);
      if (raw) {
        let displayStatus = 'COMPLETED';
        if (raw.q.currentStationId === st.id) displayStatus = raw.q.status;
        bloodDisplayData.push({ q: { ...raw.q, displayStatus, lastCallTime: raw.eventAt.toISOString() }, s: st });
      }
    }
    return { loket1, loket2, bloodDisplayData, mejaStations, today: queueDate };
  },

  // Tx-aware helpers
  async findNextWaitingForUpdateTx(tx: any, stage: string, queueDate: string) {
    const rows = await tx
      .select()
      .from(queues)
      .where(and(eq(queues.currentStage, stage), eq(queues.status, 'WAITING'), eq(queues.queueDate, queueDate)))
      .orderBy(asc(queues.sequenceNumber), asc(queues.createdAt))
      .limit(1)
      .for('update');
    return rows[0] ?? null;
  },

  async createTx(tx: any, data: NewQueue) {
    const rows = await tx.insert(queues).values(data).returning();
    return rows[0];
  },

  async updateTx(tx: any, id: string, data: Partial<NewQueue>) {
    const rows = await tx
      .update(queues)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(queues.id, id))
      .returning();
    return rows[0] ?? null;
  },

  async claimForStationTx(tx: any, queueId: string, stationId: string) {
    const rows = await tx
      .update(queues)
      .set({ status: 'CALLED', currentStationId: stationId, calledAt: new Date(), updatedAt: new Date() })
      .where(eq(queues.id, queueId))
      .returning();
    return rows[0] ?? null;
  },

  async findNextWaitingTx(tx: any, stage: string, queueDate: string) {
    const rows = await tx
      .select()
      .from(queues)
      .where(and(eq(queues.currentStage, stage), eq(queues.status, 'WAITING'), eq(queues.queueDate, queueDate)))
      .orderBy(asc(queues.sequenceNumber), asc(queues.createdAt))
      .limit(1)
      .for('update');
    return rows[0] ?? null;
  },
};
