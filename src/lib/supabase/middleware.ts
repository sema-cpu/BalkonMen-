import { createServerClient } from "@supabase/ssr"
import type { SetAllCookies } from "@supabase/ssr"
import { type NextRequest, NextResponse } from "next/server"
import type { Database } from "@/types/database"
import { isRecoverableSupabaseAuthError } from "./auth-errors"
import { getSupabaseEnv, hasSupabaseEnv } from "./env"

const applyAdminSecurityHeaders = (response: NextResponse) => {
  response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive")
  response.headers.set("Cache-Control", "no-store, max-age=0")
  return response
}

const updateSession = async (request: NextRequest) => {
  const pathname = request.nextUrl.pathname
  const isAdminRoute = pathname.startsWith("/admin")
  const isLoginRoute = pathname.startsWith("/admin/login")
  let response = NextResponse.next({ request })

  if (!hasSupabaseEnv()) {
    if (isAdminRoute && !isLoginRoute) {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = "/admin/login"
      redirectUrl.searchParams.set("setup", "missing-env")
      return applyAdminSecurityHeaders(NextResponse.redirect(redirectUrl))
    }

    return isAdminRoute ? applyAdminSecurityHeaders(response) : response
  }

  const { url, anonKey } = getSupabaseEnv()

  const supabase = createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet: Parameters<SetAllCookies>[0]) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        response = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
      }
    }
  })

  if (!isAdminRoute || isLoginRoute) {
    await supabase.auth.getUser()
    return isAdminRoute ? applyAdminSecurityHeaders(response) : response
  }

  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser()

  if (userError && !isRecoverableSupabaseAuthError(userError)) {
    throw userError
  }

  if (user) {
    return applyAdminSecurityHeaders(response)
  }

  const redirectUrl = request.nextUrl.clone()
  redirectUrl.pathname = "/admin/login"
  redirectUrl.searchParams.set("redirect", pathname)
  return applyAdminSecurityHeaders(NextResponse.redirect(redirectUrl))
}

export { updateSession }
