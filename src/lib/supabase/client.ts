"use client"

import { createBrowserClient } from "@supabase/ssr"
import type { Database } from "@/types/database"
import { getSupabaseEnv } from "./env"

const createSupabaseBrowserClient = () => {
  const { url, anonKey } = getSupabaseEnv()
  return createBrowserClient<Database>(url, anonKey)
}

export { createSupabaseBrowserClient }
