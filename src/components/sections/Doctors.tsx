import { Award } from 'lucide-react'
import { ScrollReveal } from '../ScrollReveal'

const doctors = [
  { photo: '/images/doctors/Amonatzoda.jpg', name: 'Амонатзода С. Р.', role: 'Стоматолог-терапевт' },
  { photo: '/images/doctors/Irisbekov.jpg', name: 'Ырысбеков Э. Н.', role: 'Терапевт, хирург, ортопед' },
  { photo: '/images/doctors/Rabadanov.jpg', name: 'Рабаданов Б. Р.', role: 'Стоматолог-терапевт', imgClass: 'scale-[1.8]' },
]

interface DoctorsProps {
  onBook: () => void
}

export function Doctors({ onBook }: DoctorsProps) {
  return (
    <section id="doctors" className="relative z-20 -mt-6 rounded-t-[1.75rem] bg-accent-primary-700 py-0 lg:-mt-9 lg:rounded-t-[2.5rem]">
      <div className="shell py-7 text-text-inverse sm:py-9 lg:py-11">
          <div className="mb-7 flex items-center justify-between gap-4">
            <h2 className="font-display text-2xl font-semibold text-text-inverse md:text-3xl">Наши врачи</h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <ScrollReveal className="h-full">
              <button
                type="button"
                onClick={onBook}
                className="group flex h-full min-h-40 w-full cursor-pointer items-center gap-4 rounded-[1.35rem] border border-white/15 bg-white/10 p-4 text-left transition-colors hover:bg-white/15"
              >
                <span className="h-32 w-32 shrink-0 overflow-hidden rounded-full border-2 border-accent-secondary-300/60 bg-bg-secondary transition-transform group-hover:scale-105">
                  <img src="/images/doctors/Karina.jpg" alt="Мари Грин — главный врач" className="h-full w-full origin-top scale-[1.35] object-cover object-[30%_top]" loading="lazy" />
                </span>
                <span className="min-w-0">
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-accent-secondary-300">
                    <Award size={13} aria-hidden="true" /> Главный врач
                  </span>
                  <strong className="mt-1.5 block font-display text-lg text-white">Мари Грин</strong>
                  <span className="mt-1 block text-xs text-white/70">Стоматолог-терапевт, ортопед</span>
                </span>
              </button>
            </ScrollReveal>

            {doctors.map(({ name, role, photo, imgClass }, index) => (
              <ScrollReveal key={name} delay={(index + 1) * 0.05} className="h-full">
                <button
                  type="button"
                  onClick={onBook}
                  className="group flex h-full min-h-40 w-full cursor-pointer flex-col items-center justify-center rounded-[1.35rem] border border-transparent p-4 text-center transition-colors hover:border-white/15 hover:bg-white/10"
                >
                  <span className="h-32 w-32 overflow-hidden rounded-full border-2 border-accent-secondary-300/60 bg-bg-secondary transition-transform group-hover:scale-105">
                    <img src={photo} alt={name} className={`h-full w-full origin-top object-cover object-top ${imgClass ?? 'scale-[1.35]'}`} loading="lazy" />
                  </span>
                  <strong className="mt-3 font-display text-base text-white">{name}</strong>
                  <span className="mt-1 text-xs text-white/65">{role}</span>
                </button>
              </ScrollReveal>
            ))}
          </div>
      </div>
    </section>
  )
}
