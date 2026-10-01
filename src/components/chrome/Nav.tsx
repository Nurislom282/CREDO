"use client";

import Image from "next/image";
import Link from "next/link";
import { MenuButton } from "@/components/chrome/Menu";

/**
 * Site header: wordmark left, menu trigger right.
 *
 * The trigger is two bars that morph into a cross when the menu is open — the
 * transform is done in CSS off the `open` variant rather than with JS state, so
 * it stays in step with the overlay's own transition.
 *
 * Hit areas are deliberately larger than the artwork (44px on the logo,
 * 56×~34px on the trigger) while the negative margins pull the visible pixels
 * back onto the layout grid, so the bar can stay optically flush with the
 * margin without the padding shifting type.
 *
 * The wordmark is a raster-free SVG with its colour baked into the paths, so
 * picking the right file is what sets it black: the header sits on the light
 * canvas and uses the ink variant, while the footer keeps the light one.
 */
export function Nav() {
  return (
    <div data-nav-intro="" className="relative z-40 w-full lg:flex lg:h-[8.2%] lg:items-center">
      <div className="relative mx-auto w-full max-w-canvas px-6 sm:px-10 lg:px-margin">
        <nav className="flex items-center justify-between pt-8 lg:h-[calc(26*var(--px))] lg:pt-0">
          <Link
            href="/"
            aria-label="Pamidor Studio — home"
            className="-my-2 -ml-2 inline-flex min-h-[calc(44*var(--px))] items-center px-2 text-body-lg"
          >
            <Image
              src="/images/wordmark-pamidor-studio-ink.svg"
              alt="Pamidor Studio"
              width={120}
              height={40}
              className="h-[0.691em] w-auto"
              priority
            />
          </Link>

          <MenuButton className="-my-4 -mr-2 flex w-[calc(56*var(--px))] flex-col items-end justify-center gap-[8px] px-2 py-4" />
        </nav>
      </div>
    </div>
  );
}
