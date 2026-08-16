'use client'

import { ImagePlus, X } from 'lucide-react'
import { useId, useRef, useState } from 'react'

export type ImageValue = {
  file: File
  preview: string
} | null

const MAX_BYTES = 8 * 1024 * 1024 // 8MB

export function ImageSlot({
  value,
  onChange,
  label,
  aspect = 'square',
}: {
  value: ImageValue
  onChange: (v: ImageValue) => void
  label?: string
  aspect?: 'square' | 'video'
}) {
  const inputId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)

  const accept = (file: File | undefined) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError('Images only')
      return
    }
    if (file.size > MAX_BYTES) {
      setError('Max 8MB')
      return
    }
    setError(null)
    if (value?.preview) URL.revokeObjectURL(value.preview)
    onChange({ file, preview: URL.createObjectURL(file) })
  }

  const clear = () => {
    if (value?.preview) URL.revokeObjectURL(value.preview)
    onChange(null)
    if (inputRef.current) inputRef.current.value = ''
    setError(null)
  }

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <span className="text-xs font-medium text-muted-foreground">
          {label}
        </span>
      )}
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragOver(false)
          accept(e.dataTransfer.files?.[0])
        }}
        className={`group relative flex ${
          aspect === 'square' ? 'aspect-square' : 'aspect-video'
        } w-full items-center justify-center overflow-hidden rounded-lg border border-dashed transition-colors ${
          dragOver
            ? 'border-primary bg-primary/10'
            : 'border-border bg-background/40 hover:border-primary/50'
        }`}
      >
        {value ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={value.preview || '/placeholder.svg'}
              alt={label ? `${label} preview` : 'Upload preview'}
              className="h-full w-full object-cover"
            />
            <button
              type="button"
              onClick={clear}
              aria-label="Remove image"
              className="absolute right-1.5 top-1.5 inline-flex h-7 w-7 items-center justify-center rounded-md bg-background/80 text-foreground backdrop-blur transition-colors hover:bg-destructive hover:text-destructive-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </>
        ) : (
          <label
            htmlFor={inputId}
            className="flex cursor-pointer flex-col items-center justify-center gap-1.5 p-3 text-center"
          >
            <ImagePlus
              className="h-5 w-5 text-muted-foreground transition-colors group-hover:text-accent"
              aria-hidden="true"
            />
            <span className="text-[11px] leading-tight text-muted-foreground">
              Upload
            </span>
          </label>
        )}
        <input
          id={inputId}
          ref={inputRef}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(e) => accept(e.target.files?.[0])}
        />
      </div>
      {error && <span className="text-[11px] text-destructive">{error}</span>}
    </div>
  )
}
