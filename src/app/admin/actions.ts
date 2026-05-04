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
    throw new Error("Page must be either home or about")
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
    throw new Error("Admin has already been initialized. Ask an existing admin to grant access.")
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
    heroBadge: parseRequiredString(formData.get("heroBadge"), "Hero badge"),
    heroTitle: parseRequiredString(formData.get("heroTitle"), "Hero title"),
    heroDescription: parseRequiredString(formData.get("heroDescription"), "Hero description"),
    signatureTitle: parseRequiredString(formData.get("signatureTitle"), "Signature title"),
    signaturePointOne: parseRequiredString(formData.get("signaturePointOne"), "Signature point one"),
    signaturePointTwo: parseRequiredString(formData.get("signaturePointTwo"), "Signature point two"),
    signaturePointThree: parseRequiredString(formData.get("signaturePointThree"), "Signature point three"),
    storyBadge: parseRequiredString(formData.get("storyBadge"), "Story badge"),
    storyTitle: parseRequiredString(formData.get("storyTitle"), "Story title"),
    storyDescription: parseRequiredString(formData.get("storyDescription"), "Story description"),
    storyHighlightOne: parseRequiredString(formData.get("storyHighlightOne"), "Story highlight one"),
    storyHighlightTwo: parseRequiredString(formData.get("storyHighlightTwo"), "Story highlight two"),
    storyHighlightThree: parseRequiredString(formData.get("storyHighlightThree"), "Story highlight three"),
    visitEyebrow: parseRequiredString(formData.get("visitEyebrow"), "Visit eyebrow"),
    visitTitle: parseRequiredString(formData.get("visitTitle"), "Visit title"),
    visitDescription: parseRequiredString(formData.get("visitDescription"), "Visit description")
  }

  await upsertSiteContentEntry("home", homeContent)
  revalidatePublicAndAdminPaths()
  redirect("/admin?status=site-home-updated")
}

const updateAboutContentAction = async (formData: FormData) => {
  const aboutContent = {
    badge: parseRequiredString(formData.get("badge"), "About badge"),
    title: parseRequiredString(formData.get("title"), "About title"),
    intro: parseRequiredString(formData.get("intro"), "About intro"),
    philosophyEyebrow: parseRequiredString(formData.get("philosophyEyebrow"), "Philosophy eyebrow"),
    philosophyDescription: parseRequiredString(formData.get("philosophyDescription"), "Philosophy description"),
    valuesEyebrow: parseRequiredString(formData.get("valuesEyebrow"), "Values eyebrow"),
    valuesTitle: parseRequiredString(formData.get("valuesTitle"), "Values title"),
    valuesDescription: parseRequiredString(formData.get("valuesDescription"), "Values description"),
    valueOneTitle: parseRequiredString(formData.get("valueOneTitle"), "Value one title"),
    valueOneDescription: parseRequiredString(formData.get("valueOneDescription"), "Value one description"),
    valueTwoTitle: parseRequiredString(formData.get("valueTwoTitle"), "Value two title"),
    valueTwoDescription: parseRequiredString(formData.get("valueTwoDescription"), "Value two description"),
    valueThreeTitle: parseRequiredString(formData.get("valueThreeTitle"), "Value three title"),
    valueThreeDescription: parseRequiredString(formData.get("valueThreeDescription"), "Value three description"),
    journeyEyebrow: parseRequiredString(formData.get("journeyEyebrow"), "Journey eyebrow"),
    journeyTitle: parseRequiredString(formData.get("journeyTitle"), "Journey title"),
    journeyDescription: parseRequiredString(formData.get("journeyDescription"), "Journey description")
  }

  await upsertSiteContentEntry("about", aboutContent)
  revalidatePublicAndAdminPaths()
  redirect("/admin?status=site-about-updated")
}

const updateContactContentAction = async (formData: FormData) => {
  const contactContent = {
    badge: parseRequiredString(formData.get("badge"), "Contact badge"),
    title: parseRequiredString(formData.get("title"), "Contact title"),
    description: parseRequiredString(formData.get("description"), "Contact description"),
    quickMessageTitle: parseRequiredString(formData.get("quickMessageTitle"), "Quick message title"),
    quickMessageDescription: parseRequiredString(formData.get("quickMessageDescription"), "Quick message description"),
    detailsEyebrow: parseRequiredString(formData.get("detailsEyebrow"), "Details eyebrow"),
    detailsTitle: parseRequiredString(formData.get("detailsTitle"), "Details title"),
    detailsDescription: parseRequiredString(formData.get("detailsDescription"), "Details description"),
    phone: parseRequiredString(formData.get("phone"), "Phone"),
    email: parseRequiredString(formData.get("email"), "Email"),
    address: parseRequiredString(formData.get("address"), "Address"),
    hours: parseRequiredString(formData.get("hours"), "Hours"),
    mapUrl: parseRequiredString(formData.get("mapUrl"), "Map URL")
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
  const displayOrder = parseInteger(formData.get("displayOrder"), "Display order")
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
  const displayOrder = parseInteger(formData.get("displayOrder"), "Display order")
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
  const confirmation = parseRequiredString(formData.get("confirmation"), "Delete confirmation")

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

  const name = parseRequiredString(formData.get("name"), "Category name")
  const description = parseString(formData.get("description"))
  const iconName = normalizeMenuCategoryIconName(parseString(formData.get("iconName")))
  const imageUrl = parseOptionalString(formData.get("imageUrl"))
  const displayOrder = parseInteger(formData.get("displayOrder"), "Display order")
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

  const categoryId = parseRequiredString(formData.get("categoryId"), "Category id")
  const name = parseRequiredString(formData.get("name"), "Category name")
  const description = parseString(formData.get("description"))
  const iconName = normalizeMenuCategoryIconName(parseString(formData.get("iconName")))
  const imageUrl = parseOptionalString(formData.get("imageUrl"))
  const displayOrder = parseInteger(formData.get("displayOrder"), "Display order")
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

  const categoryId = parseRequiredString(formData.get("categoryId"), "Category id")
  const confirmation = parseRequiredString(formData.get("confirmation"), "Delete confirmation")

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

  const categoryId = parseRequiredString(formData.get("categoryId"), "Category")
  const name = parseRequiredString(formData.get("name"), "Product name")
  const description = parseString(formData.get("description"))
  const price = parseNumber(formData.get("price"), "Price")
  const imageUrl = parseOptionalString(formData.get("imageUrl"))
  const displayOrder = parseInteger(formData.get("displayOrder"), "Display order")
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
  const categoryId = parseRequiredString(formData.get("categoryId"), "Category")
  const name = parseRequiredString(formData.get("name"), "Product name")
  const description = parseString(formData.get("description"))
  const price = parseNumber(formData.get("price"), "Price")
  const imageUrl = parseOptionalString(formData.get("imageUrl"))
  const displayOrder = parseInteger(formData.get("displayOrder"), "Display order")
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
  const confirmation = parseRequiredString(formData.get("confirmation"), "Delete confirmation")

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
