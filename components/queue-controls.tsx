"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function QueueControls({
  currentStage,
  currentDate,
  currentPage,
  totalPages,
}: {
  currentStage: string;
  currentDate: string;
  currentPage: number;
  totalPages: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleStageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("stage", e.target.value);
    params.set("page", "1"); // Reset to page 1 on filter change
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const params = new URLSearchParams(searchParams.toString());
    if (e.target.value) {
      params.set("date", e.target.value);
    } else {
      params.delete("date");
    }
    params.set("page", "1"); // Reset to page 1 on filter change
    router.push(`${pathname}?${params.toString()}`);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <label htmlFor="date-filter" className="text-sm font-medium text-muted-foreground whitespace-nowrap">
            Tanggal:
          </label>
          <input
            type="date"
            id="date-filter"
            value={currentDate}
            onChange={handleDateChange}
            className="flex h-10 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-w-[150px]"
          />
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="stage-filter" className="text-sm font-medium text-muted-foreground whitespace-nowrap">
            Filter Tipe:
          </label>
          <select
            id="stage-filter"
            value={currentStage}
            onChange={handleStageChange}
            className="flex h-10 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-w-[180px]"
          >
            <option value="all">Semua Antrean</option>
            <option value="REGISTRATION">Pendaftaran</option>
            <option value="BLOOD_COLLECTION">Pengambilan Darah</option>
            <option value="RESULT_PICKUP">Pengambilan Hasil</option>
          </select>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-sm text-muted-foreground">
          Halaman {currentPage} dari {Math.max(1, totalPages)}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage <= 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
