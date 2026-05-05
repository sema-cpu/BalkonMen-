"use client"

import { useMemo, useState } from "react"
import { Edit3, Flame, ImageIcon, Plus, Trash2, X } from "lucide-react"
import { createMenuItemAction, deleteMenuItemAction, updateMenuItemAction } from "@/app/admin/actions"
import { Button } from "@/components/ui/button"
import { donenessOptions, getDonenessLabel } from "@/lib/doneness"
import type { Database } from "@/types/database"

type CategoryRow = Database["public"]["Tables"]["menu_categories"]["Row"]
type MenuItemRow = Database["public"]["Tables"]["menu_items"]["Row"]

type ProductModalMode = "create" | "edit"

type ProductModalState =
  | { mode: "create" }
  | { mode: "edit"; item: MenuItemRow }
  | null

type DeleteModalState = {
  item: MenuItemRow
} | null

type ProductsAdminSectionProps = {
  readonly categories: CategoryRow[]
  readonly menuItems: MenuItemRow[]
  readonly tagsByItem: Record<string, string[]>
}

type ProductFormProps = {
  readonly mode: ProductModalMode
  readonly categories: CategoryRow[]
  readonly menuItems: MenuItemRow[]
  readonly tagsByItem: Record<string, string[]>
  readonly item?: MenuItemRow
  readonly onClose: () => void
}

const inputClassName =
  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring"
const textareaClassName =
  "min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring"
const checkboxClassName = "size-4 rounded border-input bg-background"

const getProductsForCategory = (menuItems: MenuItemRow[], categoryId: string, excludedItemId?: string) => {
  return menuItems.filter((item) => item.category_id === categoryId && item.id !== excludedItemId)
}

const DonenessRatingPicker = ({ idPrefix, selected }: { readonly idPrefix: string; readonly selected?: MenuItemRow["doneness_rating"] }) => {
  return (
    <fieldset className="md:col-span-2 rounded-lg border border-border/80 bg-background/45 p-4">
      <div className="mb-3 flex items-start gap-3">
        <div className="rounded-md bg-primary/15 p-2 text-primary">
          <Flame aria-hidden className="size-4" />
        </div>
        <div>
          <legend className="text-sm font-medium text-foreground">Pisme derecesi</legend>
          <p className="mt-1 text-xs text-muted-foreground">Et urunlerinde misafire gosterilecek pisme bilgisini secin. Diger urunlerde uygulanmaz birakabilirsiniz.</p>
        </div>
      </div>
      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
        <label className="cursor-pointer rounded-md border border-border/70 bg-card/50 p-3 text-sm transition hover:border-primary/50 has-[:checked]:border-primary has-[:checked]:bg-primary/10">
          <input className="sr-only" defaultChecked={!selected} name="donenessRating" type="radio" value="" />
          <span className="block font-medium text-foreground">Uygulanmaz</span>
          <span className="mt-1 block text-xs text-muted-foreground">Pisme derecesi gerektirmeyen urunler.</span>
        </label>
        {donenessOptions.map((option) => {
          return (
            <label className="cursor-pointer rounded-md border border-border/70 bg-card/50 p-3 text-sm transition hover:border-primary/50 has-[:checked]:border-primary has-[:checked]:bg-primary/10" htmlFor={`${idPrefix}-${option.value}`} key={option.value}>
              <input className="sr-only" defaultChecked={selected === option.value} id={`${idPrefix}-${option.value}`} name="donenessRating" type="radio" value={option.value} />
              <span className="flex items-center justify-between gap-2">
                <span className="font-medium text-foreground">{option.labels.tr}</span>
                <span className="rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[11px] text-primary">{option.temperature}</span>
              </span>
              <span className="mt-1 block text-xs text-muted-foreground">{option.descriptions.tr}</span>
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}

const ProductForm = ({ mode, categories, menuItems, tagsByItem, item, onClose }: ProductFormProps) => {
  const firstCategoryId = categories[0]?.id ?? ""
  const initialCategoryId = item?.category_id ?? firstCategoryId
  const [selectedCategoryId, setSelectedCategoryId] = useState(initialCategoryId)
  const [selectedPosition, setSelectedPosition] = useState(() => {
    const initialMaxPosition = getProductsForCategory(menuItems, initialCategoryId, item?.id).length + 1

    if (item) {
      return String(Math.min(Math.max(item.display_order, 1), initialMaxPosition))
    }

    return String(initialMaxPosition)
  })

  const existingTags = item ? tagsByItem[item.id] ?? [] : []
  const productsInSelectedCategory = getProductsForCategory(menuItems, selectedCategoryId, item?.id)
  const maxPosition = productsInSelectedCategory.length + 1
  const positionOptions = Array.from({ length: maxPosition }, (_, index) => index + 1)
  const action = mode === "create" ? createMenuItemAction : updateMenuItemAction

  return (
    <form action={action} className="grid gap-3 md:grid-cols-2">
      {item ? <input name="itemId" type="hidden" value={item.id} /> : null}
      <div>
        <label className="mb-2 block text-sm" htmlFor={`${mode}-product-name`}>
          Urun adi
        </label>
        <input className={inputClassName} defaultValue={item?.name ?? ""} id={`${mode}-product-name`} name="name" required type="text" />
      </div>
      <div>
        <label className="mb-2 block text-sm" htmlFor={`${mode}-product-category`}>
          Kategori
        </label>
        <select
          className={inputClassName}
          id={`${mode}-product-category`}
          name="categoryId"
          onChange={(event) => {
            const nextCategoryId = event.target.value
            setSelectedCategoryId(nextCategoryId)
            setSelectedPosition(String(getProductsForCategory(menuItems, nextCategoryId, item?.id).length + 1))
          }}
          required
          value={selectedCategoryId}
        >
          {categories.map((category) => {
            return (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            )
          })}
        </select>
      </div>
      <div>
        <label className="mb-2 block text-sm" htmlFor={`${mode}-product-price`}>
          Fiyat
        </label>
        <input className={inputClassName} defaultValue={item?.price ?? ""} id={`${mode}-product-price`} name="price" required step="0.01" type="number" />
      </div>
      <div>
        <label className="mb-2 block text-sm" htmlFor={`${mode}-product-position`}>
          Menu pozisyonu
        </label>
        <select className={inputClassName} id={`${mode}-product-position`} name="displayOrder" onChange={(event) => setSelectedPosition(event.target.value)} value={selectedPosition}>
          {positionOptions.map((position) => {
            return (
              <option key={position} value={position}>
                {position}. siraya yerlestir
              </option>
            )
          })}
        </select>
        <p className="mt-1 text-xs text-muted-foreground">Secilen siraya tasinir; ayni kategorideki diger urunler otomatik kaydirilir.</p>
      </div>
      <div className="md:col-span-2">
        <label className="mb-2 block text-sm" htmlFor={`${mode}-product-description`}>
          Aciklama
        </label>
        <textarea className={textareaClassName} defaultValue={item?.description ?? ""} id={`${mode}-product-description`} name="description" />
      </div>
      <div className="md:col-span-2">
        <label className="mb-2 block text-sm" htmlFor={`${mode}-product-image`}>
          Gorsel URL
        </label>
        <input className={inputClassName} defaultValue={item?.image_url ?? ""} id={`${mode}-product-image`} name="imageUrl" placeholder="https://cdn..." type="url" />
      </div>
      <DonenessRatingPicker idPrefix={`${mode}-product-doneness-${item?.id ?? "new"}`} selected={item?.doneness_rating} />
      <div className="md:col-span-2">
        <label className="mb-2 block text-sm" htmlFor={`${mode}-product-tags`}>
          Etiketler
        </label>
        <input className={inputClassName} defaultValue={existingTags.join(",")} id={`${mode}-product-tags`} name="tags" placeholder="bestseller,vegetarian" type="text" />
        <p className="mt-1 text-xs text-muted-foreground">Virgulle ayirin: vegan, vegetarian, spicy, containsNuts, glutenFree, bestseller.</p>
      </div>
      <label className="inline-flex items-center gap-2 text-sm">
        <input className={checkboxClassName} defaultChecked={item?.is_available ?? true} name="isAvailable" type="checkbox" />
        Mevcut
      </label>
      <label className="inline-flex items-center gap-2 text-sm">
        <input className={checkboxClassName} defaultChecked={item?.is_featured ?? false} name="isFeatured" type="checkbox" />
        One cikan
      </label>
      <div className="md:col-span-2 flex flex-wrap justify-end gap-2 border-t border-border/70 pt-4">
        <Button onClick={onClose} type="button" variant="ghost">
          Vazgec
        </Button>
        <Button type="submit">{mode === "create" ? "Urun Olustur" : "Degisiklikleri Kaydet"}</Button>
      </div>
    </form>
  )
}

const ProductsAdminSection = ({ categories, menuItems, tagsByItem }: ProductsAdminSectionProps) => {
  const [productModal, setProductModal] = useState<ProductModalState>(null)
  const [deleteModal, setDeleteModal] = useState<DeleteModalState>(null)
  const hasCategories = categories.length > 0

  const itemsByCategory = useMemo(() => {
    return categories.map((category) => {
      const items = menuItems
        .filter((item) => item.category_id === category.id)
        .sort((a, b) => a.display_order - b.display_order || a.name.localeCompare(b.name))

      return { category, items }
    })
  }, [categories, menuItems])

  return (
    <section className="rounded-xl border border-border/80 bg-card/70 p-6" id="manage-products">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-heading text-2xl">Urunleri Yonet</h2>
          <p className="mt-1 text-sm text-muted-foreground">Urunleri kategori bazinda duzenleyin; ekleme, guncelleme ve silme islemleri modal uzerinden yapilir.</p>
        </div>
        <Button disabled={!hasCategories} onClick={() => setProductModal({ mode: "create" })} size="icon" title="Urun ekle" type="button">
          <Plus aria-hidden className="size-5" />
        </Button>
      </div>

      {!hasCategories ? (
        <p className="rounded-lg border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-warning">Urun eklemeden once en az bir kategori olusturun.</p>
      ) : null}

      {menuItems.length === 0 && hasCategories ? (
        <p className="rounded-lg border border-border/70 bg-background/40 px-4 py-3 text-sm text-muted-foreground">Henuz urun yok. Sag ustteki arti butonuyla ilk urunu ekleyin.</p>
      ) : null}

      <div className="space-y-8">
        {itemsByCategory.map(({ category, items }) => {
          if (items.length === 0) {
            return null
          }

          return (
            <section className="space-y-3" key={category.id}>
              <div className="flex items-center justify-between gap-3 border-b border-border/70 pb-2">
                <div>
                  <h3 className="font-heading text-xl">{category.name}</h3>
                  <p className="text-xs text-muted-foreground">{items.length} urun</p>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
                {items.map((item) => {
                  const itemTags = tagsByItem[item.id] ?? []

                  return (
                    <article className="overflow-hidden rounded-lg border border-border/70 bg-background/45" key={item.id}>
                      <div className="relative aspect-[16/9] w-full overflow-hidden border-b border-border/70 bg-secondary/50">
                        {item.image_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            alt={`${item.name} gorseli`}
                            className="h-full w-full object-cover"
                            loading="lazy"
                            src={item.image_url}
                          />
                        ) : (
                          <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-muted-foreground">
                            <ImageIcon aria-hidden className="size-7" />
                            <span className="text-xs">Gorsel eklenmedi</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-start justify-between gap-3 border-b border-border/70 px-4 py-3">
                        <div className="min-w-0">
                          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Sira {item.display_order}</p>
                          <h4 className="mt-1 truncate font-heading text-xl text-foreground">{item.name}</h4>
                        </div>
                        <div className="flex shrink-0 gap-1">
                          <Button onClick={() => setProductModal({ mode: "edit", item })} size="icon" title="Urunu duzenle" type="button" variant="ghost">
                            <Edit3 aria-hidden className="size-4" />
                          </Button>
                          <Button onClick={() => setDeleteModal({ item })} size="icon" title="Urunu sil" type="button" variant="ghost">
                            <Trash2 aria-hidden className="size-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-3 p-4">
                        <div className="flex items-center justify-between gap-3">
                          <p className="rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-sm font-medium text-primary">₺{item.price.toFixed(2)}</p>
                          <div className="flex flex-wrap justify-end gap-2 text-xs">
                            <span className={`rounded-full px-2 py-1 ${item.is_available ? "border border-success/30 bg-success/10 text-success" : "border border-warning/30 bg-warning/10 text-warning"}`}>
                              {item.is_available ? "Mevcut" : "Mevcut degil"}
                            </span>
                            {item.is_featured ? <span className="rounded-full border border-primary/30 bg-primary/10 px-2 py-1 text-primary">One cikan</span> : null}
                          </div>
                        </div>
                        <p className="line-clamp-3 text-sm text-muted-foreground">{item.description || "Aciklama eklenmedi."}</p>
                        {item.doneness_rating ? (
                          <div className="inline-flex items-center gap-2 rounded-md border border-orange-400/30 bg-orange-400/10 px-3 py-2 text-sm text-orange-100">
                            <Flame aria-hidden className="size-4" />
                            Pisme: {getDonenessLabel(item.doneness_rating, "tr")}
                          </div>
                        ) : null}
                        {itemTags.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {itemTags.map((tag) => {
                              return (
                                <span className="rounded-full border border-border/70 bg-card/50 px-2 py-1 text-xs text-muted-foreground" key={tag}>
                                  {tag}
                                </span>
                              )
                            })}
                          </div>
                        ) : null}
                      </div>
                    </article>
                  )
                })}
              </div>
            </section>
          )
        })}
      </div>

      {productModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6 backdrop-blur-sm" role="dialog" aria-modal="true">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-xl border border-border/80 bg-card p-5 shadow-2xl">
            <div className="mb-4 flex items-start justify-between gap-3 border-b border-border/70 pb-4">
              <div>
                <h3 className="font-heading text-2xl">{productModal.mode === "create" ? "Urun Ekle" : "Urunu Duzenle"}</h3>
                <p className="mt-1 text-sm text-muted-foreground">Pozisyon secimi ayni siradaki urunleri otomatik kaydirir.</p>
              </div>
              <Button onClick={() => setProductModal(null)} size="icon" title="Kapat" type="button" variant="ghost">
                <X aria-hidden className="size-5" />
              </Button>
            </div>
            <ProductForm
              categories={categories}
              item={productModal.mode === "edit" ? productModal.item : undefined}
              menuItems={menuItems}
              mode={productModal.mode}
              onClose={() => setProductModal(null)}
              tagsByItem={tagsByItem}
            />
          </div>
        </div>
      ) : null}

      {deleteModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6 backdrop-blur-sm" role="dialog" aria-modal="true">
          <div className="w-full max-w-md rounded-xl border border-border/80 bg-card p-5 shadow-2xl">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h3 className="font-heading text-2xl">Urunu Sil</h3>
                <p className="mt-1 text-sm text-muted-foreground">{deleteModal.item.name} kalici olarak silinecek.</p>
              </div>
              <Button onClick={() => setDeleteModal(null)} size="icon" title="Kapat" type="button" variant="ghost">
                <X aria-hidden className="size-5" />
              </Button>
            </div>
            <form action={deleteMenuItemAction} className="space-y-4">
              <input name="itemId" type="hidden" value={deleteModal.item.id} />
              <div>
                <label className="mb-2 block text-sm" htmlFor="delete-product-confirmation">
                  Onay icin delete yazin
                </label>
                <input className={inputClassName} id="delete-product-confirmation" name="confirmation" required type="text" />
              </div>
              <div className="flex justify-end gap-2 border-t border-border/70 pt-4">
                <Button onClick={() => setDeleteModal(null)} type="button" variant="ghost">
                  Vazgec
                </Button>
                <Button type="submit" variant="destructive">
                  Urunu Sil
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </section>
  )
}

export { ProductsAdminSection }
