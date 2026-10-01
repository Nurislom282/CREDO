import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * Every route here is static: the five case studies come from
   * generateStaticParams and the rest are plain sections, so there is no
   * server runtime to host. Exporting to `out/` lets Netlify serve the build
   * as static files with no Node process and no adapter.
   */
  output: "export",

  /**
   * The image optimiser is a server route, and there is no server. Without
   * this, next/image still emits /_next/image?url=... srcsets that 404 on a
   * static host, so every image would silently fail to load.
   *
   * The cost is real: assets ship at their natural size with no resizing or
   * modern-format negotiation. public/images is 29MB, so anything on a hot
   * path is worth pre-compressing before deploy.
   */
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
