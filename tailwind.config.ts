import type { Config } from "tailwindcss"

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        // Both brands resolve to Inter. One face, two palettes.
        sans: [
          "var(--font-inter)",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
        display: ["var(--font-inter)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        // ── Mosquito Joe ──────────────────────────────────────────────
        mj: {
          yellow: { DEFAULT: "#FBE122", deep: "#E8CE0C", soft: "#FEF9CC" },
          green: { DEFAULT: "#43B02A", deep: "#379022", soft: "#EAF7E6" },
          ink: "#000000",
          slate: { DEFAULT: "#374151", soft: "#6B7280" },
        },
        // The barrier-treatment layer in the yard plan. Warm amber that sits
        // beside MJ yellow without competing with Lawn Pride's green.
        barrier: { DEFAULT: "#F0A81E", deep: "#D18B08", soft: "#FDF0D5" },

        // ── Lawn Pride ────────────────────────────────────────────────
        lp: {
          green: { DEFAULT: "#12875E", deep: "#0E6E4C", soft: "#E7F4EF" },
          navy: "#1B3554",
          blue: "#407EC9",
          orange: "#FF5100",
        },

        // ── Neighborly ────────────────────────────────────────────────
        // The neutral parent set. Screen 3 runs on this deliberately: the
        // brands sold the service, the household is the shared asset.
        nb: {
          navy: { DEFAULT: "#002554", soft: "#EAEFF5" },
          blue: { DEFAULT: "#3A73B7", deep: "#2F5F99", soft: "#EDF3FA" },
          slate: { DEFAULT: "#1F2937", soft: "#6B7280" },
          yellow: { DEFAULT: "#FFC845", soft: "#FFF6E0" },
        },

        // ── Brands available at the address, not yet purchased ────────
        wg: { purple: { DEFAULT: "#500878", soft: "#F4EEF8" }, blue: "#407EC9" },
        mh: { red: { DEFAULT: "#B52126", soft: "#FBEDED" } },

        // ── Shared neutrals ───────────────────────────────────────────
        ink: "#111827",
        body: "#374151",
        line: { DEFAULT: "#E5E7EB", soft: "#F3F4F6", strong: "#D1D5DB" },

        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "12px",
        "2xl": "16px",
        pill: "999px",
      },
      backgroundImage: {
        "mj-band": "linear-gradient(104deg,#FEF9CC 0%,#FFFFFF 52%,#EAF7E6 100%)",
        "mj-band-soft": "linear-gradient(104deg,#FFFDF0 0%,#FFFFFF 55%,#F4FBF1 100%)",
        "mj-select": "linear-gradient(180deg,#FFFDF0,#FEF9CC)",
        "lp-select": "linear-gradient(180deg,#F3FAF7,#E7F4EF)",
      },
      boxShadow: {
        card: "0 1px 2px rgba(17,24,39,.05), 0 8px 24px rgba(17,24,39,.06)",
        "card-lift": "0 2px 4px rgba(17,24,39,.06), 0 18px 44px rgba(17,24,39,.10)",
        "mj-glow": "0 6px 18px rgba(251,225,34,.45)",
        "lp-glow": "0 6px 18px rgba(18,135,94,.28)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "rise-in": {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "none" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "rise-in": "rise-in .42s cubic-bezier(.22,1,.36,1) both",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config
