export type ContentPage = "home" | "about"

export type HomeContent = {
  heroBadge: string
  heroTitle: string
  heroDescription: string
  signatureTitle: string
  signaturePointOne: string
  signaturePointTwo: string
  signaturePointThree: string
  storyBadge: string
  storyTitle: string
  storyDescription: string
  storyHighlightOne: string
  storyHighlightTwo: string
  storyHighlightThree: string
  visitEyebrow: string
  visitTitle: string
  visitDescription: string
}

export type AboutContent = {
  badge: string
  title: string
  intro: string
  philosophyEyebrow: string
  philosophyDescription: string
  valuesEyebrow: string
  valuesTitle: string
  valuesDescription: string
  valueOneTitle: string
  valueOneDescription: string
  valueTwoTitle: string
  valueTwoDescription: string
  valueThreeTitle: string
  valueThreeDescription: string
  journeyEyebrow: string
  journeyTitle: string
  journeyDescription: string
}

export type ContactContent = {
  badge: string
  title: string
  description: string
  quickMessageTitle: string
  quickMessageDescription: string
  detailsEyebrow: string
  detailsTitle: string
  detailsDescription: string
  phone: string
  email: string
  address: string
  hours: string
  mapUrl: string
}

export type SiteArticle = {
  id: string
  page: ContentPage
  title: string
  excerpt: string
  content: string
  imageUrl: string | null
  author: string
  isPublished: boolean
  displayOrder: number
  createdAt: string
}

export type SiteContentBundle = {
  home: HomeContent
  about: AboutContent
  contact: ContactContent
  articles: SiteArticle[]
}
