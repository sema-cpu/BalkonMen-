import { ArrowUpRight } from "lucide-react"
import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

type FeatureCardProps = {
  readonly icon: ReactNode
  readonly title: string
  readonly description: string
  readonly className?: string
}

const FeatureCard = ({ icon, title, description, className }: FeatureCardProps) => {
  return (
    <article
      className={cn(
        "group rounded-2xl border border-border/70 bg-card/65 p-5 transition-transform duration-300 hover:-translate-y-1 hover:border-primary/40",
        className
      )}
    >
      <div className="mb-4 flex size-10 items-center justify-center rounded-lg bg-primary/15 text-primary">{icon}</div>
      <h3 className="mb-2 font-heading text-xl text-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
      <div className="mt-4 flex items-center gap-1 text-xs text-primary/90">
        <span>Explore</span>
        <ArrowUpRight aria-hidden className="size-3.5" />
      </div>
    </article>
  )
}

export { FeatureCard }
