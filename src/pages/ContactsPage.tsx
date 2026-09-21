import { Clock, MapPin, Phone } from 'lucide-react'
import { ScrollReveal } from '../components/ScrollReveal'
import { useBooking } from '../hooks/useBooking'
import { useClinic } from '../context/clinic'

export function ContactsPage() {
  const { openBooking } = useBooking()
  const { branches } = useClinic()

  return (
    <main id="main-content" className="bg-bg-primary pt-[72px] lg:pt-20">
      <div className="shell py-10 md:py-14">
        <h1 className="font-display text-3xl font-semibold text-ink md:text-4xl">Контакты и филиалы</h1>
        <p className="mt-3 max-w-xl text-text-secondary">
          Три филиала клиники KARAT в Тобольске. Выберите удобный и запишитесь на приём.
        </p>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {branches.map((b, i) => (
            <ScrollReveal key={b.id} delay={i * 0.06}>
              <div className="flex h-full flex-col rounded-[1.35rem] border border-line bg-surface p-6">
                <strong className="font-display text-lg text-ink">{b.name}</strong>
                <ul className="mt-4 space-y-3 text-sm text-text-secondary">
                  <li className="flex items-start gap-2.5">
                    <MapPin size={15} className="mt-0.5 shrink-0 text-accent-primary" aria-hidden="true" />
                    <a href={b.mapUrl} target="_blank" rel="noopener noreferrer" className="hover:text-accent-primary hover:underline">
                      {b.address}
                    </a>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Phone size={15} className="mt-0.5 shrink-0 text-accent-primary" aria-hidden="true" />
                    <a href={`tel:${b.phone.replace(/[^+\d]/g, '')}`} className="hover:text-accent-primary">
                      {b.phone}
                    </a>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Clock size={15} className="mt-0.5 shrink-0 text-accent-primary" aria-hidden="true" />
                    {b.hours}
                  </li>
                </ul>
                <div className="mt-auto flex gap-2 pt-5">
                  <button
                    type="button"
                    onClick={openBooking}
                    className="flex-1 cursor-pointer rounded-radius-control bg-accent-primary py-2.5 text-sm font-semibold text-text-inverse transition-colors hover:bg-accent-primary-700"
                  >
                    Записаться
                  </button>
                  <a
                    href={b.mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 rounded-radius-control border border-line py-2.5 text-center text-sm font-semibold text-ink transition-colors hover:bg-bg-secondary"
                  >
                    На карте
                  </a>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </main>
  )
}
