import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

type HeadingBlockProps = {
  readonly title: string
  readonly description?: string
  readonly eyebrow?: string
  readonly className?: string
  readonly action?: ReactNode
}

const HeadingBlock = ({ title, description, eyebrow, className, action }: HeadingBlockProps) => {
  return (
    <div className={cn("mb-10 flex flex-col gap-4 md:mb-12 md:flex-row md:items-end md:justify-between", className)}>
      <div className="space-y-3">
        {eyebrow ? (
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary/90" role="note">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="font-heading text-3xl leading-tight text-foreground sm:text-4xl">{title}</h2>
        {description ? <p className="max-w-2xl text-pretty text-muted-foreground">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  )
}

export { HeadingBlock }
