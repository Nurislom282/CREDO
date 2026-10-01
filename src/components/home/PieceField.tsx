"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "@/lib/media";

/**
 * An infinite, draggable plane of pieces.
 *
 * The field never ends. It is one block of tiles repeated across and down, and
 * the block repeats exactly, so the position can be wrapped modulo one block's
 * pitch with nothing visibly jumping. There is no edge to reach.
 *
 * Movement, in order of how a visitor actually reaches for it:
 *   - wheel / trackpad, on a precise pointer, moving the plane
 *   - drag, pointer or touch
 *   - arrow keys, once focused
 *
 * Two decisions that are load-bearing:
 *
 * The wheel is claimed, not ignored. Lenis owns page scrolling, so without this
 * the wheel would scroll the section out of view instead of across it. It only
 * claims wheel on a fine pointer and while the plane is hovered, so scrolling
 * past the section with a mouse still works. The section is also tagged
 * data-lenis-prevent so Lenis never fights the plane for the same gesture.
 *
 * touch-action is pan-y rather than none. `none` would kill native panning and
 * trap anyone on a phone inside a full-viewport section forever, unable to
 * scroll on to the footer. pan-y keeps vertical scrolling to the browser —
 * which is where it belongs, since the plane is a detour, not the page — while
 * horizontal drags still drive the plane.
 */

/** One repeat unit, in tiles. Sized to cover a viewport without wasting DOM. */
const BLOCK_COLS = 4;
const BLOCK_ROWS = 4;

/** Fling decay, per frame. Low enough to settle in roughly half a second. */
const FRICTION = 0.94;
/** Below this speed (px/frame) the fling is over. */
const REST_SPEED = 0.08;

type PieceFieldProps = {
  /**
   * Image paths, relative to /public. Tiles past the end of the list repeat the
   * block, so a short list still fills the plane — but a long one is honoured:
   * the block grows to hold it rather than silently ignoring the extras.
   */
  pieces?: string[];
  /** Used for each piece's alt text, numbered per tile. */
  label: string;
  className?: string;
};

/** Placeholder tints, so an unfilled field still reads as composed. */
const TINTS = [
  "#E8E2D9",
  "#D8D2C6",
  "#2F2B26",
  "#C9552F",
  "#8C8378",
  "#1B1815",
  "#D9A441",
  "#7C8B7A",
] as const;

export function PieceField({ pieces = [], label, className }: PieceFieldProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const planeRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number | null>(null);
  const pos = useRef({ x: 0, y: 0 });
  const speed = useRef({ x: 0, y: 0 });
  const reduced = usePrefersReducedMotion();

  const drag = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
    lastX: number;
    lastY: number;
    /** Per-frame delta as the drag proceeds; the fling inherits these. */
    velX: number;
    velY: number;
    moved: boolean;
  } | null>(null);

  const [pitch, setPitch] = useState(288);

  /**
   * Tiles the block holds: every piece you gave me, or one block's worth while
   * the list is still empty. Derived rather than stored — it is a pure function
   * of `pieces`, so a copy in state would only be a second thing to fall out of
   * sync when the list changes.
   */
  const blockSize = pieces.length || BLOCK_COLS * BLOCK_ROWS;

  /**
   * Pitch is a CSS custom property so tile size responds to breakpoints without
   * this owning a media query. Read back because the wrap period has to match
   * what is actually rendered, or a seam shows at the edge.
   */
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    const measure = () => {
      const parsed = Number.parseFloat(
        getComputedStyle(el).getPropertyValue("--pitch").trim(),
      );
      if (Number.isFinite(parsed) && parsed > 0) setPitch(parsed);
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const cols = Math.min(BLOCK_COLS, Math.max(1, blockSize));
  const rows = Math.ceil(blockSize / BLOCK_COLS);
  const wrapPeriod = pitch * cols;
  const wrapRow = pitch * rows;

  /**
   * Modulo in both axes; the add keeps a negative offset from going negative.
   * The result is in [0, period), so the plane is anchored a full period
   * up-left of the origin (see below) and every offset in that range still
   * covers the viewport.
   */
  const mod = (value: number, period: number) => ((value % period) + period) % period;

  const paint = useCallback(() => {
    const plane = planeRef.current;
    if (!plane) return;
    const { x, y } = pos.current;
    plane.style.transform = `translate3d(${mod(x, wrapPeriod)}px, ${mod(y, wrapRow)}px, 0)`;
  }, [wrapPeriod, wrapRow]);

  useEffect(paint, [paint, pitch, cols, rows]);

  /** Cancel any in-flight momentum frames, leaving the speed untouched. */
  const cancelFling = () => {
    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
  };

  const stopFling = () => {
    cancelFling();
    speed.current = { x: 0, y: 0 };
  };

  const nudge = useCallback(
    (dx: number, dy: number) => {
      stopFling();
      pos.current = { x: pos.current.x + dx, y: pos.current.y + dy };
      paint();
    },
    [paint],
  );

  /**
   * Momentum after release. Skipped entirely under reduced motion, where a
   * plane that keeps travelling is exactly the kind of unrequested movement
   * that preference is asking us not to do.
   */
  const fling = useCallback(() => {
    // Cancel only the previous frames. Clearing the speed here would wipe the
    // release velocity set immediately before this call, and the plane would
    // stop dead the instant you let go.
    cancelFling();
    if (reduced) return;

    const step = () => {
      const current = speed.current;
      if (Math.abs(current.x) < REST_SPEED && Math.abs(current.y) < REST_SPEED) {
        stopFling();
        return;
      }
      pos.current = {
        x: pos.current.x + current.x,
        y: pos.current.y + current.y,
      };
      current.x *= FRICTION;
      current.y *= FRICTION;
      paint();
      frameRef.current = requestAnimationFrame(step);
    };

    frameRef.current = requestAnimationFrame(step);
  }, [paint, reduced]);

  useEffect(() => stopFling, []);

  /**
   * Velocity of the current drag, tracked as the plane moves rather than read
   * on release. Reading it on pointerup returns zero every time — by then the
   * pointer has already stopped, so the last delta is null — and the fling dies
   * at the cursor instead of carrying. Kept in drag state so the value survives
   * to endDrag.
   */
  const trackVelocity = (event: React.PointerEvent<HTMLDivElement>) => {
    const active = drag.current;
    if (!active || active.pointerId !== event.pointerId) return;
    active.velX = event.clientX - active.lastX;
    active.velY = event.clientY - active.lastY;
    active.lastX = event.clientX;
    active.lastY = event.clientY;
  };

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    const plane = planeRef.current;
    if (!plane) return;

    stopFling();
    drag.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: pos.current.x,
      originY: pos.current.y,
      lastX: event.clientX,
      lastY: event.clientY,
      velX: 0,
      velY: 0,
      moved: false,
    };
    plane.setPointerCapture(event.pointerId);
    plane.style.willChange = "transform";
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const active = drag.current;
    if (!active || active.pointerId !== event.pointerId) return;

    if (
      !active.moved &&
      Math.abs(event.clientX - active.startX) < 3 &&
      Math.abs(event.clientY - active.startY) < 3
    ) {
      return;
    }
    active.moved = true;
    trackVelocity(event);

    pos.current = {
      x: active.originX + (event.clientX - active.startX),
      y: active.originY + (event.clientY - active.startY),
    };
    paint();
  };

  const endDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    const active = drag.current;
    if (!active || active.pointerId !== event.pointerId) return;
    drag.current = null;

    const plane = planeRef.current;
    if (plane?.hasPointerCapture(event.pointerId)) {
      plane.releasePointerCapture(event.pointerId);
      plane.style.willChange = "auto";
    }

    if (active.moved && (active.velX !== 0 || active.velY !== 0)) {
      // Half the last frame's travel: the release sample is one frame old by the
      // time it is read, and carrying it in full reads as a throw rather than a
      // release.
      speed.current = { x: active.velX * 0.5, y: active.velY * 0.5 };
      fling();
    }
  };

  /**
   * Wheel drives the plane rather than the page. Registered passively because
   * preventDefault needs a non-passive listener, and the wheel only matters over
   * the plane — there is no scrollable ancestor here to break.
   */
  useEffect(() => {
    const plane = planeRef.current;
    if (!plane) return;

    const onWheel = (event: WheelEvent) => {
      // A zoom gesture (ctrl+wheel / pinch) belongs to the browser.
      if (event.ctrlKey) return;
      event.preventDefault();
      stopFling();
      pos.current = {
        x: pos.current.x + event.deltaX,
        y: pos.current.y + event.deltaY,
      };
      paint();
    };

    plane.addEventListener("wheel", onWheel, { passive: false });
    return () => plane.removeEventListener("wheel", onWheel);
  }, [paint]);

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const step = pitch / 2;
    const moves: Record<string, [number, number]> = {
      ArrowLeft: [-step, 0],
      ArrowRight: [step, 0],
      ArrowUp: [0, -step],
      ArrowDown: [0, step],
    };
    const move = moves[event.key];
    if (!move) return;
    // Only once focused, or the page could never scroll past the section.
    event.preventDefault();
    nudge(move[0], move[1]);
  };

  // Repeat the block far enough right and down to cover the viewport plus the
  // wrap margin, whatever the block's size and the current pitch.
  const repeatsX = Math.max(2, Math.ceil(1728 / wrapPeriod) + 1);
  const repeatsY = Math.max(2, Math.ceil(900 / wrapRow) + 1);

  /**
   * Tiles sit on an explicit grid of `cols` columns, never on flex-wrap.
   * Wrapping by width only looks right while the plane happens to fit a whole
   * block per line; as soon as it does not, blocks straddle row boundaries and
   * every repeat sits at a different offset from the last. The plane stops
   * being periodic, so the modulo wrap lands on positions that were never tiled
   * — blank bands and pieces vanishing mid-drag. An explicit grid keeps the
   * block pitch exact at any plane width.
   */
  const totalCols = cols * repeatsX;
  const totalRows = rows * repeatsY;
  const tiles: { src?: string; key: string; index: number }[] = [];

  for (let row = 0; row < totalRows; row++) {
    for (let col = 0; col < totalCols; col++) {
      // A tile's piece comes from its position inside the block, so every repeat
      // is identical — which is the whole reason the wrap is seamless.
      const index = (row % rows) * cols + (col % cols);
      tiles.push({
        index,
        src: pieces.length ? pieces[index % pieces.length] : undefined,
        key: `${row}-${col}`,
      });
    }
  }

  return (
    <div
      ref={wrapRef}
      style={{ "--pitch": "288px" } as React.CSSProperties}
      data-lenis-prevent
      onKeyDown={onKeyDown}
      className={`relative h-[80dvh] min-h-[440px] w-full touch-pan-y overflow-hidden bg-canvas outline-none [--pitch:150px] sm:[--pitch:200px] lg:[--pitch:288px] lg:h-[calc(860*var(--px))] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ink ${className ?? ""}`.trim()}
    >
      <p className="sr-only" id="piece-field-help">
        An endless arrangement of work. Scroll, drag, or use the arrow keys to
        move the plane.
      </p>

      <div
        ref={planeRef}
        role="application"
        aria-label={label}
        aria-describedby="piece-field-help"
        tabIndex={0}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        className="absolute grid cursor-grab touch-pan-y active:cursor-grabbing"
        style={{
          // Anchored a full period up-left of the origin. Because the offset is
          // always in [0, period), the plane spans [offset - period, offset - period
          // + size] and so always straddles the viewport — anchored at 0 instead,
          // any non-zero offset walks the top-left corner into a blank band and
          // tiles appear to vanish as you drag toward them.
          left: -wrapPeriod,
          top: -wrapRow,
          width: totalCols * pitch,
          gridTemplateColumns: `repeat(${totalCols}, ${pitch}px)`,
          gridTemplateRows: `repeat(${totalRows}, ${pitch}px)`,
        }}
      >
        {tiles.map((tile) => (
          <div key={tile.key} className="p-[calc(12*var(--px))]">
            <div
              className="relative h-full w-full overflow-hidden"
              style={{ backgroundColor: TINTS[tile.index % TINTS.length] }}
            >
              {tile.src ? (
                /* Plain <img>, not next/image: the plane is a transformed,
                   tile-dense grid where `fill` cannot apply, and dozens of
                   pieces each paying a trip through the optimizer buys nothing
                   the browser's own decode does not already do. */
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={tile.src}
                  alt={`${label} ${tile.index + 1}`}
                  draggable={false}
                  decoding="async"
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : null}
            </div>
          </div>
        ))}
      </div>

      <p
        aria-hidden="true"
        className="pointer-events-none absolute bottom-6 left-6 text-label text-muted"
      >
        Scroll · Drag · Arrow keys
      </p>
    </div>
  );
}