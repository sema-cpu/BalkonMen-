import type { AboutContent, ContactContent, HomeContent } from "@/types/site-content"

const defaultHomeContent: HomeContent = {
  heroBadge: "Modern yumuşak kafe deneyimi",
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

const defaultAboutContent: AboutContent = {
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

const defaultContactContent: ContactContent = {
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

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

const mergeStringContent = <T extends Record<string, string>>(defaults: T, candidate: unknown): T => {
  if (!isRecord(candidate)) {
    return defaults
  }

  const candidateByKey = candidate as Partial<Record<Extract<keyof T, string>, unknown>>
  const merged = { ...defaults } as Record<Extract<keyof T, string>, string>

  ;(Object.keys(defaults) as Array<Extract<keyof T, string>>).forEach((key) => {
    const value = candidateByKey[key]
    if (typeof value === "string") {
      merged[key] = value
    }
  })

  return merged as T
}

export { defaultAboutContent, defaultContactContent, defaultHomeContent, mergeStringContent }
