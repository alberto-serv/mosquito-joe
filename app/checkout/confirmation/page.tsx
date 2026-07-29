"use client"

import { Suspense, useMemo } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { CalendarDays, Check, Clock, CreditCard, Loader2, MapPin } from "lucide-react"
import { MosquitoJoeMark, LawnPrideMark } from "@/components/brand-mark"
import { getLawnProgram, type LawnProgramId } from "@/lib/lawn-pride"
import {
  getPlan,
  getTarget,
  getTreatment,
  getVisitWindow,
  isPlanId,
  isTargetId,
  isTreatmentId,
  formatVisitDate,
  usd,
  LOT_DEFAULT,
  type PlanId,
  type TargetId,
  type TreatmentId,
} from "@/lib/mosquito-data"

export default function ConfirmationPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-mj-slate-soft" />
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

  const target: TargetId = isTargetId(params.get("target")) ? (params.get("target") as TargetId) : "both"
  const treatment: TreatmentId = isTreatmentId(params.get("treatment"))
    ? (params.get("treatment") as TreatmentId)
    : "barrier"
  const plan: PlanId = isPlanId(params.get("plan")) ? (params.get("plan") as PlanId) : "season"
  const sqft = num("sqft", LOT_DEFAULT)

  const lawnOn = params.get("lawn") === "1"
  const lawnProgram = getLawnProgram((params.get("lawnProgram") || "enhanced") as LawnProgramId)

  const visitDate = useMemo(() => {
    const raw = params.get("visitDate")
    if (!raw) return null
    const d = new Date(raw)
    return Number.isNaN(d.getTime()) ? null : d
  }, [params])
  const visitWindow = getVisitWindow(params.get("visitWindow") || "")

  const customerName = params.get("customerName") || ""
  const email = params.get("email") || ""
  const phone = params.get("phone") || ""
  const address = params.get("address") || ""
  const cardLast4 = params.get("cardLast4") || ""

  return (
    <div className="min-h-screen bg-muted/40">
      <div className="container mx-auto px-4 py-10 md:py-14">
        <div className="mx-auto max-w-[640px]">
          <div className="text-center">
            <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-mj-green">
              <Check className="h-7 w-7 text-black" strokeWidth={3} />
            </span>
            <h1 className="mt-4 text-[32px] font-extrabold tracking-[-0.03em] text-black">
              {lawnOn ? "Both services are scheduled" : "Your service is scheduled"}
            </h1>
            <p className="mt-2 text-[15px] text-mj-slate-soft">
              {customerName ? `${customerName.split(" ")[0]}, we` : "We"} sent a confirmation
              {email ? ` to ${email}` : ""}.
            </p>
          </div>

          <section className="surface mt-8 overflow-hidden">
            <div className="border-b border-line p-6 md:p-7">
              <h2 className="eyebrow mb-4">What you ordered</h2>
              <div className="divide-y divide-line">
                <div className="flex items-start gap-3 pb-4">
                  <MosquitoJoeMark size="md" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[14.5px] font-bold text-black">Mosquito Joe</p>
                    <p className="text-[13px] text-mj-slate-soft">
                      {getTarget(target).name} &middot; {getTreatment(treatment).name} &middot; {getPlan(plan).name}
                    </p>
                    <p className="text-[13px] text-mj-slate-soft tabular">{sqft.toLocaleString()} sq ft lot</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-[15px] font-extrabold text-black tabular">{usd(num("perTreatment"))}</p>
                    <p className="text-[11.5px] font-semibold text-mj-slate-soft">per treatment</p>
                  </div>
                </div>

                {lawnOn && (
                  <div className="flex items-start gap-3 py-4">
                    <LawnPrideMark size="md" />
                    <div className="min-w-0 flex-1">
                      <p className="text-[14.5px] font-bold text-black">Lawn Pride</p>
                      <p className="text-[13px] text-mj-slate-soft">
                        {lawnProgram.name} &middot; {sqft.toLocaleString()} sq ft turf
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-[15px] font-extrabold text-black tabular">{usd(num("lawnPerApplication"))}</p>
                      <p className="text-[11.5px] font-semibold text-mj-slate-soft">per application</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-4 flex items-baseline justify-between border-t border-line pt-4">
                <span className="text-[14.5px] font-bold text-black">Season total</span>
                <span className="text-[26px] font-extrabold tracking-[-0.03em] text-black tabular">
                  {usd(num("seasonTotal"))}
                </span>
              </div>
              <p className="mt-1.5 text-[12px] text-mj-slate-soft">
                Billed after each visit
                {cardLast4 ? ` to the card ending ${cardLast4}` : ""}.
              </p>
            </div>

            <div className="bg-muted p-6 md:p-7">
              <h2 className="eyebrow mb-3">First visit</h2>
              <div className="space-y-2 text-[13.5px] text-body">
                {visitDate && (
                  <p className="flex items-start gap-2">
                    <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-mj-slate-soft" />
                    {formatVisitDate(visitDate)}
                  </p>
                )}
                {visitWindow && (
                  <p className="flex items-start gap-2">
                    <Clock className="mt-0.5 h-4 w-4 shrink-0 text-mj-slate-soft" />
                    {visitWindow.time}
                    {lawnOn ? " — both crews in the same window" : ""}
                  </p>
                )}
                {address && (
                  <p className="flex items-start gap-2">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-mj-slate-soft" />
                    {address}
                  </p>
                )}
                {cardLast4 && (
                  <p className="flex items-start gap-2">
                    <CreditCard className="mt-0.5 h-4 w-4 shrink-0 text-mj-slate-soft" />
                    Card ending {cardLast4}
                    {lawnOn ? " — one card, one account, both brands" : ""}
                  </p>
                )}
                {phone && (
                  <p className="pl-6 text-[12.5px] text-mj-slate-soft">
                    We text a reminder to {phone} the day before each visit.
                  </p>
                )}
              </div>
            </div>
          </section>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/" className="btn-ghost">
              Back to the estimator
            </Link>
            <a href="tel:8555589333" className="btn-green">
              Call (855) 558-9333
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
