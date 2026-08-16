import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { DISCORD_INVITE } from '@/lib/guilds'
import { Button } from '@/components/ui/button'
import { Reveal } from '@/components/reveal'

export function DiscordCta() {
  return (
    <section className="relative mx-auto max-w-6xl px-4 pb-24 sm:px-6">
      <Reveal>
        <div className="glass-strong box-glow relative overflow-hidden rounded-2xl px-6 py-12 text-center sm:px-12 sm:py-16">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-[1] opacity-50"
            style={{
              background:
                'radial-gradient(ellipse 60% 80% at 50% 0%, oklch(0.64 0.18 258 / 0.35), transparent 70%)',
            }}
          />
          <h2 className="font-serif text-3xl font-bold uppercase tracking-wide text-balance text-glow sm:text-4xl">
            Ready to Rise?
          </h2>
          <p className="mx-auto mt-4 max-w-md text-pretty text-sm leading-relaxed text-muted-foreground">
            Submit your application and join our Discord to begin your ascent
            through the ranks of Invisiber&apos;s Domain.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="box-glow w-full bg-primary text-primary-foreground hover:bg-primary/90 sm:w-auto"
            >
              <Link href="/apply">
                Apply Now
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="w-full border-primary/40 bg-transparent text-foreground hover:bg-primary/10 sm:w-auto"
            >
              <a href={DISCORD_INVITE} target="_blank" rel="noopener noreferrer">
                Join Discord
              </a>
            </Button>
          </div>
        </div>
      </Reveal>
    </section>
  )
}
