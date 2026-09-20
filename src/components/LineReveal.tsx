'use client'

import { motion, useReducedMotion } from 'framer-motion'

interface LineRevealProps {
  children: string
  className?: string
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span'
  stagger?: number
}

export function LineReveal({
  children,
  className = '',
  as: Tag = 'h1',
  stagger = 0.1,
}: LineRevealProps) {
  const reduceMotion = useReducedMotion()
  const lines = children.split('\n').filter(Boolean)

  const container = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: stagger,
      },
    },
  }

  const child = {
    hidden: { y: '100%', opacity: 0 },
    visible: {
      y: '0%',
      opacity: 1,
      transition: {
        duration: 0.9,
        ease: [0.215, 0.61, 0.355, 1] as const,
      },
    },
  }

  return (
    <Tag className={className}>
      <motion.span
        className="block overflow-hidden"
        variants={container}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.5 }}
      >
        {lines.map((line, i) => (
          <span key={i} className="block overflow-hidden">
            <motion.span
              className="block"
              variants={reduceMotion ? undefined : child}
            >
              {line.trim()}
            </motion.span>
          </span>
        ))}
      </motion.span>
    </Tag>
  )
}
