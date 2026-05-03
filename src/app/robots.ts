import type { MetadataRoute } from "next"

const robots = (): MetadataRoute.Robots => {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin"]
    },
    sitemap: "https://balkoncafe.example/sitemap.xml"
  }
}

export default robots
