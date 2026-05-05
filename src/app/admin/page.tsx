import Link from "next/link"
import { redirect } from "next/navigation"
import type { ReactNode } from "react"
import { ArrowLeft, CheckCircle2, FileText, Globe2, Layers3, LogOut, Package, ShieldCheck, Sparkles } from "lucide-react"
import {
  createSiteArticleAction,
  deleteSiteArticleAction,
  initializeAdminAccessAction,
  signOutAdminAction,
  updateAboutContentAction,
  updateContactContentAction,
  updateHomeContentAction,
  updateSiteArticleAction
} from "@/app/admin/actions"
import { CategoriesAdminSection } from "@/app/admin/categories-admin-section"
import { ProductsAdminSection } from "@/app/admin/products-admin-section"
import { defaultAboutContent, defaultContactContent, defaultHomeContent, mergeStringContent } from "@/data/site-content"
import { Button } from "@/components/ui/button"
import { isRecoverableSupabaseAuthError } from "@/lib/supabase/auth-errors"
import { createSupabaseAdminClient } from "@/lib/supabase/admin"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import type { Database } from "@/types/database"

type CategoryRow = Database["public"]["Tables"]["menu_categories"]["Row"]
type MenuItemRow = Database["public"]["Tables"]["menu_items"]["Row"]
type TagRow = Database["public"]["Tables"]["menu_item_tags"]["Row"]
type SiteContentEntryRow = Database["public"]["Tables"]["site_content_entries"]["Row"]
type SiteArticleRow = Database["public"]["Tables"]["site_articles"]["Row"]

type AdminPageProps = {
  readonly searchParams?: Promise<{
    readonly status?: string
    readonly workspace?: string
  }>
}

type StatCardProps = {
  readonly title: string
  readonly value: string
  readonly hint: string
  readonly icon: ReactNode
}

type AdminWorkspace = "overview" | "content" | "articles" | "categories" | "products"

const statusMessageMap: Record<string, string> = {
  "admin-initialized": "Yonetici erisimi basariyla olusturuldu",
  "category-created": "Kategori basariyla olusturuldu",
  "category-updated": "Kategori basariyla guncellendi",
  "category-deleted": "Kategori basariyla silindi",
  "product-created": "Urun basariyla olusturuldu",
  "product-updated": "Urun basariyla guncellendi",
  "product-deleted": "Urun basariyla silindi",
  "site-home-updated": "Ana sayfa icerigi basariyla guncellendi",
  "site-about-updated": "Hakkimizda sayfasi icerigi basariyla guncellendi",
  "site-contact-updated": "Iletisim sayfasi icerigi basariyla guncellendi",
  "site-article-created": "Makale basariyla olusturuldu",
  "site-article-updated": "Makale basariyla guncellendi",
  "site-article-deleted": "Makale basariyla silindi"
}

const inputClassName =
  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring"
const textareaClassName =
  "min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring"
const checkboxClassName = "size-4 rounded border-input bg-background"

const StatCard = ({ title, value, hint, icon }: StatCardProps) => {
  return (
    <article className="rounded-xl border border-border/80 bg-card/70 p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{title}</p>
        <div className="rounded-md bg-primary/15 p-2 text-primary">{icon}</div>
      </div>
      <p className="font-heading text-3xl text-foreground">{value}</p>
      <p className="mt-1 text-sm text-muted-foreground">{hint}</p>
    </article>
  )
}

const adminWorkspaceItems: Array<{ id: AdminWorkspace; label: string }> = [
  { id: "overview", label: "Genel Bakis" },
  { id: "content", label: "Icerik" },
  { id: "articles", label: "Makaleler" },
  { id: "categories", label: "Kategoriler" },
  { id: "products", label: "Urunler" }
]

const AdminPage = async ({ searchParams }: AdminPageProps) => {
  const resolvedSearchParams = searchParams instanceof Promise ? await searchParams : searchParams
  const sessionClient = await createSupabaseServerClient()
  const {
    data: { user },
    error: userError
  } = await sessionClient.auth.getUser()

  if (userError) {
    if (isRecoverableSupabaseAuthError(userError)) {
      redirect("/admin/login")
    }

    throw userError
  }

  if (!user) {
    redirect("/admin/login")
  }

  const supabaseAdmin = createSupabaseAdminClient()

  const [{ data: adminProfile, error: adminProfileError }, { count: adminCount, error: adminCountError }] = await Promise.all([
    supabaseAdmin.from("admin_profiles").select("id").eq("id", user.id).maybeSingle(),
    supabaseAdmin.from("admin_profiles").select("id", { count: "exact", head: true })
  ])

  if (adminProfileError) {
    throw adminProfileError
  }

  if (adminCountError) {
    throw adminCountError
  }

  if (!adminProfile) {
    const canInitializeAdmin = (adminCount ?? 0) === 0

    return (
      <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col px-5 py-8 sm:px-8" id="main-content">
        <section className="rounded-xl border border-border/80 bg-card/70 p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-lg bg-primary/15 p-2">
              <ShieldCheck aria-hidden className="size-5 text-primary" />
            </div>
            <h1 className="font-heading text-2xl">Yonetici Erisimi Yok</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            {canInitializeAdmin
              ? "Henuz bir yonetici hesabi yok. Bu oturumu ilk yonetici olarak baslatabilirsiniz."
              : "Bu kullanici admin_profiles tablosunda bulunmuyor. Mevcut bir yoneticiden erisim isteyin."}
          </p>
          {canInitializeAdmin ? (
            <form action={initializeAdminAccessAction} className="mt-5">
              <Button type="submit">Bu hesabi yonetici olarak baslat</Button>
            </form>
          ) : null}
          <div className="mt-4">
            <Button asChild variant="ghost">
              <Link aria-label="Ana sayfaya don" href="/">
                <ArrowLeft aria-hidden className="size-4" />
                Site
              </Link>
            </Button>
          </div>
        </section>
      </main>
    )
  }

  const [categoriesResponse, menuItemsResponse, menuTagsResponse, siteEntriesResponse, siteArticlesResponse] = await Promise.all([
    supabaseAdmin.from("menu_categories").select("*").order("display_order", { ascending: true }),
    supabaseAdmin.from("menu_items").select("*").order("display_order", { ascending: true }),
    supabaseAdmin.from("menu_item_tags").select("*"),
    supabaseAdmin.from("site_content_entries").select("*"),
    supabaseAdmin.from("site_articles").select("*").order("display_order", { ascending: true }).order("created_at", { ascending: false })
  ])

  if (categoriesResponse.error) throw categoriesResponse.error
  if (menuItemsResponse.error) throw menuItemsResponse.error
  if (menuTagsResponse.error) throw menuTagsResponse.error
  if (siteEntriesResponse.error) throw siteEntriesResponse.error
  if (siteArticlesResponse.error) throw siteArticlesResponse.error

  const categories = categoriesResponse.data as CategoryRow[]
  const menuItems = menuItemsResponse.data as MenuItemRow[]
  const menuTags = menuTagsResponse.data as TagRow[]
  const siteEntries = siteEntriesResponse.data as SiteContentEntryRow[]
  const siteArticles = siteArticlesResponse.data as SiteArticleRow[]

  const entriesByKey = siteEntries.reduce<Record<string, SiteContentEntryRow["value"]>>((acc, entry) => {
    acc[entry.key] = entry.value
    return acc
  }, {})

  const homeContent = mergeStringContent(defaultHomeContent, entriesByKey.home)
  const aboutContent = mergeStringContent(defaultAboutContent, entriesByKey.about)
  const contactContent = mergeStringContent(defaultContactContent, entriesByKey.contact)

  const tagsByItem = menuTags.reduce<Record<string, string[]>>((acc, tag) => {
    const currentTags = acc[tag.item_id] ?? []
    acc[tag.item_id] = [...currentTags, tag.tag]
    return acc
  }, {})

  const statusMessage = resolvedSearchParams?.status ? statusMessageMap[resolvedSearchParams.status] : undefined
  const activeCategoryCount = categories.filter((category) => category.is_active).length
  const availableProductCount = menuItems.filter((item) => item.is_available).length
  const featuredProductCount = menuItems.filter((item) => item.is_featured).length
  const publishedArticleCount = siteArticles.filter((article) => article.is_published).length
  const requestedWorkspace = resolvedSearchParams?.workspace ?? "overview"
  const workspace: AdminWorkspace = adminWorkspaceItems.some((item) => item.id === requestedWorkspace) ? (requestedWorkspace as AdminWorkspace) : "overview"
  const buildAdminHref = (nextWorkspace: AdminWorkspace) => {
    const query = new URLSearchParams()
    query.set("workspace", nextWorkspace)
    return `/admin?${query.toString()}`
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[1600px] flex-col px-5 py-8 sm:px-8" id="main-content">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-3 border-b border-border/80 pb-5">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary/15 p-2">
            <ShieldCheck aria-hidden className="size-5 text-primary" />
          </div>
          <div>
            <h1 className="font-heading text-2xl">Yonetim Paneli</h1>
            <p className="text-sm text-muted-foreground">Musteri tarafindan duzenlenebilir CMS ve menu islemleri tek yerde</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost">
            <Link aria-label="Ana sayfaya don" href="/">
              <ArrowLeft aria-hidden className="size-4" />
              Site
            </Link>
          </Button>
          <form action={signOutAdminAction}>
            <Button aria-label="Yonetimden cikis yap" type="submit" variant="outline">
              <LogOut aria-hidden className="size-4" />
              Cikis Yap
            </Button>
          </form>
        </div>
      </header>

      {statusMessage ? (
        <section
          aria-live="polite"
          className="mb-6 flex items-center gap-2 rounded-lg border border-success/30 bg-success/10 px-4 py-3 text-sm text-success"
        >
          <CheckCircle2 aria-hidden className="size-4" />
          {statusMessage}
        </section>
      ) : null}

      <section className="mb-6 rounded-lg border border-border/80 bg-card/70 p-4">
        <div className="flex flex-wrap gap-2">
          {adminWorkspaceItems.map((workspaceItem) => {
            return (
              <Button asChild key={workspaceItem.id} variant={workspace === workspaceItem.id ? "secondary" : "outline"}>
                <Link href={buildAdminHref(workspaceItem.id)}>{workspaceItem.label}</Link>
              </Button>
            )
          })}
        </div>
      </section>

      {workspace === "overview" ? (
        <section className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <StatCard hint={`${activeCategoryCount} gorunur`} icon={<Layers3 aria-hidden className="size-4" />} title="Kategoriler" value={String(categories.length)} />
          <StatCard hint={`${availableProductCount} mevcut`} icon={<Package aria-hidden className="size-4" />} title="Urunler" value={String(menuItems.length)} />
          <StatCard hint="Halka acik sayfalardaki one cikanlar" icon={<Sparkles aria-hidden className="size-4" />} title="One Cikan Urunler" value={String(featuredProductCount)} />
          <StatCard hint={`${publishedArticleCount} yayinda`} icon={<FileText aria-hidden className="size-4" />} title="Makaleler" value={String(siteArticles.length)} />
          <StatCard hint="Ana Sayfa, Hakkimizda, Iletisim" icon={<Globe2 aria-hidden className="size-4" />} title="Icerik Bolumleri" value="3" />
        </section>
      ) : null}

      <div className={`grid items-start gap-6 ${workspace === "products" || workspace === "categories" ? "" : "xl:grid-cols-[minmax(0,1fr),400px]"}`}>
        <section className="space-y-6">
          {workspace === "overview" ? (
            <section className="rounded-xl border border-border/80 bg-card/70 p-6">
              <h2 className="font-heading text-2xl">Calisma Alani Ozeti</h2>
              <p className="mt-1 text-sm text-muted-foreground">Tek bir yonetim alanina odaklanmak ve goruntu karmasasini azaltmak icin sekmelerden birini secin.</p>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                <Button asChild variant="outline">
                  <Link href={buildAdminHref("content")}>Icerik Alani Ac</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href={buildAdminHref("articles")}>Makaleler Alani Ac</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href={buildAdminHref("categories")}>Kategoriler Alani Ac</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href={buildAdminHref("products")}>Urunler Alani Ac</Link>
                </Button>
              </div>
            </section>
          ) : null}

          {workspace === "content" ? <section className="rounded-xl border border-border/80 bg-card/70 p-6" id="website-content">
            <div className="mb-5">
              <h2 className="font-heading text-2xl">Site Icerigi (CMS)</h2>
              <p className="mt-1 text-sm text-muted-foreground">Halka acik sayfalarda kullanilan tum metinleri, aciklamalari ve iletisim bilgilerini duzenleyin.</p>
            </div>
            <div className="space-y-3">
              <details className="overflow-hidden rounded-lg border border-border/70 bg-background/45" open>
                <summary className="cursor-pointer list-none px-4 py-3 font-medium">Ana Sayfa Icerigi</summary>
                <div className="border-t border-border/70 px-4 py-4">
                  <form action={updateHomeContentAction} className="grid gap-3 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm" htmlFor="home-hero-badge">
                        Hero rozeti
                      </label>
                      <input className={inputClassName} defaultValue={homeContent.heroBadge} id="home-hero-badge" name="heroBadge" required type="text" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="mb-2 block text-sm" htmlFor="home-hero-title">
                        Hero basligi
                      </label>
                      <input className={inputClassName} defaultValue={homeContent.heroTitle} id="home-hero-title" name="heroTitle" required type="text" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="mb-2 block text-sm" htmlFor="home-hero-description">
                        Hero aciklamasi
                      </label>
                      <textarea className={textareaClassName} defaultValue={homeContent.heroDescription} id="home-hero-description" name="heroDescription" required />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm" htmlFor="home-signature-title">
                        Imza basligi
                      </label>
                      <input className={inputClassName} defaultValue={homeContent.signatureTitle} id="home-signature-title" name="signatureTitle" required type="text" />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm" htmlFor="home-signature-point-one">
                        Imza maddesi 1
                      </label>
                      <input className={inputClassName} defaultValue={homeContent.signaturePointOne} id="home-signature-point-one" name="signaturePointOne" required type="text" />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm" htmlFor="home-signature-point-two">
                        Imza maddesi 2
                      </label>
                      <input className={inputClassName} defaultValue={homeContent.signaturePointTwo} id="home-signature-point-two" name="signaturePointTwo" required type="text" />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm" htmlFor="home-signature-point-three">
                        Imza maddesi 3
                      </label>
                      <input
                        className={inputClassName}
                        defaultValue={homeContent.signaturePointThree}
                        id="home-signature-point-three"
                        name="signaturePointThree"
                        required
                        type="text"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm" htmlFor="home-story-badge">
                        Hikaye rozeti
                      </label>
                      <input className={inputClassName} defaultValue={homeContent.storyBadge} id="home-story-badge" name="storyBadge" required type="text" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="mb-2 block text-sm" htmlFor="home-story-title">
                        Hikaye basligi
                      </label>
                      <input className={inputClassName} defaultValue={homeContent.storyTitle} id="home-story-title" name="storyTitle" required type="text" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="mb-2 block text-sm" htmlFor="home-story-description">
                        Hikaye aciklamasi
                      </label>
                      <textarea className={textareaClassName} defaultValue={homeContent.storyDescription} id="home-story-description" name="storyDescription" required />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm" htmlFor="home-story-highlight-one">
                        Hikaye vurgusu 1
                      </label>
                      <input className={inputClassName} defaultValue={homeContent.storyHighlightOne} id="home-story-highlight-one" name="storyHighlightOne" required type="text" />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm" htmlFor="home-story-highlight-two">
                        Hikaye vurgusu 2
                      </label>
                      <input className={inputClassName} defaultValue={homeContent.storyHighlightTwo} id="home-story-highlight-two" name="storyHighlightTwo" required type="text" />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm" htmlFor="home-story-highlight-three">
                        Hikaye vurgusu 3
                      </label>
                      <input
                        className={inputClassName}
                        defaultValue={homeContent.storyHighlightThree}
                        id="home-story-highlight-three"
                        name="storyHighlightThree"
                        required
                        type="text"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm" htmlFor="home-visit-eyebrow">
                        Ziyaret etiketi
                      </label>
                      <input className={inputClassName} defaultValue={homeContent.visitEyebrow} id="home-visit-eyebrow" name="visitEyebrow" required type="text" />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm" htmlFor="home-visit-title">
                        Ziyaret basligi
                      </label>
                      <input className={inputClassName} defaultValue={homeContent.visitTitle} id="home-visit-title" name="visitTitle" required type="text" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="mb-2 block text-sm" htmlFor="home-visit-description">
                        Ziyaret aciklamasi
                      </label>
                      <textarea className={textareaClassName} defaultValue={homeContent.visitDescription} id="home-visit-description" name="visitDescription" required />
                    </div>
                    <div className="md:col-span-2">
                      <Button type="submit">Ana Sayfa Icerigini Kaydet</Button>
                    </div>
                  </form>
                </div>
              </details>

              <details className="overflow-hidden rounded-lg border border-border/70 bg-background/45">
                <summary className="cursor-pointer list-none px-4 py-3 font-medium">Hakkimizda Sayfasi Icerigi</summary>
                <div className="border-t border-border/70 px-4 py-4">
                  <form action={updateAboutContentAction} className="grid gap-3 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm" htmlFor="about-badge">
                        Rozet
                      </label>
                      <input className={inputClassName} defaultValue={aboutContent.badge} id="about-badge" name="badge" required type="text" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="mb-2 block text-sm" htmlFor="about-title">
                        Baslik
                      </label>
                      <input className={inputClassName} defaultValue={aboutContent.title} id="about-title" name="title" required type="text" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="mb-2 block text-sm" htmlFor="about-intro">
                        Giris
                      </label>
                      <textarea className={textareaClassName} defaultValue={aboutContent.intro} id="about-intro" name="intro" required />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm" htmlFor="about-philosophy-eyebrow">
                        Felsefe etiketi
                      </label>
                      <input
                        className={inputClassName}
                        defaultValue={aboutContent.philosophyEyebrow}
                        id="about-philosophy-eyebrow"
                        name="philosophyEyebrow"
                        required
                        type="text"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="mb-2 block text-sm" htmlFor="about-philosophy-description">
                        Felsefe aciklamasi
                      </label>
                      <textarea
                        className={textareaClassName}
                        defaultValue={aboutContent.philosophyDescription}
                        id="about-philosophy-description"
                        name="philosophyDescription"
                        required
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm" htmlFor="about-values-eyebrow">
                        Degerler etiketi
                      </label>
                      <input className={inputClassName} defaultValue={aboutContent.valuesEyebrow} id="about-values-eyebrow" name="valuesEyebrow" required type="text" />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm" htmlFor="about-values-title">
                        Degerler basligi
                      </label>
                      <input className={inputClassName} defaultValue={aboutContent.valuesTitle} id="about-values-title" name="valuesTitle" required type="text" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="mb-2 block text-sm" htmlFor="about-values-description">
                        Degerler aciklamasi
                      </label>
                      <textarea className={textareaClassName} defaultValue={aboutContent.valuesDescription} id="about-values-description" name="valuesDescription" required />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm" htmlFor="about-value-one-title">
                        Deger karti 1 basligi
                      </label>
                      <input className={inputClassName} defaultValue={aboutContent.valueOneTitle} id="about-value-one-title" name="valueOneTitle" required type="text" />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm" htmlFor="about-value-one-description">
                        Deger karti 1 aciklamasi
                      </label>
                      <textarea
                        className={textareaClassName}
                        defaultValue={aboutContent.valueOneDescription}
                        id="about-value-one-description"
                        name="valueOneDescription"
                        required
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm" htmlFor="about-value-two-title">
                        Deger karti 2 basligi
                      </label>
                      <input className={inputClassName} defaultValue={aboutContent.valueTwoTitle} id="about-value-two-title" name="valueTwoTitle" required type="text" />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm" htmlFor="about-value-two-description">
                        Deger karti 2 aciklamasi
                      </label>
                      <textarea
                        className={textareaClassName}
                        defaultValue={aboutContent.valueTwoDescription}
                        id="about-value-two-description"
                        name="valueTwoDescription"
                        required
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm" htmlFor="about-value-three-title">
                        Deger karti 3 basligi
                      </label>
                      <input className={inputClassName} defaultValue={aboutContent.valueThreeTitle} id="about-value-three-title" name="valueThreeTitle" required type="text" />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm" htmlFor="about-value-three-description">
                        Deger karti 3 aciklamasi
                      </label>
                      <textarea
                        className={textareaClassName}
                        defaultValue={aboutContent.valueThreeDescription}
                        id="about-value-three-description"
                        name="valueThreeDescription"
                        required
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm" htmlFor="about-journey-eyebrow">
                        Yolculuk etiketi
                      </label>
                      <input className={inputClassName} defaultValue={aboutContent.journeyEyebrow} id="about-journey-eyebrow" name="journeyEyebrow" required type="text" />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm" htmlFor="about-journey-title">
                        Yolculuk basligi
                      </label>
                      <input className={inputClassName} defaultValue={aboutContent.journeyTitle} id="about-journey-title" name="journeyTitle" required type="text" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="mb-2 block text-sm" htmlFor="about-journey-description">
                        Yolculuk aciklamasi
                      </label>
                      <textarea
                        className={textareaClassName}
                        defaultValue={aboutContent.journeyDescription}
                        id="about-journey-description"
                        name="journeyDescription"
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Button type="submit">Hakkimizda Icerigini Kaydet</Button>
                    </div>
                  </form>
                </div>
              </details>

              <details className="overflow-hidden rounded-lg border border-border/70 bg-background/45">
                <summary className="cursor-pointer list-none px-4 py-3 font-medium">Iletisim Sayfasi Icerigi</summary>
                <div className="border-t border-border/70 px-4 py-4">
                  <form action={updateContactContentAction} className="grid gap-3 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm" htmlFor="contact-badge">
                        Rozet
                      </label>
                      <input className={inputClassName} defaultValue={contactContent.badge} id="contact-badge" name="badge" required type="text" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="mb-2 block text-sm" htmlFor="contact-title">
                        Baslik
                      </label>
                      <input className={inputClassName} defaultValue={contactContent.title} id="contact-title" name="title" required type="text" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="mb-2 block text-sm" htmlFor="contact-description">
                        Aciklama
                      </label>
                      <textarea className={textareaClassName} defaultValue={contactContent.description} id="contact-description" name="description" required />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm" htmlFor="contact-quick-message-title">
                        Hizli mesaj basligi
                      </label>
                      <input
                        className={inputClassName}
                        defaultValue={contactContent.quickMessageTitle}
                        id="contact-quick-message-title"
                        name="quickMessageTitle"
                        required
                        type="text"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="mb-2 block text-sm" htmlFor="contact-quick-message-description">
                        Hizli mesaj aciklamasi
                      </label>
                      <textarea
                        className={textareaClassName}
                        defaultValue={contactContent.quickMessageDescription}
                        id="contact-quick-message-description"
                        name="quickMessageDescription"
                        required
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm" htmlFor="contact-details-eyebrow">
                        Detay etiketi
                      </label>
                      <input className={inputClassName} defaultValue={contactContent.detailsEyebrow} id="contact-details-eyebrow" name="detailsEyebrow" required type="text" />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm" htmlFor="contact-details-title">
                        Detay basligi
                      </label>
                      <input className={inputClassName} defaultValue={contactContent.detailsTitle} id="contact-details-title" name="detailsTitle" required type="text" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="mb-2 block text-sm" htmlFor="contact-details-description">
                        Detay aciklamasi
                      </label>
                      <textarea
                        className={textareaClassName}
                        defaultValue={contactContent.detailsDescription}
                        id="contact-details-description"
                        name="detailsDescription"
                        required
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm" htmlFor="contact-phone">
                        Telefon
                      </label>
                      <input className={inputClassName} defaultValue={contactContent.phone} id="contact-phone" name="phone" required type="text" />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm" htmlFor="contact-email">
                        E-posta
                      </label>
                      <input className={inputClassName} defaultValue={contactContent.email} id="contact-email" name="email" required type="email" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="mb-2 block text-sm" htmlFor="contact-address">
                        Adres
                      </label>
                      <input className={inputClassName} defaultValue={contactContent.address} id="contact-address" name="address" required type="text" />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm" htmlFor="contact-hours">
                        Calisma saatleri
                      </label>
                      <input className={inputClassName} defaultValue={contactContent.hours} id="contact-hours" name="hours" required type="text" />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm" htmlFor="contact-map-url">
                        Harita URL
                      </label>
                      <input className={inputClassName} defaultValue={contactContent.mapUrl} id="contact-map-url" name="mapUrl" required type="url" />
                    </div>
                    <div className="md:col-span-2">
                      <Button type="submit">Iletisim Icerigini Kaydet</Button>
                    </div>
                  </form>
                </div>
              </details>
            </div>
          </section> : null}

          {workspace === "articles" ? <section className="rounded-xl border border-border/80 bg-card/70 p-6" id="manage-articles">
            <div className="mb-5">
              <h2 className="font-heading text-2xl">Makaleleri Yonet</h2>
              <p className="mt-1 text-sm text-muted-foreground">Makaleler Ana Sayfa veya Hakkimizda sayfalarinda dinamik olarak yayinlanabilir.</p>
            </div>
            <div className="space-y-3">
              {siteArticles.length === 0 ? (
                <p className="rounded-lg border border-border/70 bg-background/40 px-4 py-3 text-sm text-muted-foreground">
                  Henuz makale yok. Sagdaki panelden yeni bir tane olusturun.
                </p>
              ) : null}
              {siteArticles.map((article, index) => {
                return (
                  <details className="overflow-hidden rounded-lg border border-border/70 bg-background/45" key={article.id} open={index === 0}>
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3">
                      <div>
                        <p className="font-medium text-foreground">{article.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {article.page.toUpperCase()} • {article.author}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2 text-xs">
                        <span className="rounded-full border border-border/70 px-2 py-1 text-muted-foreground">Sira {article.display_order}</span>
                        <span
                          className={`rounded-full px-2 py-1 ${
                            article.is_published
                              ? "border border-success/30 bg-success/10 text-success"
                              : "border border-warning/30 bg-warning/10 text-warning"
                          }`}
                        >
                          {article.is_published ? "Yayinda" : "Taslak"}
                        </span>
                      </div>
                    </summary>
                    <div className="border-t border-border/70 px-4 py-4">
                      <form action={updateSiteArticleAction} className="grid gap-3 md:grid-cols-2">
                        <input name="articleId" type="hidden" value={article.id} />
                        <div>
                          <label className="mb-2 block text-sm" htmlFor={`article-title-${article.id}`}>
                            Baslik
                          </label>
                          <input
                            className={inputClassName}
                            defaultValue={article.title}
                            id={`article-title-${article.id}`}
                            name="title"
                            required
                            type="text"
                          />
                        </div>
                        <div>
                          <label className="mb-2 block text-sm" htmlFor={`article-page-${article.id}`}>
                            Sayfa
                          </label>
                          <select className={inputClassName} defaultValue={article.page} id={`article-page-${article.id}`} name="page" required>
                            <option value="home">Ana Sayfa</option>
                            <option value="about">Hakkimizda</option>
                          </select>
                        </div>
                        <div>
                          <label className="mb-2 block text-sm" htmlFor={`article-author-${article.id}`}>
                            Yazar
                          </label>
                          <input className={inputClassName} defaultValue={article.author} id={`article-author-${article.id}`} name="author" type="text" />
                        </div>
                        <div>
                          <label className="mb-2 block text-sm" htmlFor={`article-order-${article.id}`}>
                            Gosterim sirasi
                          </label>
                          <input className={inputClassName} defaultValue={article.display_order} id={`article-order-${article.id}`} name="displayOrder" required type="number" />
                        </div>
                        <div className="md:col-span-2">
                          <label className="mb-2 block text-sm" htmlFor={`article-excerpt-${article.id}`}>
                            Ozet
                          </label>
                          <textarea
                            className={textareaClassName}
                            defaultValue={article.excerpt}
                            id={`article-excerpt-${article.id}`}
                            name="excerpt"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="mb-2 block text-sm" htmlFor={`article-content-${article.id}`}>
                            Icerik
                          </label>
                          <textarea
                            className="min-h-32 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring"
                            defaultValue={article.content}
                            id={`article-content-${article.id}`}
                            name="content"
                            required
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="mb-2 block text-sm" htmlFor={`article-image-${article.id}`}>
                            Gorsel URL
                          </label>
                          <input className={inputClassName} defaultValue={article.image_url ?? ""} id={`article-image-${article.id}`} name="imageUrl" type="url" />
                        </div>
                        <label className="inline-flex items-center gap-2 text-sm">
                          <input className={checkboxClassName} defaultChecked={article.is_published} name="isPublished" type="checkbox" />
                          Yayinda
                        </label>
                        <div className="md:col-span-2 flex flex-wrap gap-2">
                          <Button type="submit">Makaleyi Kaydet</Button>
                        </div>
                      </form>

                      <form action={deleteSiteArticleAction} className="mt-4 flex flex-wrap items-center gap-2 border-t border-border/70 pt-4">
                        <input name="articleId" type="hidden" value={article.id} />
                        <input className={inputClassName} name="confirmation" placeholder='Silmek icin "DELETE" yazin' required type="text" />
                        <Button type="submit" variant="destructive">
                          Makaleyi Sil
                        </Button>
                      </form>
                    </div>
                  </details>
                )
              })}
            </div>
          </section> : null}

          {workspace === "categories" ? <CategoriesAdminSection categories={categories} menuItems={menuItems} /> : null}

          {workspace === "products" ? <ProductsAdminSection categories={categories} menuItems={menuItems} tagsByItem={tagsByItem} /> : null}

        </section>

        {workspace !== "products" && workspace !== "categories" ? <aside className="space-y-6 xl:sticky xl:top-6">
          {workspace === "overview" ? (
            <section className="rounded-xl border border-border/80 bg-card/70 p-6">
              <h2 className="font-heading text-xl">Tasarim Plani</h2>
              <p className="mt-1 text-sm text-muted-foreground">Yonetim paneli hiz, okunabilirlik ve duzenleme guvenligi icin odakli calisma alanlarina bolundu.</p>
              <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                <p>1. <span className="text-foreground">Genel Bakis</span> metrikler ve hizli erisim icin.</p>
                <p>2. <span className="text-foreground">Icerik</span> ana sayfa/hakkimizda/iletisim metinleri icin.</p>
                <p>3. <span className="text-foreground">Makaleler</span> listeleme ve olusturma/guncelleme/silme icin.</p>
                <p>4. <span className="text-foreground">Kategoriler</span> menu gruplama ve dairesel gorsel/ikon ayari icin.</p>
                <p>5. <span className="text-foreground">Urunler</span> stok durumu, fiyat ve etiketler icin.</p>
              </div>
            </section>
          ) : null}

          {workspace === "articles" ? <section className="rounded-xl border border-border/80 bg-card/70 p-6" id="create-article">
            <h2 className="font-heading text-xl">Makale Olustur</h2>
            <p className="mt-1 text-sm text-muted-foreground">Ana Sayfa veya Hakkimizda icin yeni bir makale ekleyin.</p>
            <form action={createSiteArticleAction} className="mt-4 grid gap-3">
              <div>
                <label className="mb-2 block text-sm" htmlFor="create-article-title">
                  Baslik
                </label>
                <input className={inputClassName} id="create-article-title" name="title" required type="text" />
              </div>
              <div>
                <label className="mb-2 block text-sm" htmlFor="create-article-page">
                  Sayfa
                </label>
                <select className={inputClassName} id="create-article-page" name="page" required>
                  <option value="home">Ana Sayfa</option>
                  <option value="about">Hakkimizda</option>
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm" htmlFor="create-article-author">
                  Yazar
                </label>
                <input className={inputClassName} defaultValue="Balkon Café Team" id="create-article-author" name="author" type="text" />
              </div>
              <div>
                <label className="mb-2 block text-sm" htmlFor="create-article-order">
                  Gosterim sirasi
                </label>
                <input className={inputClassName} defaultValue={1} id="create-article-order" name="displayOrder" required type="number" />
              </div>
              <div>
                <label className="mb-2 block text-sm" htmlFor="create-article-excerpt">
                  Ozet
                </label>
                <textarea className={textareaClassName} id="create-article-excerpt" name="excerpt" />
              </div>
              <div>
                <label className="mb-2 block text-sm" htmlFor="create-article-content">
                  Icerik
                </label>
                <textarea className="min-h-32 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring" id="create-article-content" name="content" required />
              </div>
              <div>
                <label className="mb-2 block text-sm" htmlFor="create-article-image">
                  Gorsel URL
                </label>
                <input className={inputClassName} id="create-article-image" name="imageUrl" type="url" />
              </div>
              <label className="inline-flex items-center gap-2 text-sm">
                <input className={checkboxClassName} defaultChecked name="isPublished" type="checkbox" />
                Yayinda
              </label>
              <Button type="submit">Makale Olustur</Button>
            </form>
          </section> : null}

        </aside> : null}
      </div>
    </main>
  )
}

export default AdminPage
