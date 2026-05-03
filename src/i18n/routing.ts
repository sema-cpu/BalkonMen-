import type { Locale } from "@/i18n/config"

type PublicPath = "/" | "/about" | "/contact" | "/menu"

const toLocalizedPath = (locale: Locale, path: PublicPath) => {
  if (path === "/") {
    return `/${locale}`
  }

  return `/${locale}${path}`
}

export { toLocalizedPath }
export type { PublicPath }
