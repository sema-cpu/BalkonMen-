import { cn } from "@/lib/utils"

type PillBadgeProps = {
  readonly label: string
  readonly className?: string
}

const PillBadge = ({ label, className }: PillBadgeProps) => {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-medium uppercase tracking-wide text-primary",
        className
      )}
    >
      {label}
    </span>
  )
}

export { PillBadge }
