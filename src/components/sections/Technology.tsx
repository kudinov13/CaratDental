import { ScrollReveal } from '../ScrollReveal'
import { LineReveal } from '../LineReveal'
import { TechCard } from '../TechCard'

const tech = [
  {
    imageSrc: '/images/equipment/cbct.jpg',
    title: '3D-диагностика CBCT',
    description: 'Точная визуализация челюсти за одно исследование. Планируем лечение на уровне миллиметров.',
  },
  {
    imageSrc: '/images/equipment/microscope.jpg',
    title: 'Дентальный микроскоп',
    description: 'Многократное увеличение помогает находить каналы и сохранять максимум здоровых тканей зуба.',
  },
  {
    imageSrc: '/images/equipment/scanner.jpg',
    title: 'Цифровой сканер',
    description: 'Точные цифровые слепки без силиконовых масс для комфортного протезирования и ортодонтии.',
  },
]

export function Technology() {
  return (
    <section id="technology" className="relative z-20 -mt-6 overflow-hidden rounded-t-[1.75rem] bg-bg-secondary lg:-mt-9 lg:rounded-t-[2.5rem]">
      <div className="relative min-h-[58vh] overflow-hidden">
        <img src="/images/technology-hero.jpg" alt="Современный кабинет стоматологии KARAT TITAN" className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
        <div className="absolute inset-0 bg-[linear-gradient(100deg,rgba(11,72,63,.94)_0%,rgba(11,72,63,.78)_48%,rgba(11,72,63,.18)_100%)]" aria-hidden="true" />
        <div className="shell relative z-10 flex min-h-[58vh] items-center py-16 md:py-24">
          <div className="max-w-2xl">
            <ScrollReveal><span className="eyebrow mb-4 block text-white/70">Технологии</span></ScrollReveal>
            <LineReveal as="h2" className="font-display text-4xl font-medium leading-tight tracking-tight text-white md:text-5xl lg:text-6xl">
              Технологии, за которыми будущее стоматологии
            </LineReveal>
            <ScrollReveal delay={0.2}>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/80 md:text-xl">
                Инвестируем в оборудование, которое делает диагностику понятной, а лечение предсказуемым. Никаких догадок — только точные данные.
              </p>
            </ScrollReveal>
          </div>
        </div>
      </div>

      <div className="shell py-12 md:py-16">
        <div className="mb-8 flex items-end justify-between gap-6">
          <div>
            <span className="eyebrow">Оснащение клиники</span>
            <h3 className="mt-3 font-display text-3xl font-medium text-ink md:text-4xl">Оборудование для точного лечения</h3>
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {tech.map((item, index) => (
            <ScrollReveal key={item.title} delay={index * 0.1} className="h-full">
              <TechCard {...item} />
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  )
}
