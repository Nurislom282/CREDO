"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { useLenis } from "lenis/react";
import { CURTAIN_COVER_MS, CURTAIN_REVEAL_MS, lockScroll } from "@/lib/scroll";
import { usePrefersReducedMotion } from "@/lib/media";

type CurtainState = "idle" | "cover" | "reveal";

type TransitionApi = {
  /** Cover, navigate, then lift. No-ops if a transition is already running. */
  navigate: (href: string) => void;
};

const TransitionContext = createContext<TransitionApi | null>(null);

export function useRouteTransition(): TransitionApi {
  const ctx = useContext(TransitionContext);
  if (!ctx) {
    throw new Error("useRouteTransition must be rendered inside <RouteTransition>");
  }
  return ctx;
}

/** Conditions under which we must not hijack a click. */
function shouldIgnoreClick(event: MouseEvent, anchor: HTMLAnchorElement): boolean {
  if (event.defaultPrevented) return true;
  if (event.button !== 0) return true;
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return true;
  if (anchor.target && anchor.target !== "_self") return true;
  if (anchor.hasAttribute("download")) return true;
  if (anchor.dataset.transition === "none") return true;

  const href = anchor.getAttribute("href");
  if (!href || href.startsWith("#")) return true;
  if (/^(mailto:|tel:|sms:)/.test(href)) return true;

  const url = new URL(anchor.href, window.location.href);
  if (url.origin !== window.location.origin) return true;

  return false;
}

/**
 * Full-page route transitions.
 *
 * A night-coloured curtain wipes over the page (667ms), we navigate while the
 * screen is covered, then lift it (754ms). Because the curtain is opaque for
 * the whole swap the new page can mount and paint however it likes — no
 * cross-fade, no shared-element work, no scrolling while the DOM changes.
 *
 * Three cases, deliberately:
 *   - same path + hash  -> just smooth-scroll; a curtain here would be absurd
 *   - reduced motion    -> plain navigation, no curtain
 *   - otherwise         -> cover / navigate / reveal
 *
 * The sequence is a small state machine rather than chained timeouts, so an
 * interrupted navigation can't strand the curtain half-open.
 */
export function RouteTransition({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const lenis = useLenis();
  const reduced = usePrefersReducedMotion();

  const [state, setState] = useState<CurtainState>("idle");
  const stateRef = useRef<CurtainState>("idle");
  const pendingHref = useRef<string | null>(null);
  // window.setTimeout returns a number; @types/node would make this a Timeout.
  const revealTimer = useRef<number | null>(null);
  const coverTimer = useRef<number | null>(null);
  const busy = useRef(false);

  const setCurtain = useCallback((next: CurtainState) => {
    stateRef.current = next;
    setState(next);
  }, []);

  /** Scroll to a hash target, preferring Lenis so it inherits the easing. */
  const scrollToHash = useCallback(
    (hash: string) => {
      // querySelector is typed as Element; Lenis needs the HTMLElement subtype,
      // and a hash can also match an SVG or non-element node we can't scroll to.
      const target = document.querySelector<HTMLElement>(hash);
      if (!target) return;

      if (lenis) {
        lenis.scrollTo(target, { offset: 0 });
      } else {
        target.scrollIntoView({ block: "start" });
      }
    },
    [lenis],
  );

  const settle = useCallback(() => {
    if (revealTimer.current) clearTimeout(revealTimer.current);
    revealTimer.current = null;
    if (coverTimer.current) clearTimeout(coverTimer.current);
    coverTimer.current = null;

    const hash = pendingHref.current?.includes("#")
      ? `#${pendingHref.current.split("#")[1]}`
      : null;

    busy.current = false;
    pendingHref.current = null;
    setCurtain("idle");

    // Only after the curtain is up: jumping to the anchor while it's still
    // covering the screen would scroll against a locked viewport.
    if (hash) requestAnimationFrame(() => scrollToHash(hash));
  }, [scrollToHash, setCurtain]);

  const navigate = useCallback(
    (href: string) => {
      if (busy.current) return;

      const url = new URL(href, window.location.origin);

      // Already here, just a section jump.
      if (url.pathname === window.location.pathname && url.hash) {
        scrollToHash(url.hash);
        return;
      }

      busy.current = true;
      pendingHref.current = href;

      if (reduced) {
        pendingHref.current = null;
        busy.current = false;
        router.push(href);
        return;
      }

      setCurtain("cover");
      coverTimer.current = window.setTimeout(() => {
        // The new page should start at the top, not where the old one was.
        window.scrollTo(0, 0);
        lockScroll(false);
        router.push(href);
      }, CURTAIN_COVER_MS);
    },
    [router, reduced, scrollToHash, setCurtain],
  );

  // The curtain only lifts once the new pathname has actually committed, so we
  // never expose a half-painted page.
  useEffect(() => {
    if (stateRef.current !== "cover" || !pendingHref.current) return;

    const url = new URL(pendingHref.current, window.location.origin);
    if (window.location.pathname !== url.pathname) return;

    setCurtain("reveal");
    revealTimer.current = window.setTimeout(settle, CURTAIN_REVEAL_MS);
  }, [pathname, settle, setCurtain]);

  // Intercept same-origin link clicks so raw <a> and next/link behave alike.
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const anchor = (event.target as Element | null)?.closest?.(
        "a[href]",
      ) as HTMLAnchorElement | null;
      if (!anchor || shouldIgnoreClick(event, anchor)) return;

      event.preventDefault();
      navigate(anchor.getAttribute("href") as string);
    };

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [navigate]);

  // Never leave the page covered if it's hidden (bfcache, tab switch).
  useEffect(() => {
    const onHide = () => {
      if (stateRef.current !== "idle") settle();
    };
    document.addEventListener("visibilitychange", onHide);
    window.addEventListener("pagehide", onHide);
    return () => {
      document.removeEventListener("visibilitychange", onHide);
      window.removeEventListener("pagehide", onHide);
    };
  }, [settle]);

  const api = useMemo<TransitionApi>(() => ({ navigate }), [navigate]);

  return (
    <TransitionContext.Provider value={api}>
      {children}
      <div data-curtain={state} aria-hidden="true" />
    </TransitionContext.Provider>
  );
}
