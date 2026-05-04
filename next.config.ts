import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com"
      },
      {
        protocol: "https",
        hostname: "cdn.myikas.com"
      },
      {
        protocol: "https",
        hostname: "i.hizliresim.com"
      }
    ]
  }
}

export default nextConfig
