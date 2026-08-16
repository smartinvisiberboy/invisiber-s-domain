'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled ? 'glass-strong border-b border-border' : 'border-b border-transparent'
      }`}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <Image
            src="/invisiber-emblem.png"
            alt="Invisiber's Domain emblem"
            width={34}
            height={34}
            className="h-8 w-8 object-contain drop-shadow-[0_0_10px_rgba(120,170,255,0.6)]"
          />
          <span className="font-serif text-sm font-semibold tracking-[0.18em] text-foreground sm:text-base">
            INVISIBER&apos;S DOMAIN
          </span>
        </Link>

        <nav className="flex items-center gap-2 sm:gap-3">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="hidden text-muted-foreground hover:text-foreground sm:inline-flex"
          >
            <Link href="/#guilds">Guilds</Link>
          </Button>
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground"
          >
            <Link href="/manager">Manager</Link>
          </Button>
          <Button
            asChild
            size="sm"
            className="box-glow bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Link href="/apply">Apply Now</Link>
          </Button>
        </nav>
      </div>
    </header>
  )
}
