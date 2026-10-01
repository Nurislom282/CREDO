import Image from "next/image";
import { Handwriting } from "@/components/primitives/Handwriting";

/**
 * Stored uppercase on purpose, exactly as the original does. It is not a
 * `text-transform`: the casing is baked into the string, and that is what makes
 * the row wrap onto two lines at desktop — the email address is long enough that
 * Privacy/Terms cannot share its line. Shortening it to "Email" would collapse
 * the row to a single line and shorten the footer.
 */
const LINKS = [
  { label: "CREDODESIGNBRUH@GMAIL.COM", href: "mailto:credodesignbruh@gmail.com" },
  { label: "INSTAGRAM", href: "https://www.instagram.com/acc1dental/" },
  { label: "TELEGRAM", href: "https://t.me/accidentallll" },
];

/** Link styling shared by every footer link. */
const linkClass =
  "inline-flex items-center py-[calc(11*var(--px))] text-body-lg text-white transition-colors duration-200 [--hw-base:#fff] [@media(pointer:coarse)]:min-h-[calc(48*var(--px))] hover:text-accent";

/**
 * Dark footer: oversized wordmark, positioning line, and the outbound links.
 *
 * The links are Handwriting, so each sweeps to accent on hover. Because the type
 * is white here, the resting colour is passed through --hw-base rather than
 * hard-coded in the component, which is what keeps the sweep readable against
 * the dark background instead of flashing black.
 *
 * Coarse pointers get a 48px minimum height: on touch there is no hover, so the
 * links have to carry a real hit target instead of relying on the sweep.
 */
export function Footer() {
  return (
    <footer data-cursor-invert="" className="relative w-full bg-night">
      <div className="mx-auto w-full max-w-canvas px-6 sm:px-10 lg:px-margin">
        <div className="h-px w-full bg-white/10" />
      </div>

      <div className="mx-auto w-full max-w-canvas px-6 pt-16 sm:px-10 lg:px-margin lg:pt-[calc(104*var(--px))]">
        <Image
          src="/images/wordmark-pamidor-studio.svg"
          alt="Pamidor Studio"
          width={1210}
          height={118}
          className="h-auto w-full"
        />

        <div className="mt-12 flex flex-col gap-8 lg:mt-[calc(72*var(--px))] lg:flex-row lg:items-end lg:gap-0">
          <p className="text-subhead font-medium uppercase text-white lg:w-1/2">
            Somewhere between structure and instinct.
          </p>

          <div className="flex flex-wrap items-end gap-x-6 gap-y-1 lg:w-1/2 lg:justify-end lg:pl-5">
            {LINKS.map((link) => (
              <Handwriting
                key={link.href}
                as="a"
                text={link.label}
                baseColor="#fff"
                className={linkClass}
                rest={{ href: link.href }}
              />
            ))}
          </div>
        </div>

        <p className="mt-12 pb-8 text-body-lg text-white lg:mt-[calc(60*var(--px))] lg:pb-[calc(24*var(--px))]">
          © 2026 CREDO & CRATOS TM. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
