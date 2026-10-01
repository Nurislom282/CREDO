"use client";

import { SmoothScroll } from "./SmoothScroll";
import { RouteTransition } from "./RouteTransition";
import { CursorPress } from "./CursorPress";
import { MenuProvider } from "@/components/chrome/Menu";

/**
 * Client-side app shell.
 *
 * RouteTransition sits inside SmoothScroll so it can reach the Lenis instance
 * via context (hash navigation reuses Lenis's easing). The curtain is
 * position:fixed at z-90, so its position in the tree doesn't affect stacking.
 *
 * MenuProvider is inside RouteTransition, not the other way round: the menu
 * overlay navigates through the curtain, so it has to be a descendant of the
 * transition context. RouteTransition itself never reads menu state, so nothing
 * needs the reverse edge.
 */
export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <SmoothScroll>
      <RouteTransition>
        <MenuProvider>{children}</MenuProvider>
      </RouteTransition>
      <CursorPress />
    </SmoothScroll>
  );
}
