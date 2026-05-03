import type { Locale } from "@/i18n/config"
import type { AboutContent, ContactContent, HomeContent } from "@/types/site-content"

type LocalizedContent<T extends Record<string, string>> = Record<Locale, T>

const defaultHomeContentByLocale: LocalizedContent<HomeContent> = {
  en: {
    heroBadge: "Modern dark café experience",
    heroTitle: "Crafted coffee, elevated ambiance",
    heroDescription: "Discover artisan brews, seasonal brunch, and a refined atmosphere built for calm mornings and slow evenings.",
    signatureTitle: "Signature Promise",
    signaturePointOne: "House-roasted coffee and hand-built drinks",
    signaturePointTwo: "Minimal, welcoming, and thoughtfully lit interior",
    signaturePointThree: "Fast QR menu flow with effortless website navigation",
    storyBadge: "Our story",
    storyTitle: "An urban retreat inspired by slow coffee culture",
    storyDescription:
      "Balkon Café was designed for people who value flavor, craft, and atmosphere. Every menu decision starts with quality ingredients and ends with a memorable table experience.",
    storyHighlightOne: "Single-origin coffee",
    storyHighlightTwo: "Seasonal brunch",
    storyHighlightThree: "Crafted desserts",
    visitEyebrow: "Visit us",
    visitTitle: "Open daily in the heart of the city",
    visitDescription: "Kültür Avenue 24, Istanbul • Mon-Sun 08:00-22:30 • +90 212 000 00 00"
  },
  tr: {
    heroBadge: "Modern karanlık kafe deneyimi",
    heroTitle: "Özenle hazırlanmış kahve, seçkin atmosfer",
    heroDescription: "Sakin sabahlar ve uzun akşamlar için tasarlanmış rafine bir ortamda, zanaat kahveleri ve mevsimsel brunch lezzetlerini keşfedin.",
    signatureTitle: "İmza yaklaşımımız",
    signaturePointOne: "Kendi kavrumumuz kahveler ve elde hazırlanan içecekler",
    signaturePointTwo: "Minimal, davetkar ve özenle aydınlatılmış iç mekan",
    signaturePointThree: "Hızlı QR menü akışı ve web sitesine kolay geçiş",
    storyBadge: "Hikayemiz",
    storyTitle: "Yavaş kahve kültüründen ilham alan şehir kaçamağı",
    storyDescription:
      "Balkon Café; lezzete, zanaata ve atmosfere değer verenler için tasarlandı. Menüdeki her karar kaliteli malzemeyle başlar, unutulmaz bir masa deneyimiyle tamamlanır.",
    storyHighlightOne: "Single-origin kahve",
    storyHighlightTwo: "Mevsimsel brunch",
    storyHighlightThree: "Özel tatlılar",
    visitEyebrow: "Bizi ziyaret edin",
    visitTitle: "Şehrin merkezinde her gün açığız",
    visitDescription: "Kültür Caddesi 24, İstanbul • Pzt-Paz 08:00-22:30 • +90 212 000 00 00"
  }
}

const defaultAboutContentByLocale: LocalizedContent<AboutContent> = {
  en: {
    badge: "About Balkon Café",
    title: "A modern café rooted in craft, atmosphere, and people",
    intro: "We designed Balkon Café as a refined but accessible destination where coffee quality, brunch creativity, and thoughtful service come together in one elegant experience.",
    philosophyEyebrow: "Our philosophy",
    philosophyDescription: "We believe exceptional café experiences come from clarity: clear menus, balanced flavors, and spaces that let guests slow down and enjoy each moment.",
    valuesEyebrow: "Our values",
    valuesTitle: "How we design every visit",
    valuesDescription: "The core principles shaping our drinks, kitchen, and guest experience.",
    valueOneTitle: "Craft-first quality",
    valueOneDescription: "Every drink and plate is built around consistency, ingredient quality, and flavor balance.",
    valueTwoTitle: "Seasonal ingredients",
    valueTwoDescription: "Menus evolve with seasonal produce and fresh pairings to keep the experience lively and relevant.",
    valueThreeTitle: "Warm hospitality",
    valueThreeDescription: "Premium design and calm service rhythms make each visit feel welcoming and effortless.",
    journeyEyebrow: "Our journey",
    journeyTitle: "Built for modern café culture",
    journeyDescription: "A concise timeline of our growth and digital evolution."
  },
  tr: {
    badge: "Balkon Café Hakkında",
    title: "Zanaat, atmosfer ve insan odaklı modern bir kafe",
    intro: "Balkon Café’yi; kahve kalitesi, brunch yaratıcılığı ve özenli servisin tek bir zarif deneyimde buluştuğu rafine ama ulaşılabilir bir buluşma noktası olarak tasarladık.",
    philosophyEyebrow: "Felsefemiz",
    philosophyDescription: "Etkileyici kafe deneyimlerinin netlikten doğduğuna inanıyoruz: anlaşılır menüler, dengeli lezzetler ve misafirin yavaşlayıp anın tadını çıkarabileceği mekanlar.",
    valuesEyebrow: "Değerlerimiz",
    valuesTitle: "Her ziyareti nasıl tasarlıyoruz",
    valuesDescription: "İçeceklerimize, mutfağımıza ve misafir deneyimimize yön veren temel ilkeler.",
    valueOneTitle: "Zanaat odaklı kalite",
    valueOneDescription: "Her içecek ve tabak; tutarlılık, malzeme kalitesi ve lezzet dengesi odağında hazırlanır.",
    valueTwoTitle: "Mevsimsel malzemeler",
    valueTwoDescription: "Menüler, deneyimi canlı ve güncel tutmak için mevsimsel ürünler ve taze eşleşmelerle yenilenir.",
    valueThreeTitle: "Samimi misafirperverlik",
    valueThreeDescription: "Nitelikli tasarım ve sakin servis ritmi, her ziyareti sıcak ve zahmetsiz hissettirir.",
    journeyEyebrow: "Yolculuğumuz",
    journeyTitle: "Modern kafe kültürü için inşa edildi",
    journeyDescription: "Büyümemizin ve dijital dönüşümümüzün kısa özeti."
  }
}

const defaultContactContentByLocale: LocalizedContent<ContactContent> = {
  en: {
    badge: "Contact Balkon Café",
    title: "Let’s plan your next visit",
    description: "Reach out for reservation questions, event inquiries, partnerships, or feedback. We respond quickly and keep communication clear and friendly.",
    quickMessageTitle: "Quick Message",
    quickMessageDescription: "This opens your email client with all details prefilled.",
    detailsEyebrow: "Contact details",
    detailsTitle: "All communication options in one place",
    detailsDescription: "Pick the channel that works best for your request.",
    phone: "+90 212 000 00 00",
    email: "hello@balkoncafe.com",
    address: "Kültür Avenue 24, Istanbul",
    hours: "Mon-Sun 08:00-22:30",
    mapUrl: "https://maps.google.com/?q=Istanbul"
  },
  tr: {
    badge: "Balkon Café İletişim",
    title: "Bir sonraki ziyaretinizi birlikte planlayalım",
    description: "Rezervasyon soruları, etkinlik talepleri, iş birlikleri veya geri bildirimler için bize ulaşın. Hızlı yanıt verir, iletişimi net ve samimi tutarız.",
    quickMessageTitle: "Hızlı Mesaj",
    quickMessageDescription: "Bu form, e-posta istemcinizi bilgiler hazır şekilde açar.",
    detailsEyebrow: "İletişim bilgileri",
    detailsTitle: "Tüm iletişim kanalları tek yerde",
    detailsDescription: "Talebinize en uygun kanalı seçin.",
    phone: "+90 212 000 00 00",
    email: "hello@balkoncafe.com",
    address: "Kültür Caddesi 24, İstanbul",
    hours: "Pzt-Paz 08:00-22:30",
    mapUrl: "https://maps.google.com/?q=Istanbul"
  }
}

const defaultHomeContent = defaultHomeContentByLocale.en
const defaultAboutContent = defaultAboutContentByLocale.en
const defaultContactContent = defaultContactContentByLocale.en

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

const mergeStringContent = <T extends Record<string, string>>(defaults: T, candidate: unknown): T => {
  if (!isRecord(candidate)) {
    return defaults
  }

  return (Object.keys(defaults) as Array<keyof T>).reduce<T>((acc, key) => {
    const value = candidate[key]
    if (typeof value === "string") {
      acc[key] = value
    }
    return acc
  }, { ...defaults })
}

const mergeLocalizedStringContent = <T extends Record<string, string>>(defaultsByLocale: LocalizedContent<T>, candidate: unknown, locale: Locale): T => {
  const defaults = defaultsByLocale[locale]

  if (!isRecord(candidate)) {
    return defaults
  }

  const localizedCandidate = candidate[locale]

  if (isRecord(localizedCandidate)) {
    return mergeStringContent(defaults, localizedCandidate)
  }

  return mergeStringContent(defaults, candidate)
}

export {
  defaultAboutContent,
  defaultAboutContentByLocale,
  defaultContactContent,
  defaultContactContentByLocale,
  defaultHomeContent,
  defaultHomeContentByLocale,
  isRecord,
  mergeLocalizedStringContent,
  mergeStringContent
}
