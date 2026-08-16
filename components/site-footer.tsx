import Image from 'next/image'
import { DISCORD_INVITE } from '@/lib/guilds'
import { HelpButton } from '@/components/help-button'

export function SiteFooter() {
  return (
    <footer className="relative border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 py-10 sm:flex-row sm:justify-between sm:px-6">
        <div className="flex items-center gap-2.5">
          <Image
            src="/invisiber-emblem.png"
            alt="Invisiber's Domain emblem"
            width={28}
            height={28}
            className="h-7 w-7 object-contain"
          />
          <span className="font-serif text-sm font-semibold tracking-[0.16em]">
            INVISIBER&apos;S DOMAIN
          </span>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          United by Strength · Bound by Loyalty · Destined for Greatness
        </p>

        <div className="flex items-center gap-3">
          <a
            href={DISCORD_INVITE}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-muted-foreground transition-colors hover:text-accent"
          >
            Discord
          </a>
          <HelpButton />
        </div>
      </div>
    </footer>
  )
}
