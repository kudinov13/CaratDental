import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ScrollReveal } from '../ScrollReveal'
import { CaseSlider } from '../CaseSlider'

const cases = [
  { before: '/images/cases/case-1-before.jpg', after: '/images/cases/case-1-after.jpg', title: 'Отбеливание зубов' },
  { before: '/images/cases/case-2-before.jpg', after: '/images/cases/case-2-after.jpg', title: 'Эстетические виниры' },
  { before: '/images/cases/case-3-before.jpg', after: '/images/cases/case-3-after.jpg', title: 'Исправление прикуса' },
]

export function Cases() {
  return (
    <section id="cases" className="relative z-20 -mt-6 rounded-t-[1.75rem] bg-bg-secondary py-0 lg:-mt-9 lg:rounded-t-[2.5rem]">
      <div className="shell py-7 sm:py-9 lg:py-11">
          <div className="mb-6 flex items-center justify-between gap-4">
            <h2 className="font-display text-2xl font-semibold text-ink md:text-3xl">Результаты лечения</h2>
            <Link to="/kejsy" className="inline-flex items-center gap-2 text-sm font-semibold text-text-secondary transition-colors hover:text-ink">
              Смотреть все <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>

          <div className="-mx-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:mx-0 md:grid md:snap-none md:grid-cols-3 md:gap-4 md:overflow-visible md:px-0 md:pb-0">
            {cases.map((item, index) => (
              <ScrollReveal key={item.title} delay={index * 0.06} className="w-[72vw] max-w-[17rem] shrink-0 snap-start md:w-auto md:max-w-none md:shrink">
                <div className="overflow-hidden rounded-[1.35rem] border border-line bg-surface">
                  <CaseSlider beforeSrc={item.before} afterSrc={item.after} alt={item.title} />
                  <p className="px-4 py-3 text-center text-sm font-semibold text-ink">{item.title}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
      </div>
    </section>
  )
}
