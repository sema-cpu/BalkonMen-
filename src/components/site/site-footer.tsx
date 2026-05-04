import Link from "next/link"
import type { Locale } from "@/i18n/config"
import { toLocalizedPath } from "@/i18n/routing"
import { Container } from "@/components/primitives/container"

type SiteFooterProps = {
  readonly locale: Locale
}

const SiteFooter = ({ locale }: SiteFooterProps) => {
  return (
    <footer className="mt-8 border-t border-border/80 py-8">
      <Container>
        <div className="flex flex-col gap-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Balkon Café. Tum haklari saklidir.</p>
          <div className="flex flex-wrap items-center gap-4">
            <Link aria-label="Hakkimizda sayfasi" href={toLocalizedPath(locale, "/about")}>
              Hakkimizda
            </Link>
            <Link aria-label="Iletisim sayfasi" href={toLocalizedPath(locale, "/contact")}>
              Iletisim
            </Link>
            <Link aria-label="Menu sayfasi" href={toLocalizedPath(locale, "/menu")}>
              Menu
            </Link>
          </div>
        </div>
      </Container>
    </footer>
  )
}

export { SiteFooter }
