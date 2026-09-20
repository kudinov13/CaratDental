import { ScrollReveal } from '../ScrollReveal'
import { LineReveal } from '../LineReveal'
import { CountUp } from '../CountUp'

const stats = [
  { value: 15, suffix: '+', label: 'Лет опыта' },
  { value: 12000, suffix: '+', label: 'Улыбок' },
  { value: 40, suffix: '+', label: 'Процедур' },
  { value: 4, suffix: '.9', label: 'Рейтинг пациентов' },
]

export function Stats() {
  return (
    <section id="stats" className="bg-bg-primary py-24 md:py-32">
      <div className="shell">
        <div className="rounded-radius-card bg-ink px-6 py-16 md:px-12 md:py-24">
          <ScrollReveal>
            <span className="eyebrow mb-4 block text-text-muted">Цифры</span>
          </ScrollReveal>
          <LineReveal
            as="h2"
            className="mb-12 font-display text-3xl font-medium tracking-tight text-text-inverse md:mb-16 md:text-4xl lg:text-5xl"
          >
            Цифры
            вместо слов
          </LineReveal>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, i) => (
              <ScrollReveal key={stat.label} delay={i * 0.1}>
                <div className="text-center md:text-left">
                  <p className="font-display text-4xl font-semibold text-text-inverse md:text-5xl">
                    <CountUp
                      end={stat.value}
                      suffix={stat.suffix}
                      duration={1.8}
                    />
                  </p>
                  <p className="mt-2 text-sm text-text-muted md:text-base">
                    {stat.label}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
