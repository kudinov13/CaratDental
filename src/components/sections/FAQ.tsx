import { LineReveal } from '../LineReveal'
import { FAQItem } from '../FAQItem'

const faq = [
  {
    question: 'Как быстро я смогу записаться на первый приём?',
    answer:
      'Оставьте заявку на сайте или напишите в мессенджер. Мы подтверждаем время в течение часа в рабочее время и подбираем удобный слот в том числе на вечер или выходной.',
  },
  {
    question: 'Больно ли делать профессиональную чистку?',
    answer:
      'Современные аппараты AirFlow и ультразвук работают мягко. Если чувствительность повышена, врач нанесёт обезболивающий гель до процедуры.',
  },
  {
    question: 'Сколько длится имплантация?',
    answer:
      'Установка одного импланта занимает около получаса. Полный срок зависит от кости и плана, но предсказуемую схему лечения мы фиксируем уже на консультации.',
  },
  {
    question: 'Как ухаживать за винирами?',
    answer:
      'Так же, как за своими зубами: щётка, нить и регулярная профгигиена. Мы даём памятку по уходу и рекомендуем контроль каждые шесть месяцев.',
  },
]

export function FAQ() {
  return (
    <section id="faq" className="bg-bg-primary py-24 md:py-32">
      <div className="shell max-w-4xl">
        <LineReveal
          as="h2"
          className="mb-12 font-display text-3xl font-medium tracking-tight text-ink md:mb-16 md:text-4xl lg:text-5xl"
        >
          Ответы на частые
          вопросы
        </LineReveal>

        <div className="border-t border-line">
          {faq.map((item) => (
            <FAQItem key={item.question} {...item} />
          ))}
        </div>
      </div>
    </section>
  )
}
