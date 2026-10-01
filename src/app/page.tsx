import { BioWave } from "@/components/home/BioWave";
import { ContactSection } from "@/components/home/ContactSection";
import { Hero } from "@/components/home/Hero";
import { Loader } from "@/components/home/Loader";
import { ProjectAccordion } from "@/components/home/ProjectAccordion";
import { PROJECTS } from "@/lib/projects";
import { Signature } from "@/components/home/Signature";
import { Skillset } from "@/components/home/Skillset";
import { Footer } from "@/components/chrome/Footer";

/**
 * Home page.
 *
 * Section order matches production, and the ids matter beyond navigation: the
 * menu, the Lenis anchor handling and the back-to-top control all address
 * #top / #projects.
 *
 * The studio paragraph is client-rendered char-by-char so the scroll-driven
 * sweep has elements to light; the rest is static markup.
 */


const BIO =
  "Hi, I'm Bunyod - a graphic, UI/UX, brand & product designer. I build brands that people remember and products they don't have to think about. Identities, design systems and the interfaces they run on - and when the work needs art direction or 3D, that gets made here too.";

export default function Home() {
  return (
    <>
      <Loader />

      <main>
        <Hero />

        <section
          id="studio"
          className="relative flex min-h-[100svh] w-full flex-col justify-center bg-canvas py-16 lg:block lg:min-h-0 lg:py-0"
        >
          <div className="relative mx-auto w-full max-w-canvas px-6 sm:px-10 lg:px-margin">
            <BioWave
              text={BIO}
              className="mt-6 max-w-[calc(1129*var(--px))] text-lead font-medium text-ink lg:mt-[calc(56*var(--px))]"
              floatSrc="/images/acic.jpeg"
              floatWidth={661}
              floatHeight={900}
            />
          </div>
        </section>

        <section
          id="projects"
          className="relative flex min-h-[100svh] w-full flex-col justify-center bg-canvas py-16 lg:pt-32 lg:pb-[calc(164*var(--px))]"
        >
          <div className="relative mx-auto w-full max-w-canvas px-6 sm:px-10 lg:px-margin">
            <div>
              <h2 className="text-section font-medium text-ink">Selected Projects</h2>
            </div>

            <div className="mt-8 h-[1.5px] w-full bg-rule lg:mt-[calc(32*var(--px))]" />

            <ProjectAccordion projects={PROJECTS} />
          </div>
        </section>

        <Skillset />
        <Signature />
        <ContactSection />
      </main>

      <Footer />
    </>
  );
}
