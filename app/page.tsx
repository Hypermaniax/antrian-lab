import { fetchQueueServices } from "@/actions/queueServiceActions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { queueService } from "@/services/queue.service";
import { Ticket, ClipboardList, TestTube, CheckCircle2, ArrowRight, FlaskConical, Zap, TrendingUp } from "lucide-react";

import { SSEAutoRefresh } from "@/components/sse-auto-refresh";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [servicesRes, stats, recent] = await Promise.all([
    fetchQueueServices(),
    queueService.getDashboardStats(),
    queueService.getRecentQueues(6),
  ]);

  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      <SSEAutoRefresh />
      
      {/* Hero */}
      <div className="relative rounded-2xl border overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/30 p-6 sm:p-8">
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4 pointer-events-none" />
        
        <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground bg-background/60 backdrop-blur-sm px-3 py-1.5 rounded-full border border-border/50">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              Sistem aktif • {stats.date} • {stats.stations} station
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
              <span className="gradient-text">Laboratorium</span>
            </h1>
            <p className="text-sm text-muted-foreground max-w-xl leading-relaxed">
              Sistem antrean cerdas — ambil nomor, panggil otomatis, tanpa antre ganda. Realtime untuk semua loket dan meja.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <Button asChild size="lg" className="rounded-xl bg-gradient-to-r from-primary to-primary/80 shadow-md hover:shadow-lg transition-all hover:scale-[1.02]">
                <Link href="/take">
                  <Ticket className="h-4 w-4 mr-1.5" /> Ambil Antrean
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-xl hover:bg-accent/50 transition-all">
                <Link href="/display">
                  <ClipboardList className="h-4 w-4 mr-1.5" /> Lihat Display
                </Link>
              </Button>
              <Button asChild variant="ghost" size="lg" className="rounded-xl">
                <Link href="/loket">
                  Masuk Loket <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3 lg:w-[420px] shrink-0">
            <StatCard label="Total Hari Ini" value={stats.total} icon={Ticket} color="indigo" />
            <StatCard label="Menunggu Loket" value={stats.waitingReg} icon={ClipboardList} color="blue" />
            <StatCard label="Menunggu Darah" value={stats.waitingBlood} icon={TestTube} color="violet" />
            <StatCard label="Selesai" value={stats.completed} icon={CheckCircle2} color="emerald" />
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Services */}
        <Card className="lg:col-span-2 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <div className="h-7 w-7 rounded-lg bg-primary/10 grid place-items-center">
                <FlaskConical className="h-3.5 w-3.5 text-primary" />
              </div>
              Layanan
            </CardTitle>
            <Button asChild variant="ghost" size="sm" className="rounded-lg text-xs">
              <Link href="/admin">Kelola</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {!servicesRes.success ? (
              <div className="rounded-xl border bg-destructive/10 p-3 text-sm text-destructive">Gagal memuat layanan.</div>
            ) : servicesRes.data.length === 0 ? (
              <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">Belum ada layanan.</div>
            ) : (
              <div className="grid sm:grid-cols-3 gap-3">
                {servicesRes.data.map((s: { id: string; name: string; prefix: string }) => (
                  <div key={s.id} className="group rounded-xl border p-4 flex items-center justify-between hover:border-primary/30 hover:bg-primary/[0.02] transition-all duration-200">
                    <span className="font-medium text-sm">{s.name}</span>
                    <Badge variant="secondary" className="font-mono text-xs bg-primary/10 text-primary border-0">{s.prefix}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Flow */}
        <Card className="rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <div className="h-7 w-7 rounded-lg bg-emerald-500/10 grid place-items-center">
                <Zap className="h-3.5 w-3.5 text-emerald-600" />
              </div>
              Alur Proses
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-0">
            <div className="relative pl-6">
              {/* Timeline line */}
              <div className="absolute left-[11px] top-3 bottom-14 w-[2px] bg-gradient-to-b from-primary/40 via-primary/20 to-emerald-500/40 rounded-full" />
              
              <FlowStep n="1" title="Ambil nomor" desc="B001 • H001" variant="primary" />
              <FlowStep n="2" title="Loket" desc="Loket 1 / Loket 2" variant="default" />
              <FlowStep n="3" title="Meja Pengambilan" desc="Meja 1-3 • auto-call" variant="emerald" />
            </div>
            <div className="grid grid-cols-2 gap-2 pt-4">
              <Button asChild size="sm" variant="outline" className="rounded-xl">
                <Link href="/loket">Loket</Link>
              </Button>
              <Button asChild size="sm" className="rounded-xl bg-gradient-to-r from-primary to-primary/80">
                <Link href="/blood-collection">Meja</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent queues */}
      <Card className="rounded-2xl shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-amber-500/10 grid place-items-center">
                <TrendingUp className="h-3.5 w-3.5 text-amber-600" />
              </div>
              Antrean Terbaru
            </CardTitle>
            <CardDescription className="mt-1">6 antrean terakhir hari ini</CardDescription>
          </div>
          <Button asChild variant="ghost" size="sm" className="rounded-lg text-xs">
            <Link href="/queues">Lihat semua</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {recent.length === 0 ? (
            <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
              Belum ada antrean. Coba <Link href="/take" className="text-primary underline underline-offset-2">Ambil Antrean</Link>.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/40">
                    <th className="text-left font-semibold text-xs text-muted-foreground p-3">Nomor</th>
                    <th className="text-left font-semibold text-xs text-muted-foreground p-3">Pasien</th>
                    <th className="text-left font-semibold text-xs text-muted-foreground p-3">Stage</th>
                    <th className="text-left font-semibold text-xs text-muted-foreground p-3">Status</th>
                    <th className="text-left font-semibold text-xs text-muted-foreground p-3">Station</th>
                    <th className="text-left font-semibold text-xs text-muted-foreground p-3">Waktu</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((q, i) => (
                    <tr key={q.id} className={`border-t hover:bg-muted/30 transition-colors ${i % 2 === 0 ? 'bg-background' : 'bg-muted/10'}`}>
                      <td className="p-3 font-mono font-bold text-primary">{q.queueNumber}</td>
                      <td className="p-3">{q.patientName ?? "—"}</td>
                      <td className="p-3"><Badge variant="outline" className="text-[11px] rounded-md">{q.currentStage}</Badge></td>
                      <td className="p-3">
                        <Badge className={`text-[11px] rounded-md ${
                          q.status === "COMPLETED" ? "bg-emerald-500/15 text-emerald-700 border-emerald-200 hover:bg-emerald-500/15" : 
                          q.status === "WAITING" ? "bg-amber-500/15 text-amber-700 border-amber-200 hover:bg-amber-500/15" : 
                          "bg-blue-500/15 text-blue-700 border-blue-200 hover:bg-blue-500/15"
                        }`} variant="outline">{q.status}</Badge>
                      </td>
                      <td className="p-3 text-xs text-muted-foreground font-mono">{q.currentStationId?.slice(0, 8) ?? "—"}</td>
                      <td className="p-3 text-xs text-muted-foreground">{new Intl.DateTimeFormat("id-ID", { timeStyle: "medium" }).format(new Date(q.createdAt))} WIB</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}

function StatCard({ label, value, icon: Icon, color }: { label: string; value: number; icon: React.ElementType; color: string }) {
  const colorMap: Record<string, { bg: string; icon: string; text: string }> = {
    indigo: { bg: "bg-indigo-500/10", icon: "text-indigo-600", text: "text-indigo-600" },
    blue: { bg: "bg-blue-500/10", icon: "text-blue-600", text: "text-blue-600" },
    violet: { bg: "bg-violet-500/10", icon: "text-violet-600", text: "text-violet-600" },
    emerald: { bg: "bg-emerald-500/10", icon: "text-emerald-600", text: "text-emerald-600" },
  };
  const c = colorMap[color] || colorMap.indigo;

  return (
    <div className="rounded-xl border bg-card p-3.5 hover:shadow-md transition-all duration-200 group">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium text-muted-foreground">{label}</span>
        <div className={`h-7 w-7 rounded-lg ${c.bg} grid place-items-center transition-transform duration-200 group-hover:scale-110`}>
          <Icon className={`h-3.5 w-3.5 ${c.icon}`} />
        </div>
      </div>
      <div className={`text-3xl font-bold mt-1 tracking-tight ${c.text}`}>{value}</div>
    </div>
  );
}

function FlowStep({ n, title, desc, variant }: { n: string; title: string; desc: string; variant: "primary" | "default" | "emerald" }) {
  const styles = {
    primary: { dot: "bg-primary shadow-[0_0_8px_rgba(99,102,241,0.4)]", text: "text-primary", bg: "bg-primary/5 border-primary/20" },
    default: { dot: "bg-muted-foreground/60", text: "text-foreground", bg: "bg-muted/30 border-border" },
    emerald: { dot: "bg-emerald-500 shadow-[0_0_8px_rgba(52,211,153,0.4)]", text: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200" },
  };
  const s = styles[variant];

  return (
    <div className="relative pb-4 last:pb-0">
      <div className={`absolute -left-6 top-3 h-[9px] w-[9px] rounded-full ${s.dot} ring-2 ring-background`} />
      <div className={`rounded-xl border p-3 ${s.bg}`}>
        <div className={`text-sm font-semibold leading-none ${s.text}`}>{title}</div>
        <div className="text-xs text-muted-foreground mt-1">{desc}</div>
      </div>
    </div>
  );
}
