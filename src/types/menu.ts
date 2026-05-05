export type MenuTag = "vegan" | "vegetarian" | "spicy" | "containsNuts" | "glutenFree" | "bestseller"
export type DonenessRating = "rare" | "mediumRare" | "medium" | "mediumWell" | "wellDone"

export type MenuCategory = {
  id: string
  name: string
  description: string
  order: number
  icon?: string
  imageUrl?: string
}

export type MenuItem = {
  id: string
  categoryId: string
  name: string
  description: string
  price: number
  image?: string
  tags: MenuTag[]
  donenessRating?: DonenessRating
  isFeatured: boolean
  isAvailable: boolean
}
