import { useState } from 'react'
import { ScrollReveal } from '../components/ScrollReveal'
import { useBranch } from '../context/branch'
import { useClinic } from '../context/clinic'
import { formatPrice } from '../data/clinic'
import { clsx } from 'clsx'

export function PricesPage() {
  const { branch } = useBranch()
  const { branches, doctors } = useClinic()
  const [branchId, setBranchId] = useState<string>('all')
  const [doctorId, setDoctorId] = useState('all')

  const effectiveBranch = branchId === 'all' ? branch : branchId
  const filtered = doctors
    .filter((d) => effectiveBranch === 'all' || d.branchIds.includes(effectiveBranch))
    .filter((d) => doctorId === 'all' || d.id === doctorId)

  return (
    <main id="main-content" className="bg-bg-primary pt-[72px] lg:pt-20">
      <div className="shell py-10 md:py-14">
        <h1 className="font-display text-3xl font-semibold text-ink md:text-4xl">Цены</h1>
        <p className="mt-3 max-w-xl text-text-secondary">
          У каждого врача — свой прайс-лист. Выберите филиал и врача, чтобы увидеть точные цены.
        </p>

        <div className="mt-6 flex flex-wrap gap-2">
          {[{ id: 'all', label: 'Все филиалы' }, ...branches.map((b) => ({ id: b.id, label: b.shortName }))].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => { setBranchId(item.id); setDoctorId('all') }}
              className={clsx(
                'cursor-pointer rounded-full border px-4 py-2 text-sm font-medium transition-colors',
                branchId === item.id || (branchId === 'all' && item.id === 'all')
                  ? 'border-accent-primary bg-accent-primary text-text-inverse'
                  : 'border-line bg-surface text-text-secondary hover:border-accent-primary/50'
              )}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {[{ id: 'all', name: 'Все врачи' }, ...doctors.filter((d) => effectiveBranch === 'all' || d.branchIds.includes(effectiveBranch))].map((d) => (
            <button
              key={d.id}
              type="button"
              onClick={() => setDoctorId(d.id)}
              className={clsx(
                'cursor-pointer rounded-full border px-4 py-2 text-xs font-medium transition-colors',
                doctorId === d.id
                  ? 'border-accent-primary bg-accent-primary/10 text-ink'
                  : 'border-line bg-surface text-text-secondary hover:border-accent-primary/50'
              )}
            >
              {d.name}
            </button>
          ))}
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {filtered.map((d, i) => (
            <ScrollReveal key={d.id} delay={i * 0.05}>
              <div className="rounded-[1.35rem] border border-line bg-surface p-6">
                <strong className="font-display text-lg text-ink">{d.name}</strong>
                <span className="block text-xs text-text-secondary">{d.role}</span>
                <ul className="mt-4 space-y-2">
                  {d.services.map((s) => (
                    <li key={s.name} className="flex items-center justify-between gap-3 border-b border-line py-2 text-sm last:border-0">
                      <span className="text-text-primary">{s.name}</span>
                      <span className="shrink-0 font-semibold text-ink">{formatPrice(s.price)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </main>
  )
}
