'use client'

import { motion, useReducedMotion } from 'framer-motion'

interface WordRevealProps {
  children: string
  className?: string
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span'
  stagger?: number
}

export function WordReveal({
  children,
  className = '',
  as: Tag = 'h2',
  stagger = 0.035,
}: WordRevealProps) {
  const reduceMotion = useReducedMotion()
  const words = children.split(' ')

  const container = {
    hidden: {},
    visible: {
      transition: { staggerChildren: stagger },
    },
  }

  const child = {
    hidden: { y: 24, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: [0.165, 0.84, 0.44, 1] as const,
      },
    },
  }

  return (
    <Tag className={className}>
      <motion.span
        className="inline-block"
        variants={container}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.5 }}
      >
        {words.map((word, i) => (
          <span key={i} className="inline-block overflow-hidden align-bottom">
            <motion.span
              className="inline-block"
              variants={reduceMotion ? undefined : child}
            >
              {word}
              {i < words.length - 1 && '\u00A0'}
            </motion.span>
          </span>
        ))}
      </motion.span>
    </Tag>
  )
}
