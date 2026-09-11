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
          <footer className="border-t bg-background py-4 text-center text-xs text-muted-foreground">
            Lab Waiting List • Server Components • Actions + Repo • Tanpa auth (dev)
          </footer>
        </SidebarInset>
      </body>
    </html>
  );
}
