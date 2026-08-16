'use client'

import { Check, Copy, LifeBuoy } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { HELP_DISCORD_USER_ID } from '@/lib/guilds'

export function HelpButton() {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(HELP_DISCORD_USER_ID)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="inline-flex items-center gap-1.5 rounded-md border border-primary/30 bg-primary/10 px-2.5 py-1.5 text-xs text-accent transition-colors hover:bg-primary/20"
      >
        <LifeBuoy className="h-3.5 w-3.5" aria-hidden="true" />
        Help
      </button>

      {open && (
        <div className="glass-strong box-glow absolute bottom-full right-0 mb-2 w-60 rounded-xl p-4 text-left">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Need Help?
          </p>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            Contact us on Discord with this User ID:
          </p>
          <button
            type="button"
            onClick={copy}
            className="mt-3 flex w-full items-center justify-between gap-2 rounded-lg border border-border bg-background/50 px-3 py-2 font-mono text-xs text-foreground transition-colors hover:border-primary/50"
          >
            <span className="truncate">{HELP_DISCORD_USER_ID}</span>
            {copied ? (
              <Check className="h-3.5 w-3.5 shrink-0 text-success" aria-hidden="true" />
            ) : (
              <Copy className="h-3.5 w-3.5 shrink-0 text-accent" aria-hidden="true" />
            )}
          </button>
        </div>
      )}
    </div>
  )
}
