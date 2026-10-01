import type { CSSProperties, ElementType, ReactNode } from "react";

type HandwritingProps = {
  /** The string to split. Every glyph becomes its own animated span. */
  text: string;
  as?: ElementType;
  className?: string;
  charClassName?: string;
  /** Keep the sweep permanently on — used for the active project title. */
  on?: boolean;
  /** Resting colour, exposed to the keyframe as --hw-base. */
  baseColor?: string;
  style?: CSSProperties;
  children?: ReactNode;
  /**
   * Spread onto the root element. This is what lets the root BE the link
   * (`as="a" href=…`) instead of nesting an anchor inside a wrapper, which would
   * be invalid and would break keyboard activation.
   */
  rest?: Record<string, unknown>;
};

/**
 * Text that lights up character-by-character on hover.
 *
 * Each glyph carries its own `--hwi` index; the stylesheet turns that into a
 * 16ms-per-character delay, so the sweep reads as handwriting rather than a
 * single colour swap. The index is global to the string, so the flash travels
 * across word boundaries in reading order rather than restarting per word.
 *
 * Words are wrapped in `inline-block whitespace-nowrap` so the browser can only
 * break between them — same trick the original uses, and it keeps a word from
 * splitting mid-sweep.
 *
 * Per-character spans destroy the text for assistive tech, so the wrapper
 * carries the real string as an accessible name and the glyph run is hidden.
 */
export function Handwriting({
  text,
  as,
  className,
  charClassName,
  on,
  baseColor,
  style,
  children,
  rest,
}: HandwritingProps) {
  const Tag = (as ?? "span") as ElementType;
  const rootStyle = {
    ...style,
    ...(baseColor ? { "--hw-base": baseColor } : null),
  } as CSSProperties;

  let index = 0;
  const tokens = text.split(" ");

  return (
    <Tag
      {...rest}
      data-hw=""
      data-hw-on={on ? "true" : undefined}
      aria-label={text}
      className={className}
      style={rootStyle}
    >
      <span aria-hidden="true">
        {tokens.map((word, wordIndex) => (
          <span key={`${word}-${wordIndex}`}>
            {wordIndex > 0 ? " " : null}
            <span className="inline-block whitespace-nowrap">
              {Array.from(word).map((glyph, glyphIndex) => {
                const i = index++;
                return (
                  <span
                    key={`${glyphIndex}-${glyph}`}
                    data-hw-char=""
                    className={`inline-block${charClassName ? ` ${charClassName}` : ""}`}
                    style={{ "--hwi": i } as CSSProperties}
                  >
                    {glyph}
                  </span>
                );
              })}
            </span>
          </span>
        ))}
      </span>
      {children}
    </Tag>
  );
}
