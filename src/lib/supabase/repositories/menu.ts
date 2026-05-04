import { unstable_cache } from "next/cache"
import { normalizeMenuCategoryIconName } from "@/lib/menu-category-icons"
import { createSupabasePublicClient } from "@/lib/supabase/public"
import type { MenuCategory, MenuItem, MenuTag } from "@/types/menu"
import type { Database } from "@/types/database"

type MenuItemRow = Database["public"]["Tables"]["menu_items"]["Row"]
type CategoryRow = Database["public"]["Tables"]["menu_categories"]["Row"]
type TagRow = Database["public"]["Tables"]["menu_item_tags"]["Row"]

const mapCategory = (row: CategoryRow): MenuCategory => {
  const icon = normalizeMenuCategoryIconName(row.icon_name ?? "")

  return {
    id: row.id,
    name: row.name,
    description: row.description,
    order: row.display_order,
    icon: icon || undefined,
    imageUrl: row.image_url.trim().length > 0 ? row.image_url : undefined
  }
}

const mapItem = (row: MenuItemRow, tags: MenuTag[]): MenuItem => {
  return {
    id: row.id,
    categoryId: row.category_id,
    name: row.name,
    description: row.description,
    price: row.price,
    image: row.image_url ?? undefined,
    tags,
    isFeatured: row.is_featured,
    isAvailable: row.is_available
  }
}

const getPublicMenuData = unstable_cache(
  async () => {
    const supabase = createSupabasePublicClient()

    const [categoriesResponse, itemsResponse, tagsResponse] = await Promise.all([
      supabase.from("menu_categories").select("*").eq("is_active", true).order("display_order", { ascending: true }),
      supabase.from("menu_items").select("*").eq("is_available", true).order("display_order", { ascending: true }),
      supabase.from("menu_item_tags").select("*")
    ])

    if (categoriesResponse.error) {
      throw categoriesResponse.error
    }

    if (itemsResponse.error) {
      throw itemsResponse.error
    }

    if (tagsResponse.error) {
      throw tagsResponse.error
    }

    const tagsByItemId = tagsResponse.data.reduce<Record<string, MenuTag[]>>((acc, row: TagRow) => {
      const currentTags = acc[row.item_id] ?? []
      acc[row.item_id] = [...currentTags, row.tag]
      return acc
    }, {})

    return {
      categories: categoriesResponse.data.map((category) => {
        return mapCategory(category)
      }),
      items: itemsResponse.data.map((item) => {
        return mapItem(item, tagsByItemId[item.id] ?? [])
      })
    }
  },
  ["public-menu-data-v2"],
  {
    revalidate: 180,
    tags: ["menu-data"]
  }
)

export { getPublicMenuData }
