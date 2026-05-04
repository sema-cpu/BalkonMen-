import Image from "next/image"
import Link from "next/link"
import { Globe, LayoutList, QrCode, Table2 } from "lucide-react"
import { MenuCard } from "@/components/cards/menu-card"
import { Button } from "@/components/ui/button"
import { isLocale, type Locale } from "@/i18n/config"
import { toLocalizedPath } from "@/i18n/routing"
import { resolveMenuCategoryIcon } from "@/lib/menu-category-icons"
import { getMenuData } from "@/lib/menu-data"

const categoryCircleImageByKey: Record<string, string> = {
  coffee: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80",
  "cold-drinks": "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80",
  "cup-soda": "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80",
  brunch: "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=800&q=80",
  sandwich: "https://images.unsplash.com/photo-1550507992-eb63ffee0847?auto=format&fit=crop&w=800&q=80",
  desserts: "https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&w=800&q=80",
  "cake-slice": "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=800&q=80",
  "ice-cream-bowl": "https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=800&q=80",
  "utensils-crossed": "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=800&q=80",
  all: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800&q=80",
  default: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800&q=80"
}

const resolveCategoryCircleImage = (categoryId: string, categoryImageUrl?: string, categoryIcon?: string) => {
  if (categoryImageUrl && categoryImageUrl.trim().length > 0) {
    return categoryImageUrl
  }

  return categoryCircleImageByKey[categoryId] ?? categoryCircleImageByKey[categoryIcon ?? ""] ?? categoryCircleImageByKey.default
}

type LocalizedMenuPageProps = {
  readonly params: Promise<{
    locale: string
  }>
  readonly searchParams?: Promise<{
    view?: string
    category?: string
  }>
}

const LocalizedMenuPage = async ({ params, searchParams }: LocalizedMenuPageProps) => {
  const { locale: localeParam } = await params
  const resolvedSearchParams = searchParams instanceof Promise ? await searchParams : searchParams
  const locale: Locale = isLocale(localeParam) ? localeParam : "tr"
  const t = <T,>(tr: T, en: T) => (locale === "tr" ? tr : en)

  const viewMode = resolvedSearchParams?.view === "table" ? "table" : "list"

  const { categories, items, source } = await getMenuData(locale)
  const orderedCategories = [...categories].sort((a, b) => a.order - b.order)
  const itemsByCategoryId = items.reduce<Record<string, typeof items>>((acc, item) => {
    const currentCategoryItems = acc[item.categoryId] ?? []
    acc[item.categoryId] = [...currentCategoryItems, item]
    return acc
  }, {})
  const categoryById = orderedCategories.reduce<Record<string, (typeof orderedCategories)[number]>>((acc, category) => {
    acc[category.id] = category
    return acc
  }, {})
  const requestedCategoryId = resolvedSearchParams?.category ?? "all"
  const selectedCategoryId = requestedCategoryId === "all" || categoryById[requestedCategoryId] ? requestedCategoryId : "all"
  const selectedCategory = selectedCategoryId === "all" ? null : categoryById[selectedCategoryId]
  const SelectedCategoryIcon = selectedCategory ? resolveMenuCategoryIcon(selectedCategory.icon) : null
  const displayedItems =
    selectedCategoryId === "all"
      ? orderedCategories.flatMap((category) => {
          return itemsByCategoryId[category.id] ?? []
        })
      : itemsByCategoryId[selectedCategoryId] ?? []

  const buildMenuHref = (targetLocale: Locale, nextView: "list" | "table", nextCategoryId: string) => {
    const pathname = toLocalizedPath(targetLocale, "/menu")
    const query = new URLSearchParams()

    if (nextView !== "list") {
      query.set("view", nextView)
    }

    if (nextCategoryId !== "all") {
      query.set("category", nextCategoryId)
    }

    const queryText = query.toString()
    return queryText ? `${pathname}?${queryText}` : pathname
  }

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
          {t(
            "Kategorilerden birini secerek yalnizca o bolumu goruntuleyebilir veya tum menuyu tek bir akista inceleyebilirsiniz.",
            "Choose a category to focus on one section, or keep the full menu visible in one continuous flow."
          )}
        </p>
        {source === "local" ? (
          <p className="mt-2 text-xs text-primary/90">
            {t(
              "Yerel demo menu verisi kullaniliyor. Canli veriye gecmek icin Supabase ortam degiskenlerini baglayin.",
              "Using local demo menu data. Connect Supabase env values to switch to live data."
            )}
          </p>
        ) : null}

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div aria-label={t("Menu gorunumu secici", "Menu view switcher")} className="inline-flex rounded-full border border-border/80 bg-background/80 p-1">
            <Link
              aria-label={t("Liste gorunumu", "List view")}
              className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs transition-colors ${
                viewMode === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"
              }`}
              href={buildMenuHref(locale, "list", selectedCategoryId)}
            >
              <LayoutList aria-hidden className="size-3.5" />
              {t("Liste", "List")}
            </Link>
            <Link
              aria-label={t("Tablo gorunumu", "Table view")}
              className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs transition-colors ${
                viewMode === "table" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"
              }`}
              href={buildMenuHref(locale, "table", selectedCategoryId)}
            >
              <Table2 aria-hidden className="size-3.5" />
              {t("Tablo", "Table")}
            </Link>
          </div>
          <p className="text-xs text-muted-foreground">
            {t("Toplam urun", "Total items")}: <span className="font-medium text-foreground">{displayedItems.length}</span>
          </p>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-5">
          <Link
            aria-label={t("Tum menuyu goster", "Show full menu")}
            className={`group flex flex-col items-center text-center ${selectedCategoryId === "all" ? "opacity-100" : "opacity-85 hover:opacity-100"}`}
            href={buildMenuHref(locale, viewMode, "all")}
          >
            <span className="relative inline-flex size-24 overflow-hidden rounded-full border border-border/80 ring-2 ring-background transition-transform group-hover:scale-[1.03] sm:size-28">
              <Image alt={t("Tum menu", "All menu")} className="object-cover" fill sizes="112px" src={categoryCircleImageByKey.all} />
              <span className="absolute inset-0 bg-gradient-to-t from-black/20 via-black/5 to-transparent" />
              <span className="absolute bottom-1 right-1 rounded-full bg-background/90 px-2 py-0.5 text-[11px] font-medium text-foreground shadow-sm">{items.length}</span>
            </span>
            <span className="mt-2 line-clamp-1 text-sm font-semibold leading-tight text-foreground">{t("Tum Menu", "All Menu")}</span>
          </Link>

          {orderedCategories.map((category) => {
            const categoryItems = itemsByCategoryId[category.id] ?? []
            const categoryImage = resolveCategoryCircleImage(category.id, category.imageUrl, category.icon)
            const isSelected = selectedCategoryId === category.id

            return (
              <Link
                aria-label={t(`${category.name} kategorisini goster`, `Show ${category.name} category`)}
                className={`group flex flex-col items-center text-center ${isSelected ? "opacity-100" : "opacity-85 hover:opacity-100"}`}
                href={buildMenuHref(locale, viewMode, category.id)}
                key={category.id}
              >
                <span className="relative inline-flex size-24 overflow-hidden rounded-full border border-border/80 ring-2 ring-background transition-transform group-hover:scale-[1.03] sm:size-28">
                  <Image alt={category.name} className="object-cover" fill sizes="112px" src={categoryImage} />
                  <span className="absolute inset-0 bg-gradient-to-t from-black/20 via-black/5 to-transparent" />
                  <span className="absolute bottom-1 right-1 rounded-full bg-background/90 px-2 py-0.5 text-[11px] font-medium text-foreground shadow-sm">
                    {categoryItems.length}
                  </span>
                </span>
                <span className="mt-2 line-clamp-1 text-sm font-semibold leading-tight text-foreground">{category.name}</span>
              </Link>
            )
          })}
        </div>
      </section>

      <section className="space-y-5 rounded-3xl border border-border/70 bg-card/55 p-4 sm:p-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs uppercase tracking-wide text-primary">
            {selectedCategory ? (
              <>
                <span className="inline-flex size-5 items-center justify-center rounded-full bg-primary/15">
                  {SelectedCategoryIcon ? <SelectedCategoryIcon aria-hidden className="size-3" /> : null}
                </span>
                {selectedCategory.name}
              </>
            ) : (
              <>{t("Tum Menu", "All Menu")}</>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {selectedCategory
              ? selectedCategory.description
              : t(
                  "Varsayilan gorunumde tum urunler tek bir bolumde, asagidan yukariya tek liste olarak gosterilir.",
                  "On first load, all menu items are shown in a single continuous section."
                )}
          </p>
        </div>

        {displayedItems.length > 0 ? (
          viewMode === "list" ? (
            <div className="grid gap-4 md:grid-cols-2">
              {displayedItems.map((item) => {
                return <MenuCard item={item} key={item.id} locale={locale} />
              })}
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-border/80 bg-background/75">
              <div className="hidden md:block">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-border/80 bg-secondary/50 text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3 font-medium">{t("Kategori", "Category")}</th>
                      <th className="px-4 py-3 font-medium">{t("Urun", "Item")}</th>
                      <th className="px-4 py-3 font-medium">{t("Aciklama", "Description")}</th>
                      <th className="px-4 py-3 font-medium">{t("Etiketler", "Tags")}</th>
                      <th className="px-4 py-3 text-right font-medium">{t("Fiyat", "Price")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayedItems.map((item) => {
                      const itemCategoryName = categoryById[item.categoryId]?.name ?? "-"

                      return (
                        <tr className="border-b border-border/70 last:border-0" key={item.id}>
                          <td className="px-4 py-3 text-muted-foreground">{itemCategoryName}</td>
                          <td className="px-4 py-3 font-medium text-foreground">{item.name}</td>
                          <td className="px-4 py-3 text-muted-foreground">{item.description}</td>
                          <td className="px-4 py-3 text-muted-foreground">{item.tags.join(", ") || "-"}</td>
                          <td className="px-4 py-3 text-right font-medium text-primary">₺{item.price.toFixed(2)}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              <div className="grid gap-2 p-3 md:hidden">
                {displayedItems.map((item) => {
                  const itemCategoryName = categoryById[item.categoryId]?.name ?? "-"

                  return (
                    <article className="rounded-xl border border-border/70 bg-card/70 p-3" key={item.id}>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs uppercase tracking-wide text-muted-foreground">{itemCategoryName}</p>
                          <p className="font-medium text-foreground">{item.name}</p>
                        </div>
                        <p className="text-sm font-medium text-primary">₺{item.price.toFixed(2)}</p>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">{item.description}</p>
                      <p className="mt-2 text-[11px] uppercase tracking-wide text-muted-foreground">{item.tags.join(" • ") || t("Etiket yok", "No tags")}</p>
                    </article>
                  )
                })}
              </div>
            </div>
          )
        ) : (
          <p className="rounded-xl border border-border/70 bg-background/65 px-4 py-3 text-sm text-muted-foreground">
            {t("Bu secimde gosterilecek urun yok.", "There are no visible items for this selection right now.")}
          </p>
        )}
      </section>
    </main>
  )
}

export default LocalizedMenuPage
