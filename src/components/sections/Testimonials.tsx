import { ArrowRight, Star } from 'lucide-react'
import { Link } from 'react-router-dom'

export function Testimonials() {
  return (
    <section id="testimonials" className="h-full rounded-[1.75rem] bg-bg-secondary p-5 shadow-sm sm:p-7">
      <div className="mb-5 flex items-center justify-between gap-3">
        <h2 className="font-display text-2xl font-semibold text-ink">Отзывы пациентов</h2>
        <Link to="/otzyvy" className="inline-flex items-center gap-1 text-xs font-semibold text-text-secondary hover:text-ink">
          Все отзывы <ArrowRight size={14} aria-hidden="true" />
        </Link>
      </div>

      <figure className="flex min-h-56 flex-col rounded-[1.15rem] border border-line bg-surface/75 p-5">
        <div className="flex gap-1 text-accent-secondary" aria-label="Оценка 5 из 5">
          {Array.from({ length: 5 }).map((_, index) => (
            <Star key={index} size={16} fill="currentColor" aria-hidden="true" />
          ))}
        </div>
        <blockquote className="mt-5 flex-1 text-sm leading-relaxed text-text-primary">
          Спасибо клинике KARAT за мою новую улыбку! Всё прошло легко, без боли и с отличным результатом. Отдельное спасибо врачу за спокойствие и внимание.
        </blockquote>
        <figcaption className="mt-5 flex items-center justify-between border-t border-line pt-4">
          <span>
            <strong className="block text-sm text-ink">Анна, 34 года</strong>
            <span className="text-xs text-text-muted">Лечение и реставрация</span>
          </span>
          <span className="flex gap-1.5" aria-hidden="true">
            <span className="h-2 w-2 rounded-full bg-accent-primary" />
            <span className="h-2 w-2 rounded-full bg-line-strong" />
            <span className="h-2 w-2 rounded-full bg-line-strong" />
            <span className="h-2 w-2 rounded-full bg-line-strong" />
          </span>
        </figcaption>
      </figure>
    </section>
  )
}
