import { ScrollReveal } from '../ScrollReveal'
import { LineReveal } from '../LineReveal'
import { TechCard } from '../TechCard'
import { Scan, Microscope, Activity } from 'lucide-react'

const tech = [
  {
    icon: Scan,
    title: '3D-диагностика CBCT',
    description:
      'Точная визуализация челюсти за одно исследование. Планируем лечение на уровне миллиметров.',
  },
  {
    icon: Microscope,
    title: 'Микроскопы Carl Zeiss',
    description:
      'Увеличение до 25× позволяет сохранить живые ткани зуба при лечении каналов.',
  },
  {
    icon: Activity,
    title: 'Цифровые сканеры',
    description:
      'Слепки без силикона. Модели и коронки изготавливаются с точностью до микрона.',
  },
]

export function Technology() {
  return (
    <section id="technology" className="relative z-20 -mt-6 rounded-t-[1.75rem] bg-bg-secondary py-10 lg:-mt-9 lg:rounded-t-[2.5rem] md:py-14">
      <div className="shell relative z-10">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <LineReveal
              as="h2"
              className="font-display text-3xl font-medium tracking-tight text-ink md:text-4xl lg:text-5xl"
            >
              Технологии, за которыми
              будущее стоматологии
            </LineReveal>
            <ScrollReveal delay={0.2}>
              <p className="mt-6 max-w-xl text-base leading-relaxed text-text-secondary md:text-lg">
                Инвестируем в оборудование, которое делает диагностику
                понятной, а лечение предсказуемым. Никакой догадок, только
                данные.
              </p>
            </ScrollReveal>
          </div>

          <div className="relative flex items-center justify-center">
            <svg
              viewBox="0 0 200 240"
              className="h-64 w-64 opacity-20 md:h-80 md:w-80"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M100 20 C60 20 40 60 40 110 C40 170 60 220 100 220 C140 220 160 170 160 110 C160 60 140 20 100 20 Z"
                fill="var(--accent-primary)"
              />
              <path
                d="M100 40 C75 40 65 75 65 115 C65 165 80 200 100 200 C120 200 135 165 135 115 C135 75 125 40 100 40 Z"
                fill="var(--bg-secondary)"
              />
              <circle cx="100" cy="120" r="15" fill="var(--accent-secondary)" />
            </svg>
          </div>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {tech.map((item, i) => (
            <ScrollReveal key={item.title} delay={i * 0.1}>
              <TechCard {...item} />
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  )
}
