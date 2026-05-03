import type { ReactNode } from "react"
import { notFound } from "next/navigation"
import { isLocale, locales } from "@/i18n/config"

type LocaleLayoutProps = {
  readonly children: ReactNode
  readonly params: Promise<{
    locale: string
  }>
}

const LocaleLayout = async ({ children, params }: LocaleLayoutProps) => {
  const { locale } = await params

  if (!isLocale(locale)) {
    notFound()
  }

  return <>{children}</>
}

const generateStaticParams = () => {
  return locales.map((locale) => ({ locale }))
}

const dynamicParams = false

export { dynamicParams }
export { generateStaticParams }
export default LocaleLayout
