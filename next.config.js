// @ts-check

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Disable TypeScript checking during build
    tsBuildInfoFile: './node_modules/.cache/tsbuildinfo-empty',
  },
  // Skip TypeScript and ESLint during builds on Vercel
  compiler: {
    // SWC is faster but we can disable it if needed
  },
}

module.exports = nextConfig
