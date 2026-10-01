import type { LenisOptions } from "lenis";

/**
 * Site-wide scroll config, lifted from the original's bundle.
 *
 * Note it uses `lerp` (exponential damping), NOT `duration` + `easing` —
 * giving both makes Lenis throw. At lerp .12 a 1000px flick settles in roughly
 * 400ms with no overshoot, which is what the page's parallax math assumes.
 */
export const LENIS_OPTIONS: LenisOptions = {
  lerp: 0.12,
  smoothWheel: true,
  syncTouch: false,
  anchors: true,
  autoRaf: true,
  stopInertiaOnNavigate: true,
};

/** Durations mirrored from styles/motion.css, in ms. */
export const CURTAIN_COVER_MS = 667;
export const CURTAIN_REVEAL_MS = 754;

/**
 * Locks page scroll by setting `overflow: hidden` on <body>.
 *
 * That is deliberately the *only* thing this does. Nothing here reaches into
 * Lenis: `SmoothScroll` owns a MutationObserver that watches both
 * `html[data-loading]` and this inline style, and drives `lenis.stop()` /
 * `lenis.start()` itself. Lenis then adds `lenis-stopped`, which its own
 * stylesheet turns into `overflow: clip`.
 *
 * Keeping body overflow as the single source of truth means the loader, the
 * menu and the route curtain can all lock scroll without knowing whether a
 * Lenis instance exists — and on touch, where there is none, `overflow: hidden`
 * is the actual lock.
 */
export function lockScroll(locked: boolean) {
  if (locked) {
    document.body.style.overflow = "hidden";
  } else {
    document.body.style.removeProperty("overflow");
  }
}
