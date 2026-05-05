"use client"

import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { type MouseEvent, type ReactNode, useEffect } from "react"

type MenuScrollLinkProps = {
  readonly href: string
  readonly children: ReactNode
  readonly className?: string
  readonly ariaLabel?: string
}

const scrollIntentKey = "balkon-menu-scroll-to-products"

const scrollToProducts = () => {
  const target = document.getElementById("menu-products")

  if (!target) {
    return
  }

  target.scrollIntoView({
    behavior: "smooth",
    block: "start"
  })
}

const MenuScrollLink = ({ href, children, className, ariaLabel }: MenuScrollLinkProps) => {
  const router = useRouter()

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) {
      return
    }

    event.preventDefault()
    window.sessionStorage.setItem(scrollIntentKey, "true")

    const nextUrl = new URL(href, window.location.origin)
    router.push(`${nextUrl.pathname}${nextUrl.search}`, { scroll: false })
  }

  return (
    <Link aria-label={ariaLabel} className={className} href={href} onClick={handleClick}>
      {children}
    </Link>
  )
}

const MenuProductsAutoScroller = () => {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (window.sessionStorage.getItem(scrollIntentKey) !== "true") {
      return
    }

    window.sessionStorage.removeItem(scrollIntentKey)

    const frame = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(scrollToProducts)
    })

    return () => window.cancelAnimationFrame(frame)
  }, [pathname, searchParams])

  return null
}

export { MenuProductsAutoScroller, MenuScrollLink }
