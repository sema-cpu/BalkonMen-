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
          <p>© {new Date().getFullYear()} Balkon Café. {locale === "tr" ? "Tum haklari saklidir." : "All rights reserved."}</p>
          <div className="flex flex-wrap items-center gap-4">
            <Link aria-label={locale === "tr" ? "Hakkimizda sayfasi" : "About us page"} href={toLocalizedPath(locale, "/about")}>
              {locale === "tr" ? "Hakkimizda" : "About Us"}
            </Link>
            <Link aria-label={locale === "tr" ? "Iletisim sayfasi" : "Contact page"} href={toLocalizedPath(locale, "/contact")}>
              {locale === "tr" ? "Iletisim" : "Contact"}
            </Link>
            <Link aria-label={locale === "tr" ? "Menu sayfasi" : "Menu page"} href={toLocalizedPath(locale, "/menu")}>
              {locale === "tr" ? "Menu" : "Menu"}
            </Link>
          </div>
        </div>
      </Container>
    </footer>
  )
}

export { SiteFooter }
