import type { NextConfig } from "next";

// GITHUB_PAGES=1 gera o site estático em out/ servido em /<repo> (GitHub Pages).
// Cache Components exige servidor Node, então só fica ligado fora do export.
const pages = process.env.GITHUB_PAGES === "1";
const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  devIndicators: false,
  ...(pages
    ? { output: "export", basePath: base, assetPrefix: base, trailingSlash: true, images: { unoptimized: true } }
    : { cacheComponents: true, partialPrefetching: true }),
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
