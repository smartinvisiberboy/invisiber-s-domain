"use client"

import { useState } from "react"
import Image from "next/image"
import { Check, X, ChevronDown, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ELEMENTS, type ApplicationRecord } from "@/lib/application"
import { cn } from "@/lib/utils"

function ImageGrid({ label, urls }: { label: string; urls: string[] }) {
  if (!urls || urls.length === 0) return null
  return (
    <div>
      <p className="mb-2 font-mono text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <div className="flex flex-wrap gap-2">
        {urls.map((url, i) => (
          <a
            key={`${label}-${i}`}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative h-24 w-24 overflow-hidden rounded-lg border border-border/60 bg-secondary"
          >
            <Image
              src={url || "/placeholder.svg"}
              alt={`${label} proof ${i + 1}`}
              fill
              sizes="96px"
              className="object-cover transition-transform group-hover:scale-110"
              crossOrigin="anonymous"
            />
          </a>
        ))}
      </div>
    </div>
  )
}

export function ApplicationCard({
  application,
  onUpdate,
}: {
  application: ApplicationRecord
  onUpdate: (id: string, status: "accepted" | "rejected") => Promise<void>
}) {
  const [expanded, setExpanded] = useState(false)
  const [pendingAction, setPendingAction] = useState<"accepted" | "rejected" | null>(null)

  async function handle(status: "accepted" | "rejected") {
    setPendingAction(status)
    try {
      await onUpdate(application.id, status)
    } finally {
      setPendingAction(null)
    }
  }

  const statusColor =
    application.status === "accepted"
      ? "border-primary/50 text-primary"
      : application.status === "rejected"
        ? "border-destructive/50 text-destructive"
        : "border-amber-500/50 text-amber-400"

  return (
    <div className="glass rounded-xl p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-border/60 bg-secondary">
            {application.profileImage ? (
              <Image
                src={application.profileImage || "/placeholder.svg"}
                alt={`${application.discordId} profile`}
                fill
                sizes="56px"
                className="object-cover"
                crossOrigin="anonymous"
              />
            ) : null}
          </div>
          <div>
            <p className="font-sans text-lg font-semibold">{application.discordId}</p>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <span>{application.guildName}</span>
              <span className="text-border">•</span>
              <span>Boss {application.guildBossScore.toLocaleString()}</span>
              <span className="text-border">•</span>
              <span>{application.accountType}</span>
            </div>
          </div>
        </div>
        <Badge variant="outline" className={cn("uppercase", statusColor)}>
          {application.status}
        </Badge>
      </div>

      <button
        onClick={() => setExpanded((v) => !v)}
        className="mt-4 flex items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:text-primary/80"
      >
        {expanded ? "Hide" : "View"} all uploads
        <ChevronDown className={cn("h-4 w-4 transition-transform", expanded && "rotate-180")} />
      </button>

      {expanded ? (
        <div className="mt-4 space-y-5 border-t border-border/60 pt-4">
          <div className="grid gap-5 sm:grid-cols-2">
            <ImageGrid label="Guild Boss Screenshot" urls={[application.guildBossScreenshot].filter(Boolean) as string[]} />
            <ImageGrid label="Battle Tier Screenshot" urls={[application.battleTierScreenshot].filter(Boolean) as string[]} />
          </div>

          <div>
            <p className="mb-3 font-sans text-sm font-semibold text-foreground">Hunters</p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {ELEMENTS.map((el) => (
                <ImageGrid key={`hunter-${el}`} label={el} urls={application.hunters?.[el] ?? []} />
              ))}
            </div>
          </div>

          <div>
            <p className="mb-3 font-sans text-sm font-semibold text-foreground">Weapons</p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {ELEMENTS.map((el) => (
                <ImageGrid key={`weapon-${el}`} label={el} urls={application.weapons?.[el] ?? []} />
              ))}
            </div>
          </div>

          <ImageGrid label="Successor" urls={application.successor ?? []} />
        </div>
      ) : null}

      {application.status === "pending" ? (
        <div className="mt-5 flex gap-3 border-t border-border/60 pt-4">
          <Button
            onClick={() => handle("accepted")}
            disabled={pendingAction !== null}
            className="flex-1 gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {pendingAction === "accepted" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            Accept
          </Button>
          <Button
            onClick={() => handle("rejected")}
            disabled={pendingAction !== null}
            variant="outline"
            className="flex-1 gap-2 border-destructive/50 text-destructive hover:bg-destructive/10"
          >
            {pendingAction === "rejected" ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
            Reject
          </Button>
        </div>
      ) : application.reviewedBy ? (
        <p className="mt-4 border-t border-border/60 pt-3 text-xs text-muted-foreground">
          Reviewed by {application.reviewedBy}
        </p>
      ) : null}
    </div>
  )
}
