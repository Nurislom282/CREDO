/**
 * Contact call-to-action.
 *
 * Despite the id, this section carries no headline. Production's is a full
 * viewport of deliberate emptiness with the contact route and the studio's
 * one-line positioning statement anchored to the foot of it, so the only
 * things on screen are the two things you can act on. The oversized "DOOR"
 * wordmark from earlier drafts belongs to the hero, not here.
 *
 * The reel plays behind all of it, full-bleed. The attributes are the browser
 * autoplay contract rather than a preference: every current browser refuses to
 * start video with sound without a user gesture, so `muted` is what makes
 * `autoPlay` work at all, and `playsInline` stops iOS Safari promoting it to a
 * fullscreen player — its own gate on autoplay there. `loop` is the only reason
 * a ten-second clip can sit here indefinitely.
 *
 * Nothing in the frames carries information the surrounding copy does not, so
 * the video is hidden from assistive tech and has no controls: there is nothing
 * to play, pause or seek.
 */
export function Signature() {
  return (
    <section id="signature" className="relative w-full overflow-hidden bg-canvas">
      <div className="relative h-[100dvh] w-full max-sm:h-auto max-sm:min-h-[calc(380*var(--px))] sm:min-h-[calc(560*var(--px))]">
        <video
          aria-hidden="true"
          autoPlay
          muted
          loop
          playsInline
          controls={false}
          disablePictureInPicture
          className="absolute inset-0 h-full w-full object-cover"
        >
          <source
            src="/videos/Logo_rotating_in_studio_space_20261001153132.mp4"
            type="video/mp4"
          />
        </video>

        {/* Ink copy sits directly on the footage, so it needs a floor to stand
            on: the same edge-to-edge fade into canvas the client-logo rows use
            in BioWave. Without it the text is at the mercy of whichever frame
            happens to be playing underneath it. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[62%] bg-gradient-to-t from-canvas via-canvas/85 to-transparent"
        />

        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10">
          <div className="relative mx-auto w-full max-w-canvas px-6 sm:px-10 lg:px-margin">
            <div className="pb-8 sm:pb-12 lg:pb-[calc(92*var(--px))]">
              <a
                href="#top"
                aria-label="Back to top"
                className="pointer-events-auto inline-flex h-[calc(52*var(--px))] w-[calc(52*var(--px))] items-center justify-center border border-ink text-ink transition-[background-color,color] duration-300 ease-out-soft hover:bg-ink hover:text-canvas"
              >
                <span className="-rotate-45">
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 16 16"
                    fill="currentColor"
                    className="h-4 w-4 shrink-0"
                  >
                    <g transform="rotate(0 8 8) translate(1.9 3.056) scale(0.40966)">
                      <path d="M23.1099 10.9188C19.5082 8.73064 14.2988 4.0372 13.5814 0.0155222L15.9065 3.2973e-06C17.9701 4.66018 24.0697 10.0675 29.7806 10.9898L29.759 13.0893C24.3025 14.0138 17.8165 19.4278 15.9857 24.1101L13.6701 24.1367C13.9005 20.39 19.7218 15.2819 23.0571 13.1913L0.00959874 13.1691L5.90407e-07 10.9388L23.1099 10.9188Z" />
                    </g>
                  </svg>
                </span>
              </a>
              <p className="mt-4 max-w-[30ch] text-body font-medium text-ink lg:mt-[calc(18*var(--px))]">
                Consistency, persistence, and visual problem solving that
                challenges perception and emotion.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
