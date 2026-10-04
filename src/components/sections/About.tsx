import { ScrollReveal } from '../ScrollReveal'
import { WordReveal } from '../WordReveal'
import { PillButton } from '../PillButton'

export function About() {
  return (
    <section id="about" className="relative bg-bg-primary py-10 md:py-14">
      <div className="shell grid gap-12 lg:grid-cols-2 lg:gap-20">
        <div className="relative">
          <ScrollReveal>
            <span className="eyebrow mb-4 block">О клинике</span>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <div className="mt-6 overflow-hidden rounded-[1.5rem] border border-line bg-bg-secondary shadow-sm">
              <img
                src="/images/team.jpg"
                alt="Команда врачей клиники KARAT TITAN"
                className="aspect-square w-full object-cover"
                loading="lazy"
              />
            </div>
          </ScrollReveal>
        </div>

        <div>
          <WordReveal
            className="font-display text-3xl font-medium leading-tight tracking-tight text-ink md:text-4xl lg:text-5xl"
            as="h2"
          >
            Мы создаём улыбки, в которых вы чувствуете себя собой
          </WordReveal>
          <ScrollReveal delay={0.2}>
            <p className="mt-8 max-w-xl text-base leading-relaxed text-text-muted md:text-lg">
              Karat Titan объединяет опытных врачей, цифровую диагностику и
              внимание к деталям. Мы не лечим зубы по шаблону: каждый план
              разрабатывается под ваши ощущения, образ жизни и ожидания. От
              профгигиены до сложной реставрации — всё в одном пространстве, где
              важен комфорт.
            </p>
          </ScrollReveal>

          <ScrollReveal delay={0.3}>
            <div className="mt-10 flex flex-wrap items-center gap-3">
              <a
                href="https://vk.com/karattobolsk"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-radius-pill border border-line bg-bg-secondary px-4 py-2 text-sm text-ink transition-colors hover:border-ink"
              >
                VKontakte
              </a>
              <a
                href="https://t.me/+79123887812"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-radius-pill border border-line bg-bg-secondary px-4 py-2 text-sm text-ink transition-colors hover:border-ink"
              >
                Telegram
              </a>
              <a
                href="https://wa.me/79829718197"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-radius-pill border border-line bg-bg-secondary px-4 py-2 text-sm text-ink transition-colors hover:border-ink"
              >
                WhatsApp
              </a>
              <a
                href="https://max.ru/id7206060623_bot"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-radius-pill border border-line bg-bg-secondary px-4 py-2 text-sm text-ink transition-colors hover:border-ink"
              >
                Max
              </a>
              <a
                href="mailto:karattob@gmail.com"
                className="inline-flex items-center gap-2 rounded-radius-pill border border-line bg-bg-secondary px-4 py-2 text-sm text-ink transition-colors hover:border-ink"
              >
                karattob@gmail.com
              </a>
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
    </section>
  )
}
