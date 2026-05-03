import { redirect } from "next/navigation"
import { defaultLocale } from "@/i18n/config"

const MenuRedirectPage = () => {
  redirect(`/${defaultLocale}/menu`)
}

export default MenuRedirectPage
