"use client"

import { FormEvent, Suspense, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { LockKeyhole } from "lucide-react"
import { createSupabaseBrowserClient } from "@/lib/supabase/client"
import { hasSupabaseEnv } from "@/lib/supabase/env"
import { Button } from "@/components/ui/button"

const AdminLoginForm = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const redirectTarget = searchParams.get("redirect") ?? "/admin"
  const setupStatus = searchParams.get("setup")

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrorMessage(null)
    setIsSubmitting(true)

    if (!hasSupabaseEnv()) {
      setErrorMessage("Supabase environment variables are missing. Add values from .env.example first.")
      setIsSubmitting(false)
      return
    }

    const supabase = createSupabaseBrowserClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setErrorMessage(error.message)
      setIsSubmitting(false)
      return
    }

    router.replace(redirectTarget)
    router.refresh()
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md items-center px-5 py-10 sm:px-0" id="main-content">
      <section className="w-full rounded-2xl border border-border/80 bg-card/80 p-6 sm:p-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-lg bg-primary/15 p-2">
            <LockKeyhole aria-hidden className="size-5 text-primary" />
          </div>
          <div>
            <h1 className="font-heading text-2xl">Admin Sign In</h1>
            <p className="text-sm text-muted-foreground">Secure access to menu management</p>
          </div>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {setupStatus === "missing-env" ? (
            <p className="rounded-md border border-warning/30 bg-warning/10 px-3 py-2 text-sm text-warning">
              Admin login is blocked until Supabase variables are configured in your environment.
            </p>
          ) : null}
          <label className="block text-sm text-foreground" htmlFor="email">
            Email
          </label>
          <input
            autoComplete="email"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none ring-offset-background transition placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
            id="email"
            name="email"
            onChange={(event) => setEmail(event.target.value)}
            placeholder="admin@balkoncafe.com"
            required
            type="email"
            value={email}
          />

          <label className="block text-sm text-foreground" htmlFor="password">
            Password
          </label>
          <input
            autoComplete="current-password"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none ring-offset-background transition placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
            id="password"
            name="password"
            onChange={(event) => setPassword(event.target.value)}
            required
            type="password"
            value={password}
          />

          {errorMessage ? (
            <p aria-live="polite" className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {errorMessage}
            </p>
          ) : null}

          <Button className="w-full" disabled={isSubmitting} type="submit">
            {isSubmitting ? "Signing in..." : "Sign in"}
          </Button>
        </form>

        <div className="mt-5 border-t border-border/80 pt-4 text-sm text-muted-foreground">
          <p>
            Return to{" "}
            <Link aria-label="Go to website homepage" className="text-primary hover:text-primary/80" href="/">
              website
            </Link>
          </p>
        </div>
      </section>
    </main>
  )
}

const AdminLoginPage = () => {
  return (
    <Suspense fallback={null}>
      <AdminLoginForm />
    </Suspense>
  )
}

export default AdminLoginPage
