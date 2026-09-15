import { queueService } from "@/services/queue.service";
import { DaftarDisplayClient } from "@/components/daftar-display-client";
import type { Queue } from "@/db/schema";

export const dynamic = "force-dynamic";

export default async function DaftarDisplayPage() {
  const { loket1, loket2 } = await queueService.getDisplayData();

  return (
    <main className="h-screen w-screen overflow-hidden bg-zinc-950 text-white flex flex-col font-sans">
      <DaftarDisplayClient initialLoket1={loket1 as any} initialLoket2={loket2 as any} />
      
      {/* FOOTER TICKER */}
      <div className="h-14 bg-zinc-900 border-t border-zinc-800/80 flex items-center px-12 text-zinc-500 text-base tracking-[0.2em] uppercase font-semibold">
        <span className="flex items-center gap-3">
          <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.8)]" /> 
          Sistem Antrean Realtime
        </span>
      </div>
    </main>
  );
}
