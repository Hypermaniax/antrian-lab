import { NextRequest } from "next/server";
import { eventEmitter } from "@/lib/eventEmitter";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const stream = new ReadableStream({
    start(controller) {
      // Send an initial connected message
      controller.enqueue(`data: {"type": "connected"}\n\n`);

      const listener = (data: any) => {
        try {
          controller.enqueue(`data: ${JSON.stringify(data)}\n\n`);
        } catch (e) {
          console.error("Error writing to stream", e);
        }
      };

      eventEmitter.on("refresh", listener);

      req.signal.addEventListener("abort", () => {
        eventEmitter.off("refresh", listener);
        try {
          controller.close();
        } catch (e) {
          // Ignore if already closed
        }
      });
    }
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no", // Disable buffering for Nginx proxy just in case
    },
  });
}
