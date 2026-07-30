import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
 
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Fix for monorepo workspace root resolution on Vercel
  outputFileTracingRoot: path.join(__dirname, "../../"),
};

export default nextConfig;
