import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "@/app/globals.css"
import { SiteChrome } from "@/components/site-chrome"
import { cn } from "@/lib/utils"

// Inter carries both brands — Mosquito Joe and Lawn Pride resolve to the same
// stack in the extracted design tokens. Palette does the separating, not type.
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-inter",
})

export const metadata: Metadata = {
  metadataBase: new URL("https://mosquito-joe.vercel.app"),
  title: "Mosquito Joe · Outdoor Pest Control Quote",
  description:
    "Get an instant quote for mosquito, tick, and flea control. Barrier treatments on a 21-day cycle, season-long protection, and a yard measured from your address.",
  icons: {
    icon: "/brand/favicon.png",
    apple: "/brand/favicon.png",
  },
  openGraph: {
    title: "Mosquito Joe · Outdoor Pest Control Quote",
    description: "Instant pricing for mosquito, tick, and flea control.",
    images: ["/brand/favicon.png"],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="light">
      <body className={cn("min-h-screen bg-background font-sans antialiased", inter.variable)}>
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  )
}
