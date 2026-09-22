import { useMemo, useState } from 'react'
import { ScrollReveal } from '../components/ScrollReveal'
import { useBranch } from '../context/branch'
import { useClinic } from '../context/clinic'
import { formatPrice } from '../data/clinic'
import { priceCategories } from '../data/prices'
import { clsx } from 'clsx'

function normalizeName(name: string) {
  return name.toLowerCase().replace(/\s+/g, ' ').trim()
}

export function PricesPage() {
  const { branch } = useBranch()
  const { branches, doctors } = useClinic()
  const [branchId, setBranchId] = useState<string>('all')
  const [doctorId, setDoctorId] = useState('all')
  const [query, setQuery] = useState('')

  const effectiveBranch = branchId === 'all' ? branch : branchId

  const availableDoctors = useMemo(() => {
    return effectiveBranch === 'all'
      ? doctors
      : doctors.filter((d) => d.branchIds.includes(effectiveBranch))
  }, [doctors, effectiveBranch])

  const serviceDoctors = useMemo(() => {
    const map = new Map<string, string[]>()
    for (const d of doctors) {
      for (const s of d.services) {
        const key = normalizeName(s.name)
        const list = map.get(key) ?? []
        if (!list.includes(d.name)) list.push(d.name)
        map.set(key, list)
      }
    }
    return map
  }, [doctors])

  const filteredCategories = useMemo(() => {
    return priceCategories
      .map((cat) => {
        const services = cat.services.filter((s) => {
          if (query.trim() && !s.name.toLowerCase().includes(query.toLowerCase())) {
            return false
          }
          const providers = serviceDoctors.get(normalizeName(s.name)) ?? []
          if (providers.length === 0) return true
          if (doctorId !== 'all') {
            const d = doctors.find((doc) => doc.id === doctorId)
            return d ? providers.includes(d.name) : false
          }
          if (effectiveBranch === 'all') return true
          return availableDoctors.some((d) => providers.includes(d.name))
        })
        return { ...cat, services }
      })
      .filter((cat) => cat.services.length > 0)
  }, [priceCategories, query, serviceDoctors, doctorId, doctors, effectiveBranch, availableDoctors])

  return (
    <main id="main-content" className="bg-bg-primary pt-[72px] lg:pt-20">
      <div className="shell py-10 md:py-14">
        <h1 className="font-display text-3xl font-semibold text-ink md:text-4xl">Цены</h1>
        <p className="mt-3 max-w-xl text-text-secondary">
          Актуальный прайс-лист. Окончательная стоимость зависит от диагноза и сложности — уточняйте у администратора.
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
          {[{ id: 'all', name: 'Все врачи' }, ...availableDoctors].map((d) => (
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

        <input
          type="search"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setDoctorId('all') }}
          placeholder="Найти услугу..."
          className="mt-4 w-full rounded-full border border-line bg-surface px-4 py-2 text-sm text-ink placeholder:text-text-secondary focus:border-accent-primary focus:outline-none"
        />

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {filteredCategories.map((cat, i) => (
            <ScrollReveal key={cat.title} delay={i * 0.05}>
              <div className="rounded-[1.35rem] border border-line bg-surface p-6">
                <h2 className="font-display text-lg font-semibold text-ink">{cat.title}</h2>
                <ul className="mt-4 space-y-2">
                  {cat.services.map((s, idx) => (
                    <li key={`${s.name}-${idx}`} className="flex items-start justify-between gap-4 border-b border-line py-2 text-sm last:border-0">
                      <span className="text-text-primary">{s.name}</span>
                      <span className="shrink-0 text-right">
                        <span className="block font-semibold text-ink">{formatPrice(s.price)}</span>
                        <span className="block text-xs text-text-secondary">{s.durationMin} мин</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {filteredCategories.length === 0 && (
          <p className="mt-10 text-center text-text-secondary">Услуги не найдены. Попробуйте изменить фильтр или поисковый запрос.</p>
        )}
      </div>
    </main>
  )
}
