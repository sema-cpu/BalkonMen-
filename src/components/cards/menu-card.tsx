import Image from "next/image"
import { Flame } from "lucide-react"
import type { Locale } from "@/i18n/config"
import { getDonenessLabel, getDonenessOption } from "@/lib/doneness"
import { cn } from "@/lib/utils"
import { PillBadge } from "@/components/ui/pill-badge"
import type { MenuItem } from "@/types/menu"

type MenuCardProps = {
  readonly item: MenuItem
  readonly locale: Locale
  readonly className?: string
}

const tagLabelMap: Record<MenuItem["tags"][number], string> = {
  vegan: "Vegan",
  vegetarian: "Vejetaryen",
  spicy: "Acılı",
  containsNuts: "Kuruyemiş İçerir",
  glutenFree: "Glutensiz",
  bestseller: "Çok Tercih Edilen"
}

const MenuCard = ({ item, locale, className }: MenuCardProps) => {
  const donenessOption = item.donenessRating ? getDonenessOption(item.donenessRating) : undefined

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
            Gorsel yakinda
          </div>
        )}
      </div>
      <div className="space-y-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-heading text-xl text-foreground">{item.name}</h3>
          <p className="rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
            ₺{item.price.toFixed(2)}
          </p>
        </div>
        <p className="text-sm text-muted-foreground">{item.description}</p>
        {item.donenessRating && donenessOption ? (
          <div className="flex items-center justify-between gap-3 rounded-lg border border-orange-400/30 bg-orange-400/10 px-3 py-2 text-sm">
            <span className="inline-flex items-center gap-2 font-medium text-orange-100">
              <Flame aria-hidden className="size-4" />
              Pisme: {getDonenessLabel(item.donenessRating, locale)}
            </span>
            <span className="shrink-0 rounded-full bg-background/60 px-2 py-0.5 text-xs text-orange-100">{donenessOption.temperature}</span>
          </div>
        ) : null}
        <div className="flex flex-wrap gap-2">
          {item.tags.map((tag) => {
            return <PillBadge className="normal-case tracking-normal" key={tag} label={tagLabelMap[tag]} />
          })}
          {!item.isAvailable ? <PillBadge className="border-destructive/35 bg-destructive/10 text-destructive" label="Tukendi" /> : null}
        </div>
      </div>
    </article>
  )
}

export { MenuCard }
