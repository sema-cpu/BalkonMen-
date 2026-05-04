import { unstable_cache } from "next/cache"
import { defaultAboutContent, defaultContactContent, defaultHomeContent, mergeStringContent } from "@/data/site-content"
import { createSupabasePublicClient } from "@/lib/supabase/public"
import type { Database } from "@/types/database"
import type { SiteArticle, SiteContentBundle } from "@/types/site-content"

type SiteContentEntryRow = Database["public"]["Tables"]["site_content_entries"]["Row"]
type SiteArticleRow = Database["public"]["Tables"]["site_articles"]["Row"]

const mapArticle = (row: SiteArticleRow): SiteArticle => {
  return {
    id: row.id,
    page: row.page,
    title: row.title,
    excerpt: row.excerpt,
    content: row.content,
    imageUrl: row.image_url,
    author: row.author,
    isPublished: row.is_published,
    displayOrder: row.display_order,
    createdAt: row.created_at
  }
}

const fetchPublicSiteContent = unstable_cache(
  async (): Promise<SiteContentBundle> => {
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
      home: mergeStringContent(defaultHomeContent, entriesByKey.home),
      about: mergeStringContent(defaultAboutContent, entriesByKey.about),
      contact: mergeStringContent(defaultContactContent, entriesByKey.contact),
      articles: articlesResponse.data.map((article) => mapArticle(article))
    }
  },
  ["public-site-content-v3"],
  {
    revalidate: 300,
    tags: ["site-content", "site-articles"]
  }
)

export { fetchPublicSiteContent }
