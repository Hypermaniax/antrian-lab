"use client";

import { useEffect, useState } from "react";
import { Volume2, Activity } from "lucide-react";
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

  const speak = (queueNumber: string, stationName: string) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      
      const letter = queueNumber.charAt(0);
      const numbers = queueNumber.slice(1).split("").join(" ");
      const text = `Nomor antrean, ${letter}, ${numbers}, silakan menuju, ${stationName}`;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "id-ID";
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    }
  };

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
          if (data.speakData && data.speakData.stationName.startsWith("Loket")) {
            speak(data.speakData.queueNumber, data.speakData.stationName);
          }
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

  // Audio is now handled by the SSE event listener above.

  const getStatusColor = (status?: string) => {
    if (status === "SERVING") return "text-emerald-400 drop-shadow-[0_0_30px_rgba(52,211,153,0.5)]";
    if (status === "CALLED") return "text-amber-400 drop-shadow-[0_0_30px_rgba(251,191,36,0.6)] animate-pulse";
    return "text-zinc-700";
  };

  const getCardStyle = (status?: string) => {
    if (status === "SERVING") return "border-emerald-500/30 shadow-[0_0_60px_rgba(52,211,153,0.08)] bg-gradient-to-b from-emerald-950/20 to-transparent";
    if (status === "CALLED") return "border-amber-500/40 shadow-[0_0_60px_rgba(251,191,36,0.1)] bg-gradient-to-b from-amber-950/20 to-transparent";
    return "border-zinc-800/40 bg-zinc-900/30";
  };

  const renderLoket = (loket: DisplayQueue | null, name: string, index: number) => (
    <div className={`rounded-[2rem] border flex flex-col items-center justify-center relative overflow-hidden transition-all duration-700 ${getCardStyle(loket?.displayStatus)}`}>
      {/* Decorative glow */}
      {loket?.displayStatus === "CALLED" && (
        <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 to-transparent pointer-events-none animate-glow-pulse" />
      )}
      {loket?.displayStatus === "SERVING" && (
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 to-transparent pointer-events-none" />
      )}
      
      {/* Station label */}
      <div className="absolute top-8 flex items-center gap-3">
        <div className={`h-2.5 w-2.5 rounded-full ${
          loket?.displayStatus === "SERVING" ? "bg-emerald-500 shadow-[0_0_10px_rgba(52,211,153,0.8)]" :
          loket?.displayStatus === "CALLED" ? "bg-amber-500 shadow-[0_0_10px_rgba(251,191,36,0.8)] animate-pulse" :
          "bg-zinc-700"
        }`} />
        <span className="text-3xl font-bold tracking-[0.25em] text-zinc-400 uppercase">{name}</span>
      </div>
      
      {loket ? (
        <div className="flex flex-col items-center mt-10 w-full px-8">
          <div className="text-zinc-500 text-lg tracking-[0.4em] font-medium mb-4 uppercase">Nomor Antrean</div>
          <div className={`text-[12vw] leading-none font-black tracking-tighter transition-all duration-500 ${getStatusColor(loket.displayStatus)}`} style={{fontVariantNumeric: 'tabular-nums'}}>
            {loket.queueNumber}
          </div>
          <div className="text-xl text-zinc-500 mt-4 font-medium tracking-widest">{loket.patientName ?? "—"}</div>
          
          <div className="mt-12 h-20 flex items-center justify-center w-full max-w-xl">
            {loket.displayStatus === "COMPLETED" ? (
              <div className="w-full h-full flex items-center justify-center rounded-2xl bg-zinc-800/50 text-zinc-500 text-3xl font-semibold tracking-wide border border-zinc-700/30">
                Pelayanan Selesai
              </div>
            ) : loket.displayStatus === "SERVING" ? (
              <div className="w-full h-full flex items-center justify-center rounded-2xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 text-3xl font-bold tracking-wide shadow-[0_0_40px_rgba(52,211,153,0.1)]">
                <Activity className="h-7 w-7 mr-3 animate-pulse" />
                Sedang Dilayani
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center rounded-2xl bg-amber-950/60 border border-amber-500/40 text-amber-400 text-3xl font-bold tracking-wide shadow-[0_0_40px_rgba(251,191,36,0.12)] gap-3">
                <Volume2 className="h-8 w-8 animate-pulse" />
                Silakan Menuju {name}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3">
          <div className="text-[10vw] font-black text-zinc-800/40">—</div>
          <div className="text-sm text-zinc-700 tracking-widest uppercase">Menunggu</div>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex-1 grid grid-cols-2 gap-8 p-8 lg:p-10">
      {renderLoket(loket1, "Loket 1", 0)}
      {renderLoket(loket2, "Loket 2", 1)}
    </div>
  );
}
