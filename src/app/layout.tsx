import type { Metadata } from "next";
import { Archivo, Funnel_Display, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { AppProviders } from "@/components/providers";

const funnel = Funnel_Display({
  variable: "--font-funnel-display",
  subsets: ["latin"],
  display: "swap",
});

const archivo = Archivo({
  variable: "--font-archivo-face",
  subsets: ["latin"],
  display: "swap",
});

const grotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Bunyod Mahmudov - Product Designer",
  description: "Product designer and studio, Pamidor.",
  icons: {
    icon: "/logos/CDlogo.jpg",
    shortcut: "/logos/CDlogo.jpg",
    apple: "/logos/CDlogo.jpg",
  },
};

/**
 * Blocks the first paint of the home page to hold the hero in its pre-entrance
 * 3D state, so the hero is already composed and simply animates in once the
 * intro lifts rather than popping from an unstyled state.
 *
 * Runs before React hydrates, which is the whole point — a useEffect would be
 * too late and the hero would flash. The 6s timer is a failsafe only: the
 * <Loader/> component normally clears the attribute itself, and its timer wins
 * the race. Also home-only, so case-study pages load without an intro.
 */
const LOADING_BOOTSTRAP = `(function(){if(location.pathname!=="/")return;var d=document.documentElement;d.setAttribute("data-loading","");setTimeout(function(){d.removeAttribute("data-loading")},6000)})()`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${funnel.variable} ${archivo.variable} ${grotesk.variable} h-full`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: LOADING_BOOTSTRAP }} />
      </head>
      <body className="min-h-full bg-canvas text-ink antialiased">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
