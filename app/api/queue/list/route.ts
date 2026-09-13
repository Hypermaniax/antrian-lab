import { NextResponse } from 'next/server';
import { fetchQueues } from '@/actions/queueActions';

export async function GET() {
  try {
    const result = await fetchQueues();
    
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error }, 
        { status: 400 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('[API /api/queue/list]', error);
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' }, 
      { status: 500 }
    );
  }
}
