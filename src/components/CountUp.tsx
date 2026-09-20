'use client'

import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from 'framer-motion'

interface CountUpProps {
  end: number
  duration?: number
  suffix?: string
  className?: string
}

export function CountUp({
  end,
  duration = 1.6,
  suffix = '',
  className,
}: CountUpProps) {
  const [value, setValue] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const hasAnimated = useRef(false)
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated.current) {
            hasAnimated.current = true
            if (reduceMotion) {
              setValue(end)
              return
            }
            const startTime = performance.now()
            const step = (now: number) => {
              const progress = Math.min((now - startTime) / (duration * 1000), 1)
              const eased = 1 - Math.pow(1 - progress, 4)
              setValue(Math.round(eased * end))
              if (progress < 1) {
                requestAnimationFrame(step)
              }
            }
            requestAnimationFrame(step)
          }
        })
      },
      { threshold: 0.3 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [end, duration, reduceMotion])

  return (
    <span ref={ref} className={className} aria-live="polite">
      {value}
      {suffix}
    </span>
  )
}
