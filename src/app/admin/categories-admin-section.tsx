"use client"

import { useMemo, useState } from "react"
import { Edit3, ImageIcon, Plus, Trash2, X } from "lucide-react"
import { createCategoryAction, deleteCategoryAction, updateCategoryAction } from "@/app/admin/actions"
import { Button } from "@/components/ui/button"
import { menuCategoryIconOptions, resolveMenuCategoryIcon } from "@/lib/menu-category-icons"
import type { Database } from "@/types/database"

type CategoryRow = Database["public"]["Tables"]["menu_categories"]["Row"]
type MenuItemRow = Database["public"]["Tables"]["menu_items"]["Row"]

type CategoryModalMode = "create" | "edit"

type CategoryModalState =
  | { mode: "create" }
  | { mode: "edit"; category: CategoryRow }
  | null

type DeleteModalState = {
  category: CategoryRow
} | null

type CategoriesAdminSectionProps = {
  readonly categories: CategoryRow[]
  readonly menuItems: MenuItemRow[]
}

type CategoryFormProps = {
  readonly mode: CategoryModalMode
  readonly categories: CategoryRow[]
  readonly category?: CategoryRow
  readonly onClose: () => void
}

const inputClassName =
  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring"
const textareaClassName =
  "min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring"
const checkboxClassName = "size-4 rounded border-input bg-background"

const getCategoriesForPosition = (categories: CategoryRow[], excludedCategoryId?: string) => {
  return categories.filter((category) => category.id !== excludedCategoryId)
}

const CategoryForm = ({ mode, categories, category, onClose }: CategoryFormProps) => {
  const [selectedPosition, setSelectedPosition] = useState(() => {
    const maxPosition = getCategoriesForPosition(categories, category?.id).length + 1

    if (category) {
      return String(Math.min(Math.max(category.display_order, 1), maxPosition))
    }

    return String(maxPosition)
  })

  const maxPosition = getCategoriesForPosition(categories, category?.id).length + 1
  const positionOptions = Array.from({ length: maxPosition }, (_, index) => index + 1)
  const action = mode === "create" ? createCategoryAction : updateCategoryAction

  return (
    <form action={action} className="grid gap-3 md:grid-cols-2">
      {category ? <input name="categoryId" type="hidden" value={category.id} /> : null}
      <div>
        <label className="mb-2 block text-sm" htmlFor={`${mode}-category-name`}>
          Kategori adi
        </label>
        <input className={inputClassName} defaultValue={category?.name ?? ""} id={`${mode}-category-name`} name="name" required type="text" />
      </div>
      <div>
        <label className="mb-2 block text-sm" htmlFor={`${mode}-category-position`}>
          Menu pozisyonu
        </label>
        <select className={inputClassName} id={`${mode}-category-position`} name="displayOrder" onChange={(event) => setSelectedPosition(event.target.value)} value={selectedPosition}>
          {positionOptions.map((position) => {
            return (
              <option key={position} value={position}>
                {position}. siraya yerlestir
              </option>
            )
          })}
        </select>
        <p className="mt-1 text-xs text-muted-foreground">Secilen siraya tasinir; diger kategoriler otomatik kaydirilir.</p>
      </div>
      <div>
        <label className="mb-2 block text-sm" htmlFor={`${mode}-category-icon`}>
          Ikon
        </label>
        <select className={inputClassName} defaultValue={category?.icon_name ?? ""} id={`${mode}-category-icon`} name="iconName">
          <option value="">Varsayilan ikon</option>
          {menuCategoryIconOptions.map((iconOption) => {
            return (
              <option key={iconOption.value} value={iconOption.value}>
                {iconOption.label}
              </option>
            )
          })}
        </select>
      </div>
      <div>
        <label className="mb-2 block text-sm" htmlFor={`${mode}-category-image`}>
          Dairesel gorsel URL
        </label>
        <input className={inputClassName} defaultValue={category?.image_url ?? ""} id={`${mode}-category-image`} name="imageUrl" placeholder="https://images.example.com/category.jpg" type="url" />
      </div>
      <div className="md:col-span-2">
        <label className="mb-2 block text-sm" htmlFor={`${mode}-category-description`}>
          Aciklama
        </label>
        <textarea className={textareaClassName} defaultValue={category?.description ?? ""} id={`${mode}-category-description`} name="description" />
      </div>
      <label className="inline-flex items-center gap-2 text-sm">
        <input className={checkboxClassName} defaultChecked={category?.is_active ?? true} name="isActive" type="checkbox" />
        Kategori gorunur
      </label>
      <div className="md:col-span-2 flex flex-wrap justify-end gap-2 border-t border-border/70 pt-4">
        <Button onClick={onClose} type="button" variant="ghost">
          Vazgec
        </Button>
        <Button type="submit">{mode === "create" ? "Kategori Olustur" : "Degisiklikleri Kaydet"}</Button>
      </div>
    </form>
  )
}

const CategoriesAdminSection = ({ categories, menuItems }: CategoriesAdminSectionProps) => {
  const [categoryModal, setCategoryModal] = useState<CategoryModalState>(null)
  const [deleteModal, setDeleteModal] = useState<DeleteModalState>(null)

  const orderedCategories = useMemo(() => {
    return [...categories].sort((a, b) => a.display_order - b.display_order || a.name.localeCompare(b.name))
  }, [categories])

  const productCountByCategory = useMemo(() => {
    return menuItems.reduce<Record<string, number>>((acc, item) => {
      acc[item.category_id] = (acc[item.category_id] ?? 0) + 1
      return acc
    }, {})
  }, [menuItems])

  return (
    <section className="rounded-xl border border-border/80 bg-card/70 p-6" id="manage-categories">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-heading text-2xl">Kategorileri Yonet</h2>
          <p className="mt-1 text-sm text-muted-foreground">Kategorileri kartlar halinde inceleyin; ekleme, guncelleme ve silme islemleri modal uzerinden yapilir.</p>
        </div>
        <Button onClick={() => setCategoryModal({ mode: "create" })} size="icon" title="Kategori ekle" type="button">
          <Plus aria-hidden className="size-5" />
        </Button>
      </div>

      {orderedCategories.length === 0 ? (
        <p className="rounded-lg border border-border/70 bg-background/40 px-4 py-3 text-sm text-muted-foreground">Henuz kategori yok. Sag ustteki arti butonuyla ilk kategoriyi ekleyin.</p>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
        {orderedCategories.map((category) => {
          const productCount = productCountByCategory[category.id] ?? 0
          const CategoryIcon = resolveMenuCategoryIcon(category.icon_name)

          return (
            <article className="overflow-hidden rounded-lg border border-border/70 bg-background/45" key={category.id}>
              <div className="relative aspect-[16/9] w-full overflow-hidden border-b border-border/70 bg-secondary/50">
                {category.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img alt={`${category.name} gorseli`} className="h-full w-full object-cover" loading="lazy" src={category.image_url} />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-muted-foreground">
                    <ImageIcon aria-hidden className="size-7" />
                    <span className="text-xs">Gorsel eklenmedi</span>
                  </div>
                )}
              </div>
              <div className="flex items-start justify-between gap-3 border-b border-border/70 px-4 py-3">
                <div className="flex min-w-0 items-start gap-3">
                  <span className="mt-1 inline-flex size-9 shrink-0 items-center justify-center rounded-md bg-primary/15 text-primary">
                    <CategoryIcon aria-hidden className="size-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Sira {category.display_order}</p>
                    <h3 className="mt-1 truncate font-heading text-xl text-foreground">{category.name}</h3>
                  </div>
                </div>
                <div className="flex shrink-0 gap-1">
                  <Button onClick={() => setCategoryModal({ mode: "edit", category })} size="icon" title="Kategoriyi duzenle" type="button" variant="ghost">
                    <Edit3 aria-hidden className="size-4" />
                  </Button>
                  <Button onClick={() => setDeleteModal({ category })} size="icon" title="Kategoriyi sil" type="button" variant="ghost">
                    <Trash2 aria-hidden className="size-4" />
                  </Button>
                </div>
              </div>
              <div className="space-y-3 p-4">
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className={`rounded-full px-2 py-1 ${category.is_active ? "border border-success/30 bg-success/10 text-success" : "border border-warning/30 bg-warning/10 text-warning"}`}>
                    {category.is_active ? "Gorunur" : "Gizli"}
                  </span>
                  <span className="rounded-full border border-border/70 bg-card/50 px-2 py-1 text-muted-foreground">{productCount} urun</span>
                </div>
                <p className="line-clamp-3 text-sm text-muted-foreground">{category.description || "Aciklama eklenmedi."}</p>
              </div>
            </article>
          )
        })}
      </div>

      {categoryModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6 backdrop-blur-sm" role="dialog" aria-modal="true">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl border border-border/80 bg-card p-5 shadow-2xl">
            <div className="mb-4 flex items-start justify-between gap-3 border-b border-border/70 pb-4">
              <div>
                <h3 className="font-heading text-2xl">{categoryModal.mode === "create" ? "Kategori Ekle" : "Kategoriyi Duzenle"}</h3>
                <p className="mt-1 text-sm text-muted-foreground">Pozisyon secimi ayni siradaki kategorileri otomatik kaydirir.</p>
              </div>
              <Button onClick={() => setCategoryModal(null)} size="icon" title="Kapat" type="button" variant="ghost">
                <X aria-hidden className="size-5" />
              </Button>
            </div>
            <CategoryForm categories={categories} category={categoryModal.mode === "edit" ? categoryModal.category : undefined} mode={categoryModal.mode} onClose={() => setCategoryModal(null)} />
          </div>
        </div>
      ) : null}

      {deleteModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6 backdrop-blur-sm" role="dialog" aria-modal="true">
          <div className="w-full max-w-md rounded-xl border border-border/80 bg-card p-5 shadow-2xl">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h3 className="font-heading text-2xl">Kategoriyi Sil</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {deleteModal.category.name} kalici olarak silinecek. Bu kategoriye bagli {productCountByCategory[deleteModal.category.id] ?? 0} urun de silinir.
                </p>
              </div>
              <Button onClick={() => setDeleteModal(null)} size="icon" title="Kapat" type="button" variant="ghost">
                <X aria-hidden className="size-5" />
              </Button>
            </div>
            <form action={deleteCategoryAction} className="space-y-4">
              <input name="categoryId" type="hidden" value={deleteModal.category.id} />
              <div>
                <label className="mb-2 block text-sm" htmlFor="delete-category-confirmation">
                  Onay icin delete yazin
                </label>
                <input className={inputClassName} id="delete-category-confirmation" name="confirmation" required type="text" />
              </div>
              <div className="flex justify-end gap-2 border-t border-border/70 pt-4">
                <Button onClick={() => setDeleteModal(null)} type="button" variant="ghost">
                  Vazgec
                </Button>
                <Button type="submit" variant="destructive">
                  Kategoriyi Sil
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </section>
  )
}

export { CategoriesAdminSection }
