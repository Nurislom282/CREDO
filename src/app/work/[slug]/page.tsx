import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Nav } from "@/components/chrome/Nav";
import { Footer } from "@/components/chrome/Footer";
import { BrowserFrame } from "@/components/home/BrowserFrame";
import { PieceField } from "@/components/home/PieceField";
import { PieceGrid } from "@/components/home/PieceGrid";
import { PROJECTS, getProject } from "@/lib/projects";

/**
 * One case study per project.
 *
 * Static, and enumerated from the same list the home page accordion renders, so
 * a project added in src/lib/projects.ts gets a page without anything here
 * changing — and a slug removed from that list 404s instead of leaving an
 * orphan route behind.
 *
 * Deliberately not a new design: the section rhythm, the max-w-canvas /
 * px-margin container and the type scale are the home page's, and the only
 * thing this page adds is the browser frame.
 *
 * The intro loader is home-only — layout.tsx's bootstrap script no-ops on any
 * path that isn't "/" — so a case study paints straight away.
 */

export function generateStaticParams() {
  return PROJECTS.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/work/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);

  if (!project) return {};

  return {
    title: `${project.title} - Bunyod Mahmudov`,
    description: project.description ?? `${project.title} — ${project.category}.`,
  };
}

/** The same arrow the accordion and the back-to-top control use. */
const ARROW = (
  <svg aria-hidden="true" viewBox="0 0 16 16" fill="currentColor" className="h-4 w-4 shrink-0">
    <g transform="rotate(0 8 8) translate(1.9 3.056) scale(0.40966)">
      <path d="M23.1099 10.9188C19.5082 8.73064 14.2988 4.0372 13.5814 0.0155222L15.9065 3.2973e-06C17.9701 4.66018 24.0697 10.0675 29.7806 10.9898L29.759 13.0893C24.3025 14.0138 17.8165 19.4278 15.9857 24.1101L13.6701 24.1367C13.9005 20.39 19.7218 15.2819 23.0571 13.1913L0.00959874 13.1691L5.90407e-07 10.9388L23.1099 10.9188Z" />
    </g>
  </svg>
);

export default async function ProjectPage({ params }: PageProps<"/work/[slug]">) {
  const { slug } = await params;
  const project = getProject(slug);

  if (!project) notFound();

  const credits = [
    ["ROLE", project.role],
    ["TIMELINE", project.timeline],
    ["YEAR", project.year],
    ["TEAM", project.team],
  ] as const;

  // A listed set of pieces means the page is a body of work, not a case study.
  // `piecesLayout` picks how that body is presented: the endless plane, or an
  // ordinary grid. Both skip the browser frame and overview.
  const pieces = project.pieces;
  const usesField = project.piecesLayout !== "grid";

  return (
    <>
      <Nav />

      <main>
        {/* Title block. Same container and type scale as the home sections. */}
        <section className="relative w-full bg-canvas pb-16 lg:pt-32 lg:pb-[calc(64*var(--px))]">
          <div className="relative mx-auto w-full max-w-canvas px-6 sm:px-10 lg:px-margin">
            <Link
              href="/"
              className="group/back inline-flex w-fit items-center gap-3 border border-ink/25 px-[calc(15*var(--px))] py-[calc(9*var(--px))] text-body font-medium leading-[1.5] text-ink transition-[background-color,color,border-color] duration-300 ease-out-soft hover:border-ink hover:bg-ink hover:text-white [@media(pointer:coarse)]:min-h-[calc(48*var(--px))]"
            >
              <span className="-rotate-45 transition-transform duration-300 ease-out-soft group-hover/back:-rotate-90">
                {ARROW}
              </span>
              Back to Projects
            </Link>

            <div className="mt-10 flex flex-col gap-y-4 lg:flex-row lg:flex-wrap lg:items-baseline lg:justify-between lg:gap-x-8">
              <h1 className="text-display font-medium text-ink">{project.title}</h1>
              <p className="text-body text-muted">{project.meta}</p>
            </div>

            <div className="mt-8 h-[1.5px] w-full bg-rule lg:mt-[calc(32*var(--px))]" />
          </div>
        </section>

        {/*
            A project with `pieces` is a body of work rather than a single
            narrative, so it skips the frame and overview entirely — those read
            as a case study, which is the wrong shape for a set of pieces. The
            title block above stays either way. `piecesLayout` then decides
            whether that set is the endless plane or a scannable grid.
        */}
        {pieces ? (
          usesField ? (
            <PieceField pieces={pieces} label={project.title} />
          ) : (
            <PieceGrid pieces={pieces} label={project.title} />
          )
        ) : (
          <>
            {/* Description, cover image and credits */}
            <section className="relative w-full bg-canvas py-12 lg:py-[calc(64*var(--px))]">
              <div className="relative mx-auto w-full max-w-canvas px-6 sm:px-10 lg:px-margin">
                <div className="grid grid-cols-1 gap-x-12 gap-y-12 lg:grid-cols-[1fr_calc(330*var(--px))]">
                  <div className="min-w-0">
                    <h2 className="text-section font-medium text-ink">Overview</h2>

                    {project.description ? (
                      <p className="mt-4 max-w-[calc(680*var(--px))] text-body-lg font-normal leading-relaxed text-ink/85 lg:mt-6">
                        {project.description}
                      </p>
                    ) : (
                      <p className="mt-4 max-w-[60ch] text-body text-muted">
                        Description coming soon.
                      </p>
                    )}

                    <div className="mt-8 max-w-[calc(480*var(--px))] overflow-hidden rounded-xl border border-ink/10 shadow-sm lg:mt-12 lg:max-w-[calc(560*var(--px))]">
                      <Image
                        src={project.image}
                        alt={`${project.title} — cover`}
                        width={project.width}
                        height={project.height}
                        sizes="(min-width: 1080px) 560px, 100vw"
                        className="h-auto w-full object-cover"
                      />
                    </div>
                  </div>

                  <dl className="flex flex-wrap gap-x-12 gap-y-6 lg:col-start-2 lg:flex-col lg:gap-y-6 lg:border-l lg:border-rule/60 lg:pl-10 lg:pt-1">
                    {credits.map(([label, value]) => (
                      <div key={label}>
                        <dt className="text-label font-medium uppercase tracking-wider text-muted">{label}</dt>
                        <dd className="mt-1 text-body font-medium text-ink">{value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </div>
            </section>

            {/* Interactive prototype browser frame */}
            <section className="relative w-full bg-canvas pt-8 pb-20 lg:pt-12 lg:pb-32">
              <div className="relative mx-auto w-full max-w-canvas px-6 sm:px-10 lg:px-margin">
                <div className="mb-6 flex items-center justify-between border-b border-rule/40 pb-4">
                  <h3 className="text-subhead font-medium text-ink">Interactive Prototype</h3>
                  <span className="text-label text-muted">Live Preview</span>
                </div>
                <BrowserFrame
                  src={project.prototypeUrl}
                  image={project.prototypeUrl ? undefined : project.image}
                  url={project.prototypeUrl ? "figma.com/proto" : `/${project.slug}`}
                  alt={`${project.title} — ${project.meta}`}
                />
              </div>
            </section>
          </>
        )}
      </main>

      <Footer />
    </>
  );
}