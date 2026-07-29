// ─── Mosquito Joe quote model ────────────────────────────────────────────────
//
// The estimator walks a homeowner through five decisions — what to treat, where,
// how much yard, which treatment, and how often — and turns them into a per-visit
// price and a season total. Every number below is PLACEHOLDER DEMO PRICING.

// ─── Types ───────────────────────────────────────────────────────────────────

export type PropertyType = "residential" | "commercial"
export type TargetId = "mosquitoes" | "ticks-fleas" | "both"
export type TreatmentId = "barrier" | "natural"
export type PlanId = "season" | "monthly" | "one-time"

// ─── What are we treating for ────────────────────────────────────────────────

export interface Target {
  id: TargetId
  name: string
  shortName: string
  icon: string
  copy: string
  /** Multiplier on the per-treatment price. */
  multiplier: number
  badge?: string
}

export const TARGETS: Target[] = [
  {
    id: "mosquitoes",
    name: "Mosquitoes",
    shortName: "Mosquitoes",
    icon: "/mj/icon-mosquito.svg",
    copy: "Barrier treatment across the resting and breeding areas of your yard.",
    multiplier: 1,
  },
  {
    id: "both",
    name: "Mosquitoes, Ticks & Fleas",
    shortName: "All three",
    icon: "/mj/icon-leaf.svg",
    copy: "One treatment cycle covering every biting pest we handle outdoors.",
    multiplier: 1.25,
    badge: "Most popular",
  },
  {
    id: "ticks-fleas",
    name: "Ticks & Fleas",
    shortName: "Ticks & Fleas",
    icon: "/mj/icon-tick.svg",
    copy: "Focused on tall grass, leaf litter, wood lines, and pet runs.",
    multiplier: 1,
  },
]

export function getTarget(id: TargetId): Target {
  return TARGETS.find((t) => t.id === id) ?? TARGETS[0]
}

export function isTargetId(v: string | null | undefined): v is TargetId {
  return !!v && TARGETS.some((t) => t.id === v)
}

// ─── Property type ───────────────────────────────────────────────────────────

export interface Property {
  id: PropertyType
  name: string
  copy: string
  icon: string
  iconGray: string
}

export const PROPERTIES: Property[] = [
  {
    id: "residential",
    name: "Residential",
    copy: "A home, yard, and outdoor living space.",
    icon: "/mj/icon-residential.svg",
    iconGray: "/mj/icon-residential-gray.svg",
  },
  {
    id: "commercial",
    name: "Commercial",
    copy: "A business, campus, venue, or common area.",
    icon: "/mj/icon-commercial.svg",
    iconGray: "/mj/icon-commercial-gray.svg",
  },
]

export function isPropertyType(v: string | null | undefined): v is PropertyType {
  return v === "residential" || v === "commercial"
}

// ─── Treatable area ──────────────────────────────────────────────────────────
//
// The homeowner dials in the treatable area of the property — turf plus the beds,
// wood lines, and perimeter we spray. Anything over the cap is a custom program.

export const YARD_MIN = 1000
export const YARD_MAX = 20000
export const YARD_STEP = 100
export const YARD_DEFAULT = 4200

// ─── Treatment type ──────────────────────────────────────────────────────────

export interface Treatment {
  id: TreatmentId
  name: string
  copy: string
  intervalDays: number
  multiplier: number
  features: string[]
  badge?: string
}

export const TREATMENTS: Treatment[] = [
  {
    id: "barrier",
    name: "Barrier Spray",
    copy: "Our standard synthetic barrier treatment.",
    intervalDays: 21,
    multiplier: 1,
    features: ["Reapplied every 21 days", "Kills on contact and keeps working", "Dry and yard-ready in about 30 minutes"],
    badge: "Most popular",
  },
  {
    id: "natural",
    name: "Natural Treatment",
    copy: "A botanical, essential-oil based formula.",
    intervalDays: 14,
    multiplier: 1.15,
    features: ["Reapplied every 14 days", "Plant-derived active ingredients", "Same technician, same visit window"],
  },
]

export function getTreatment(id: TreatmentId): Treatment {
  return TREATMENTS.find((t) => t.id === id) ?? TREATMENTS[0]
}

export function isTreatmentId(v: string | null | undefined): v is TreatmentId {
  return v === "barrier" || v === "natural"
}

// ─── Plan / cadence ──────────────────────────────────────────────────────────

export interface Plan {
  id: PlanId
  name: string
  copy: string
  /** Treatments included across a season. One-time is a single visit. */
  visits: number
  /** Per-visit multiplier. Season commits, so it prices lowest. */
  multiplier: number
  badge?: string
}

export const PLANS: Plan[] = [
  {
    id: "season",
    name: "Season Long",
    copy: "Every treatment from spring through first frost, on a set cycle.",
    visits: 7,
    multiplier: 1,
    badge: "Best value",
  },
  {
    id: "monthly",
    name: "Month to Month",
    copy: "Same crew and same cycle, cancel whenever you want.",
    visits: 7,
    multiplier: 1.08,
  },
  {
    id: "one-time",
    name: "One-Time Event",
    copy: "A single treatment timed to a party, wedding, or cookout.",
    visits: 1,
    multiplier: 1.6,
  },
]

export function getPlan(id: PlanId): Plan {
  return PLANS.find((p) => p.id === id) ?? PLANS[0]
}

export function isPlanId(v: string | null | undefined): v is PlanId {
  return v === "season" || v === "monthly" || v === "one-time"
}

// ─── Pricing ─────────────────────────────────────────────────────────────────
//
// PLACEHOLDER DEMO PRICING
//   per treatment = max($89, treatable sq ft × $0.022)
//                   × target multiplier × treatment multiplier × plan multiplier
// A 4,200 sq ft yard on the standard barrier program lands at $92 per treatment.

export const MJ_RATE_PER_SQFT = 0.022
export const MJ_MIN_PER_TREATMENT = 89

export interface MosquitoQuote {
  perTreatment: number
  visits: number
  seasonTotal: number
  intervalDays: number
  minApplied: boolean
}

export function quoteMosquito(
  sqft: number,
  target: TargetId,
  treatment: TreatmentId,
  plan: PlanId,
): MosquitoQuote {
  const t = getTreatment(treatment)
  const p = getPlan(plan)
  if (!sqft || sqft <= 0) {
    return { perTreatment: 0, visits: p.visits, seasonTotal: 0, intervalDays: t.intervalDays, minApplied: false }
  }
  const raw = sqft * MJ_RATE_PER_SQFT
  const base = Math.max(MJ_MIN_PER_TREATMENT, raw)
  const perTreatment = Math.round(base * getTarget(target).multiplier * t.multiplier * p.multiplier)
  return {
    perTreatment,
    visits: p.visits,
    seasonTotal: perTreatment * p.visits,
    intervalDays: t.intervalDays,
    minApplied: base > raw,
  }
}

// ─── Address → yard measurement (simulated) ──────────────────────────────────
//
// "Your yard is already measured" is the whole premise of the attach card, so the
// estimator measures it up front. The lookup is faked: we derive a stable,
// plausible treatable area from the address text and snap it to the slider step.

export const MOCK_ADDRESSES = [
  "1420 Magnolia Ridge Ct, Cary, NC 27519",
  "308 Whitfield Ln, Apex, NC 27502",
  "2211 Sweetbriar Dr, Raleigh, NC 27607",
  "7 Hollow Creek Way, Holly Springs, NC 27540",
  "915 Foxfire Trail, Durham, NC 27713",
]

/** The demo address every "use my location" and default flow lands on. */
export const DEMO_ADDRESS = MOCK_ADDRESSES[0]

export function measureYardFromAddress(address: string): number {
  // The demo address is pinned to the yard the attach-card copy quotes.
  if (address.trim().toLowerCase() === DEMO_ADDRESS.toLowerCase()) return YARD_DEFAULT
  let hash = 0
  for (let i = 0; i < address.length; i++) hash = (hash * 31 + address.charCodeAt(i)) >>> 0
  const span = 9000 - 2500
  const raw = 2500 + (hash % (span + 1))
  return Math.round(raw / YARD_STEP) * YARD_STEP
}

// ─── Scheduling ──────────────────────────────────────────────────────────────

export const VISIT_WINDOWS = [
  { id: "morning", label: "Morning", time: "8:00 – 11:00 AM" },
  { id: "midday", label: "Mid-Day", time: "11:00 AM – 2:00 PM" },
  { id: "afternoon", label: "Afternoon", time: "2:00 – 5:00 PM" },
]

export function getVisitWindow(id: string) {
  return VISIT_WINDOWS.find((w) => w.id === id)
}

/** Next 14 weekdays, starting tomorrow. */
export function getAvailableDates(): Date[] {
  const dates: Date[] = []
  const cursor = new Date()
  cursor.setDate(cursor.getDate() + 1)
  while (dates.length < 14) {
    const day = cursor.getDay()
    if (day !== 0 && day !== 6) dates.push(new Date(cursor))
    cursor.setDate(cursor.getDate() + 1)
  }
  return dates
}

export function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

export function formatVisitDate(d: Date) {
  return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })
}

export function formatVisitDateShort(d: Date) {
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })
}

// ─── Formatting ──────────────────────────────────────────────────────────────

export function usd(n: number): string {
  return `$${Math.round(n).toLocaleString("en-US")}`
}
