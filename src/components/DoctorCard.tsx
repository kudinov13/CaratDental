'use client'

import { motion } from 'framer-motion'
import { PillButton } from './PillButton'

interface DoctorCardProps {
  name: string
  role: string
  experience: string
  description: string
  image: string
  index: number
  onBook?: () => void
}

export function DoctorCard({
  name,
  role,
  experience,
  description,
  image,
  onBook,
}: DoctorCardProps) {
  return (
    <motion.article
      className="group flex flex-col overflow-hidden rounded-radius-card bg-surface shadow-sm"
      whileHover={{ y: -6, boxShadow: 'var(--shadow-md)' }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
    >
      <div className="relative aspect-[4/5] overflow-hidden">
        <img
          src={image}
          alt={`${name}, ${role}`}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="flex flex-1 flex-col p-6">
        <h3 className="font-display text-lg font-semibold text-ink">{name}</h3>
        <p className="mt-1 text-sm text-accent-primary-700">{role}</p>
        <p className="mt-3 text-sm text-text-muted">{experience}</p>
        <p className="mt-3 text-sm leading-relaxed text-text-secondary">
          {description}
        </p>
        <div className="mt-auto pt-6">
          <PillButton variant="outline" onClick={onBook} className="w-full justify-center">
            Записаться
          </PillButton>
        </div>
      </div>
    </motion.article>
  )
}
