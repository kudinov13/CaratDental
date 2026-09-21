'use client'

import { Star, UserRound } from 'lucide-react'
import { motion } from 'framer-motion'
import { useLenis } from '../../hooks/useLenis'

interface HeroProps {
  onBook: () => void
}

function LeafMark({ className, size }: { className?: string; size?: number }) {
  const paths = [
    'M54.291 37.4a1.022 1.022 0 0 1-.256-.033 1 1 0 0 1-.712-1.222c.239-.905.44-1.769.595-2.567.014-.092.042-.216.072-.346a1.032 1.032 0 0 1 1.207-.781.971.971 0 0 1 .758 1.163c-.036.152-.054.227-.067.308-.171.88-.381 1.787-.631 2.733a1 1 0 0 1-.966.745z',
    'M30.257 62.347a41.316 41.316 0 0 1-15.945-3.685 20.154 20.154 0 0 1-5.554-3.462 17.291 17.291 0 0 1-4.584-6.158A25.647 25.647 0 0 1 2 38.633c-.02-8.956 4.611-17.7 12.389-23.4C35.981-.579 70.715 1.451 71.064 1.472a1 1 0 0 1 .627 1.721c-6.669 6.378-10.863 15.061-13.207 21.223-.282.751-.546 1.5-.792 2.269a1 1 0 1 1-1.9-.61c.255-.8.53-1.582.826-2.367 2.223-5.846 6.07-13.9 12.07-20.316-7.958-.15-35.248.373-53.113 13.455C8.307 22.167 3.981 30.31 4 38.627a23.687 23.687 0 0 0 2 9.607 15.317 15.317 0 0 0 4.071 5.46 18.147 18.147 0 0 0 5.013 3.124c8.3 3.5 23.5 7.478 31.961-5.213a1 1 0 0 1 1.664 1.11 21.253 21.253 0 0 1-18.452 9.632z',
    'M51.029 46.891a.981.981 0 0 1-.376-.075 1 1 0 0 1-.549-1.3l.069-.169c.175-.426.545-1.326.99-2.522a1 1 0 1 1 1.875.7c-.456 1.227-.836 2.149-1.015 2.586l-.067.163a1 1 0 0 1-.927.617z',
    'M3 72.639a.983.983 0 0 1-.233-.028 1 1 0 0 1-.741-1.2c8.87-37.17 42.448-53.059 42.785-53.215a1 1 0 1 1 .839 1.815c-.329.153-33.039 15.661-41.678 51.864a1 1 0 0 1-.972.764z',
    'M40.585 28.444a.941.941 0 0 1-.129-.008l-7.167-.92a1 1 0 0 1-.855-.8l-1.194-6.25a1 1 0 1 1 1.965-.376l1.058 5.535 6.448.828a1 1 0 0 1-.126 1.991z',
    'M35.06 35.611h-.021l-10.739-.217a1 1 0 0 1-.969-.85l-1.653-10.831a1 1 0 0 1 1.977-.3l1.522 10 9.9.2a1 1 0 0 1-.019 2z',
    'M32.223 46.361h-.074l-16.374-1.2a1 1 0 0 1-.885-.711l-3.932-13.136a1 1 0 0 1 1.917-.573l3.733 12.478 15.692 1.145a1 1 0 0 1-.072 2z',
  ]

  return (
    <svg viewBox="0 0 74 74" className={className} width={size} height={size} fill="currentColor" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" aria-hidden="true">
      {paths.map((path) => <path key={path} d={path} />)}
    </svg>
  )
}

function ToothMark({ className, size }: { className?: string; size?: number }) {
  return (
    <svg viewBox="0 0 48 48" className={className} width={size} height={size} fill="currentColor" aria-hidden="true">
      <path d="m25.354 7.232c-.325.155-1.049.546-1.357.622v.001l-.003.002c-7.073-3.902-14.437-1.673-14.737 7.143-.024 3.855 1.797 7.594 1.728 11.301.258 5.126.772 11.17 5.007 14.717 1.246.983 3.516.849 4.354-.624 1.94-3.608.717-7.693 1.964-11.388.298-1.059 1.012-1.576 1.696-1.926.749.478 1.41.724 1.793 2.086.874 3.006.368 6.348 1.14 9.434.511 2.708 3.081 3.902 5.328 2.155 4.101-3.655 4.703-9.604 4.903-14.751-.006-3.646 2.074-7.417 1.922-11.286-.474-7.593-7.125-10.978-13.738-7.486zm-1.356.63c.005.025.009.175.004.222-.003.058-.006-.19-.004-.222zm11.388 18.141c-.109 4.642-.533 10.183-4.014 13.567-2.402 1.841-3.287-1.019-3.512-3.098-.503-2.332.003-10.17-3.705-9.506.024-.057.003-.108-.103-.15-1.046-.337-2.17.504-2.674 1.826-1.456 2.26-.101 13.955-4.548 11.149-1.782-1.399-2.673-3.947-3.235-6.15-1.064-3.666-.514-7.586-1.204-11.316-.49-2.477-1.238-4.841-1.22-7.326.029-3.213 2.019-7.011 5.601-7.032 2.08-.115 4.109.614 5.955 1.546.333.123.636.339 1.355.341.67-.066.961-.263 1.29-.401 3.833-2.22 8.842-2.607 10.947 2.047 2.407 4.814-1.024 9.391-.933 14.503z" />
    </svg>
  )
}

const benefits = [
  { icon: LeafMark, iconClass: 'h-4 w-4 sm:h-[18px] sm:w-[18px]', title: 'Без боли', text: 'Бережное лечение' },
  { icon: ToothMark, iconSize: 22, iconClass: 'h-[18px] w-[18px] sm:h-[22px] sm:w-[22px]', title: 'Современное оборудование', text: 'Точная диагностика' },
  { icon: UserRound, iconClass: 'h-4 w-4 sm:h-[18px] sm:w-[18px]', title: 'Индивидуальный подход', text: 'Забота на каждом этапе' },
]

export function Hero({ onBook }: HeroProps) {
  const lenis = useLenis()

  return (
    <section id="home" className="relative min-h-[82dvh] overflow-hidden bg-[linear-gradient(160deg,#F5F1E8_0%,#EFEADB_50%,#E5DFCC_100%)] pt-[72px] lg:min-h-[100dvh] lg:pt-20">
      {/* Media background */}
      <div className="absolute inset-0 opacity-70" aria-hidden="true">
        <div className="absolute -left-24 top-24 h-72 w-72 rounded-full bg-accent-secondary-300/25 blur-3xl" />
        <div className="absolute right-0 top-0 h-full w-2/3 bg-gradient-to-l from-accent-primary-300/20 to-transparent" />
      </div>

      {/* Interactive before/after layer */}
      <div className="relative z-10">
        <div className="relative grid min-h-[calc(82dvh-72px)] overflow-hidden lg:min-h-[calc(100dvh-80px)] lg:grid-cols-[1.02fr_0.98fr]">
          {/* Watermark */}
          <div className="relative z-30 flex flex-col justify-end px-4 pb-36 pt-12 sm:px-10 sm:pb-42 lg:px-14 lg:pb-44 xl:px-16">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.05 }}
              className="max-w-[60%] font-display text-[clamp(1.75rem,3.2vw,3.6rem)] font-semibold leading-[1.06] tracking-[-0.045em] text-ink sm:max-w-xl"
            >
              Улыбка, которая меняет впечатление о себе
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.12 }}
              className="mt-4 max-w-[58%] text-sm leading-relaxed text-text-secondary sm:mt-6 sm:max-w-[42ch] sm:text-base md:text-lg"
            >
              Современная стоматология для здоровья, уверенности и красоты вашей улыбки.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.18 }}
              className="mt-6 flex flex-nowrap gap-2 sm:mt-8 sm:gap-3"
            >
              <button
                type="button"
                onClick={onBook}
                className="inline-flex min-h-11 cursor-pointer items-center gap-1.5 rounded-[1.15rem] bg-accent-primary px-4 text-[13px] font-semibold text-text-inverse shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-accent-primary-700 hover:shadow-md sm:min-h-[3.75rem] sm:gap-2.5 sm:px-10 sm:text-base"
              >
                <LeafMark className="h-4 w-4 text-accent-secondary-300 sm:h-6 sm:w-6" />
                Записаться
              </button>
              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById('services')
                  if (el) lenis?.scrollTo(el, { offset: -84 })
                }}
                className="min-h-11 cursor-pointer rounded-[1.15rem] border border-accent-primary/40 bg-surface/65 px-4 text-[13px] font-semibold text-ink transition-colors hover:bg-surface sm:min-h-[3.75rem] sm:px-10 sm:text-base"
              >
                Наши услуги
              </button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="relative mt-6 flex w-fit items-center rounded-[1.25rem] border border-accent-primary-700/60 bg-[linear-gradient(to_right,transparent_0%,transparent_55%,rgba(255,255,255,0.55)_80%,rgba(255,255,255,0.85)_100%)] px-3 py-2 shadow-sm backdrop-blur-md sm:px-5 sm:py-3"
            >
              <div className="flex items-center gap-2 sm:gap-2.5">
                <Star className="h-5 w-5 fill-accent-secondary text-accent-secondary sm:h-7 sm:w-7" aria-hidden="true" />
                <strong className="font-display text-2xl text-ink sm:text-3xl">4.9</strong>
              </div>
              <span className="mx-3 h-6 w-px bg-line-strong/70 sm:mx-5 sm:h-7" aria-hidden="true" />
              <div className="flex items-center gap-2 sm:gap-2.5">
                <strong className="font-display text-2xl text-ink sm:text-3xl">200+</strong>
                <span className="max-w-20 text-[10px] leading-tight text-text-secondary sm:text-[11px]">довольных пациентов</span>
              </div>
            </motion.div>
          </div>

          {/* Content */}
          <div className="absolute inset-0 z-0 overflow-hidden">
            <picture>
              <source media="(min-width: 1024px)" srcSet="/images/Hero_One.jpg" />
              <img
                src="/images/Hero-mobile.jpg"
                alt="Врач клиники KARAT"
                className="absolute inset-0 h-full w-full object-cover object-[right_bottom] lg:object-[78%_center]"
              />
            </picture>
            <div className="absolute inset-0 bg-gradient-to-t from-accent-primary-700/20 via-transparent to-bg-secondary/10" />
          </div>

          <div
            className="pointer-events-none absolute inset-y-0 left-0 z-20 hidden w-[80%] bg-[linear-gradient(160deg,#F5F1E8_0%,#EFEADB_50%,#E5DFCC_100%)] lg:block"
            style={{
              WebkitMaskImage: 'linear-gradient(to right, black 0%, black 65%, transparent 100%)',
              maskImage: 'linear-gradient(to right, black 0%, black 65%, transparent 100%)',
            }}
            aria-hidden="true"
          />

          <div className="absolute bottom-5 left-4 right-4 z-30 grid grid-cols-3 gap-1 rounded-[1.1rem] bg-[linear-gradient(95deg,#073F39_0%,#0D5A50_50%,#2F8271_100%)] px-3 py-2 text-text-inverse shadow-lg backdrop-blur-md sm:bottom-8 sm:left-10 sm:right-10 sm:gap-2 sm:p-4 sm:pl-6 lg:bottom-12 lg:left-14 lg:right-auto lg:w-[46%] xl:left-16 xl:w-[44%]">
            {benefits.map(({ icon: Icon, iconSize, iconClass, title, text }) => (
              <div key={title} className="flex items-center justify-center gap-1.5 rounded-xl px-1 py-1 sm:flex-row sm:gap-3 sm:border-r sm:border-white/15 sm:px-2 sm:py-2 sm:text-left sm:last:border-0">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-accent-secondary/70 text-accent-secondary-300 sm:h-10 sm:w-10">
                  <Icon size={iconSize ?? 18} className={iconClass} aria-hidden="true" />
                </span>
                <span>
                  <strong className="block text-[9px] font-semibold leading-tight sm:text-xs md:text-sm">{title}</strong>
                  <span className="mt-0.5 hidden text-[10px] text-white/60 xl:block">{text}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
