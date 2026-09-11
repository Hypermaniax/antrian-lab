"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { callNextQueue, recallQueue, startQueueService, completeQueueService } from "@/actions/queueActions"
import { Loader2, Megaphone, Play, CheckCircle2, RotateCcw } from "lucide-react"

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
        <Card className="border-primary/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              {station.name} <Badge variant="secondary">{station.code}</Badge>
              <Badge variant="outline">REGISTRATION</Badge>
            </CardTitle>
            <CardDescription>Flow: Panggil Berikutnya → CALLED → Mulai Layani (SERVING) → Selesai (pindah ke BLOOD_COLLECTION WAITING)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {current ? (
              <div className="rounded-xl border-2 border-primary p-4 sm:p-6 text-center space-y-3">
                <div className="text-xs text-muted-foreground">Sedang dipanggil / dilayani</div>
                <div className="text-4xl sm:text-5xl font-mono font-bold tracking-widest">{current.queueNumber}</div>
                <div className="text-sm">{current.patientName ?? "Pasien anonim"} • <Badge variant="outline">{current.status}</Badge></div>
                <Separator />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <Button variant="outline" disabled={loading!==null} onClick={()=>handleRecall(current)}>
                    {loading===`recall-${current.id}` ? <Loader2 className="h-4 w-4 animate-spin"/> : <Megaphone className="h-4 w-4"/>} Panggil Ulang
                  </Button>
                  <Button disabled={current.status!=="CALLED" || loading!==null} onClick={()=>handleStart(current)}>
                    {loading===`start-${current.id}` ? <Loader2 className="h-4 w-4 animate-spin"/> : <Play className="h-4 w-4"/>} Mulai Layani
                  </Button>
                  <Button disabled={current.status!=="SERVING" || loading!==null} onClick={()=>handleComplete(current)} className="bg-emerald-600 hover:bg-emerald-700">
                    {loading===`complete-${current.id}` ? <Loader2 className="h-4 w-4 animate-spin"/> : <CheckCircle2 className="h-4 w-4"/>} Selesai Loket
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">Selesai registrasi akan ubah queue menjadi BLOOD_COLLECTION / WAITING (otomatis).</p>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed p-8 text-center space-y-3">
                <div className="text-sm text-muted-foreground">Tidak ada antrean yang sedang dipanggil.</div>
                <Button onClick={handleCall} disabled={loading==="call" || waiting.length===0} size="lg">
                  {loading==="call" ? <Loader2 className="h-4 w-4 animate-spin"/> : <Megaphone className="h-4 w-4"/>} Panggil Berikutnya {waiting.length>0 ? `(${waiting[0].queueNumber})` : ""}
                </Button>
                {waiting.length===0 && <div className="text-xs text-muted-foreground">Tidak ada WAITING untuk REGISTRATION hari ini.</div>}
              </div>
            )}

            {msg && <div className="rounded-md bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800">{msg}</div>}

            {current && waiting.length>0 && (
              <Button variant="ghost" size="sm" onClick={handleCall} disabled={loading==="call"} className="w-full">
                {loading==="call" ? <Loader2 className="h-3 w-3 animate-spin"/> : <RotateCcw className="h-3 w-3"/>} Panggil Berikutnya tetap (akan lock queue berikutnya, concurrency-safe)
              </Button>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Daftar Tunggu — REGISTRATION / WAITING</CardTitle>
            <CardDescription>Urut nomor terkecil (sequenceNumber) — transaction FOR UPDATE saat claim.</CardDescription>
          </CardHeader>
          <CardContent>
            {waiting.length===0 ? (
              <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">Kosong — semua sudah dipanggil atau belum ada antrean baru.</div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-2">
                {waiting.slice(0,8).map(q=>(
                  <div key={q.id} className="rounded-lg border p-3 flex items-center justify-between">
                    <div>
                      <div className="font-mono font-bold">{q.queueNumber}</div>
                      <div className="text-xs text-muted-foreground">{q.patientName ?? "—"} • {new Date(q.createdAt).toLocaleTimeString("id-ID")}</div>
                    </div>
                    <Badge variant="secondary">{q.status}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Info Station</CardTitle>
          </CardHeader>
          <CardContent className="text-xs space-y-2 text-muted-foreground">
            <div>ID: <span className="font-mono text-foreground">{station.id.slice(0,8)}</span></div>
            <div>Stage: REGISTRATION • Service terkait via <code>queue_service_id</code></div>
            <div>Display: akan broadcast <code>REGISTRATION_CALLED</code> / <code>RECALLED</code></div>
            <Separator />
            <div className="rounded-md bg-muted p-2">Tanpa auth — semua operator bisa operasikan station ini (sesuai request).</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
