import Link from "next/link"
import { Globe, QrCode } from "lucide-react"
import { MenuCard } from "@/components/cards/menu-card"
import { Button } from "@/components/ui/button"
import { PillBadge } from "@/components/ui/pill-badge"
import { isLocale, type Locale } from "@/i18n/config"
import { toLocalizedPath } from "@/i18n/routing"
import { getMenuData } from "@/lib/menu-data"

type LocalizedMenuPageProps = {
  readonly params: Promise<{
    locale: string
  }>
}

const LocalizedMenuPage = async ({ params }: LocalizedMenuPageProps) => {
  const { locale: localeParam } = await params
  const locale: Locale = isLocale(localeParam) ? localeParam : "tr"
  const t = <T,>(tr: T, en: T) => (locale === "tr" ? tr : en)
  const alternateLocale: Locale = locale === "tr" ? "en" : "tr"

  const { categories, items, source } = await getMenuData(locale)
  const orderedCategories = [...categories].sort((a, b) => a.order - b.order)

  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-4 pb-10 pt-5 sm:px-6" id="main-content" lang={locale}>
      <header className="sticky top-3 z-20 mb-6 rounded-xl border border-border/80 bg-card/85 p-3 backdrop-blur">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="rounded-md bg-primary/15 p-2">
              <QrCode aria-hidden className="size-4 text-primary" />
            </div>
            <div>
              <p className="font-heading text-lg">{t("Balkon Cafe Menu", "Balkon Café Menu")}</p>
              <p className="text-xs text-muted-foreground">{t("QR odakli deneyim", "QR-first experience")}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild size="default" variant="outline">
              <Link aria-label={t("Dili degistir", "Switch language")} href={toLocalizedPath(alternateLocale, "/menu")}>
                {alternateLocale.toUpperCase()}
              </Link>
            </Button>
            <Button asChild size="default" variant="secondary">
              <Link aria-label={t("Tanitim sitesine git", "Navigate to promotional website")} href={toLocalizedPath(locale, "/")}>
                <Globe aria-hidden className="size-4" />
                {t("Siteye Don", "Visit Website")}
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <section className="mb-8 rounded-xl border border-border/80 bg-card/70 p-5">
        <h1 className="font-heading text-2xl">{t("Tara, sec, keyfini cikar", "Scan, choose, enjoy")}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {t("Kategorilere gore kesfedin ve hizlica karar verin. Diyet ve stok rozetleri her urunde gosterilir.", "Explore by category and tap any dish to quickly decide. Dietary and availability badges are shown on each item.")}
        </p>
        {source === "local" ? (
          <p className="mt-2 text-xs text-primary/90">{t("Yerel demo menu verisi kullaniliyor. Canli veriye gecmek icin Supabase ortam degiskenlerini baglayin.", "Using local demo menu data. Connect Supabase env values to switch to live data.")}</p>
        ) : null}
        <div className="mt-4 flex flex-wrap gap-2">
          {orderedCategories.map((category) => {
            return (
              <Button asChild key={category.id} size="default" variant="ghost">
                <Link aria-label={t(`${category.name} kategorisine git`, `Jump to ${category.name} category`)} href={`#${category.id}`}>
                  {category.name}
                </Link>
              </Button>
            )
          })}
        </div>
      </section>

      <div className="space-y-10">
        {orderedCategories.map((category) => {
          const categoryItems = items.filter((item) => item.categoryId === category.id)

          return (
            <section className="space-y-5" id={category.id} key={category.id}>
              <div className="space-y-2">
                <PillBadge label={category.name} />
                <p className="text-sm text-muted-foreground">{category.description}</p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {categoryItems.map((item) => {
                  return <MenuCard item={item} key={item.id} locale={locale} />
                })}
              </div>
            </section>
          )
        })}
      </div>
    </main>
  )
}

export default LocalizedMenuPage
