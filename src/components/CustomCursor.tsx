'use client'

import { useEffect, useState } from 'react'
import { motion, useMotionValue, useSpring, useReducedMotion } from 'framer-motion'

const INTERACTIVE_SELECTOR =
  'a, button, [role="button"], input, textarea, select, summary, [data-cursor-hover]'

export function CustomCursor() {
  const reduceMotion = useReducedMotion()
  const [isHover, setIsHover] = useState(false)
  const [isTouch, setIsTouch] = useState(false)

  const cursorX = useMotionValue(-100)
  const cursorY = useMotionValue(-100)
  const springX = useSpring(cursorX, { stiffness: 300, damping: 25 })
  const springY = useSpring(cursorY, { stiffness: 300, damping: 25 })
  const ringX = useMotionValue(-100)
  const ringY = useMotionValue(-100)

  useEffect(() => {
    const unsubscribeX = springX.on('change', (v) => ringX.set(v - 14))
    const unsubscribeY = springY.on('change', (v) => ringY.set(v - 14))
    return () => {
      unsubscribeX()
      unsubscribeY()
    }
  }, [springX, springY, ringX, ringY])

  useEffect(() => {
    if (reduceMotion) return

    const onTouchStart = () => setIsTouch(true)
    window.addEventListener('touchstart', onTouchStart, { passive: true })

    const onPointerMove = (e: PointerEvent) => {
      cursorX.set(e.clientX - 4)
      cursorY.set(e.clientY - 4)
    }
    window.addEventListener('pointermove', onPointerMove)

    const onPointerOver = (e: PointerEvent) => {
      if ((e.target as Element | null)?.closest(INTERACTIVE_SELECTOR)) {
        setIsHover(true)
      }
    }
    const onPointerOut = (e: PointerEvent) => {
      if ((e.target as Element | null)?.closest(INTERACTIVE_SELECTOR)) {
        setIsHover(false)
      }
    }
    document.body.addEventListener('pointerover', onPointerOver)
    document.body.addEventListener('pointerout', onPointerOut)

    return () => {
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('pointermove', onPointerMove)
      document.body.removeEventListener('pointerover', onPointerOver)
      document.body.removeEventListener('pointerout', onPointerOut)
    }
  }, [reduceMotion, cursorX, cursorY])

  if (reduceMotion || isTouch) return null

  return (
    <>
      <motion.div
        aria-hidden="true"
        className="fixed top-0 left-0 pointer-events-none z-[9999] rounded-full"
        style={{
          x: springX,
          y: springY,
          width: 8,
          height: 8,
          backgroundColor: 'var(--ink)',
        }}
        animate={{ scale: isHover ? 0.3 : 1, opacity: isHover ? 0.5 : 1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      />
      <motion.div
        aria-hidden="true"
        className="fixed top-0 left-0 pointer-events-none z-[9998] rounded-full"
        style={{
          x: ringX,
          y: ringY,
          width: 36,
          height: 36,
          border: '1px solid var(--line-strong)',
          mixBlendMode: 'difference',
        }}
        animate={{ scale: isHover ? 2 : 1, opacity: isHover ? 0.9 : 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      />
    </>
  )
}
