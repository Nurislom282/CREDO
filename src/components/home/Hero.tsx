"use client";

import type { CSSProperties } from "react";
import Image from "next/image";
import { CursorTrail } from "@/components/home/CursorTrail";
import { Nav } from "@/components/chrome/Nav";

/** The chips under the tagline, in the order the original lists them. */
const SERVICES = [
  "Graphic Design",
  "Brand Design",
  "Product Design",
  "UX | UI",
  "Art Direction",
  "3D",
];

/**
 * Above-the-fold hero.
 *
 * Layout is deliberately asymmetric: the portrait occupies an off-centre slice
 * of the viewport (left 40.97%, width 54.65%, top 8.2%, height 90.4%) while the
 * name group — name, tagline, service chips — is centred in the space under the
 * nav and pinned to the left margin, so the type reads as emerging from behind
 * the image.
 *
 * There are two portraits, not one: an absolutely-positioned one for desktop and
 * a normal-flow one for mobile. A single element would need either JS to
 * re-measure on every breakpoint change or a percentage height, and both cost
 * more than duplicating a <div>.
 *
 * The entrance is pure CSS, gated on <html data-loading>: the portrait and each
 * line of the name start pre-transformed while the loader holds the page, then
 * snap to identity the instant the attribute is removed.
 */
export function Hero() {
  return (
    <section id="top" className="relative w-full bg-canvas">
      <div className="relative mx-auto flex w-full max-w-canvas flex-col lg:h-[100dvh] lg:min-h-[calc(680*var(--px))]">
        {/* Desktop portrait: overlaps the name, sits behind the type. */}
        <div
          data-hero-3d="portrait"
          className="absolute hidden overflow-hidden lg:block"
          style={{
            left: "40.9722%",
            top: "8.2%",
            width: "54.6528%",
            height: "90.4%",
          }}
        >
          <Image
            src="/images/hero-portrait-v2.jpg"
            alt="Bunyod Mahmudov"
            fill
            sizes="55vw"
            priority
            className="absolute max-w-none object-cover object-center"
          />
          <CursorTrail />
        </div>

        <Nav />

        <div className="relative mx-auto w-full max-w-canvas px-6 sm:px-10 lg:px-margin flex flex-1 flex-col lg:justify-center">
          {/* Mobile portrait: in normal flow, above the name. */}
          <div
            data-hero-3d="portrait"
            className="relative mt-8 aspect-[787/904] max-h-[68vh] w-full overflow-hidden lg:hidden"
          >
            <Image
              src="/images/hero-portrait-v2.jpg"
              alt="Bunyod Mahmudov"
              fill
              sizes="(min-width: 640px) calc(100vw - 80px), calc(100vw - 48px))"
              priority
              className="absolute max-w-none object-cover object-center"
            />
            {/* No trail here, matching the original: it is gated on a fine
                pointer, so on the layout that only ever shows on touch the six
                blobs could never appear — shipping them would just be six dead
                image requests on mobile. */}
          </div>

          <div className="mt-10 lg:mt-0">
            <h1
              data-hero-name=""
              data-hero-3d-lines=""
              className="-ml-[0.06em] w-full text-display font-medium text-ink"
              style={{ "--h3d": "140ms" } as CSSProperties}
            >
              <span className="block">Bunyod</span>
              <span className="block">Mahmudov</span>
            </h1>

            <p
              data-hero-3d-lines=""
              className="mt-[calc(5*var(--px))] text-body-lg text-ink lg:mt-[calc(9*var(--px))] lg:max-w-[40%]"
              style={{ "--h3d": "340ms" } as CSSProperties}
            >
              <span className="block">
                Brands, products &amp; the art in between.
              </span>
              <span className="block">I take the fun seriously.</span>
            </p>

            <div>
              <ul className="mt-6 flex flex-wrap gap-[calc(10*var(--px))] min-[368px]:max-w-[calc(440*var(--px))] lg:mt-[calc(35*var(--px))] lg:max-w-[min(45%,calc(440*var(--px)))]">
                {SERVICES.map((service, index) => (
                  <li
                    key={service}
                    data-hero-3d=""
                    style={{ "--h3d": `${480 + index * 40}ms` } as CSSProperties}
                    className="border-[1.2px] border-chip px-4 py-[calc(9*var(--px))] font-archivo text-label font-medium text-ink transition-all duration-300 ease-out-soft hover:bg-ink hover:text-canvas hover:border-ink hover:-translate-y-0.5 hover:shadow-sm cursor-pointer select-none"
                  >
                    {service}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-canvas px-6 sm:px-10 lg:px-margin">
          <div className="mt-12 h-[1.5px] w-full bg-rule lg:mt-0" />
        </div>
      </div>
    </section>
  );
}
