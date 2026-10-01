import Image from "next/image";

import { Reveal } from "@/components/primitives/Reveal";

/**
 * Static grid of pieces, for work that reads as a set rather than a plane.
 *
 * The counterpart to PieceField: same `pieces` contract, but laid out in the
 * normal document flow so the page scrolls, scans and prints like the rest of
 * the site. Both render `next/image`, since these are raster exports and there
 * is no SVG-optimiser problem here.
 *
 * The grid is sized in --px like every other section, so it tracks the same
 * 1728x680 artboard the tokens are authored against rather than drifting to
 * rem-based defaults on wide screens.
 */
export function PieceGrid({
  pieces,
  label,
}: {
  pieces: string[];
  /** Used for alt text; a decorative grid would pass an empty string. */
  label: string;
}) {
  if (pieces.length === 0) return null;

  return (
    <section className="relative w-full bg-canvas pb-16 lg:pb-[calc(64*var(--px))]">
      <div className="relative mx-auto w-full max-w-canvas px-6 sm:px-10 lg:px-margin">
        <ul className="grid grid-cols-1 gap-x-[calc(24*var(--px))] gap-y-[calc(40*var(--px))] sm:grid-cols-2 lg:grid-cols-3">
          {pieces.map((src, index) => {
            return (
              <Reveal as="li" key={`${src}-${index}`} delay={index * 60} className="min-w-0">
                <figure className="group">
                  <div className="relative aspect-square w-full overflow-hidden bg-rule/40">
                    <Image
                      src={src}
                      alt={`${label} — ${index + 1}`}
                      fill
                      sizes="(min-width: 1080px) 33vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover transition-transform duration-500 ease-out-soft group-hover:scale-[1.02]"
                    />
                  </div>

                  {/*
                      The caption sits under the image rather than over it, so a
                      logo with a light or transparent background is never read
                      against whatever happens to be behind it.
                  */}
                  <figcaption className="mt-4 flex items-baseline gap-3 text-label text-muted">
                    <span className="tabular-nums text-ink">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="truncate">{label}</span>
                  </figcaption>
                </figure>
              </Reveal>
            );
          })}
        </ul>
      </div>
    </section>
  );
}