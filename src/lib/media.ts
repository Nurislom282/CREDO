"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Media-query hook, SSR-safe.
 *
 * Built on useSyncExternalStore rather than useState + useEffect: matchMedia is
 * an external store, and reading it during render is exactly what that hook is
 * for. The useState version has to setState inside an effect, which triggers a
 * second render pass on every mount — and here that would flash the
 * non-smooth-scrolling layout before swapping to the smooth one.
 *
 * The server snapshot is always false, so the first client render matches SSR
 * and hydration stays clean; the real value arrives on the same commit.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onStoreChange);
      return () => mql.removeEventListener("change", onStoreChange);
    },
    [query],
  );

  const getSnapshot = useCallback(() => window.matchMedia(query).matches, [query]);

  // Must be referentially stable and must not touch `window`.
  const getServerSnapshot = useCallback(() => false, []);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function usePrefersReducedMotion(): boolean {
  return useMediaQuery("(prefers-reduced-motion: reduce)");
}

/** True only for mouse/trackpad. Touch devices fall back to native scrolling. */
export function useFinePointer(): boolean {
  return useMediaQuery("(hover: hover) and (pointer: fine)");
}

/**
 * Lenis is only worth instantiating on a precise pointer that hasn't asked for
 * reduced motion — matching the original's guard exactly.
 */
export function useSmoothScrollEnabled(): boolean {
  const reduced = usePrefersReducedMotion();
  const fine = useFinePointer();
  return fine && !reduced;
}
