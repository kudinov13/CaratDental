import { Award, MapPin } from 'lucide-react'
import { ScrollReveal } from '../ScrollReveal'
import { useBranch } from '../../context/branch'
import { useClinic } from '../../context/clinic'

interface DoctorsProps {
  onBook: () => void
}

export function Doctors({ onBook }: DoctorsProps) {
  const { branch } = useBranch()
  const { branches, doctors } = useClinic()

  const branchLabel = (branchIds: string[]) =>
    branchIds.map((id) => branches.find((b) => b.id === id)?.shortName).filter(Boolean).join(' · ')
  const visible = doctors.filter((d) => branch === 'all' || d.branchIds.includes(branch))
  const chief = visible.find((d) => d.chief)
  const others = visible.filter((d) => !d.chief)

  return (
    <section id="doctors" className="relative z-20 -mt-6 rounded-t-[1.75rem] bg-accent-primary-700 py-0 lg:-mt-9 lg:rounded-t-[2.5rem]">
      <div className="shell py-7 text-text-inverse sm:py-9 lg:py-11">
          <div className="mb-7 flex items-center justify-between gap-4">
            <h2 className="font-display text-2xl font-semibold text-text-inverse md:text-3xl">Наши врачи</h2>
          </div>

          <div className="grid grid-cols-3 gap-3 sm:gap-4 lg:grid-cols-4">
            {chief && (
              <ScrollReveal className="col-span-3 h-full sm:col-span-2 lg:col-span-1">
                <button
                  type="button"
                  onClick={onBook}
                  className="group flex h-full min-h-40 w-full cursor-pointer items-center gap-4 rounded-[1.35rem] border border-white/15 bg-white/10 p-4 text-left transition-colors hover:bg-white/15"
                >
                  <span className="h-28 w-28 shrink-0 overflow-hidden rounded-full border-2 border-accent-secondary-300/60 bg-bg-secondary transition-transform group-hover:scale-105 sm:h-32 sm:w-32">
                    <img src={chief.photo} alt={chief.name} className={`h-full w-full origin-top object-cover object-[30%_top] ${chief.imgClass ?? ''}`} loading="lazy" />
                  </span>
                  <span className="min-w-0">
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-accent-secondary-300">
                      <Award size={13} aria-hidden="true" /> Главный врач
                    </span>
                    <strong className="mt-1.5 block font-display text-lg text-white">{chief.name}</strong>
                    <span className="mt-1 block text-xs text-white/70">{chief.role}</span>
                    <span className="mt-1.5 inline-flex items-center gap-1 text-[10px] text-white/50">
                      <MapPin size={10} aria-hidden="true" /> {branchLabel(chief.branchIds)}
                    </span>
                  </span>
                </button>
              </ScrollReveal>
            )}

            {others.map(({ name, role, photo, imgClass, branchIds }, index) => (
              <ScrollReveal key={name} delay={(index + 1) * 0.05} className="h-full">
                <button
                  type="button"
                  onClick={onBook}
                  className="group flex h-full min-h-40 w-full cursor-pointer flex-col items-center justify-center rounded-[1.35rem] border border-transparent p-4 text-center transition-colors hover:border-white/15 hover:bg-white/10"
                >
                  <span className="h-20 w-20 overflow-hidden rounded-full border-2 border-accent-secondary-300/60 bg-bg-secondary transition-transform group-hover:scale-105 sm:h-24 sm:w-24 lg:h-32 lg:w-32">
                    <img src={photo} alt={name} className={`h-full w-full origin-top object-cover object-top ${imgClass ?? 'scale-[1.35]'}`} loading="lazy" />
                  </span>
                  <strong className="mt-3 font-display text-sm text-white sm:text-base">{name}</strong>
                  <span className="mt-1 text-[11px] leading-tight text-white/65 sm:text-xs">{role}</span>
                  <span className="mt-1.5 inline-flex items-center gap-1 text-[10px] text-white/45">
                    <MapPin size={10} aria-hidden="true" /> {branchLabel(branchIds)}
                  </span>
                </button>
              </ScrollReveal>
            ))}
          </div>
      </div>
    </section>
  )
}
