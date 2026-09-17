"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { callNextQueue, recallQueue, startQueueService, completeQueueService } from "@/actions/queueActions"
import { Megaphone, CheckCircle2, Loader2, FlaskConical, Users, Hash } from "lucide-react"

type Queue = {
  id: string
  queueNumber: string
  patientName: string | null
  status: string
  currentStage: string
  currentStationId: string | null
}

type Station = { id: string; name: string; code: string }

export function BloodCollectionClient({ stations, waiting, byStation }: { stations: Station[]; waiting: Queue[]; byStation: Record<string, Queue | null> }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [active, setActive] = React.useState(() => {
    const tab = searchParams.get("tab")
    return tab && stations.some((s) => s.id === tab) ? tab : stations[0]?.id ?? ""
  })
  React.useEffect(() => {
    const tab = searchParams.get("tab")
    if (tab && stations.some((s) => s.id === tab) && tab !== active) setActive(tab)
  }, [searchParams])
  const handleTabChange = (v: string) => {
    setActive(v)
    const params = new URLSearchParams(searchParams.toString())
    params.set("tab", v)
    router.replace(`?${params.toString()}`, { scroll: false })
  }
  const current = byStation[active] ?? null
  const [loading, setLoading] = React.useState<string | null>(null)
  const [msg, setMsg] = React.useState<string | null>(null)

  const station = stations.find(s=>s.id===active)!

  async function handleCall() {
    setLoading("call")
    setMsg(null)
    const res = await callNextQueue(active)
    setLoading(null)
    if (!res.success) setMsg(res.error)
    else router.refresh()
  }
  async function handleRecall() {
    if (!current) return
    setLoading(`recall-${current.id}`)
    const res = await recallQueue(current.id, active)
    setLoading(null)
    if (!res.success) setMsg(res.error)
    else setMsg(`Recall ${current.queueNumber} ke display`)
  }
  async function handleStart() {
    if (!current) return
    setLoading(`start-${current.id}`)
    const res = await startQueueService(current.id, active)
    setLoading(null)
    if (!res.success) setMsg(res.error)
    else router.refresh()
  }
  async function handleComplete() {
    if (!current) return
    setLoading(`complete-${current.id}`)
    const res = await completeQueueService(current.id, active)
    setLoading(null)
    if (!res.success) setMsg(res.error)
    else {
      const auto = (res.data as { autoCalled?: Queue | null })?.autoCalled
      setMsg(auto ? `Selesai ${current.queueNumber} • Auto-call ${auto.queueNumber} ke ${station.name}` : `Selesai ${current.queueNumber} • Tidak ada antrean menunggu`)
      setTimeout(()=>router.refresh(), 900)
    }
  }

  if (stations.length===0) {
    return <div className="rounded-xl border p-6 text-sm text-muted-foreground">Belum ada station BLOOD_COLLECTION. Buat di /admin → Stations (Meja 1-3).</div>
  }

  return (
    <div className="space-y-4">
      <Tabs value={active} onValueChange={handleTabChange}>
        <TabsList className="w-full justify-start overflow-x-auto rounded-xl bg-muted/50 p-1">
          {stations.map(s=>(
            <TabsTrigger key={s.id} value={s.id} className="gap-2 rounded-lg data-[state=active]:shadow-sm">
              <div className="h-6 w-6 rounded-md bg-emerald-500/10 grid place-items-center">
                <FlaskConical className="h-3 w-3 text-emerald-600" />
              </div>
              {s.name}
              {byStation[s.id] && <Badge variant="secondary" className="ml-1 text-[10px] bg-emerald-500/10 text-emerald-700 border-0">{byStation[s.id]!.queueNumber}</Badge>}
            </TabsTrigger>
          ))}
        </TabsList>

        {stations.map(s=>(
          <TabsContent key={s.id} value={s.id} className="space-y-4 mt-4">
            <div className="grid lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2 rounded-2xl shadow-sm hover:shadow-md transition-shadow border-emerald-200/40">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <div className="h-8 w-8 rounded-xl bg-emerald-500/10 grid place-items-center">
                      <Hash className="h-4 w-4 text-emerald-600" />
                    </div>
                    {s.name}
                    <Badge variant="secondary" className="text-xs bg-emerald-500/10 text-emerald-700 border-0">{s.code}</Badge>
                    {current && active===s.id && (
                      <Badge variant="outline" className={`text-xs ${
                        current.status === "CALLED" ? "border-amber-300 text-amber-700 bg-amber-50" :
                        current.status === "SERVING" ? "border-emerald-300 text-emerald-700 bg-emerald-50" : ""
                      }`}>{current.status}</Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {active===s.id && current ? (
                    <div className="rounded-2xl border-2 border-emerald-300/50 p-6 text-center space-y-4 bg-gradient-to-b from-emerald-50/50 to-background">
                      <div className="text-xs font-medium text-muted-foreground tracking-wider uppercase">Nomor Antrean</div>
                      <div className="text-5xl sm:text-6xl font-mono font-black tracking-widest text-emerald-600">{current.queueNumber}</div>
                      <Badge variant="outline" className={`text-xs ${
                        current.status === "CALLED" ? "border-amber-300 text-amber-700 bg-amber-50" :
                        current.status === "SERVING" ? "border-emerald-300 text-emerald-700 bg-emerald-50" : ""
                      }`}>{current.status}</Badge>
                      <Separator />
                      <div className="grid grid-cols-2 gap-3">
                        <Button variant="outline" size="lg" onClick={handleRecall} disabled={loading!==null} className="rounded-xl">
                          {loading===`recall-${current.id}` ? <Loader2 className="h-5 w-5 animate-spin mr-2"/> : <Megaphone className="h-5 w-5 mr-2"/>} Ulang
                        </Button>
                        <Button size="lg" onClick={handleComplete} disabled={(current.status!=="CALLED" && current.status!=="SERVING") || loading!==null} className="rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 shadow-md hover:shadow-lg transition-all hover:scale-[1.02]">
                          {loading===`complete-${current.id}` ? <Loader2 className="h-5 w-5 animate-spin mr-2"/> : <CheckCircle2 className="h-5 w-5 mr-2"/>} Selesai & Next
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-2xl border-2 border-dashed p-8 text-center space-y-4">
                      <div className="mx-auto h-14 w-14 rounded-2xl bg-emerald-50 grid place-items-center">
                        <Megaphone className="h-6 w-6 text-emerald-400" />
                      </div>
                      <div className="text-sm text-muted-foreground">Siap memanggil pasien berikutnya</div>
                      <Button onClick={handleCall} disabled={loading==="call" || waiting.length===0} size="lg" className="rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 shadow-md hover:shadow-lg transition-all hover:scale-[1.02]">
                        {loading==="call" ? <Loader2 className="h-4 w-4 animate-spin mr-1"/> : <Megaphone className="h-4 w-4 mr-1"/>} Panggil{waiting.length>0 ? ` ${waiting[0].queueNumber}` : ""}
                      </Button>
                    </div>
                  )}
                  {msg && (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800 flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0 text-emerald-600" />
                      {msg}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <div className="h-6 w-6 rounded-lg bg-muted grid place-items-center">
                      <Users className="h-3 w-3 text-muted-foreground" />
                    </div>
                    Antrean
                    {waiting.length > 0 && (
                      <Badge variant="secondary" className="text-[10px] bg-emerald-500/10 text-emerald-700 border-0">{waiting.length}</Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {waiting.length===0 ? (
                    <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
                      <div className="mx-auto h-10 w-10 rounded-xl bg-muted/50 grid place-items-center mb-2">
                        <Users className="h-4 w-4 text-muted-foreground/50" />
                      </div>
                      Kosong
                    </div>
                  ) : (
                    <div className="max-h-[320px] overflow-auto rounded-xl border">
                      <table className="w-full text-sm">
                        <thead className="text-xs text-muted-foreground sticky top-0 bg-card z-10">
                          <tr className="bg-muted/40">
                            <th className="text-left p-2.5 font-semibold">Nomor</th>
                            <th className="text-left p-2.5 font-semibold">Pasien</th>
                            <th className="text-right p-2.5 font-semibold">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {waiting.map((q, i)=>(
                            <tr key={q.id} className={`border-t hover:bg-muted/30 transition-colors ${i % 2 === 0 ? '' : 'bg-muted/10'}`}>
                              <td className="p-2.5 font-mono font-bold text-emerald-700">{q.queueNumber}</td>
                              <td className="p-2.5 truncate max-w-[120px]">{q.patientName || "—"}</td>
                              <td className="p-2.5 text-right"><Badge variant="secondary" className="text-[10px] bg-amber-500/10 text-amber-700 border-0">WAITING</Badge></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
