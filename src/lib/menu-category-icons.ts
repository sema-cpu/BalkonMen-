import type { LucideIcon } from "lucide-react"
import { CakeSlice, Coffee, CupSoda, IceCreamBowl, LeafyGreen, Sandwich, Soup, UtensilsCrossed } from "lucide-react"

type MenuCategoryIconOption = {
  value: string
  label: string
}

const defaultMenuCategoryIconName = "utensils-crossed"

const menuCategoryIconOptions: MenuCategoryIconOption[] = [
  { value: "coffee", label: "Coffee" },
  { value: "cup-soda", label: "Cold Drink" },
  { value: "sandwich", label: "Sandwich" },
  { value: "soup", label: "Soup" },
  { value: "leafy-green", label: "Salad / Vegan" },
  { value: "cake-slice", label: "Dessert" },
  { value: "ice-cream-bowl", label: "Ice Cream" },
  { value: "utensils-crossed", label: "Generic Category (Default)" }
]

const iconByName: Record<string, LucideIcon> = {
  coffee: Coffee,
  "cup-soda": CupSoda,
  sandwich: Sandwich,
  soup: Soup,
  "leafy-green": LeafyGreen,
  "cake-slice": CakeSlice,
  "ice-cream-bowl": IceCreamBowl,
  "utensils-crossed": UtensilsCrossed
}

const normalizeMenuCategoryIconName = (iconName: string) => {
  const normalized = iconName.trim().toLowerCase()
  return menuCategoryIconOptions.some((option) => option.value === normalized) ? normalized : ""
}

const resolveMenuCategoryIcon = (iconName?: string | null): LucideIcon => {
  const normalized = normalizeMenuCategoryIconName(iconName ?? "")
  return iconByName[normalized || defaultMenuCategoryIconName]
}

export { defaultMenuCategoryIconName, menuCategoryIconOptions, normalizeMenuCategoryIconName, resolveMenuCategoryIcon }
