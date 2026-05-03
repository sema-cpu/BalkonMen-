type SupabaseEnv = {
  url: string
  anonKey: string
}

const resolvePublishableKey = () => {
  return process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
}

const resolveServiceRoleKey = () => {
  return process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY
}

const hasSupabaseEnv = () => {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && resolvePublishableKey())
}

const getSupabaseEnv = (): SupabaseEnv => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = resolvePublishableKey()

  if (!url) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL environment variable")
  }

  if (!anonKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY) environment variable")
  }

  return { url, anonKey }
}

const getSupabaseServiceRoleKey = () => {
  const serviceRoleKey = resolveServiceRoleKey()

  if (!serviceRoleKey) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_SECRET_KEY) environment variable")
  }

  return serviceRoleKey
}

export { getSupabaseEnv, getSupabaseServiceRoleKey, hasSupabaseEnv }
