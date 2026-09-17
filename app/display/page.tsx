import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Monitor, ClipboardList, TestTube, ExternalLink, Tv } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default function DisplaySelectorPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-primary/10 grid place-items-center">
            <Monitor className="h-5 w-5 text-primary" />
          </div>
          Display TV
        </h1>
        <p className="text-sm text-muted-foreground">Pilih display untuk dibuka — masing-masing fullscreen untuk TV.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Daftar Antrean */}
        <Card className="rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 group hover:scale-[1.01] overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-blue-500/10 grid place-items-center">
                <ClipboardList className="h-4 w-4 text-blue-600" />
              </div>
              Display Daftar
            </CardTitle>
            <CardDescription>Loket 1 (Daftar Darah • B) & Loket 2 (Ambil Hasil • H)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-xl mesh-bg text-white p-5 text-center overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-b from-blue-600/5 to-transparent pointer-events-none" />
              <div className="relative">
                <div className="text-[10px] tracking-[0.3em] text-white/40 uppercase font-medium mb-3">Preview</div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-white/[0.04] border border-white/[0.06] p-4 backdrop-blur-sm">
                    <div className="text-[10px] text-white/40 tracking-wider uppercase">Loket 1</div>
                    <div className="text-2xl font-mono font-black mt-1 text-blue-400">B001</div>
                  </div>
                  <div className="rounded-xl bg-white/[0.04] border border-white/[0.06] p-4 backdrop-blur-sm">
                    <div className="text-[10px] text-white/40 tracking-wider uppercase">Loket 2</div>
                    <div className="text-2xl font-mono font-black mt-1 text-amber-400">H002</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button asChild className="flex-1 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 shadow-md hover:shadow-lg transition-all hover:scale-[1.02]">
                <Link href="/display/daftar" target="_blank">
                  <Tv className="h-4 w-4 mr-1.5" /> Buka Fullscreen <ExternalLink className="h-3.5 w-3.5 ml-1" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="rounded-xl">
                <Link href="/display/daftar">Preview</Link>
              </Button>
            </div>
            <p className="text-[11px] text-muted-foreground text-center">Tab baru — pasang di TV area loket</p>
          </CardContent>
        </Card>

        {/* Pengambilan Darah */}
        <Card className="rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 group hover:scale-[1.01] overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-emerald-500/10 grid place-items-center">
                <TestTube className="h-4 w-4 text-emerald-600" />
              </div>
              Display Pengambilan
            </CardTitle>
            <CardDescription>Meja 1 • 2 • 3 (BLOOD_COLLECTION) — ruang pengambilan darah</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-xl mesh-bg text-white p-5 text-center overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-b from-emerald-600/5 to-transparent pointer-events-none" />
              <div className="relative">
                <div className="text-[10px] tracking-[0.3em] text-white/40 uppercase font-medium mb-3">Preview</div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="rounded-xl bg-white/[0.04] border border-white/[0.06] p-3 backdrop-blur-sm">
                    <div className="text-[9px] text-white/40 tracking-wider uppercase">Meja 1</div>
                    <div className="text-lg font-mono font-black mt-1 text-cyan-400">B005</div>
                  </div>
                  <div className="rounded-xl bg-white/[0.04] border border-white/[0.06] p-3 backdrop-blur-sm">
                    <div className="text-[9px] text-white/40 tracking-wider uppercase">Meja 2</div>
                    <div className="text-lg font-mono font-black mt-1 text-violet-400">B006</div>
                  </div>
                  <div className="rounded-xl bg-white/[0.04] border border-white/[0.06] p-3 backdrop-blur-sm">
                    <div className="text-[9px] text-white/40 tracking-wider uppercase">Meja 3</div>
                    <div className="text-lg font-mono font-black mt-1 text-rose-400">B007</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button asChild className="flex-1 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 shadow-md hover:shadow-lg transition-all hover:scale-[1.02]">
                <Link href="/display/pengambilan" target="_blank">
                  <Tv className="h-4 w-4 mr-1.5" /> Buka Fullscreen <ExternalLink className="h-3.5 w-3.5 ml-1" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="rounded-xl">
                <Link href="/display/pengambilan">Preview</Link>
              </Button>
            </div>
            <p className="text-[11px] text-muted-foreground text-center">Tab baru — pasang di TV pengambilan</p>
          </CardContent>
        </Card>
      </div>

      <div className="rounded-xl border border-dashed bg-muted/20 p-4">
        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground justify-center items-center">
          <span className="inline-flex items-center gap-1.5 bg-blue-500/5 px-2.5 py-1 rounded-full">
            <span className="h-2 w-2 rounded-full bg-blue-500" /> Loket 1 • 2 → Daftar
          </span>
          <span className="text-border">•</span>
          <span className="inline-flex items-center gap-1.5 bg-emerald-500/5 px-2.5 py-1 rounded-full">
            <span className="h-2 w-2 rounded-full bg-emerald-500" /> Meja 1-3 → Pengambilan
          </span>
          <span className="text-border">•</span>
          <span>Terpisah, masing-masing fullscreen</span>
        </div>
      </div>
    </main>
  );
}
