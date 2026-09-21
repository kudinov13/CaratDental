import { ArrowRight, BadgePercent, Stethoscope } from 'lucide-react'
import { Link } from 'react-router-dom'

const prices = [
  { service: 'Первичный приём', note: 'осмотр и план лечения', cost: '300 ₽' },
  { service: 'Лечение кариеса', note: 'пломба, анестезия включена', cost: 'от 2 100 ₽' },
  { service: 'Приём ортодонта', note: 'осмотр и консультация', cost: '500 ₽' },
]

export function Prices() {
  return (
    <section id="prices" className="h-full rounded-[1.75rem] bg-bg-secondary p-5 shadow-sm sm:p-7">
      <div className="mb-5 flex items-center justify-between gap-3">
        <h2 className="font-display text-2xl font-semibold text-ink">Цены</h2>
        <Link to="/tseny" className="inline-flex items-center gap-1 text-xs font-semibold text-text-secondary hover:text-ink">
          Все цены <ArrowRight size={14} aria-hidden="true" />
        </Link>
      </div>

      <div className="space-y-1">
        {prices.map((item) => (
          <div key={item.service} className="flex items-center gap-3 border-b border-line py-3 last:border-0">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-primary-300/30 text-accent-primary">
              <Stethoscope size={18} aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1">
              <strong className="block text-sm font-semibold text-ink">{item.service}</strong>
              <span className="block text-[11px] text-text-muted">{item.note}</span>
            </span>
            <strong className="shrink-0 font-display text-base text-ink">{item.cost}</strong>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center gap-3 rounded-[1.15rem] bg-accent-primary px-4 py-3 text-text-inverse">
        <BadgePercent className="h-7 w-7 shrink-0 text-accent-secondary-300" aria-hidden="true" />
        <span>
          <strong className="block text-sm">Рассрочка на лечение</strong>
          <span className="text-xs text-white/65">до 12 месяцев</span>
        </span>
      </div>
    </section>
  )
}
