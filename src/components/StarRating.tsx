import { Star } from 'lucide-react'

interface StarRatingProps {
  rating?: number
  size?: number
  className?: string
}

export function StarRating({ rating = 5, size = 16, className }: StarRatingProps) {
  return (
    <span className={className} aria-label={`Рейтинг ${rating} из 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={size}
          className={i < rating ? 'inline fill-accent-secondary text-accent-secondary' : 'inline text-line'}
          aria-hidden="true"
        />
      ))}
    </span>
  )
}
