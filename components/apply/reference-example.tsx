'use client'

import { ImageIcon } from 'lucide-react'

type Ref = { src: string; alt: string }

/**
 * Visible, non-interactive reference examples shown next to upload slots so
 * applicants know exactly what a valid submission screenshot looks like.
 * These are embedded images — never links or placeholders.
 */
export function ReferenceExamples({
  images,
  label = 'Reference — what to upload',
  aspect = 'video',
  className = '',
}: {
  images: Ref[]
  label?: string
  aspect?: 'video' | 'wide' | 'square'
  className?: string
}) {
  if (images.length === 0) return null

  const aspectClass =
    aspect === 'square'
      ? 'aspect-square'
      : aspect === 'wide'
        ? 'aspect-[21/9]'
        : 'aspect-video'

  return (
    <div className={`rounded-xl border border-border/70 bg-background/30 p-3 ${className}`}>
      <p className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        <ImageIcon className="h-3 w-3 text-accent" aria-hidden="true" />
        {label}
      </p>
      <div
        className={`grid gap-2 ${images.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}
      >
        {images.map((img, i) => (
          <div
            key={i}
            className={`relative ${aspectClass} w-full overflow-hidden rounded-lg border border-border bg-background/50`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={img.src || '/placeholder.svg'}
              alt={img.alt}
              loading="lazy"
              className="h-full w-full object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  )
}
