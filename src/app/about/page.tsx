import { redirect } from "next/navigation"
import { defaultLocale } from "@/i18n/config"

const AboutRedirectPage = () => {
  redirect(`/${defaultLocale}/about`)
}

export default AboutRedirectPage
