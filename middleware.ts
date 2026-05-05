import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { defaultLocale } from "@/i18n/config"
import { updateSession } from "@/lib/supabase/middleware"

const localizedPrefixes = ["/tr"]
const legacyPublicPaths = new Set(["/about", "/contact", "/menu"])

export const middleware = async (request: NextRequest) => {
  const { pathname } = request.nextUrl

  if (!pathname.startsWith("/admin") && legacyPublicPaths.has(pathname) && !localizedPrefixes.some((prefix) => pathname.startsWith(prefix))) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = pathname === "/" ? `/${defaultLocale}` : `/${defaultLocale}${pathname}`
    return NextResponse.redirect(redirectUrl)
  }

  return updateSession(request)
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"]
}
