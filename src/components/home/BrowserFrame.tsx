"use client";

import { useState } from "react";

/**
 * Mini web preview for a case study.
 *
 * A browser-chrome frame — traffic lights, address bar, viewport — wrapping
 * either a live prototype or a still image. The chrome is decorative; the frame
 * is a fixed aspect box that scales the content inside it, so a desktop-width
 * page reads as a desktop page seen from a distance rather than being reflowed
 * into a narrow one.
 *
 * The prototype is an iframe, not an export, so the preview cannot drift out of
 * date the way a screenshot does. Figma frames are lazy: they keep the embed in
 * an inert state until it is scrolled near, so loading is deferred to the click
 * rather than fired on mount. That keeps the case study cheap on first paint —
 * the frame is a static preview until asked, which also means it stays
 * readable and keyboard-reachable for anyone who never activates it.
 */
type BrowserFrameProps = {
  /** Live prototype URL. Ignored when `image` is set. */
  src?: string;
  /** Still image fallback, e.g. an exported Figma frame. */
  image?: string;
  /** Shown in the address bar, purely for the look of it. */
  url: string;
  alt: string;
  className?: string;
};

/** The three dots, drawn rather than imported so the frame is self-contained. */
function TrafficLights() {
  return (
    <span aria-hidden="true" className="flex shrink-0 items-center gap-[6px]">
      {["#FF5F57", "#FEBC2E", "#28C840"].map((color) => (
        <span
          key={color}
          className="block h-[9px] w-[9px] rounded-full"
          style={{ backgroundColor: color }}
        />
      ))}
    </span>
  );
}

export function BrowserFrame({ src, image, url, alt, className }: BrowserFrameProps) {
  const [active, setActive] = useState(false);

  return (
    <figure
      className={`overflow-hidden border border-ink/15 bg-white shadow-[0_24px_60px_-30px_rgba(10,10,10,0.45)] ${className ?? ""}`.trim()}
    >
      {/* Chrome. Sits above the content so it stays opaque while the embed
          scrolls underneath, which is what makes it read as a window. */}
      <div className="flex items-center gap-3 border-b border-ink/10 bg-[var(--canvas)] px-3 py-[10px]">
        <TrafficLights />

        <span className="flex min-w-0 flex-1 items-center gap-2 truncate rounded-full border border-ink/10 bg-white px-3 py-[5px] text-[11px] leading-none text-muted">
          <svg
            aria-hidden="true"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            className="h-[11px] w-[11px] shrink-0"
          >
            <rect x="3.5" y="7" width="9" height="6.5" rx="1.2" />
            <path d="M5.75 7V5.5a2.25 2.25 0 0 1 4.5 0V7" />
          </svg>
          <span className="truncate">{url}</span>
        </span>

        {src && !active ? (
          <button
            type="button"
            onClick={() => setActive(true)}
            className="shrink-0 rounded-full bg-ink px-3 py-[6px] text-[11px] font-medium leading-none text-white transition-colors duration-300 ease-out-soft hover:bg-accent"
          >
            Load preview
          </button>
        ) : null}
      </div>

      {/* Fixed 16/10 so the frame holds its shape before the content arrives. */}
      <div className="relative aspect-[16/10] w-full bg-[var(--canvas)]">
        {src && active ? (
          <iframe
            src={src}
            title={`${alt} — interactive prototype`}
            allowFullScreen
            loading="lazy"
            className="absolute inset-0 h-full w-full border-0"
          />
        ) : image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt={alt}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover object-top"
          />
        ) : src ? (
          /* No second button here: the chrome bar already carries "Load
             preview", and two controls for one action is one too many. The
             panel just says what is about to happen. */
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-6 text-center">
            <p className="text-body text-ink">Interactive prototype</p>
            <p className="max-w-[42ch] text-label text-muted">
              Loads the live Figma frame. Nothing is requested until you ask.
            </p>
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center px-6 text-center">
            <p className="max-w-[42ch] text-body text-muted">
              No preview for this project yet.
            </p>
          </div>
        )}
      </div>
    </figure>
  );
}