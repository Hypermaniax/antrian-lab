import { queueService } from "@/services/queue.service";
import { DaftarDisplayClient } from "@/components/daftar-display-client";
import type { Queue } from "@/db/schema";

export const dynamic = "force-dynamic";

export default async function DaftarDisplayPage() {
  const { loket1, loket2 } = await queueService.getDisplayData();

  return (
    <main className="h-screen w-screen overflow-hidden mesh-bg text-white flex flex-col font-sans">
      <DaftarDisplayClient initialLoket1={loket1 as any} initialLoket2={loket2 as any} />
      
      {/* FOOTER TICKER */}
      <div className="h-12 bg-zinc-900/80 backdrop-blur-sm border-t border-zinc-800/60 flex items-center overflow-hidden relative">
        <div className="flex items-center gap-4 px-8 animate-ticker whitespace-nowrap">
          <span className="flex items-center gap-2 text-zinc-400 text-sm tracking-[0.15em] uppercase font-semibold">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            </span>
            Sistem Antrean Realtime
          </span>
          <span className="text-zinc-700 mx-4">•</span>
          <span className="text-zinc-500 text-sm tracking-wider">Loket 1 — Daftar Pengambilan Darah</span>
          <span className="text-zinc-700 mx-4">•</span>
          <span className="text-zinc-500 text-sm tracking-wider">Loket 2 — Pengambilan Hasil</span>
          <span className="text-zinc-700 mx-4">•</span>
          <span className="text-zinc-500 text-sm tracking-wider">Silakan menunggu nomor Anda dipanggil</span>
          {/* Duplicate for seamless loop */}
          <span className="text-zinc-700 mx-8">•</span>
          <span className="flex items-center gap-2 text-zinc-400 text-sm tracking-[0.15em] uppercase font-semibold">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            Sistem Antrean Realtime
          </span>
          <span className="text-zinc-700 mx-4">•</span>
          <span className="text-zinc-500 text-sm tracking-wider">Loket 1 — Daftar Pengambilan Darah</span>
          <span className="text-zinc-700 mx-4">•</span>
          <span className="text-zinc-500 text-sm tracking-wider">Loket 2 — Pengambilan Hasil</span>
          <span className="text-zinc-700 mx-4">•</span>
          <span className="text-zinc-500 text-sm tracking-wider">Silakan menunggu nomor Anda dipanggil</span>
        </div>
      </div>
    </main>
  );
}
