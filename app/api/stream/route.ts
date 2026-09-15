import { NextRequest } from "next/server";
import { eventEmitter } from "@/lib/eventEmitter";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // Send initial connection successful message
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ action: 'connected' })}\n\n`));

      const onRefresh = (data: any) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        } catch (e) {
          // Stream might be closed
        }
      };

      eventEmitter.on('refresh', onRefresh);

      req.signal.addEventListener("abort", () => {
        eventEmitter.off('refresh', onRefresh);
        try {
            controller.close();
        } catch(e) {}
      });
    }
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
    },
  });
}
