"use server"

import { revalidatePath, revalidateTag } from "next/cache"
import { redirect } from "next/navigation"
import { normalizeMenuCategoryIconName } from "@/lib/menu-category-icons"
import { createSupabaseAdminClient } from "@/lib/supabase/admin"
import { isRecoverableSupabaseAuthError } from "@/lib/supabase/auth-errors"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import type { ContentPage } from "@/types/site-content"
import type { MenuTag } from "@/types/menu"

const allowedTags: MenuTag[] = ["vegan", "vegetarian", "spicy", "containsNuts", "glutenFree", "bestseller"]
const allowedContentPages: ContentPage[] = ["home", "about"]

const parseRequiredString = (value: FormDataEntryValue | null, fieldName: string) => {
  const parsed = String(value ?? "").trim()

  if (!parsed) {
    throw new Error(`${fieldName} is required`)
  }

  return parsed
}

const parseString = (value: FormDataEntryValue | null) => {
  return String(value ?? "").trim()
}

const parseOptionalString = (value: FormDataEntryValue | null) => {
  const parsed = String(value ?? "").trim()
  return parsed || null
}

const parseInteger = (value: FormDataEntryValue | null, fieldName: string) => {
  const parsed = Number(String(value ?? "").trim())

  if (!Number.isInteger(parsed)) {
    throw new Error(`${fieldName} must be an integer`)
  }

  return parsed
}

const parseNumber = (value: FormDataEntryValue | null, fieldName: string) => {
  const parsed = Number(String(value ?? "").trim())

  if (!Number.isFinite(parsed)) {
    throw new Error(`${fieldName} must be a valid number`)
  }

  return parsed
}

const parseBoolean = (value: FormDataEntryValue | null) => {
  return String(value ?? "") === "on"
}

const parseTags = (value: FormDataEntryValue | null): MenuTag[] => {
  const parsed = String(value ?? "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean)

  const validTags = parsed.filter((tag): tag is MenuTag => {
    return allowedTags.includes(tag as MenuTag)
  })

  return Array.from(new Set(validTags))
}

const parseContentPage = (value: FormDataEntryValue | null): ContentPage => {
  const parsed = String(value ?? "").trim() as ContentPage

  if (!allowedContentPages.includes(parsed)) {
    throw new Error("Sayfa degeri home veya about olmalidir")
  }

  return parsed
}

const revalidatePublicAndAdminPaths = () => {
  revalidatePath("/")
  revalidatePath("/about")
  revalidatePath("/contact")
  revalidatePath("/menu")
  revalidatePath("/tr")
  revalidatePath("/tr/about")
  revalidatePath("/tr/contact")
  revalidatePath("/tr/menu")
  revalidatePath("/admin")
  revalidateTag("menu-data")
  revalidateTag("site-content")
  revalidateTag("site-articles")
}

const getAuthenticatedUser = async () => {
  const sessionClient = await createSupabaseServerClient()
  const {
    data: { user },
    error
  } = await sessionClient.auth.getUser()

  if (error) {
    if (isRecoverableSupabaseAuthError(error)) {
      redirect("/admin/login")
    }

    throw error
  }

  if (!user) {
    redirect("/admin/login")
  }

  return { sessionClient, user }
}

const ensureAdminAccess = async () => {
  const { user } = await getAuthenticatedUser()
  const supabaseAdmin = createSupabaseAdminClient()
  const { data: profile, error } = await supabaseAdmin.from("admin_profiles").select("id").eq("id", user.id).maybeSingle()

  if (error || !profile) {
    throw new Error("Current user is not registered as an admin")
  }

  return { supabaseAdmin, user }
}

const upsertSiteContentEntry = async (key: "home" | "about" | "contact", value: Record<string, string>) => {
  const { supabaseAdmin } = await ensureAdminAccess()
  const { error } = await supabaseAdmin.from("site_content_entries").upsert({ key, value }, { onConflict: "key" })

  if (error) {
    throw error
  }
}

const initializeAdminAccessAction = async () => {
  const { user } = await getAuthenticatedUser()

  if (!user.email) {
    throw new Error("Authenticated user has no email")
  }

  const supabaseAdmin = createSupabaseAdminClient()

  const { data: existingProfile, error: existingProfileError } = await supabaseAdmin
    .from("admin_profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle()

  if (existingProfileError) {
    throw existingProfileError
  }

  if (existingProfile) {
    redirect("/admin")
  }

  const { count, error: countError } = await supabaseAdmin.from("admin_profiles").select("id", { count: "exact", head: true })

  if (countError) {
    throw countError
  }

  if ((count ?? 0) > 0) {
    throw new Error("Yonetici zaten baslatildi. Mevcut bir yoneticiden erisim isteyin.")
  }

  const { error: insertError } = await supabaseAdmin.from("admin_profiles").insert({
    id: user.id,
    email: user.email,
    role: "admin"
  })

  if (insertError) {
    throw insertError
  }

  revalidatePublicAndAdminPaths()
  redirect("/admin?status=admin-initialized")
}

const updateHomeContentAction = async (formData: FormData) => {
  const homeContent = {
    heroBadge: parseRequiredString(formData.get("heroBadge"), "Hero rozeti"),
    heroTitle: parseRequiredString(formData.get("heroTitle"), "Hero basligi"),
    heroDescription: parseRequiredString(formData.get("heroDescription"), "Hero aciklamasi"),
    signatureTitle: parseRequiredString(formData.get("signatureTitle"), "Imza basligi"),
    signaturePointOne: parseRequiredString(formData.get("signaturePointOne"), "Imza maddesi bir"),
    signaturePointTwo: parseRequiredString(formData.get("signaturePointTwo"), "Imza maddesi iki"),
    signaturePointThree: parseRequiredString(formData.get("signaturePointThree"), "Imza maddesi uc"),
    storyBadge: parseRequiredString(formData.get("storyBadge"), "Hikaye rozeti"),
    storyTitle: parseRequiredString(formData.get("storyTitle"), "Hikaye basligi"),
    storyDescription: parseRequiredString(formData.get("storyDescription"), "Hikaye aciklamasi"),
    storyHighlightOne: parseRequiredString(formData.get("storyHighlightOne"), "Hikaye vurgusu bir"),
    storyHighlightTwo: parseRequiredString(formData.get("storyHighlightTwo"), "Hikaye vurgusu iki"),
    storyHighlightThree: parseRequiredString(formData.get("storyHighlightThree"), "Hikaye vurgusu uc"),
    visitEyebrow: parseRequiredString(formData.get("visitEyebrow"), "Ziyaret etiketi"),
    visitTitle: parseRequiredString(formData.get("visitTitle"), "Ziyaret basligi"),
    visitDescription: parseRequiredString(formData.get("visitDescription"), "Ziyaret aciklamasi")
  }

  await upsertSiteContentEntry("home", homeContent)
  revalidatePublicAndAdminPaths()
  redirect("/admin?status=site-home-updated")
}

const updateAboutContentAction = async (formData: FormData) => {
  const aboutContent = {
    badge: parseRequiredString(formData.get("badge"), "Hakkimizda rozeti"),
    title: parseRequiredString(formData.get("title"), "Hakkimizda basligi"),
    intro: parseRequiredString(formData.get("intro"), "Hakkimizda giris metni"),
    philosophyEyebrow: parseRequiredString(formData.get("philosophyEyebrow"), "Felsefe etiketi"),
    philosophyDescription: parseRequiredString(formData.get("philosophyDescription"), "Felsefe aciklamasi"),
    valuesEyebrow: parseRequiredString(formData.get("valuesEyebrow"), "Degerler etiketi"),
    valuesTitle: parseRequiredString(formData.get("valuesTitle"), "Degerler basligi"),
    valuesDescription: parseRequiredString(formData.get("valuesDescription"), "Degerler aciklamasi"),
    valueOneTitle: parseRequiredString(formData.get("valueOneTitle"), "Birinci deger basligi"),
    valueOneDescription: parseRequiredString(formData.get("valueOneDescription"), "Birinci deger aciklamasi"),
    valueTwoTitle: parseRequiredString(formData.get("valueTwoTitle"), "Ikinci deger basligi"),
    valueTwoDescription: parseRequiredString(formData.get("valueTwoDescription"), "Ikinci deger aciklamasi"),
    valueThreeTitle: parseRequiredString(formData.get("valueThreeTitle"), "Ucuncu deger basligi"),
    valueThreeDescription: parseRequiredString(formData.get("valueThreeDescription"), "Ucuncu deger aciklamasi"),
    journeyEyebrow: parseRequiredString(formData.get("journeyEyebrow"), "Yolculuk etiketi"),
    journeyTitle: parseRequiredString(formData.get("journeyTitle"), "Yolculuk basligi"),
    journeyDescription: parseRequiredString(formData.get("journeyDescription"), "Yolculuk aciklamasi")
  }

  await upsertSiteContentEntry("about", aboutContent)
  revalidatePublicAndAdminPaths()
  redirect("/admin?status=site-about-updated")
}

const updateContactContentAction = async (formData: FormData) => {
  const contactContent = {
    badge: parseRequiredString(formData.get("badge"), "Iletisim rozeti"),
    title: parseRequiredString(formData.get("title"), "Iletisim basligi"),
    description: parseRequiredString(formData.get("description"), "Iletisim aciklamasi"),
    quickMessageTitle: parseRequiredString(formData.get("quickMessageTitle"), "Hizli mesaj basligi"),
    quickMessageDescription: parseRequiredString(formData.get("quickMessageDescription"), "Hizli mesaj aciklamasi"),
    detailsEyebrow: parseRequiredString(formData.get("detailsEyebrow"), "Detay etiketi"),
    detailsTitle: parseRequiredString(formData.get("detailsTitle"), "Detay basligi"),
    detailsDescription: parseRequiredString(formData.get("detailsDescription"), "Detay aciklamasi"),
    phone: parseRequiredString(formData.get("phone"), "Telefon"),
    email: parseRequiredString(formData.get("email"), "E-posta"),
    address: parseRequiredString(formData.get("address"), "Adres"),
    hours: parseRequiredString(formData.get("hours"), "Calisma saatleri"),
    mapUrl: parseRequiredString(formData.get("mapUrl"), "Harita URL")
  }

  await upsertSiteContentEntry("contact", contactContent)
  revalidatePublicAndAdminPaths()
  redirect("/admin?status=site-contact-updated")
}

const createSiteArticleAction = async (formData: FormData) => {
  const { supabaseAdmin } = await ensureAdminAccess()

  const page = parseContentPage(formData.get("page"))
  const title = parseRequiredString(formData.get("title"), "Article title")
  const excerpt = parseString(formData.get("excerpt"))
  const content = parseRequiredString(formData.get("content"), "Article content")
  const imageUrl = parseOptionalString(formData.get("imageUrl"))
  const author = parseString(formData.get("author")) || "Balkon Café Team"
  const displayOrder = parseInteger(formData.get("displayOrder"), "Gosterim sirasi")
  const isPublished = parseBoolean(formData.get("isPublished"))

  const { error } = await supabaseAdmin.from("site_articles").insert({
    page,
    title,
    excerpt,
    content,
    image_url: imageUrl,
    author,
    display_order: displayOrder,
    is_published: isPublished
  })

  if (error) {
    throw error
  }

  revalidatePublicAndAdminPaths()
  redirect("/admin?status=site-article-created")
}

const updateSiteArticleAction = async (formData: FormData) => {
  const { supabaseAdmin } = await ensureAdminAccess()

  const articleId = parseRequiredString(formData.get("articleId"), "Article id")
  const page = parseContentPage(formData.get("page"))
  const title = parseRequiredString(formData.get("title"), "Article title")
  const excerpt = parseString(formData.get("excerpt"))
  const content = parseRequiredString(formData.get("content"), "Article content")
  const imageUrl = parseOptionalString(formData.get("imageUrl"))
  const author = parseString(formData.get("author")) || "Balkon Café Team"
  const displayOrder = parseInteger(formData.get("displayOrder"), "Gosterim sirasi")
  const isPublished = parseBoolean(formData.get("isPublished"))

  const { error } = await supabaseAdmin
    .from("site_articles")
    .update({
      page,
      title,
      excerpt,
      content,
      image_url: imageUrl,
      author,
      display_order: displayOrder,
      is_published: isPublished
    })
    .eq("id", articleId)

  if (error) {
    throw error
  }

  revalidatePublicAndAdminPaths()
  redirect("/admin?status=site-article-updated")
}

const deleteSiteArticleAction = async (formData: FormData) => {
  const { supabaseAdmin } = await ensureAdminAccess()

  const articleId = parseRequiredString(formData.get("articleId"), "Article id")
  const confirmation = parseRequiredString(formData.get("confirmation"), "Silme onayi")

  if (confirmation !== "DELETE") {
    throw new Error('Type "DELETE" to confirm article deletion')
  }

  const { error } = await supabaseAdmin.from("site_articles").delete().eq("id", articleId)

  if (error) {
    throw error
  }

  revalidatePublicAndAdminPaths()
  redirect("/admin?status=site-article-deleted")
}

const createCategoryAction = async (formData: FormData) => {
  const { supabaseAdmin } = await ensureAdminAccess()

  const name = parseRequiredString(formData.get("name"), "Kategori adi")
  const description = parseString(formData.get("description"))
  const iconName = normalizeMenuCategoryIconName(parseString(formData.get("iconName")))
  const imageUrl = parseOptionalString(formData.get("imageUrl"))
  const displayOrder = parseInteger(formData.get("displayOrder"), "Gosterim sirasi")
  const isActive = parseBoolean(formData.get("isActive"))

  const { error } = await supabaseAdmin.from("menu_categories").insert({
    name,
    description,
    icon_name: iconName,
    image_url: imageUrl ?? "",
    display_order: displayOrder,
    is_active: isActive
  })

  if (error) {
    throw error
  }

  revalidatePublicAndAdminPaths()
  redirect("/admin?status=category-created")
}

const updateCategoryAction = async (formData: FormData) => {
  const { supabaseAdmin } = await ensureAdminAccess()

  const categoryId = parseRequiredString(formData.get("categoryId"), "Kategori kimligi")
  const name = parseRequiredString(formData.get("name"), "Kategori adi")
  const description = parseString(formData.get("description"))
  const iconName = normalizeMenuCategoryIconName(parseString(formData.get("iconName")))
  const imageUrl = parseOptionalString(formData.get("imageUrl"))
  const displayOrder = parseInteger(formData.get("displayOrder"), "Gosterim sirasi")
  const isActive = parseBoolean(formData.get("isActive"))

  const { error } = await supabaseAdmin
    .from("menu_categories")
    .update({
      name,
      description,
      icon_name: iconName,
      image_url: imageUrl ?? "",
      display_order: displayOrder,
      is_active: isActive
    })
    .eq("id", categoryId)

  if (error) {
    throw error
  }

  revalidatePublicAndAdminPaths()
  redirect("/admin?status=category-updated")
}

const deleteCategoryAction = async (formData: FormData) => {
  const { supabaseAdmin } = await ensureAdminAccess()

  const categoryId = parseRequiredString(formData.get("categoryId"), "Kategori kimligi")
  const confirmation = parseRequiredString(formData.get("confirmation"), "Silme onayi")

  if (confirmation !== "DELETE") {
    throw new Error('Type "DELETE" to confirm category deletion')
  }

  const { error } = await supabaseAdmin.from("menu_categories").delete().eq("id", categoryId)

  if (error) {
    throw error
  }

  revalidatePublicAndAdminPaths()
  redirect("/admin?status=category-deleted")
}

const createMenuItemAction = async (formData: FormData) => {
  const { supabaseAdmin } = await ensureAdminAccess()

  const categoryId = parseRequiredString(formData.get("categoryId"), "Kategori")
  const name = parseRequiredString(formData.get("name"), "Product name")
  const description = parseString(formData.get("description"))
  const price = parseNumber(formData.get("price"), "Fiyat")
  const imageUrl = parseOptionalString(formData.get("imageUrl"))
  const displayOrder = parseInteger(formData.get("displayOrder"), "Gosterim sirasi")
  const isAvailable = parseBoolean(formData.get("isAvailable"))
  const isFeatured = parseBoolean(formData.get("isFeatured"))
  const tags = parseTags(formData.get("tags"))

  const { data: insertedItem, error: insertError } = await supabaseAdmin
    .from("menu_items")
    .insert({
      category_id: categoryId,
      name,
      description,
      price,
      image_url: imageUrl,
      display_order: displayOrder,
      is_available: isAvailable,
      is_featured: isFeatured
    })
    .select("id")
    .single()

  if (insertError) {
    throw insertError
  }

  if (tags.length > 0) {
    const { error: tagError } = await supabaseAdmin.from("menu_item_tags").insert(
      tags.map((tag) => {
        return {
          item_id: insertedItem.id,
          tag
        }
      })
    )

    if (tagError) {
      throw tagError
    }
  }

  revalidatePublicAndAdminPaths()
  redirect("/admin?status=product-created")
}

const updateMenuItemAction = async (formData: FormData) => {
  const { supabaseAdmin } = await ensureAdminAccess()

  const itemId = parseRequiredString(formData.get("itemId"), "Item id")
  const categoryId = parseRequiredString(formData.get("categoryId"), "Kategori")
  const name = parseRequiredString(formData.get("name"), "Product name")
  const description = parseString(formData.get("description"))
  const price = parseNumber(formData.get("price"), "Fiyat")
  const imageUrl = parseOptionalString(formData.get("imageUrl"))
  const displayOrder = parseInteger(formData.get("displayOrder"), "Gosterim sirasi")
  const isAvailable = parseBoolean(formData.get("isAvailable"))
  const isFeatured = parseBoolean(formData.get("isFeatured"))
  const tags = parseTags(formData.get("tags"))

  const { error: updateError } = await supabaseAdmin
    .from("menu_items")
    .update({
      category_id: categoryId,
      name,
      description,
      price,
      image_url: imageUrl,
      display_order: displayOrder,
      is_available: isAvailable,
      is_featured: isFeatured
    })
    .eq("id", itemId)

  if (updateError) {
    throw updateError
  }

  const { error: deleteTagError } = await supabaseAdmin.from("menu_item_tags").delete().eq("item_id", itemId)

  if (deleteTagError) {
    throw deleteTagError
  }

  if (tags.length > 0) {
    const { error: insertTagError } = await supabaseAdmin.from("menu_item_tags").insert(
      tags.map((tag) => {
        return {
          item_id: itemId,
          tag
        }
      })
    )

    if (insertTagError) {
      throw insertTagError
    }
  }

  revalidatePublicAndAdminPaths()
  redirect("/admin?status=product-updated")
}

const deleteMenuItemAction = async (formData: FormData) => {
  const { supabaseAdmin } = await ensureAdminAccess()

  const itemId = parseRequiredString(formData.get("itemId"), "Item id")
  const confirmation = parseRequiredString(formData.get("confirmation"), "Silme onayi")

  if (confirmation !== "DELETE") {
    throw new Error('Type "DELETE" to confirm product deletion')
  }

  const { error } = await supabaseAdmin.from("menu_items").delete().eq("id", itemId)

  if (error) {
    throw error
  }

  revalidatePublicAndAdminPaths()
  redirect("/admin?status=product-deleted")
}

const signOutAdminAction = async () => {
  const { sessionClient } = await getAuthenticatedUser()
  const { error } = await sessionClient.auth.signOut()

  if (error) {
    throw error
  }

  redirect("/admin/login")
}

export {
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
}
