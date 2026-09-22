'use client'

import { useState } from 'react'
import { motion, useMotionValueEvent, useScroll } from 'framer-motion'
import { MapPin, Menu, Phone, X } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Logo } from '../Logo'
import { useLenis } from '../../hooks/useLenis'
import { useBranch } from '../../context/branch'
import { useClinic } from '../../context/clinic'

const navLinks = [
  { label: 'Услуги', href: '#services' },
  { label: 'Врачи', href: '#doctors' },
  { label: 'Результаты', href: '#cases' },
  { label: 'Цены', href: '#prices' },
  { label: 'Отзывы', href: '#testimonials' },
  { label: 'Вопросы', href: '#faq' },
  { label: 'Контакты', href: '#contacts' },
]

interface HeaderProps {
  onBook: () => void
}

export function Header({ onBook }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const { branch, setBranch } = useBranch()
  const { branches } = useClinic()
  const lenis = useLenis()
  const { scrollY } = useScroll()

  useMotionValueEvent(scrollY, 'change', (latest) => setScrolled(latest > 24))

  const navigate = useNavigate()
  const location = useLocation()

  const scrollTo = (href: string) => {
    setMenuOpen(false)
    if (location.pathname !== '/') {
      navigate('/' + href)
      return
    }
    const el = document.querySelector(href)
    if (el) lenis?.scrollTo(el as HTMLElement, { offset: -92 })
  }

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'border-b border-line/80 bg-bg-secondary/90 shadow-sm backdrop-blur-xl'
            : 'border-b border-transparent bg-transparent lg:bg-bg-secondary/65 lg:backdrop-blur-md'
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
            <div className="relative">
              <MapPin size={14} aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-accent-primary" />
              <select
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                aria-label="Выбор филиала"
                className="cursor-pointer appearance-none rounded-radius-control border border-line/70 bg-surface/60 py-2 pl-8 pr-7 text-xs font-semibold text-ink transition-colors hover:bg-surface"
              >
                <option value="all">Все филиалы</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>{b.shortName} — {b.address.split(', ').slice(1).join(', ')}</option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[9px] text-text-muted">▼</span>
            </div>
            <a
              href="tel:+79123887812"
              className="inline-flex items-center gap-2 text-sm font-semibold text-ink transition-colors hover:text-accent-primary"
            >
              <Phone size={16} aria-hidden="true" />
              +7 (912) 388-78-12
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
        <div className="mb-8 flex flex-wrap gap-2">
          {[{ id: 'all', label: 'Все филиалы' }, ...branches.map((b) => ({ id: b.id, label: b.shortName }))].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setBranch(item.id)}
              className={`cursor-pointer rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                branch === item.id
                  ? 'border-accent-secondary-300 bg-accent-secondary-300 text-accent-primary-700'
                  : 'border-white/25 text-white/80 hover:border-white/50'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
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
