import { Crown, Shield, Swords, TrendingUp } from 'lucide-react'
import { GUILDS, MAIN_GUILD_ID } from '@/lib/guilds'
import { Badge } from '@/components/ui/badge'
import { Reveal } from '@/components/reveal'

function TierPill({ tier, level }: { tier: string; level: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-primary/30 bg-primary/10 px-2 py-1 font-mono text-xs font-medium text-accent">
      {tier} <span className="text-muted-foreground">·</span> {level}
    </span>
  )
}

export function GuildSection() {
  const main = GUILDS.find((g) => g.id === MAIN_GUILD_ID)!
  const subs = GUILDS.filter((g) => g.id !== MAIN_GUILD_ID)

  return (
    <section id="guilds" className="relative mx-auto max-w-6xl px-4 py-24 sm:px-6">
      <Reveal>
        <div className="flex flex-col items-center text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-accent">
            The Alliance
          </span>
          <h2 className="mt-3 font-serif text-3xl font-bold uppercase tracking-wide text-balance sm:text-4xl">
            Our Guilds
          </h2>
          <p className="mt-3 max-w-lg text-pretty text-sm text-muted-foreground">
            A network of elite and rising guilds. Rise through the ranks and
            earn your place at the top.
          </p>
        </div>
      </Reveal>

      {/* Main Guild */}
      <Reveal delay={0.05} className="mt-12">
        <article className="glass-strong box-glow relative overflow-hidden rounded-2xl p-6 sm:p-9">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full opacity-40 blur-3xl"
            style={{
              background:
                'radial-gradient(circle, oklch(0.64 0.18 258 / 0.7), transparent 70%)',
            }}
          />
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2 text-accent">
                <Crown className="h-4 w-4" aria-hidden="true" />
                <span className="text-xs font-semibold uppercase tracking-[0.24em]">
                  Main Guild
                </span>
              </div>
              <h3 className="mt-2 font-serif text-3xl font-bold tracking-wide text-glow sm:text-4xl">
                {main.name}
              </h3>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <TierPill tier={main.tier} level={main.level} />
                <Badge className="bg-accent text-accent-foreground">
                  #46 Global
                </Badge>
              </div>
            </div>

            <dl className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="glass rounded-xl px-4 py-3 text-center">
                <dt className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  RC
                </dt>
                <dd className="mt-1 font-mono text-lg font-bold text-foreground">
                  170+
                </dd>
              </div>
              <div className="glass rounded-xl px-4 py-3 text-center">
                <dt className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  Contribution
                </dt>
                <dd className="mt-1 font-mono text-lg font-bold text-foreground">
                  2800+
                </dd>
              </div>
            </dl>
          </div>
        </article>
      </Reveal>

      {/* Sub Guilds */}
      <Reveal delay={0.1} className="mt-10">
        <div className="mb-5 flex items-center gap-3">
          <Shield className="h-4 w-4 text-accent" aria-hidden="true" />
          <h3 className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
            Sub Guilds
          </h3>
          <div className="hairline h-px flex-1" />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {subs.map((g, i) => (
            <Reveal key={g.id} delay={0.04 * i}>
              <article className="glass box-glow-hover group h-full rounded-xl p-5">
                <div className="flex items-start justify-between gap-3">
                  <h4 className="font-serif text-xl font-semibold tracking-wide text-foreground">
                    {g.name}
                  </h4>
                  {g.open ? (
                    <Badge className="border border-success/40 bg-success/15 text-success">
                      Open
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="border-primary/40 text-accent"
                    >
                      Recruiting
                    </Badge>
                  )}
                </div>

                <div className="mt-3">
                  <TierPill tier={g.tier} level={g.level} />
                </div>

                <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <Swords className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
                    {g.rc}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <TrendingUp
                      className="h-3.5 w-3.5 text-accent"
                      aria-hidden="true"
                    />
                    {g.open ? 'Open' : g.contribution}
                  </span>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </Reveal>
    </section>
  )
}
