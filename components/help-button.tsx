'use client'

import { ExternalLink, LifeBuoy } from 'lucide-react'
import { HELP_DISCORD_USER_ID } from '@/lib/guilds'

const DISCORD_WEB_URL = `https://discord.com/users/${HELP_DISCORD_USER_ID}`

export function HelpButton() {
  const openDiscord = () => {
    // Open the Discord profile in a new tab. The web page itself will offer to
    // launch the native Discord app if it's installed. Opening in a new tab
    // works reliably everywhere, including inside the v0 preview iframe.
    const win = window.open(DISCORD_WEB_URL, '_blank', 'noopener,noreferrer')

    // If the popup was blocked, fall back to navigating the top-level window.
    if (!win) {
      const target = window.top ?? window
      target.location.href = DISCORD_WEB_URL
    }
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
