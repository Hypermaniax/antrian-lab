"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { callNextQueue, recallQueue, startQueueService, completeQueueService } from "@/actions/queueActions"
import { Loader2, Megaphone, Play, CheckCircle2, RotateCcw, Hash, Info, Users } from "lucide-react"

type Queue = {
  id: string
  queueNumber: string
  patientName: string | null
  currentStage: string
  status: string
  currentStationId: string | null
  createdAt: string | Date
}

export function RegistrationClient({ station, waiting, current }: { station: { id: string; name: string; code: string }; waiting: Queue[]; current: Queue | null }) {
  const [loading, setLoading] = React.useState<string | null>(null)
  const [msg, setMsg] = React.useState<string | null>(null)

  async function handleCall() {
    setLoading("call")
    setMsg(null)
    const res = await callNextQueue(station.id)
    setLoading(null)
    if (!res.success) setMsg(res.error)
    else location.reload()
  }
  async function handleRecall(q: Queue) {
    setLoading(`recall-${q.id}`)
    const res = await recallQueue(q.id, station.id)
    setLoading(null)
    if (!res.success) setMsg(res.error)
    else setMsg(`Recall ${q.queueNumber} dikirim ke display`)
  }
  async function handleStart(q: Queue) {
    setLoading(`start-${q.id}`)
    const res = await startQueueService(q.id, station.id)
    setLoading(null)
    if (!res.success) setMsg(res.error)
    else location.reload()
  }
  async function handleComplete(q: Queue) {
    setLoading(`complete-${q.id}`)
    const res = await completeQueueService(q.id, station.id)
    setLoading(null)
    if (!res.success) setMsg(res.error)
    else location.reload()
  }

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-4">
        <Card className="rounded-2xl shadow-sm hover:shadow-md transition-shadow border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-blue-500/10 grid place-items-center">
                <Hash className="h-4 w-4 text-blue-600" />
              </div>
              {station.name}
              <Badge variant="secondary" className="bg-blue-500/10 text-blue-700 border-0">{station.code}</Badge>
              <Badge variant="outline" className="text-[10px] text-muted-foreground">REGISTRATION</Badge>
            </CardTitle>
            <CardDescription>Panggil → CALLED → Mulai Layani → Selesai (pindah ke BLOOD_COLLECTION)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {current ? (
              <div className="rounded-2xl border-2 border-primary/30 p-6 text-center space-y-4 bg-gradient-to-b from-primary/5 to-background">
                <div className="text-xs font-medium text-muted-foreground tracking-wider uppercase">Sedang Dipanggil / Dilayani</div>
                <div className="text-5xl sm:text-6xl font-mono font-black tracking-widest text-primary">{current.queueNumber}</div>
                <div className="flex items-center justify-center gap-2 text-sm">
                  <span>{current.patientName ?? "Pasien anonim"}</span>
                  <Badge variant="outline" className={`text-xs ${
                    current.status === "CALLED" ? "border-amber-300 text-amber-700 bg-amber-50" :
                    current.status === "SERVING" ? "border-emerald-300 text-emerald-700 bg-emerald-50" : ""
                  }`}>{current.status}</Badge>
                </div>
                <Separator />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <Button variant="outline" disabled={loading!==null} onClick={()=>handleRecall(current)} className="rounded-xl">
                    {loading===`recall-${current.id}` ? <Loader2 className="h-4 w-4 animate-spin mr-1"/> : <Megaphone className="h-4 w-4 mr-1"/>} Panggil Ulang
                  </Button>
                  <Button disabled={current.status!=="CALLED" || loading!==null} onClick={()=>handleStart(current)} className="rounded-xl bg-gradient-to-r from-primary to-primary/80 shadow-md hover:shadow-lg transition-all hover:scale-[1.02]">
                    {loading===`start-${current.id}` ? <Loader2 className="h-4 w-4 animate-spin mr-1"/> : <Play className="h-4 w-4 mr-1"/>} Mulai Layani
                  </Button>
                  <Button disabled={current.status!=="SERVING" || loading!==null} onClick={()=>handleComplete(current)} className="rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 shadow-md hover:shadow-lg transition-all hover:scale-[1.02]">
                    {loading===`complete-${current.id}` ? <Loader2 className="h-4 w-4 animate-spin mr-1"/> : <CheckCircle2 className="h-4 w-4 mr-1"/>} Selesai Loket
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">Selesai registrasi akan otomatis pindah ke BLOOD_COLLECTION / WAITING.</p>
              </div>
            ) : (
              <div className="rounded-2xl border-2 border-dashed p-8 text-center space-y-4">
                <div className="mx-auto h-14 w-14 rounded-2xl bg-muted/50 grid place-items-center">
                  <Megaphone className="h-6 w-6 text-muted-foreground/50" />
                </div>
                <div className="text-sm text-muted-foreground">Tidak ada antrean yang sedang dipanggil.</div>
                <Button onClick={handleCall} disabled={loading==="call" || waiting.length===0} size="lg" className="rounded-xl bg-gradient-to-r from-primary to-primary/80 shadow-md hover:shadow-lg transition-all hover:scale-[1.02]">
                  {loading==="call" ? <Loader2 className="h-4 w-4 animate-spin mr-1"/> : <Megaphone className="h-4 w-4 mr-1"/>} Panggil Berikutnya {waiting.length>0 ? `(${waiting[0].queueNumber})` : ""}
                </Button>
                {waiting.length===0 && <div className="text-xs text-muted-foreground">Tidak ada WAITING untuk REGISTRATION hari ini.</div>}
              </div>
            )}

            {msg && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0 text-amber-600" />
                {msg}
              </div>
            )}

            {current && waiting.length>0 && (
              <Button variant="ghost" size="sm" onClick={handleCall} disabled={loading==="call"} className="w-full rounded-xl">
                {loading==="call" ? <Loader2 className="h-3 w-3 animate-spin mr-1"/> : <RotateCcw className="h-3 w-3 mr-1"/>} Panggil Berikutnya tetap (concurrency-safe)
              </Button>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <div className="h-7 w-7 rounded-lg bg-muted grid place-items-center">
                <Users className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
              Daftar Tunggu
              {waiting.length > 0 && (
                <Badge variant="secondary" className="text-[10px] bg-primary/10 text-primary border-0">{waiting.length}</Badge>
              )}
            </CardTitle>
            <CardDescription className="text-xs">Urut nomor terkecil — transaction FOR UPDATE saat claim.</CardDescription>
          </CardHeader>
          <CardContent>
            {waiting.length===0 ? (
              <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
                <div className="mx-auto h-10 w-10 rounded-xl bg-muted/50 grid place-items-center mb-2">
                  <Users className="h-4 w-4 text-muted-foreground/50" />
                </div>
                Kosong — semua sudah dipanggil atau belum ada antrean baru.
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-2">
                {waiting.slice(0,8).map(q=>(
                  <div key={q.id} className="rounded-xl border p-3.5 flex items-center justify-between hover:bg-muted/20 transition-colors">
                    <div>
                      <div className="font-mono font-bold text-primary">{q.queueNumber}</div>
                      <div className="text-xs text-muted-foreground">{q.patientName ?? "—"} • {new Date(q.createdAt).toLocaleTimeString("id-ID")}</div>
                    </div>
                    <Badge variant="secondary" className="text-[10px] bg-amber-500/10 text-amber-700 border-0">{q.status}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <Card className="rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <div className="h-6 w-6 rounded-lg bg-muted grid place-items-center">
                <Info className="h-3 w-3 text-muted-foreground" />
              </div>
              Info Station
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs space-y-3 text-muted-foreground">
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/30">
              <span>ID</span>
              <span className="font-mono text-foreground">{station.id.slice(0,8)}</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/30">
              <span>Stage</span>
              <Badge variant="outline" className="text-[10px]">REGISTRATION</Badge>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/30">
              <span>Broadcast</span>
              <span className="font-mono text-[10px] text-foreground">CALLED / RECALLED</span>
            </div>
            <Separator />
            <div className="rounded-xl bg-muted/30 p-3 border border-border/50">
              <div className="flex items-center gap-1.5 text-foreground font-medium mb-1">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                Tanpa Auth
              </div>
              <p className="text-[10px]">Mode pengembangan — semua operator bisa operasikan station ini.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
