'use client'

import { motion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import { clsx } from 'clsx'
import { MagneticButton } from './MagneticButton'

interface PillButtonProps {
  children: React.ReactNode
  variant?: 'dark' | 'outline' | 'accent' | 'gold'
  className?: string
  onClick?: () => void
  type?: 'button' | 'submit'
  'aria-label'?: string
}

const variantStyles = {
  dark: 'bg-ink text-text-inverse border-transparent hover:shadow-md',
  outline:
    'bg-transparent text-ink border-line-strong hover:border-ink hover:bg-bg-secondary',
  accent: 'bg-accent-primary text-text-inverse border-transparent hover:shadow-md',
  gold: 'bg-accent-secondary-300 text-ink border-transparent hover:shadow-md',
}

export function PillButton({
  children,
  variant = 'dark',
  className,
  onClick,
  type = 'button',
  'aria-label': ariaLabel,
}: PillButtonProps) {
  return (
    <MagneticButton
      type={type}
      onClick={onClick}
      aria-label={ariaLabel}
      className={clsx(
        'group inline-flex items-center gap-2 whitespace-nowrap rounded-radius-pill border px-5 py-3 text-sm font-medium transition-colors duration-300',
        variantStyles[variant],
        className
      )}
    >
      <span>{children}</span>
      <motion.span
        className="flex h-6 w-6 items-center justify-center rounded-full bg-white/15"
        aria-hidden="true"
        whileHover={{ x: 3, y: -3 }}
        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      >
        <ArrowUpRight className="h-3.5 w-3.5" />
      </motion.span>
    </MagneticButton>
  )
}
