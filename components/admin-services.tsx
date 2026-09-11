"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { createQueueService, toggleQueueServiceStatus } from "@/actions/queueServiceActions"
import { Loader2, Plus } from "lucide-react"

export function AdminServices({ initial }: { initial: { id:string; code:string; name:string; prefix:string; description:string|null; isActive:boolean }[] }) {
  const [code, setCode] = React.useState("")
  const [name, setName] = React.useState("")
  const [prefix, setPrefix] = React.useState("")
  const [desc, setDesc] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [msg, setMsg] = React.useState<string | null>(null)

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMsg(null)
    const res = await createQueueService({ code, name, prefix, description: desc || undefined })
    setLoading(false)
    if (!res.success) setMsg(res.error)
    else { setMsg(`Created ${res.data.code}`); setCode(""); setName(""); setPrefix(""); setDesc(""); location.reload() }
  }

  async function toggle(id: string, cur: boolean) {
    const res = await toggleQueueServiceStatus(id, !cur)
    if (!res.success) setMsg(res.error)
    else location.reload()
  }

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Plus className="h-4 w-4"/> Tambah Layanan</CardTitle>
          <CardDescription>Code unik, prefix 1-5 huruf (B, R, dll) — dinamis per PRD §6.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="space-y-3">
            <div className="space-y-1">
              <Label>Code</Label>
              <Input value={code} onChange={e=>setCode(e.target.value)} placeholder="BLOOD_COLLECTION" />
            </div>
            <div className="space-y-1">
              <Label>Nama</Label>
              <Input value={name} onChange={e=>setName(e.target.value)} placeholder="Pengambilan Darah" />
            </div>
            <div className="space-y-1">
              <Label>Prefix</Label>
              <Input value={prefix} onChange={e=>setPrefix(e.target.value.toUpperCase())} placeholder="B" maxLength={5} />
            </div>
            <div className="space-y-1">
              <Label>Deskripsi</Label>
              <Input value={desc} onChange={e=>setDesc(e.target.value)} placeholder="Opsional" />
            </div>
            {msg && <div className="rounded-md bg-amber-50 border border-amber-200 p-2 text-xs text-amber-800">{msg}</div>}
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? <Loader2 className="h-4 w-4 animate-spin"/> : "Simpan"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Daftar Layanan</CardTitle>
          <CardDescription>{initial.length} layanan • toggle aktif/nonaktif</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {initial.map(s=>(
            <div key={s.id} className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <div className="font-medium text-sm flex items-center gap-2">{s.name} <Badge variant="secondary" className="font-mono">{s.prefix}</Badge> <Badge variant="outline" className="text-[11px]">{s.code}</Badge></div>
                <div className="text-xs text-muted-foreground">{s.description ?? "—"} • <span className="font-mono">{s.id.slice(0,8)}</span></div>
              </div>
              <Button size="sm" variant={s.isActive ? "outline" : "default"} onClick={()=>toggle(s.id, s.isActive)}>
                {s.isActive ? "Nonaktifkan" : "Aktifkan"}
              </Button>
            </div>
          ))}
          {initial.length===0 && <div className="text-sm text-muted-foreground border border-dashed rounded-md p-6 text-center">Belum ada layanan.</div>}
        </CardContent>
      </Card>
    </div>
  )
}
