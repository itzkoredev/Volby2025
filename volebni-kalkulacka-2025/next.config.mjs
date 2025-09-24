import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    externalDir: true,
  },
  webpack: (config, { isServer }) => {
    // Přidáme alias pro data, aby se daly importovat přímo
    config.resolve.alias['@data'] = path.join(__dirname, 'public/data');
    return config;
  },
};

export default nextConfig;
