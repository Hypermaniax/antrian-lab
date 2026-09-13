import { NextResponse } from 'next/server';
import { recallQueue } from '@/actions/queueActions';

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const stationId = searchParams.get('stationId');
    const queueIdParam = searchParams.get('queueId');

    let body: any = {};
    try {
      body = await request.json();
    } catch {
      // Body is optional if queueId is in URL
    }
    
    const queueId = body.queueId || queueIdParam;
    
    if (!queueId || !stationId) {
      return NextResponse.json(
        { success: false, error: 'stationId in URL and queueId (in URL or body) are required' }, 
        { status: 400 }
      );
    }

    const result = await recallQueue({ queueId, stationId });
    
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error }, 
        { status: 400 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('[API /api/queue/recall]', error);
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' }, 
      { status: 500 }
    );
  }
}
