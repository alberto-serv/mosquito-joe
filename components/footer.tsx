import Link from "next/link"
import Image from "next/image"

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-line bg-mj-slate text-[#D1D5DB]">
      <div className="container mx-auto px-6 py-12 md:px-8">
        <div className="flex flex-wrap justify-between gap-10 border-b border-white/10 pb-8">
          <div className="max-w-[440px]">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <Image src="/brand/favicon.png" alt="Mosquito Joe" width={44} height={44} className="h-11 w-11 rounded-lg" />
              <span className="text-[15px] font-extrabold tracking-[-0.02em] text-white">Mosquito Joe</span>
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-[#D1D5DB]">
              Outdoor pest control for mosquitoes, ticks, and fleas. Barrier treatments on a set
              cycle, applied by trained technicians, so your yard stays usable all season.
            </p>
            <div className="mt-5 flex items-center gap-4">
              <Image src="/mj/pesp-gold.webp" alt="EPA PESP Gold Tier recognition" width={64} height={64} className="h-14 w-auto" />
              <p className="text-[12px] leading-snug text-[#9CA3AF]">
                Recognized at the Gold tier of the EPA Pesticide Environmental Stewardship Program.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <h5 className="eyebrow text-mj-yellow">Contact</h5>
            <p className="text-sm text-[#D1D5DB]">Serving your neighborhood</p>
            <p className="text-sm">
              <a href="tel:8555589333" className="font-bold text-mj-yellow transition-colors hover:text-white">
                (855) 558-9333
              </a>
            </p>
            <p className="text-sm">
              <Link href="/contact" className="text-[#D1D5DB] transition-colors hover:text-white">
                Send us a message
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-col items-center justify-between gap-3 text-[12.5px] text-[#9CA3AF] md:flex-row">
          <p>&copy; {currentYear} Mosquito Joe. All rights reserved. Demo prototype.</p>
          <div className="flex items-center gap-6">
            <a href="https://mosquitojoe.com/privacy-policy/" className="transition-colors hover:text-white">
              Privacy Policy
            </a>
            <a href="https://mosquitojoe.com/terms-of-use/" className="transition-colors hover:text-white">
              Terms of Service
            </a>
            <a
              href="https://www.goserv.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 opacity-80 transition-opacity hover:opacity-100"
            >
              <span>Powered by</span>
              <Image src="/serv-logo.png" alt="Serv" width={48} height={18} className="h-[14px] w-auto brightness-0 invert" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
