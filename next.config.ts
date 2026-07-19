import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "supabasekong-xrdm99qdk0ya5oqyw45gb00k.letslink.ch",
      },
    ],
  },
};

export default nextConfig;
