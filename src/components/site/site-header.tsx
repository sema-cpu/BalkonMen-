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
  { href: "/" as const, label: { en: "Home", tr: "Ana Sayfa" } },
  { href: "/about" as const, label: { en: "About Us", tr: "Hakkimizda" } },
  { href: "/contact" as const, label: { en: "Contact", tr: "Iletisim" } },
  { href: "/menu" as const, label: { en: "Menu", tr: "Menu" } }
] as const

const SiteHeader = ({ locale, activePath = "/" }: SiteHeaderProps) => {
  const alternateLocale: Locale = locale === "tr" ? "en" : "tr"

  return (
    <Container className="py-8">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border/80 pb-5">
        <Link aria-label={locale === "tr" ? "Ana sayfaya git" : "Navigate to homepage"} className="flex items-center gap-3" href={toLocalizedPath(locale, "/")}>
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
                  aria-label={locale === "tr" ? `${item.label[locale]} sayfasini ac` : `Open ${item.label[locale]} page`}
                  className={cn(isActive ? "font-medium" : "")}
                  href={toLocalizedPath(locale, item.href)}
                >
                  {item.label[locale]}
                </Link>
              </Button>
            )
          })}
          <Button asChild size="default" variant="outline">
            <Link aria-label={locale === "tr" ? "Dili degistir" : "Switch language"} href={toLocalizedPath(alternateLocale, activePath)}>
              {alternateLocale.toUpperCase()}
            </Link>
          </Button>
        </nav>
      </header>
    </Container>
  )
}

export { SiteHeader }
