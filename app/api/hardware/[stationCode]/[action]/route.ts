import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { stations } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { queueService } from '@/services/queue.service';
import { getActiveQueueId } from '../../hardware-helper';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ stationCode: string; action: string }> }
) {
  try {
    const resolvedParams = await params;
    // 1. Validate station code (e.g. "LOKET_1", "MEJA_2")
    const stationCode = resolvedParams.stationCode.toUpperCase();
    const action = resolvedParams.action.toLowerCase();
    
    // 2. Fetch the station ID from database using the code
    const stationRecord = await db.select().from(stations).where(eq(stations.code, stationCode)).limit(1);
    if (stationRecord.length === 0) {
      return NextResponse.json({ error: `Station code '${stationCode}' not found` }, { status: 404 });
    }
    const stationId = stationRecord[0].id;

    let data;

    // 3. Execute the action
    switch (action) {
      case 'call':
        try {
          // AUTO-COMPLETE: if there is an active queue, complete it first automatically.
          // Note: completeQueueService ALREADY auto-calls the next patient in its internal logic!
          const activeQueueId = await getActiveQueueId(stationId);
          if (activeQueueId) {
            data = await queueService.completeQueueService(activeQueueId, stationId);
          }
        } catch (e) {
          // If there is NO active queue (e.g. at the start of the day), we just call normally
          data = await queueService.callNextQueue(stationId);
        }
        break;
      
      case 'recall': {
        const queueId = await getActiveQueueId(stationId);
        data = await queueService.recallQueue(queueId, stationId);
        break;
      }
      
      case 'start': {
        const queueId = await getActiveQueueId(stationId);
        data = await queueService.startQueueService(queueId, stationId);
        break;
      }
      
      case 'complete': {
        const queueId = await getActiveQueueId(stationId);
        data = await queueService.completeQueueService(queueId, stationId);
        break;
      }
      
      default:
        return NextResponse.json(
          { error: `Invalid action '${action}'. Use call, recall, start, or complete.` },
          { status: 400 }
        );
    }

    // 4. Return success to Arduino
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
