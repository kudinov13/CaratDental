import { MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ScrollReveal } from '../ScrollReveal'
import { Logo } from '../Logo'
import { useClinic } from '../../context/clinic'

const links = {
  company: ['О нас', 'Команда', 'Карьера', 'Пресса'],
  services: [
    'Гигиена',
    'Отбеливание',
    'Имплантация',
    'Ортодонтия',
    'Реставрация',
  ],
  doctors: ['Алексей Воронов', 'Марина Светлова', 'Дмитрий Ковалёв', 'Елена Брагина'],
}

export function Footer() {
  const { branches } = useClinic()
  return (
    <footer
      id="contacts"
      className="relative overflow-hidden rounded-t-radius-card bg-ink pb-8 pt-16 text-text-inverse md:pt-24"
    >
      <div className="shell relative z-10">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Logo className="text-text-inverse" />
            <p className="mt-4 max-w-xs text-sm text-text-inverse/60">
              Премиальная стоматология, где технологии и внимание к деталям
              работают на вашу улыбку.
            </p>
          </div>
          <FooterColumn title="О компании" items={links.company} />
          <FooterColumn title="Услуги" items={links.services} />
          <div>
            <h3 className="mb-4 text-xs font-medium uppercase tracking-wider text-text-inverse/40">
              Филиалы
            </h3>
            <ul className="space-y-3">
              {branches.map((b) => (
                <li key={b.id}>
                  <a
                    href={b.mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-start gap-2 text-sm text-text-inverse/70 transition-colors hover:text-text-inverse"
                  >
                    <MapPin size={14} aria-hidden="true" className="mt-0.5 shrink-0 text-accent-secondary-300" />
                    <span>
                      <span className="block">{b.address}</span>
                      <span className="block text-xs text-text-inverse/45">{b.phone} · {b.hours}</span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 text-sm text-text-inverse/50 md:flex-row">
          <p>© 2025 Karat Titan. Все права защищены.</p>
          <div className="flex gap-6">
            <Link to="/politika-konfidencialnosti" className="transition-colors hover:text-text-inverse">
              Политика конфиденциальности
            </Link>
            <Link to="/kontakty" className="transition-colors hover:text-text-inverse">
              Контакты
            </Link>
          </div>
        </div>
      </div>

      <ScrollReveal>
        <div className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 select-none font-display text-[18vw] font-semibold leading-none text-text-inverse/[0.03]">
          KARAT TITAN
        </div>
      </ScrollReveal>
    </footer>
  )
}

function FooterColumn({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h3 className="mb-4 text-xs font-medium uppercase tracking-wider text-text-inverse/40">
        {title}
      </h3>
      <ul className="space-y-3">
        {items.map((item) => (
          <li key={item}>
            <a
              href="#"
              className="text-sm text-text-inverse/70 transition-colors hover:text-text-inverse"
            >
              {item}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}
