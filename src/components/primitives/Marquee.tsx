import type { CSSProperties, ReactNode } from "react";

type MarqueeProps = {
  children: ReactNode;
  /** Seconds for one full -50% pass. Speed is a per-instance design decision. */
  duration?: number;
  className?: string;
  /** Layout for one copy of the content. Must be non-shrinking. */
  halfClassName?: string;
  style?: CSSProperties;
};

/**
 * Infinite horizontal marquee.
 *
 * The content is rendered twice and the track is shifted by exactly -50%, so
 * when the animation loops the second copy lands pixel-identically where the
 * first began. The duplicate is aria-hidden: a screen reader should hear the
 * list once, not twice.
 *
 * Because the two copies are independent React subtrees, `children` must be
 * free of per-instance ids/refs that would collide when duplicated.
 */
export function Marquee({
  children,
  duration = 28,
  className,
  halfClassName = "flex shrink-0 items-center",
  style,
}: MarqueeProps) {
  return (
    <div className={`marquee-wrapper${className ? ` ${className}` : ""}`} style={style}>
      <div
        className="marquee-track"
        style={{ "--marquee-duration": `${duration}s` } as CSSProperties}
      >
        <div className={halfClassName}>{children}</div>
        <div className={halfClassName} aria-hidden="true">
          {children}
        </div>
      </div>
    </div>
  );
}
