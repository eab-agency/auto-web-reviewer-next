import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Treat these modules as external dependencies without bundling
  serverExternalPackages: ["puppeteer"],
};

export default nextConfig;
