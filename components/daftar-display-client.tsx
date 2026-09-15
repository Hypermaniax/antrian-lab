"use client";

import { useEffect, useState } from "react";
import { Volume2 } from "lucide-react";
import { fetchDisplayData } from "@/actions/queueActions";
import type { Queue } from "@/db/schema";

type DisplayQueue = Partial<Queue> & { displayStatus?: string };

export function DaftarDisplayClient({
  initialLoket1,
  initialLoket2,
}: {
  initialLoket1: DisplayQueue | null;
  initialLoket2: DisplayQueue | null;
}) {
  const [loket1, setLoket1] = useState<DisplayQueue | null>(initialLoket1);
  const [loket2, setLoket2] = useState<DisplayQueue | null>(initialLoket2);

  // Background fetch (fallback consistency)
  useEffect(() => {
    const fetchLatest = async () => {
      const res = await fetchDisplayData();
      if (res.success && res.data) {
        setLoket1(res.data.loket1 as DisplayQueue | null);
        setLoket2(res.data.loket2 as DisplayQueue | null);
      }
    };

    // SSE connection for instant updates
    const eventSource = new EventSource("/api/stream");

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.action === "refresh") {
          fetchLatest();
        }
      } catch (err) {
        // Safe ignore
      }
    };

    eventSource.onerror = (error) => {
      console.error("SSE Error:", error);
    };

    // Slow background polling to ensure absolute consistency (e.g., if SSE drops)
    const interval = setInterval(fetchLatest, 15000);

    return () => {
      eventSource.close();
      clearInterval(interval);
    };
  }, []);

  const getStatusColor = (status?: string) => {
    if (status === "SERVING") return "text-emerald-400 drop-shadow-[0_0_25px_rgba(52,211,153,0.4)]";
    if (status === "CALLED") return "text-amber-400 drop-shadow-[0_0_25px_rgba(251,191,36,0.5)] animate-pulse";
    return "text-zinc-600";
  };

  const getBorderColor = (status?: string) => {
    if (status === "SERVING") return "border-emerald-500/40 shadow-[0_0_40px_rgba(52,211,153,0.1)] bg-emerald-950/10";
    if (status === "CALLED") return "border-amber-500/50 shadow-[0_0_40px_rgba(251,191,36,0.15)] bg-amber-950/10";
    return "border-zinc-800/50 bg-zinc-900/20";
  };

  return (
    <div className="flex-1 grid grid-cols-2 gap-10 p-10 lg:p-12">
      {/* LOKET 1 */}
      <div className={`rounded-[2.5rem] border flex flex-col items-center justify-center relative overflow-hidden transition-all duration-700 ${getBorderColor(loket1?.displayStatus)}`}>
        <div className="absolute top-10 text-4xl font-bold tracking-[0.2em] text-zinc-500">LOKET 1</div>
        
        {loket1 ? (
          <div className="flex flex-col items-center mt-12 w-full px-8">
            <div className="text-zinc-500 text-2xl tracking-[0.3em] font-medium mb-6">NOMOR ANTREAN</div>
            <div className={`text-[12vw] leading-none font-black tracking-tighter ${getStatusColor(loket1.displayStatus)}`}>
              {loket1.queueNumber}
            </div>
            <div className="text-2xl text-zinc-500 mt-4 font-medium tracking-widest">{loket1.patientName ?? "—"}</div>
            
            <div className="mt-16 h-24 flex items-center justify-center w-full max-w-2xl">
              {loket1.displayStatus === "COMPLETED" ? (
                <div className="w-full h-full flex items-center justify-center rounded-2xl bg-zinc-800/40 text-zinc-500 text-4xl font-semibold tracking-wide">
                  Pelayanan Selesai
                </div>
              ) : loket1.displayStatus === "SERVING" ? (
                <div className="w-full h-full flex items-center justify-center rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 text-4xl font-bold tracking-wide shadow-[0_0_30px_rgba(52,211,153,0.15)]">
                  Sedang Dilayani
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center rounded-2xl bg-amber-950/60 border border-amber-500/50 text-amber-400 text-4xl font-bold tracking-wide shadow-[0_0_30px_rgba(251,191,36,0.15)] gap-4">
                  <Volume2 className="h-10 w-10 animate-pulse" />
                  Silakan Menuju Loket 1
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-[10vw] font-black text-zinc-800/50">—</div>
        )}
      </div>

      {/* LOKET 2 */}
      <div className={`rounded-[2.5rem] border flex flex-col items-center justify-center relative overflow-hidden transition-all duration-700 ${getBorderColor(loket2?.displayStatus)}`}>
        <div className="absolute top-10 text-4xl font-bold tracking-[0.2em] text-zinc-500">LOKET 2</div>
        
        {loket2 ? (
          <div className="flex flex-col items-center mt-12 w-full px-8">
            <div className="text-zinc-500 text-2xl tracking-[0.3em] font-medium mb-6">NOMOR ANTREAN</div>
            <div className={`text-[12vw] leading-none font-black tracking-tighter ${getStatusColor(loket2.displayStatus)}`}>
              {loket2.queueNumber}
            </div>
            <div className="text-2xl text-zinc-500 mt-4 font-medium tracking-widest">{loket2.patientName ?? "—"}</div>
            
            <div className="mt-16 h-24 flex items-center justify-center w-full max-w-2xl">
              {loket2.displayStatus === "COMPLETED" ? (
                <div className="w-full h-full flex items-center justify-center rounded-2xl bg-zinc-800/40 text-zinc-500 text-4xl font-semibold tracking-wide">
                  Pelayanan Selesai
                </div>
              ) : loket2.displayStatus === "SERVING" ? (
                <div className="w-full h-full flex items-center justify-center rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 text-4xl font-bold tracking-wide shadow-[0_0_30px_rgba(52,211,153,0.15)]">
                  Sedang Dilayani
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center rounded-2xl bg-amber-950/60 border border-amber-500/50 text-amber-400 text-4xl font-bold tracking-wide shadow-[0_0_30px_rgba(251,191,36,0.15)] gap-4">
                  <Volume2 className="h-10 w-10 animate-pulse" />
                  Silakan Menuju Loket 2
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-[10vw] font-black text-zinc-800/50">—</div>
        )}
      </div>
    </div>
  );
}
