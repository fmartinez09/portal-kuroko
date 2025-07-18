import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone", // 🔧 Esto genera `.next/standalone`
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;