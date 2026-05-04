import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, Leaf, Sparkles, Users } from "lucide-react"
import { Container } from "@/components/primitives/container"
import { HeadingBlock } from "@/components/primitives/heading-block"
import { Section } from "@/components/primitives/section"
import { SiteFooter } from "@/components/site/site-footer"
import { SiteHeader } from "@/components/site/site-header"
import { Button } from "@/components/ui/button"
import { PillBadge } from "@/components/ui/pill-badge"
import { isLocale, type Locale } from "@/i18n/config"
import { toLocalizedPath } from "@/i18n/routing"
import { getPublishedArticlesByPage, getSiteContentData } from "@/lib/site-content-data"

export const metadata: Metadata = {
  title: "Hakkimizda",
  description: "Balkon Café'nin hikayesini, degerlerini ve zanaat anlayisini kesfedin."
}

type LocalizedAboutPageProps = {
  readonly params: Promise<{
    locale: string
  }>
}

const LocalizedAboutPage = async ({ params }: LocalizedAboutPageProps) => {
  const { locale: localeParam } = await params
  const locale: Locale = isLocale(localeParam) ? localeParam : "tr"
  const t = <T,>(tr: T, en: T) => (locale === "tr" ? tr : en)

  const [siteContentData, aboutArticles] = await Promise.all([getSiteContentData(locale), getPublishedArticlesByPage("about", locale)])
  const aboutContent = siteContentData.about

  const values = [
    { icon: <Sparkles aria-hidden className="size-5" />, title: aboutContent.valueOneTitle, description: aboutContent.valueOneDescription },
    { icon: <Leaf aria-hidden className="size-5" />, title: aboutContent.valueTwoTitle, description: aboutContent.valueTwoDescription },
    { icon: <Users aria-hidden className="size-5" />, title: aboutContent.valueThreeTitle, description: aboutContent.valueThreeDescription }
  ]

  return (
    <main id="main-content" lang={locale}>
      <SiteHeader activePath="/about" locale={locale} />

      <Section className="border-none pt-8 md:pt-14">
        <Container>
          <div className="grid items-center gap-8 md:grid-cols-[1.1fr,0.9fr]">
            <div className="space-y-5">
              <PillBadge label={aboutContent.badge} />
              <h1 className="font-heading text-4xl leading-tight sm:text-5xl">{aboutContent.title}</h1>
              <p className="max-w-2xl text-base text-muted-foreground sm:text-lg">{aboutContent.intro}</p>
              <div className="flex flex-wrap gap-3">
                <Button asChild>
                  <Link aria-label={t("Menu sayfasini ac", "Menu sayfasini ac")} href={toLocalizedPath(locale, "/menu")}>
                    {t("Menuyu Kesfet", "Menuyu Kesfet")} <ArrowRight aria-hidden className="size-4" />
                  </Link>
                </Button>
                <Button asChild variant="secondary">
                  <Link aria-label={t("Iletisim sayfasini ac", "Iletisim sayfasini ac")} href={toLocalizedPath(locale, "/contact")}>
                    {t("Iletisime Gec", "Iletisime Gec")}
                  </Link>
                </Button>
              </div>
            </div>
            <div className="rounded-2xl border border-border/80 bg-card/65 p-6">
              <p className="text-xs uppercase tracking-[0.2em] text-primary">{aboutContent.philosophyEyebrow}</p>
              <p className="mt-3 text-sm text-muted-foreground">{aboutContent.philosophyDescription}</p>
            </div>
          </div>
        </Container>
      </Section>

      <Section id="values">
        <Container>
          <HeadingBlock description={aboutContent.valuesDescription} eyebrow={aboutContent.valuesEyebrow} title={aboutContent.valuesTitle} />
          <div className="grid gap-4 md:grid-cols-3">
            {values.map((value) => {
              return (
                <article className="rounded-2xl border border-border/80 bg-card/65 p-5" key={value.title}>
                  <div className="mb-3 inline-flex rounded-md bg-primary/15 p-2 text-primary">{value.icon}</div>
                  <h2 className="font-heading text-2xl">{value.title}</h2>
                  <p className="mt-2 text-sm text-muted-foreground">{value.description}</p>
                </article>
              )
            })}
          </div>
        </Container>
      </Section>

      <Section id="articles">
        <Container>
          <HeadingBlock description={aboutContent.journeyDescription} eyebrow={aboutContent.journeyEyebrow} title={aboutContent.journeyTitle} />
          {siteContentData.source === "local" ? (
            <p className="mb-5 text-xs text-primary/90">
              {t("Hakkimizda sayfasi su an yerel varsayilanlarla calisiyor. Canli duzenleme icin Supabase ortam degiskenlerini baglayin.", "Hakkimizda sayfasi su an yerel varsayilanlarla calisiyor. Canli duzenleme icin Supabase ortam degiskenlerini baglayin.")}
            </p>
          ) : null}
          {aboutArticles.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-3">
              {aboutArticles.map((article) => {
                return (
                  <article className="rounded-2xl border border-border/80 bg-card/65 p-5" key={article.id}>
                    <p className="text-xs uppercase tracking-[0.2em] text-primary">{article.author}</p>
                    <h3 className="mt-2 font-heading text-2xl">{article.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{article.excerpt || article.content.slice(0, 180)}</p>
                  </article>
                )
              })}
            </div>
          ) : (
            <div className="rounded-xl border border-border/70 bg-card/60 p-5 text-sm text-muted-foreground">
              {t("Yayimlanmis hakkimizda makaleleri eklendiginde burada gorunecek.", "Yayimlanmis hakkimizda makaleleri eklendiginde burada gorunecek.")}
            </div>
          )}
        </Container>
      </Section>

      <SiteFooter locale={locale} />
    </main>
  )
}

export default LocalizedAboutPage
