import type { Locale } from "@/i18n/config"
import type { MenuCategory, MenuItem } from "@/types/menu"

type MenuCategorySeed = {
  id: string
  name: string
  description: string
  order: number
  icon?: string
  imageUrl?: string
}

type MenuItemSeed = {
  id: string
  categoryId: string
  name: string
  description: string
  price: number
  image?: string
  tags: MenuItem["tags"]
  donenessRating?: MenuItem["donenessRating"]
  isFeatured: boolean
  isAvailable: boolean
}

const menuCategorySeeds: MenuCategorySeed[] = [
  {
    id: "coffee",
    name: "Kahve",
    description: "Espresso bazlı favoriler ve özel demleme seçenekleri",
    order: 1,
    icon: "coffee",
    imageUrl: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "cold-drinks",
    name: "Soğuk İçecekler",
    description: "Buzlu seçenekler ve ferahlatıcı imza karışımlar",
    order: 2,
    icon: "cup-soda",
    imageUrl: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "brunch",
    name: "Brunch",
    description: "Mevsimsel malzemelerle hazırlanan gün boyu tabaklar",
    order: 3,
    icon: "sandwich",
    imageUrl: "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "desserts",
    name: "Tatlılar",
    description: "Her fincana eşlik edecek tatlı dokunuşlar",
    order: 4,
    icon: "cake-slice",
    imageUrl: "https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&w=800&q=80"
  }
]

const menuItemSeeds: MenuItemSeed[] = [
  {
    id: "espresso-macchiato",
    categoryId: "coffee",
    name: "Espresso Macchiato",
    description: "Kadifemsi süt köpüğü dokunuşuyla dengelenmiş çift espresso",
    price: 4.5,
    image: "https://images.unsplash.com/photo-1497636577773-f1231844b336?auto=format&fit=crop&w=1200&q=80",
    tags: ["bestseller", "vegetarian"],
    isFeatured: true,
    isAvailable: true
  },
  {
    id: "flat-white",
    categoryId: "coffee",
    name: "Flat White",
    description: "Karamel notaları öne çıkan single-origin espresso ve kadifemsi mikro köpük",
    price: 5.3,
    image: "https://images.unsplash.com/photo-1509785307050-d4066910ec1e?auto=format&fit=crop&w=1200&q=80",
    tags: ["bestseller", "vegetarian"],
    isFeatured: true,
    isAvailable: true
  },
  {
    id: "filter-ethiopia",
    categoryId: "coffee",
    name: "Filtre Etiyopya",
    description: "Temiz asiditeyi öne çıkaran floral ve narenciye profili",
    price: 5.8,
    image: "https://images.unsplash.com/photo-1445116572660-236099ec97a0?auto=format&fit=crop&w=1200&q=80",
    tags: ["vegan", "glutenFree"],
    isFeatured: false,
    isAvailable: true
  },
  {
    id: "vanilla-cold-brew",
    categoryId: "cold-drinks",
    name: "Vanilyalı Cold Brew",
    description: "18 saat demlenmiş cold brew ve ev yapımı vanilya şurubu",
    price: 6.1,
    image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=1200&q=80",
    tags: ["bestseller", "vegetarian"],
    isFeatured: true,
    isAvailable: true
  },
  {
    id: "citrus-tonic",
    categoryId: "cold-drinks",
    name: "Narenciyeli Espresso Tonic",
    description: "Gazlı tonik, portakal kabuğu ve canlı espresso bitişi",
    price: 6.4,
    image: "https://images.unsplash.com/photo-1563225409-127c18758bd5?auto=format&fit=crop&w=1200&q=80",
    tags: ["glutenFree", "spicy"],
    isFeatured: false,
    isAvailable: true
  },
  {
    id: "avocado-toast",
    categoryId: "brunch",
    name: "Avokadolu Otlu Tost",
    description: "Ekşi mayalı ekmek, limon kabuklu avokado ezmesi ve kıtır tohum karışımı",
    price: 9.9,
    image: "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=1200&q=80",
    tags: ["vegetarian", "bestseller"],
    isFeatured: true,
    isAvailable: true
  },
  {
    id: "steak-eggs",
    categoryId: "brunch",
    name: "Izgara Dana & Yumurta",
    description: "Dokum tavada dinlendirilmis dana eti, poÅŸe yumurta ve otlu tereyagi",
    price: 18.5,
    image: "https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=1200&q=80",
    tags: ["bestseller", "glutenFree"],
    donenessRating: "medium",
    isFeatured: false,
    isAvailable: true
  },
  {
    id: "eggs-brioche",
    categoryId: "brunch",
    name: "Brioche Eggs Royale",
    description: "Kızarmış brioche üzerinde poşe yumurta, yeşillik ve tütsülenmiş somon",
    price: 12.4,
    image: "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?auto=format&fit=crop&w=1200&q=80",
    tags: ["containsNuts"],
    isFeatured: false,
    isAvailable: true
  },
  {
    id: "chocolate-tart",
    categoryId: "desserts",
    name: "Bitter Çikolatalı Tart",
    description: "%70 kakaolu ganaj tart, deniz tuzu ve espresso kırıntıları ile",
    price: 7.2,
    image: "https://images.unsplash.com/photo-1495214783159-3503fd1b572d?auto=format&fit=crop&w=1200&q=80",
    tags: ["vegetarian"],
    isFeatured: false,
    isAvailable: true
  },
  {
    id: "almond-croissant",
    categoryId: "desserts",
    name: "Bademli Kruvasan",
    description: "Tereyağlı katmanlar ve kavrulmuş badem kreması dolgusu",
    price: 5.7,
    image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=1200&q=80",
    tags: ["containsNuts", "bestseller"],
    isFeatured: false,
    isAvailable: false
  }
]

const getLocalizedMenuFallback = (locale: Locale): { categories: MenuCategory[]; items: MenuItem[] } => {
  void locale

  return {
    categories: menuCategorySeeds.map((category) => {
      return {
        id: category.id,
        name: category.name,
        description: category.description,
        order: category.order,
        icon: category.icon,
        imageUrl: category.imageUrl
      }
    }),
    items: menuItemSeeds.map((item) => {
      return {
        id: item.id,
        categoryId: item.categoryId,
        name: item.name,
        description: item.description,
        price: item.price,
        image: item.image,
        tags: item.tags,
        donenessRating: item.donenessRating,
        isFeatured: item.isFeatured,
        isAvailable: item.isAvailable
      }
    })
  }
}

export { getLocalizedMenuFallback }
