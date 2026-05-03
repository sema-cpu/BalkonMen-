import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/database"
import { getSupabaseEnv } from "./env"

const createSupabasePublicClient = () => {
  const { url, anonKey } = getSupabaseEnv()

  return createClient<Database>(url, anonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

export { createSupabasePublicClient }
