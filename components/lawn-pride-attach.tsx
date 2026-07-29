"use client"

import { Switch } from "@/components/ui/switch"
import { YardPlan } from "@/components/yard-plan"
import { LawnPrideMark, LawnPrideWordmark } from "@/components/brand-mark"
import { AnimatedTotal } from "@/components/animated-total"
import { LAWN_PROGRAMS, quoteLawn, type LawnProgramId } from "@/lib/lawn-pride"
import { usd } from "@/lib/mosquito-data"
import { Check } from "lucide-react"

// ─── The attach card ─────────────────────────────────────────────────────────
//
// Sits between the order summary and the payment fields. It is built on the same
// `.surface` as the order above it, at the same padding and the same type scale,
// because it is not an ad — it is a second line item the customer has not
// accepted yet. The only thing that separates it visually is the state of the
// turf layer in the plan.

interface LawnPrideAttachProps {
  turfSqft: number
  enabled: boolean
  onEnabledChange: (v: boolean) => void
  program: LawnProgramId
  onProgramChange: (id: LawnProgramId) => void
}

export function LawnPrideAttach({
  turfSqft,
  enabled,
  onEnabledChange,
  program,
  onProgramChange,
}: LawnPrideAttachProps) {
  const quote = quoteLawn(turfSqft, program)

  return (
    <section
      className="surface overflow-hidden transition-all duration-500"
      style={{
        borderColor: enabled ? "#12875E" : undefined,
        boxShadow: enabled ? "0 2px 4px rgba(18,135,94,.10), 0 18px 44px rgba(18,135,94,.14)" : undefined,
      }}
      aria-label="Lawn Pride turf treatment"
    >
      <div className="p-6 md:p-7">
        {/* Brand line — same weight as the Mosquito Joe line above it */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <LawnPrideMark size="md" muted={!enabled} />
            <div>
              <LawnPrideWordmark className="h-3.5 w-auto" />
              <p className="mt-1 text-[11.5px] font-semibold text-mj-slate-soft">Lawn care, same service area</p>
            </div>
          </div>
          <span className={enabled ? "badge-lp" : "badge-quiet"}>{enabled ? "Added" : "Not added"}</span>
        </div>

        {/* The statement of fact */}
        <div className="mt-5">
          <h2 className="text-[21px] font-extrabold tracking-[-0.026em] text-black">
            Your yard is already measured.
          </h2>
          <p className="mt-1.5 text-[15px] leading-relaxed text-body">
            Lawn Pride can treat the same {turfSqft.toLocaleString()} sq ft of turf.
          </p>
        </div>

        {/* The plan, carrying both layers */}
        <div className="mt-5">
          <YardPlan sqft={turfSqft} coverage="both" turfActive={enabled} />
        </div>

        {/* Programs */}
        <fieldset className="mt-6">
          <legend className="eyebrow mb-3">Program</legend>
          <div className="space-y-2">
            {LAWN_PROGRAMS.map((p) => {
              const selected = program === p.id
              const q = quoteLawn(turfSqft, p.id)
              return (
                <label
                  key={p.id}
                  className={`flex cursor-pointer items-start gap-3 rounded-lg border-2 p-3.5 transition-all duration-150 ${
                    selected ? "border-lp-green bg-lp-select" : "border-line bg-white hover:border-line-strong"
                  }`}
                >
                  <input
                    type="radio"
                    name="lawn-program"
                    value={p.id}
                    checked={selected}
                    onChange={() => onProgramChange(p.id)}
                    className="sr-only"
                  />
                  <span
                    className={`mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                      selected ? "border-lp-green bg-lp-green" : "border-line-strong bg-white"
                    }`}
                  >
                    {selected && <Check className="h-3 w-3 text-white" strokeWidth={3.5} />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span className="text-[14.5px] font-bold text-black">{p.name}</span>
                      {p.badge && <span className="badge-lp">{p.badge}</span>}
                    </span>
                    <span className="mt-0.5 block text-[13px] leading-snug text-mj-slate-soft">{p.summary}</span>
                  </span>
                  <span className="shrink-0 text-right">
                    <span className="block text-[15px] font-extrabold text-black tabular">{usd(q.perApplication)}</span>
                    <span className="block text-[11.5px] font-semibold text-mj-slate-soft">per application</span>
                  </span>
                </label>
              )
            })}
          </div>
        </fieldset>

        {/* The toggle */}
        <div
          className={`mt-5 flex items-center justify-between gap-4 rounded-lg border-2 p-4 transition-all duration-300 ${
            enabled ? "border-lp-green bg-lp-select" : "border-line bg-muted"
          }`}
        >
          <div className="flex items-center gap-3">
            <Switch
              id="add-lawn-pride"
              checked={enabled}
              onCheckedChange={onEnabledChange}
              className="data-[state=checked]:bg-lp-green"
            />
            <label htmlFor="add-lawn-pride" className="cursor-pointer text-[14.5px] font-bold text-black">
              Add Lawn Pride to this order
            </label>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-[17px] font-extrabold text-black tabular">
              <AnimatedTotal value={quote.perApplication} />
            </p>
            <p className="text-[11.5px] font-semibold text-mj-slate-soft">
              per application &middot; {quote.applications} applications
            </p>
          </div>
        </div>

        <p className="mt-3 text-[13px] text-mj-slate-soft">Same card. Same visit window. One account.</p>

        <p className="mt-4 border-t border-line pt-3 text-[11.5px] leading-relaxed text-mj-slate-soft">
          Placeholder pricing: $0.011 per sq ft of turf per application, $49 minimum. 7-Application &times;1.0,
          Enhanced &times;1.28, Enhanced Plus &times;1.55. Billed per application.
        </p>
      </div>
    </section>
  )
}
