import Image from "next/image"
import type { Locale } from "@/i18n/config"
import { cn } from "@/lib/utils"
import { PillBadge } from "@/components/ui/pill-badge"
import type { MenuItem } from "@/types/menu"

type MenuCardProps = {
  readonly item: MenuItem
  readonly locale: Locale
  readonly className?: string
}

const tagLabelMap: Record<MenuItem["tags"][number], Record<Locale, string>> = {
  vegan: { en: "Vegan", tr: "Vegan" },
  vegetarian: { en: "Vegetarian", tr: "Vejetaryen" },
  spicy: { en: "Spicy", tr: "Acılı" },
  containsNuts: { en: "Contains Nuts", tr: "Kuruyemiş İçerir" },
  glutenFree: { en: "Gluten Free", tr: "Glutensiz" },
  bestseller: { en: "Bestseller", tr: "Çok Tercih Edilen" }
}

const MenuCard = ({ item, locale, className }: MenuCardProps) => {
  return (
    <article
      aria-label={`${item.name} menu item`}
      className={cn("overflow-hidden rounded-2xl border border-border/70 bg-card/65", className)}
    >
      <div className="relative h-44 w-full overflow-hidden bg-secondary/60">
        {item.image ? (
          <Image
            alt={item.name}
            className="h-full w-full object-cover transition duration-500 hover:scale-105"
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            src={item.image}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-secondary text-sm text-muted-foreground">
            {locale === "tr" ? "Gorsel yakinda" : "Image coming soon"}
          </div>
        )}
      </div>
      <div className="space-y-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-heading text-xl text-foreground">{item.name}</h3>
          <p className="rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
            ${item.price.toFixed(2)}
          </p>
        </div>
        <p className="text-sm text-muted-foreground">{item.description}</p>
        <div className="flex flex-wrap gap-2">
          {item.tags.map((tag) => {
            return <PillBadge className="normal-case tracking-normal" key={tag} label={tagLabelMap[tag][locale]} />
          })}
          {!item.isAvailable ? <PillBadge className="border-destructive/35 bg-destructive/10 text-destructive" label={locale === "tr" ? "Tukendi" : "Sold Out"} /> : null}
        </div>
      </div>
    </article>
  )
}

export { MenuCard }
