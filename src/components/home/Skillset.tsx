"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

type Skill = {
  n: string;
  title: string;
  body: string;
  /** Preview shown in the cursor follower while this row is hovered. */
  preview: string;
};

const SKILLS: Skill[] = [
  {
    n: "01",
    title: "Graphic Design",
    body: "Visual systems, brand marks and graphic assets designed for high impact across media.",
    preview: "/images/both.png",
  },
  {
    n: "02",
    title: "Product Design",
    body: "From “we have an idea” to flows, prototypes and systems ready to grow.",
    preview: "/images/photoshop.png",
  },
  {
    n: "03",
    title: "UX | UI",
    body: "Clear interfaces for real behavior, weird edge cases and every screen in between.",
    preview: "/images/figma.png",
  },
  {
    n: "04",
    title: "3D",
    body: "3D visuals and motion that explain, elevate and occasionally steal the show.",
    preview: "/images/blender.png",
  },
];

/**
 * Dark skillset list.
 *
 * Each row is a 5-column grid: index, title spanning two columns, and the
 * description spanning two. The title carries a large negative left margin to
 * pull it back under the index, which is what makes the list read as an
 * indented definition list rather than a table.
 *
 * Hovering a row floats a project preview that tracks the cursor. The follower
 * is position:fixed and written with translate3d so it moves on the compositor
 * rather than triggering layout, and it is centre-anchored with
 * translate(-50%,-50%) baked into the same transform.
 *
 * The originals pair these previews with a muted looping video on the 3D row and
 * source them from the individual case-study folders; the local set is reused
 * here until those are pulled in.
 */
export function Skillset() {
  const [active, setActive] = useState<number | null>(null);
  const listRef = useRef<HTMLUListElement | null>(null);
  const followerRef = useRef<HTMLDivElement | null>(null);
  /** Pointer position, and the position the follower is easing towards. */
  const target = useRef({ x: 0, y: 0 });
  const eased = useRef({ x: 0, y: 0 });

  const onMove = useCallback((event: React.PointerEvent) => {
    target.current.x = event.clientX;
    target.current.y = event.clientY;
  }, []);

  /**
   * Scroll-linked row reveal.
   *
   * Progress is measured from the list's own top edge rather than from an
   * IntersectionObserver, so it is continuous: a row that is 40% revealed keeps
   * easing as you keep scrolling instead of snapping once it crosses a
   * threshold. Each row is then given its own slice of that progress
   * (progress * rowCount - index) so the four cascade, and the slice is run
   * through a cubic ease-out so rows decelerate into place instead of sliding
   * linearly. Rows translate in from the right and fade up; the divider under
   * each row scales in from its right edge, which is why the rules appear to be
   * wiped on rather than faded.
   */
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const rows = Array.from(list.children).map((row) => row.firstElementChild);
    const rules = Array.from(list.children).map((row) => row.lastElementChild);
    const count = rows.length;
    let frame = 0;
    let queued = false;

    const paint = () => {
      queued = false;
      const rect = list.getBoundingClientRect();
      const progress = clamp01((0.78 * window.innerHeight - rect.top) / (0.72 * window.innerHeight));

      for (let i = 0; i < count; i++) {
        const eased2 = 1 - Math.pow(1 - clamp01(progress * count - i), 3);
        const row = rows[i] as HTMLElement;
        const rule = rules[i] as HTMLElement;
        row.style.transform = `translate3d(${((1 - eased2) * 28).toFixed(2)}%, 0, 0)`;
        row.style.opacity = String(eased2);
        rule.style.transform = `scaleX(${eased2.toFixed(3)})`;
        rule.style.transformOrigin = "right";
      }
    };

    // Coalesce scroll bursts into one frame; a wheel tick fires far more often
    // than the compositor can paint, and each row writes four inline styles.
    const schedule = () => {
      if (queued) return;
      queued = true;
      frame = requestAnimationFrame(paint);
    };

    paint();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, []);

  /**
   * Cursor follower damping.
   *
   * The preview trails the pointer instead of tracking it exactly, and banks
   * into the direction of travel — the rotation is derived from the change in
   * the eased position, not the raw one, so it stays smooth when the pointer
   * jumps. Capped at ±14deg because an uncapped bank reads as a glitch.
   */
  useEffect(() => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    const tick = () => {
      const el = followerRef.current;
      if (el) {
        const { x, y } = eased.current;
        eased.current.x += (target.current.x - x) * 0.12;
        eased.current.y += (target.current.y - y) * 0.12;
        const bank = Math.max(-14, Math.min(14, (eased.current.x - x) * 0.22));
        el.style.transform = `translate3d(${eased.current.x}px, ${eased.current.y}px, 0) translate(-50%, -50%) rotate(${bank}deg)`;
      }
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <section
      id="skillset"
      data-cursor-invert=""
      className="relative flex min-h-[100svh] w-full flex-col justify-center bg-night py-16 lg:py-32"
    >
      <div className="relative mx-auto w-full max-w-canvas px-6 sm:px-10 lg:px-margin">
        <h2 className="text-section font-medium text-canvas">Skillset</h2>

        <div className="mt-8 h-[1.5px] w-full bg-[var(--night-hr)] lg:mt-[calc(38*var(--px))]" />

        <ul className="overflow-hidden" ref={listRef}>
          {SKILLS.map((skill, index) => (
            <li
              key={skill.n}
              onPointerEnter={() => setActive(index)}
              onPointerLeave={() => setActive(null)}
              onPointerMove={onMove}
            >
              <div className="will-change-transform">
                <div className="grid grid-cols-1 items-baseline gap-y-3 py-7 transition-opacity duration-300 lg:h-[calc(160*var(--px))] lg:grid-cols-5 lg:gap-0 lg:py-0 lg:pt-[calc(56*var(--px))] lg:opacity-100">
                  <span className="text-label text-night-muted lg:pt-[calc(10*var(--px))] lg:text-body">
                    {skill.n}
                  </span>
                  <span className="text-subhead font-medium text-canvas lg:col-span-2 lg:-ml-[calc(152*var(--px))]">
                    {skill.title}
                  </span>
                  <span className="max-w-[46ch] text-body text-night-body lg:col-span-2 lg:max-w-none lg:pt-[calc(12*var(--px))]">
                    {skill.body}
                  </span>
                </div>
              </div>
              <div className="h-[1.5px] w-full bg-[var(--night-hr)]" />
            </li>
          ))}
        </ul>
      </div>

      {/* Cursor follower. pointer-events-none so it can never eat a hover. */}
      <div
        ref={followerRef}
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-30 will-change-transform"
        style={{ transform: "translate3d(0px, 0px, 0px) translate(-50%, -50%) rotate(0deg)" }}
      >
        {SKILLS.map((skill, index) => (
          <div
            key={skill.n}
            className={`absolute left-0 top-0 h-[calc(220*var(--px))] w-[calc(320*var(--px))] -translate-x-1/2 -translate-y-1/2 overflow-hidden transition-[opacity,transform] duration-[450ms] ease-out-soft ${
              active === index ? "scale-100 opacity-100" : "scale-90 opacity-0"
            }`}
          >
            <Image src={skill.preview} alt="" fill sizes="320px" className="object-cover" />
          </div>
        ))}
      </div>
    </section>
  );
}
