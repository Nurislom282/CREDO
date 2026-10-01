"use client";

import Image from "next/image";
import { Fragment, useEffect, useRef, type CSSProperties } from "react";
import { Marquee } from "@/components/primitives/Marquee";
import { Reveal } from "@/components/primitives/Reveal";

/**
 * Client wordmarks, in two independently scrolling rows.
 *
 * These are plain <img> rather than next/image, matching production and for a
 * practical reason: the optimiser refuses SVG sources unless the image config
 * opts into `dangerouslyAllowSVG`, and twelve of the twenty-three marks are
 * SVG. Routing them through the optimiser would mean disabling that guard for
 * the whole app to serve assets we already control.
 */
type Logo = { src: string; width: number; height: number };

const LOGO_ROWS: { key: string; logos: Logo[] }[] = [
  {
    key: "clients-1",
    logos: [
      { src: "/logos/c1-02.svg", width: 67.714, height: 24 },
      { src: "/logos/c1-03.png", width: 107, height: 24 },
      { src: "/logos/c1-04.png", width: 50.759, height: 24 },
      { src: "/logos/c1-05.png", width: 100, height: 24 },
      { src: "/logos/c1-06.png", width: 102, height: 24 },
      { src: "/logos/c1-07.svg", width: 93.767, height: 24.066 },
      { src: "/logos/c1-08.svg", width: 81, height: 16 },
      { src: "/logos/c1-09.svg", width: 86.824, height: 24.142 },
      { src: "/logos/c1-10.svg", width: 73.895, height: 23.895 },
      { src: "/logos/c1-11.svg", width: 90, height: 14.931 },
      { src: "/logos/c1-12.svg", width: 87.333, height: 28 },
      { src: "/logos/c1-13.svg", width: 38.97, height: 32 },
    ],
  },
  {
    key: "clients-2",
    logos: [
      { src: "/logos/c2-01.svg", width: 107.917, height: 24 },
      { src: "/logos/c2-02.svg", width: 92.028, height: 24 },
      { src: "/logos/c2-03.svg", width: 55.68, height: 23.732 },
      { src: "/logos/c2-04.svg", width: 103.141, height: 24 },
      { src: "/logos/c2-05.svg", width: 108.06, height: 24 },
      { src: "/logos/c2-07.svg", width: 152, height: 16 },
      { src: "/logos/c2-08.svg", width: 79.467, height: 23.737 },
      { src: "/logos/c2-09.svg", width: 34.036, height: 23.803 },
      { src: "/logos/c2-10a.svg", width: 116.031, height: 24 },
      { src: "/logos/c2-11.svg", width: 40.36, height: 28 },
      { src: "/logos/c2-12.svg", width: 34.972, height: 32 },
    ],
  },
];

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

type BioWaveProps = {
  text: string;
  className?: string;
  /**
   * Optional portrait floated into the first lines of the paragraph.
   *
   * It is a real float rather than an inline-block or a grid cell, because the
   * float is what shapes the text: it eats into the first few lines only, so the
   * paragraph wraps one line taller than it would on its own. The inner box is
   * a square that the image overflows, rotated and shadowed, so the photo reads
   * as a print laid on the page.
   */
  floatSrc?: string;
  floatWidth: number;
  floatHeight: number;
};

/**
 * Paragraph that lights up as it scrolls past a pinned viewport.
 *
 * The section is one viewport taller than the screen (100vh + --travel) and its
 * child is sticky, so the text holds still while the page scrolls past and the
 * reader watches it light in reading order.
 *
 * Progress is derived from the element's own geometry rather than a scroll
 * offset, which makes it self-correcting across breakpoints. Two mappings:
 *   - when the section is taller than the viewport (desktop) progress is simply
 *     how far its top has passed the viewport top, over the total travel
 *   - otherwise (mobile, where the inner block is the tall one) it maps the
 *     middle 60% of the viewport instead
 *
 * Lighting is reversible: scrolling back up un-lights the characters again,
 * because the original does and it keeps the effect honest rather than sticky.
 *
 * Scroll and resize are coalesced into a single rAF so a fast scroll or a drag
 * of the window can't queue a handler per event.
 */
export function BioWave({ text, className, floatSrc, floatWidth, floatHeight }: BioWaveProps) {
  const outerRef = useRef<HTMLDivElement | null>(null);
  const innerRef = useRef<HTMLDivElement | null>(null);
  const paraRef = useRef<HTMLParagraphElement | null>(null);

  useEffect(() => {
    const outer = outerRef.current;
    const para = paraRef.current;
    if (!outer || !para) return;

    // Nothing to animate if the browser is doing the scrolling for us.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const chars = Array.from(para.querySelectorAll<HTMLElement>("[data-char]"));
    const total = chars.length;
    if (total === 0) return;

    para.setAttribute("data-wave", "");

    const desktop = window.matchMedia("(min-width: 1024px)");
    let lit = 0;
    let queued = 0;

    const update = () => {
      queued = 0;

      const target = (desktop.matches ? outer : (innerRef.current ?? outer))!;
      const rect = target.getBoundingClientRect();
      const travel = rect.height - window.innerHeight;

      const next =
        travel > 0
          ? Math.round(clamp01(-rect.top / travel) * total)
          : Math.round(
              clamp01(
                (0.85 * window.innerHeight - rect.top) / (0.6 * window.innerHeight),
              ) * total,
            );

      if (next === lit) return;

      if (next > lit) {
        for (let i = lit; i < next; i++) chars[i]?.setAttribute("data-lit", "");
      } else {
        for (let i = lit - 1; i >= next; i--) chars[i]?.removeAttribute("data-lit");
      }
      lit = next;
    };

    const schedule = () => {
      if (queued) return;
      queued = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    desktop.addEventListener("change", schedule);

    return () => {
      if (queued) cancelAnimationFrame(queued);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      desktop.removeEventListener("change", schedule);
      para.removeAttribute("data-wave");
    };
  }, [text]);

  // One span per word so the browser can only break between words, with the
  // space as a sibling text node exactly as the original does it.
  return (
    <div
      ref={outerRef}
      className="lg:[height:calc(100vh+var(--travel))]"
      style={{ "--travel": "135vh" } as React.CSSProperties}
    >
      <div className="lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:justify-center">
        <div
          ref={innerRef}
          className="[height:calc(100svh+var(--travel))] lg:h-auto"
        >
          <div className="sticky top-0 flex min-h-[100svh] flex-col justify-center lg:static lg:block lg:min-h-0">
            <p
              ref={paraRef}
              aria-label={text}
              className={className ?? "text-lead font-medium text-ink"}
            >
              {floatSrc ? (
                <span
                  aria-hidden="true"
                  className="mb-6 block w-[38%] sm:float-right sm:mb-0 sm:ml-8 sm:mt-2 sm:w-[26%] sm:max-w-[calc(206*var(--px))] sm:[shape-margin:18px] lg:ml-10 lg:w-[19%]"
                >
                  <span className="pointer-events-none relative block aspect-square -rotate-[6deg] overflow-hidden [box-shadow:0_calc(18*var(--px))_calc(40*var(--px))_calc(-12*var(--px))_rgba(10,10,10,0.28)]">
                    <Image
                      src={floatSrc}
                      alt=""
                      width={floatWidth}
                      height={floatHeight}
                      loading="lazy"
                      sizes="(min-width: 1729px) 11.93vw, 206px"
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  </span>
                </span>
              ) : null}

              <span aria-hidden="true">
                {text.split(" ").map((word, wordIndex, all) => (
                  <Fragment key={`${word}-${wordIndex}`}>
                    <span data-word="" className="inline-block">
                      {Array.from(word).map((glyph, glyphIndex) => (
                        <span key={`${glyphIndex}-${glyph}`} data-char="">
                          {glyph}
                        </span>
                      ))}
                    </span>
                    {wordIndex < all.length - 1 ? " " : null}
                  </Fragment>
                ))}
              </span>
            </p>

            <div
              aria-hidden="true"
              className="h-[1.5px] w-full bg-rule mt-12 lg:mt-[calc(64*var(--px))]"
            />

            {/* Showreel on the left, client logos on the right. The logo rows
                run edge to edge under a gradient that fades them into the
                canvas, so the list reads as continuous rather than as a
                bordered table with a hard right edge. */}
            <div className="pt-8 lg:flex lg:gap-x-[calc(45*var(--px))] lg:pt-[calc(15*var(--px))]">
              <Reveal className="reveal hidden lg:block lg:w-[calc(305*var(--px))] lg:shrink-0">
                <video
                  poster="/images/studio-showreel-poster.webp"
                  width={640}
                  height={372}
                  muted
                  loop
                  playsInline
                  preload="none"
                  aria-label="Studio showreel"
                  className="bg-canvas h-auto w-full rounded-[2px]"
                >
                  <source src="/videos/studio-showreel.mp4" type="video/mp4" />
                </video>
              </Reveal>

              <div className="min-w-0 lg:flex-1 lg:pt-[calc(35*var(--px))]">
                <p className="text-label text-muted">
                  (CLIENTS &amp; COLLABORATIONS)
                </p>

                <div className="relative mt-6 lg:mt-[calc(18*var(--px))]">
                  <div className="flex flex-col gap-6 lg:gap-[calc(24*var(--px))]">
                    {LOGO_ROWS.map((row) => (
                      <Marquee
                        key={row.key}
                        halfClassName="flex shrink-0 items-center gap-x-[calc(30*var(--px))]"
                      >
                        {row.logos.map((logo) => (
                          <div
                            key={logo.src}
                            className="relative shrink-0 opacity-55"
                            style={
                              {
                                width: `calc(${logo.width} * var(--px))`,
                                height: `calc(${logo.height} * var(--px))`,
                              } as CSSProperties
                            }
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={logo.src}
                              alt=""
                              width={logo.width}
                              height={logo.height}
                              loading="lazy"
                              decoding="async"
                              className="absolute inset-0 h-full w-full object-contain"
                            />
                          </div>
                        ))}
                      </Marquee>
                    ))}
                  </div>

                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute bottom-0 right-0 top-0 w-[calc(120*var(--px))] bg-gradient-to-r from-transparent to-canvas"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
