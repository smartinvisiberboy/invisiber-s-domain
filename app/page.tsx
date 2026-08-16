import { ParticleBackground } from '@/components/particle-background'
import { SiteHeader } from '@/components/site-header'
import { Hero } from '@/components/hero'
import { GuildSection } from '@/components/guild-section'
import { WhyJoin } from '@/components/why-join'
import { DiscordCta } from '@/components/discord-cta'
import { SiteFooter } from '@/components/site-footer'

export default function Page() {
  return (
    <>
      <ParticleBackground />
      <SiteHeader />
      <main>
        <Hero />
        <GuildSection />
        <WhyJoin />
        <DiscordCta />
      </main>
      <SiteFooter />
    </>
  )
}
