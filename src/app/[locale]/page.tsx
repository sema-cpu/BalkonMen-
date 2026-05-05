import Image from "next/image"
import Link from "next/link"
import { ArrowRight, MapPin, Sparkles } from "lucide-react"
import { MenuCard } from "@/components/cards/menu-card"
import { Container } from "@/components/primitives/container"
import { HeadingBlock } from "@/components/primitives/heading-block"
import { Section } from "@/components/primitives/section"
import { SiteFooter } from "@/components/site/site-footer"
import { SiteHeader } from "@/components/site/site-header"
import { Button } from "@/components/ui/button"
import { PillBadge } from "@/components/ui/pill-badge"
import { isLocale, type Locale } from "@/i18n/config"
import { toLocalizedPath } from "@/i18n/routing"
import { getMenuData } from "@/lib/menu-data"
import { getPublishedArticlesByPage, getSiteContentData } from "@/lib/site-content-data"

const gallery = [
  "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1521017432531-fbd92d768814?auto=format&fit=crop&w=1200&q=80"
]

const testimonials: Array<{ quote: string; author: string }> = [
  { quote: "Atmosfer premium ama samimi. Yulafli flat white unutulmaz.", author: "Mina K." },
  { quote: "Hem hizli kahve molasi hem uzun calisma saatleri icin harika bir yer.", author: "Arda T." }
]

type LocalizedHomePageProps = {
  readonly params: Promise<{
    locale: string
  }>
}

const LocalizedHomePage = async ({ params }: LocalizedHomePageProps) => {
  const { locale: localeParam } = await params
  const locale: Locale = isLocale(localeParam) ? localeParam : "tr"
  const t = <T,>(tr: T, en: T) => (locale === "tr" ? tr : en)

  const [menuData, siteContentData, homeArticles] = await Promise.all([getMenuData(locale), getSiteContentData(locale), getPublishedArticlesByPage("home", locale)])
  const featuredItems = menuData.items.filter((item) => item.isFeatured).slice(0, 3)
  const homeContent = siteContentData.home

  return (
    <main id="main-content" lang={locale}>
      <SiteHeader activePath="/" locale={locale} />

      <Section className="border-none pt-8 md:pt-16">
        <Container>
          <div className="grid items-center gap-12 md:grid-cols-[1.1fr,0.9fr]">
            <div className="space-y-6">
              <PillBadge label={homeContent.heroBadge} />
              <h1 className="whitespace-pre-line font-heading text-4xl leading-tight text-foreground sm:text-5xl lg:text-6xl">{homeContent.heroTitle}</h1>
              <p className="max-w-2xl text-pretty text-base text-muted-foreground sm:text-lg">{homeContent.heroDescription}</p>
              <div className="flex flex-wrap gap-3 pt-2">
                <Button asChild size="lg">
                  <Link aria-label={t("Menu sayfasini ac", "Menu sayfasini ac")} href={toLocalizedPath(locale, "/menu")}>
                    {t("Menuyu Incele", "Menuyu Incele")} <ArrowRight aria-hidden className="size-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="secondary">
                  <Link aria-label={t("Ziyaret bolumune git", "Ziyaret bolumune git")} href="#visit-us">
                    {t("Bizi Bul", "Bizi Bul")} <MapPin aria-hidden className="size-4" />
                  </Link>
                </Button>
              </div>
            </div>
            <div className="rounded-2xl border border-border/80 bg-card/70 p-6 shadow-2xl shadow-primary/10 backdrop-blur-sm sm:p-8">
              <p className="mb-4 inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-primary">
                <Sparkles aria-hidden className="size-3.5" />
                {homeContent.signatureTitle}
              </p>
              <div className="space-y-4 text-sm text-muted-foreground">
                <p className="rounded-lg border border-border/70 bg-background/60 p-3">{homeContent.signaturePointOne}</p>
                <p className="rounded-lg border border-border/70 bg-background/60 p-3">{homeContent.signaturePointTwo}</p>
                <p className="rounded-lg border border-border/70 bg-background/60 p-3">{homeContent.signaturePointThree}</p>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      <Section id="signature">
        <Container>
          <HeadingBlock
            description={t("Konfor klasiklerini ve mevsimsel sef dokunuslarini dengeleyen secki.", "Konfor klasiklerini ve mevsimsel sef dokunuslarini dengeleyen secki.")}
            eyebrow={t("Imza seckiler", "Imza seckiler")}
            title={t("Misafirlerin favorileri", "Misafirlerin favorileri")}
          />
          {menuData.source === "local" ? (
            <p className="mb-5 text-xs text-primary/90">
              {t("Menu su an yerel demo verisiyle calisiyor. Canli icerik icin Supabase ortam degiskenlerini baglayin.", "Menu su an yerel demo verisiyle calisiyor. Canli icerik icin Supabase ortam degiskenlerini baglayin.")}
            </p>
          ) : null}
          {featuredItems.length > 0 ? (
            <div className="grid gap-5 md:grid-cols-3">
              {featuredItems.map((item) => {
                return <MenuCard item={item} key={item.id} locale={locale} />
              })}
            </div>
          ) : (
            <div className="rounded-xl border border-border/70 bg-card/60 p-5 text-sm text-muted-foreground">
              {t("En az bir urun one cikarilan olarak isaretlendiginde burada gosterilir.", "En az bir urun one cikarilan olarak isaretlendiginde burada gosterilir.")}
            </div>
          )}
        </Container>
      </Section>

      <Section id="story">
        <Container>
          <div className="grid gap-8 md:grid-cols-[0.95fr,1.05fr] md:items-center">
            <div className="space-y-4">
              <PillBadge label={homeContent.storyBadge} />
              <h2 className="font-heading text-3xl leading-tight sm:text-4xl">{homeContent.storyTitle}</h2>
              <p className="text-muted-foreground">{homeContent.storyDescription}</p>
            </div>
            <div className="rounded-2xl border border-border/80 bg-card/65 p-6">
              <div className="mt-4 flex flex-wrap gap-2">
                <PillBadge className="normal-case tracking-normal" label={homeContent.storyHighlightOne} />
                <PillBadge className="normal-case tracking-normal" label={homeContent.storyHighlightTwo} />
                <PillBadge className="normal-case tracking-normal" label={homeContent.storyHighlightThree} />
              </div>
            </div>
          </div>
        </Container>
      </Section>

      <Section id="gallery">
        <Container>
          <HeadingBlock
            description={t("Bar, mutfak ve oturma deneyimimizden kareler", "Bar, mutfak ve oturma deneyimimizden kareler")}
            eyebrow={t("Galeri", "Galeri")}
            title={t("Balkon Cafe icinden", "Balkon Cafe icinden")}
          />
          <div className="grid gap-4 md:grid-cols-3">
            {gallery.map((image, index) => {
              return (
                <div className="relative h-64 overflow-hidden rounded-2xl border border-border/70 bg-card/70" key={image}>
                  <Image alt={`Balkon Cafe ortamı ${index + 1}`} className="h-full w-full object-cover transition duration-500 hover:scale-105" fill sizes="(max-width: 768px) 100vw, 33vw" src={image} />
                </div>
              )
            })}
          </div>
        </Container>
      </Section>

      <Section id="reviews">
        <Container>
          <HeadingBlock
            description={t("Duzenli misafirlerimizin yorumlariyla dogrulanan kalite ve atmosfer", "Duzenli misafirlerimizin yorumlariyla dogrulanan kalite ve atmosfer")}
            eyebrow={t("Misafir yorumlari", "Misafir yorumlari")}
            title={t("Insanlar ne diyor", "Insanlar ne diyor")}
          />
          <div className="grid gap-4 md:grid-cols-2">
            {testimonials.map((item) => {
              return (
                <article className="rounded-2xl border border-border/70 bg-card/60 p-6" key={item.author}>
                  <p className="mb-4 text-foreground">“{item.quote}”</p>
                  <p className="text-sm text-muted-foreground">{item.author}</p>
                </article>
              )
            })}
          </div>
        </Container>
      </Section>

      <Section id="articles">
        <Container>
          <HeadingBlock
            description={t("Editoryal icerikler icerik yonetimi tarafindan dinamik olarak yonetilir.", "Editoryal icerikler icerik yonetimi tarafindan dinamik olarak yonetilir.")}
            eyebrow={t("Makaleler", "Makaleler")}
            title={t("Son hikayeler", "Son hikayeler")}
          />
          {siteContentData.source === "local" ? (
            <p className="mb-5 text-xs text-primary/90">
              {t("Site icerigi su an yerel varsayilanlarla calisiyor. Canli duzenleme icin Supabase ortam degiskenlerini baglayin.", "Site icerigi su an yerel varsayilanlarla calisiyor. Canli duzenleme icin Supabase ortam degiskenlerini baglayin.")}
            </p>
          ) : null}
          {homeArticles.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {homeArticles.map((article) => {
                return (
                  <article className="rounded-2xl border border-border/70 bg-card/60 p-6" key={article.id}>
                    <p className="text-xs uppercase tracking-[0.18em] text-primary">{article.author}</p>
                    <h3 className="mt-2 font-heading text-2xl">{article.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{article.excerpt || article.content.slice(0, 160)}</p>
                  </article>
                )
              })}
            </div>
          ) : (
            <div className="rounded-xl border border-border/70 bg-card/60 p-5 text-sm text-muted-foreground">
              {t("Yayimlanmis ana sayfa makaleleri eklendiginde burada gorunecek.", "Yayimlanmis ana sayfa makaleleri eklendiginde burada gorunecek.")}
            </div>
          )}
        </Container>
      </Section>

      <Section className="border-b-0" id="visit-us">
        <Container>
          <div className="grid gap-6 rounded-2xl border border-border/80 bg-card/65 p-6 md:grid-cols-[1fr,auto] md:items-center md:p-8">
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.2em] text-primary">{homeContent.visitEyebrow}</p>
              <h2 className="font-heading text-3xl">{homeContent.visitTitle}</h2>
              <p className="text-muted-foreground">{homeContent.visitDescription}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link aria-label={t("QR menu sayfasini ac", "QR menu sayfasini ac")} href={toLocalizedPath(locale, "/menu")}>
                  {t("QR Menuyu Ac", "QR Menuyu Ac")} <ArrowRight aria-hidden className="size-4" />
                </Link>
              </Button>
            </div>
          </div>
        </Container>
      </Section>

      <SiteFooter locale={locale} />
    </main>
  )
}

export default LocalizedHomePage
