import type { MetadataRoute } from "next"

const sitemap = (): MetadataRoute.Sitemap => {
  const localizedRoutes = [
    { locale: "tr", path: "", priority: 1, changeFrequency: "weekly" as const },
    { locale: "tr", path: "/menu", priority: 0.9, changeFrequency: "daily" as const },
    { locale: "tr", path: "/about", priority: 0.8, changeFrequency: "monthly" as const },
    { locale: "tr", path: "/contact", priority: 0.8, changeFrequency: "monthly" as const },
    { locale: "en", path: "", priority: 1, changeFrequency: "weekly" as const },
    { locale: "en", path: "/menu", priority: 0.9, changeFrequency: "daily" as const },
    { locale: "en", path: "/about", priority: 0.8, changeFrequency: "monthly" as const },
    { locale: "en", path: "/contact", priority: 0.8, changeFrequency: "monthly" as const }
  ]

  return [
    ...localizedRoutes.map((route) => {
      return {
        url: `https://balkoncafe.example/${route.locale}${route.path}`,
        lastModified: new Date(),
        changeFrequency: route.changeFrequency,
        priority: route.priority
      }
    })
  ]
}

export default sitemap
