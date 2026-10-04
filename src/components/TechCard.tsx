interface TechCardProps {
  imageSrc: string
  title: string
  description: string
}

export function TechCard({ imageSrc, title, description }: TechCardProps) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-radius-card bg-surface shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
      <div className="aspect-[4/3] overflow-hidden bg-bg-secondary">
        <img src={imageSrc} alt={title} className="h-full w-full object-cover transition-transform duration-500 hover:scale-105" loading="lazy" />
      </div>
      <div className="flex flex-1 flex-col p-6 md:p-7">
        <h3 className="font-display text-xl font-medium text-ink">{title}</h3>
        <p className="mt-3 text-sm leading-relaxed text-text-secondary">{description}</p>
      </div>
    </article>
  )
}
