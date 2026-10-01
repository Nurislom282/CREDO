"use client";

import { useEffect, useRef, type CSSProperties, type ElementType } from "react";

type DoorNameProps = {
  /**
   * The word to render. Only the exact string "Dor" gets the door treatment —
   * that word is the joke. Anything else degrades to plain text, which is what
   * the original does rather than mangling arbitrary input.
   */
  text: string;
  as?: ElementType;
  className?: string;
  style?: CSSProperties;
};

/**
 * The site's central gag: "Dor" keeps turning into "Door".
 *
 * The word is emitted as three runs — "D", <.door-add>, "r" — where .door-add
 * is a zero-width inline-block whose ::before supplies the letter "o". Because
 * the box never takes layout space, inserting it would normally overlap the
 * "r", so the "r" (as .door-give) is simultaneously slid right by exactly one
 * "o" width. Both are on the same 5s loop, so the pair reads as a door opening
 * and closing rather than as two independent animations.
 *
 * --door-o has to be measured rather than guessed: it is the rendered advance
 * width of a single "o" in the current font at the current size, and --px
 * rescales the whole layout. Measuring the difference between the word with and
 * without the "o" gives it directly, and a ResizeObserver keeps it correct
 * across viewport changes, zoom and font swaps.
 */
export function DoorName({ text, as, className, style }: DoorNameProps) {
  const Tag = (as ?? "h2") as ElementType;
  const ref = useRef<HTMLElement | null>(null);

  const isDoor = text === "Dor";

  useEffect(() => {
    const el = ref.current;
    if (!el || !isDoor) return;

    // A throwaway span sharing the element's typography, so the two widths are
    // measured with identical font/size/tracking. Fixed-positioned and pinned to
    // the viewport origin: an absolute probe left at its static position sits
    // just past the footer, and its line box then counts toward the document's
    // scroll height, which is 89px too tall.
    const probe = document.createElement("span");
    probe.style.position = "fixed";
    probe.style.top = "0";
    probe.style.left = "0";
    probe.style.visibility = "hidden";
    probe.style.pointerEvents = "none";
    probe.style.whiteSpace = "pre";
    probe.style.font = getComputedStyle(el).font;
    probe.style.letterSpacing = getComputedStyle(el).letterSpacing;

    // "Dor" is one "o" narrower than "Door" once .door-add collapses to 0.
    // A difference of two measurements cancels out kerning between the
    // surrounding letters, so what is left is the bare advance width of "o".
    const measure = () => {
      probe.textContent = "Door";
      const withO = probe.getBoundingClientRect().width;
      probe.textContent = "Dor";
      const withoutO = probe.getBoundingClientRect().width;

      el.style.setProperty("--door-o", `${withO - withoutO}px`);
      el.setAttribute("data-door-open", "");
    };

    // Attached to <body>, never to `el`: the probe's text is part of its
    // parent's textContent, and the word is read as text by assistive tech and
    // by copy-paste. Body is always in the document, which is the only thing the
    // measurement actually needs. It stays put for the life of the observer and
    // is removed on cleanup.
    document.body.appendChild(probe);
    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(el);

    return () => {
      observer.disconnect();
      probe.remove();
      el.removeAttribute("data-door-open");
    };
  }, [text, isDoor]);

  if (!isDoor) {
    return (
      <Tag ref={ref} className={className} style={style}>
        {text}
      </Tag>
    );
  }

  return (
    <Tag ref={ref} className={className} style={style}>
      D
      <span className="door-add" />
      <span className="door-give inline-block">r</span>
    </Tag>
  );
}

type DoorWordProps = {
  /** The full word to render, e.g. "DOOR". Must end with the two leaves. */
  text: string;
  className?: string;
};

/**
 * The other door: a whole word whose letters open and close.
 *
 * Where DoorName hides a letter inside a zero-width box, this one renders the
 * word with an EXTRA letter between the base and the final one — "DO" + "O" +
 * "R" reads as "DOOOR" — and the animation removes the extra "O" by pinching it
 * to zero width (door-shut) while sliding the trailing "R" back over the gap
 * (door-slide). The word therefore reads "DOOR" and shivers.
 *
 * So the rendered text is deliberately one letter longer than the word. The
 * accessible name is the real word, and the decorative leaves are hidden, so
 * assistive tech announces "DOOR" rather than "DOOOR".
 *
 * --door-o is the advance width of one leaf letter and is measured rather than
 * hard-coded, since it depends on font size and --px rescaling.
 */
export function DoorWord({ text, className }: DoorWordProps) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const leafRef = useRef<HTMLSpanElement | null>(null);
  const leaf = text.slice(text.length - 2, text.length - 1);
  const tail = text.slice(text.length - 1);

  useEffect(() => {
    const el = ref.current;
    const leafEl = leafRef.current;
    if (!el || !leafEl) return;

    // No probe needed: the leaf is already rendered and in the flow, and its
    // advance width *is* the value --door-o wants. Measuring the real element
    // also means the value can never disagree with what is on screen.
    const measure = () => {
      el.style.setProperty("--door-o", `${leafEl.getBoundingClientRect().width}px`);
      el.setAttribute("data-door", "");
    };

    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(el);

    return () => {
      observer.disconnect();
      el.removeAttribute("data-door");
    };
  }, [leaf]);

  return (
    <span
      ref={ref}
      aria-label={text}
      className={`inline-block whitespace-nowrap${className ? ` ${className}` : ""}`}
    >
      <span aria-hidden="true">
        {text.slice(0, text.length - 2)}
        <span ref={leafRef} className="door-o inline-block">
          {leaf}
        </span>
        <span className="door-r inline-block">{tail}</span>
      </span>
    </span>
  );
}
