import { fetchQueueServices } from "@/actions/queueServiceActions";
import { TakeQueueForm } from "@/components/take-queue-form";
import { Ticket } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function TakePage() {
  const res = await fetchQueueServices();
  // Loket Registrasi dan Pengambilan Darah itu BERBEDA:
  // - Loket Registrasi = stage REGISTRATION (Loket 1)
  // - Pengambilan Darah = stage BLOOD_COLLECTION (Meja 1-3)
  // Pasien HANYA ambil nomor untuk layanan lab (BLOOD_COLLECTION, prefix B).
  // Antrean akan mulai di REGISTRATION/WAITING lalu otomatis pindah ke BLOOD_COLLECTION/WAITING setelah selesai registrasi.
  // Jadi filter: jangan tampilkan REGISTRATION sebagai pilihan ambil nomor (itu bukan layanan yang diambil pasien).
  const services = res.success
    ? res.data.filter((s) => s.isActive && s.code !== "REGISTRATION" && s.prefix !== "R")
    : [];

  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-primary/10 grid place-items-center">
            <Ticket className="h-5 w-5 text-primary" />
          </div>
          Ambil Antrean
        </h1>
        <p className="text-sm text-muted-foreground">Pilih layanan dan tekan tombol — nomor antrean otomatis digenerate.</p>
      </div>
      <TakeQueueForm services={services} />
    </main>
  );
}
