import { unstable_cache } from "next/cache"
import { defaultAboutContentByLocale, defaultContactContentByLocale, defaultHomeContentByLocale, mergeLocalizedStringContent } from "@/data/site-content"
import type { Locale } from "@/i18n/config"
import { createSupabasePublicClient } from "@/lib/supabase/public"
import type { Database } from "@/types/database"
import type { ContentPage, SiteArticle, SiteContentBundle } from "@/types/site-content"

type SiteContentEntryRow = Database["public"]["Tables"]["site_content_entries"]["Row"]
type SiteArticleRow = Database["public"]["Tables"]["site_articles"]["Row"]

const mapArticle = (row: SiteArticleRow, locale: Locale): SiteArticle => {
  const localizedTitle = locale === "tr" && row.title_tr.trim().length > 0 ? row.title_tr : row.title
  const localizedExcerpt = locale === "tr" && row.excerpt_tr.trim().length > 0 ? row.excerpt_tr : row.excerpt
  const localizedContent = locale === "tr" && row.content_tr.trim().length > 0 ? row.content_tr : row.content

  return {
    id: row.id,
    page: row.page as ContentPage,
    title: localizedTitle,
    excerpt: localizedExcerpt,
    content: localizedContent,
    imageUrl: row.image_url,
    author: row.author,
    isPublished: row.is_published,
    displayOrder: row.display_order,
    createdAt: row.created_at
  }
}

const fetchPublicSiteContent = unstable_cache(
  async (locale: Locale): Promise<SiteContentBundle> => {
    const supabase = createSupabasePublicClient()

    const [entriesResponse, articlesResponse] = await Promise.all([
      supabase.from("site_content_entries").select("*"),
      supabase.from("site_articles").select("*").eq("is_published", true).order("display_order", { ascending: true })
    ])

    if (entriesResponse.error) {
      throw entriesResponse.error
    }

    if (articlesResponse.error) {
      throw articlesResponse.error
    }

    const entriesByKey = entriesResponse.data.reduce<Record<string, SiteContentEntryRow["value"]>>((acc, row) => {
      acc[row.key] = row.value
      return acc
    }, {})

    return {
      home: mergeLocalizedStringContent(defaultHomeContentByLocale, entriesByKey.home, locale),
      about: mergeLocalizedStringContent(defaultAboutContentByLocale, entriesByKey.about, locale),
      contact: mergeLocalizedStringContent(defaultContactContentByLocale, entriesByKey.contact, locale),
      articles: articlesResponse.data.map((article) => mapArticle(article, locale))
    }
  },
  ["public-site-content-v2"],
  {
    revalidate: 300,
    tags: ["site-content", "site-articles"]
  }
)

export { fetchPublicSiteContent }
