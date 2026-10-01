"use client";

import { useEffect } from "react";
import { ReactLenis, useLenis } from "lenis/react";
import { LENIS_OPTIONS } from "@/lib/scroll";
import { useSmoothScrollEnabled } from "@/lib/media";

/**
 * Keeps the Lenis instance in sync with the page's scroll locks.
 *
 * Scroll is locked in exactly one place — `document.body.style.overflow` — and
 * the loader marks `<html data-loading>`. Neither of those knows or cares
 * whether Lenis exists, which is the point: the same code has to work on touch,
 * where Lenis is never instantiated.
 *
 * So instead of every component calling `lenis.stop()`, this watches both
 * signals and flips the instance itself. Two things can be observed without
 * polling: a MutationObserver on the attributes, plus a manual sync on mount
 * for locks that were already in place.
 */
function LenisLockSync() {
  const lenis = useLenis();

  useEffect(() => {
    if (!lenis) return;

    const html = document.documentElement;
    const body = document.body;

    const sync = () => {
      if (html.hasAttribute("data-loading") || body.style.overflow === "hidden") {
        lenis.stop();
      } else {
        lenis.start();
      }
    };

    // Catch locks that were already applied before this ran.
    sync();

    const observer = new MutationObserver(sync);
    observer.observe(html, { attributes: true, attributeFilter: ["data-loading"] });
    observer.observe(body, { attributes: true, attributeFilter: ["style"] });

    return () => observer.disconnect();
  }, [lenis]);

  return null;
}

/**
 * Wraps the app in a root Lenis instance on capable devices. On touch or when
 * reduced motion is requested we render children untouched, so the page falls
 * back to native scrolling rather than fighting it.
 */
export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const enabled = useSmoothScrollEnabled();

  if (!enabled) return <>{children}</>;

  return (
    <ReactLenis root options={LENIS_OPTIONS}>
      <LenisLockSync />
      {children}
    </ReactLenis>
  );
}
