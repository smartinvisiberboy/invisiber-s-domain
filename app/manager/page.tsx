import type { Metadata } from "next"
import { redirect } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { getManagerSession } from "@/lib/auth/session"
import { SiteHeader } from "@/components/site-header"
import { ManagerLoginError } from "@/components/manager/login-error"

export const metadata: Metadata = {
  title: "Manager Portal — Invisiber's Domain",
  robots: { index: false, follow: false },
}

export default async function ManagerPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const session = await getManagerSession()
  if (session) redirect("/manager/dashboard")

  const { error } = await searchParams

  return (
    <>
      <SiteHeader />
      <main className="relative z-10 flex min-h-screen items-center justify-center px-4">
        <div className="glass-strong w-full max-w-md rounded-2xl p-8 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-xl border border-primary/30 bg-primary/10">
            <Image src="/invisiber-emblem.png" alt="Invisiber's Domain emblem" width={48} height={48} />
          </div>
          <p className="font-mono text-xs uppercase tracking-[0.35em] text-primary/80">Restricted Access</p>
          <h1 className="mt-3 font-sans text-3xl font-bold tracking-tight">Manager Portal</h1>
          <p className="mt-3 text-pretty leading-relaxed text-muted-foreground">
            Authentication via Discord. Only authorized guild leadership may enter.
          </p>

          <ManagerLoginError error={error} />

          <Link
            href="/api/auth/discord/login"
            className="mt-8 inline-flex w-full items-center justify-center gap-3 rounded-lg bg-[#5865F2] px-6 py-3 font-medium text-white transition-transform hover:scale-[1.02] hover:bg-[#4752c4]"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
              <path d="M20.317 4.37a19.79 19.79 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.74 19.74 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.1 13.1 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.3 12.3 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.84 19.84 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.056c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028M8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418m7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418Z" />
            </svg>
            Continue with Discord
          </Link>

          <Link
            href="/"
            className="mt-4 inline-block text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Return to site
          </Link>
        </div>
      </main>
    </>
  )
}
