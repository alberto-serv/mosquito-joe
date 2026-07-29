"use client"

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Loader2,
  LocateFixed,
  Lock,
  MapPin,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MosquitoJoeMark, LawnPrideMark } from "@/components/brand-mark"
import { AnimatedTotal } from "@/components/animated-total"
import { LawnPrideAttach } from "@/components/lawn-pride-attach"
import { DEFAULT_LAWN_PROGRAM, getLawnProgram, quoteLawn, type LawnProgramId } from "@/lib/lawn-pride"
import {
  DEMO_ADDRESS,
  MOCK_ADDRESSES,
  VISIT_WINDOWS,
  formatVisitDate,
  getAvailableDates,
  getPlan,
  getTarget,
  getTreatment,
  isPlanId,
  isSameDay,
  isTargetId,
  isTreatmentId,
  quoteMosquito,
  usd,
  LOT_DEFAULT,
  type PlanId,
  type TargetId,
  type TreatmentId,
} from "@/lib/mosquito-data"

export default function CheckoutPage() {
  return (
    <Suspense fallback={<CheckoutFallback />}>
      <Checkout />
    </Suspense>
  )
}

function CheckoutFallback() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-mj-slate-soft" />
    </div>
  )
}

function Checkout() {
  const router = useRouter()
  const params = useSearchParams()

  // ── Order, carried from the estimator ──────────────────────────────
  const target: TargetId = isTargetId(params.get("target")) ? (params.get("target") as TargetId) : "both"
  const treatment: TreatmentId = isTreatmentId(params.get("treatment"))
    ? (params.get("treatment") as TreatmentId)
    : "barrier"
  const plan: PlanId = isPlanId(params.get("plan")) ? (params.get("plan") as PlanId) : "season"
  const sqft = Number.parseInt(params.get("sqft") || "", 10) || LOT_DEFAULT
  const mjQuote = useMemo(() => quoteMosquito(sqft, target, treatment, plan), [sqft, target, treatment, plan])

  // ── The attach offer ───────────────────────────────────────────────
  const [lawnOn, setLawnOn] = useState(false)
  const [lawnProgram, setLawnProgram] = useState<LawnProgramId>(DEFAULT_LAWN_PROGRAM)
  const lawnQuote = quoteLawn(sqft, lawnProgram)

  // ── Scheduling ─────────────────────────────────────────────────────
  const availableDates = useMemo(() => getAvailableDates(), [])
  const [visitDate, setVisitDate] = useState<Date | null>(null)
  const [visitWindow, setVisitWindow] = useState("")
  const [calendarStart, setCalendarStart] = useState(0)
  const visibleDates = availableDates.slice(calendarStart, calendarStart + 5)
  const windowCfg = VISIT_WINDOWS.find((w) => w.id === visitWindow)

  // ── Contact and address ────────────────────────────────────────────
  const [contact, setContact] = useState({ firstName: "", lastName: "", email: "", phone: "" })
  // Only prefilled when the estimator measured the lot from an address.
  const [address, setAddress] = useState(params.get("address") || "")
  const [address2, setAddress2] = useState("")

  // ── Payment ────────────────────────────────────────────────────────
  const [card, setCard] = useState({ number: "", exp: "", cvc: "", zip: "" })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const seasonTotal = mjQuote.seasonTotal + (lawnOn ? lawnQuote.seasonTotal : 0)
  const firstVisitTotal = mjQuote.perTreatment + (lawnOn ? lawnQuote.perApplication : 0)

  const cardDigits = card.number.replace(/\D/g, "")
  const canPay =
    visitDate &&
    visitWindow &&
    contact.firstName.trim() &&
    contact.lastName.trim() &&
    contact.email.trim() &&
    contact.phone.trim() &&
    address.trim() &&
    cardDigits.length >= 15 &&
    /^\d{2}\s?\/\s?\d{2}$/.test(card.exp.trim()) &&
    card.cvc.trim().length >= 3

  const payLabel = lawnOn ? "Start both services" : "Start mosquito service"

  const handlePay = async () => {
    if (!canPay) return
    setSubmitting(true)
    await new Promise((r) => setTimeout(r, 1400))
    const q = new URLSearchParams({
      target,
      treatment,
      plan,
      sqft: String(sqft),
      perTreatment: String(mjQuote.perTreatment),
      visits: String(mjQuote.visits),
      mjSeasonTotal: String(mjQuote.seasonTotal),
      lawn: lawnOn ? "1" : "0",
      lawnProgram,
      lawnPerApplication: String(lawnQuote.perApplication),
      lawnApplications: String(lawnQuote.applications),
      lawnSeasonTotal: String(lawnOn ? lawnQuote.seasonTotal : 0),
      seasonTotal: String(seasonTotal),
      firstVisitTotal: String(firstVisitTotal),
      customerName: `${contact.firstName} ${contact.lastName}`.trim(),
      email: contact.email,
      phone: contact.phone,
      address: [address, address2].filter(Boolean).join(", "),
      visitDate: visitDate ? visitDate.toISOString() : "",
      visitWindow,
      cardLast4: cardDigits.slice(-4),
    })
    router.push(`/checkout/confirmation?${q.toString()}`)
  }

  return (
    <div className="min-h-screen bg-muted/40">
      <div className="container mx-auto px-4 py-8 md:py-10">
        {/* Same 3xl column the estimator ends on, so the order card keeps its
            width, position, and shape across the handoff. */}
        <div className="mx-auto max-w-3xl">
          <Link
            href="/"
            className="mb-5 inline-flex items-center text-[13.5px] font-bold text-ink transition-colors hover:text-mj-slate-soft"
          >
            Back to your quote
          </Link>

          <h1 className="text-[30px] font-extrabold tracking-[-0.03em] text-black">Checkout</h1>
          <p className="mt-1.5 text-[14.5px] text-mj-slate-soft">
            Confirm the order, pick your first visit, and we put you on the route.
          </p>

          <div className="mt-6 space-y-4">
            {/* ── Order summary ─────────────────────────────────────── */}
            <section className="surface p-6 md:p-7" aria-label="Order summary">
              <h2 className="eyebrow mb-4">Order summary</h2>

              <div className="divide-y divide-line">
                {/* Mosquito Joe line item */}
                <div className="flex items-start gap-3 pb-4">
                  <MosquitoJoeMark size="md" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[14.5px] font-bold text-black">Mosquito Joe</p>
                    <p className="text-[13px] leading-snug text-mj-slate-soft">
                      {getTarget(target).name} &middot; {getTreatment(treatment).name}
                    </p>
                    <p className="text-[13px] leading-snug text-mj-slate-soft">
                      {getPlan(plan).name} &middot;{" "}
                      {mjQuote.visits === 1 ? "single visit" : `${mjQuote.visits} treatments`} &middot; every{" "}
                      {mjQuote.intervalDays} days
                    </p>
                    <p className="text-[13px] leading-snug text-mj-slate-soft tabular">
                      {sqft.toLocaleString()} sq ft lot
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-[15px] font-extrabold text-black tabular">{usd(mjQuote.perTreatment)}</p>
                    <p className="text-[11.5px] font-semibold text-mj-slate-soft">per treatment</p>
                    <p className="mt-1 text-[12px] text-mj-slate-soft tabular">{usd(mjQuote.seasonTotal)} season</p>
                  </div>
                </div>

                {/* Lawn Pride line item — a separate brand, never blended in */}
                {lawnOn && (
                  <div className="flex animate-line-in items-start gap-3 py-4">
                    <LawnPrideMark size="md" />
                    <div className="min-w-0 flex-1">
                      <p className="text-[14.5px] font-bold text-black">Lawn Pride</p>
                      <p className="text-[13px] leading-snug text-mj-slate-soft">{getLawnProgram(lawnProgram).name}</p>
                      <p className="text-[13px] leading-snug text-mj-slate-soft">
                        {sqft.toLocaleString()} sq ft turf &middot; {lawnQuote.applications} applications
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-[15px] font-extrabold text-black tabular">{usd(lawnQuote.perApplication)}</p>
                      <p className="text-[11.5px] font-semibold text-mj-slate-soft">per application</p>
                      <p className="mt-1 text-[12px] text-mj-slate-soft tabular">{usd(lawnQuote.seasonTotal)} season</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Total */}
              <div className="mt-5 border-t border-line pt-4">
                <div className="flex items-baseline justify-between gap-4">
                  <span className="text-[14.5px] font-bold text-black">Season total</span>
                  <AnimatedTotal
                    value={seasonTotal}
                    className="text-[30px] font-extrabold leading-none tracking-[-0.03em] text-black"
                  />
                </div>
                <div className="mt-2 flex items-baseline justify-between gap-4 text-[13px] text-mj-slate-soft">
                  <span>First visit{lawnOn ? "s" : ""}</span>
                  <AnimatedTotal value={firstVisitTotal} className="font-semibold" />
                </div>
                <p className="mt-3 text-[12px] text-mj-slate-soft">Billed after each visit. Nothing is charged today.</p>
              </div>
            </section>

            {/* ── First visit ───────────────────────────────────────── */}
            <section className="surface p-6 md:p-7" aria-label="First visit">
              <div className="mb-4 flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-mj-slate-soft" />
                <h2 className="eyebrow">First visit</h2>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCalendarStart(Math.max(0, calendarStart - 5))}
                  disabled={calendarStart === 0}
                  aria-label="Earlier dates"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-line-strong text-ink transition-colors hover:border-black disabled:opacity-30"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <div className="grid flex-1 grid-cols-5 gap-2">
                  {visibleDates.map((d) => {
                    const selected = visitDate && isSameDay(d, visitDate)
                    return (
                      <button
                        key={d.toISOString()}
                        type="button"
                        onClick={() => setVisitDate(d)}
                        className={`flex flex-col items-center rounded-lg border-2 px-1 py-2.5 transition-all ${
                          selected ? "border-black bg-black" : "border-line hover:border-line-strong"
                        }`}
                      >
                        <span
                          className={`text-[10.5px] font-bold uppercase tracking-[0.08em] ${
                            selected ? "text-mj-yellow" : "text-mj-slate-soft"
                          }`}
                        >
                          {d.toLocaleDateString("en-US", { weekday: "short" })}
                        </span>
                        <span
                          className={`my-0.5 text-[20px] font-extrabold tabular ${
                            selected ? "text-white" : "text-black"
                          }`}
                        >
                          {d.getDate()}
                        </span>
                        <span className={`text-[10.5px] ${selected ? "text-white/70" : "text-mj-slate-soft"}`}>
                          {d.toLocaleDateString("en-US", { month: "short" })}
                        </span>
                      </button>
                    )
                  })}
                </div>
                <button
                  type="button"
                  onClick={() => setCalendarStart(Math.min(availableDates.length - 5, calendarStart + 5))}
                  disabled={calendarStart + 5 >= availableDates.length}
                  aria-label="Later dates"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-line-strong text-ink transition-colors hover:border-black disabled:opacity-30"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              {visitDate && (
                <div className="mt-4">
                  <p className="text-[13px] font-bold text-black">Visit window for {formatVisitDate(visitDate)}</p>
                  <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
                    {VISIT_WINDOWS.map((w) => {
                      const selected = visitWindow === w.id
                      return (
                        <button
                          key={w.id}
                          type="button"
                          onClick={() => setVisitWindow(w.id)}
                          className={`rounded-lg border-2 p-3 text-left transition-all ${
                            selected ? "border-black bg-white shadow-card" : "border-line hover:border-line-strong"
                          }`}
                        >
                          <p className="text-[13.5px] font-bold text-black">{w.label}</p>
                          <p className="text-[12px] text-mj-slate-soft">{w.time}</p>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {lawnOn && visitDate && windowCfg && (
                <p className="mt-4 rounded-lg bg-lp-select p-3 text-[12.5px] text-lp-green-deep">
                  Lawn Pride runs the same window. Both crews arrive {formatVisitDate(visitDate)}, {windowCfg.time}.
                </p>
              )}
            </section>

            {/* ── The attach card. Sits after scheduling, so the visit window it
                shares with Mosquito Joe is already a decision the customer made. */}
            <LawnPrideAttach
              turfSqft={sqft}
              enabled={lawnOn}
              onEnabledChange={setLawnOn}
              program={lawnProgram}
              onProgramChange={setLawnProgram}
            />

            {/* ── Contact and address ───────────────────────────────── */}
            <section className="surface p-6 md:p-7" aria-label="Your information">
              <h2 className="eyebrow mb-4">Your information</h2>
              <div className="grid grid-cols-2 gap-3">
                <CheckoutField id="co-first" label="First name">
                  <Input
                    id="co-first"
                    value={contact.firstName}
                    onChange={(e) => setContact((p) => ({ ...p, firstName: e.target.value }))}
                    placeholder="Dana"
                  />
                </CheckoutField>
                <CheckoutField id="co-last" label="Last name">
                  <Input
                    id="co-last"
                    value={contact.lastName}
                    onChange={(e) => setContact((p) => ({ ...p, lastName: e.target.value }))}
                    placeholder="Whitfield"
                  />
                </CheckoutField>
              </div>
              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <CheckoutField id="co-email" label="Email">
                  <Input
                    id="co-email"
                    type="email"
                    value={contact.email}
                    onChange={(e) => setContact((p) => ({ ...p, email: e.target.value }))}
                    placeholder="dana@example.com"
                  />
                </CheckoutField>
                <CheckoutField id="co-phone" label="Mobile">
                  <Input
                    id="co-phone"
                    type="tel"
                    value={contact.phone}
                    onChange={(e) => setContact((p) => ({ ...p, phone: e.target.value }))}
                    placeholder="(919) 555-0142"
                  />
                </CheckoutField>
              </div>
              <div className="mt-3">
                <ServiceAddressField value={address} onChange={setAddress} />
                <Input
                  value={address2}
                  onChange={(e) => setAddress2(e.target.value)}
                  placeholder="Gate code, unit, or access notes (optional)"
                  className="mt-2"
                />
              </div>
            </section>

            {/* ── Payment ───────────────────────────────────────────── */}
            <section className="surface p-6 md:p-7" aria-label="Payment">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="eyebrow">Payment</h2>
                <span className="flex items-center gap-1.5 text-[11.5px] font-semibold text-mj-slate-soft">
                  <Lock className="h-3.5 w-3.5" />
                  Card stored, not charged today
                </span>
              </div>

              <CheckoutField id="co-card" label="Card number">
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mj-slate-soft" />
                  <Input
                    id="co-card"
                    inputMode="numeric"
                    autoComplete="cc-number"
                    value={card.number}
                    onChange={(e) => setCard((p) => ({ ...p, number: formatCardNumber(e.target.value) }))}
                    placeholder="4242 4242 4242 4242"
                    className="pl-9 tabular"
                  />
                </div>
              </CheckoutField>

              <div className="mt-3 grid grid-cols-3 gap-3">
                <CheckoutField id="co-exp" label="Expiry">
                  <Input
                    id="co-exp"
                    inputMode="numeric"
                    autoComplete="cc-exp"
                    value={card.exp}
                    onChange={(e) => setCard((p) => ({ ...p, exp: formatExpiry(e.target.value) }))}
                    placeholder="MM / YY"
                    className="tabular"
                  />
                </CheckoutField>
                <CheckoutField id="co-cvc" label="CVC">
                  <Input
                    id="co-cvc"
                    inputMode="numeric"
                    autoComplete="cc-csc"
                    value={card.cvc}
                    onChange={(e) => setCard((p) => ({ ...p, cvc: e.target.value.replace(/\D/g, "").slice(0, 4) }))}
                    placeholder="123"
                    className="tabular"
                  />
                </CheckoutField>
                <CheckoutField id="co-zip" label="ZIP">
                  <Input
                    id="co-zip"
                    inputMode="numeric"
                    autoComplete="postal-code"
                    value={card.zip}
                    onChange={(e) => setCard((p) => ({ ...p, zip: e.target.value.replace(/\D/g, "").slice(0, 5) }))}
                    placeholder="27519"
                    className="tabular"
                  />
                </CheckoutField>
              </div>

            </section>

            {/* ── Pay ───────────────────────────────────────────────── */}
            <div className="pb-10">
              <button onClick={handlePay} disabled={!canPay || submitting} className="btn-yellow w-full py-4 text-base">
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Starting
                  </>
                ) : (
                  payLabel
                )}
              </button>
              <p className="mt-3 text-center text-[12px] text-mj-slate-soft">
                {canPay
                  ? "You can reschedule or cancel any visit from your account."
                  : "Pick a visit date, add your details, and enter a card to finish."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function CheckoutField({ id, label, children }: { id: string; label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label htmlFor={id} className="text-[12.5px] font-semibold text-ink">
        {label}
      </Label>
      <div className="mt-1.5">{children}</div>
    </div>
  )
}

// The estimator only knows the address when it measured the lot, so checkout
// carries the same autocomplete rather than assuming a prefill.
function ServiceAddressField({ value, onChange }: { value: string; onChange: (s: string) => void }) {
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [open, setOpen] = useState(false)
  const [geo, setGeo] = useState(false)
  const boxRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const exact = MOCK_ADDRESSES.some((a) => a.toLowerCase() === value.toLowerCase())
    if (value.length >= 3 && !exact) {
      const filtered = MOCK_ADDRESSES.filter((a) => a.toLowerCase().includes(value.toLowerCase()))
      setSuggestions(filtered.length > 0 ? filtered : MOCK_ADDRESSES)
      setOpen(true)
    } else {
      setSuggestions([])
      setOpen(false)
    }
  }, [value])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const useLocation = useCallback(async () => {
    setGeo(true)
    if (navigator.geolocation) {
      try {
        await new Promise<GeolocationPosition>((res, rej) =>
          navigator.geolocation.getCurrentPosition(res, rej, { timeout: 8000 }),
        )
      } catch {
        /* the demo falls through to the pinned address either way */
      }
    }
    setGeo(false)
    onChange(DEMO_ADDRESS)
    setOpen(false)
  }, [onChange])

  return (
    <div ref={boxRef}>
      <Label htmlFor="co-address" className="text-[12.5px] font-semibold text-ink">
        Service address
      </Label>
      <div className="relative mt-1.5">
        <button
          type="button"
          onClick={useLocation}
          disabled={geo}
          aria-label="Use my location"
          className="absolute left-3 top-1/2 -translate-y-1/2 text-mj-slate-soft transition-colors hover:text-black disabled:opacity-50"
        >
          {geo ? <Loader2 className="h-4 w-4 animate-spin" /> : <LocateFixed className="h-4 w-4" />}
        </button>
        <Input
          id="co-address"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={DEMO_ADDRESS}
          className="pl-10"
        />
        {open && suggestions.length > 0 && (
          <div className="absolute z-20 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border border-line bg-white shadow-card-lift">
            {suggestions.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => {
                  onChange(s)
                  setOpen(false)
                }}
                className="flex w-full items-center gap-2 border-b border-line-soft px-4 py-3 text-left text-[13.5px] last:border-b-0 hover:bg-muted"
              >
                <MapPin className="h-4 w-4 shrink-0 text-mj-slate-soft" />
                {s}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function formatCardNumber(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 16)
  return digits.replace(/(\d{4})(?=\d)/g, "$1 ")
}

function formatExpiry(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 4)
  if (digits.length <= 2) return digits
  return `${digits.slice(0, 2)} / ${digits.slice(2)}`
}
