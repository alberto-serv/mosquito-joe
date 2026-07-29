"use client"

import Image from "next/image"

// Small square brand marks used wherever two franchise brands sit side by side —
// the order summary line items, the attach card, the receipt.

const SIZES = {
  sm: "h-7 w-7",
  md: "h-9 w-9",
  lg: "h-11 w-11",
} as const

type MarkSize = keyof typeof SIZES

export function MosquitoJoeMark({ size = "md", className = "" }: { size?: MarkSize; className?: string }) {
  return (
    <span className={`${SIZES[size]} relative shrink-0 overflow-hidden rounded-lg ring-1 ring-line ${className}`}>
      <Image src="/brand/favicon.png" alt="Mosquito Joe" fill sizes="44px" className="object-cover" />
    </span>
  )
}

// Lawn Pride's real square mark, from their apple-touch-icon. Always full
// colour: a brand mark greyed out reads as unavailable, not as un-purchased.
export function LawnPrideMark({ size = "md", className = "" }: { size?: MarkSize; className?: string }) {
  return (
    <span className={`${SIZES[size]} relative shrink-0 overflow-hidden rounded-lg ring-1 ring-line ${className}`}>
      <Image src="/brand/lawn-pride-icon.png" alt="Lawn Pride" fill sizes="44px" className="object-cover" />
    </span>
  )
}

// ─── Neighborly and the brands not yet purchased ─────────────────────────────

export function NeighborlyMark({ size = "md", className = "" }: { size?: MarkSize; className?: string }) {
  return (
    <span className={`${SIZES[size]} relative shrink-0 overflow-hidden rounded-lg ring-1 ring-line ${className}`}>
      <Image src="/brand/neighborly-icon.png" alt="Neighborly" fill sizes="44px" className="object-cover" />
    </span>
  )
}

export function WindowGenieMark({ size = "md", className = "" }: { size?: MarkSize; className?: string }) {
  return (
    <span className={`${SIZES[size]} relative shrink-0 overflow-hidden rounded-lg ring-1 ring-line ${className}`}>
      <Image src="/brand/window-genie-icon.png" alt="Window Genie" fill sizes="44px" className="object-cover" />
    </span>
  )
}

export function MrHandymanMark({ size = "md", className = "" }: { size?: MarkSize; className?: string }) {
  return (
    <span className={`${SIZES[size]} relative shrink-0 overflow-hidden rounded-lg ring-1 ring-line ${className}`}>
      <Image src="/brand/mr-handyman-icon.png" alt="Mr. Handyman" fill sizes="44px" className="object-cover" />
    </span>
  )
}

export function LawnPrideWordmark({ className = "h-4 w-auto" }: { className?: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src="/brand/lawn-pride-logo.svg" alt="Lawn Pride" className={className} />
}
