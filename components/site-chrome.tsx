"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export function SiteChrome({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
