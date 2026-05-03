const locales = ["tr", "en"] as const
type Locale = (typeof locales)[number]

const defaultLocale: Locale = "tr"

const isLocale = (value: string): value is Locale => {
  return locales.includes(value as Locale)
}

const resolveLocale = (value: string | undefined | null): Locale => {
  if (!value) {
    return defaultLocale
  }

  return isLocale(value) ? value : defaultLocale
}

export { defaultLocale, isLocale, locales, resolveLocale }
export type { Locale }
