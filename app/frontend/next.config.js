/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove static export for now - use standard Next.js build
  output: undefined,
  trailingSlash: false,
  images: {
    unoptimized: true
  },
  // Add basePath if needed
  // basePath: '',
}

module.exports = nextConfig
