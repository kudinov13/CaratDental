import { useState } from 'react'
import { Star } from 'lucide-react'
import { ScrollReveal } from '../components/ScrollReveal'
import { useClinic } from '../context/clinic'
import { clsx } from 'clsx'
import { reviews } from '../data/reviews'

export function ReviewsPage() {
  const { branches } = useClinic()
  const [branchId, setBranchId] = useState('all')
  const list = reviews.filter((r) => branchId === 'all' || r.branchId === branchId)

  return (
    <main id="main-content" className="bg-bg-primary pt-[72px] lg:pt-20">
      <div className="shell py-10 md:py-14">
        <h1 className="font-display text-3xl font-semibold text-ink md:text-4xl">Отзывы пациентов</h1>
        <p className="mt-3 max-w-xl text-text-secondary">
          Рейтинг клиники 4.9 по оценкам пациентов. Отзывы можно фильтровать по филиалу.
        </p>

        <div className="mt-6 flex flex-wrap gap-2">
          {[{ id: 'all', label: 'Все филиалы' }, ...branches.map((b) => ({ id: b.id, label: b.shortName }))].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setBranchId(item.id)}
              className={clsx(
                'cursor-pointer rounded-full border px-4 py-2 text-sm font-medium transition-colors',
                branchId === item.id
                  ? 'border-accent-primary bg-accent-primary text-text-inverse'
                  : 'border-line bg-surface text-text-secondary hover:border-accent-primary/50'
              )}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {list.map((r, i) => (
            <ScrollReveal key={r.name + i} delay={i * 0.05}>
              <figure className="flex h-full flex-col rounded-[1.35rem] border border-line bg-surface p-6">
                <div className="flex gap-1 text-accent-secondary" aria-label={`Оценка ${r.rating} из 5`}>
                  {Array.from({ length: r.rating }).map((_, idx) => (
                    <Star key={idx} size={15} fill="currentColor" aria-hidden="true" />
                  ))}
                </div>
                <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-text-primary">{r.text}</blockquote>
                <figcaption className="mt-4 flex items-center justify-between border-t border-line pt-4">
                  <span>
                    <strong className="block text-sm text-ink">{r.name}</strong>
                    <span className="text-xs text-text-muted">{r.tag}</span>
                  </span>
                  <span className="text-xs text-text-muted">{branches.find((b) => b.id === r.branchId)?.shortName}</span>
                </figcaption>
              </figure>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </main>
  )
}
