import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingRoot: __dirname,
  experimental: {
    externalDir: true,
  },
  // Disable static optimization for pages that use useSearchParams
  staticPageGenerationTimeout: 60,
  trailingSlash: false,
  
  // Konfigurace pro Edge runtime u API funkcí
  async rewrites() {
    return [
      {
        source: '/api/chat/:path*',
        destination: '/api/chat/:path*',
      },
    ];
  },
};

export default nextConfig;
