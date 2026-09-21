import { Clock } from 'lucide-react'
import { ScrollReveal } from '../components/ScrollReveal'
import { useBooking } from '../hooks/useBooking'
import { useClinic } from '../context/clinic'
import { formatPrice } from '../data/clinic'

const categories = [
  {
    title: 'Терапия',
    description: 'Лечение кариеса, пульпита и каналов. Пломбирование современными материалами, анестезия включена.',
    keywords: ['кариес', 'канал', 'приём', 'осмотр'],
  },
  {
    title: 'Эстетика',
    description: 'Отбеливание, виниры и реставрации. Возвращаем улыбке естественную красоту.',
    keywords: ['отбеливание', 'реставрация', 'винир'],
  },
  {
    title: 'Имплантация',
    description: 'Восстановление зубов имплантатами — надёжно и с пожизненной гарантией.',
    keywords: ['имплант'],
  },
  {
    title: 'Ортодонтия',
    description: 'Исправление прикуса брекетами и элайнерами для взрослых и детей.',
    keywords: ['ортодонт', 'прикус', 'брекет'],
  },
  {
    title: 'Профилактика',
    description: 'Профессиональная чистка, герметизация фиссур, реминерализация.',
    keywords: ['чистка', 'гигиена', 'профилакт'],
  },
]

export function ServicesPage() {
  const { openBooking } = useBooking()
  const { doctors } = useClinic()

  const rows = categories.map((cat) => {
    const related = doctors.flatMap((d) =>
      d.services
        .filter((s) => cat.keywords.some((k) => s.name.toLowerCase().includes(k)))
        .map((s) => ({ doctor: d, service: s }))
    )
    const minPrice = related.length ? Math.min(...related.map((r) => r.service.price)) : null
    const doctorNames = [...new Set(related.map((r) => r.doctor.name))]
    return { ...cat, related, minPrice, doctorNames }
  })

  return (
    <main id="main-content" className="bg-bg-primary pt-[72px] lg:pt-20">
      <div className="shell py-10 md:py-14">
        <h1 className="font-display text-3xl font-semibold text-ink md:text-4xl">Услуги клиники</h1>
        <p className="mt-3 max-w-xl text-text-secondary">
          Основные направления лечения в KARAT. Точные цены зависят от врача и филиала — смотрите раздел «Цены».
        </p>

        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {rows.map((cat, i) => (
            <ScrollReveal key={cat.title} delay={i * 0.05}>
              <div className="flex h-full flex-col rounded-[1.35rem] border border-line bg-surface p-6">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="font-display text-xl font-semibold text-ink">{cat.title}</h2>
                  {cat.minPrice !== null && (
                    <span className="shrink-0 rounded-full bg-accent-primary/10 px-3 py-1 text-xs font-semibold text-accent-primary">
                      от {formatPrice(cat.minPrice)}
                    </span>
                  )}
                </div>
                <p className="mt-3 text-sm leading-relaxed text-text-secondary">{cat.description}</p>

                {cat.related.length > 0 && (
                  <ul className="mt-4 space-y-2 border-t border-line pt-4">
                    {cat.related.slice(0, 4).map(({ doctor, service }) => (
                      <li key={doctor.id + service.name} className="flex items-center justify-between gap-3 text-sm">
                        <span className="min-w-0 text-text-primary">
                          {service.name}
                          <span className="ml-1.5 inline-flex items-center gap-1 text-[11px] text-text-muted">
                            <Clock size={10} aria-hidden="true" /> {service.durationMin} мин
                          </span>
                        </span>
                        <span className="shrink-0 font-semibold text-ink">{formatPrice(service.price)}</span>
                      </li>
                    ))}
                  </ul>
                )}

                <div className="mt-auto pt-5">
                  <p className="text-[11px] text-text-muted">
                    {cat.doctorNames.length > 0 ? `Врачи: ${cat.doctorNames.join(', ')}` : ''}
                  </p>
                  <button
                    type="button"
                    onClick={openBooking}
                    className="mt-3 w-full cursor-pointer rounded-radius-control bg-accent-primary py-2.5 text-sm font-semibold text-text-inverse transition-colors hover:bg-accent-primary-700"
                  >
                    Записаться
                  </button>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </main>
  )
}
