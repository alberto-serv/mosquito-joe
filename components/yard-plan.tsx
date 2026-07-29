"use client"

import { useEffect, useId, useRef, useState } from "react"

// ─── YardPlan ────────────────────────────────────────────────────────────────
//
// A top-down plan of the property, drawn once and layered twice:
//
//   · the barrier layer  — Mosquito Joe's treatment ring around the property
//                          line, the beds, and the tree canopies (amber)
//   · the turf layer     — Lawn Pride's coverage of the same measured lawn,
//                          which washes in over the barrier layer (green)
//
// `coverage` decides which layers the plan is capable of showing. `turfActive`
// drives the wash. The reveal is a clip-path inset on the turf group with a
// sheen riding the leading edge.

export type YardCoverage = "mosquito" | "turf" | "both"

interface YardPlanProps {
  /** Measured treatable area, in square feet. Rendered as the plan's label. */
  sqft: number
  coverage?: YardCoverage
  /** When coverage includes turf, whether the green layer is washed in. */
  turfActive?: boolean
  showLegend?: boolean
  className?: string
}

// Lawn zones: back lawn, left side, right side, front lawn.
const TURF_ZONES: Array<{ x: number; y: number; w: number; h: number }> = [
  { x: 30, y: 28, w: 360, h: 60 },
  { x: 30, y: 100, w: 62, h: 148 },
  { x: 296, y: 100, w: 94, h: 148 },
  { x: 156, y: 218, w: 234, h: 34 },
]

// Canopies sit on the property line, where the barrier treatment concentrates.
const TREES: Array<{ cx: number; cy: number; r: number }> = [
  { cx: 62, cy: 58, r: 17 },
  { cx: 352, cy: 62, r: 13 },
  { cx: 58, cy: 222, r: 15 },
  { cx: 358, cy: 214, r: 12 },
  { cx: 216, cy: 40, r: 11 },
]

export function YardPlan({
  sqft,
  coverage = "mosquito",
  turfActive = false,
  showLegend = true,
  className = "",
}: YardPlanProps) {
  const uid = useId().replace(/:/g, "")
  const showBarrier = coverage === "mosquito" || coverage === "both"
  const canShowTurf = coverage === "turf" || coverage === "both"
  const turfOn = canShowTurf && (coverage === "turf" || turfActive)

  // The sheen replays on each off → on transition, not on first paint.
  const [sweepKey, setSweepKey] = useState(0)
  const prevTurfOn = useRef(turfOn)
  useEffect(() => {
    if (turfOn && !prevTurfOn.current) setSweepKey((k) => k + 1)
    prevTurfOn.current = turfOn
  }, [turfOn])

  return (
    <div className={className}>
      <div className="relative overflow-hidden rounded-lg border border-line bg-[#FAFAF9]">
        <svg viewBox="0 0 420 280" className="block w-full" role="img" aria-label={`Property plan showing ${sqft.toLocaleString()} square feet of treatable yard`}>
          <defs>
            {/* Mowing stripes for the turf layer */}
            <pattern id={`stripes-${uid}`} width="18" height="18" patternUnits="userSpaceOnUse" patternTransform="rotate(38)">
              <rect width="18" height="18" fill="#12875E" />
              <rect width="9" height="18" fill="#15966A" />
            </pattern>
            {/* Soft glow beneath the barrier ring */}
            <filter id={`soften-${uid}`} x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" />
            </filter>
            <linearGradient id={`sheen-${uid}`} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
              <stop offset="50%" stopColor="#ffffff" stopOpacity="0.75" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </linearGradient>
            <clipPath id={`lot-${uid}`}>
              <rect x="16" y="14" width="388" height="252" rx="10" />
            </clipPath>
          </defs>

          {/* ── Base plan ─────────────────────────────────────────────── */}
          <g clipPath={`url(#lot-${uid})`}>
            <rect x="16" y="14" width="388" height="252" fill="#EDEDE7" />

            {/* Untreated lawn — reads as lawn before any treatment lands on it */}
            {TURF_ZONES.map((z, i) => (
              <g key={`base-${i}`}>
                <rect x={z.x} y={z.y} width={z.w} height={z.h} rx="5" fill="#CFD8C6" />
                <rect
                  x={z.x}
                  y={z.y}
                  width={z.w}
                  height={z.h}
                  rx="5"
                  fill="none"
                  stroke="#B4C0A7"
                  strokeWidth="1.25"
                />
              </g>
            ))}

            {/* Street */}
            <rect x="16" y="252" width="388" height="14" fill="#D9DCE0" />
            <rect x="16" y="258" width="388" height="1.5" fill="#B9BFC6" />

            {/* Driveway and front walk */}
            <rect x="100" y="188" width="48" height="78" fill="#D2D2CD" />
            <rect x="100" y="188" width="48" height="78" fill="none" stroke="#BFBFB8" strokeWidth="1" />
            <rect x="206" y="212" width="14" height="44" fill="#D2D2CD" />

            {/* Deck */}
            <rect x="150" y="188" width="84" height="24" rx="3" fill="#CDBEA8" />
            <rect x="150" y="188" width="84" height="24" rx="3" fill="none" stroke="#B3A28A" strokeWidth="1" />
            <path d="M164 188 V212 M178 188 V212 M192 188 V212 M206 188 V212 M220 188 V212" stroke="#BCAB93" strokeWidth="1" />

            {/* House — roof planes, read from above */}
            <rect x="150" y="104" width="132" height="84" rx="2" fill="#3F4A5A" />
            <path d="M150 104 L216 146 L150 188 Z" fill="#4A5768" />
            <path d="M282 104 L216 146 L282 188 Z" fill="#354052" />
            <path d="M150 104 L216 146 L282 104" fill="none" stroke="#5A697C" strokeWidth="1.25" />
            <path d="M150 188 L216 146 L282 188" fill="none" stroke="#2E384A" strokeWidth="1.25" />
            <rect x="150" y="104" width="132" height="84" rx="2" fill="none" stroke="#2B3543" strokeWidth="1.5" />

            {/* Planting beds hugging the house */}
            <rect x="146" y="92" width="140" height="10" rx="5" fill="#C6BBA8" />
            <rect x="140" y="104" width="8" height="84" rx="4" fill="#C6BBA8" />
            <rect x="284" y="104" width="8" height="84" rx="4" fill="#C6BBA8" />

            {/* Property line */}
            <rect
              x="21"
              y="19"
              width="378"
              height="242"
              rx="8"
              fill="none"
              stroke="#A6ADB6"
              strokeWidth="1.5"
              strokeDasharray="3 5"
            />

            {/* ── Barrier layer (Mosquito Joe) ──────────────────────── */}
            {showBarrier && (
              <g
                style={{
                  opacity: turfOn ? 0.82 : 1,
                  transition: "opacity 700ms cubic-bezier(.22,1,.36,1)",
                }}
              >
                {/* The sprayed band itself, not a marquee around the plan */}
                <rect
                  x="28"
                  y="26"
                  width="364"
                  height="228"
                  rx="8"
                  fill="none"
                  stroke="#F0A81E"
                  strokeWidth="16"
                  opacity="0.34"
                  filter={`url(#soften-${uid})`}
                />
                <rect
                  x="28"
                  y="26"
                  width="364"
                  height="228"
                  rx="8"
                  fill="none"
                  stroke="#E09A12"
                  strokeWidth="1.5"
                  strokeDasharray="6 5"
                  opacity="0.8"
                />
                {/* Beds and canopies get the same treatment */}
                <rect x="146" y="92" width="140" height="10" rx="5" fill="#F0A81E" opacity="0.6" />
                <rect x="140" y="104" width="8" height="84" rx="4" fill="#F0A81E" opacity="0.6" />
                <rect x="284" y="104" width="8" height="84" rx="4" fill="#F0A81E" opacity="0.6" />
              </g>
            )}

            {/* ── Turf layer (Lawn Pride) ───────────────────────────── */}
            {canShowTurf && (
              <g
                style={{
                  clipPath: `inset(0 ${turfOn ? 0 : 100}% 0 0)`,
                  transition: "clip-path 950ms cubic-bezier(.22,1,.36,1)",
                }}
              >
                {TURF_ZONES.map((z, i) => (
                  <g key={`turf-${i}`}>
                    <rect x={z.x} y={z.y} width={z.w} height={z.h} rx="5" fill={`url(#stripes-${uid})`} />
                    <rect
                      x={z.x}
                      y={z.y}
                      width={z.w}
                      height={z.h}
                      rx="5"
                      fill="none"
                      stroke="#0E6E4C"
                      strokeWidth="1.5"
                      opacity="0.75"
                    />
                  </g>
                ))}
              </g>
            )}

            {/* Canopies draw after the turf so they read as objects standing on
                the lawn — and so their barrier halos survive the turf wash. */}
            {TREES.map((t, i) => (
              <g key={`tree-${i}`}>
                {showBarrier && <circle cx={t.cx} cy={t.cy} r={t.r + 5} fill="#F0A81E" opacity="0.4" />}
                <circle cx={t.cx} cy={t.cy} r={t.r} fill="#9DAF91" />
                <circle cx={t.cx} cy={t.cy} r={t.r} fill="none" stroke="#7E9070" strokeWidth="1.25" />
                <circle cx={t.cx} cy={t.cy} r={t.r * 0.42} fill="#8AA07C" opacity="0.75" />
              </g>
            ))}

            {/* Leading-edge sheen. Only ever rides an actual off → on wash, so a
                plan that mounts already covered simply renders in its final
                state instead of flashing a sweep nobody asked for. */}
            {canShowTurf && turfOn && sweepKey > 0 && (
              <rect
                key={sweepKey}
                x="0"
                y="14"
                width="70"
                height="252"
                fill={`url(#sheen-${uid})`}
                className="animate-turf-sweep"
                style={{ pointerEvents: "none" }}
              />
            )}
          </g>
        </svg>

        {/* Measured-area chip, anchored to the plan */}
        <div className="pointer-events-none absolute left-3 top-3 flex items-center gap-1.5 rounded-lg border border-line bg-white/95 px-2.5 py-1.5 shadow-card backdrop-blur">
          <span className="tabular text-[13px] font-extrabold text-black">{sqft.toLocaleString()}</span>
          <span className="text-[11px] font-semibold text-mj-slate-soft">sq ft measured</span>
        </div>
      </div>

      {showLegend && (
        <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5">
          {showBarrier && <LegendChip color="#F0A81E" label="Mosquito Joe barrier" active />}
          {canShowTurf && <LegendChip color="#12875E" label="Lawn Pride turf" active={turfOn} />}
        </div>
      )}
    </div>
  )
}

function LegendChip({ color, label, active }: { color: string; label: string; active: boolean }) {
  return (
    <span
      className="flex items-center gap-1.5 text-[12px] font-semibold transition-colors duration-300"
      style={{ color: active ? "#111827" : "#9CA3AF" }}
    >
      <span
        className="h-2.5 w-2.5 rounded-sm transition-all duration-300"
        style={{
          backgroundColor: active ? color : "transparent",
          border: `1.5px solid ${active ? color : "#D1D5DB"}`,
        }}
      />
      {label}
    </span>
  )
}
