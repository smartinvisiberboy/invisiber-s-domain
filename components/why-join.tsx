import { HeartHandshake, Sword, TrendingUp, Users } from 'lucide-react'
import { Reveal } from '@/components/reveal'

const REASONS = [
  {
    icon: Users,
    title: 'Active & Competitive',
    desc: 'A thriving community of dedicated hunters online around the clock, always pushing for more.',
  },
  {
    icon: Sword,
    title: 'Guild Boss Coordination',
    desc: 'Organized boss runs and strategy calls to maximize every hit and every reward.',
  },
  {
    icon: TrendingUp,
    title: 'Progression Path',
    desc: 'Prove yourself and climb from open guilds all the way up to our top-tier roster.',
  },
  {
    icon: HeartHandshake,
    title: 'Friendly Leadership',
    desc: 'Supportive officers and mentors who have your back — no toxicity, just growth.',
  },
]

export function WhyJoin() {
  return (
    <section className="relative mx-auto max-w-6xl px-4 py-24 sm:px-6">
      <Reveal>
        <div className="flex flex-col items-center text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-accent">
            The Advantage
          </span>
          <h2 className="mt-3 font-serif text-3xl font-bold uppercase tracking-wide text-balance sm:text-4xl">
            Why Join Us
          </h2>
        </div>
      </Reveal>

      <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {REASONS.map((r, i) => (
          <Reveal key={r.title} delay={0.06 * i}>
            <div className="glass box-glow-hover flex h-full flex-col rounded-xl p-6">
              <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-lg border border-primary/30 bg-primary/10 box-glow">
                <r.icon className="h-5 w-5 text-accent" aria-hidden="true" />
              </div>
              <h3 className="font-serif text-lg font-semibold tracking-wide text-foreground">
                {r.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {r.desc}
              </p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
