"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const INTRO_FRAMES = [
  "/images/intro/chip-1.png",
  "/images/intro/chip-2.jpg",
  "/images/intro/chip-3.jpg",
  "/images/intro/chip-4.jpg",
  "/images/intro/chip-5.png",
  "/images/intro/chip-6.png",
  "/images/intro/chip-7.png",
  "/images/intro/chip-8.png",
  "/images/intro/chip-9.png",
] as const;

const FRAMES = INTRO_FRAMES.length;

/** Sequence beats, in ms. Kept as data so the timing reads as a storyboard. */
const BEAT = {
  chipOpen: 420,
  framesStart: 600,
  frameStep: 450,
  lettersOut: 4800,
  fadeOut: 5300,
} as const;

/** Production's curve, spelled out because it has to live in an inline style. */
const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

/**
 * The word is set as two groups, CRE then DO, with the chip between them.
 */
const LETTER_GROUPS = [["C", "R", "E"], ["D", "O"]] as const;

/**
 * Per-frame pose, in the order the frames crossfade.
 */
const FRAME_POSE = [
  { scale: 1, turn: 0, lift: 0 },
  { scale: 1.07, turn: -2.4, lift: -1.8 },
  { scale: 0.98, turn: 1.6, lift: 1.4 },
  { scale: 1.04, turn: -1.1, lift: 1.2 },
  { scale: 0.96, turn: 2.2, lift: -1.5 },
  { scale: 1.08, turn: -2.8, lift: 1.6 },
  { scale: 0.97, turn: 1.8, lift: -1.2 },
  { scale: 1.05, turn: -1.9, lift: 2.0 },
  { scale: 1.02, turn: 2.5, lift: -1.1 },
] as const;

/**
 * Intro overlay for the home page.
 */
export function Loader() {
  const [chipOpen, setChipOpen] = useState(false);
  const [frame, setFrame] = useState(0);
  const [out, setOut] = useState(false);

  /**
   * Whether the intro has already been handled, decided during render rather
   * than in the effect below.
   */
  const [gone, setGone] = useState(
    () => typeof document !== "undefined" && !document.documentElement.hasAttribute("data-loading"),
  );

  const skipIntro = useRef(gone);

  useEffect(() => {
    if (skipIntro.current) return;

    const root = document.documentElement;

    const timers: number[] = [];
    const at = (ms: number, fn: () => void) => {
      timers.push(window.setTimeout(fn, ms));
    };

    at(BEAT.chipOpen, () => setChipOpen(true));

    // Crossfade the chip's image stack one frame at a time.
    for (let step = 0; step < FRAMES; step++) {
      at(BEAT.framesStart + step * BEAT.frameStep, () => setFrame(step));
    }

    at(BEAT.lettersOut, () => setOut(true));
    at(BEAT.fadeOut, () => {
      // Clearing the attribute is what releases the hero entrance.
      root.removeAttribute("data-loading");
      setOut(true);
    });
    at(BEAT.fadeOut + 420, () => setGone(true));

    return () => timers.forEach(clearTimeout);
  }, []);

  if (gone) return null;

  const glyph = (char: string, index: number) => (
    <span key={char} className="-mx-[0.06em] block overflow-hidden px-[0.06em]">
      <span
        className="block will-change-transform"
        style={{
          animation: out
            ? `loader-letter-out 400ms ${EASE} ${index * 45}ms both`
            : `loader-letter-in 620ms ${EASE} ${index * 45}ms both`,
        }}
      >
        {char}
      </span>
    </span>
  );

  return (
    <div
      data-intro=""
      data-state={out ? "out" : undefined}
      aria-hidden="true"
      className="fixed inset-0 z-[70] flex items-center justify-center bg-canvas"
    >
      <div
        className="flex items-center gap-[0.06em] font-medium leading-none tracking-[-0.03em] text-ink"
        style={{ fontSize: "clamp(min(3rem, calc((100vw - 48px) / 5.433)), 9vw, 8rem)" }}
      >
        {LETTER_GROUPS[0].map((char, index) => glyph(char, index))}

        {/* The chip is the aperture between CRE and DO: a window that widens
            onto the intro frames. Height is fixed in em so the frames always
            have a box to fill; only the width animates. */}
        <span
          data-intro-chip=""
          data-open={chipOpen ? "true" : "false"}
          className="relative block shrink-0 overflow-hidden"
        >
          <span
            data-intro-chip-inner=""
            className="absolute left-1/2 top-0 block"
            style={{
              width: "1.3148148em",
              height: "1.508em",
              animation: `loader-chip 360ms ${EASE} 420ms both`,
            }}
          >
            {INTRO_FRAMES.map((src, index) => (
              <Image
                key={src}
                src={src}
                alt=""
                fill
                sizes="16rem"
                data-on={frame === index ? "true" : "false"}
                className="object-cover"
                priority
                style={
                  {
                    "--pose-scale": FRAME_POSE[index]?.scale ?? 1,
                    "--pose-turn": `${FRAME_POSE[index]?.turn ?? 0}deg`,
                    "--pose-lift": `${FRAME_POSE[index]?.lift ?? 0}%`,
                  } as React.CSSProperties
                }
              />
            ))}
          </span>
        </span>

        {LETTER_GROUPS[1].map((char, index) => glyph(char, LETTER_GROUPS[0].length + index))}
      </div>
    </div>
  );
}
