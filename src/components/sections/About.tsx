import { Check } from 'lucide-react'
import { siGmail, siTelegram, siVk, siWhatsapp } from 'simple-icons'
import type { SimpleIcon } from 'simple-icons'
import { ScrollReveal } from '../ScrollReveal'
import { WordReveal } from '../WordReveal'
import { PillButton } from '../PillButton'

const socialLinks = [
  { href: 'https://vk.com/karattobolsk', label: 'VKontakte', icon: siVk },
  { href: 'https://t.me/+79123887812', label: 'Telegram', icon: siTelegram },
  { href: 'https://wa.me/79829718197', label: 'WhatsApp', icon: siWhatsapp },
  { href: 'https://max.ru/id7206060623_bot', label: 'MAX', imageSrc: '/images/max-icon.png' },
  { href: 'mailto:karattob@gmail.com', label: 'Gmail', icon: siGmail },
]

const values = [
  'Индивидуальный план лечения',
  'Цифровая диагностика',
  'Безболезненные технологии',
  'Гарантия качества',
]

function BrandIcon({ icon }: { icon: SimpleIcon }) {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
      <path d={icon.path} />
    </svg>
  )
}

export function About() {
  return (
    <section id="about" className="relative bg-bg-primary py-10 md:py-14">
      <div className="shell">
        <ScrollReveal>
          <span className="eyebrow mb-8 block">О клинике</span>
        </ScrollReveal>

        <div className="grid items-start gap-12 lg:grid-cols-2 lg:gap-20">
          <ScrollReveal delay={0.1}>
            <div className="overflow-hidden rounded-[1.35rem] border border-line bg-bg-secondary shadow-sm">
              <img
                src="/images/team.jpg"
                alt="Команда врачей клиники KARAT TITAN"
                className="aspect-square w-full object-contain"
                loading="lazy"
              />
            </div>
          </ScrollReveal>

          <div>
            <WordReveal
              className="font-display text-3xl font-medium leading-tight tracking-tight text-ink md:text-4xl lg:text-5xl"
              as="h2"
            >
              Мы создаём улыбки, в которых вы чувствуете себя собой
            </WordReveal>

            <ScrollReveal delay={0.2}>
              <p className="mt-8 max-w-xl text-lg leading-relaxed text-text-muted md:text-xl">
                Karat Titan объединяет опытных врачей, цифровую диагностику и
                внимание к деталям. Мы не лечим зубы по шаблону: каждый план
                разрабатывается под ваши ощущения, образ жизни и ожидания. От
                профгигиены до сложной реставрации — всё в одном пространстве, где
                важен комфорт.
              </p>
            </ScrollReveal>

            <ScrollReveal delay={0.3}>
              <ul className="mt-8 space-y-3">
                {values.map((value) => (
                  <li key={value} className="flex items-start gap-3 text-base text-ink md:text-lg">
                    <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent-primary-300/30 text-accent-primary">
                      <Check size={12} strokeWidth={3} aria-hidden="true" />
                    </span>
                    {value}
                  </li>
                ))}
              </ul>
            </ScrollReveal>

            <ScrollReveal delay={0.4}>
              <div className="mt-10 flex flex-wrap items-center gap-3">
                {socialLinks.map(({ href, label, icon, imageSrc }) => (
                  <a
                    key={label}
                    href={href}
                    target={href.startsWith('mailto:') ? undefined : '_blank'}
                    rel={href.startsWith('mailto:') ? undefined : 'noreferrer'}
                    aria-label={label}
                    title={label}
                    className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-line bg-bg-secondary text-ink transition-all hover:-translate-y-0.5 hover:border-accent-primary hover:bg-surface hover:text-accent-primary hover:shadow-sm"
                  >
                    {imageSrc ? (
                      <span
                        className="h-5 w-5 bg-current"
                        style={{
                          WebkitMask: `url(${imageSrc}) center / contain no-repeat`,
                          mask: `url(${imageSrc}) center / contain no-repeat`,
                        }}
                        aria-hidden="true"
                      />
                    ) : (
                      <BrandIcon icon={icon!} />
                    )}
                  </a>
                ))}
              </div>
              <div className="mt-8">
                <PillButton
                  variant="outline"
                  onClick={() => {
                    const el = document.getElementById('technology')
                    el?.scrollIntoView({ behavior: 'smooth' })
                  }}
                >
                  Подробнее о нас
                </PillButton>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </section>
  )
}
