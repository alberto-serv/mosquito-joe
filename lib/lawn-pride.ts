// ─── Lawn Pride attach offer ─────────────────────────────────────────────────
//
// The cross-sell at checkout. Mosquito Joe has already measured the turf, so
// Lawn Pride can quote a real price off the same number instead of asking the
// customer for anything.

export type LawnProgramId = "seven-app" | "enhanced" | "enhanced-plus"

export interface LawnProgram {
  id: LawnProgramId
  name: string
  /** What the program adds over the one before it. */
  summary: string
  includes: string[]
  /** Multiplier on the per-application base rate. */
  multiplier: number
  badge?: string
}

export const LAWN_PROGRAMS: LawnProgram[] = [
  {
    id: "seven-app",
    name: "7-Application Program",
    summary: "Fertilization and weed control, 7 timed visits.",
    includes: ["Granular fertilization", "Broadleaf weed control", "7 visits timed to the growing season"],
    multiplier: 1,
  },
  {
    id: "enhanced",
    name: "Enhanced Program",
    summary: "Adds pre-emergent and grub control.",
    includes: [
      "Everything in the 7-Application Program",
      "Pre-emergent crabgrass control",
      "Season-long grub control",
    ],
    multiplier: 1.28,
    badge: "Most popular",
  },
  {
    id: "enhanced-plus",
    name: "Enhanced Plus",
    summary: "Adds core aeration and overseeding.",
    includes: ["Everything in the Enhanced Program", "Fall core aeration", "Overseeding with improved turf varieties"],
    multiplier: 1.55,
  },
]

/** The middle option is the default, per the checkout spec. */
export const DEFAULT_LAWN_PROGRAM: LawnProgramId = "enhanced"

export function getLawnProgram(id: LawnProgramId): LawnProgram {
  return LAWN_PROGRAMS.find((p) => p.id === id) ?? LAWN_PROGRAMS[1]
}

// PLACEHOLDER LAWN PRIDE PRICING
//   per application = max($49, turf sq ft × $0.011) × program multiplier
//   billed per application, 7 applications per season
export const LP_RATE_PER_SQFT = 0.011
export const LP_MIN_PER_APPLICATION = 49
export const LP_APPLICATIONS = 7

export interface LawnQuote {
  perApplication: number
  applications: number
  seasonTotal: number
  minApplied: boolean
}

export function quoteLawn(turfSqft: number, program: LawnProgramId): LawnQuote {
  if (!turfSqft || turfSqft <= 0) {
    return { perApplication: 0, applications: LP_APPLICATIONS, seasonTotal: 0, minApplied: false }
  }
  const raw = turfSqft * LP_RATE_PER_SQFT
  const base = Math.max(LP_MIN_PER_APPLICATION, raw)
  const perApplication = Math.round(base * getLawnProgram(program).multiplier)
  return {
    perApplication,
    applications: LP_APPLICATIONS,
    seasonTotal: perApplication * LP_APPLICATIONS,
    minApplied: base > raw,
  }
}
