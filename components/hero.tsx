'use client'

import { motion } from 'framer-motion'
import { ChevronDown, ShieldCheck, Sparkles } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.14, delayChildren: 0.1 },
  },
}

const item = {
  hidden: { opacity: 0, y: 26 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
  },
}

export function Hero() {
  return (
    <section className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden px-4 pt-16 text-center">
      {/* central glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 -z-[1] h-[520px] w-[520px] -translate-x-1/2 -translate-y-[55%] rounded-full opacity-60 blur-3xl"
        style={{
          background:
            'radial-gradient(circle, oklch(0.64 0.18 258 / 0.4), transparent 65%)',
        }}
      />

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="flex flex-col items-center"
      >
        <motion.div variants={item} className="animate-float-slow">
          <Image
            src="/invisiber-emblem.png"
            alt="Invisiber's Domain guild emblem"
            width={168}
            height={168}
            priority
            className="h-32 w-32 object-contain drop-shadow-[0_0_35px_rgba(120,170,255,0.6)] sm:h-40 sm:w-40"
          />
        </motion.div>

        <motion.div variants={item} className="mt-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-accent box-glow">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            Top 46 Global
          </span>
        </motion.div>

        <motion.h1
          variants={item}
          className="mt-6 font-serif text-4xl font-bold uppercase leading-[1.05] tracking-[0.04em] text-balance text-foreground text-glow sm:text-6xl md:text-7xl"
        >
          Invisiber&apos;s Domain
        </motion.h1>

        <motion.p
          variants={item}
          className="mt-5 max-w-xl text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base"
        >
          United by Strength <span className="text-accent">·</span> Bound by
          Loyalty <span className="text-accent">·</span> Destined for Greatness
        </motion.p>

        <motion.div
          variants={item}
          className="mt-9 flex w-full flex-col items-center justify-center gap-3 sm:flex-row"
        >
          <Button
            asChild
            size="lg"
            className="box-glow w-full bg-primary text-primary-foreground hover:bg-primary/90 sm:w-auto"
          >
            <Link href="/apply">
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
              Apply Now
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="w-full border-primary/40 bg-transparent text-foreground hover:bg-primary/10 sm:w-auto"
          >
            <Link href="/manager">Manager Login</Link>
          </Button>
        </motion.div>
      </motion.div>

      <motion.a
        href="#guilds"
        aria-label="Scroll to guilds"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 0.8 }}
        className="absolute bottom-7 flex flex-col items-center gap-1 text-muted-foreground"
      >
        <span className="text-[10px] uppercase tracking-[0.3em]">Explore</span>
        <ChevronDown className="h-5 w-5 animate-bounce" aria-hidden="true" />
      </motion.a>
    </section>
  )
}
