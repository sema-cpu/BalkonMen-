import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

type SectionProps = {
  readonly children: ReactNode
  readonly className?: string
  readonly id?: string
}

const Section = ({ children, className, id }: SectionProps) => {
  return (
    <section className={cn("border-b border-border/70 py-16 md:py-24", className)} id={id}>
      {children}
    </section>
  )
}

export { Section }
