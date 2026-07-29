"use client"

import { Phone } from "lucide-react"
import { AnimatedTotal } from "@/components/animated-total"

// ─── Mobile cart bar ─────────────────────────────────────────────────────────
//
// Mobile's only call to action. Present from page load rather than revealed on
// scroll, and bound live to the configurator, so the price is visible from the
// first second and every stepper change visibly moves it.
//
// Two lines, kept deliberately tight. It permanently occupies roughly 13% of a
// 667px viewport, so every module below is designed against the reduced window
// and the page carries matching bottom padding.

interface MobileCartBarProps {
  /** Compact left-hand summary, e.g. "Mosquitoes, Ticks & Fleas · 5,000 sq ft". */
  summary: string
  /** The order total, not the per-visit rate: the bar is a cart, not a rate card. */
  total: number
  /** What the total covers, e.g. "season total". */
  priceUnit: string
  /** Resolved after mount; null until then, so SSR and client agree. */
  nextSlot: string | null
  /** Over the lot cap the order cannot be configured, so the bar routes to a call. */
  overCap: boolean
  onContinue: () => void
}

export function MobileCartBar({
  summary,
  total,
  priceUnit,
  nextSlot,
  overCap,
  onContinue,
}: MobileCartBarProps) {
  return (
    <div
      className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-white md:hidden"
      style={{
        paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))",
        boxShadow: "0 -4px 20px rgba(17,24,39,.10)",
      }}
    >
      <div className="px-4 pt-2">
        {/* Line 1 — the cart, live-bound */}
        <div className="flex items-baseline justify-between gap-3">
          <p className="min-w-0 flex-1 truncate text-[12px] font-medium text-mj-slate-soft">{summary}</p>
          <p className="flex shrink-0 items-baseline gap-1">
            <AnimatedTotal value={total} className="text-[16px] font-extrabold leading-none text-black" />
            <span className="text-[11px] font-semibold text-mj-slate-soft">{priceUnit}</span>
          </p>
        </div>

        {/* Line 2 — the action */}
        {overCap ? (
          <a href="tel:8555589333" className="btn-yellow mt-2 w-full py-3">
            <Phone className="h-4 w-4" />
            Call for a custom quote
          </a>
        ) : (
          /* The label shrinks rather than pushes, so a long slot string can
             never widen the bar past the viewport. */
          <button
            type="button"
            onClick={onContinue}
            className="btn-yellow mt-2 w-full gap-1.5 overflow-hidden whitespace-nowrap px-3 py-3 text-[14px]"
          >
            <span className="min-w-0 truncate">Book my visit</span>
            {nextSlot && (
              <span className="shrink-0 text-[12.5px] font-semibold opacity-70">&middot; Next: {nextSlot}</span>
            )}
          </button>
        )}
      </div>
    </div>
  )
}
