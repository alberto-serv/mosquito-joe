# Mosquito Joe — quote and checkout prototype

A two-screen demo. Screen 1 prices outdoor pest control from the lot size.
Screen 2 is the checkout, where a Lawn Pride offer attaches to the same order.

Cloned from `v0-anago-cleaning` and rebuilt: the cleaning estimator became a
mosquito service quote, and the booking screen became an express checkout with a
cross-brand attach card.

## Running it

```bash
npm install
npm run dev
```

## The two screens

**`/` — the quote.** Five steps and nothing else: what to treat for, what kind of
property, how big the lot is, which treatment, and how often. No hero — the first
thing on the page is the first question.

The lot step leads with the slider, capped at 10,000 sq ft. Behind an "I don't
know my lot size" link sits an address lookup that simulates measuring the lot
from parcel data; the measured address then rides through to checkout and
prefills the service address. Over the cap routes to a phone call.

**`/checkout` — the climax.** Order summary, the Lawn Pride attach card, first
visit date and window, contact and address, card entry, then the pay button. The
pay label follows what actually happens: `Start mosquito service`, or `Start both
services` once Lawn Pride is added.

`/checkout/confirmation` shows the receipt. `/contact` handles anything that
needs a person.

## The attach card

`components/lawn-pride-attach.tsx`. It is built on the same `.surface` as the
order summary above it, at the same padding and type scale, because it is not an
ad — it is a second line item the customer has not accepted yet.

Toggling the offer on drops a second brand into the order above it and counts the
season total up to its new value. Both brands then sit as separate line items with
their own brand marks under one total — never blended into a generic "services"
line.

## Pricing

All placeholder demo pricing, labeled as such in the UI.

**Mosquito Joe** (`lib/mosquito-data.ts`)

```
per treatment = max($89, lot sq ft × $0.022)
                × target × treatment × plan multipliers
```

**Lawn Pride** (`lib/lawn-pride.ts`)

```
per application = max($49, turf sq ft × $0.011) × program multiplier
7-Application ×1.0 · Enhanced ×1.28 · Enhanced Plus ×1.55
Billed per application, 7 applications per season.
```

A 4,200 sq ft lot lands at $115 per Mosquito Joe treatment on the default
selection, and $63 per Lawn Pride application on the Enhanced program.

## Brand

Two palettes, one typeface. Inter carries both brands; 8px radius throughout.

- Mosquito Joe: yellow `#FBE122` with black text, green `#43B02A`, slate `#374151`
- Lawn Pride: green `#12875E` with white text, navy `#1B3554`
- Barrier accent: amber `#F0A81E` — over-cap and minimum notices, warm enough to
  sit beside MJ yellow without competing with Lawn Pride's green

Brand marks and photography live in `public/brand` and `public/mj`.

## Layout

```
app/page.tsx                        screen 1, the quote
app/checkout/page.tsx               screen 2, the checkout
app/checkout/confirmation/page.tsx  the receipt
components/lawn-pride-attach.tsx    the attach card
components/animated-total.tsx       the counting total
components/brand-mark.tsx           the two brand marks
lib/mosquito-data.ts                quote model and pricing
lib/lawn-pride.ts                   attach offer and pricing
```
