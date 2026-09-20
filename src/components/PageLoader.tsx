'use client'

import { useEffect, useState } from 'react'
import { motion, useMotionValue, useTransform, animate, useReducedMotion } from 'framer-motion'

export function PageLoader({ onDone }: { onDone?: () => void }) {
  const reduceMotion = useReducedMotion()
  const [phase, setPhase] = useState<'loading' | 'exiting' | 'done'>('loading')
  const progress = useMotionValue(0)
  const display = useTransform(progress, (v) =>
    String(Math.round(v)).padStart(3, '0')
  )

  useEffect(() => {
    document.body.style.overflow = 'hidden'

    if (reduceMotion) {
      progress.set(100)
      const t = setTimeout(() => setPhase('exiting'), 400)
      return () => {
        clearTimeout(t)
        document.body.style.overflow = ''
      }
    }

    const controls = animate(progress, 100, {
      duration: 1.3,
      ease: [0.65, 0, 0.35, 1],
    })

    const exitTimer = setTimeout(() => setPhase('exiting'), 1300)

    return () => {
      controls.stop()
      clearTimeout(exitTimer)
      document.body.style.overflow = ''
    }
  }, [reduceMotion, progress])

  useEffect(() => {
    if (phase === 'exiting') {
      document.body.style.overflow = ''
      const doneTimer = setTimeout(() => {
        setPhase('done')
        onDone?.()
      }, 900)
      return () => clearTimeout(doneTimer)
    }
  }, [phase, onDone])

  if (phase === 'done') return null

  return (
    <motion.div
      aria-hidden="true"
      className="fixed inset-0 z-[120] flex flex-col items-center justify-center bg-ink text-text-inverse"
      initial={{ y: 0 }}
      animate={{ y: phase === 'exiting' ? '-100%' : '0%' }}
      transition={{
        type: 'spring',
        stiffness: 120,
        damping: 20,
      }}
    >
      <div className="flex flex-col items-center gap-6">
        <div className="font-display text-3xl font-semibold tracking-tight">KARAT</div>
        <p className="text-sm text-text-muted">Искусство заботы о вашей улыбке</p>
        <div className="font-sans text-2xl tabular-nums tracking-widest">
          <motion.span>{display}</motion.span>
        </div>
      </div>
    </motion.div>
  )
}
