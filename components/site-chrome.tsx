"use client"

import { usePathname } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

// The estimator and checkout wear Mosquito Joe's chrome. The confirmation screen
// deliberately does not: it runs on the neutral Neighborly set, because by that
// point the brands have sold the service and the household is the shared asset.
// A Mosquito Joe header sitting on top of it would undo exactly that shift.
const STANDALONE_PREFIXES = ["/checkout/confirmation"]

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const standalone = STANDALONE_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`))

  if (standalone) return <>{children}</>

  return (
    <div className="relative flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
