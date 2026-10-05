'use client'

import { motion } from 'framer-motion'
import { useLenis } from '../../hooks/useLenis'

export function Technology() {
  const lenis = useLenis()

  return (
    <section
      id="technology"
      className="relative z-20 -mt-6 min-h-[70vh] overflow-hidden rounded-t-[1.75rem] lg:-mt-9 lg:rounded-t-[2.5rem]"
    >
      <img
        src="/images/technology-hero.jpg"
        alt="Современный кабинет стоматологии KARAT TITAN"
        className="absolute inset-0 h-full w-full object-cover"
        loading="lazy"
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(100deg, rgba(11,72,63,0.92) 0%, rgba(11,72,63,0.78) 45%, rgba(11,72,63,0.25) 100%)',
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 flex min-h-[70vh] items-center">
        <div className="shell py-16 md:py-24">
          <div className="max-w-2xl">
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="eyebrow mb-4 block text-white/70"
            >
              Технологии
            </motion.span>

            <motion.h2
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.05 }}
              className="font-display text-4xl font-medium leading-tight tracking-tight text-white md:text-5xl lg:text-6xl"
            >
              Технологии, за которыми будущее стоматологии
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.12 }}
              className="mt-6 max-w-xl text-lg leading-relaxed text-white/80 md:text-xl"
            >
              Инвестируем в оборудование, которое делает диагностику понятной,
              а лечение предсказуемым. Никаких догадок, только данные.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-8 flex flex-wrap gap-3"
            >
              <button
                type="button"
                onClick={() => lenis?.scrollTo('#services', { offset: -84 })}
                className="inline-flex min-h-11 cursor-pointer items-center gap-1.5 rounded-[1.15rem] bg-accent-primary px-5 text-[13px] font-semibold text-text-inverse shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-accent-primary-700 hover:shadow-md sm:min-h-[3rem] sm:text-base"
              >
                Наши услуги
              </button>
              <button
                type="button"
                onClick={() => lenis?.scrollTo('#doctors', { offset: -84 })}
                className="min-h-11 cursor-pointer rounded-[1.15rem] border border-white/40 bg-white/10 px-5 text-[13px] font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/15 sm:min-h-[3rem] sm:text-base"
              >
                Наши врачи
              </button>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
