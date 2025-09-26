import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure for static export and FTP hosting
const rawBasePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '/volby2025';
const normalizedBasePath = !rawBasePath || rawBasePath === '/'
  ? ''
  : rawBasePath.startsWith('/')
    ? rawBasePath.replace(/\/$/, '')
    : `/${rawBasePath.replace(/\/$/, '')}`;

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // Static export for FTP hosting
  trailingSlash: true, // Required for static hosting
  images: {
    unoptimized: true, // Required for static export
  },
  experimental: {
    externalDir: true,
  },
  env: {
    NEXT_PUBLIC_BASE_PATH: normalizedBasePath,
  },
  webpack: (config, { isServer }) => {
    // Přidáme alias pro data, aby se daly importovat přímo
    config.resolve.alias['@data'] = path.join(__dirname, 'public/data');
    return config;
  },
};

// Set basePath and assetPrefix for subpath deployment
if (normalizedBasePath) {
  nextConfig.basePath = normalizedBasePath;
  nextConfig.assetPrefix = normalizedBasePath;
}

export default nextConfig;
