'use client'

import { useEffect, useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { X, Check } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLenis } from '../hooks/useLenis'
import { clsx } from 'clsx'

interface BookingModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const services = [
  'Профессиональная гигиена',
  'Отбеливание',
  'Имплантация',
  'Ортодонтия',
  'Эстетическая реставрация',
  'Лечение под микроскопом',
  'Консультация',
]

export function BookingModal({ open, onOpenChange }: BookingModalProps) {
  const lenis = useLenis()
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle')

  useEffect(() => {
    if (open) {
      lenis?.stop()
      setStatus('idle')
    } else {
      lenis?.start()
    }
    return () => {
      lenis?.start()
    }
  }, [open, lenis])

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setStatus('submitting')
    setTimeout(() => setStatus('success'), 1500)
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay asChild>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => onOpenChange(false)}
            className="fixed inset-0 z-[100] bg-ink/30 backdrop-blur-[16px]"
          />
        </Dialog.Overlay>
        <Dialog.Content asChild>
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 24 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed left-1/2 top-1/2 z-[101] w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-radius-card bg-surface p-6 shadow-lg md:p-10"
          >
            <div className="mb-6 flex items-start justify-between">
              <div>
                <Dialog.Title className="font-display text-2xl font-semibold text-ink md:text-3xl">
                  Записаться на прием
                </Dialog.Title>
                <Dialog.Description className="mt-1 text-sm text-text-secondary">
                  Оставьте контакты, и мы свяжемся с вами в течение дня.
                </Dialog.Description>
              </div>
              <Dialog.Close asChild>
                <button
                  type="button"
                  aria-label="Закрыть форму"
                  className="rounded-radius-control p-2 text-text-muted transition-colors hover:bg-bg-secondary hover:text-ink"
                >
                  <X size={20} />
                </button>
              </Dialog.Close>
            </div>

            <AnimatePresence mode="wait">
              {status === 'success' ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  className="flex flex-col items-center justify-center py-8 text-center"
                >
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent-primary text-text-inverse">
                    <Check size={32} />
                  </div>
                  <p className="font-display text-lg font-medium text-ink">
                    Заявка принята
                  </p>
                  <p className="mt-2 max-w-[28ch] text-text-secondary">
                    Мы свяжемся с вами в течение дня, чтобы уточнить удобное
                    время.
                  </p>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleSubmit}
                  className="space-y-5"
                >
                  <div className="grid gap-5 md:grid-cols-2">
                    <Field label="Имя">
                      <input
                        name="name"
                        required
                        type="text"
                        autoComplete="name"
                        placeholder="Анна"
                        className={inputClass}
                      />
                    </Field>
                    <Field label="Телефон">
                      <input
                        name="phone"
                        required
                        type="tel"
                        autoComplete="tel"
                        placeholder="+7 (999) 000-00-00"
                        className={inputClass}
                      />
                    </Field>
                  </div>

                  <Field label="Email">
                    <input
                      name="email"
                      type="email"
                      autoComplete="email"
                      placeholder="anna@mail.ru"
                      className={inputClass}
                    />
                  </Field>

                  <Field label="Услуга">
                    <div className="relative">
                      <select
                        name="service"
                        required
                        defaultValue=""
                        className={clsx(inputClass, 'appearance-none pr-10')}
                      >
                        <option value="" disabled>
                          Выберите услугу
                        </option>
                        {services.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                      <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-text-muted">
                        ▼
                      </span>
                    </div>
                  </Field>

                  <Field label="Сообщение">
                    <textarea
                      name="message"
                      rows={3}
                      placeholder="Расскажите, что вас беспокоит"
                      className={clsx(inputClass, 'resize-none')}
                    />
                  </Field>

                  <button
                    type="submit"
                    disabled={status === 'submitting'}
                    className="w-full rounded-radius-pill bg-ink py-3.5 text-sm font-medium text-text-inverse transition-transform hover:bg-text-primary disabled:opacity-60"
                  >
                    {status === 'submitting'
                      ? 'Отправка…'
                      : 'Отправить заявку'}
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-ink">{label}</span>
      {children}
    </label>
  )
}

const inputClass = clsx(
  'w-full rounded-radius-control border border-line bg-bg-primary px-4 py-3 text-sm text-ink',
  'placeholder:text-text-muted',
  'focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/20'
)
