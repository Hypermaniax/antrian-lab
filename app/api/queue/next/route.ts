import { NextResponse } from 'next/server';
import { callNextQueue } from '@/actions/queueActions';

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const stationId = searchParams.get('stationId');
    
    if (!stationId) {
      return NextResponse.json(
        { success: false, error: 'stationId parameter is required in the URL (e.g. ?stationId=...)' }, 
        { status: 400 }
      );
    }

    const result = await callNextQueue({ stationId });
    
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error }, 
        { status: 400 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('[API /api/queue/next]', error);
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' }, 
      { status: 500 }
    );
  }
}
