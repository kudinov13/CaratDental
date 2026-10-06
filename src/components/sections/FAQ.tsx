import { LineReveal } from '../LineReveal'
import { FAQItem } from '../FAQItem'
import { faq } from '../../data/faq'

export function FAQ() {
  return (
    <section id="faq" className="bg-bg-primary py-10 md:py-14">
      <div className="shell max-w-4xl">
        <LineReveal
          as="h2"
          className="mb-8 font-display text-2xl font-medium tracking-tight text-ink md:mb-10 md:text-3xl"
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
