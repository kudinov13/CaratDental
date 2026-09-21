import { ScrollReveal } from '../components/ScrollReveal'
import { CaseSlider } from '../components/CaseSlider'

const cases = [
  { before: '/images/cases/case-1-before.jpg', after: '/images/cases/case-1-after.jpg', title: 'Отбеливание зубов', description: 'Профессиональное отбеливание, результат за один визит' },
  { before: '/images/cases/case-2-before.jpg', after: '/images/cases/case-2-after.jpg', title: 'Эстетические виниры', description: 'Установка керамических виниров на передние зубы' },
  { before: '/images/cases/case-3-before.jpg', after: '/images/cases/case-3-after.jpg', title: 'Исправление прикуса', description: 'Ортодонтическое лечение, срок 14 месяцев' },
]

export function CasesPage() {
  return (
    <main id="main-content" className="bg-bg-primary pt-[72px] lg:pt-20">
      <div className="shell py-10 md:py-14">
        <h1 className="font-display text-3xl font-semibold text-ink md:text-4xl">Кейсы: до и после</h1>
        <p className="mt-3 max-w-xl text-text-secondary">
          Реальные результаты лечения в клинике KARAT. Потяните ползунок, чтобы сравнить.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cases.map((item, i) => (
            <ScrollReveal key={item.title} delay={i * 0.06}>
              <div className="overflow-hidden rounded-[1.35rem] border border-line bg-surface">
                <CaseSlider beforeSrc={item.before} afterSrc={item.after} alt={item.title} />
                <div className="px-5 py-4">
                  <strong className="block font-display text-base text-ink">{item.title}</strong>
                  <span className="mt-1 block text-xs text-text-muted">{item.description}</span>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </main>
  )
}
