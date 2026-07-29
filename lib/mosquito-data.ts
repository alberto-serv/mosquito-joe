// ─── Mosquito Joe quote model ────────────────────────────────────────────────
//
// The estimator walks a homeowner through four decisions: what to treat, how big
// the lot is, which treatment type, and how often. Those turn into a per-visit
// price and a season total. Contact details and scheduling are collected at
// checkout, not here.
//
// Every number below is PLACEHOLDER DEMO PRICING.

// ─── Types ───────────────────────────────────────────────────────────────────

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

// ─── Lot size ────────────────────────────────────────────────────────────────
//
// The homeowner dials in the treatable lot — turf plus the beds, wood lines, and
// perimeter we spray. Anything over the cap is a custom program routed to a call.

export const LOT_MIN = 1000
export const LOT_MAX = 10000
export const LOT_STEP = 100
export const LOT_DEFAULT = 5000

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
//   per treatment = max($89, lot sq ft × $0.022)
//                   × target multiplier × treatment multiplier × plan multiplier
// The default 5,000 sq ft lot on the default selections lands at $138.

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

// ─── Address → lot measurement (simulated) ───────────────────────────────────
//
// "Your yard is already measured" is the whole premise of the attach card, so the
// estimator offers to measure the lot for anyone who does not know it. The lookup
// is faked: we derive a stable, plausible lot size from the address text and snap
// it to the slider step.

export const MOCK_ADDRESSES = [
  "1420 Magnolia Ridge Ct, Cary, NC 27519",
  "308 Whitfield Ln, Apex, NC 27502",
  "2211 Sweetbriar Dr, Raleigh, NC 27607",
  "7 Hollow Creek Way, Holly Springs, NC 27540",
  "915 Foxfire Trail, Durham, NC 27713",
]

/** The demo address every "use my location" and default flow lands on. */
export const DEMO_ADDRESS = MOCK_ADDRESSES[0]

/** The demo address measures to something other than the slider default, so the
 *  lookup visibly moves both the area and the price it feeds. */
export const DEMO_MEASURED_SQFT = 4200

export function measureLotFromAddress(address: string): number {
  if (address.trim().toLowerCase() === DEMO_ADDRESS.toLowerCase()) return DEMO_MEASURED_SQFT
  let hash = 0
  for (let i = 0; i < address.length; i++) hash = (hash * 31 + address.charCodeAt(i)) >>> 0
  const span = 9000 - 2500
  const raw = 2500 + (hash % (span + 1))
  return Math.round(raw / LOT_STEP) * LOT_STEP
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

// ─── Next available appointment ──────────────────────────────────────────────
//
// Powers the "Next: ..." half of the primary CTA. Time-dependent, so callers
// must resolve it after mount rather than during render, or SSR and the client
// will disagree on what "today" means.

export interface NextSlot {
  label: string
}

export function nextAvailableSlot(now = new Date()): NextSlot {
  const day = now.getDay()
  const isWeekday = day !== 0 && day !== 6

  // A late-afternoon slot still open today.
  if (isWeekday && now.getHours() < 15) return { label: "Today 4:30 PM" }

  const cursor = new Date(now)
  cursor.setDate(cursor.getDate() + 1)
  while (cursor.getDay() === 0 || cursor.getDay() === 6) cursor.setDate(cursor.getDate() + 1)

  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const isTomorrow = isSameDay(cursor, tomorrow)

  return {
    label: `${isTomorrow ? "Tomorrow" : cursor.toLocaleDateString("en-US", { weekday: "short" })} 8:00 AM`,
  }
}
