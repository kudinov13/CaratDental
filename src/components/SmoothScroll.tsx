'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SmoothScrollContext } from './SmoothScrollContext'

gsap.registerPlugin(ScrollTrigger)

export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  const [lenis, setLenis] = useState<Lenis | null>(null)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches

    const instance = new Lenis({
      smoothWheel: true,
      wheelMultiplier: 0.9,
      touchMultiplier: 1.5,
      lerp: prefersReducedMotion ? 1 : 0.08,
    })

    setLenis(instance)

    function onFrame(time: number) {
      instance.raf(time)
      ScrollTrigger.update()
      rafRef.current = requestAnimationFrame(onFrame)
    }

    rafRef.current = requestAnimationFrame(onFrame)

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      instance.destroy()
    }
  }, [])

  return (
    <SmoothScrollContext.Provider value={{ lenis }}>
      {children}
    </SmoothScrollContext.Provider>
  )
}
