"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ElementType,
  type ReactNode,
} from "react";

type RevealProps = {
  children: ReactNode;
  as?: ElementType;
  /** Per-element stagger, in ms. Maps to transition-delay like the original. */
  delay?: number;
  className?: string;
  style?: CSSProperties;
} & Record<string, unknown>;

/**
 * Scroll reveal.
 *
 * The observer's rootMargin cuts off the bottom 12% of the viewport, so an
 * element has to be meaningfully past the fold before it fires — this stops
 * tall elements from revealing while still mostly off-screen. It disconnects
 * after the first hit, so a one-shot animation never re-triggers.
 *
 * Initial state is `waiting`, which carries `transition: none`. That's what
 * makes hydration safe: an element already in view on load is committed at
 * its final position before the observer's first callback can run.
 */
export function Reveal({
  children,
  as,
  delay,
  className,
  style,
  ...rest
}: RevealProps) {
  const Tag = (as ?? "div") as ElementType;
  const ref = useRef<HTMLElement | null>(null);
  const [state, setState] = useState<"waiting" | "shown">("waiting");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setState("shown");
        observer.disconnect();
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.05 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const merged: CSSProperties | undefined = delay
    ? { ...style, transitionDelay: `${delay}ms` }
    : style;

  return (
    <Tag
      ref={ref}
      data-reveal={state}
      className={`reveal${className ? ` ${className}` : ""}`}
      style={merged}
      {...rest}
    >
      {children}
    </Tag>
  );
}
