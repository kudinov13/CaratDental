import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { ScrollReveal } from '../components/ScrollReveal'
import { formatPrice } from '../data/clinic'
import { priceCategories } from '../data/prices'

export function PricesPage() {
  const [query, setQuery] = useState('')

  const filteredCategories = useMemo(() => {
    if (!query.trim()) return priceCategories
    const q = query.toLowerCase()
    return priceCategories
      .map((cat) => ({
        ...cat,
        services: cat.services.filter((s) => s.name.toLowerCase().includes(q)),
      }))
      .filter((cat) => cat.services.length > 0)
  }, [query])

  return (
    <main id="main-content" className="bg-bg-primary pt-[72px] lg:pt-20">
      <div className="shell py-10 md:py-14">
        <h1 className="font-display text-3xl font-semibold text-ink md:text-4xl">Цены</h1>
        <p className="mt-3 max-w-2xl text-text-secondary">
          Актуальный прайс-лист клиники KARAT TITAN. Окончательная стоимость зависит от диагноза и
          сложности — уточняйте у администратора.
        </p>

        <div className="relative mt-8 max-w-xl">
          <Search
            size={18}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary"
            aria-hidden="true"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Найти услугу..."
            className="h-12 w-full rounded-full border border-line bg-surface pl-11 pr-4 text-sm text-ink shadow-sm placeholder:text-text-secondary focus:border-accent-primary focus:outline-none focus:ring-1 focus:ring-accent-primary/20"
          />
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {filteredCategories.map((cat, i) => (
            <ScrollReveal key={cat.title} delay={i * 0.05}>
              <div className="rounded-[1.35rem] border border-line bg-surface p-6">
                <h2 className="font-display text-lg font-semibold text-ink">{cat.title}</h2>
                <ul className="mt-4 space-y-2">
                  {cat.services.map((s, idx) => (
                    <li
                      key={`${s.name}-${idx}`}
                      className="flex items-start justify-between gap-4 border-b border-line py-2 text-sm last:border-0"
                    >
                      <span className="text-text-primary">
                        {s.name}
                        {s.note && (
                          <span className="block text-xs text-text-secondary">{s.note}</span>
                        )}
                      </span>
                      <span className="shrink-0 text-right">
                        <span className="block font-semibold text-ink">
                          {s.price > 0 ? formatPrice(s.price) : 'по запросу'}
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {filteredCategories.length === 0 && (
          <p className="mt-10 text-center text-text-secondary">
            Услуги не найдены. Попробуйте изменить поисковый запрос.
          </p>
        )}
      </div>
    </main>
  )
}
