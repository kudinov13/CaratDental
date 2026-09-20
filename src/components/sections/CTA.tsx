import { CalendarDays, Leaf } from 'lucide-react'

interface CTAProps {
  onBook: () => void
}

export function CTA({ onBook }: CTAProps) {
  return (
    <section className="relative z-20 -mt-6 rounded-t-[1.75rem] bg-bg-primary pb-8 pt-5 md:pb-12 md:pt-8 lg:-mt-9 lg:rounded-t-[2.5rem]">
      <div className="shell">
        <div className="flex flex-col gap-6 rounded-[1.5rem] bg-accent-primary-700 px-6 py-7 text-text-inverse shadow-md md:flex-row md:items-center md:justify-between md:px-10">
          <div className="flex items-center gap-5">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-radius-card-sm border border-accent-secondary-300/60 text-accent-secondary-300">
              <CalendarDays size={28} aria-hidden="true" />
            </span>
            <span>
              <h2 className="font-display text-2xl font-semibold text-white md:text-3xl">Готовы к здоровой улыбке?</h2>
              <p className="mt-1 max-w-xl text-sm text-white/65">Запишитесь на консультацию — составим план лечения и ответим на все вопросы.</p>
            </span>
          </div>
          <button
            type="button"
            onClick={onBook}
            className="inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-radius-control bg-accent-secondary-300 px-7 font-semibold text-accent-primary-700 transition-all hover:-translate-y-0.5 hover:bg-[#edca82] hover:shadow-md"
          >
            Записаться <Leaf size={17} aria-hidden="true" />
          </button>
        </div>
      </div>
    </section>
  )
}
