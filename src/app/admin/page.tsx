import Link from "next/link"
import { redirect } from "next/navigation"
import type { ReactNode } from "react"
import { ArrowLeft, CheckCircle2, FileText, Globe2, Layers3, LogOut, Package, ShieldCheck, Sparkles } from "lucide-react"
import {
  createCategoryAction,
  createMenuItemAction,
  createSiteArticleAction,
  deleteCategoryAction,
  deleteMenuItemAction,
  deleteSiteArticleAction,
  initializeAdminAccessAction,
  signOutAdminAction,
  updateAboutContentAction,
  updateCategoryAction,
  updateContactContentAction,
  updateHomeContentAction,
  updateMenuItemAction,
  updateSiteArticleAction
} from "@/app/admin/actions"
import { defaultAboutContentByLocale, defaultContactContentByLocale, defaultHomeContentByLocale, mergeLocalizedStringContent } from "@/data/site-content"
import { Button } from "@/components/ui/button"
import { isLocale, type Locale } from "@/i18n/config"
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
    readonly contentLocale?: string
  }>
}

type StatCardProps = {
  readonly title: string
  readonly value: string
  readonly hint: string
  readonly icon: ReactNode
}

const statusMessageMap: Record<string, string> = {
  "admin-initialized": "Admin access initialized successfully",
  "category-created": "Category created successfully",
  "category-updated": "Category updated successfully",
  "category-deleted": "Category deleted successfully",
  "product-created": "Product created successfully",
  "product-updated": "Product updated successfully",
  "product-deleted": "Product deleted successfully",
  "site-home-updated": "Homepage content updated successfully",
  "site-about-updated": "About page content updated successfully",
  "site-contact-updated": "Contact page content updated successfully",
  "site-article-created": "Article created successfully",
  "site-article-updated": "Article updated successfully",
  "site-article-deleted": "Article deleted successfully"
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
            <h1 className="font-heading text-2xl">Admin Access Missing</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            {canInitializeAdmin
              ? "No admin account exists yet. You can initialize this signed-in account as the first admin."
              : "This authenticated user is not listed in admin_profiles. Ask an existing admin to grant you access."}
          </p>
          {canInitializeAdmin ? (
            <form action={initializeAdminAccessAction} className="mt-5">
              <Button type="submit">Initialize this account as admin</Button>
            </form>
          ) : null}
          <div className="mt-4">
            <Button asChild variant="ghost">
              <Link aria-label="Back to homepage" href="/">
                <ArrowLeft aria-hidden className="size-4" />
                Website
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

  const contentLocale: Locale = isLocale(resolvedSearchParams?.contentLocale ?? "") ? (resolvedSearchParams?.contentLocale as Locale) : "tr"

  const entriesByKey = siteEntries.reduce<Record<string, SiteContentEntryRow["value"]>>((acc, entry) => {
    acc[entry.key] = entry.value
    return acc
  }, {})

  const homeContent = mergeLocalizedStringContent(defaultHomeContentByLocale, entriesByKey.home, contentLocale)
  const aboutContent = mergeLocalizedStringContent(defaultAboutContentByLocale, entriesByKey.about, contentLocale)
  const contactContent = mergeLocalizedStringContent(defaultContactContentByLocale, entriesByKey.contact, contentLocale)

  const resolveLocalizedText = (englishText: string, turkishText: string) => {
    if (contentLocale === "tr" && turkishText.trim().length > 0) {
      return turkishText
    }

    return englishText
  }

  const tagsByItem = menuTags.reduce<Record<string, string[]>>((acc, tag) => {
    const currentTags = acc[tag.item_id] ?? []
    acc[tag.item_id] = [...currentTags, tag.tag]
    return acc
  }, {})

  const categoryNameById = categories.reduce<Record<string, string>>((acc, category) => {
    acc[category.id] = resolveLocalizedText(category.name, category.name_tr)
    return acc
  }, {})

  const statusMessage = resolvedSearchParams?.status ? statusMessageMap[resolvedSearchParams.status] : undefined
  const activeCategoryCount = categories.filter((category) => category.is_active).length
  const availableProductCount = menuItems.filter((item) => item.is_available).length
  const featuredProductCount = menuItems.filter((item) => item.is_featured).length
  const publishedArticleCount = siteArticles.filter((article) => article.is_published).length
  const hasCategories = categories.length > 0

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[1600px] flex-col px-5 py-8 sm:px-8" id="main-content">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-3 border-b border-border/80 pb-5">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary/15 p-2">
            <ShieldCheck aria-hidden className="size-5 text-primary" />
          </div>
          <div>
            <h1 className="font-heading text-2xl">Admin Panel</h1>
            <p className="text-sm text-muted-foreground">Client-editable CMS + menu operations in one place</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost">
            <Link aria-label="Back to homepage" href="/">
              <ArrowLeft aria-hidden className="size-4" />
              Website
            </Link>
          </Button>
          <form action={signOutAdminAction}>
            <Button aria-label="Sign out from admin" type="submit" variant="outline">
              <LogOut aria-hidden className="size-4" />
              Sign out
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
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium">Content language</p>
            <p className="text-xs text-muted-foreground">Switch language to edit Turkish or English content for all dynamic sections.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant={contentLocale === "en" ? "secondary" : "outline"}>
              <Link href="/admin?contentLocale=en">English</Link>
            </Button>
            <Button asChild variant={contentLocale === "tr" ? "secondary" : "outline"}>
              <Link href="/admin?contentLocale=tr">Turkish</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard hint={`${activeCategoryCount} visible`} icon={<Layers3 aria-hidden className="size-4" />} title="Categories" value={String(categories.length)} />
        <StatCard hint={`${availableProductCount} available`} icon={<Package aria-hidden className="size-4" />} title="Products" value={String(menuItems.length)} />
        <StatCard hint="Highlights on public pages" icon={<Sparkles aria-hidden className="size-4" />} title="Featured products" value={String(featuredProductCount)} />
        <StatCard hint={`${publishedArticleCount} published`} icon={<FileText aria-hidden className="size-4" />} title="Articles" value={String(siteArticles.length)} />
        <StatCard hint="Home, About, Contact" icon={<Globe2 aria-hidden className="size-4" />} title="Content sections" value="3" />
      </section>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr),400px]">
        <section className="space-y-6">
          <section className="rounded-xl border border-border/80 bg-card/70 p-6" id="website-content">
            <div className="mb-5">
              <h2 className="font-heading text-2xl">Website Content (CMS)</h2>
              <p className="mt-1 text-sm text-muted-foreground">Edit all marketing texts, descriptions, and contact details used by public pages.</p>
            </div>
            <div className="space-y-3">
              <details className="overflow-hidden rounded-lg border border-border/70 bg-background/45" open>
                <summary className="cursor-pointer list-none px-4 py-3 font-medium">Homepage Content</summary>
                <div className="border-t border-border/70 px-4 py-4">
                  <form action={updateHomeContentAction} className="grid gap-3 md:grid-cols-2">
                    <input name="contentLocale" type="hidden" value={contentLocale} />
                    <div>
                      <label className="mb-2 block text-sm" htmlFor="home-hero-badge">
                        Hero badge
                      </label>
                      <input className={inputClassName} defaultValue={homeContent.heroBadge} id="home-hero-badge" name="heroBadge" required type="text" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="mb-2 block text-sm" htmlFor="home-hero-title">
                        Hero title
                      </label>
                      <input className={inputClassName} defaultValue={homeContent.heroTitle} id="home-hero-title" name="heroTitle" required type="text" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="mb-2 block text-sm" htmlFor="home-hero-description">
                        Hero description
                      </label>
                      <textarea className={textareaClassName} defaultValue={homeContent.heroDescription} id="home-hero-description" name="heroDescription" required />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm" htmlFor="home-signature-title">
                        Signature title
                      </label>
                      <input className={inputClassName} defaultValue={homeContent.signatureTitle} id="home-signature-title" name="signatureTitle" required type="text" />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm" htmlFor="home-signature-point-one">
                        Signature point 1
                      </label>
                      <input className={inputClassName} defaultValue={homeContent.signaturePointOne} id="home-signature-point-one" name="signaturePointOne" required type="text" />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm" htmlFor="home-signature-point-two">
                        Signature point 2
                      </label>
                      <input className={inputClassName} defaultValue={homeContent.signaturePointTwo} id="home-signature-point-two" name="signaturePointTwo" required type="text" />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm" htmlFor="home-signature-point-three">
                        Signature point 3
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
                        Story badge
                      </label>
                      <input className={inputClassName} defaultValue={homeContent.storyBadge} id="home-story-badge" name="storyBadge" required type="text" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="mb-2 block text-sm" htmlFor="home-story-title">
                        Story title
                      </label>
                      <input className={inputClassName} defaultValue={homeContent.storyTitle} id="home-story-title" name="storyTitle" required type="text" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="mb-2 block text-sm" htmlFor="home-story-description">
                        Story description
                      </label>
                      <textarea className={textareaClassName} defaultValue={homeContent.storyDescription} id="home-story-description" name="storyDescription" required />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm" htmlFor="home-story-highlight-one">
                        Story highlight 1
                      </label>
                      <input className={inputClassName} defaultValue={homeContent.storyHighlightOne} id="home-story-highlight-one" name="storyHighlightOne" required type="text" />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm" htmlFor="home-story-highlight-two">
                        Story highlight 2
                      </label>
                      <input className={inputClassName} defaultValue={homeContent.storyHighlightTwo} id="home-story-highlight-two" name="storyHighlightTwo" required type="text" />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm" htmlFor="home-story-highlight-three">
                        Story highlight 3
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
                        Visit eyebrow
                      </label>
                      <input className={inputClassName} defaultValue={homeContent.visitEyebrow} id="home-visit-eyebrow" name="visitEyebrow" required type="text" />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm" htmlFor="home-visit-title">
                        Visit title
                      </label>
                      <input className={inputClassName} defaultValue={homeContent.visitTitle} id="home-visit-title" name="visitTitle" required type="text" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="mb-2 block text-sm" htmlFor="home-visit-description">
                        Visit description
                      </label>
                      <textarea className={textareaClassName} defaultValue={homeContent.visitDescription} id="home-visit-description" name="visitDescription" required />
                    </div>
                    <div className="md:col-span-2">
                      <Button type="submit">Save Homepage Content</Button>
                    </div>
                  </form>
                </div>
              </details>

              <details className="overflow-hidden rounded-lg border border-border/70 bg-background/45">
                <summary className="cursor-pointer list-none px-4 py-3 font-medium">About Page Content</summary>
                <div className="border-t border-border/70 px-4 py-4">
                  <form action={updateAboutContentAction} className="grid gap-3 md:grid-cols-2">
                    <input name="contentLocale" type="hidden" value={contentLocale} />
                    <div>
                      <label className="mb-2 block text-sm" htmlFor="about-badge">
                        Badge
                      </label>
                      <input className={inputClassName} defaultValue={aboutContent.badge} id="about-badge" name="badge" required type="text" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="mb-2 block text-sm" htmlFor="about-title">
                        Title
                      </label>
                      <input className={inputClassName} defaultValue={aboutContent.title} id="about-title" name="title" required type="text" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="mb-2 block text-sm" htmlFor="about-intro">
                        Intro
                      </label>
                      <textarea className={textareaClassName} defaultValue={aboutContent.intro} id="about-intro" name="intro" required />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm" htmlFor="about-philosophy-eyebrow">
                        Philosophy eyebrow
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
                        Philosophy description
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
                        Values eyebrow
                      </label>
                      <input className={inputClassName} defaultValue={aboutContent.valuesEyebrow} id="about-values-eyebrow" name="valuesEyebrow" required type="text" />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm" htmlFor="about-values-title">
                        Values title
                      </label>
                      <input className={inputClassName} defaultValue={aboutContent.valuesTitle} id="about-values-title" name="valuesTitle" required type="text" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="mb-2 block text-sm" htmlFor="about-values-description">
                        Values description
                      </label>
                      <textarea className={textareaClassName} defaultValue={aboutContent.valuesDescription} id="about-values-description" name="valuesDescription" required />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm" htmlFor="about-value-one-title">
                        Value card 1 title
                      </label>
                      <input className={inputClassName} defaultValue={aboutContent.valueOneTitle} id="about-value-one-title" name="valueOneTitle" required type="text" />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm" htmlFor="about-value-one-description">
                        Value card 1 description
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
                        Value card 2 title
                      </label>
                      <input className={inputClassName} defaultValue={aboutContent.valueTwoTitle} id="about-value-two-title" name="valueTwoTitle" required type="text" />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm" htmlFor="about-value-two-description">
                        Value card 2 description
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
                        Value card 3 title
                      </label>
                      <input className={inputClassName} defaultValue={aboutContent.valueThreeTitle} id="about-value-three-title" name="valueThreeTitle" required type="text" />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm" htmlFor="about-value-three-description">
                        Value card 3 description
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
                        Journey eyebrow
                      </label>
                      <input className={inputClassName} defaultValue={aboutContent.journeyEyebrow} id="about-journey-eyebrow" name="journeyEyebrow" required type="text" />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm" htmlFor="about-journey-title">
                        Journey title
                      </label>
                      <input className={inputClassName} defaultValue={aboutContent.journeyTitle} id="about-journey-title" name="journeyTitle" required type="text" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="mb-2 block text-sm" htmlFor="about-journey-description">
                        Journey description
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
                      <Button type="submit">Save About Page Content</Button>
                    </div>
                  </form>
                </div>
              </details>

              <details className="overflow-hidden rounded-lg border border-border/70 bg-background/45">
                <summary className="cursor-pointer list-none px-4 py-3 font-medium">Contact Page Content</summary>
                <div className="border-t border-border/70 px-4 py-4">
                  <form action={updateContactContentAction} className="grid gap-3 md:grid-cols-2">
                    <input name="contentLocale" type="hidden" value={contentLocale} />
                    <div>
                      <label className="mb-2 block text-sm" htmlFor="contact-badge">
                        Badge
                      </label>
                      <input className={inputClassName} defaultValue={contactContent.badge} id="contact-badge" name="badge" required type="text" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="mb-2 block text-sm" htmlFor="contact-title">
                        Title
                      </label>
                      <input className={inputClassName} defaultValue={contactContent.title} id="contact-title" name="title" required type="text" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="mb-2 block text-sm" htmlFor="contact-description">
                        Description
                      </label>
                      <textarea className={textareaClassName} defaultValue={contactContent.description} id="contact-description" name="description" required />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm" htmlFor="contact-quick-message-title">
                        Quick message title
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
                        Quick message description
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
                        Details eyebrow
                      </label>
                      <input className={inputClassName} defaultValue={contactContent.detailsEyebrow} id="contact-details-eyebrow" name="detailsEyebrow" required type="text" />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm" htmlFor="contact-details-title">
                        Details title
                      </label>
                      <input className={inputClassName} defaultValue={contactContent.detailsTitle} id="contact-details-title" name="detailsTitle" required type="text" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="mb-2 block text-sm" htmlFor="contact-details-description">
                        Details description
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
                        Phone
                      </label>
                      <input className={inputClassName} defaultValue={contactContent.phone} id="contact-phone" name="phone" required type="text" />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm" htmlFor="contact-email">
                        Email
                      </label>
                      <input className={inputClassName} defaultValue={contactContent.email} id="contact-email" name="email" required type="email" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="mb-2 block text-sm" htmlFor="contact-address">
                        Address
                      </label>
                      <input className={inputClassName} defaultValue={contactContent.address} id="contact-address" name="address" required type="text" />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm" htmlFor="contact-hours">
                        Hours
                      </label>
                      <input className={inputClassName} defaultValue={contactContent.hours} id="contact-hours" name="hours" required type="text" />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm" htmlFor="contact-map-url">
                        Map URL
                      </label>
                      <input className={inputClassName} defaultValue={contactContent.mapUrl} id="contact-map-url" name="mapUrl" required type="url" />
                    </div>
                    <div className="md:col-span-2">
                      <Button type="submit">Save Contact Page Content</Button>
                    </div>
                  </form>
                </div>
              </details>
            </div>
          </section>

          <section className="rounded-xl border border-border/80 bg-card/70 p-6" id="manage-articles">
            <div className="mb-5">
              <h2 className="font-heading text-2xl">Manage Articles</h2>
              <p className="mt-1 text-sm text-muted-foreground">Articles can be published on Home or About pages dynamically.</p>
            </div>
            <div className="space-y-3">
              {siteArticles.length === 0 ? (
                <p className="rounded-lg border border-border/70 bg-background/40 px-4 py-3 text-sm text-muted-foreground">
                  No articles yet. Create one from the right panel.
                </p>
              ) : null}
              {siteArticles.map((article, index) => {
                return (
                  <details className="overflow-hidden rounded-lg border border-border/70 bg-background/45" key={article.id} open={index === 0}>
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3">
                      <div>
                        <p className="font-medium text-foreground">{resolveLocalizedText(article.title, article.title_tr)}</p>
                        <p className="text-xs text-muted-foreground">
                          {article.page.toUpperCase()} • {article.author}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2 text-xs">
                        <span className="rounded-full border border-border/70 px-2 py-1 text-muted-foreground">Order {article.display_order}</span>
                        <span
                          className={`rounded-full px-2 py-1 ${
                            article.is_published
                              ? "border border-success/30 bg-success/10 text-success"
                              : "border border-warning/30 bg-warning/10 text-warning"
                          }`}
                        >
                          {article.is_published ? "Published" : "Draft"}
                        </span>
                      </div>
                    </summary>
                    <div className="border-t border-border/70 px-4 py-4">
                      <form action={updateSiteArticleAction} className="grid gap-3 md:grid-cols-2">
                        <input name="contentLocale" type="hidden" value={contentLocale} />
                        <input name="articleId" type="hidden" value={article.id} />
                        <div>
                          <label className="mb-2 block text-sm" htmlFor={`article-title-${article.id}`}>
                            Title
                          </label>
                          <input
                            className={inputClassName}
                            defaultValue={resolveLocalizedText(article.title, article.title_tr)}
                            id={`article-title-${article.id}`}
                            name="title"
                            required
                            type="text"
                          />
                        </div>
                        <div>
                          <label className="mb-2 block text-sm" htmlFor={`article-page-${article.id}`}>
                            Page
                          </label>
                          <select className={inputClassName} defaultValue={article.page} id={`article-page-${article.id}`} name="page" required>
                            <option value="home">Home</option>
                            <option value="about">About</option>
                          </select>
                        </div>
                        <div>
                          <label className="mb-2 block text-sm" htmlFor={`article-author-${article.id}`}>
                            Author
                          </label>
                          <input className={inputClassName} defaultValue={article.author} id={`article-author-${article.id}`} name="author" type="text" />
                        </div>
                        <div>
                          <label className="mb-2 block text-sm" htmlFor={`article-order-${article.id}`}>
                            Display order
                          </label>
                          <input className={inputClassName} defaultValue={article.display_order} id={`article-order-${article.id}`} name="displayOrder" required type="number" />
                        </div>
                        <div className="md:col-span-2">
                          <label className="mb-2 block text-sm" htmlFor={`article-excerpt-${article.id}`}>
                            Excerpt
                          </label>
                          <textarea
                            className={textareaClassName}
                            defaultValue={resolveLocalizedText(article.excerpt, article.excerpt_tr)}
                            id={`article-excerpt-${article.id}`}
                            name="excerpt"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="mb-2 block text-sm" htmlFor={`article-content-${article.id}`}>
                            Content
                          </label>
                          <textarea
                            className="min-h-32 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring"
                            defaultValue={resolveLocalizedText(article.content, article.content_tr)}
                            id={`article-content-${article.id}`}
                            name="content"
                            required
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="mb-2 block text-sm" htmlFor={`article-image-${article.id}`}>
                            Image URL
                          </label>
                          <input className={inputClassName} defaultValue={article.image_url ?? ""} id={`article-image-${article.id}`} name="imageUrl" type="url" />
                        </div>
                        <label className="inline-flex items-center gap-2 text-sm">
                          <input className={checkboxClassName} defaultChecked={article.is_published} name="isPublished" type="checkbox" />
                          Published
                        </label>
                        <div className="md:col-span-2 flex flex-wrap gap-2">
                          <Button type="submit">Save Article</Button>
                        </div>
                      </form>

                      <form action={deleteSiteArticleAction} className="mt-4 flex flex-wrap items-center gap-2 border-t border-border/70 pt-4">
                        <input name="articleId" type="hidden" value={article.id} />
                        <input className={inputClassName} name="confirmation" placeholder='Type "DELETE"' required type="text" />
                        <Button type="submit" variant="destructive">
                          Delete Article
                        </Button>
                      </form>
                    </div>
                  </details>
                )
              })}
            </div>
          </section>

          <section className="rounded-xl border border-border/80 bg-card/70 p-6" id="manage-categories">
            <div className="mb-5">
              <h2 className="font-heading text-2xl">Manage Categories</h2>
              <p className="mt-1 text-sm text-muted-foreground">Edit visibility, order, and details without leaving this page.</p>
            </div>
            <div className="space-y-3">
              {categories.length === 0 ? (
                <p className="rounded-lg border border-border/70 bg-background/40 px-4 py-3 text-sm text-muted-foreground">
                  No categories yet. Use Create Category on the right panel.
                </p>
              ) : null}
              {categories.map((category, index) => {
                return (
                  <details className="overflow-hidden rounded-lg border border-border/70 bg-background/45" key={category.id} open={index === 0}>
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3">
                      <div>
                        <p className="font-medium text-foreground">{resolveLocalizedText(category.name, category.name_tr)}</p>
                        <p className="text-xs text-muted-foreground">{resolveLocalizedText(category.description, category.description_tr) || "No description"}</p>
                      </div>
                      <div className="flex flex-wrap gap-2 text-xs">
                        <span className="rounded-full border border-border/70 px-2 py-1 text-muted-foreground">Order {category.display_order}</span>
                        <span
                          className={`rounded-full px-2 py-1 ${
                            category.is_active
                              ? "border border-success/30 bg-success/10 text-success"
                              : "border border-warning/30 bg-warning/10 text-warning"
                          }`}
                        >
                          {category.is_active ? "Visible" : "Hidden"}
                        </span>
                      </div>
                    </summary>
                    <div className="border-t border-border/70 px-4 py-4">
                      <form action={updateCategoryAction} className="grid gap-3 md:grid-cols-2">
                        <input name="contentLocale" type="hidden" value={contentLocale} />
                        <input name="categoryId" type="hidden" value={category.id} />
                        <div>
                          <label className="mb-2 block text-sm" htmlFor={`category-name-${category.id}`}>
                            Name
                          </label>
                          <input
                            className={inputClassName}
                            defaultValue={resolveLocalizedText(category.name, category.name_tr)}
                            id={`category-name-${category.id}`}
                            name="name"
                            required
                            type="text"
                          />
                        </div>
                        <div>
                          <label className="mb-2 block text-sm" htmlFor={`category-order-${category.id}`}>
                            Display order
                          </label>
                          <input className={inputClassName} defaultValue={category.display_order} id={`category-order-${category.id}`} name="displayOrder" required type="number" />
                        </div>
                        <div className="md:col-span-2">
                          <label className="mb-2 block text-sm" htmlFor={`category-description-${category.id}`}>
                            Description
                          </label>
                          <textarea
                            className={textareaClassName}
                            defaultValue={resolveLocalizedText(category.description, category.description_tr)}
                            id={`category-description-${category.id}`}
                            name="description"
                          />
                        </div>
                        <label className="inline-flex items-center gap-2 text-sm">
                          <input className={checkboxClassName} defaultChecked={category.is_active} name="isActive" type="checkbox" />
                          Category visible
                        </label>
                        <div className="md:col-span-2 flex flex-wrap gap-2">
                          <Button type="submit">Save Category</Button>
                        </div>
                      </form>
                      <form action={deleteCategoryAction} className="mt-4 flex flex-wrap items-center gap-2 border-t border-border/70 pt-4">
                        <input name="categoryId" type="hidden" value={category.id} />
                        <input className={inputClassName} name="confirmation" placeholder='Type "DELETE"' required type="text" />
                        <Button type="submit" variant="destructive">
                          Delete Category
                        </Button>
                      </form>
                    </div>
                  </details>
                )
              })}
            </div>
          </section>

          <section className="rounded-xl border border-border/80 bg-card/70 p-6" id="manage-products">
            <div className="mb-5">
              <h2 className="font-heading text-2xl">Manage Products</h2>
              <p className="mt-1 text-sm text-muted-foreground">All product settings are grouped per item for faster edits.</p>
            </div>
            <div className="space-y-3">
              {menuItems.length === 0 ? (
                <p className="rounded-lg border border-border/70 bg-background/40 px-4 py-3 text-sm text-muted-foreground">
                  No products yet. Use Create Product on the right panel.
                </p>
              ) : null}
              {menuItems.map((item, index) => {
                const itemTags = tagsByItem[item.id] ?? []
                const categoryName = categoryNameById[item.category_id] ?? "Unknown category"

                return (
                  <details className="overflow-hidden rounded-lg border border-border/70 bg-background/45" key={item.id} open={index === 0}>
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3">
                      <div>
                        <p className="font-medium text-foreground">{resolveLocalizedText(item.name, item.name_tr)}</p>
                        <p className="text-xs text-muted-foreground">
                          {categoryName} • ${item.price.toFixed(2)}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2 text-xs">
                        <span
                          className={`rounded-full px-2 py-1 ${
                            item.is_available
                              ? "border border-success/30 bg-success/10 text-success"
                              : "border border-warning/30 bg-warning/10 text-warning"
                          }`}
                        >
                          {item.is_available ? "Available" : "Unavailable"}
                        </span>
                        <span className="rounded-full border border-primary/30 bg-primary/10 px-2 py-1 text-primary">
                          {item.is_featured ? "Featured" : "Standard"}
                        </span>
                      </div>
                    </summary>
                    <div className="border-t border-border/70 px-4 py-4">
                      <form action={updateMenuItemAction} className="grid gap-3 md:grid-cols-2">
                        <input name="contentLocale" type="hidden" value={contentLocale} />
                        <input name="itemId" type="hidden" value={item.id} />
                        <div>
                          <label className="mb-2 block text-sm" htmlFor={`item-name-${item.id}`}>
                            Product name
                          </label>
                          <input
                            className={inputClassName}
                            defaultValue={resolveLocalizedText(item.name, item.name_tr)}
                            id={`item-name-${item.id}`}
                            name="name"
                            required
                            type="text"
                          />
                        </div>
                        <div>
                          <label className="mb-2 block text-sm" htmlFor={`item-category-${item.id}`}>
                            Category
                          </label>
                          <select className={inputClassName} defaultValue={item.category_id} id={`item-category-${item.id}`} name="categoryId" required>
                            {categories.map((category) => {
                              return (
                                <option key={category.id} value={category.id}>
                                  {resolveLocalizedText(category.name, category.name_tr)}
                                </option>
                              )
                            })}
                          </select>
                        </div>
                        <div>
                          <label className="mb-2 block text-sm" htmlFor={`item-price-${item.id}`}>
                            Price
                          </label>
                          <input className={inputClassName} defaultValue={item.price} id={`item-price-${item.id}`} name="price" required step="0.01" type="number" />
                        </div>
                        <div>
                          <label className="mb-2 block text-sm" htmlFor={`item-order-${item.id}`}>
                            Display order
                          </label>
                          <input className={inputClassName} defaultValue={item.display_order} id={`item-order-${item.id}`} name="displayOrder" required type="number" />
                        </div>
                        <div className="md:col-span-2">
                          <label className="mb-2 block text-sm" htmlFor={`item-description-${item.id}`}>
                            Description
                          </label>
                          <textarea
                            className={textareaClassName}
                            defaultValue={resolveLocalizedText(item.description, item.description_tr)}
                            id={`item-description-${item.id}`}
                            name="description"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="mb-2 block text-sm" htmlFor={`item-image-${item.id}`}>
                            Image URL
                          </label>
                          <input className={inputClassName} defaultValue={item.image_url ?? ""} id={`item-image-${item.id}`} name="imageUrl" type="url" />
                        </div>
                        <div className="md:col-span-2">
                          <label className="mb-2 block text-sm" htmlFor={`item-tags-${item.id}`}>
                            Tags (comma separated)
                          </label>
                          <input className={inputClassName} defaultValue={itemTags.join(",")} id={`item-tags-${item.id}`} name="tags" type="text" />
                        </div>
                        <label className="inline-flex items-center gap-2 text-sm">
                          <input className={checkboxClassName} defaultChecked={item.is_available} name="isAvailable" type="checkbox" />
                          Available
                        </label>
                        <label className="inline-flex items-center gap-2 text-sm">
                          <input className={checkboxClassName} defaultChecked={item.is_featured} name="isFeatured" type="checkbox" />
                          Featured
                        </label>
                        <div className="md:col-span-2 flex flex-wrap gap-2">
                          <Button type="submit">Save Product</Button>
                        </div>
                      </form>

                      <form action={deleteMenuItemAction} className="mt-4 flex flex-wrap items-center gap-2 border-t border-border/70 pt-4">
                        <input name="itemId" type="hidden" value={item.id} />
                        <input className={inputClassName} name="confirmation" placeholder='Type "DELETE"' required type="text" />
                        <Button type="submit" variant="destructive">
                          Delete Product
                        </Button>
                      </form>
                    </div>
                  </details>
                )
              })}
            </div>
          </section>
        </section>

        <aside className="space-y-6 xl:sticky xl:top-6">
          <section className="rounded-xl border border-border/80 bg-card/70 p-6">
            <h2 className="font-heading text-xl">Quick Navigation</h2>
            <p className="mt-1 text-sm text-muted-foreground">Jump to any management section.</p>
            <div className="mt-4 grid gap-2">
              <Button asChild variant="outline">
                <a href="#website-content">Website Content</a>
              </Button>
              <Button asChild variant="outline">
                <a href="#manage-articles">Manage Articles</a>
              </Button>
              <Button asChild variant="outline">
                <a href="#manage-categories">Manage Categories</a>
              </Button>
              <Button asChild variant="outline">
                <a href="#manage-products">Manage Products</a>
              </Button>
              <Button asChild variant="outline">
                <a href="#create-article">Create Article</a>
              </Button>
              <Button asChild variant="outline">
                <a href="#create-category">Create Category</a>
              </Button>
              <Button asChild variant="outline">
                <a href="#create-product">Create Product</a>
              </Button>
            </div>
          </section>

          <section className="rounded-xl border border-border/80 bg-card/70 p-6" id="create-article">
            <h2 className="font-heading text-xl">Create Article</h2>
            <p className="mt-1 text-sm text-muted-foreground">Add a new article for Home or About pages.</p>
            <form action={createSiteArticleAction} className="mt-4 grid gap-3">
              <input name="contentLocale" type="hidden" value={contentLocale} />
              <div>
                <label className="mb-2 block text-sm" htmlFor="create-article-title">
                  Title
                </label>
                <input className={inputClassName} id="create-article-title" name="title" required type="text" />
              </div>
              <div>
                <label className="mb-2 block text-sm" htmlFor="create-article-page">
                  Page
                </label>
                <select className={inputClassName} id="create-article-page" name="page" required>
                  <option value="home">Home</option>
                  <option value="about">About</option>
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm" htmlFor="create-article-author">
                  Author
                </label>
                <input className={inputClassName} defaultValue="Balkon Café Team" id="create-article-author" name="author" type="text" />
              </div>
              <div>
                <label className="mb-2 block text-sm" htmlFor="create-article-order">
                  Display order
                </label>
                <input className={inputClassName} defaultValue={1} id="create-article-order" name="displayOrder" required type="number" />
              </div>
              <div>
                <label className="mb-2 block text-sm" htmlFor="create-article-excerpt">
                  Excerpt
                </label>
                <textarea className={textareaClassName} id="create-article-excerpt" name="excerpt" />
              </div>
              <div>
                <label className="mb-2 block text-sm" htmlFor="create-article-content">
                  Content
                </label>
                <textarea className="min-h-32 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring" id="create-article-content" name="content" required />
              </div>
              <div>
                <label className="mb-2 block text-sm" htmlFor="create-article-image">
                  Image URL
                </label>
                <input className={inputClassName} id="create-article-image" name="imageUrl" type="url" />
              </div>
              <label className="inline-flex items-center gap-2 text-sm">
                <input className={checkboxClassName} defaultChecked name="isPublished" type="checkbox" />
                Published
              </label>
              <Button type="submit">Create Article</Button>
            </form>
          </section>

          <section className="rounded-xl border border-border/80 bg-card/70 p-6" id="create-category">
            <h2 className="font-heading text-xl">Create Category</h2>
            <p className="mt-1 text-sm text-muted-foreground">Add a new menu group with ordering and visibility.</p>
            <form action={createCategoryAction} className="mt-4 grid gap-3">
              <input name="contentLocale" type="hidden" value={contentLocale} />
              <div>
                <label className="mb-2 block text-sm" htmlFor="create-category-name">
                  Name
                </label>
                <input className={inputClassName} id="create-category-name" name="name" required type="text" />
              </div>
              <div>
                <label className="mb-2 block text-sm" htmlFor="create-category-order">
                  Display order
                </label>
                <input className={inputClassName} defaultValue={1} id="create-category-order" name="displayOrder" required type="number" />
              </div>
              <div>
                <label className="mb-2 block text-sm" htmlFor="create-category-description">
                  Description
                </label>
                <textarea className={textareaClassName} id="create-category-description" name="description" />
              </div>
              <label className="inline-flex items-center gap-2 text-sm">
                <input className={checkboxClassName} defaultChecked name="isActive" type="checkbox" />
                Category visible
              </label>
              <Button type="submit">Create Category</Button>
            </form>
          </section>

          <section className="rounded-xl border border-border/80 bg-card/70 p-6" id="create-product">
            <h2 className="font-heading text-xl">Create Product</h2>
            <p className="mt-1 text-sm text-muted-foreground">Add a new menu item with pricing, tags, and availability.</p>
            {!hasCategories ? (
              <p className="mt-3 rounded-md border border-warning/30 bg-warning/10 px-3 py-2 text-sm text-warning">
                Create at least one category before adding products.
              </p>
            ) : null}
            <form action={createMenuItemAction} className="mt-4 grid gap-3">
              <input name="contentLocale" type="hidden" value={contentLocale} />
              <div>
                <label className="mb-2 block text-sm" htmlFor="create-product-name">
                  Product name
                </label>
                <input className={inputClassName} id="create-product-name" name="name" required type="text" />
              </div>
              <div>
                <label className="mb-2 block text-sm" htmlFor="create-product-category">
                  Category
                </label>
                <select className={inputClassName} disabled={!hasCategories} id="create-product-category" name="categoryId" required>
                  {categories.map((category) => {
                    return (
                      <option key={category.id} value={category.id}>
                        {resolveLocalizedText(category.name, category.name_tr)}
                      </option>
                    )
                  })}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm" htmlFor="create-product-price">
                  Price
                </label>
                <input className={inputClassName} id="create-product-price" name="price" required step="0.01" type="number" />
              </div>
              <div>
                <label className="mb-2 block text-sm" htmlFor="create-product-order">
                  Display order
                </label>
                <input className={inputClassName} defaultValue={1} id="create-product-order" name="displayOrder" required type="number" />
              </div>
              <div>
                <label className="mb-2 block text-sm" htmlFor="create-product-description">
                  Description
                </label>
                <textarea className={textareaClassName} id="create-product-description" name="description" />
              </div>
              <div>
                <label className="mb-2 block text-sm" htmlFor="create-product-image">
                  Image URL
                </label>
                <input className={inputClassName} id="create-product-image" name="imageUrl" placeholder="https://cdn..." type="url" />
              </div>
              <div>
                <label className="mb-2 block text-sm" htmlFor="create-product-tags">
                  Tags (comma separated)
                </label>
                <input className={inputClassName} id="create-product-tags" name="tags" placeholder="bestseller,vegetarian" type="text" />
              </div>
              <label className="inline-flex items-center gap-2 text-sm">
                <input className={checkboxClassName} defaultChecked name="isAvailable" type="checkbox" />
                Available
              </label>
              <label className="inline-flex items-center gap-2 text-sm">
                <input className={checkboxClassName} name="isFeatured" type="checkbox" />
                Featured
              </label>
              <Button disabled={!hasCategories} type="submit">
                Create Product
              </Button>
            </form>
          </section>
        </aside>
      </div>
    </main>
  )
}

export default AdminPage
