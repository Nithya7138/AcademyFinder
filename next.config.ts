import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Explicit Turbopack root to silence multi-lockfile warning
  // This points to the app directory containing this config file
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
