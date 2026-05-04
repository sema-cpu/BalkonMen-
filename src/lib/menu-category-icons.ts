import type { LucideIcon } from "lucide-react"
import { CakeSlice, Coffee, CupSoda, IceCreamBowl, LeafyGreen, Sandwich, Soup, UtensilsCrossed } from "lucide-react"

type MenuCategoryIconOption = {
  value: string
  label: string
}

const defaultMenuCategoryIconName = "utensils-crossed"

const menuCategoryIconOptions: MenuCategoryIconOption[] = [
  { value: "coffee", label: "Kahve" },
  { value: "cup-soda", label: "Soguk Icecek" },
  { value: "sandwich", label: "Sandvic" },
  { value: "soup", label: "Corba" },
  { value: "leafy-green", label: "Salata / Vegan" },
  { value: "cake-slice", label: "Tatli" },
  { value: "ice-cream-bowl", label: "Dondurma" },
  { value: "utensils-crossed", label: "Genel Kategori (Varsayilan)" }
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
