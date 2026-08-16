"use client"

import Image from "next/image"
import useSWR from "swr"
import { useState } from "react"
import { LogOut, Inbox, AlertCircle } from "lucide-react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { ApplicationCard } from "./application-card"
import type { ApplicationRecord, ApplicationStatus } from "@/lib/application"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

type ManagerInfo = { username: string; role: string; avatar?: string | null }

export function DashboardClient({ manager }: { manager: ManagerInfo }) {
  const { data, error, isLoading, mutate } = useSWR<{ applications: ApplicationRecord[]; error?: string }>(
    "/api/applications",
    fetcher,
    { refreshInterval: 15000 },
  )
  const [tab, setTab] = useState<ApplicationStatus>("pending")

  const applications = data?.applications ?? []
  const counts = {
    pending: applications.filter((a) => a.status === "pending").length,
    accepted: applications.filter((a) => a.status === "accepted").length,
    rejected: applications.filter((a) => a.status === "rejected").length,
  }

  async function updateStatus(id: string, status: "accepted" | "rejected") {
    // Optimistic update
    await mutate(
      async (current) => {
        await fetch(`/api/applications/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        })
        return current
      },
      {
        optimisticData: (current) =>
          current
            ? {
                ...current,
                applications: current.applications.map((a) =>
                  a.id === id ? { ...a, status, reviewedBy: manager.username } : a,
                ),
              }
            : current,
        rollbackOnError: true,
        revalidate: true,
      },
    )
  }

  const filtered = applications.filter((a) => a.status === tab)

  return (
    <main className="relative z-10 mx-auto min-h-screen w-full max-w-5xl px-4 py-8 sm:px-6">
      <header className="glass-strong mb-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl p-5">
        <div className="flex items-center gap-4">
          <div className="relative h-12 w-12 overflow-hidden rounded-full border border-primary/30 bg-secondary">
            {manager.avatar ? (
              <Image src={manager.avatar || "/placeholder.svg"} alt={manager.username} fill sizes="48px" className="object-cover" />
            ) : null}
          </div>
          <div>
            <p className="font-sans text-lg font-semibold">{manager.username}</p>
            <p className="font-mono text-xs uppercase tracking-wider text-primary/80">{manager.role}</p>
          </div>
        </div>
        <form action="/api/auth/logout" method="post">
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-lg border border-border/60 px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:border-destructive/50 hover:text-destructive"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </form>
      </header>

      <div className="mb-6">
        <h1 className="font-sans text-3xl font-bold tracking-tight">Applications</h1>
        <p className="mt-1 text-muted-foreground">Review incoming recruits and manage the guild roster.</p>
      </div>

      {error || data?.error ? (
        <div className="glass flex items-center gap-3 rounded-xl border border-amber-500/40 p-5 text-amber-300">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p className="text-sm">
            {data?.error ?? "Could not reach the applications service. Verify your Firebase configuration."}
          </p>
        </div>
      ) : (
        <Tabs value={tab} onValueChange={(v) => setTab(v as ApplicationStatus)}>
          <TabsList className="mb-6 grid w-full grid-cols-3 sm:w-auto sm:inline-grid">
            <TabsTrigger value="pending">Pending ({counts.pending})</TabsTrigger>
            <TabsTrigger value="accepted">Accepted ({counts.accepted})</TabsTrigger>
            <TabsTrigger value="rejected">Rejected ({counts.rejected})</TabsTrigger>
          </TabsList>

          <TabsContent value={tab} className="space-y-4">
            {isLoading ? (
              <p className="py-16 text-center text-muted-foreground">Loading applications…</p>
            ) : filtered.length === 0 ? (
              <div className="glass flex flex-col items-center gap-3 rounded-xl py-16 text-center text-muted-foreground">
                <Inbox className="h-10 w-10 opacity-50" />
                <p>No {tab} applications.</p>
              </div>
            ) : (
              filtered.map((app) => <ApplicationCard key={app.id} application={app} onUpdate={updateStatus} />)
            )}
          </TabsContent>
        </Tabs>
      )}
    </main>
  )
}
