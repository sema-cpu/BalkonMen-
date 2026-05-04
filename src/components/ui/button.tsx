"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { useFormStatus } from "react-dom"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        outline: "border border-border bg-background hover:bg-secondary",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        ghost: "text-foreground hover:bg-secondary"
      },
      size: {
        default: "h-10 px-4 py-2",
        lg: "h-11 rounded-md px-8",
        icon: "size-10"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, disabled, type, ...props }, ref) => {
    const { pending } = useFormStatus()
    const shouldLockForPending = !asChild && type !== "button"
    const isDisabled = Boolean(disabled) || (shouldLockForPending && pending)
    const Comp = asChild ? Slot : "button"

    if (asChild) {
      return <Comp aria-disabled={isDisabled || undefined} className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    }

    return <Comp className={cn(buttonVariants({ variant, size, className }))} disabled={isDisabled} ref={ref} type={type} {...props} />
  }
)

Button.displayName = "Button"

export { Button, buttonVariants }
