/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { hostname: 'robust-wren-358.convex.cloud' },
      { hostname: 'oaidalleapiprodscus.blob.core.windows.net' },
    ],
  },
}

export default nextConfig
