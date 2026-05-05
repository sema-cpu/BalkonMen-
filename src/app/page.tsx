import Image from "next/image"
import Link from "next/link"
import { ArrowRight, MapPin } from "lucide-react"

const RootPage = () => {
  return (
    <main className="relative h-[100svh] overflow-hidden bg-stone-950 text-white" id="main-content">
      <div
        aria-hidden
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "linear-gradient(90deg, rgb(12 10 9 / 0.88) 0%, rgb(12 10 9 / 0.58) 48%, rgb(12 10 9 / 0.28) 100%), url('https://images.unsplash.com/photo-1521017432531-fbd92d768814?auto=format&fit=crop&w=1800&q=85')"
        }}
      />
      <div aria-hidden className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-stone-950 to-transparent" />

      <div className="relative z-10 mx-auto flex h-full w-full max-w-6xl flex-col px-5 py-4 sm:px-8 sm:py-7">
        <header className="flex items-center justify-between gap-4">
          <Link aria-label="Balkon Cafe ana giris" className="inline-flex items-center" href="/">
            <span className="relative block h-16 w-40 sm:h-20 sm:w-52">
              <Image alt="Balkon Cafe Etiler logo" className="object-contain" fill priority sizes="(max-width: 640px) 160px, 208px" src="/images/logo-white.png" />
            </span>
          </Link>
          <nav aria-label="Hizli baglantilar" className="flex items-center gap-3 text-xs text-white/78 sm:gap-4 sm:text-sm">
            <Link className="transition hover:text-white" href="/tr/contact">
              İletişim
            </Link>
            <a className="inline-flex items-center gap-1 transition hover:text-white" href="https://maps.google.com/?q=Istanbul" rel="noreferrer" target="_blank">
              <MapPin aria-hidden className="size-4" />
              Konum
            </a>
          </nav>
        </header>

        <section className="flex flex-1 items-center py-6">
          <div className="w-full max-w-2xl">
            <p className="mb-3 text-xs uppercase tracking-[0.28em] text-white/68 sm:mb-4">QR Karşılama</p>
            <h1 className="font-heading text-4xl leading-[0.95] text-white sm:text-6xl lg:text-7xl">Balkon Cafe</h1>
            <p className="mt-4 max-w-xl text-sm leading-6 text-white/76 sm:mt-5 sm:text-lg sm:leading-7">
              Taze kahve, özenli tabaklar ve sakin bir masa deneyimi. Devam etmek istediğiniz alanı seçin.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row">
              <Link
                className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-white px-6 text-sm font-semibold text-stone-950 transition hover:bg-white/90"
                href="/tr"
              >
                Siteye Git
                <ArrowRight aria-hidden className="size-4" />
              </Link>
              <Link
                className="inline-flex h-12 items-center justify-center gap-2 rounded-md border border-white/28 bg-white/10 px-6 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/16"
                href="/tr/menu"
              >
                Menüye Git
                <ArrowRight aria-hidden className="size-4" />
              </Link>
            </div>
          </div>
        </section>

        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-white/14 pt-3 text-xs text-white/60 sm:pt-4">
          <span>Her gün 08:00-22:30 arası açık</span>
          <div className="flex items-center gap-4">
            <Link className="transition hover:text-white" href="/tr/about">
              Hakkımızda
            </Link>
            <Link className="transition hover:text-white" href="/tr/contact">
              İletişim
            </Link>
            <Link className="transition hover:text-white" href="/tr/menu">
              Menü
            </Link>
          </div>
        </footer>
      </div>
    </main>
  )
}

export default RootPage
