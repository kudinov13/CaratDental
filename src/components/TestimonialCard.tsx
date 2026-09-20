import { StarRating } from './StarRating'

interface TestimonialCardProps {
  quote: string
  name: string
  role: string
  image: string
  rating?: number
}

export function TestimonialCard({
  quote,
  name,
  role,
  image,
  rating = 5,
}: TestimonialCardProps) {
  return (
    <figure className="flex h-full flex-col rounded-radius-card bg-surface p-6 shadow-sm md:p-8">
      <StarRating rating={rating} className="mb-4" size={14} />
      <blockquote className="flex-1 text-base leading-relaxed text-text-primary">
        &ldquo;{quote}&rdquo;
      </blockquote>
      <figcaption className="mt-6 flex items-center gap-3">
        <img
          src={image}
          alt={name}
          loading="lazy"
          className="h-11 w-11 rounded-full object-cover"
        />
        <div>
          <p className="text-sm font-medium text-ink">{name}</p>
          <p className="text-xs text-text-muted">{role}</p>
        </div>
      </figcaption>
    </figure>
  )
}
