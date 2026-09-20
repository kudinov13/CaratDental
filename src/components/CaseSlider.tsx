'use client'

import { useRef, useState } from 'react'
import { clsx } from 'clsx'

interface CaseSliderProps {
  beforeSrc: string
  afterSrc: string
  alt: string
}

export function CaseSlider({ beforeSrc, afterSrc, alt }: CaseSliderProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState(50)
  const [dragging, setDragging] = useState(false)

  const updatePosition = (clientX: number) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return
    const next = ((clientX - rect.left) / rect.width) * 100
    setPosition(Math.max(0, Math.min(100, next)))
  }

  const onPointerDown = (e: React.PointerEvent) => {
    setDragging(true)
    updatePosition(e.clientX)
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging) return
    updatePosition(e.clientX)
  }

  const onPointerUp = (e: React.PointerEvent) => {
    setDragging(false)
    ;(e.target as HTMLElement).releasePointerCapture(e.pointerId)
  }

  return (
    <figure
      ref={containerRef}
      className="relative aspect-[4/3] w-full cursor-ew-resize overflow-hidden rounded-radius-card bg-bg-tertiary select-none"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      aria-label={`Сравнение до и после: ${alt}`}
    >
      <img
        src={afterSrc}
        alt={`После: ${alt}`}
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <img
        src={beforeSrc}
        alt={`До: ${alt}`}
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover"
        style={{ clipPath: `inset(0 calc(100% - ${position}%) 0 0)` }}
      />

      <div
        className="absolute top-0 bottom-0 w-px bg-white/60"
        style={{ left: `${position}%` }}
      />
      <div
        className={clsx(
          'absolute top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/60 bg-white/90 p-2 shadow-md backdrop-blur-sm transition-transform',
          dragging && 'scale-110'
        )}
        style={{ left: `${position}%` }}
        aria-hidden="true"
      >
        <div className="h-4 w-4 rounded-full bg-accent-primary" />
      </div>
    </figure>
  )
}
