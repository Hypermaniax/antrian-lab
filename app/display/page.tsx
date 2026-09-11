import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Monitor, ClipboardList, TestTube, ExternalLink } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default function DisplaySelectorPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Monitor className="h-6 w-6" /> Display
        </h1>
        <p className="text-sm text-muted-foreground">Pilih display untuk dibuka — masing-masing akan membuka halaman baru (new tab) khusus untuk TV.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Daftar Antrean */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-blue-600" /> Display Daftar
            </CardTitle>
            <CardDescription>Loket 1 (Daftar Darah • B) & Loket 2 (Ambil Hasil • H) — untuk TV area loket</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-xl bg-zinc-900 text-white p-6 text-center">
              <div className="text-xs tracking-widest text-white/60">PREVIEW</div>
              <div className="grid grid-cols-2 gap-3 mt-3">
                <div className="rounded-lg bg-zinc-800 p-3">
                  <div className="text-xs text-white/50">LOKET 1</div>
                  <div className="text-xl font-mono font-bold">B001</div>
                </div>
                <div className="rounded-lg bg-zinc-800 p-3">
                  <div className="text-xs text-white/50">LOKET 2</div>
                  <div className="text-xl font-mono font-bold">H002</div>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button asChild className="flex-1">
                <Link href="/display/daftar" target="_blank">
                  Buka Display Daftar <ExternalLink className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/display/daftar">Lihat</Link>
              </Button>
            </div>
            <p className="text-xs text-muted-foreground text-center">Klik akan membuka tab baru — pasang di TV loket</p>
          </CardContent>
        </Card>

        {/* Pengambilan Darah */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TestTube className="h-5 w-5 text-emerald-600" /> Display Pengambilan
            </CardTitle>
            <CardDescription>Meja 1 • 2 • 3 (BLOOD_COLLECTION) — untuk TV ruang pengambilan darah</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-xl bg-zinc-900 text-white p-6 text-center">
              <div className="text-xs tracking-widest text-white/60">PREVIEW</div>
              <div className="grid grid-cols-3 gap-2 mt-3">
                <div className="rounded-lg bg-zinc-800 p-3">
                  <div className="text-xs text-white/50">MEJA 1</div>
                  <div className="text-lg font-mono font-bold">B005</div>
                </div>
                <div className="rounded-lg bg-zinc-800 p-3">
                  <div className="text-xs text-white/50">MEJA 2</div>
                  <div className="text-lg font-mono font-bold">B006</div>
                </div>
                <div className="rounded-lg bg-zinc-800 p-3">
                  <div className="text-xs text-white/50">MEJA 3</div>
                  <div className="text-lg font-mono font-bold">B007</div>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button asChild className="flex-1 bg-emerald-600 hover:bg-emerald-700">
                <Link href="/display/pengambilan" target="_blank">
                  Buka Display Pengambilan <ExternalLink className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/display/pengambilan">Lihat</Link>
              </Button>
            </div>
            <p className="text-xs text-muted-foreground text-center">Klik akan membuka tab baru — pasang di TV pengambilan</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-dashed">
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground justify-center">
            <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-blue-500" /> Loket 1 • 2 → Daftar</span>
            <span>•</span>
            <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Meja 1-3 → Pengambilan</span>
            <span>•</span>
            <span>Terpisah, masing-masing fullscreen</span>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
