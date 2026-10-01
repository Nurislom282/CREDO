"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import { lockScroll } from "@/lib/scroll";
import { useRouteTransition } from "@/components/providers/RouteTransition";

const LINKS = [
  { href: "/#top", label: "Home" },
  { href: "/#projects", label: "Work" },
  { href: "/art-lab", label: "Art Lab" },
] as const;

type MenuApi = {
  open: boolean;
  toggle: () => void;
  close: () => void;
};

const MenuContext = createContext<MenuApi | null>(null);

export function useMenu(): MenuApi {
  const ctx = useContext(MenuContext);
  if (!ctx) throw new Error("useMenu must be used inside <MenuProvider>");
  return ctx;
}

export function MenuProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  const close = useCallback(() => setOpen(false), []);
  const toggle = useCallback(() => setOpen((v) => !v), []);

  // Scrolling the page behind a full-screen overlay is never what you want, and
  // on touch there's no Lenis instance to stop, so lock at the DOM level.
  useEffect(() => {
    lockScroll(open);
    return () => lockScroll(false);
  }, [open]);

  // Escape closes; opening also moves focus in so the overlay is reachable by
  // keyboard without a focus trap round-trip through the whole document.
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, close]);

  const api = useMemo<MenuApi>(() => ({ open, toggle, close }), [open, toggle, close]);

  return (
    <MenuContext.Provider value={api}>
      {children}
      <MenuOverlay />
    </MenuContext.Provider>
  );
}

export function MenuButton({ className }: { className?: string }) {
  const { open, toggle } = useMenu();

  return (
    <button
      type="button"
      onClick={toggle}
      aria-expanded={open}
      aria-controls="site-menu"
      className={className}
    >
      <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>

      {/* Two right-aligned bars that rotate into a cross. The bars are only
          2px tall with an 8px gap, so rotating each about its own centre leaves
          them slightly offset — the extra translate closes that gap. */}
      <span
        aria-hidden="true"
        className={`block h-[2px] w-[calc(40*var(--px))] origin-center bg-ink transition-transform duration-300 ease-out-soft ${
          open ? "translate-y-[5px] rotate-45" : ""
        }`}
      />
      <span
        aria-hidden="true"
        className={`block h-[2px] w-[calc(40*var(--px))] origin-center bg-ink transition-transform duration-300 ease-out-soft ${
          open ? "-translate-y-[5px] -rotate-45" : ""
        }`}
      />
    </button>
  );
}

function MenuOverlay() {
  const { open, close } = useMenu();
  const { navigate } = useRouteTransition();
  const pathname = usePathname();

  // Close whenever the route changes, not just when a menu link is clicked —
  // browser back/forward shouldn't leave the overlay stranded open.
  useEffect(() => {
    close();
  }, [pathname, close]);

  return (
    <div className="pointer-events-none fixed inset-0 z-30 overflow-hidden">
      <div
        id="site-menu"
        tabIndex={-1}
        data-menu=""
        data-state={open ? "open" : "closed"}
        data-lenis-prevent=""
        className="pointer-events-auto absolute inset-0 overflow-y-auto overscroll-contain bg-canvas pt-24 outline-none lg:pt-32"
      >
        <nav aria-label="Main" className="mx-auto w-full max-w-canvas px-margin">
          <ul>
            {LINKS.map((link, index) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  data-menu-item=""
                  style={{ "--menu-i": index } as CSSProperties}
                  className="block py-3 text-[clamp(2rem,4.167vw,3.5rem)] font-medium leading-[1.05] tracking-[-0.015em] text-ink hover:italic"
                  onClick={(event) => {
                    event.preventDefault();
                    close();
                    navigate(link.href);
                  }}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          {/* The contact line sits directly under the list rather than being
              pushed to the bottom of the panel — the overlay is as tall as the
              viewport, not as tall as its content. */}
          <div className="mt-10">
            <a
              href="mailto:pamidordesign@gmail.com"
              data-menu-item=""
              style={{ "--menu-i": LINKS.length } as CSSProperties}
              className="block py-2 text-body text-muted"
            >
              PAMIDORDESIGN@GMAIL.COM
            </a>
          </div>
        </nav>
      </div>
    </div>
  );
}
