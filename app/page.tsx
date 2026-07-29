"use client"

import type React from "react"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import * as SliderPrimitive from "@radix-ui/react-slider"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Check, Loader2, LocateFixed, MapPin, Phone, Shield, Star } from "lucide-react"
import { MosquitoJoeMark } from "@/components/brand-mark"
import { MobileCartBar } from "@/components/mobile-cart-bar"
import { AnimatedTotal } from "@/components/animated-total"
import {
  TARGETS,
  TREATMENTS,
  PLANS,
  MOCK_ADDRESSES,
  DEMO_ADDRESS,
  LOT_MIN,
  LOT_MAX,
  LOT_STEP,
  LOT_DEFAULT,
  getTarget,
  getTreatment,
  getPlan,
  isTargetId,
  measureLotFromAddress,
  nextAvailableSlot,
  quoteMosquito,
  usd,
  type TargetId,
  type TreatmentId,
  type PlanId,
} from "@/lib/mosquito-data"

export default function HomePage() {
  const router = useRouter()

  const [target, setTarget] = useState<TargetId>("both")
  const [sqft, setSqft] = useState(LOT_DEFAULT)
  const [measuredAddress, setMeasuredAddress] = useState("")
  const [treatment, setTreatment] = useState<TreatmentId>("barrier")
  const [plan, setPlan] = useState<PlanId>("season")

  // Next availability is clock-dependent, so it resolves after mount. Rendering
  // it during SSR would hand the client a different "today" than the server.
  const [nextSlot, setNextSlot] = useState<string | null>(null)

  // Deep links from campaign pages can preselect what we're treating for.
  useEffect(() => {
    const t = new URLSearchParams(window.location.search).get("target")
    if (isTargetId(t)) setTarget(t)
    setNextSlot(nextAvailableSlot().label)
  }, [])

  const quote = useMemo(() => quoteMosquito(sqft, target, treatment, plan), [sqft, target, treatment, plan])
  const overCap = sqft > LOT_MAX
  const planCfg = getPlan(plan)
  const treatmentCfg = getTreatment(treatment)

  const handleContinue = () => {
    if (overCap) return
    const params = new URLSearchParams({
      target,
      sqft: String(sqft),
      treatment,
      plan,
      perTreatment: String(quote.perTreatment),
      seasonTotal: String(quote.seasonTotal),
      visits: String(quote.visits),
      intervalDays: String(quote.intervalDays),
    })
    // Only rides along if we measured it — otherwise checkout asks for it.
    if (measuredAddress) params.set("address", measuredAddress)
    router.push(`/checkout?${params.toString()}`)
  }

  return (
    <div className="min-h-screen bg-background pb-[104px] md:pb-0">
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-line">
        {/* The photo is busy, so it is softly defocused rather than heavily
            darkened: the blur is what makes white type readable over grass and
            foliage, so the image can stay bright. The scrim is left-weighted and
            fades out entirely, keeping the scene visible on the right.
            scale-105 hides the blur's soft edge at the crop boundary. */}
        <Image
          src="/mj/hero-family-soccer.webp"
          alt=""
          fill
          priority
          className="scale-105 object-cover object-center"
          style={{ filter: "brightness(0.92) saturate(1.06) blur(2px)" }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/34 to-transparent" />
        {/* Same 3xl column as every step below, so the hero's left edge and the
            step headers' left edge are the same line all the way down. */}
        <div className="container relative mx-auto px-4 py-16 md:py-20">
          <div className="mx-auto max-w-3xl">
            <h1
              className="max-w-[19ch] text-[clamp(30px,4.4vw,46px)] font-extrabold leading-[1.06] tracking-[-0.028em] text-white"
              style={{ textShadow: "0 2px 18px rgba(0,0,0,.45)" }}
            >
              Get your yard back from mosquitoes, ticks, and fleas
            </h1>
            <p className="mt-4 text-[17px] leading-relaxed text-white" style={{ textShadow: "0 1px 12px rgba(0,0,0,.5)" }}>
              Four questions, a real price, and your first visit booked.
            </p>
            {/* Desktop only. On mobile the sticky cart bar is the sole CTA.
                Scrolls into the configurator rather than skipping it, but wears
                the same label and availability as the CTA it leads to. */}
            <a href="#step-1" className="btn-yellow mt-7 hidden md:inline-flex">
              <span>Book my visit</span>
              {nextSlot && <span className="font-semibold opacity-70">&middot; Next: {nextSlot}</span>}
            </a>
          </div>
        </div>
      </section>

      {/* ── Step 1 — What are we treating for ────────────────────────── */}
      <section id="step-1" className="scroll-mt-20 border-b border-line bg-white">
        <div className="container mx-auto px-4 py-12 md:py-14">
          <div className="mx-auto max-w-3xl">
            <StepHeader
              step={1}
              title="What should we treat for?"
              subtitle="Pick what is bothering you most. You can change it any time after the first visit."
            />
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              {TARGETS.map((t) => {
                const selected = target === t.id
                return (
                  <button
                    key={t.id}
                    onClick={() => setTarget(t.id)}
                    aria-pressed={selected}
                    className={`relative rounded-xl border-2 p-5 text-left transition-all duration-150 ${
                      selected
                        ? "border-black bg-white shadow-card"
                        : "border-line bg-white hover:border-line-strong hover:shadow-card"
                    }`}
                  >
                    <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-black">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={t.icon} alt="" className="h-6 w-6" />
                    </span>
                    <p className="mt-3.5 text-[16px] font-bold text-black">{t.name}</p>
                    <p className="mt-1 text-[13.5px] leading-snug text-mj-slate-soft">{t.copy}</p>
                    {t.badge && <span className="badge-mj mt-3">{t.badge}</span>}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── Step 2 — Lot size, with the address lookup behind it ─────── */}
      <section className="border-b border-line bg-muted/40">
        <div className="container mx-auto px-4 py-12 md:py-14">
          <div className="mx-auto max-w-3xl">
            <StepHeader
              step={2}
              title="How big is your lot?"
              subtitle="Drag the slider to your lot size. If you are not sure, we can measure it from your address."
            />
            <LotSizePicker
              value={sqft}
              onChange={(n) => {
                setSqft(n)
                setMeasuredAddress("")
              }}
              measuredAddress={measuredAddress}
              perTreatment={quote.perTreatment}
              onMeasured={(addr, area) => {
                setSqft(area)
                setMeasuredAddress(addr)
              }}
            />
          </div>
        </div>
      </section>

      {/* ── Step 3 — Treatment ───────────────────────────────────────── */}
      <section className="border-b border-line bg-white">
        <div className="container mx-auto px-4 py-12 md:py-14">
          <div className="mx-auto max-w-3xl">
            <StepHeader
              step={3}
              title="Which treatment type should we use?"
              subtitle="Both are applied by the same technician on the same route."
            />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {TREATMENTS.map((t) => {
                const selected = treatment === t.id
                return (
                  <button
                    key={t.id}
                    onClick={() => setTreatment(t.id)}
                    aria-pressed={selected}
                    className={`relative rounded-xl border-2 p-5 text-left transition-all duration-150 ${
                      selected
                        ? "border-black bg-white shadow-card"
                        : "border-line bg-white hover:border-line-strong"
                    }`}
                  >
                    {/* Badge sits on its own reserved row so the title, copy and
                        feature list line up across every card in the row. */}
                    <div className="mb-2.5 flex h-[22px] items-center">
                      {t.badge && <span className="badge-mj">{t.badge}</span>}
                    </div>
                    <p className="text-[16px] font-bold text-black">{t.name}</p>
                    <p className="mt-1 text-[13.5px] text-mj-slate-soft">{t.copy}</p>
                    <ul className="mt-3 space-y-1.5">
                      {t.features.map((f) => (
                        <li key={f} className="flex items-start gap-2 text-[13px] text-body">
                          <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-mj-green-deep" />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── Step 4 — Cadence ─────────────────────────────────────────── */}
      <section className="border-b border-line bg-muted/40">
        <div className="container mx-auto px-4 py-12 md:py-14">
          <div className="mx-auto max-w-3xl">
            <StepHeader
              step={4}
              title="How often should we come out?"
              subtitle={`Treatments run every ${treatmentCfg.intervalDays} days on the ${treatmentCfg.name.toLowerCase()}.`}
            />
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              {PLANS.map((p) => {
                const selected = plan === p.id
                const pq = quoteMosquito(sqft, target, treatment, p.id)
                return (
                  <button
                    key={p.id}
                    onClick={() => setPlan(p.id)}
                    aria-pressed={selected}
                    className={`relative flex h-full flex-col rounded-xl border-2 p-5 text-left transition-all duration-150 ${
                      selected
                        ? "border-black bg-white shadow-card"
                        : "border-line bg-white hover:border-line-strong"
                    }`}
                  >
                    {/* Badge sits on its own reserved row so the title, copy and
                        price line up across every card in the row. */}
                    <div className="mb-2.5 flex h-[22px] items-center">
                      {p.badge && <span className="badge-mj">{p.badge}</span>}
                    </div>
                    <p className="text-[16px] font-bold text-black">{p.name}</p>
                    <p className="mt-1 text-[13.5px] leading-snug text-mj-slate-soft">{p.copy}</p>
                    <p className="mt-auto pt-3.5 text-[22px] font-extrabold tracking-[-0.02em] text-black tabular">
                      {usd(pq.perTreatment)}
                    </p>
                    <p className="text-[12.5px] font-semibold text-mj-slate-soft">
                      per treatment &middot; {p.visits === 1 ? "single visit" : `${p.visits} visits`}
                    </p>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── Your order ───────────────────────────────────────────────
          Built as the same card the checkout opens with: same brand mark, same
          line-item layout, same price column, same 600px column. Crossing into
          checkout should feel like the card followed you, not like a new page. */}
      <section className="border-b border-line bg-muted/40">
        <div className="container mx-auto px-4 py-12 md:py-14">
          <div className="mx-auto max-w-3xl">
            <div className="surface p-6 md:p-7">
              <h2 className="eyebrow mb-4">Your order</h2>

              <div className="flex items-start gap-3">
                <MosquitoJoeMark size="md" />
                <div className="min-w-0 flex-1">
                  <p className="text-[14.5px] font-bold text-black">Mosquito Joe</p>
                  <p className="text-[13px] leading-snug text-mj-slate-soft">
                    {getTarget(target).name} &middot; {treatmentCfg.name}
                  </p>
                  <p className="text-[13px] leading-snug text-mj-slate-soft">
                    {planCfg.name} &middot; {quote.visits === 1 ? "single visit" : `${quote.visits} treatments`} &middot;
                    every {quote.intervalDays} days
                  </p>
                  <p className="text-[13px] leading-snug text-mj-slate-soft tabular">
                    {sqft.toLocaleString()} sq ft lot
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-[15px] font-extrabold text-black tabular">{usd(quote.perTreatment)}</p>
                  <p className="text-[11.5px] font-semibold text-mj-slate-soft">per treatment</p>
                  {quote.visits > 1 && (
                    <p className="mt-1 text-[12px] text-mj-slate-soft tabular">{usd(quote.seasonTotal)} season</p>
                  )}
                </div>
              </div>

              {quote.minApplied && (
                <p className="mt-3 text-[12px] font-bold text-barrier-deep">Lot minimum applied</p>
              )}

              <div className="mt-5 border-t border-line pt-4">
                <div className="flex items-baseline justify-between gap-4">
                  <span className="text-[14.5px] font-bold text-black">
                    {quote.visits === 1 ? "Total" : "Season total"}
                  </span>
                  <span className="text-[30px] font-extrabold leading-none tracking-[-0.03em] text-black tabular">
                    {usd(quote.seasonTotal)}
                  </span>
                </div>
                <p className="mt-3 text-[12px] text-mj-slate-soft">
                  Billed after each visit. You pick the first date at checkout.
                </p>
              </div>

              <button
                onClick={handleContinue}
                disabled={overCap}
                className="btn-yellow mt-6 hidden w-full py-3.5 text-base md:inline-flex"
              >
                <span>Book my visit</span>
                {nextSlot && <span className="font-semibold opacity-70">&middot; Next: {nextSlot}</span>}
              </button>
              {overCap && (
                <p className="mt-3 text-center text-[12px] text-mj-slate-soft">
                  Lots over {LOT_MAX.toLocaleString()} sq ft are quoted by phone.
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Trust ────────────────────────────────────────────────────── */}
      <section className="bg-white">
        <div className="container mx-auto px-4 py-12">
          <div className="mx-auto grid max-w-4xl grid-cols-1 gap-6 text-center md:grid-cols-3">
            <TrustItem icon={Shield} title="Trained technicians" text="Licensed, insured, and background checked" />
            <TrustItem icon={Star} title="Satisfaction guarantee" text="Still seeing them? We come back free" />
            <TrustItem icon={Phone} title="Talk to a person" text="Call (855) 558-9333 any day of the week" />
          </div>
          <div className="mx-auto mt-10 grid max-w-4xl grid-cols-2 gap-3 md:grid-cols-4">
            {[
              { src: "/mj/kids-playing.webp", alt: "Kids playing in a treated backyard" },
              { src: "/mj/firepit.webp", alt: "Evening around a backyard fire pit" },
              { src: "/mj/couple-garden.webp", alt: "Couple sitting in their garden" },
              { src: "/mj/soccer-garden.webp", alt: "Soccer in the back garden" },
            ].map((img) => (
              <div key={img.src} className="relative aspect-[4/3] overflow-hidden rounded-lg border border-line">
                <Image src={img.src} alt={img.alt} fill className="object-cover" sizes="(max-width:768px) 45vw, 22vw" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <MobileCartBar
        summary={`${getTarget(target).shortName} · ${sqft.toLocaleString()} sq ft`}
        total={quote.seasonTotal}
        priceUnit={quote.visits === 1 ? "total" : "season total"}
        nextSlot={nextSlot}
        overCap={overCap}
        onContinue={handleContinue}
      />
    </div>
  )
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function StepHeader({ step, title, subtitle }: { step: number; title: string; subtitle?: string }) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-3">
        <span className="step-num">{step}</span>
        <h2 className="text-[clamp(22px,3vw,30px)] font-extrabold tracking-[-0.028em] text-black">{title}</h2>
      </div>
      {subtitle && <p className="mt-2.5 max-w-2xl text-[14.5px] text-mj-slate-soft">{subtitle}</p>}
    </div>
  )
}

function TrustItem({
  icon: Icon,
  title,
  text,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  text: string
}) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <Icon className="mb-1.5 h-6 w-6 text-black" />
      <p className="text-[15px] font-bold text-black">{title}</p>
      <p className="text-[13px] text-mj-slate-soft">{text}</p>
    </div>
  )
}

// ─── Lot size ────────────────────────────────────────────────────────────────
//
// The slider leads. "I don't know" is the escape hatch, and only then do we ask
// for an address — measuring the lot is a service we offer, not a toll gate.

const SLIDER_MAX = LOT_MAX + 500 // the "10,000+" over-cap stop
const LOT_PIVOT = LOT_DEFAULT // the value that sits at the centre of the track
const TICKS = [2500, 5000, 7500]

// Dual-rate scale. On a linear 1,000 → 10,500 track the 5,000 default lands at
// 42%, which reads as off-centre on a component whose whole job is to look
// balanced. So each half of the track carries half the range: 1,000 to 5,000 on
// the left, 5,000 to 10,500 on the right. Tick marks and labels use the same
// map, so the scale stays readable even though it is not uniform.
function lotToPct(v: number): number {
  const clamped = Math.min(Math.max(v, LOT_MIN), SLIDER_MAX)
  if (clamped <= LOT_PIVOT) return ((clamped - LOT_MIN) / (LOT_PIVOT - LOT_MIN)) * 50
  return 50 + ((clamped - LOT_PIVOT) / (SLIDER_MAX - LOT_PIVOT)) * 50
}

function pctToLot(p: number): number {
  const raw =
    p <= 50
      ? LOT_MIN + (p / 50) * (LOT_PIVOT - LOT_MIN)
      : LOT_PIVOT + ((p - 50) / 50) * (SLIDER_MAX - LOT_PIVOT)
  return Math.min(SLIDER_MAX, Math.round(raw / LOT_STEP) * LOT_STEP)
}

function LotSizePicker({
  value,
  onChange,
  measuredAddress,
  perTreatment,
  onMeasured,
}: {
  value: number
  onChange: (n: number) => void
  measuredAddress: string
  /** Live price, so a measurement can show what it actually changed. */
  perTreatment: number
  onMeasured: (address: string, sqft: number) => void
}) {
  const [lookupOpen, setLookupOpen] = useState(false)
  const overCap = value > LOT_MAX
  const sliderValue = overCap ? SLIDER_MAX : Math.min(Math.max(value || LOT_MIN, LOT_MIN), LOT_MAX)

  return (
    <div className="mx-auto max-w-xl">
      {/* The number is centred on its own line, with the unit beneath it, so the
          figure itself sits on the centre line rather than the number-plus-unit
          pair straddling it. */}
      <div className="text-center">
        <input
          type="text"
          inputMode="numeric"
          value={overCap ? "10,000+" : value ? value.toLocaleString() : ""}
          onChange={(e) => {
            const n = Number.parseInt(e.target.value.replace(/[^\d]/g, ""), 10)
            onChange(Number.isNaN(n) ? 0 : n)
          }}
          onBlur={() => {
            if (!value || value < LOT_MIN) onChange(LOT_MIN)
          }}
          aria-label="Lot size in square feet"
          className="w-full max-w-[280px] border-b-2 border-line bg-transparent text-center text-[40px] font-extrabold leading-none tracking-[-0.03em] text-black tabular transition-colors focus:border-mj-yellow focus:outline-none"
        />
        <p className="mt-2.5 text-[13px] font-bold text-mj-slate-soft">sq ft lot</p>
      </div>

      <SliderPrimitive.Root
        className="relative mt-8 flex w-full touch-none select-none items-center"
        min={0}
        max={100}
        step={1}
        value={[Math.round(lotToPct(sliderValue))]}
        onValueChange={([p]) => onChange(pctToLot(p))}
        aria-label="Lot size"
      >
        <SliderPrimitive.Track className="relative h-2 w-full grow rounded-pill bg-line">
          <SliderPrimitive.Range className="absolute h-full rounded-pill bg-mj-yellow" />
          {TICKS.map((t) => (
            <span
              key={t}
              className="pointer-events-none absolute top-1/2 h-3 w-px -translate-x-1/2 -translate-y-1/2 bg-line-strong"
              style={{ left: `${lotToPct(t)}%` }}
            />
          ))}
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb className="relative z-10 block h-6 w-6 cursor-grab rounded-full border-[3px] border-black bg-mj-yellow transition-transform focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-mj-yellow/40 active:cursor-grabbing active:scale-110" />
      </SliderPrimitive.Root>

      <div className="relative mt-3 h-4 text-[11.5px] font-semibold text-mj-slate-soft">
        <span className="absolute left-0">{LOT_MIN.toLocaleString()}</span>
        {TICKS.map((t) => (
          <span key={t} className="absolute -translate-x-1/2 whitespace-nowrap" style={{ left: `${lotToPct(t)}%` }}>
            {t.toLocaleString()}
          </span>
        ))}
        <span className="absolute right-0 text-barrier-deep">10,000+</span>
      </div>

      {overCap ? (
        <div className="mt-7 rounded-lg border border-barrier/40 bg-barrier-soft p-4">
          <p className="text-[14px] font-bold text-black">Over {LOT_MAX.toLocaleString()} sq ft is a custom program.</p>
          <p className="mt-1 text-[13.5px] text-body">
            Call{" "}
            <a href="tel:8555589333" className="font-bold text-barrier-deep underline">
              (855) 558-9333
            </a>{" "}
            and we will build it with you.
          </p>
        </div>
      ) : measuredAddress ? (
        <div className="mt-7 rounded-lg border border-mj-green/30 bg-mj-green-soft p-4">
          <div className="flex items-start gap-2">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-mj-green-deep" />
            <p className="text-[13px] text-body">
              We measured about <span className="font-bold text-black tabular">{value.toLocaleString()} sq ft</span> at{" "}
              {measuredAddress}. Adjust the slider if it looks off.
            </p>
          </div>
          <div className="mt-3 flex items-baseline justify-between gap-4 border-t border-mj-green/25 pt-3">
            <span className="text-[13px] font-semibold text-black">Your price for this lot</span>
            <span className="flex items-baseline gap-1.5">
              <AnimatedTotal
                value={perTreatment}
                className="text-[22px] font-extrabold leading-none tracking-[-0.02em] text-black"
              />
              <span className="text-[12px] font-semibold text-mj-slate-soft">per treatment</span>
            </span>
          </div>
        </div>
      ) : lookupOpen ? (
        <AddressMeasurer onMeasured={onMeasured} />
      ) : (
        <div className="mt-7 text-center">
          <button
            type="button"
            onClick={() => setLookupOpen(true)}
            className="inline-flex items-center gap-1.5 text-[14px] font-bold text-black underline decoration-mj-yellow decoration-2 underline-offset-4 transition-colors hover:text-mj-slate"
          >
            I don&apos;t know my lot size
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Address lookup (simulated lot measurement) ──────────────────────────────

function AddressMeasurer({ onMeasured }: { onMeasured: (address: string, sqft: number) => void }) {
  const [input, setInput] = useState("")
  const [busy, setBusy] = useState(false)
  const [geo, setGeo] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [open, setOpen] = useState(false)
  const boxRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const exact = MOCK_ADDRESSES.some((a) => a.toLowerCase() === input.toLowerCase())
    if (input.length >= 3 && !exact) {
      const filtered = MOCK_ADDRESSES.filter((a) => a.toLowerCase().includes(input.toLowerCase()))
      setSuggestions(filtered.length > 0 ? filtered : MOCK_ADDRESSES)
      setOpen(true)
    } else {
      setSuggestions([])
      setOpen(false)
    }
  }, [input])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const run = useCallback(
    (raw?: string) => {
      const addr = (raw ?? input).trim()
      if (!addr) return
      setOpen(false)
      setBusy(true)
      // Stands in for a parcel/geocode round trip.
      setTimeout(() => {
        setBusy(false)
        onMeasured(addr, measureLotFromAddress(addr))
      }, 850)
    },
    [input, onMeasured],
  )

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
    setInput(DEMO_ADDRESS)
    run(DEMO_ADDRESS)
  }, [run])

  return (
    <div className="surface mt-7 animate-rise-in p-5">
      <Label htmlFor="measure-address" className="text-[13px] font-semibold text-ink">
        Your address
      </Label>
      <p className="mt-1 text-[12.5px] text-mj-slate-soft">
        We measure the lot from property records. You can still adjust the slider afterward.
      </p>
      <div className="mt-3 flex flex-col gap-2.5 sm:flex-row" ref={boxRef}>
        <div className="relative flex-1">
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
            id="measure-address"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                run()
              }
            }}
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
                    setInput(s)
                    run(s)
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
        <button type="button" onClick={() => run()} disabled={!input.trim() || busy} className="btn-yellow shrink-0">
          {busy ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Measuring
            </>
          ) : (
            "Measure my lot"
          )}
        </button>
      </div>
    </div>
  )
}
