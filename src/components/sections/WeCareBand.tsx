'use client'

import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

const tiles = [
  { label: 'Мы', variant: 'light' as const },
  { label: 'Заботимся', variant: 'accent' as const },
  { label: '→', variant: 'dark' as const },
  { label: 'О вашей улыбке', variant: 'ghost' as const },
]

const styles = {
  light: 'bg-bg-secondary text-ink',
  accent: 'bg-accent-primary text-text-inverse',
  dark: 'bg-ink text-text-inverse',
  ghost: 'bg-bg-primary/60 text-ink border border-line',
}

export function WeCareBand() {
  return (
    <section className="bg-bg-primary py-8 md:py-12">
      <div className="shell">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          {tiles.map((tile, i) => (
            <motion.div
              key={tile.label}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{
                delay: i * 0.1,
                duration: 0.6,
                ease: [0.16, 1, 0.3, 1] as const,
              }}
              whileHover={{ scale: 1.03 }}
              className={`flex items-center justify-center rounded-radius-card px-4 py-6 text-center font-display text-lg font-medium transition-colors md:text-xl lg:text-2xl ${styles[tile.variant]}`}
            >
              {tile.label === '→' ? (
                <ArrowRight className="h-6 w-6" aria-hidden="true" />
              ) : (
                tile.label
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
