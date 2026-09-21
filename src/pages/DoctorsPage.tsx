import { MapPin } from 'lucide-react'
import { ScrollReveal } from '../components/ScrollReveal'
import { useBooking } from '../hooks/useBooking'
import { useBranch } from '../context/branch'
import { useClinic } from '../context/clinic'
import { formatPrice } from '../data/clinic'

export function DoctorsPage() {
  const { openBooking } = useBooking()
  const { branch } = useBranch()
  const { branches, doctors } = useClinic()
  const list = doctors.filter((d) => branch === 'all' || d.branchIds.includes(branch))

  return (
    <main id="main-content" className="bg-bg-primary pt-[72px] lg:pt-20">
      <div className="shell py-10 md:py-14">
        <h1 className="font-display text-3xl font-semibold text-ink md:text-4xl">Врачи</h1>
        <p className="mt-3 max-w-xl text-text-secondary">
          {branch === 'all'
            ? 'Команда клиники KARAT во всех филиалах.'
            : `Принимают в филиале «${branches.find((b) => b.id === branch)?.name}».`}
        </p>

        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {list.map((d, i) => (
            <ScrollReveal key={d.id} delay={i * 0.05}>
              <div className="flex h-full flex-col rounded-[1.35rem] border border-line bg-surface p-6">
                <div className="flex items-center gap-4">
                  <span className="h-20 w-20 shrink-0 overflow-hidden rounded-full border-2 border-accent-secondary-300/60 bg-bg-secondary">
                    <img src={d.photo} alt={d.name} className={`h-full w-full origin-top object-cover object-top ${d.imgClass ?? 'scale-[1.35]'}`} loading="lazy" />
                  </span>
                  <span className="min-w-0">
                    {d.chief && (
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-accent-secondary">Главный врач</span>
                    )}
                    <strong className="block font-display text-lg text-ink">{d.name}</strong>
                    <span className="block text-xs text-text-secondary">{d.role}</span>
                    <span className="mt-1 inline-flex items-center gap-1 text-[11px] text-text-muted">
                      <MapPin size={10} aria-hidden="true" />
                      {d.branchIds.map((id) => branches.find((b) => b.id === id)?.shortName).join(' · ')}
                    </span>
                  </span>
                </div>

                <ul className="mt-5 space-y-2 border-t border-line pt-4">
                  {d.services.map((s) => (
                    <li key={s.name} className="flex items-center justify-between gap-3 text-sm">
                      <span className="text-text-primary">{s.name}</span>
                      <span className="shrink-0 font-semibold text-ink">{formatPrice(s.price)}</span>
                    </li>
                  ))}
                </ul>

                <button
                  type="button"
                  onClick={openBooking}
                  className="mt-5 w-full cursor-pointer rounded-radius-control bg-accent-primary py-2.5 text-sm font-semibold text-text-inverse transition-colors hover:bg-accent-primary-700"
                >
                  Записаться к врачу
                </button>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </main>
  )
}
