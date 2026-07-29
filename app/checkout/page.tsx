"use client"

import { Suspense, useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, CalendarDays, CreditCard, Loader2, Lock, MapPin } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MosquitoJoeMark, LawnPrideMark } from "@/components/brand-mark"
import { AnimatedTotal } from "@/components/animated-total"
import { LawnPrideAttach } from "@/components/lawn-pride-attach"
import { DEFAULT_LAWN_PROGRAM, getLawnProgram, quoteLawn, type LawnProgramId } from "@/lib/lawn-pride"
import {
  getPlan,
  getTarget,
  getTreatment,
  getVisitWindow,
  isPlanId,
  isTargetId,
  isTreatmentId,
  quoteMosquito,
  usd,
  YARD_DEFAULT,
  formatVisitDate,
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
  const sqft = Number.parseInt(params.get("sqft") || "", 10) || YARD_DEFAULT
  const mjQuote = useMemo(() => quoteMosquito(sqft, target, treatment, plan), [sqft, target, treatment, plan])

  const visitDateRaw = params.get("visitDate")
  const visitDate = useMemo(() => {
    if (!visitDateRaw) return null
    const d = new Date(visitDateRaw)
    return Number.isNaN(d.getTime()) ? null : d
  }, [visitDateRaw])
  const visitWindow = getVisitWindow(params.get("visitWindow") || "")

  // ── Prefilled contact + address ────────────────────────────────────
  const [contact, setContact] = useState({
    firstName: params.get("firstName") || "",
    lastName: params.get("lastName") || "",
    email: params.get("email") || "",
    phone: params.get("phone") || "",
  })
  const [address, setAddress] = useState(params.get("address") || "")
  const [address2, setAddress2] = useState(params.get("address2") || "")

  // ── The attach offer ───────────────────────────────────────────────
  const [lawnOn, setLawnOn] = useState(false)
  const [lawnProgram, setLawnProgram] = useState<LawnProgramId>(DEFAULT_LAWN_PROGRAM)
  const lawnQuote = quoteLawn(sqft, lawnProgram)

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
      visitWindow: visitWindow?.id || "",
      cardLast4: cardDigits.slice(-4),
    })
    router.push(`/checkout/confirmation?${q.toString()}`)
  }

  return (
    <div className="min-h-screen bg-muted/40">
      <div className="container mx-auto px-4 py-8 md:py-10">
        <div className="mx-auto max-w-[600px]">
          <Link
            href="/"
            className="mb-5 inline-flex items-center gap-1.5 text-[13.5px] font-bold text-ink transition-colors hover:text-mj-slate-soft"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to your quote
          </Link>

          <h1 className="text-[30px] font-extrabold tracking-[-0.03em] text-black">Checkout</h1>
          <p className="mt-1.5 text-[14.5px] text-mj-slate-soft">
            Confirm the order, add your card, and we put you on the route.
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
                      {getPlan(plan).name} &middot; {mjQuote.visits === 1 ? "single visit" : `${mjQuote.visits} treatments`} &middot;
                      every {mjQuote.intervalDays} days
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
                      <p className="text-[13px] leading-snug text-mj-slate-soft">
                        {getLawnProgram(lawnProgram).name}
                      </p>
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

              {/* Service details */}
              <div className="mt-4 space-y-1.5 rounded-lg bg-muted p-3.5">
                <div className="flex items-start gap-2 text-[13px] text-body">
                  <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-mj-slate-soft" />
                  <span>{[address, address2].filter(Boolean).join(", ") || "Address pending"}</span>
                </div>
                {visitDate && (
                  <div className="flex items-start gap-2 text-[13px] text-body">
                    <CalendarDays className="mt-0.5 h-3.5 w-3.5 shrink-0 text-mj-slate-soft" />
                    <span>
                      First visit {formatVisitDate(visitDate)}
                      {visitWindow ? `, ${visitWindow.time}` : ""}
                      {lawnOn ? " — both crews on the same window" : ""}
                    </span>
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
                <p className="mt-3 text-[12px] text-mj-slate-soft">
                  Billed after each visit. Nothing is charged today.
                </p>
              </div>
            </section>

            {/* ── The attach card ───────────────────────────────────── */}
            <LawnPrideAttach
              turfSqft={sqft}
              enabled={lawnOn}
              onEnabledChange={setLawnOn}
              program={lawnProgram}
              onProgramChange={setLawnProgram}
            />

            {/* ── Contact and address ───────────────────────────────── */}
            <section className="surface p-6 md:p-7" aria-label="Contact and address">
              <h2 className="eyebrow mb-4">Contact and address</h2>
              <div className="grid grid-cols-2 gap-3">
                <CheckoutField id="co-first" label="First name">
                  <Input
                    id="co-first"
                    value={contact.firstName}
                    onChange={(e) => setContact((p) => ({ ...p, firstName: e.target.value }))}
                  />
                </CheckoutField>
                <CheckoutField id="co-last" label="Last name">
                  <Input
                    id="co-last"
                    value={contact.lastName}
                    onChange={(e) => setContact((p) => ({ ...p, lastName: e.target.value }))}
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
                  />
                </CheckoutField>
                <CheckoutField id="co-phone" label="Mobile">
                  <Input
                    id="co-phone"
                    type="tel"
                    value={contact.phone}
                    onChange={(e) => setContact((p) => ({ ...p, phone: e.target.value }))}
                  />
                </CheckoutField>
              </div>
              <div className="mt-3">
                <CheckoutField id="co-address" label="Service address">
                  <Input id="co-address" value={address} onChange={(e) => setAddress(e.target.value)} />
                </CheckoutField>
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

              {lawnOn && (
                <p className="mt-4 rounded-lg bg-lp-select p-3 text-[12.5px] text-lp-green-deep">
                  One card covers both brands. Mosquito Joe and Lawn Pride bill separately per visit under a
                  single account.
                </p>
              )}
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
                  : "Add your card details to finish."}
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

function formatCardNumber(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 16)
  return digits.replace(/(\d{4})(?=\d)/g, "$1 ")
}

function formatExpiry(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 4)
  if (digits.length <= 2) return digits
  return `${digits.slice(0, 2)} / ${digits.slice(2)}`
}
