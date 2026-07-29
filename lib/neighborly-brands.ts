// ─── Brands available at this address ────────────────────────────────────────
//
// The confirmation screen closes on two Neighborly brands the household has not
// bought yet. They carry a real starting price rather than a "learn more" link,
// because the point is that the address is a standing surface for future attach,
// not that we are selling something else right now.
//
// PLACEHOLDER DEMO PRICING, labeled as such in the UI.

export interface AvailableBrand {
  id: string
  name: string
  service: string
  /** What the price actually buys. */
  priceBasis: string
  startingPrice: number
  /** Why this address in particular. Stated as fact, not as a pitch. */
  note: string
}

export const AVAILABLE_BRANDS: AvailableBrand[] = [
  {
    id: "window-genie",
    name: "Window Genie",
    service: "Gutter and window cleaning",
    priceBasis: "per visit",
    startingPrice: 189,
    note: "Serves this ZIP code",
  },
  {
    id: "mr-handyman",
    name: "Mr. Handyman",
    service: "Home repairs and installs",
    priceBasis: "per hour",
    startingPrice: 129,
    note: "Serves this ZIP code",
  },
]
