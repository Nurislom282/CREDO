/**
 * The selected-projects list.
 *
 * Lives here rather than in the home page so the accordion and the case-study
 * route at /work/[slug] read from one source: a project renamed in the list is
 * renamed on its own page, and there is no second copy to fall out of sync.
 *
 * Gloog is deliberately absent — production filters it out of the home list.
 */
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
  /**
   * Intrinsic size of `image`. Unused by the accordion, which lays covers out
   * with a fixed aspect box plus object-cover; it exists so the case-study page
   * can reserve the right box before the cover decodes.
   */
  width: number;
  height: number;
  /**
   * One-paragraph summary for the case-study page. Empty rather than invented:
   * the home list predates this field, and a placeholder paragraph would read
   * as copy that was written on purpose.
   */
  description?: string;
  /**
   * A live prototype to show in the case study's browser frame. Rendered as an
   * iframe rather than an export so the frame stays current with the source.
   * Only set on projects that actually have one.
   */
  prototypeUrl?: string;
  /**
   * Artwork for the infinite plane on the case-study page. Set it and the page
   * opens on the field instead of the browser frame and overview — an endless
   * drag of the work, for projects that are a body of pieces rather than a
   * single narrative. Empty or absent renders the normal case study.
   *
   * Paths are relative to /public. Anything you leave out simply does not
   * appear, so the list can grow as you export more.
   */
  pieces?: string[];
  /**
   * How `pieces` lays out.
   *
   * "field" is the endless draggable plane, for work that is a body of pieces
   * you explore rather than read. "grid" is an ordinary scrollable grid, for a
   * set that benefits from being scanned in order. Defaults to "field".
   */
  piecesLayout?: "field" | "grid";
};

export const PROJECTS: Project[] = [
  {
    slug: "shoez",
    title: "SHOEZ",
    meta: "Product · Client",
    category: "Graphic · Brand · Product · Marketing · 3D",
    role: "Main Graphic Designer · Brand · Marketing",
    timeline: "2 weeks",
    year: "2026",
    team: "CRATOS Team",
    image: "/images/project-shoez.png",
    width: 1024,
    height: 576,
    description:
      "This project by Credo presents a contemporary UI/UX concept built around a clear visual system and an engaging user journey. The prototype explores how content, navigation, interactive components, and visual hierarchy can work together to create a smooth digital experience. The interface uses modern layouts and carefully considered design elements to keep the product visually consistent while making important information easy to discover. Interactive prototyping allows the concept to be experienced as a complete product rather than static screens, helping demonstrate the intended user flow. Overall, the project highlights Credo’s ability to turn product ideas into structured, polished, and user-centered digital experiences.",
    prototypeUrl:
      "https://www.figma.com/embed?embed_host=share&url=" +
      encodeURIComponent(
        "https://www.figma.com/proto/DmJRRBDuC793P2qhzsSnYq/Untitled?node-id=35-401&page-id=0%3A1&starting-point-node-id=1%3A2&scaling=scale-down-width&content-scaling=fixed&t=aBUlkbZNw3yRIrOZ-1",
      ),
  },
  {
    slug: "p12-platform",
    title: "p12.platform",
    meta: "Product · Venture",
    category: "UX / UI Design",
    role: "UX / UI Designer",
    timeline: "1 Week",
    year: "2025",
    team: "Design Founder",
    image: "/images/project-p12.png",
    width: 1400,
    height: 916,
    description:
      "This project by Credo is a modern digital interface concept focused on creating a structured, visually engaging, and user-friendly experience. The design combines clear information hierarchy, contemporary UI elements, carefully organized sections, and consistent visual patterns to make navigation intuitive. Particular attention is given to spacing, typography, composition, and interactive elements, creating a polished product experience rather than simply a collection of screens. The prototype demonstrates how thoughtful UX decisions can transform complex functionality into an accessible interface. From initial concept to interactive prototype, the project reflects Credo’s approach to combining design thinking, usability, and modern digital aesthetics into a cohesive product.",
    prototypeUrl:
      "https://www.figma.com/embed?embed_host=share&url=" +
      encodeURIComponent(
        "https://www.figma.com/proto/oLPOdZmVxoQBCLcLlVOtTI/Untitled?page-id=0%3A1&node-id=5-2&p=f&viewport=24%2C-147%2C0.41&t=51bfbM0Be20iqfU4-1&scaling=min-zoom&content-scaling=fixed&starting-point-node-id=5%3A2",
      ),
  },
  {
    slug: "ani-dub-studio",
    title: "Ani Dub Studio",
    meta: "Brand · Device launch",
    category: "UX / UI Designer",
    role: "Web Page Design",
    timeline: "1 week",
    year: "2024",
    team: "Design Founder",
    image: "/images/project-skydub.png",
    width: 1400,
    height: 916,
    description:
      "Ani-Dub Studio is a modern web platform designed for anime enthusiasts, focused on discovering, watching, and exploring dubbed anime content. The project combines a clean, engaging interface with intuitive navigation, allowing users to quickly find titles, browse content, and access detailed anime information. The design emphasizes visual storytelling through posters, covers, categories, and structured content sections while maintaining a smooth user experience across different screen sizes. Developed by Credo, the project demonstrates a strong focus on modern frontend development, UI/UX principles, responsive layouts, and entertainment-focused digital experiences. The result is an immersive platform concept built around anime discovery and streaming.",
    prototypeUrl:
      "https://www.figma.com/embed?embed_host=share&url=" +
      encodeURIComponent(
        "https://www.figma.com/proto/YEGX5RzTBVOHs9yC2n5w7F/sky-project?node-id=1-23&p=f&viewport=832%2C91%2C0.12&t=FuEzxMsMCxvgeaMD-1&scaling=scale-down-width&content-scaling=fixed&starting-point-node-id=1%3A23&page-id=0%3A1",
      ),
  },
  {
    slug: "logos",
    title: "Logos",
    meta: "Brand · Client",
    category: "Brand · Product Design",
    role: "Brand · Product Design",
    timeline: "Ongoing",
    year: "2023-2026",
    team: "CREDO",
    image: "/images/as.png",
    width: 1174,
    height: 768,
    /**
     * Logo exports, listed in the order they should be read. A scrollable grid
     * rather than the endless plane: a logo set is a set you scan and compare,
     * and dragging a grid of wordmarks around is busywork rather than
     * exploration. Drop new exports in /public/images/ and add the path here.
     */
    pieces: [
      "/images/as.png",
      "/images/project-shoez.png",
      "/images/project-p12.png",
      "/images/project-skydub.png",
      "/images/logo 1.png",
      "/images/logo 2.png",
      "/images/logo 3.png",
      "/images/logo 5.png",
      "/images/logo 6.png",
      "/images/logo 7.png",
    ],
    piecesLayout: "grid",
  },
  {
    slug: "products",
    title: "Products",
    meta: "Product · Ongoing",
    category: "Product Design",
    role: "Product Design",
    timeline: "Ongoing",
    year: "2023-2026",
    team: "CREDO",
    image: "/images/product design 2.png",
    width: 1920,
    height: 1080,
    /** See the note on `logos` above; same convention. */
    pieces: [
      "/images/product design 2.png",
      "/images/product design 1.png",
      "/images/product design 3.png",
      "/images/product design 4.png",
      "/images/product design 5.png",
      "/images/product design 6.png",
      "/images/product design 7.png",
      "/images/product design 8.png",
      "/images/product design 9.png",
      "/images/product design 10.png",
    ],
  },
];

export function getProject(slug: string): Project | undefined {
  return PROJECTS.find((project) => project.slug === slug);
}