import type { Metadata } from "next"
import Link from "next/link"
import { Clock3, Mail, MapPin, Phone, Send } from "lucide-react"
import { Container } from "@/components/primitives/container"
import { HeadingBlock } from "@/components/primitives/heading-block"
import { Section } from "@/components/primitives/section"
import { SiteFooter } from "@/components/site/site-footer"
import { SiteHeader } from "@/components/site/site-header"
import { Button } from "@/components/ui/button"
import { PillBadge } from "@/components/ui/pill-badge"
import { isLocale, type Locale } from "@/i18n/config"
import { toLocalizedPath } from "@/i18n/routing"
import { getSiteContentData } from "@/lib/site-content-data"

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact Balkon Café for reservations, feedback, collaborations, or event requests."
}

type LocalizedContactPageProps = {
  readonly params: Promise<{
    locale: string
  }>
}

const LocalizedContactPage = async ({ params }: LocalizedContactPageProps) => {
  const { locale: localeParam } = await params
  const locale: Locale = isLocale(localeParam) ? localeParam : "tr"
  const t = <T,>(tr: T, en: T) => (locale === "tr" ? tr : en)

  const siteContentData = await getSiteContentData(locale)
  const contactContent = siteContentData.contact

  const contactCards = [
    {
      icon: <Phone aria-hidden className="size-5" />,
      title: t("Telefon", "Phone"),
      value: contactContent.phone,
      href: `tel:${contactContent.phone.replace(/\s+/g, "")}`
    },
    {
      icon: <Mail aria-hidden className="size-5" />,
      title: t("E-posta", "Email"),
      value: contactContent.email,
      href: `mailto:${contactContent.email}`
    },
    {
      icon: <MapPin aria-hidden className="size-5" />,
      title: t("Konum", "Location"),
      value: contactContent.address,
      href: contactContent.mapUrl
    },
    {
      icon: <Clock3 aria-hidden className="size-5" />,
      title: t("Calisma Saatleri", "Hours"),
      value: contactContent.hours,
      href: toLocalizedPath(locale, "/")
    }
  ] as const

  return (
    <main id="main-content" lang={locale}>
      <SiteHeader activePath="/contact" locale={locale} />

      <Section className="border-none pt-8 md:pt-14">
        <Container>
          <div className="grid gap-8 md:grid-cols-[1.05fr,0.95fr] md:items-start">
            <div className="space-y-5">
              <PillBadge label={contactContent.badge} />
              <h1 className="font-heading text-4xl leading-tight sm:text-5xl">{contactContent.title}</h1>
              <p className="max-w-2xl text-base text-muted-foreground sm:text-lg">{contactContent.description}</p>
              <div className="flex flex-wrap gap-3">
                <Button asChild>
                  <a aria-label={t("Balkon Cafe'yi ara", "Call Balkon Café")} href={`tel:${contactContent.phone.replace(/\s+/g, "")}`}>
                    {t("Hemen Ara", "Call Now")}
                  </a>
                </Button>
                <Button asChild variant="secondary">
                  <a aria-label={t("Balkon Cafe'ye e-posta gonder", "Email Balkon Café")} href={`mailto:${contactContent.email}`}>
                    {t("E-posta Gonder", "Send Email")}
                  </a>
                </Button>
              </div>
            </div>

            <div className="rounded-2xl border border-border/80 bg-card/65 p-6">
              <h2 className="font-heading text-2xl">{contactContent.quickMessageTitle}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{contactContent.quickMessageDescription}</p>
              <form action={`mailto:${contactContent.email}`} className="mt-4 grid gap-3" encType="text/plain" method="post">
                <div>
                  <label className="mb-2 block text-sm" htmlFor="contact-name">
                    {t("Ad Soyad", "Full name")}
                  </label>
                  <input
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring"
                    id="contact-name"
                    name="name"
                    required
                    type="text"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm" htmlFor="contact-email">
                    {t("E-posta", "Email")}
                  </label>
                  <input
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring"
                    id="contact-email"
                    name="email"
                    required
                    type="email"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm" htmlFor="contact-message">
                    {t("Mesaj", "Message")}
                  </label>
                  <textarea
                    className="min-h-28 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring"
                    id="contact-message"
                    name="message"
                    required
                  />
                </div>
                <Button type="submit">
                  {t("Mesaji Gonder", "Send Message")} <Send aria-hidden className="size-4" />
                </Button>
              </form>
            </div>
          </div>
        </Container>
      </Section>

      <Section className="border-b-0" id="contact-details">
        <Container>
          <HeadingBlock description={contactContent.detailsDescription} eyebrow={contactContent.detailsEyebrow} title={contactContent.detailsTitle} />
          {siteContentData.source === "local" ? (
            <p className="mb-5 text-xs text-primary/90">
              {t("Iletisim icerigi su an yerel varsayilanlarla calisiyor. Canli duzenleme icin Supabase ortam degiskenlerini baglayin.", "Contact content is currently using local defaults. Connect Supabase env values for live editing.")}
            </p>
          ) : null}
          <div className="grid gap-4 sm:grid-cols-2">
            {contactCards.map((item) => {
              return (
                <article className="rounded-2xl border border-border/80 bg-card/65 p-5" key={item.title}>
                  <div className="mb-3 inline-flex rounded-md bg-primary/15 p-2 text-primary">{item.icon}</div>
                  <h2 className="font-heading text-2xl">{item.title}</h2>
                  <p className="mt-2 text-sm text-muted-foreground">{item.value}</p>
                  <Button asChild className="mt-4" variant="outline">
                    <Link aria-label={t(`${item.title} ac`, `Open ${item.title}`)} href={item.href}>
                      {t("Ac", "Open")}
                    </Link>
                  </Button>
                </article>
              )
            })}
          </div>
        </Container>
      </Section>

      <SiteFooter locale={locale} />
    </main>
  )
}

export default LocalizedContactPage
