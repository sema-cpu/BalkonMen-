import Link from "next/link"
import { Coffee } from "lucide-react"
import type { Locale } from "@/i18n/config"
import { toLocalizedPath } from "@/i18n/routing"
import { Container } from "@/components/primitives/container"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type SiteHeaderProps = {
  readonly locale: Locale
  readonly activePath?: "/" | "/about" | "/contact" | "/menu"
}

const navItems = [
  { href: "/" as const, label: "Ana Sayfa" },
  { href: "/about" as const, label: "Hakkimizda" },
  { href: "/contact" as const, label: "Iletisim" },
  { href: "/menu" as const, label: "Menü" }
] as const

const SiteHeader = ({ locale, activePath = "/" }: SiteHeaderProps) => {
  return (
    <Container className="py-8">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border/80 pb-5">
        <Link aria-label="Ana sayfaya git" className="flex items-center gap-3" href={toLocalizedPath(locale, "/")}>
          <div className="rounded-full border border-primary/40 bg-primary/15 p-2">
            <Coffee aria-hidden className="size-4 text-primary" />
          </div>
          <p className="font-heading text-xl tracking-wide">Balkon Café</p>
        </Link>
        <nav className="flex flex-wrap items-center gap-2">
          {navItems.map((item) => {
            const isActive = activePath === item.href

            return (
              <Button asChild key={item.href} size="default" variant={isActive ? "secondary" : "ghost"}>
                <Link
                  aria-current={isActive ? "page" : undefined}
                  aria-label={`${item.label} sayfasini ac`}
                  className={cn(isActive ? "font-medium" : "")}
                  href={toLocalizedPath(locale, item.href)}
                >
                  {item.label}
                </Link>
              </Button>
            )
          })}
        </nav>
      </header>
    </Container>
  )
}

export { SiteHeader }
