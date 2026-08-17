'use client'

import { ExternalLink, LifeBuoy } from 'lucide-react'
import { HELP_DISCORD_USER_ID } from '@/lib/guilds'

const DISCORD_DEEP_LINK = `discord://-/users/${HELP_DISCORD_USER_ID}`
const DISCORD_WEB_FALLBACK = `https://discord.com/users/${HELP_DISCORD_USER_ID}`

export function HelpButton() {
  const openDiscord = () => {
    // Try to open the native Discord app first, then fall back to the web.
    const fallback = window.setTimeout(() => {
      window.open(DISCORD_WEB_FALLBACK, '_blank', 'noopener,noreferrer')
    }, 600)

    // If the app opens, the page loses focus and we cancel the web fallback.
    const cancel = () => window.clearTimeout(fallback)
    window.addEventListener('blur', cancel, { once: true })
    window.addEventListener('pagehide', cancel, { once: true })

    window.location.href = DISCORD_DEEP_LINK
  }

  return (
    <button
      type="button"
      onClick={openDiscord}
      className="inline-flex items-center gap-1.5 rounded-md border border-primary/30 bg-primary/10 px-2.5 py-1.5 text-xs text-accent transition-colors hover:bg-primary/20"
    >
      <LifeBuoy className="h-3.5 w-3.5" aria-hidden="true" />
      Need Help?
      <ExternalLink className="h-3 w-3" aria-hidden="true" />
    </button>
  )
}
