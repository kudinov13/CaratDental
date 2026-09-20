import type { LucideIcon } from 'lucide-react'

interface TechCardProps {
  icon: LucideIcon
  title: string
  description: string
}

export function TechCard({ icon: Icon, title, description }: TechCardProps) {
  return (
    <article className="flex flex-col gap-4 rounded-radius-card bg-surface p-6 shadow-sm transition-shadow duration-300 hover:shadow-md md:p-8">
      <div className="flex h-12 w-12 items-center justify-center rounded-radius-card-sm bg-bg-secondary text-ink">
        <Icon size={24} aria-hidden="true" />
      </div>
      <h3 className="font-display text-lg font-medium text-ink">{title}</h3>
      <p className="text-sm leading-relaxed text-text-secondary">{description}</p>
    </article>
  )
}
