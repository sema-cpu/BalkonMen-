import { redirect } from "next/navigation"
import { defaultLocale } from "@/i18n/config"

const ContactRedirectPage = () => {
  redirect(`/${defaultLocale}/contact`)
}

export default ContactRedirectPage
