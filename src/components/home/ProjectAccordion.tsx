"use client";

import Image from "next/image";
import { useState } from "react";
import { Handwriting } from "@/components/primitives/Handwriting";

export type Project = {
  slug: string;
  title: string;
  /** Appended to the link's accessible name, e.g. "Brand · Client". */
  meta: string;
  /** Second chip on the cover overlay, e.g. "Brand & Product Design". */
  category: string;
  role: string;
  timeline: string;
  year: string;
  team: string;
  image: string;
  width: number;
  height: number;
};

type ProjectAccordionProps = {
  projects: Project[];
  className?: string;
};

const JUMP_ARROW = (
  <svg
    aria-hidden="true"
    viewBox="0 0 16 16"
    fill="currentColor"
    className="h-4 w-4 shrink-0 transition-transform duration-300 ease-out-soft group-hover/btn:-rotate-45"
  >
    <g transform="rotate(0 8 8) translate(1.9 3.056) scale(0.40966)">
      <path d="M23.1099 10.9188C19.5082 8.73064 14.2988 4.0372 13.5814 0.0155222L15.9065 3.2973e-06C17.9701 4.66018 24.0697 10.0675 29.7806 10.9898L29.759 13.0893C24.3025 14.0138 17.8165 19.4278 15.9857 24.1101L13.6701 24.1367C13.9005 20.39 19.7218 15.2819 23.0571 13.1913L0.00959874 13.1691L5.90407e-07 10.9388L23.1099 10.9188Z" />
    </g>
  </svg>
);

/**
 * Vertical project list.
 *
 * The list is a fixed-height flex column, so the "accordion" is really rows
 * trading min-height against each other: one row is 270px, the rest 112px, and
 * because they're flex:1 the total never changes. The page can't reflow under
 * the pointer, which is what makes it feel solid.
 *
 * The expanded row is driven purely by hover, with the first row as the resting
 * state. Inactive covers fade out; the ROLE / TIMELINE / YEAR / TEAM line
 * slides up with the same 500ms ease as the row height.
 */
export function ProjectAccordion({ projects, className }: ProjectAccordionProps) {
  const [hovered, setHovered] = useState<string | null>(null);

  const active = projects[0]?.slug ?? null;
  const expanded = hovered ?? active;

  return (
    <ul
      data-accordion=""
      className={`lg:flex lg:h-[calc(718*var(--px))] lg:flex-col ${className ?? ""}`.trim()}
    >
      {projects.map((project, index) => {
        const isActive = expanded === project.slug;

        return (
          <li
            key={project.slug}
            data-active={isActive ? "true" : "false"}
            className={`lg:relative lg:flex lg:flex-1 lg:flex-col lg:overflow-hidden lg:transition-[min-height] lg:duration-500 lg:ease-out-soft ${
              isActive
                ? "lg:min-h-[calc(270*var(--px))]"
                : "lg:min-h-[calc(112*var(--px))]"
            }`}
            onMouseEnter={() => setHovered(project.slug)}
            onMouseLeave={() => setHovered(null)}
          >
            <a
              href={`/work/${project.slug}`}
              className="group block py-8 lg:py-[calc(24*var(--px))]"
              aria-label={`${project.title} - ${project.meta}`}
            >
              <div className="grid grid-cols-1 items-start lg:grid-cols-[1fr_calc(330*var(--px))] lg:gap-x-10">
                <div className="min-w-0">
                  <div className="flex flex-col items-start gap-y-4 lg:flex-row lg:flex-wrap lg:items-center lg:justify-between lg:gap-x-6">
                    <Handwriting
                      as="h3"
                      text={project.title}
                      on={isActive}
                      baseColor="#0A0A0A"
                      className={`text-project font-medium transition-colors duration-300 ${
                        isActive ? "text-accent" : "text-ink lg:opacity-45"
                      }`}
                    />

                    <Handwriting
                      text="Jump To Project"
                      baseColor="#0A0A0A"
                      className={`group/btn inline-flex shrink-0 items-center gap-3 border px-[calc(15*var(--px))] py-[calc(9*var(--px))] text-body font-medium leading-[1.5] transition-[background-color,color,border-color] duration-300 ease-out-soft hover:border-ink hover:bg-ink hover:text-white [@media(pointer:coarse)]:min-h-[calc(48*var(--px))] ${
                        isActive
                          ? "border-ink text-ink"
                          : "border-ink/25 text-ink lg:opacity-45"
                      }`}
                    >
                      {JUMP_ARROW}
                    </Handwriting>
                  </div>
                </div>

                <div
                  className={`transition-opacity duration-500 ease-out-soft motion-reduce:transition-none lg:col-start-2 ${
                    isActive ? "opacity-100" : "lg:opacity-0"
                  }`}
                >
                  <div
                    data-hw-appear="true"
                    className="group/cover relative mt-6 aspect-[16/10] w-full overflow-hidden lg:mt-0 lg:aspect-[3/2] lg:w-[calc(330*var(--px))]"
                  >
                    <Image
                      src={project.image}
                      alt={`${project.title} - ${project.meta}`}
                      fill
                      priority={index === 0}
                      sizes="(min-width: 1729px) 19.1vw, (min-width: 1024px) 330px, 100vw"
                      className="object-cover"
                    />

                    <div
                      className="absolute inset-0 hidden flex-col justify-end opacity-0 transition-opacity duration-300 ease-out-soft group-hover/cover:opacity-100 lg:flex"
                      style={{
                        backgroundImage:
                          "linear-gradient(180deg, rgba(4,4,4,0) 19%, rgba(4,4,4,0.94) 100%)",
                      }}
                    >
                      <div className="flex translate-y-1.5 flex-wrap gap-[calc(7*var(--px))] p-[calc(14*var(--px))] transition-transform duration-300 ease-out-soft group-hover/cover:translate-y-0">
                        {/* Unlit: the glyphs start transparent inside this
                            data-hw-appear cover and sweep in on cover hover. */}
                        <Handwriting
                          text={project.title}
                          className="border border-white/20 bg-[var(--night-chip)] p-[calc(9*var(--px))] text-label capitalize leading-none tracking-[calc(-0.2*var(--px))] text-white"
                        />
                        <Handwriting
                          text={project.category}
                          className="max-w-full truncate border border-white/20 bg-[var(--night-chip)] p-[calc(9*var(--px))] text-label capitalize leading-none tracking-[calc(-0.2*var(--px))] text-white"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <dl
                aria-hidden="true"
                data-hw-appear="true"
                data-hw-on={isActive ? "true" : undefined}
                className={`hidden lg:absolute lg:bottom-[calc(24*var(--px))] lg:left-0 lg:flex lg:max-w-[calc(100%-calc(390*var(--px)))] lg:flex-wrap lg:gap-x-12 lg:gap-y-2 lg:transition-[opacity,transform] lg:duration-500 lg:ease-out-soft motion-reduce:lg:transition-none ${
                  isActive
                    ? "lg:translate-y-0 lg:opacity-100"
                    : "lg:pointer-events-none lg:translate-y-1.5 lg:opacity-0"
                }`}
              >
                {(
                  [
                    ["ROLE", project.role],
                    ["TIMELINE", project.timeline],
                    ["YEAR", project.year],
                    ["TEAM", project.team],
                  ] as const
                ).map(([label, value]) => (
                  <div key={label}>
                    <Handwriting
                      as="dt"
                      text={label}
                      className="text-label text-muted"
                    />
                    <Handwriting
                      as="dd"
                      text={value}
                      className="mt-1 text-body text-ink"
                    />
                  </div>
                ))}
              </dl>
            </a>
            <div
              aria-hidden="true"
              className="h-[1.5px] w-full bg-rule lg:absolute lg:inset-x-0 lg:bottom-0"
            />
          </li>
        );
      })}
    </ul>
  );
}
