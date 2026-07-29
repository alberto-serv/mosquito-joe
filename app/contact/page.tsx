"use client"

import type React from "react"
import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Check, Mail, Phone } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export default function ContactPage() {
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", phone: "", message: "" })
  const [sent, setSent] = useState(false)

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    setSent(true)
  }

  return (
    <div className="min-h-screen bg-muted/40">
      <div className="container mx-auto px-4 py-10 md:py-14">
        <div className="mx-auto max-w-[600px]">
          <Link
            href="/"
            className="mb-5 inline-flex items-center text-[13.5px] font-bold text-ink transition-colors hover:text-mj-slate-soft"
          >
            Back to your quote
          </Link>

          <h1 className="text-[30px] font-extrabold tracking-[-0.03em] text-black">Talk to us</h1>
          <p className="mt-1.5 text-[14.5px] text-mj-slate-soft">
            Odd lot, large acreage, or a commercial property? Tell us about it and we will price it by hand.
          </p>

          <div className="surface mt-6 overflow-hidden">
            <div className="relative h-40">
              <Image src="/mj/van.webp" alt="A Mosquito Joe service van" fill className="object-cover" sizes="600px" />
            </div>

            <div className="p-6 md:p-7">
              {sent ? (
                <div className="py-10 text-center">
                  <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-mj-green">
                    <Check className="h-7 w-7 text-black" strokeWidth={3} />
                  </span>
                  <h2 className="mt-4 text-[22px] font-extrabold tracking-[-0.026em] text-black">Message sent</h2>
                  <p className="mx-auto mt-2 max-w-sm text-[14.5px] text-mj-slate-soft">
                    Someone from your local team will reach out within one business day.
                  </p>
                </div>
              ) : (
                <form onSubmit={submit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="c-first" className="text-[12.5px] font-semibold text-ink">
                        First name
                      </Label>
                      <Input
                        id="c-first"
                        required
                        className="mt-1.5"
                        value={form.firstName}
                        onChange={(e) => setForm((p) => ({ ...p, firstName: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="c-last" className="text-[12.5px] font-semibold text-ink">
                        Last name
                      </Label>
                      <Input
                        id="c-last"
                        required
                        className="mt-1.5"
                        value={form.lastName}
                        onChange={(e) => setForm((p) => ({ ...p, lastName: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="c-email" className="text-[12.5px] font-semibold text-ink">
                        Email
                      </Label>
                      <Input
                        id="c-email"
                        type="email"
                        required
                        className="mt-1.5"
                        value={form.email}
                        onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="c-phone" className="text-[12.5px] font-semibold text-ink">
                        Mobile
                      </Label>
                      <Input
                        id="c-phone"
                        type="tel"
                        required
                        className="mt-1.5"
                        value={form.phone}
                        onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="c-message" className="text-[12.5px] font-semibold text-ink">
                      What should we know about the property?
                    </Label>
                    <Textarea
                      id="c-message"
                      rows={4}
                      className="mt-1.5"
                      placeholder="Acreage, standing water, pets, access, event dates"
                      value={form.message}
                      onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
                    />
                  </div>
                  <button type="submit" className="btn-yellow w-full">
                    Send message
                  </button>
                </form>
              )}
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <a href="tel:8555589333" className="surface flex items-center gap-3 p-4 transition-shadow hover:shadow-card-lift">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-mj-yellow">
                <Phone className="h-[18px] w-[18px] text-black" />
              </span>
              <span>
                <span className="block text-[13.5px] font-bold text-black tabular">(855) 558-9333</span>
                <span className="block text-[12px] text-mj-slate-soft">Seven days a week</span>
              </span>
            </a>
            <a
              href="mailto:hello@mosquitojoe.example"
              className="surface flex items-center gap-3 p-4 transition-shadow hover:shadow-card-lift"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-mj-green">
                <Mail className="h-[18px] w-[18px] text-black" />
              </span>
              <span>
                <span className="block text-[13.5px] font-bold text-black">Email us</span>
                <span className="block text-[12px] text-mj-slate-soft">Reply within one business day</span>
              </span>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
