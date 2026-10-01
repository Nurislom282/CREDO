"use client";

import { useEffect, useRef } from "react";

/** The six soft blobs, cycled so consecutive stamps differ from each other. */
const SOURCES = [1, 2, 3, 4, 5, 6].map(
  (n) => `/images/hero-trail/trail-${n}.webp`,
);

/** Intrinsic sizes, so the browser can derive each frame's height up front. */
const DIMENSIONS: Record<number, [number, number]> = {
  1: [480, 459],
  2: [480, 451],
  3: [480, 450],
  4: [480, 451],
  5: [480, 480],
  6: [480, 425],
};

/**
 * Where the pointer sits inside the 80px box. The base 40px centres it; the
 * nudge is the taste adjustment — it puts the blob's visual mass slightly
 * ahead of and above the cursor so it reads as being *dragged*.
 */
const ANCHOR = { x: 44, y: -13 };

/** Bloom, hold, fade. The stamp is alive for the sum, and starts dying at bloom+hold. */
const BLOOM_MS = 240;
const HOLD_MS = 360;
const DURATION_MS = BLOOM_MS + HOLD_MS + 240;
const FADE_AT_MS = BLOOM_MS + HOLD_MS;

/** Pointer travel, in `--px` units, between stamps. */
const STEP_PX = 90;

/** At most this many stamps alive at once; the oldest gets fast-forwarded. */
const MAX_LIVE = 4;

/** `--px` is the page's design-unit scale, so thresholds scale with the viewport. */
function pxScale(): number {
  const raw = parseFloat(
    getComputedStyle(document.documentElement).getPropertyValue("--px"),
  );
  return Number.isFinite(raw) && raw > 0 ? raw : 1;
}

type Frame = {
  el: HTMLDivElement;
  img: HTMLImageElement;
  anim: Animation | null;
};

/**
 * Pointer trail over the hero portrait.
 *
 * This is not a comet tail. Nothing follows the cursor frame by frame — a blob
 * is *stamped* at the pointer every time it has travelled STEP_PX, so the trail
 * is a dotted record of where the pointer has been, and its density depends on
 * how fast you move. Slow movement leaves separated blobs; a fast sweep lays
 * them evenly along the path.
 *
 * Each stamp owns a self-contained Web Animations timeline rather than being
 * driven by a global loop: it blooms (scale up, mask sweeping from the trailing
 * to the leading end), holds, then fades and shrinks. Because the timelines are
 * independent, the Web Animations engine composites them off the main thread —
 * a shared rAF loop writing six transforms per frame would compete with the
 * scroll-linked reveals elsewhere on the page.
 *
 * The mask is what makes a stamp read as a soft comet rather than a blob: a
 * 105deg gradient sized to 280% and swept across the frame, so the blob has a
 * hard leading edge and a transparent tail, and the sweep direction follows the
 * direction of travel.
 *
 * Only four stamps may be alive. A fifth fast-forwards the oldest past its hold
 * and doubles its playback rate, so recycling a frame never pops — it just
 * finishes early.
 *
 * Emission is bounded to the portrait's own rect, so the trail cannot escape
 * the image (and nothing is stamped while the pointer is over the name or nav).
 */
export function CursorTrail() {
  const hostRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    // The portrait is the host's parent; it supplies both the coordinate space
    // and the bounds test.
    const parent = host?.parentElement;
    if (!host || !parent) return;
    if (
      !window.matchMedia("(hover: hover) and (prefers-reduced-motion: no-preference)")
        .matches
    ) {
      return;
    }

    const frames: Frame[] = Array.from(host.children).map((el) => ({
      el: el as HTMLDivElement,
      img: el.querySelector("img") as HTMLImageElement,
      anim: null,
    }));

    let inside = false;
    let lastX = 0;
    let lastY = 0;
    let travelled = 0;
    let scale = 1;
    let image = -1;
    let cursor = 0;

    /** Stamps currently playing, oldest first. */
    const live: Frame[] = [];
    /** Stamps recycled early and racing to finish, so they can be dropped. */
    const ending: Frame[] = [];

    /**
     * Fast-forward a stamp past its hold and race it out, so its slot frees up
     * without a visible pop. `fill: both` means it holds the faded end state,
     * so leaving it running is harmless.
     */
    const retireEarly = (frame: Frame) => {
      if (!frame.anim || frame.anim.currentTime === null) return;
      frame.anim.currentTime = Math.max(Number(frame.anim.currentTime), FADE_AT_MS);
      frame.anim.playbackRate = 2.5;
      ending.push(frame);
      if (ending.length > 1) ending.shift()?.anim?.finish();
    };

    const stamp = (x: number, y: number) => {
      image = (image + 1) % SOURCES.length;
      const frame = frames[cursor];
      cursor = (cursor + 1) % frames.length;
      if (live.length >= MAX_LIVE) retireEarly(live.shift() as Frame);

      // This slot may already be tracked, or already be finishing.
      const li = live.indexOf(frame);
      if (li !== -1) live.splice(li, 1);
      const wi = ending.indexOf(frame);
      if (wi !== -1) ending.splice(wi, 1);

      frame.img.src = SOURCES[image];
      frame.el.style.transform = `translate3d(${x + (ANCHOR.x - 40) * scale}px, ${
        y + (ANCHOR.y - 40) * scale
      }px, 0)`;

      frame.anim?.cancel();
      frame.anim = frame.img.animate(
        [
          {
            opacity: 1,
            transform: "scale(0.98)",
            maskPosition: "100% 0%",
            easing: "cubic-bezier(0.45, 0, 0.25, 1)",
          },
          {
            opacity: 1,
            transform: "scale(1)",
            maskPosition: "0% 0%",
            offset: BLOOM_MS / DURATION_MS,
          },
          {
            opacity: 1,
            maskPosition: "0% 0%",
            offset: FADE_AT_MS / DURATION_MS,
            easing: "cubic-bezier(0.55, 0, 0.45, 1)",
          },
          { opacity: 0, transform: "scale(0.97)", maskPosition: "0% 0%" },
        ],
        { duration: DURATION_MS, fill: "both" },
      );
      live.push(frame);
    };

    /** Leaving the portrait fades everything out and re-arms the first stamp. */
    const clear = () => {
      inside = false;
      while (live.length) {
        const frame = live.shift() as Frame;
        if (frame.anim && frame.anim.currentTime !== null) {
          frame.anim.currentTime = Math.max(
            Number(frame.anim.currentTime),
            FADE_AT_MS,
          );
        }
      }
      ending.length = 0;
    };

    const onMove = (event: PointerEvent) => {
      const rect = parent.getBoundingClientRect();
      if (
        !(
          rect.width > 0 &&
          event.clientX >= rect.left &&
          event.clientX <= rect.right &&
          event.clientY >= rect.top &&
          event.clientY <= rect.bottom
        )
      ) {
        if (inside) clear();
        return;
      }

      // Entering: re-arm and stamp immediately, so the first blob appears where
      // the pointer landed rather than only once it has moved STEP_PX.
      if (!inside) {
        inside = true;
        scale = pxScale();
        lastX = event.clientX;
        lastY = event.clientY;
        travelled = 0;
        stamp(event.clientX - rect.left, event.clientY - rect.top);
        return;
      }

      travelled += Math.hypot(event.clientX - lastX, event.clientY - lastY);
      lastX = event.clientX;
      lastY = event.clientY;
      if (travelled >= STEP_PX * scale) {
        travelled = 0;
        stamp(event.clientX - rect.left, event.clientY - rect.top);
      }
    };

    document.addEventListener("pointermove", onMove, { passive: true });
    // Leaving the document entirely, or the window losing focus (a devtools
    // click, an alt-tab), should not strand blobs on screen.
    document.addEventListener("pointerleave", clear);
    window.addEventListener("blur", clear);

    return () => {
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", clear);
      window.removeEventListener("blur", clear);
      frames.forEach((frame) => frame.anim?.cancel());
    };
  }, []);

  return (
    <div
      ref={hostRef}
      data-trail=""
      aria-hidden="true"
      className="pointer-events-none absolute left-0 top-0 z-10"
    >
      {SOURCES.map((src, index) => (
        <div
          key={src}
          data-trail-frame=""
          className="absolute left-0 top-0"
          style={{ width: "calc(80 * var(--px))" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt=""
            width={DIMENSIONS[index + 1][0]}
            height={DIMENSIONS[index + 1][1]}
            draggable={false}
            className="h-auto w-full opacity-0"
            style={{
              maskImage:
                "linear-gradient(105deg, #000 45%, rgba(0, 0, 0, 0) 62%)",
              maskSize: "280% 100%",
              maskRepeat: "no-repeat",
              maskPosition: "100% 0%",
            }}
          />
        </div>
      ))}
    </div>
  );
}
