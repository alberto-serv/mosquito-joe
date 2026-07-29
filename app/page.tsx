"use client"

import type React from "react"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import * as SliderPrimitive from "@radix-ui/react-slider"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
  Loader2,
  LocateFixed,
  MapPin,
  Shield,
  Star,
  Phone,
} from "lucide-react"
import { YardPlan } from "@/components/yard-plan"
import {
  TARGETS,
  PROPERTIES,
  TREATMENTS,
  PLANS,
  MOCK_ADDRESSES,
  DEMO_ADDRESS,
  YARD_MIN,
  YARD_MAX,
  YARD_STEP,
  YARD_DEFAULT,
  getTarget,
  getTreatment,
  getPlan,
  isTargetId,
  measureYardFromAddress,
  quoteMosquito,
  getAvailableDates,
  isSameDay,
  formatVisitDate,
  VISIT_WINDOWS,
  usd,
  type TargetId,
  type PropertyType,
  type TreatmentId,
  type PlanId,
} from "@/lib/mosquito-data"

export default function HomePage() {
  const router = useRouter()

  const [target, setTarget] = useState<TargetId>("both")
  const [property, setProperty] = useState<PropertyType>("residential")
  const [sqft, setSqft] = useState(YARD_DEFAULT)
  const [measured, setMeasured] = useState(false)
  const [treatment, setTreatment] = useState<TreatmentId>("barrier")
  const [plan, setPlan] = useState<PlanId>("season")

  const [address, setAddress] = useState("")
  const [address2, setAddress2] = useState("")
  const [contact, setContact] = useState({ firstName: "", lastName: "", email: "", phone: "" })
  const [visitDate, setVisitDate] = useState<Date | null>(null)
  const [visitWindow, setVisitWindow] = useState("")
  const [calendarStart, setCalendarStart] = useState(0)

  const detailsRef = useRef<HTMLDivElement>(null)

  // Deep links from campaign pages can preselect what we're treating for.
  useEffect(() => {
    const t = new URLSearchParams(window.location.search).get("target")
    if (isTargetId(t)) setTarget(t)
  }, [])

  const availableDates = useMemo(() => getAvailableDates(), [])
  const quote = useMemo(() => quoteMosquito(sqft, target, treatment, plan), [sqft, target, treatment, plan])
  const overCap = sqft > YARD_MAX
  const planCfg = getPlan(plan)
  const treatmentCfg = getTreatment(treatment)

  const canContinue =
    !overCap &&
    contact.firstName.trim() &&
    contact.lastName.trim() &&
    contact.email.trim() &&
    contact.phone.trim() &&
    address.trim() &&
    visitDate &&
    visitWindow

  const handleContinue = () => {
    if (!canContinue || !visitDate) return
    const params = new URLSearchParams({
      target,
      property,
      sqft: String(sqft),
      treatment,
      plan,
      perTreatment: String(quote.perTreatment),
      seasonTotal: String(quote.seasonTotal),
      visits: String(quote.visits),
      intervalDays: String(quote.intervalDays),
      address: address.trim(),
      address2: address2.trim(),
      firstName: contact.firstName.trim(),
      lastName: contact.lastName.trim(),
      email: contact.email.trim(),
      phone: contact.phone.trim(),
      visitDate: visitDate.toISOString(),
      visitWindow,
    })
    router.push(`/checkout?${params.toString()}`)
  }

  const visibleDates = availableDates.slice(calendarStart, calendarStart + 5)

  return (
    <div className="min-h-screen bg-background">
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-line">
        <Image
          src="/mj/hero-family-soccer.webp"
          alt=""
          fill
          priority
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/82 via-black/58 to-black/10" />
        <div className="container relative mx-auto px-4 py-16 md:py-20">
          <div className="max-w-2xl">
            <span className="badge-mj">Instant quote</span>
            <h1 className="mt-4 max-w-[19ch] text-[clamp(30px,4.4vw,46px)] font-extrabold leading-[1.06] tracking-[-0.028em] text-white">
              Get your yard back from mosquitoes, ticks, and fleas
            </h1>
            <p className="mt-4 max-w-[44ch] text-[16px] leading-relaxed text-white/90">
              Five questions, a real price, and your first treatment scheduled. We measure the yard
              from your address, so you do not have to.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <a href="#step-1" className="btn-yellow">
                Start my quote
                <ArrowRight className="h-4 w-4" />
              </a>
              <a href="tel:8555589333" className="btn-green">
                <Phone className="h-4 w-4" />
                (855) 558-9333
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Step 1 — What are we treating for ────────────────────────── */}
      <section id="step-1" className="scroll-mt-20 border-b border-line bg-white">
        <div className="container mx-auto px-4 py-12 md:py-14">
          <div className="mx-auto max-w-4xl">
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
                        ? "border-mj-yellow bg-mj-select shadow-card"
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
                    {selected && (
                      <span className="absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-full bg-black">
                        <Check className="h-3.5 w-3.5 text-mj-yellow" />
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── Step 2 — Where ───────────────────────────────────────────── */}
      <section className="border-b border-line bg-mj-band-soft">
        <div className="container mx-auto px-4 py-12 md:py-14">
          <div className="mx-auto max-w-3xl">
            <StepHeader
              step={2}
              title="Where are we treating?"
              subtitle="Give us the address and we measure the treatable area from property data."
            />

            <div className="mb-6 grid grid-cols-2 gap-3">
              {PROPERTIES.map((p) => {
                const selected = property === p.id
                return (
                  <button
                    key={p.id}
                    onClick={() => setProperty(p.id)}
                    aria-pressed={selected}
                    className={`flex items-center gap-3 rounded-xl border-2 px-4 py-3.5 text-left transition-all duration-150 ${
                      selected ? "border-mj-yellow bg-mj-select" : "border-line bg-white hover:border-line-strong"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={selected ? p.icon : p.iconGray} alt="" className="h-8 w-8 shrink-0" />
                    <span>
                      <span className="block text-[15px] font-bold text-black">{p.name}</span>
                      <span className="block text-[12.5px] text-mj-slate-soft">{p.copy}</span>
                    </span>
                  </button>
                )
              })}
            </div>

            <AddressMeasurer
              value={address}
              line2={address2}
              onLine2Change={setAddress2}
              onMeasured={(addr, area) => {
                setAddress(addr)
                setSqft(area)
                setMeasured(true)
              }}
            />
          </div>
        </div>
      </section>

      {/* ── Step 3 — Treatable area ──────────────────────────────────── */}
      <section className="border-b border-line bg-white">
        <div className="container mx-auto px-4 py-12 md:py-14">
          <div className="mx-auto max-w-5xl">
            <StepHeader
              step={3}
              title="How much yard are we covering?"
              subtitle={
                measured
                  ? "This is what we measured from your address. Adjust it if it looks off."
                  : "Drag the slider, or run the address lookup above to have it measured for you."
              }
            />
            <div className="grid grid-cols-1 items-start gap-8 md:grid-cols-2">
              <YardPlan sqft={overCap ? YARD_MAX : sqft} coverage="mosquito" />
              <div>
                <YardSlider value={sqft} onChange={setSqft} />
                {measured && !overCap && (
                  <p className="mt-5 flex items-start gap-2 rounded-lg border border-mj-green/30 bg-mj-green-soft p-3 text-[13px] font-medium text-mj-green-deep">
                    <Check className="mt-0.5 h-4 w-4 shrink-0" />
                    Measured from {address}. This number carries through the rest of your quote.
                  </p>
                )}
                {overCap && (
                  <p className="mt-5 rounded-lg border border-barrier/40 bg-barrier-soft p-3 text-[13px] font-medium text-barrier-deep">
                    Over {YARD_MAX.toLocaleString()} sq ft is a custom program. Call{" "}
                    <a href="tel:8555589333" className="font-bold underline">
                      (855) 558-9333
                    </a>{" "}
                    and we will build it with you.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Step 4 — Treatment ───────────────────────────────────────── */}
      <section className="border-b border-line bg-mj-band-soft">
        <div className="container mx-auto px-4 py-12 md:py-14">
          <div className="mx-auto max-w-3xl">
            <StepHeader step={4} title="Which treatment?" subtitle="Both are applied by the same technician on the same route." />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {TREATMENTS.map((t) => {
                const selected = treatment === t.id
                return (
                  <button
                    key={t.id}
                    onClick={() => setTreatment(t.id)}
                    aria-pressed={selected}
                    className={`rounded-xl border-2 p-5 text-left transition-all duration-150 ${
                      selected ? "border-mj-yellow bg-mj-select shadow-card" : "border-line bg-white hover:border-line-strong"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-[16px] font-bold text-black">{t.name}</p>
                      {t.badge && <span className="badge-mj shrink-0">{t.badge}</span>}
                    </div>
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

      {/* ── Step 5 — Cadence ─────────────────────────────────────────── */}
      <section className="border-b border-line bg-white">
        <div className="container mx-auto px-4 py-12 md:py-14">
          <div className="mx-auto max-w-4xl">
            <StepHeader
              step={5}
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
                    className={`rounded-xl border-2 p-5 text-left transition-all duration-150 ${
                      selected ? "border-mj-yellow bg-mj-select shadow-card" : "border-line bg-white hover:border-line-strong"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-[16px] font-bold text-black">{p.name}</p>
                      {p.badge && <span className="badge-mj shrink-0">{p.badge}</span>}
                    </div>
                    <p className="mt-1 text-[13.5px] leading-snug text-mj-slate-soft">{p.copy}</p>
                    <p className="mt-3.5 text-[22px] font-extrabold tracking-[-0.02em] text-black tabular">
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

      {/* ── Estimate band ────────────────────────────────────────────── */}
      <section className="border-b border-line bg-mj-band">
        <div className="container mx-auto px-4 py-10">
          <div className="mx-auto flex max-w-4xl flex-col gap-6 rounded-xl border border-line bg-white p-6 shadow-card md:flex-row md:items-center md:justify-between md:p-8">
            <div>
              <p className="eyebrow">Your Mosquito Joe estimate</p>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-[42px] font-extrabold leading-none tracking-[-0.03em] text-black tabular">
                  {usd(quote.perTreatment)}
                </span>
                <span className="text-[15px] font-bold text-mj-slate-soft">per treatment</span>
              </div>
              <p className="mt-2 text-[13.5px] text-body">
                {getTarget(target).name} &middot; {treatmentCfg.name} &middot; every {quote.intervalDays} days
              </p>
              <p className="text-[13.5px] text-body">
                {planCfg.name}
                {quote.visits > 1 ? ` · ${quote.visits} treatments · ${usd(quote.seasonTotal)} for the season` : ""}
              </p>
              {quote.minApplied && (
                <p className="mt-1.5 text-[12px] font-bold text-barrier-deep">Yard minimum applied</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => detailsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
              disabled={overCap}
              className="btn-yellow shrink-0 text-base"
            >
              Continue
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      {/* ── Details ──────────────────────────────────────────────────── */}
      <section ref={detailsRef} className="scroll-mt-20 border-b border-line bg-white">
        <div className="container mx-auto px-4 py-12 md:py-14">
          <div className="mx-auto max-w-2xl">
            <StepHeader
              step={6}
              title="Where should we send the crew?"
              subtitle="This is the last thing we need. Checkout is one screen after this."
            />

            <div className="surface p-6 md:p-7">
              <div className="grid grid-cols-2 gap-4">
                <Field label="First name" id="firstName">
                  <Input
                    id="firstName"
                    value={contact.firstName}
                    onChange={(e) => setContact((p) => ({ ...p, firstName: e.target.value }))}
                    placeholder="Dana"
                  />
                </Field>
                <Field label="Last name" id="lastName">
                  <Input
                    id="lastName"
                    value={contact.lastName}
                    onChange={(e) => setContact((p) => ({ ...p, lastName: e.target.value }))}
                    placeholder="Whitfield"
                  />
                </Field>
              </div>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Email" id="email">
                  <Input
                    id="email"
                    type="email"
                    value={contact.email}
                    onChange={(e) => setContact((p) => ({ ...p, email: e.target.value }))}
                    placeholder="dana@example.com"
                  />
                </Field>
                <Field label="Mobile number" id="phone">
                  <Input
                    id="phone"
                    type="tel"
                    value={contact.phone}
                    onChange={(e) => setContact((p) => ({ ...p, phone: e.target.value }))}
                    placeholder="(919) 555-0142"
                  />
                </Field>
              </div>

              <div className="mt-4">
                <Field label="Service address" id="detail-address">
                  <Input
                    id="detail-address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder={DEMO_ADDRESS}
                  />
                </Field>
                <Input
                  value={address2}
                  onChange={(e) => setAddress2(e.target.value)}
                  placeholder="Gate code, unit, or access notes (optional)"
                  className="mt-2"
                />
              </div>

              {/* First visit */}
              <div className="mt-6 border-t border-line pt-6">
                <p className="text-[13px] font-bold text-black">Pick your first treatment date</p>
                <div className="mt-3 flex items-center gap-2">
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
                          <span className={`text-[10.5px] font-bold uppercase tracking-[0.08em] ${selected ? "text-mj-yellow" : "text-mj-slate-soft"}`}>
                            {d.toLocaleDateString("en-US", { weekday: "short" })}
                          </span>
                          <span className={`my-0.5 text-[20px] font-extrabold tabular ${selected ? "text-white" : "text-black"}`}>
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
                    <p className="text-[13px] font-bold text-black">
                      Visit window for {formatVisitDate(visitDate)}
                    </p>
                    <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
                      {VISIT_WINDOWS.map((w) => {
                        const selected = visitWindow === w.id
                        return (
                          <button
                            key={w.id}
                            type="button"
                            onClick={() => setVisitWindow(w.id)}
                            className={`rounded-lg border-2 p-3 text-left transition-all ${
                              selected ? "border-mj-yellow bg-mj-select" : "border-line hover:border-line-strong"
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
              </div>

              <button onClick={handleContinue} disabled={!canContinue} className="btn-yellow mt-7 w-full text-base">
                Continue to checkout
                <ArrowRight className="h-4 w-4" />
              </button>
              {!canContinue && !overCap && (
                <p className="mt-3 text-center text-[12px] text-mj-slate-soft">
                  Fill in your details, address, and first visit to continue.
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

function Field({ label, id, children }: { label: string; id: string; children: React.ReactNode }) {
  return (
    <div>
      <Label htmlFor={id} className="text-[13px] font-semibold text-ink">
        {label}
      </Label>
      <div className="mt-1.5">{children}</div>
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
      <span className="mb-1 flex h-11 w-11 items-center justify-center rounded-lg bg-mj-yellow">
        <Icon className="h-5 w-5 text-black" />
      </span>
      <p className="text-[15px] font-bold text-black">{title}</p>
      <p className="text-[13px] text-mj-slate-soft">{text}</p>
    </div>
  )
}

// ─── Yard size slider ────────────────────────────────────────────────────────

const SLIDER_MAX = YARD_MAX + 500
const TICKS = [5000, 10000, 15000]
const tickPct = (v: number) => ((v - YARD_MIN) / (SLIDER_MAX - YARD_MIN)) * 100

function YardSlider({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const overCap = value > YARD_MAX
  const sliderValue = overCap ? SLIDER_MAX : Math.min(Math.max(value || YARD_MIN, YARD_MIN), YARD_MAX)
  return (
    <div>
      <div className="flex items-baseline gap-2">
        <input
          type="text"
          inputMode="numeric"
          value={overCap ? "20,000+" : value ? value.toLocaleString() : ""}
          onChange={(e) => {
            const n = Number.parseInt(e.target.value.replace(/[^\d]/g, ""), 10)
            onChange(Number.isNaN(n) ? 0 : n)
          }}
          onBlur={() => {
            if (!value || value < YARD_MIN) onChange(YARD_MIN)
          }}
          aria-label="Treatable area in square feet"
          className="w-44 border-b-2 border-line bg-transparent text-[38px] font-extrabold tracking-[-0.03em] text-black tabular transition-colors focus:border-mj-yellow focus:outline-none"
        />
        <span className="text-[13px] font-bold text-mj-slate-soft">sq ft treatable</span>
      </div>

      <SliderPrimitive.Root
        className="relative mt-8 flex w-full touch-none select-none items-center"
        min={YARD_MIN}
        max={SLIDER_MAX}
        step={YARD_STEP}
        value={[sliderValue]}
        onValueChange={([v]) => onChange(v)}
        aria-label="Treatable area"
      >
        <SliderPrimitive.Track className="relative h-2 w-full grow rounded-pill bg-line">
          <SliderPrimitive.Range className="absolute h-full rounded-pill bg-mj-yellow" />
          {[...TICKS, YARD_MAX].map((t) => (
            <span
              key={t}
              className="pointer-events-none absolute top-1/2 h-3 w-px -translate-x-1/2 -translate-y-1/2 bg-line-strong"
              style={{ left: `${tickPct(t)}%` }}
            />
          ))}
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb className="relative z-10 block h-6 w-6 cursor-grab rounded-full border-[3px] border-black bg-mj-yellow transition-transform focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-mj-yellow/40 active:cursor-grabbing active:scale-110" />
      </SliderPrimitive.Root>

      <div className="relative mt-3 h-4 text-[11.5px] font-semibold text-mj-slate-soft">
        <span className="absolute left-0">{YARD_MIN.toLocaleString()}</span>
        {TICKS.map((t) => (
          <span key={t} className="absolute -translate-x-1/2 whitespace-nowrap" style={{ left: `${tickPct(t)}%` }}>
            {t.toLocaleString()}
          </span>
        ))}
        <span className="absolute right-0 text-barrier-deep">20,000+</span>
      </div>
    </div>
  )
}

// ─── Address lookup (simulated property measurement) ─────────────────────────

function AddressMeasurer({
  value,
  line2,
  onLine2Change,
  onMeasured,
}: {
  value: string
  line2: string
  onLine2Change: (s: string) => void
  onMeasured: (address: string, sqft: number) => void
}) {
  const [input, setInput] = useState(value)
  const [busy, setBusy] = useState(false)
  const [geo, setGeo] = useState(false)
  const [result, setResult] = useState<{ address: string; sqft: number } | null>(null)
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
        const sqft = measureYardFromAddress(addr)
        setResult({ address: addr, sqft })
        setBusy(false)
        onMeasured(addr, sqft)
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
    <div className="surface p-5 md:p-6">
      <Label htmlFor="measure-address" className="text-[13px] font-semibold text-ink">
        Service address
      </Label>
      <div className="mt-2 flex flex-col gap-2.5 sm:flex-row" ref={boxRef}>
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
            "Measure my yard"
          )}
        </button>
      </div>
      <Input
        value={line2}
        onChange={(e) => onLine2Change(e.target.value)}
        placeholder="Gate code, unit, or access notes (optional)"
        className="mt-2.5"
      />
      {result && !busy && (
        <div className="mt-3 flex items-start gap-2 rounded-lg border border-mj-green/30 bg-mj-green-soft p-3">
          <Check className="mt-0.5 h-4 w-4 shrink-0 text-mj-green-deep" />
          <p className="text-[13px] text-body">
            We measured about{" "}
            <span className="font-bold text-black tabular">{result.sqft.toLocaleString()} sq ft</span> of treatable
            yard at this address. Every price below uses that number.
          </p>
        </div>
      )}
    </div>
  )
}
