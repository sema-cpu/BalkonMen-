import { cache } from "react"
import { getLocalizedMenuFallback } from "@/data/menu"
import type { Locale } from "@/i18n/config"
import { getPublicMenuData } from "@/lib/supabase/repositories/menu"
import { hasSupabaseEnv } from "@/lib/supabase/env"
import type { MenuCategory, MenuItem } from "@/types/menu"

type MenuData = {
  categories: MenuCategory[]
  items: MenuItem[]
  source: "supabase" | "local"
}

const getMenuData = cache(async (locale: Locale): Promise<MenuData> => {
  if (!hasSupabaseEnv()) {
    const fallbackData = getLocalizedMenuFallback(locale)

    return {
      categories: [...fallbackData.categories].sort((a, b) => a.order - b.order),
      items: fallbackData.items,
      source: "local"
    }
  }

  const data = await getPublicMenuData()
  return {
    categories: data.categories,
    items: data.items,
    source: "supabase"
  }
})

const getFeaturedMenuItems = async (locale: Locale) => {
  const { items } = await getMenuData(locale)
  return items.filter((item) => item.isFeatured).slice(0, 3)
}

export { getFeaturedMenuItems, getMenuData }
