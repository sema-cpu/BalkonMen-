import type { Metadata } from "next"
import { Caveat, Inter } from "next/font/google"
import type { ReactNode } from "react"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter"
})

const caveat = Caveat({
  subsets: ["latin", "latin-ext"],
  variable: "--font-caveat",
  weight: ["500", "600", "700"]
})

export const metadata: Metadata = {
  metadataBase: new URL("https://balkoncafe.example"),
  title: {
    default: "Balkon Café | Zanaat Kahve ve Brunch",
    template: "%s | Balkon Café"
  },
  description: "QR odakli menu akisi ve premium magaza ici atmosfer ile yumusak ve zarif kafe deneyimi",
  keywords: ["kafe", "kahve", "brunch", "qr menu", "istanbul kafe"],
  openGraph: {
    title: "Balkon Café | Zanaat Kahve ve Brunch",
    description: "Zanaat kahve, mevsimsel brunch ve QR odakli menu deneyimini kesfedin.",
    type: "website",
    url: "/",
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "Balkon Café"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Balkon Café | Zanaat Kahve ve Brunch",
    description: "Zanaat kahve, mevsimsel brunch ve QR odakli menu deneyimini kesfedin.",
    images: ["/og-image.svg"]
  },
  icons: {
    icon: "/images/logo-dark.png",
    apple: "/images/logo-dark.png"
  }
}

type RootLayoutProps = {
  readonly children: ReactNode
}

const RootLayout = ({ children }: RootLayoutProps) => {
  return (
    <html lang="tr">
      <body className={`${inter.variable} ${caveat.variable}`}>
        <a
          className="sr-only fixed left-3 top-3 z-50 rounded-md bg-background px-3 py-2 text-sm text-foreground focus:not-sr-only focus:outline-none focus:ring-2 focus:ring-ring"
          href="#main-content"
        >
          Icerige gec
        </a>
        {children}
      </body>
    </html>
  )
}

export default RootLayout
