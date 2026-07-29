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

// Lawn Pride's own square mark ships in their logo orange, which collides with
// the amber barrier layer in the yard plan. Their supplied brand tokens set the
// accent to #12875E, so the tile follows the token and keeps the letterforms.
export function LawnPrideMark({
  size = "md",
  muted = false,
  className = "",
}: {
  size?: MarkSize
  /** Sits back until the offer is accepted. */
  muted?: boolean
  className?: string
}) {
  return (
    <span
      className={`${SIZES[size]} flex shrink-0 items-center justify-center rounded-lg ring-1 ring-line transition-all duration-300 ${className}`}
      style={{
        backgroundColor: muted ? "#9CA3AF" : "#12875E",
        opacity: muted ? 0.55 : 1,
      }}
      aria-label="Lawn Pride"
      role="img"
    >
      <span className="text-[13px] font-extrabold leading-none tracking-[-0.04em] text-white">LP</span>
    </span>
  )
}

export function LawnPrideWordmark({ className = "h-4 w-auto" }: { className?: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src="/brand/lawn-pride-logo.svg" alt="Lawn Pride" className={className} />
}
