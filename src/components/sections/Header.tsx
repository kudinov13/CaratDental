'use client'

import { useState } from 'react'
import { motion, useMotionValueEvent, useScroll } from 'framer-motion'
import { Menu, Phone, X } from 'lucide-react'
import { Logo } from '../Logo'
import { useLenis } from '../../hooks/useLenis'

const navLinks = [
  { label: 'Услуги', href: '#services' },
  { label: 'Врачи', href: '#doctors' },
  { label: 'Результаты', href: '#cases' },
  { label: 'Цены', href: '#prices' },
  { label: 'Отзывы', href: '#testimonials' },
  { label: 'Контакты', href: '#contacts' },
]

interface HeaderProps {
  onBook: () => void
}

export function Header({ onBook }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const lenis = useLenis()
  const { scrollY } = useScroll()

  useMotionValueEvent(scrollY, 'change', (latest) => setScrolled(latest > 24))

  const scrollTo = (href: string) => {
    setMenuOpen(false)
    const el = document.querySelector(href)
    if (el) lenis?.scrollTo(el as HTMLElement, { offset: -92 })
  }

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'border-b border-line/80 bg-bg-secondary/90 shadow-sm backdrop-blur-xl'
            : 'border-b border-transparent bg-bg-secondary/65 backdrop-blur-md'
        }`}
      >
        <div className="shell flex h-[72px] items-center justify-between gap-6 lg:h-20">
          <button
            type="button"
            onClick={() => lenis?.scrollTo(0)}
            aria-label="На главную"
            className="cursor-pointer rounded-radius-control p-1 focus-visible:outline-offset-4"
          >
            <Logo />
          </button>

          <nav className="hidden items-center gap-5 lg:flex xl:gap-8" aria-label="Основная навигация">
            {navLinks.map((link) => (
              <button
                type="button"
                key={link.href}
                onClick={() => scrollTo(link.href)}
                className="cursor-pointer text-sm font-medium text-text-secondary transition-colors duration-200 hover:text-ink"
              >
                {link.label}
              </button>
            ))}
          </nav>

          <div className="hidden items-center gap-4 lg:flex">
            <a
              href="tel:+79990000000"
              className="inline-flex items-center gap-2 text-sm font-semibold text-ink transition-colors hover:text-accent-primary"
            >
              <Phone size={16} aria-hidden="true" />
              +7 (999) 000-00-00
            </a>
            <button
              type="button"
              onClick={onBook}
              className="min-h-11 cursor-pointer rounded-radius-control bg-accent-primary px-5 text-sm font-semibold text-text-inverse transition-colors hover:bg-accent-primary-700"
            >
              Записаться
            </button>
          </div>

          <button
            type="button"
            aria-label={menuOpen ? 'Закрыть меню' : 'Открыть меню'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((value) => !value)}
            className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-radius-control border border-accent-secondary/55 bg-surface text-ink lg:hidden"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </header>

      <motion.nav
        initial={false}
        animate={menuOpen ? 'open' : 'closed'}
        variants={{
          open: { opacity: 1, pointerEvents: 'auto' },
          closed: { opacity: 0, pointerEvents: 'none' },
        }}
        transition={{ duration: 0.22 }}
        className="fixed inset-0 z-40 flex flex-col justify-center bg-accent-primary-700 px-6 text-text-inverse lg:hidden"
        aria-hidden={!menuOpen}
        inert={!menuOpen}
      >
        <ul className="flex flex-col gap-5">
          {navLinks.map((link, index) => (
            <motion.li
              key={link.href}
              variants={{ open: { opacity: 1, y: 0 }, closed: { opacity: 0, y: 12 } }}
              transition={{ delay: menuOpen ? index * 0.04 : 0 }}
            >
              <button
                type="button"
                onClick={() => scrollTo(link.href)}
                className="cursor-pointer font-display text-3xl"
              >
                {link.label}
              </button>
            </motion.li>
          ))}
        </ul>
        <button
          type="button"
          onClick={onBook}
          className="mt-10 min-h-12 cursor-pointer rounded-radius-control bg-accent-secondary-300 px-6 font-semibold text-accent-primary-700"
        >
          Записаться на приём
        </button>
      </motion.nav>
    </>
  )
}
