import { cache } from "react"
import { defaultAboutContent, defaultContactContent, defaultHomeContent } from "@/data/site-content"
import type { Locale } from "@/i18n/config"
import { hasSupabaseEnv } from "@/lib/supabase/env"
import { fetchPublicSiteContent } from "@/lib/supabase/repositories/site-content"
import type { SiteArticle, SiteContentBundle } from "@/types/site-content"

type SiteContentDataResult = SiteContentBundle & {
  source: "supabase" | "local"
}

const getSiteContentData = cache(async (locale: Locale): Promise<SiteContentDataResult> => {
  void locale

  if (!hasSupabaseEnv()) {
    return {
      home: defaultHomeContent,
      about: defaultAboutContent,
      contact: defaultContactContent,
      articles: [],
      source: "local"
    }
  }

  const data = await fetchPublicSiteContent()
  return {
    ...data,
    source: "supabase"
  }
})

const getPublishedArticlesByPage = async (page: "home" | "about", locale: Locale): Promise<SiteArticle[]> => {
  const { articles } = await getSiteContentData(locale)
  return articles.filter((article) => article.page === page)
}

export { getPublishedArticlesByPage, getSiteContentData }
