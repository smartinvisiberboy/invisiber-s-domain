import type { Metadata } from "next"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { ApplyForm } from "@/components/apply/apply-form"
import { HelpButton } from "@/components/help-button"

export const metadata: Metadata = {
  title: "Apply — Invisiber's Domain",
  description:
    "Submit your application to join Invisiber's Domain. No login required — upload your stats and get matched to the right guild.",
}

export default function ApplyPage() {
  return (
    <>
      <SiteHeader />
      <main className="relative z-10 mx-auto min-h-screen w-full max-w-4xl px-4 pb-24 pt-28 sm:px-6">
        <header className="mb-10 text-center">
          <p className="font-mono text-xs uppercase tracking-[0.35em] text-primary/80">Applicant Portal</p>
          <h1 className="mt-3 text-balance font-sans text-4xl font-bold tracking-tight sm:text-5xl">
            Prove Your Worth
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-pretty leading-relaxed text-muted-foreground">
            No account needed. Fill in your details, upload your proof, and our system will match you to the highest
            guild you qualify for.
          </p>
        </header>
        <ApplyForm />
      </main>
      <SiteFooter />
      <HelpButton />
    </>
  )
}
