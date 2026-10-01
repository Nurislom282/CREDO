"use client";

import type { FormEvent } from "react";
import { Handwriting } from "@/components/primitives/Handwriting";
import { DoorWord } from "@/components/primitives/DoorName";
import { Reveal } from "@/components/primitives/Reveal";

const REASONS = ["Freelance project", "Role / Opportunity", "Just saying hi"];

/**
 * Shared field styling. Every control is a bare bottom rule — no box, no fill —
 * so the grid reads as a ledger rather than a stack of form boxes. The colour
 * lives in `border-white/25` (resting) and `focus:border-white/70` (focused),
 * which is why the transition is on colour alone.
 *
 * `[@media(pointer:coarse)]` raises the hit area to 48px on touch without
 * changing the visual rule height, so a phone gets a usable target and the
 * desktop layout keeps its exact metrics.
 */
const FIELD =
  "mt-2 w-full border-b border-white/25 bg-transparent pb-3 text-body-lg text-white outline-none transition-colors duration-300 placeholder:text-white/45 focus:border-white/70 [@media(pointer:coarse)]:min-h-[calc(48*var(--px))]";

/** The two-up / full-width rhythm shared by all three field groups. */
const FIELD_GRID =
  "grid grid-cols-1 gap-x-[calc(35*var(--px))] gap-y-7 pt-7 lg:grid-cols-2 lg:pt-[calc(34*var(--px))]";

/**
 * Contact section — the night card that closes the page.
 *
 * A looping sky video fills the section (the poster is the fallback whenever the
 * clip can't play, which is the common case on a slow connection and for anyone
 * on a reduced-data plan), and the form floats on it as a single raised panel.
 *
 * The card is `w-3/5` with a `min-w`, so between those two it lands on exactly
 * 680px on a 1200px viewport — wide enough for the two-column field grid to sit
 * at 270.5px a column without the label/input pairs ever wrapping.
 *
 * "MESSAGE" is a single-line input in the original, not a textarea. That's
 * reproduced rather than corrected: this is a visual clone, and swapping in a
 * textarea would change the card's height and every offset below it.
 */
export function ContactSection() {
  // No backend behind the clone, so the submit is swallowed rather than allowed
  // to navigate to a dead endpoint. The live region is kept because the original
  // uses one, and it's where a real submission would report back.
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };

  return (
    <section id="contact" className="relative bg-canvas">
      <section className="relative flex min-h-[100svh] w-full flex-col justify-center overflow-hidden py-16 lg:py-[7svh]">
        <video
          aria-hidden="true"
          poster="/images/form-sky.webp"
          muted
          loop
          playsInline
          preload="none"
          className="absolute inset-0 h-full w-full object-cover"
        >
          <source src="/videos/form-sky.mp4" type="video/mp4" />
        </video>

        <div className="relative mx-auto w-full max-w-canvas px-6 sm:px-10 lg:px-margin">
          <div
            id="start-project"
            data-cursor-invert=""
            className="relative bg-night px-6 py-12 sm:px-10 lg:mx-auto lg:w-3/5 lg:min-w-[calc(680*var(--px))] lg:px-[calc(52*var(--px))] lg:py-[calc(40*var(--px))] [box-shadow:0_calc(18*var(--px))_calc(40*var(--px))_calc(-12*var(--px))_rgba(10,10,10,0.28)]"
          >
            <div className="flex items-center">
              <span className="text-label text-night-muted">
                (LEAVE YOUR DETAILS)
              </span>
            </div>

            <Reveal
              as="h2"
              className="pt-8 text-section font-medium uppercase text-canvas lg:pt-[calc(16*var(--px))] lg:text-[calc(68*var(--px))]"
            >
              OPEN THE <DoorWord text="DOOR" />
            </Reveal>

            <Reveal className="flex flex-wrap items-baseline gap-x-3 gap-y-1 pt-4 lg:pt-[calc(14*var(--px))]">
              <span className="text-body text-night-muted">Or just write:</span>
              <a
                href="mailto:credodesignbruh@gmail.com"
                className="inline-flex items-center border-b border-white/30 pb-[calc(2*var(--px))] text-body-lg text-canvas transition-colors duration-300 [@media(pointer:coarse)]:min-h-[calc(48*var(--px))] hover:border-white"
              >
                credodesignbruh@gmail.com
              </a>
            </Reveal>

            <form noValidate onSubmit={handleSubmit}>
              {/* Honeypot. Real people never see it; bots fill it in. */}
              <input
                type="text"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                className="sr-only"
                name="website"
              />

              <Reveal className={FIELD_GRID}>
                <div>
                  <label
                    htmlFor="lead-name"
                    className="block text-label text-night-muted"
                  >
                    NAME
                  </label>
                  <input
                    id="lead-name"
                    name="name"
                    type="text"
                    placeholder="Your full name"
                    autoComplete="name"
                    className={FIELD}
                  />
                </div>
                <div>
                  <label
                    htmlFor="lead-email"
                    className="block text-label text-night-muted"
                  >
                    EMAIL
                  </label>
                  <input
                    id="lead-email"
                    name="email"
                    type="email"
                    placeholder="name@company.com"
                    autoComplete="email"
                    inputMode="email"
                    className={FIELD}
                  />
                </div>
              </Reveal>

              <Reveal className={FIELD_GRID}>
                <div>
                  <label
                    htmlFor="lead-phone"
                    className="block text-label text-night-muted"
                  >
                    PHONE
                  </label>
                  <input
                    id="lead-phone"
                    name="phone"
                    type="tel"
                    placeholder="+998"
                    autoComplete="tel"
                    inputMode="tel"
                    className={FIELD}
                  />
                </div>
                <div>
                  <label
                    htmlFor="lead-reason"
                    className="block text-label text-night-muted"
                  >
                    REASON
                  </label>
                  <select
                    id="lead-reason"
                    name="reason"
                    className={`${FIELD} cursor-pointer [&>option]:text-ink`}
                    defaultValue={REASONS[0]}
                  >
                    {REASONS.map((reason) => (
                      <option key={reason} value={reason}>
                        {reason}
                      </option>
                    ))}
                  </select>
                </div>
              </Reveal>

              <Reveal className="grid grid-cols-1 pt-7 lg:pt-[calc(34*var(--px))]">
                <div className="lg:col-span-2">
                  <label
                    htmlFor="lead-message"
                    className="block text-label text-night-muted"
                  >
                    MESSAGE
                  </label>
                  <input
                    id="lead-message"
                    name="message"
                    type="text"
                    placeholder="A few words"
                    className={FIELD}
                  />
                </div>
              </Reveal>

              <Reveal className="flex flex-col gap-6 pb-20 pt-9 sm:flex-row sm:items-center sm:gap-[calc(36*var(--px))] lg:pb-[calc(46*var(--px))] lg:pt-[calc(36*var(--px))]">
                <button
                  type="submit"
                  className="group/btn inline-flex w-fit shrink-0 items-center gap-3 whitespace-nowrap border border-white bg-white px-[calc(15*var(--px))] py-[calc(9*var(--px))] text-body font-medium leading-[1.5] text-night [--hw-base:#0D0D0B] transition-[background-color,color,border-color] duration-300 ease-out-soft hover:bg-transparent hover:text-white [@media(pointer:coarse)]:min-h-[calc(48*var(--px))]"
                >
                  <Handwriting text="Send Details" baseColor="#0D0D0B" />
                  {/* A sibling of the text run, not a child of it: the icon is a
                      flex item so `gap-3` spaces it, and it never takes a line of
                      its own. */}
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 16 16"
                    fill="currentColor"
                    className="h-4 w-4 shrink-0 transition-transform duration-300 ease-out-soft group-hover/btn:-rotate-45"
                  >
                    <g transform="rotate(0 8 8) translate(1.9 3.056) scale(0.40966)">
                      <path d="M23.1099 10.9188C19.5082 8.73064 14.2988 4.0372 13.5814 0.0155222L15.9065 3.2973e-06C17.9701 4.66018 24.0697 10.0675 29.7806 10.9898L29.759 13.0893C24.3025 14.0138 17.8165 19.4278 15.9857 24.1101L13.6701 24.1367C13.9005 20.39 19.7218 15.2819 23.0571 13.1913L0.00959874 13.1691L5.90407e-07 10.9388L23.1099 10.9188Z" />
                    </g>
                  </svg>
                </button>

                <p className="text-label text-night-muted" aria-live="polite">
                  No spam. A real reply, usually the same day.
                </p>
              </Reveal>

              <Reveal className="-mt-14 lg:-mt-[calc(34*var(--px))]">
                <p className="text-label text-night-muted">
                  Sent details land in my inbox and nowhere else -{" "}
                  <a
                    href="/privacy"
                    className="underline underline-offset-4 transition-colors hover:text-white"
                  >
                    privacy policy
                  </a>
                </p>
              </Reveal>
            </form>
          </div>
        </div>
      </section>
    </section>
  );
}
