"use client";

import { useEffect } from "react";

/**
 * Drives the pressed state of the crosshair cursor.
 *
 * The CSS swaps in the `cursor-click` sprite whenever <html> carries
 * data-cursor="down". We also clear it on blur/visibilitychange, otherwise a
 * pointerup that lands outside the window leaves the cursor stuck "pressed".
 */
export function CursorPress() {
  useEffect(() => {
    const root = document.documentElement;
    const press = () => root.setAttribute("data-cursor", "down");
    const release = () => root.removeAttribute("data-cursor");

    window.addEventListener("pointerdown", press);
    window.addEventListener("pointerup", release);
    window.addEventListener("pointercancel", release);
    window.addEventListener("blur", release);
    document.addEventListener("visibilitychange", release);

    return () => {
      window.removeEventListener("pointerdown", press);
      window.removeEventListener("pointerup", release);
      window.removeEventListener("pointercancel", release);
      window.removeEventListener("blur", release);
      document.removeEventListener("visibilitychange", release);
    };
  }, []);

  return null;
}
