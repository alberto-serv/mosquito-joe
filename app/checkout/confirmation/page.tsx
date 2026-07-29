"use client"

import { Suspense, useMemo } from "react"
import Image from "next/image"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { ArrowUpRight, Check, CreditCard, Loader2, User } from "lucide-react"
import {
  MosquitoJoeMark,
  LawnPrideMark,
  NeighborlyMark,
  WindowGenieMark,
  MrHandymanMark,
} from "@/components/brand-mark"
import { AVAILABLE_BRANDS } from "@/lib/neighborly-brands"
import { getLawnProgram, type LawnProgramId } from "@/lib/lawn-pride"
import {
  LOT_DEFAULT,
  getTreatment,
  getVisitWindow,
  isTreatmentId,
  usd,
  type TreatmentId,
} from "@/lib/mosquito-data"

// ─── Screen 3 ────────────────────────────────────────────────────────────────
//
// Runs on the NEUTRAL Neighborly token set, not Mosquito Joe's and not Lawn
// Pride's. The shift is deliberate: the brands sold the service, the household
// is the shared asset. Brand colour appears only inside the two service cards.

export default function ConfirmationPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-white">
          <Loader2 className="h-6 w-6 animate-spin text-nb-slate-soft" />
        </div>
      }
    >
      <Confirmation />
    </Suspense>
  )
}

function Confirmation() {
  const params = useSearchParams()
  const num = (k: string, fallback = 0) => Number.parseInt(params.get(k) || "", 10) || fallback

  const treatment: TreatmentId = isTreatmentId(params.get("treatment"))
    ? (params.get("treatment") as TreatmentId)
    : "barrier"
  const sqft = num("sqft", LOT_DEFAULT)
  const lawnOn = params.get("lawn") === "1"
  const lawnProgram = getLawnProgram((params.get("lawnProgram") || "enhanced") as LawnProgramId)
  const treatmentCfg = getTreatment(treatment)

  const visitDate = useMemo(() => {
    const raw = params.get("visitDate")
    if (!raw) return null
    const d = new Date(raw)
    return Number.isNaN(d.getTime()) ? null : d
  }, [params])
  const visitWindow = getVisitWindow(params.get("visitWindow") || "")
  const visitDateLabel = visitDate
    ? visitDate.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })
    : "To be confirmed"

  const customerName = params.get("customerName") || ""
  const email = params.get("email") || ""
  const phone = params.get("phone") || ""
  const cardLast4 = params.get("cardLast4") || ""

  // One address, one household. The street line leads; everything on this screen
  // hangs off it rather than off an order number.
  const rawAddress = params.get("address") || ""
  const [street, ...rest] = rawAddress.split(",")
  const locality = rest.join(",").trim()

  const activeCount = lawnOn ? "Both services are" : "Your service is"

  return (
    <div className="min-h-screen bg-white text-nb-navy">
      <div className="mx-auto max-w-[860px] px-5 py-10 md:py-14">
        {/* ── Header. A title you can read in one pass, then the household
            it belongs to. Still one address and one household, not an order
            number, but no longer asking the address to be the headline. */}
        <header>
          <div className="flex items-center gap-2.5">
            <NeighborlyMark size="sm" />
            <span className="text-[13px] font-bold tracking-[-0.01em] text-nb-navy">Neighborly</span>
          </div>

          <div className="mt-6 flex items-start gap-3">
            <span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-nb-blue">
              <Check className="h-[18px] w-[18px] text-white" strokeWidth={3} />
            </span>
            <div className="min-w-0">
              <h1 className="text-[clamp(26px,4vw,36px)] font-extrabold leading-[1.08] tracking-[-0.03em] text-nb-navy">
                {activeCount} scheduled
              </h1>
              <p className="mt-1 text-[15px] text-nb-slate-soft">
                {customerName ? `${customerName}, we` : "We"} sent a confirmation
                {email ? ` to ${email}` : ""}.
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-line bg-nb-navy-soft p-5">
            <p className="text-[11px] font-bold uppercase tracking-[0.13em] text-nb-slate-soft">Your household</p>
            <p className="mt-1.5 text-[19px] font-bold leading-tight tracking-[-0.02em] text-nb-navy">
              {street || "Your household"}
            </p>
            {locality && <p className="text-[15px] text-nb-slate-soft">{locality}</p>}
            <p className="mt-2 text-[13px] font-semibold text-nb-slate-soft tabular">
              {sqft.toLocaleString()} sq ft lot, measured
            </p>
            <p className="mt-3 max-w-[56ch] text-[13.5px] leading-relaxed text-nb-slate">
              Everything below is tied to this address, not to a single order. Add or change a service any time and it
              stays on the same account.
            </p>
          </div>
        </header>

        {/* ── Two service cards ──────────────────────────────────────── */}
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          <ServiceCard
            mark={<MosquitoJoeMark size="md" />}
            brand="Mosquito Joe"
            plan={`Full yard, ${treatmentCfg.id === "barrier" ? "standard barrier" : "natural treatment"}`}
            rows={[
              { label: "Next visit", value: visitDateLabel },
              { label: "Cadence", value: `Every ${treatmentCfg.intervalDays} days` },
            ]}
            price={`${usd(num("perTreatment"))} per treatment`}
            total={`${usd(num("mjSeasonTotal"))} for the season`}
            accent="#FBE122"
          />

          {lawnOn && (
            <ServiceCard
              mark={<LawnPrideMark size="md" />}
              brand="Lawn Pride"
              plan={lawnProgram.name}
              rows={[
                { label: "First application", value: visitDateLabel },
                { label: "Cadence", value: `${num("lawnApplications", 7)} visits this year` },
              ]}
              price={`${usd(num("lawnPerApplication"))} per application`}
              total={`${usd(num("lawnSeasonTotal"))} for the season`}
              accent="#12875E"
            />
          )}
        </div>

        {/* ── What the household is spending, across both brands ─────── */}
        <section className="surface mt-4 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 p-5">
          <div>
            <p className="text-[14.5px] font-bold text-nb-navy">
              {lawnOn ? "Total for both services" : "Total for this service"}
            </p>
            <p className="text-[12.5px] text-nb-slate-soft">Billed after each visit, nothing upfront</p>
          </div>
          <p className="text-[30px] font-extrabold leading-none tracking-[-0.03em] text-nb-navy tabular">
            {usd(num("seasonTotal"))}
          </p>
        </section>

        {/* ── Shared by both services ────────────────────────────────── */}
        <section className="surface mt-4 divide-y divide-line" aria-label="Shared account details">
          <SharedRow
            icon={<CreditCard className="h-4 w-4 text-nb-slate-soft" />}
            label="Payment method"
            value={cardLast4 ? `Card ending ${cardLast4}` : "Card on file"}
            note={lawnOn ? "Billed separately per visit, one card" : "Billed after each visit"}
          />
          <SharedRow
            icon={<User className="h-4 w-4 text-nb-slate-soft" />}
            label="Contact"
            value={customerName || "Account holder"}
            note={[email, phone].filter(Boolean).join(" · ")}
          />
        </section>

        {/* ── Available at this address ──────────────────────────────── */}
        <section className="surface-quiet mt-4 p-5 md:p-6" aria-label="Available at this address">
          <h2 className="text-[11px] font-bold uppercase tracking-[0.13em] text-nb-slate-soft">
            Available at this address
          </h2>

          <div className="mt-4 divide-y divide-line">
            {AVAILABLE_BRANDS.map((b) => (
              <a
                key={b.id}
                href={b.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3 py-3.5 first:pt-0 last:pb-0"
              >
                {b.id === "window-genie" ? <WindowGenieMark size="sm" /> : <MrHandymanMark size="sm" />}
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-1.5 text-[14px] font-semibold text-nb-navy group-hover:underline">
                    {b.name}
                    <ArrowUpRight className="h-3.5 w-3.5 text-nb-slate-soft transition-colors group-hover:text-nb-blue" />
                  </p>
                  <p className="text-[12.5px] text-nb-slate-soft">{b.service}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-[14px] font-semibold text-nb-navy tabular">From {usd(b.startingPrice)}</p>
                  <p className="text-[12px] text-nb-slate-soft">{b.priceBasis}</p>
                </div>
              </a>
            ))}
          </div>

          <p className="mt-3.5 text-[11.5px] text-nb-slate-soft">
            Placeholder pricing. Both serve this ZIP code and can share the account you already have.
          </p>
        </section>

        {/* ── Footer ─────────────────────────────────────────────────── */}
        <footer className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-line pt-6 text-[12.5px] text-nb-slate-soft sm:flex-row">
          <p>
            {visitWindow ? `First visit ${visitDateLabel}, ${visitWindow.time}. ` : ""}
            <Link href="/" className="font-semibold text-nb-blue hover:underline">
              Back to the estimator
            </Link>
          </p>
          <a
            href="https://www.goserv.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 opacity-70 transition-opacity hover:opacity-100"
          >
            <span>Powered by</span>
            <Image src="/serv-logo.png" alt="SERV" width={48} height={18} className="h-[14px] w-auto brightness-0" />
          </a>
        </footer>
      </div>
    </div>
  )
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function ServiceCard({
  mark,
  brand,
  plan,
  rows,
  price,
  total,
  accent,
}: {
  mark: React.ReactNode
  brand: string
  plan: string
  rows: Array<{ label: string; value: string }>
  price: string
  /** What the whole programme costs, not just one visit. */
  total: string
  /** The only place a brand colour appears on this screen. */
  accent: string
}) {
  return (
    <div className="surface overflow-hidden">
      <span className="block h-1 w-full" style={{ backgroundColor: accent }} />
      <div className="p-5">
        <div className="flex items-center gap-3">
          {mark}
          <div className="min-w-0">
            <p className="text-[15px] font-bold text-nb-navy">{brand}</p>
            <p className="text-[13px] text-nb-slate-soft">{plan}</p>
          </div>
        </div>

        <dl className="mt-4 space-y-2 border-t border-line pt-4">
          {rows.map((r) => (
            <div key={r.label} className="flex items-baseline justify-between gap-3">
              <dt className="text-[13px] text-nb-slate-soft">{r.label}</dt>
              <dd className="text-[13.5px] font-semibold text-nb-navy">{r.value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-3 border-t border-line pt-3">
          <p className="text-[12.5px] text-nb-slate-soft tabular">{price}</p>
          <p className="mt-0.5 text-[16px] font-extrabold tracking-[-0.02em] text-nb-navy tabular">{total}</p>
        </div>
      </div>
    </div>
  )
}

function SharedRow({
  icon,
  label,
  value,
  note,
}: {
  icon: React.ReactNode
  label: string
  value: string
  note?: string
}) {
  return (
    <div className="flex items-center gap-3 p-5">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-nb-navy-soft">{icon}</span>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-bold uppercase tracking-[0.11em] text-nb-slate-soft">{label}</p>
        <p className="mt-0.5 truncate text-[14px] font-semibold text-nb-navy">{value}</p>
      </div>
      {note && <p className="hidden shrink-0 text-[12.5px] text-nb-slate-soft sm:block">{note}</p>}
    </div>
  )
}
