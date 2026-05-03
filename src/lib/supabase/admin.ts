import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/database"
import { getSupabaseEnv, getSupabaseServiceRoleKey } from "./env"

const createSupabaseAdminClient = () => {
  const { url } = getSupabaseEnv()
  const serviceRoleKey = getSupabaseServiceRoleKey()

  return createClient<Database>(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

export { createSupabaseAdminClient }
