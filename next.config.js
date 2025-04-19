/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Set to true to enable type checking during build
    // set to false to disable type checking during build
    ignoreBuildErrors: false, // Set to false to enable type checking
  },
};

module.exports = nextConfig;
