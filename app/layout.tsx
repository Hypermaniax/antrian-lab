import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppSidebar, SidebarInset } from "@/components/app-sidebar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Lab Queue - Sistem Antrean Dinamis",
  description: "Sistem manajemen antrean laboratorium dinamis - Next.js Server Components",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-screen bg-muted/20">
        <AppSidebar />
        <SidebarInset>
          <div className="flex-1">{children}</div>
          <footer className="border-t bg-background/80 backdrop-blur-sm py-4 text-center text-xs text-muted-foreground">
            <div className="flex items-center justify-center gap-2 flex-wrap">
              <span className="font-medium text-foreground/60">Lab Queue</span>
              <span className="text-border">•</span>
              <span>Server Components</span>
              <span className="text-border">•</span>
              <span>Actions + Repo</span>
              <span className="text-border">•</span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted/60 text-[10px]">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                Dev Mode
              </span>
            </div>
          </footer>
        </SidebarInset>
      </body>
    </html>
  );
}
