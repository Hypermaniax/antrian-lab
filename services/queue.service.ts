/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { db } from '@/db';
import { eventEmitter } from '@/lib/eventEmitter';
import { queueRepo } from '@/repo/queueRepo';
import { queueServiceRepo } from '@/repo/queueServiceRepo';
import { stationRepo } from '@/repo/stationRepo';
import { queueSequenceRepo } from '@/repo/queueSequenceRepo';
import { queueEventRepo } from '@/repo/queueEventRepo';
import { QUEUE_STAGE, QUEUE_STATUS, QUEUE_EVENT } from '@/lib/constants';

// ── helpers ──────────────────────────────────────────────────────────
const formatQueueNumber = (prefix: string, seq: number) => `${prefix}${String(seq).padStart(3, '0')}`;
const todayDateString = () => new Date().toISOString().split('T')[0];
const notifyDisplay = (speakData?: { queueNumber: string; stationName: string }) => {
  try {
    eventEmitter.emit('refresh', { action: 'refresh', timestamp: Date.now(), speakData });
  } catch (e) {
    // safe ignore
  }
};

const getInitialStage = (service: { code: string; prefix: string }) =>
  service.code === 'PENGAMBILAN_HASIL' || service.code === 'RESULT_PICKUP' || service.prefix === 'H'
    ? QUEUE_STAGE.RESULT_PICKUP
    : QUEUE_STAGE.REGISTRATION;

const STAGE_EVENTS = {
  [QUEUE_STAGE.REGISTRATION]: {
    called: QUEUE_EVENT.REGISTRATION_CALLED,
    recalled: QUEUE_EVENT.REGISTRATION_RECALLED,
    started: QUEUE_EVENT.REGISTRATION_STARTED,
    completed: QUEUE_EVENT.REGISTRATION_COMPLETED,
  },
  [QUEUE_STAGE.RESULT_PICKUP]: {
    called: QUEUE_EVENT.RESULT_PICKUP_CALLED,
    recalled: QUEUE_EVENT.RESULT_PICKUP_RECALLED,
    started: QUEUE_EVENT.RESULT_PICKUP_STARTED,
    completed: QUEUE_EVENT.RESULT_PICKUP_COMPLETED,
  },
  [QUEUE_STAGE.BLOOD_COLLECTION]: {
    called: QUEUE_EVENT.BLOOD_COLLECTION_CALLED,
    recalled: QUEUE_EVENT.BLOOD_COLLECTION_RECALLED,
    started: QUEUE_EVENT.BLOOD_COLLECTION_STARTED,
    completed: QUEUE_EVENT.BLOOD_COLLECTION_COMPLETED,
  },
} as const;

const getStageEvent = (stage: string, type: keyof (typeof STAGE_EVENTS)[keyof typeof STAGE_EVENTS]) => {
  const entry = STAGE_EVENTS[stage as keyof typeof STAGE_EVENTS];
  if (!entry) throw new Error(`Unknown stage: ${stage}`);
  return entry[type];
};

type CompletionConfig = {
  nextStage: string | null;
  nextStatus: string;
  completedEvent: string;
  autoCallStage: string | null;
};

const COMPLETION_CONFIG: Record<string, CompletionConfig> = {
  [QUEUE_STAGE.REGISTRATION]: {
    nextStage: QUEUE_STAGE.BLOOD_COLLECTION,
    nextStatus: QUEUE_STATUS.WAITING,
    completedEvent: QUEUE_EVENT.REGISTRATION_COMPLETED,
    autoCallStage: QUEUE_STAGE.REGISTRATION,
  },
  [QUEUE_STAGE.RESULT_PICKUP]: {
    nextStage: null,
    nextStatus: QUEUE_STATUS.COMPLETED,
    completedEvent: QUEUE_EVENT.RESULT_PICKUP_COMPLETED,
    autoCallStage: QUEUE_STAGE.RESULT_PICKUP,
  },
  [QUEUE_STAGE.BLOOD_COLLECTION]: {
    nextStage: null,
    nextStatus: QUEUE_STATUS.COMPLETED,
    completedEvent: QUEUE_EVENT.BLOOD_COLLECTION_COMPLETED,
    autoCallStage: QUEUE_STAGE.BLOOD_COLLECTION,
  },
};

async function autoCallNext(
  tx: any,
  stage: string,
  queueDate: string,
  station: { id: string },
  sourceQueueId: string
) {
  const next = await queueRepo.findNextWaitingTx(tx, stage, queueDate);
  if (!next) return null;
  const called = await queueRepo.claimForStationTx(tx, next.id, station.id);
  await queueEventRepo.createTx(tx, {
    queueId: called.id,
    event: QUEUE_EVENT.AUTO_CALLED,
    stage,
    stationId: station.id,
    metadata: { autoCalledFrom: sourceQueueId },
  });
  return called;
}

// ── service object — semua query ke repo, service cuma orkestrasi bisnis ─────────────────────
export const queueService = {
  async resetToday() {
    const queueDate = todayDateString();
    return db.transaction(async (tx) => {
      // Drizzle doesn't support easy multi-table delete without raw sql sometimes, 
      // but we can import the tables and delete them
      const { queues, queueSequences, queueEvents } = await import('@/db/schema');
      const { eq } = await import('drizzle-orm');
      // queueEvents cascadingly deleted? 
      // actually queues delete doesn't cascade queueEvents if it's not set in schema. Let's delete events first.
      // Or simply raw sql
      const { sql } = await import('drizzle-orm');
      await tx.execute(sql`DELETE FROM queue_events WHERE queue_id IN (SELECT id FROM queues WHERE queue_date = ${queueDate})`);
      await tx.execute(sql`DELETE FROM queues WHERE queue_date = ${queueDate}`);
      await tx.execute(sql`DELETE FROM queue_sequences WHERE queue_date = ${queueDate}`);
      
      notifyDisplay();
      return true;
    });
  },
  async createQueue(data: { queueServiceId: string; patientName?: string | null; patientId?: string | null }) {
    const service = await queueServiceRepo.getById(data.queueServiceId);
    if (!service) throw new Error('Service not found');
    if (!service.isActive) throw new Error('Service is inactive');
    const queueDate = todayDateString();
    return db.transaction(async (tx) => {
      const existingRows = await queueSequenceRepo.findForUpdateTx(tx, data.queueServiceId, queueDate);
      const sequence =
        existingRows.length === 0
          ? await queueSequenceRepo.createTx(tx, { queueServiceId: data.queueServiceId, queueDate, lastNumber: 1 })
          : await queueSequenceRepo.updateLastNumberTx(tx, existingRows[0].id, existingRows[0].lastNumber + 1);
      const queueNumber = formatQueueNumber(service.prefix, sequence.lastNumber);
      const initialStage = getInitialStage(service);
      const queue = await queueRepo.createTx(tx, {
        queueServiceId: data.queueServiceId,
        patientId: data.patientId || null,
        patientName: data.patientName?.trim() || null,
        queueDate,
        sequenceNumber: sequence.lastNumber,
        queueNumber,
        currentStage: initialStage,
        status: QUEUE_STATUS.WAITING,
      });
      await queueEventRepo.createTx(tx, {
        queueId: queue.id,
        event: QUEUE_EVENT.CREATED,
        stage: initialStage,
        metadata: { queueNumber, sequenceNumber: sequence.lastNumber, serviceCode: service.code },
      });
      return queue;
    });
  },

  async callNextQueue(stationId: string) {
    if (!stationId) throw new Error('Station ID required');
    const station = await stationRepo.getById(stationId);
    if (!station) throw new Error('Station not found');
    if (!station.isActive) throw new Error('Station is inactive');
    const result = await db.transaction(async (tx) => {
      const queue = await queueRepo.findNextWaitingForUpdateTx(tx, station.stage, todayDateString());
      if (!queue) return null;
      const updated = await queueRepo.claimForStationTx(tx, queue.id, station.id);
      await queueEventRepo.createTx(tx, {
        queueId: queue.id,
        event: getStageEvent(station.stage, 'called'),
        stage: station.stage,
        stationId: station.id,
      });
      return updated;
    });
    if (!result) throw new Error('No waiting queue available');
    notifyDisplay({ queueNumber: result.queueNumber, stationName: station.name });
    return result;
  },

  async recallQueue(queueId: string, stationId: string) {
    if (!queueId || !stationId) throw new Error('Queue ID and Station ID required');
    const [station, queue] = await Promise.all([stationRepo.getById(stationId), queueRepo.getById(queueId)]);
    if (!station) throw new Error('Station not found');
    if (!queue) throw new Error('Queue not found');
    if (queue.status !== QUEUE_STATUS.CALLED) throw new Error('Only CALLED queue can be recalled');
    if (queue.currentStationId !== stationId) throw new Error('Queue is not assigned to this station');
    await queueEventRepo.create({
      queueId,
      event: getStageEvent(queue.currentStage, 'recalled'),
      stage: queue.currentStage,
      stationId,
    });
    notifyDisplay({ queueNumber: queue.queueNumber, stationName: station.name });
    return queue;
  },

  async startQueueService(queueId: string, stationId: string) {
    if (!queueId || !stationId) throw new Error('Queue ID and Station ID required');
    const queue = await queueRepo.getById(queueId);
    if (!queue) throw new Error('Queue not found');
    if (queue.status !== QUEUE_STATUS.CALLED) throw new Error('Queue must be CALLED to start');
    if (queue.currentStationId !== stationId) throw new Error('Queue not assigned to this station');
    const updated = await queueRepo.update(queueId, { status: QUEUE_STATUS.SERVING, servingAt: new Date() });
    await queueEventRepo.create({
      queueId,
      event: getStageEvent(queue.currentStage, 'started'),
      stage: queue.currentStage,
      stationId,
    });
    notifyDisplay();
    return updated;
  },

  async completeQueueService(queueId: string, stationId: string) {
    if (!queueId || !stationId) throw new Error('Queue ID and Station ID required');
    const [station, queue] = await Promise.all([stationRepo.getById(stationId), queueRepo.getById(queueId)]);
    if (!station) throw new Error('Station not found');
    if (!station.isActive) throw new Error('Station inactive');
    if (!queue) throw new Error('Queue not found');
    if (queue.status !== QUEUE_STATUS.SERVING && queue.status !== QUEUE_STATUS.CALLED) throw new Error('Queue must be SERVING or CALLED to complete');
    if (queue.currentStationId !== stationId) throw new Error('Queue not assigned to this station');
    const config = COMPLETION_CONFIG[queue.currentStage];
    if (!config) throw new Error(`Unknown stage: ${queue.currentStage}`);
    const result = await db.transaction(async (tx) => {
      const completedQueue = await queueRepo.updateTx(tx, queueId, {
        ...(config.nextStage ? { currentStage: config.nextStage } : {}),
        status: config.nextStatus,
        currentStationId: config.nextStage ? (null as any) : undefined,
        completedAt: new Date(),
      });
      await queueEventRepo.createTx(tx, { queueId, event: config.completedEvent, stage: queue.currentStage, stationId });
      const autoCalled = config.autoCallStage ? await autoCallNext(tx as never, config.autoCallStage, queue.queueDate, station, queueId) : null;
      return { completedQueue, autoCalled };
    });
    if (result.autoCalled) {
      notifyDisplay({ queueNumber: result.autoCalled.queueNumber, stationName: station.name });
    } else {
      notifyDisplay();
    }
    return result;
  },

  getAllQueues: () => queueRepo.getAll(),
  async getQueueById(id: string) {
    const data = await queueRepo.getById(id);
    if (!data) throw new Error('Queue not found');
    return data;
  },
  
  getWaitingByStage: (stage: string) => queueRepo.getWaitingByStage(stage, todayDateString()),

  getRecentQueues: (limit = 6) => queueRepo.getRecent(limit),

  getDashboardStats: (date?: string) => queueRepo.getDashboardStats(date ?? todayDateString()),

  getDisplayData: (date?: string) => queueRepo.getDisplayData(date ?? todayDateString()),

  getActiveQueuesByStationIds: (stationIds: string[]) => queueRepo.getActiveByStationIds(stationIds, todayDateString()),
  
  getPaginatedQueues: (page: number, limit: number, stage?: string, date?: string) => queueRepo.getPaginated(page, limit, stage, date),
};
