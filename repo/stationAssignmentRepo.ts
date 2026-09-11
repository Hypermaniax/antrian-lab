
import { eq, and } from 'drizzle-orm';
import { db } from '../db';
import { stationAssignments } from '../db/schema';
import type { StationAssignment, NewStationAssignment } from '@/types';

export type { StationAssignment, NewStationAssignment };

export const stationAssignmentRepo = {
  async getAll() {
    return db.select().from(stationAssignments);
  },
  
  async getByStationId(stationId: string) {
    return db.select().from(stationAssignments).where(eq(stationAssignments.stationId, stationId));
  },
  
  async getByUserId(userId: string) {
    return db.select().from(stationAssignments).where(eq(stationAssignments.userId, userId));
  },
  
  async create(data: NewStationAssignment) {
    const rows = await db.insert(stationAssignments).values(data).returning();
    return rows[0];
  },
  
  async remove(id: string) {
    const rows = await db.delete(stationAssignments).where(eq(stationAssignments.id, id)).returning();
    return rows[0] ?? null;
  },
  
  async removeByStationAndUser(stationId: string, userId: string) {
    const rows = await db
      .delete(stationAssignments)
      .where(and(eq(stationAssignments.stationId, stationId), eq(stationAssignments.userId, userId)))
      .returning();
    return rows[0] ?? null;
  }
  
};
