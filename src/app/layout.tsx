import type { Metadata } from "next"
import { Inter, Playfair_Display } from "next/font/google"
import type { ReactNode } from "react"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter"
})

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair"
})

export const metadata: Metadata = {
  metadataBase: new URL("https://balkoncafe.example"),
  title: {
    default: "Balkon Café | Artisan Coffee & Brunch",
    template: "%s | Balkon Café"
  },
  description: "Soft and elegant café experience with QR-first menu flow and premium in-store ambiance",
  keywords: ["cafe", "coffee", "brunch", "qr menu", "soft ui", "istanbul cafe"],
  openGraph: {
    title: "Balkon Café | Artisan Coffee & Brunch",
    description: "Discover artisan coffee, seasonal brunch, and a QR-first menu experience.",
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
    title: "Balkon Café | Artisan Coffee & Brunch",
    description: "Discover artisan coffee, seasonal brunch, and a QR-first menu experience.",
    images: ["/og-image.svg"]
  },
  icons: {
    icon: "/icon.svg"
  }
}

type RootLayoutProps = {
  readonly children: ReactNode
}

const RootLayout = ({ children }: RootLayoutProps) => {
  return (
    <html lang="tr">
      <body className={`${inter.variable} ${playfair.variable}`}>
        <a
          className="sr-only fixed left-3 top-3 z-50 rounded-md bg-background px-3 py-2 text-sm text-foreground focus:not-sr-only focus:outline-none focus:ring-2 focus:ring-ring"
          href="#main-content"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  )
}

export default RootLayout
