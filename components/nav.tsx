"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  LayoutDashboard,
  Ticket,
  ClipboardList,
  TestTube,
  Monitor,
  Settings2,
  FlaskConical,
} from "lucide-react"

const items = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/take", label: "Ambil Antrean", icon: Ticket },
  { href: "/loket", label: "Loket", icon: ClipboardList, badge: "Loket 1 • 2" },
  { href: "/blood-collection", label: "Pengambilan Darah", icon: TestTube, badge: "3 Meja" },
  { href: "/display", label: "Display", icon: Monitor },
  { href: "/admin", label: "Kelola", icon: Settings2 },
]

export function TopNav() {
  const pathname = usePathname()
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex h-14 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <div className="h-8 w-8 rounded-lg bg-primary text-primary-foreground grid place-items-center">
            <FlaskConical className="h-4 w-4" />
          </div>
          <span className="hidden sm:inline">Lab Queue</span>
          <span className="sm:hidden">LabQ</span>
          <span className="hidden md:inline text-xs font-normal text-muted-foreground ml-1">Dinamis</span>
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          {items.map((it) => {
            const active = pathname === it.href || (it.href !== "/" && pathname.startsWith(it.href))
            const Icon = it.icon
            return (
              <Link
                key={it.href}
                href={it.href}
                className={cn(
                  "inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  active ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-accent"
                )}
              >
                <Icon className="h-4 w-4" />
                {it.label}
                {it.badge && (
                  <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0 h-4">
                    {it.badge}
                  </Badge>
                )}
              </Link>
            )
          })}
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex flex-col items-end leading-none">
            <span className="text-xs font-medium">Tanpa Auth</span>
            <span className="text-[11px] text-muted-foreground">Mode pengembangan</span>
          </div>
          <Button asChild size="sm" className="hidden sm:inline-flex">
            <Link href="/take">+ Antrean Baru</Link>
          </Button>
        </div>
      </div>

      {/* Mobile nav */}
      <div className="lg:hidden border-t bg-background">
        <nav className="mx-auto max-w-7xl px-2 flex gap-1 overflow-x-auto py-2">
          {items.map((it) => {
            const active = pathname === it.href || (it.href !== "/" && pathname.startsWith(it.href))
            const Icon = it.icon
            return (
              <Link
                key={it.href}
                href={it.href}
                className={cn(
                  "inline-flex items-center gap-1.5 whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium",
                  active ? "bg-secondary text-foreground" : "text-muted-foreground"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {it.label}
              </Link>
            )
          })}
        </nav>
      </div>
    </header>
  )
}
