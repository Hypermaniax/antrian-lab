"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { createStation, toggleStationStatus } from "@/actions/stationActions"
import { Loader2 } from "lucide-react"

export function AdminStations({ stations, services }: { stations: { id:string; name:string; code:string; stage:string; isActive:boolean; queueServiceId:string }[]; services: { id:string; name:string; code:string }[] }) {
  const [serviceId, setServiceId] = React.useState(services[0]?.id ?? "")
  const [name, setName] = React.useState("")
  const [code, setCode] = React.useState("")
  const [stage, setStage] = React.useState("REGISTRATION")
  const [loading, setLoading] = React.useState(false)
  const [msg, setMsg] = React.useState<string | null>(null)

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMsg(null)
    const res = await createStation({ queueServiceId: serviceId, name, code, stage })
    setLoading(false)
    if (!res.success) setMsg(res.error)
    else { setMsg("Created"); setName(""); setCode(""); location.reload() }
  }

  async function toggle(id: string, cur: boolean) {
    const res = await toggleStationStatus(id, !cur)
    if (!res.success) setMsg(res.error)
    else location.reload()
  }

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Tambah Station</CardTitle>
          <CardDescription>Station dinamis — contoh Loket 1, Meja 1-3 (PRD §9).</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="space-y-3">
            <div className="space-y-1">
              <Label>Layanan</Label>
              <select value={serviceId} onChange={e=>setServiceId(e.target.value)} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm">
                {services.map(s=> <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <Label>Nama</Label>
              <Input value={name} onChange={e=>setName(e.target.value)} placeholder="Meja 4" />
            </div>
            <div className="space-y-1">
              <Label>Code (unik)</Label>
              <Input value={code} onChange={e=>setCode(e.target.value.toUpperCase())} placeholder="MEJA_4" />
            </div>
            <div className="space-y-1">
              <Label>Stage</Label>
              <select value={stage} onChange={e=>setStage(e.target.value)} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm">
                <option value="REGISTRATION">REGISTRATION</option>
                <option value="BLOOD_COLLECTION">BLOOD_COLLECTION</option>
              </select>
            </div>
            {msg && <div className="rounded-md bg-amber-50 border border-amber-200 p-2 text-xs text-amber-800">{msg}</div>}
            <Button type="submit" disabled={loading} className="w-full">{loading ? <Loader2 className="h-4 w-4 animate-spin"/> : "Simpan Station"}</Button>
          </form>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Daftar Station</CardTitle>
          <CardDescription>{stations.length} station • aktif = bisa claim antrean</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {stations.map(st=> {
            const svc = services.find(s=>s.id===st.queueServiceId)
            return (
              <div key={st.id} className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <div className="font-medium text-sm flex items-center gap-2">{st.name} <Badge variant="secondary">{st.code}</Badge> <Badge variant="outline">{st.stage}</Badge></div>
                  <div className="text-xs text-muted-foreground">{svc?.name ?? st.queueServiceId.slice(0,8)} • {st.isActive ? "Aktif" : "Nonaktif"}</div>
                </div>
                <Button size="sm" variant={st.isActive ? "outline" : "default"} onClick={()=>toggle(st.id, st.isActive)}>{st.isActive ? "Nonaktifkan" : "Aktifkan"}</Button>
              </div>
            )
          })}
          {stations.length===0 && <div className="text-sm text-muted-foreground border border-dashed rounded-md p-6 text-center">Belum ada station.</div>}
        </CardContent>
      </Card>
    </div>
  )
}
