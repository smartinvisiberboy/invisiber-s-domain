'use client'

import { ELEMENTS, type ElementId } from '@/lib/application'
import { ImageSlot, type ImageValue } from '@/components/apply/image-slot'
import { ReferenceExamples } from '@/components/apply/reference-example'

const ELEMENT_ACCENT: Record<ElementId, string> = {
  fire: 'text-orange-400',
  water: 'text-sky-400',
  wind: 'text-emerald-400',
  light: 'text-amber-300',
  dark: 'text-fuchsia-400',
}

export function ElementImageGroup({
  value,
  onChange,
  references,
}: {
  value: Record<ElementId, ImageValue[]>
  onChange: (element: ElementId, index: number, v: ImageValue) => void
  references?: Record<ElementId, { src: string; alt: string }[]>
}) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {ELEMENTS.map((el) => (
        <div key={el.id} className="glass rounded-xl p-4">
          <div className="mb-3 flex items-center gap-2">
            <span
              className={`h-2 w-2 rounded-full bg-current ${ELEMENT_ACCENT[el.id]}`}
              aria-hidden="true"
            />
            <h4
              className={`text-sm font-semibold uppercase tracking-wide ${ELEMENT_ACCENT[el.id]}`}
            >
              {el.label}
            </h4>
          </div>
          {references?.[el.id]?.length ? (
            <ReferenceExamples
              images={references[el.id]}
              label={`${el.label} example`}
              className="mb-3"
            />
          ) : null}
          <div className="grid grid-cols-2 gap-3">
            {[0, 1].map((i) => (
              <ImageSlot
                key={i}
                value={value[el.id][i]}
                onChange={(v) => onChange(el.id, i, v)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
