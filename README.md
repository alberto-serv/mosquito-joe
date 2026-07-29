# Mosquito Joe — quote and checkout prototype

A three-screen demo. Screen 1 prices outdoor pest control from the lot size.
Screen 2 is the checkout, where a Lawn Pride offer attaches to the same order.
Screen 3 drops both brands and shows the household itself.

Cloned from `v0-anago-cleaning` and rebuilt: the cleaning estimator became a
mosquito service quote, and the booking screen became an express checkout with a
cross-brand attach card.

## Running it

```bash
npm install
npm run dev
```

## The three screens

**`/` — the quote.** Four steps and nothing else: what to treat for, how big the
lot is, which treatment type, and how often.

The lot step leads with the slider, capped at 10,000 sq ft. Behind an "I don't
know my lot size" link sits an address lookup that simulates measuring the lot
from parcel data and then reports the price that measurement produced. The
measured address rides through to checkout and prefills the service address.
Over the cap routes to a phone call.

**`/checkout` — the climax.** Order summary, the Lawn Pride attach card, first
visit date and window, contact and address, card entry, then the pay button. The
pay label follows what actually happens: `Start mosquito service`, or `Start both
services` once Lawn Pride is added.

**`/checkout/confirmation` — the household.** Deliberately runs on the neutral
Neighborly token set, not on either brand's. The brands sold the service; the
household is the shared asset. It is also the one route excluded from the
Mosquito Joe chrome in `components/site-chrome.tsx`, because an MJ header on top
would undo exactly that shift.

It opens on a plain title, then a household card carrying the address and the
measured lot, then two service cards, then a single payment row and a single
contact row shared by both. It closes on a visually lighter card,
"Available at this address", carrying Window Genie and Mr. Handyman with real
starting prices rather than a "learn more" link. Those are proof the address is a
standing surface for future attach, not a second sales pitch, so they get no
shadow, no fill, and no call to action.

`/contact` handles anything that needs a person.

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
- Neighborly (screen 3 only): navy `#002554`, blue `#3A73B7`, yellow `#FFC845`
- Window Genie: purple `#500878` · Mr. Handyman: red `#B52126`
- Barrier accent: amber `#F0A81E` for over-cap and minimum notices

Every brand mark in `public/brand` is the real apple-touch-icon or logo pulled
from that brand's site. Photography lives in `public/mj`.

## Layout

```
app/page.tsx                        screen 1, the quote
app/checkout/page.tsx               screen 2, the checkout
app/checkout/confirmation/page.tsx  screen 3, the household
components/lawn-pride-attach.tsx    the attach card
components/animated-total.tsx       the counting total
components/brand-mark.tsx           the two brand marks
lib/mosquito-data.ts                quote model and pricing
lib/lawn-pride.ts                   attach offer and pricing
lib/neighborly-brands.ts            brands available at the address
```
