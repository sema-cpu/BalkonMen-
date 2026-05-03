import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

type ContainerProps = {
  readonly children: ReactNode
  readonly className?: string
}

const Container = ({ children, className }: ContainerProps) => {
  return <div className={cn("mx-auto w-full max-w-6xl px-6 md:px-10", className)}>{children}</div>
}

export { Container }
