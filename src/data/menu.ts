import type { Locale } from "@/i18n/config"
import type { MenuCategory, MenuItem } from "@/types/menu"

type LocalizedString = Record<Locale, string>

type MenuCategorySeed = {
  id: string
  name: LocalizedString
  description: LocalizedString
  order: number
  icon?: string
}

type MenuItemSeed = {
  id: string
  categoryId: string
  name: LocalizedString
  description: LocalizedString
  price: number
  image?: string
  tags: MenuItem["tags"]
  isFeatured: boolean
  isAvailable: boolean
}

const menuCategorySeeds: MenuCategorySeed[] = [
  {
    id: "coffee",
    name: { en: "Coffee", tr: "Kahve" },
    description: { en: "Espresso-based favorites and hand-brewed selections", tr: "Espresso bazlı favoriler ve özel demleme seçenekleri" },
    order: 1,
    icon: "coffee"
  },
  {
    id: "cold-drinks",
    name: { en: "Cold Drinks", tr: "Soğuk İçecekler" },
    description: { en: "Iced creations and refreshing signature blends", tr: "Buzlu seçenekler ve ferahlatıcı imza karışımlar" },
    order: 2,
    icon: "cup-soda"
  },
  {
    id: "brunch",
    name: { en: "Brunch", tr: "Brunch" },
    description: { en: "All-day plates prepared with seasonal ingredients", tr: "Mevsimsel malzemelerle hazırlanan gün boyu tabaklar" },
    order: 3,
    icon: "sandwich"
  },
  {
    id: "desserts",
    name: { en: "Desserts", tr: "Tatlılar" },
    description: { en: "Sweet pairings for every cup", tr: "Her fincana eşlik edecek tatlı dokunuşlar" },
    order: 4,
    icon: "cake-slice"
  }
]

const menuItemSeeds: MenuItemSeed[] = [
  {
    id: "espresso-macchiato",
    categoryId: "coffee",
    name: { en: "Espresso Macchiato", tr: "Espresso Macchiato" },
    description: { en: "Double espresso balanced with a silky touch of milk foam", tr: "Kadifemsi süt köpüğü dokunuşuyla dengelenmiş çift espresso" },
    price: 4.5,
    image: "https://images.unsplash.com/photo-1497636577773-f1231844b336?auto=format&fit=crop&w=1200&q=80",
    tags: ["bestseller", "vegetarian"],
    isFeatured: true,
    isAvailable: true
  },
  {
    id: "flat-white",
    categoryId: "coffee",
    name: { en: "Flat White", tr: "Flat White" },
    description: { en: "Velvety microfoam with caramel-forward single-origin espresso", tr: "Karamel notaları öne çıkan single-origin espresso ve kadifemsi mikro köpük" },
    price: 5.3,
    image: "https://images.unsplash.com/photo-1509785307050-d4066910ec1e?auto=format&fit=crop&w=1200&q=80",
    tags: ["bestseller", "vegetarian"],
    isFeatured: true,
    isAvailable: true
  },
  {
    id: "filter-ethiopia",
    categoryId: "coffee",
    name: { en: "Filter Ethiopia", tr: "Filtre Etiyopya" },
    description: { en: "Floral and citrus profile brewed to highlight clean acidity", tr: "Temiz asiditeyi öne çıkaran floral ve narenciye profili" },
    price: 5.8,
    image: "https://images.unsplash.com/photo-1445116572660-236099ec97a0?auto=format&fit=crop&w=1200&q=80",
    tags: ["vegan", "glutenFree"],
    isFeatured: false,
    isAvailable: true
  },
  {
    id: "vanilla-cold-brew",
    categoryId: "cold-drinks",
    name: { en: "Vanilla Cold Brew", tr: "Vanilyalı Cold Brew" },
    description: { en: "18-hour cold brew with house vanilla bean syrup", tr: "18 saat demlenmiş cold brew ve ev yapımı vanilya şurubu" },
    price: 6.1,
    image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=1200&q=80",
    tags: ["bestseller", "vegetarian"],
    isFeatured: true,
    isAvailable: true
  },
  {
    id: "citrus-tonic",
    categoryId: "cold-drinks",
    name: { en: "Citrus Espresso Tonic", tr: "Narenciyeli Espresso Tonic" },
    description: { en: "Sparkling tonic, orange zest, and bright espresso finish", tr: "Gazlı tonik, portakal kabuğu ve canlı espresso bitişi" },
    price: 6.4,
    image: "https://images.unsplash.com/photo-1563225409-127c18758bd5?auto=format&fit=crop&w=1200&q=80",
    tags: ["glutenFree", "spicy"],
    isFeatured: false,
    isAvailable: true
  },
  {
    id: "avocado-toast",
    categoryId: "brunch",
    name: { en: "Avocado Herb Toast", tr: "Avokadolu Otlu Tost" },
    description: { en: "Sourdough, lemon-zest avocado mash, and crispy seed crumble", tr: "Ekşi mayalı ekmek, limon kabuklu avokado ezmesi ve kıtır tohum karışımı" },
    price: 9.9,
    image: "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=1200&q=80",
    tags: ["vegetarian", "bestseller"],
    isFeatured: true,
    isAvailable: true
  },
  {
    id: "eggs-brioche",
    categoryId: "brunch",
    name: { en: "Brioche Eggs Royale", tr: "Brioche Eggs Royale" },
    description: { en: "Poached eggs, greens, and smoked salmon on toasted brioche", tr: "Kızarmış brioche üzerinde poşe yumurta, yeşillik ve tütsülenmiş somon" },
    price: 12.4,
    image: "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?auto=format&fit=crop&w=1200&q=80",
    tags: ["containsNuts"],
    isFeatured: false,
    isAvailable: true
  },
  {
    id: "chocolate-tart",
    categoryId: "desserts",
    name: { en: "Dark Chocolate Tart", tr: "Bitter Çikolatalı Tart" },
    description: { en: "70% cacao ganache tart with sea salt and espresso crumble", tr: "%70 kakaolu ganaj tart, deniz tuzu ve espresso kırıntıları ile" },
    price: 7.2,
    image: "https://images.unsplash.com/photo-1495214783159-3503fd1b572d?auto=format&fit=crop&w=1200&q=80",
    tags: ["vegetarian"],
    isFeatured: false,
    isAvailable: true
  },
  {
    id: "almond-croissant",
    categoryId: "desserts",
    name: { en: "Almond Croissant", tr: "Bademli Kruvasan" },
    description: { en: "Buttery layers with toasted almond cream filling", tr: "Tereyağlı katmanlar ve kavrulmuş badem kreması dolgusu" },
    price: 5.7,
    image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=1200&q=80",
    tags: ["containsNuts", "bestseller"],
    isFeatured: false,
    isAvailable: false
  }
]

const getLocalizedMenuFallback = (locale: Locale): { categories: MenuCategory[]; items: MenuItem[] } => {
  return {
    categories: menuCategorySeeds.map((category) => {
      return {
        id: category.id,
        name: category.name[locale],
        description: category.description[locale],
        order: category.order,
        icon: category.icon
      }
    }),
    items: menuItemSeeds.map((item) => {
      return {
        id: item.id,
        categoryId: item.categoryId,
        name: item.name[locale],
        description: item.description[locale],
        price: item.price,
        image: item.image,
        tags: item.tags,
        isFeatured: item.isFeatured,
        isAvailable: item.isAvailable
      }
    })
  }
}

export { getLocalizedMenuFallback }
