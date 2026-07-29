"use client"

import Link from "next/link"
import Image from "next/image"
import { Phone } from "lucide-react"

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-line bg-white/92 backdrop-blur supports-[backdrop-filter]:bg-white/85">
      <div className="mx-auto flex h-[72px] w-full max-w-[1400px] items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-80">
          <Image
            src="/brand/favicon.png"
            alt="Mosquito Joe"
            width={44}
            height={44}
            priority
            className="h-11 w-11 rounded-lg"
          />
          <span className="hidden text-[15px] font-extrabold tracking-[-0.02em] text-black sm:block">
            Mosquito Joe
          </span>
        </Link>

        <a
          href="tel:8555589333"
          className="inline-flex items-center gap-2 rounded-lg border border-line-strong px-3.5 py-2 text-[13.5px] font-bold text-ink transition-colors hover:border-black"
        >
          <Phone className="h-4 w-4 text-mj-green-deep" />
          <span className="tabular">(855) 558-9333</span>
        </a>
      </div>
    </header>
  )
}
