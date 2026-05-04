import Link from "next/link"
import { Globe, LayoutList, QrCode, Table2 } from "lucide-react"
import { MenuCard } from "@/components/cards/menu-card"
import { Button } from "@/components/ui/button"
import { isLocale, type Locale } from "@/i18n/config"
import { toLocalizedPath } from "@/i18n/routing"
import { resolveMenuCategoryIcon } from "@/lib/menu-category-icons"
import { getMenuData } from "@/lib/menu-data"

type LocalizedMenuPageProps = {
  readonly params: Promise<{
    locale: string
  }>
  readonly searchParams?: Promise<{
    view?: string
  }>
}

const LocalizedMenuPage = async ({ params, searchParams }: LocalizedMenuPageProps) => {
  const { locale: localeParam } = await params
  const resolvedSearchParams = searchParams instanceof Promise ? await searchParams : searchParams
  const locale: Locale = isLocale(localeParam) ? localeParam : "tr"
  const t = <T,>(tr: T, en: T) => (locale === "tr" ? tr : en)
  const alternateLocale: Locale = locale === "tr" ? "en" : "tr"
  const viewMode = resolvedSearchParams?.view === "table" ? "table" : "list"
  const localizedMenuPath = toLocalizedPath(locale, "/menu")

  const { categories, items, source } = await getMenuData(locale)
  const orderedCategories = [...categories].sort((a, b) => a.order - b.order)
  const itemsByCategoryId = items.reduce<Record<string, typeof items>>((acc, item) => {
    const currentCategoryItems = acc[item.categoryId] ?? []
    acc[item.categoryId] = [...currentCategoryItems, item]
    return acc
  }, {})

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
              <Link aria-label={t("Dili degistir", "Switch language")} href={`${toLocalizedPath(alternateLocale, "/menu")}?view=${viewMode}`}>
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

      <section className="mb-8 rounded-2xl border border-border/80 bg-card/75 p-5 shadow-lg shadow-primary/5">
        <h1 className="font-heading text-2xl">{t("Tara, sec, keyfini cikar", "Scan, choose, enjoy")}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {t("Kategorilere gore kesfedin ve hizlica karar verin. Diyet ve stok rozetleri her urunde gosterilir.", "Explore by category and tap any dish to quickly decide. Dietary and availability badges are shown on each item.")}
        </p>
        {source === "local" ? (
          <p className="mt-2 text-xs text-primary/90">{t("Yerel demo menu verisi kullaniliyor. Canli veriye gecmek icin Supabase ortam degiskenlerini baglayin.", "Using local demo menu data. Connect Supabase env values to switch to live data.")}</p>
        ) : null}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div aria-label={t("Menu gorunumu secici", "Menu view switcher")} className="inline-flex rounded-full border border-border/80 bg-background/80 p-1">
            <Link
              aria-label={t("Liste gorunumu", "List view")}
              className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs transition-colors ${
                viewMode === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"
              }`}
              href={`${localizedMenuPath}?view=list`}
            >
              <LayoutList aria-hidden className="size-3.5" />
              {t("Liste", "List")}
            </Link>
            <Link
              aria-label={t("Tablo gorunumu", "Table view")}
              className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs transition-colors ${
                viewMode === "table" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"
              }`}
              href={`${localizedMenuPath}?view=table`}
            >
              <Table2 aria-hidden className="size-3.5" />
              {t("Tablo", "Table")}
            </Link>
          </div>
          <p className="text-xs text-muted-foreground">
            {t("Toplam urun", "Total items")}: <span className="font-medium text-foreground">{items.length}</span>
          </p>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-5">
          {orderedCategories.map((category) => {
            const CategoryIcon = resolveMenuCategoryIcon(category.icon)
            const categoryItems = itemsByCategoryId[category.id] ?? []

            return (
              <Link
                aria-label={t(`${category.name} kategorisine git`, `Jump to ${category.name} category`)}
                className="group flex aspect-square flex-col items-center justify-center gap-1 rounded-full border border-border/80 bg-background/85 p-3 text-center transition-colors hover:bg-secondary"
                href={`#${category.id}`}
                key={category.id}
              >
                <span className="inline-flex size-10 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-primary transition-transform group-hover:scale-105">
                  <CategoryIcon aria-hidden className="size-5" />
                </span>
                <span className="line-clamp-1 text-xs font-medium leading-tight">{category.name}</span>
                <span className="rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">{categoryItems.length}</span>
              </Link>
            )
          })}
        </div>
      </section>

      <div className="space-y-10">
        {orderedCategories.map((category) => {
          const categoryItems = itemsByCategoryId[category.id] ?? []
          const CategoryIcon = resolveMenuCategoryIcon(category.icon)

          return (
            <section className="space-y-5 rounded-3xl border border-border/70 bg-card/55 p-4 sm:p-6" id={category.id} key={category.id}>
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs uppercase tracking-wide text-primary">
                  <span className="inline-flex size-5 items-center justify-center rounded-full bg-primary/15">
                    <CategoryIcon aria-hidden className="size-3" />
                  </span>
                  {category.name}
                </div>
                <p className="text-sm text-muted-foreground">{category.description}</p>
              </div>
              {categoryItems.length > 0 ? (
                viewMode === "list" ? (
                  <div className="grid gap-4 md:grid-cols-2">
                    {categoryItems.map((item) => {
                      return <MenuCard item={item} key={item.id} locale={locale} />
                    })}
                  </div>
                ) : (
                  <div className="overflow-hidden rounded-2xl border border-border/80 bg-background/75">
                    <div className="hidden md:block">
                      <table className="w-full text-left text-sm">
                        <thead className="border-b border-border/80 bg-secondary/50 text-muted-foreground">
                          <tr>
                            <th className="px-4 py-3 font-medium">{t("Urun", "Item")}</th>
                            <th className="px-4 py-3 font-medium">{t("Aciklama", "Description")}</th>
                            <th className="px-4 py-3 font-medium">{t("Etiketler", "Tags")}</th>
                            <th className="px-4 py-3 text-right font-medium">{t("Fiyat", "Price")}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {categoryItems.map((item) => {
                            return (
                              <tr className="border-b border-border/70 last:border-0" key={item.id}>
                                <td className="px-4 py-3 font-medium text-foreground">{item.name}</td>
                                <td className="px-4 py-3 text-muted-foreground">{item.description}</td>
                                <td className="px-4 py-3 text-muted-foreground">{item.tags.join(", ") || "-"}</td>
                                <td className="px-4 py-3 text-right font-medium text-primary">${item.price.toFixed(2)}</td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>

                    <div className="grid gap-2 p-3 md:hidden">
                      {categoryItems.map((item) => {
                        return (
                          <article className="rounded-xl border border-border/70 bg-card/70 p-3" key={item.id}>
                            <div className="flex items-start justify-between gap-3">
                              <p className="font-medium text-foreground">{item.name}</p>
                              <p className="text-sm font-medium text-primary">${item.price.toFixed(2)}</p>
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">{item.description}</p>
                            <p className="mt-2 text-[11px] uppercase tracking-wide text-muted-foreground">
                              {item.tags.join(" • ") || t("Etiket yok", "No tags")}
                            </p>
                          </article>
                        )
                      })}
                    </div>
                  </div>
                )
              ) : (
                <p className="rounded-xl border border-border/70 bg-background/65 px-4 py-3 text-sm text-muted-foreground">
                  {t("Bu kategoride su an gosterilecek urun yok.", "There are no visible items in this category right now.")}
                </p>
              )}
            </section>
          )
        })}
      </div>
    </main>
  )
}

export default LocalizedMenuPage
