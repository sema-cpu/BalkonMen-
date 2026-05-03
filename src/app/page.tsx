import { redirect } from "next/navigation"
import { defaultLocale } from "@/i18n/config"

const RootPage = () => {
  redirect(`/${defaultLocale}`)
}

export default RootPage
