"use client";

import { useEffect, useState } from "react";
import { Volume2, Activity } from "lucide-react";
import { fetchDisplayData } from "@/actions/queueActions";
import type { Station } from "@/db/schema";

type MejaMapItem = { queueNumber: string; patientName: string | null; status: string } | null;

const MEJA_COLORS = [
  { accent: "text-cyan-400", glow: "rgba(34,211,238,0.5)", bg: "from-cyan-950/20", border: "border-cyan-500/30", shadow: "shadow-[0_0_60px_rgba(34,211,238,0.08)]", dot: "bg-cyan-500 shadow-[0_0_10px_rgba(34,211,238,0.8)]", statusBg: "bg-cyan-950/60 border-cyan-500/30 text-cyan-400 shadow-[0_0_40px_rgba(34,211,238,0.1)]" },
  { accent: "text-violet-400", glow: "rgba(167,139,250,0.5)", bg: "from-violet-950/20", border: "border-violet-500/30", shadow: "shadow-[0_0_60px_rgba(167,139,250,0.08)]", dot: "bg-violet-500 shadow-[0_0_10px_rgba(167,139,250,0.8)]", statusBg: "bg-violet-950/60 border-violet-500/30 text-violet-400 shadow-[0_0_40px_rgba(167,139,250,0.1)]" },
  { accent: "text-rose-400", glow: "rgba(251,113,133,0.5)", bg: "from-rose-950/20", border: "border-rose-500/30", shadow: "shadow-[0_0_60px_rgba(251,113,133,0.08)]", dot: "bg-rose-500 shadow-[0_0_10px_rgba(251,113,133,0.8)]", statusBg: "bg-rose-950/60 border-rose-500/30 text-rose-400 shadow-[0_0_40px_rgba(251,113,133,0.1)]" },
];

export function PengambilanDisplayClient({
  initialMejaMap,
  mejaStations,
}: {
  initialMejaMap: Record<string, MejaMapItem>;
  mejaStations: Station[];
}) {
  const [mejaMap, setMejaMap] = useState<Record<string, MejaMapItem>>(initialMejaMap);

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

  useEffect(() => {
    const fetchLatest = async () => {
      const res = await fetchDisplayData();
      if (res.success && res.data) {
        const newMap: Record<string, MejaMapItem> = {};
        for (const st of mejaStations) {
          const found = res.data.bloodDisplayData.find((r: any) => r.s.id === st.id);
          newMap[st.id] = found ? { queueNumber: found.q.queueNumber, patientName: found.q.patientName, status: found.q.displayStatus } : null;
        }
        setMejaMap(newMap);
      }
    };

    const eventSource = new EventSource("/api/stream");

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.action === "refresh") {
          fetchLatest();
          if (data.speakData && mejaStations.some(s => s.name === data.speakData.stationName)) {
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

    const interval = setInterval(fetchLatest, 15000);

    return () => {
      eventSource.close();
      clearInterval(interval);
    };
  }, [mejaStations]);

  return (
    <div className={`flex-1 grid gap-6 p-6 lg:p-8 ${mejaStations.length > 2 ? 'grid-cols-3' : 'grid-cols-2'}`}>
      {mejaStations.map((st, index) => {
        const item = mejaMap[st.id];
        const color = MEJA_COLORS[index % MEJA_COLORS.length];
        
        const getCardStyle = () => {
          if (item?.status === "SERVING") return `${color.border} ${color.shadow} bg-gradient-to-b ${color.bg} to-transparent`;
          if (item?.status === "CALLED") return `border-amber-500/40 shadow-[0_0_60px_rgba(251,191,36,0.1)] bg-gradient-to-b from-amber-950/20 to-transparent`;
          return "border-zinc-800/40 bg-zinc-900/30";
        };

        const getNumberColor = () => {
          if (item?.status === "SERVING") return `${color.accent} drop-shadow-[0_0_30px_${color.glow}]`;
          if (item?.status === "CALLED") return "text-amber-400 drop-shadow-[0_0_30px_rgba(251,191,36,0.6)] animate-pulse";
          return "text-zinc-700";
        };

        return (
          <div key={st.id} className={`rounded-[2rem] border flex flex-col items-center justify-center relative overflow-hidden transition-all duration-700 ${getCardStyle()}`}>
            {/* Decorative glow */}
            {item?.status === "CALLED" && (
              <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 to-transparent pointer-events-none animate-glow-pulse" />
            )}
            {item?.status === "SERVING" && (
              <div className={`absolute inset-0 bg-gradient-to-b ${color.bg} to-transparent pointer-events-none opacity-50`} />
            )}
            
            {/* Station label */}
            <div className="absolute top-6 flex items-center gap-2.5">
              <div className={`h-2 w-2 rounded-full ${
                item?.status === "SERVING" ? color.dot :
                item?.status === "CALLED" ? "bg-amber-500 shadow-[0_0_10px_rgba(251,191,36,0.8)] animate-pulse" :
                "bg-zinc-700"
              }`} />
              <span className="text-2xl font-bold tracking-[0.2em] text-zinc-400 uppercase">{st.name.toUpperCase()}</span>
            </div>
            
            {item ? (
              <div className="flex flex-col items-center mt-8 w-full px-4">
                <div className="text-zinc-500 text-sm tracking-[0.4em] font-medium mb-3 uppercase">Nomor Antrean</div>
                <div className={`text-[8vw] xl:text-[9vw] leading-none font-black tracking-tighter transition-all duration-500 ${getNumberColor()}`} style={{fontVariantNumeric: 'tabular-nums'}}>
                  {item.queueNumber}
                </div>
                <div className="text-lg text-zinc-500 mt-3 font-medium tracking-widest">{item.patientName ?? "—"}</div>
                
                <div className="mt-8 h-16 flex items-center justify-center w-full max-w-md">
                  {item.status === "COMPLETED" ? (
                    <div className="w-full h-full flex items-center justify-center rounded-2xl bg-zinc-800/50 text-zinc-500 text-xl xl:text-2xl font-semibold tracking-wide border border-zinc-700/30">
                      Pelayanan Selesai
                    </div>
                  ) : item.status === "SERVING" ? (
                    <div className={`w-full h-full flex items-center justify-center rounded-2xl border ${color.statusBg} text-xl xl:text-2xl font-bold tracking-wide`}>
                      <Activity className="h-6 w-6 mr-2 animate-pulse" />
                      Sedang Dilayani
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center rounded-2xl bg-amber-950/60 border border-amber-500/40 text-amber-400 text-xl xl:text-2xl font-bold tracking-wide shadow-[0_0_30px_rgba(251,191,36,0.12)] gap-2">
                      <Volume2 className="h-6 w-6 animate-pulse" />
                      Silakan Menuju {st.name}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <div className="text-[8vw] font-black text-zinc-800/40">—</div>
                <div className="text-xs text-zinc-700 tracking-widest uppercase">Menunggu</div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
