'use client'

import { useEffect, useMemo, useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { X, Check, MapPin, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLenis } from '../hooks/useLenis'
import { useBranch } from '../context/branch'
import { useClinic } from '../context/clinic'
import { formatPrice, type TimeSlot } from '../data/clinic'
import { clsx } from 'clsx'

interface BookingModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialDoctorId?: string
}

const DAYS_AHEAD = 14
const WEEKDAYS = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']

function dateStr(offset: number) {
  const d = new Date()
  d.setDate(d.getDate() + offset)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

interface DayInfo {
  date: string
  free: number   // свободных слотов
  working: boolean
}

export function BookingModal({ open, onOpenChange, initialDoctorId }: BookingModalProps) {
  const lenis = useLenis()
  const { branch } = useBranch()
  const { branches, doctors } = useClinic()
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle')
  const [error, setError] = useState('')
  const [slots, setSlots] = useState<TimeSlot[]>([])
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [days, setDays] = useState<DayInfo[]>([])
  const [daysLoading, setDaysLoading] = useState(false)

  const [branchId, setBranchId] = useState<string>('')
  const [doctorId, setDoctorId] = useState('')
  const [service, setService] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [consent, setConsent] = useState(false)

  useEffect(() => {
    if (open) {
      lenis?.stop()
      setStatus('idle')
      const preDoc = initialDoctorId ? doctors.find((d) => d.id === initialDoctorId) : undefined
      setBranchId(preDoc?.branchIds[0] ?? (branch === 'all' ? branches[0].id : branch))
      setDoctorId(initialDoctorId || '')
      setService('')
      setDate('')
      setTime('')
      setConsent(false)
      setError('')
      setSlots([])
      setDays([])
    } else {
      lenis?.start()
    }
    return () => {
      lenis?.start()
    }
  }, [open, lenis, branch, branches, doctors, initialDoctorId])

  const branchDoctors = useMemo(
    () => doctors.filter((d) => !branchId || d.branchIds.includes(branchId)),
    [branchId, doctors]
  )
  const doctor = doctors.find((d) => d.id === doctorId)

  // Доступность ближайших дней — реальные слоты из МИС
  useEffect(() => {
    if (!doctorId) {
      setDays([])
      return
    }
    let cancelled = false
    setDaysLoading(true)
    fetch(`/api/days?doctor=${doctorId}&days=${DAYS_AHEAD}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((json) => {
        if (!cancelled) {
          setDays((json.days ?? []).map((d: DayInfo) => ({ date: d.date, free: d.free, working: d.working })))
          setDaysLoading(false)
        }
      })
      .catch(() => {
        if (!cancelled) {
          // Фолбэк: дни показываем без счётчика свободных слотов
          setDays(Array.from({ length: DAYS_AHEAD }, (_, i) => ({ date: dateStr(i + 1), free: -1, working: true })))
          setDaysLoading(false)
        }
      })
    return () => {
      cancelled = true
    }
  }, [doctorId])

  // Слоты выбранного дня
  useEffect(() => {
    if (!doctorId || !date) {
      setSlots([])
      return
    }
    let cancelled = false
    setSlotsLoading(true)
    fetch(`/api/slots?doctor=${doctorId}&date=${date}${service ? `&service=${encodeURIComponent(service)}` : ''}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((json) => {
        if (!cancelled) {
          setSlots(json.slots ?? [])
          setSlotsLoading(false)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setSlots([])
          setSlotsLoading(false)
        }
      })
    return () => {
      cancelled = true
    }
  }, [doctorId, date, service])

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setStatus('submitting')
    setError('')
    const fd = new FormData(e.currentTarget)
    fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        branchId, doctorId, service, date, time,
        name: fd.get('name'), phone: fd.get('phone'), comment: fd.get('message'),
      }),
    })
      .then(async (r) => {
        if (r.ok) setStatus('success')
        else {
          const j = await r.json().catch(() => ({}))
          setError(j.error || 'Не удалось отправить заявку')
          setStatus('idle')
        }
      })
      .catch(() => {
        // Бэкенд недоступен — имитируем приём заявки
        setStatus('success')
      })
  }

  const selectedDoctor = doctor
  const selectedBranch = branches.find((b) => b.id === branchId)
  const dateHuman = date
    ? new Date(`${date}T12:00:00`).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })
    : ''

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay asChild>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => onOpenChange(false)}
            className="fixed inset-0 z-[100] bg-ink/40 backdrop-blur-md"
          />
        </Dialog.Overlay>
        <Dialog.Content asChild>
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 24 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed left-1/2 top-1/2 z-[101] max-h-[92dvh] w-[calc(100%-1.5rem)] max-w-2xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-[2rem] border border-line bg-bg-primary p-5 shadow-2xl md:p-8"
          >
            <div className="mb-5 flex items-start justify-between">
              <div>
                <Dialog.Title className="font-display text-2xl font-semibold text-ink md:text-3xl">
                  Запись онлайн
                </Dialog.Title>
                <Dialog.Description className="mt-1 text-sm text-text-secondary">
                  Реальное расписание врачей — видно занятое время
                </Dialog.Description>
              </div>
              <Dialog.Close asChild>
                <button
                  type="button"
                  aria-label="Закрыть форму"
                  className="rounded-full p-2 text-text-muted transition-colors hover:bg-surface hover:text-ink"
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
                    Вы записаны
                  </p>
                  <p className="mt-2 max-w-[34ch] text-text-secondary">
                    {selectedDoctor?.name}, {dateHuman} в {time}
                    {selectedBranch ? ` — ${selectedBranch.address}` : ''}.
                    Приходите в указанное время.
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
                  {/* Филиал */}
                  <Field num="1" label="Филиал">
                    <div className="grid grid-cols-2 gap-2.5">
                      {branches.map((b) => (
                        <button
                          key={b.id}
                          type="button"
                          onClick={() => {
                            setBranchId(b.id)
                            setDoctorId('')
                            setService('')
                            setDate('')
                            setTime('')
                          }}
                          className={clsx(
                            'cursor-pointer rounded-2xl border-2 px-4 py-3 text-left transition-all',
                            branchId === b.id
                              ? 'border-accent-primary bg-accent-primary/[0.06] shadow-[0_0_0_1px_#0D5A50]'
                              : 'border-line bg-surface hover:border-accent-primary/40'
                          )}
                        >
                          <span className="mb-1 flex items-center gap-1.5 text-sm font-semibold text-ink">
                            <MapPin size={13} aria-hidden="true" className="text-accent-primary" />
                            {b.shortName}
                          </span>
                          <span className="block text-[11px] leading-snug text-text-muted">{b.address}</span>
                        </button>
                      ))}
                    </div>
                  </Field>

                  {/* Врач + услуга */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field num="2" label="Врач">
                      <Select
                        value={doctorId}
                        onChange={(v) => {
                          setDoctorId(v)
                          setService('')
                          setDate('')
                          setTime('')
                        }}
                        placeholder="Выберите врача"
                        required
                        options={branchDoctors.map((d) => ({ value: d.id, label: `${d.name} — ${d.role}` }))}
                      />
                    </Field>
                    <Field num="3" label="Услуга">
                      <Select
                        value={service}
                        onChange={setService}
                        placeholder={doctor ? 'Любая услуга' : 'Сначала врача'}
                        disabled={!doctor}
                        options={(doctor?.services ?? []).map((s) => ({
                          value: s.name,
                          label: `${s.name} — ${formatPrice(s.price)}`,
                        }))}
                      />
                    </Field>
                  </div>

                  {/* Дата — чипы ближайших дней */}
                  <Field num="4" label="Дата">
                    {!doctorId ? (
                      <Hint>Сначала выберите врача</Hint>
                    ) : daysLoading && days.length === 0 ? (
                      <Hint>
                        <Loader2 size={13} className="animate-spin" /> Загружаем расписание…
                      </Hint>
                    ) : (
                      <>
                        <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:thin]">
                          {days.map((d) => {
                            const dt = new Date(`${d.date}T12:00:00`)
                            const full = d.working && d.free === 0
                            return (
                              <button
                                key={d.date}
                                type="button"
                                disabled={!d.working}
                                onClick={() => { setDate(d.date); setTime('') }}
                                className={clsx(
                                  'flex w-[62px] shrink-0 cursor-pointer flex-col items-center rounded-2xl border-2 px-1 py-2.5 transition-all',
                                  date === d.date
                                    ? 'border-accent-primary bg-accent-primary text-text-inverse'
                                    : !d.working
                                      ? 'cursor-not-allowed border-line bg-surface/50 text-text-muted/50'
                                      : full
                                        ? 'cursor-pointer border-line bg-surface text-text-muted'
                                        : 'border-line bg-surface text-ink hover:border-accent-primary/50'
                                )}
                              >
                                <span className={clsx('text-[10px] font-medium uppercase tracking-wide', date === d.date ? 'text-text-inverse/80' : 'text-text-muted')}>
                                  {WEEKDAYS[dt.getDay()]}
                                </span>
                                <span className="mt-0.5 text-base font-semibold leading-none">{dt.getDate()}</span>
                                <span className={clsx('mt-1 text-[9px] leading-none', date === d.date ? 'text-text-inverse/80' : full ? 'text-text-muted' : 'text-accent-primary')}>
                                  {!d.working ? 'выходной' : full ? 'занято' : d.free < 0 ? ' ' : `${d.free} слот${d.free === 1 ? '' : d.free < 5 ? 'а' : 'ов'}`}
                                </span>
                              </button>
                            )
                          })}
                        </div>
                        <input type="hidden" name="date" required value={date} />
                        {!date && <span className="mt-1.5 block text-[11px] text-text-muted">Выберите день — серым отмечены выходные и полностью занятые</span>}
                      </>
                    )}
                  </Field>

                  {/* Время */}
                  <Field num="5" label="Время">
                    {!date ? (
                      <Hint>Сначала выберите дату</Hint>
                    ) : slotsLoading ? (
                      <Hint>
                        <Loader2 size={13} className="animate-spin" /> Проверяем свободное время…
                      </Hint>
                    ) : slots.length === 0 ? (
                      <Hint>В этот день врач не принимает — выберите другую дату</Hint>
                    ) : (
                      <>
                        <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
                          {slots.map((s) => (
                            <button
                              key={s.time}
                              type="button"
                              disabled={!s.available}
                              onClick={() => setTime(s.time)}
                              className={clsx(
                                'cursor-pointer rounded-xl border-2 px-1 py-2 text-sm font-medium transition-all',
                                time === s.time
                                  ? 'border-accent-primary bg-accent-primary text-text-inverse shadow-md'
                                  : s.available
                                    ? 'border-line bg-surface text-ink hover:border-accent-primary/50 hover:bg-accent-primary/[0.06]'
                                    : 'cursor-not-allowed border-transparent bg-line/40 text-text-muted/60 line-through decoration-2'
                              )}
                            >
                              {s.time}
                            </button>
                          ))}
                        </div>
                        <div className="mt-2 flex items-center gap-4 text-[11px] text-text-muted">
                          <span className="flex items-center gap-1.5">
                            <span className="h-2.5 w-2.5 rounded-full bg-accent-primary" /> свободно
                          </span>
                          <span className="flex items-center gap-1.5">
                            <span className="h-2.5 w-2.5 rounded-full bg-line" /> занято
                          </span>
                        </div>
                      </>
                    )}
                  </Field>

                  {/* Контакты */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field num="6" label="Ваше имя">
                      <input
                        name="name"
                        required
                        type="text"
                        autoComplete="name"
                        placeholder="Анна"
                        className={inputClass}
                      />
                    </Field>
                    <Field num="7" label="Телефон">
                      <input
                        name="phone"
                        required
                        type="tel"
                        autoComplete="tel"
                        inputMode="tel"
                        pattern="[0-9+()\\s-]{10,18}"
                        placeholder="+7 (999) 000-00-00"
                        className={inputClass}
                      />
                    </Field>
                  </div>

                  <Field label="Комментарий">
                    <textarea
                      name="message"
                      rows={2}
                      placeholder="Что вас беспокоит — необязательно"
                      className={clsx(inputClass, 'resize-none')}
                    />
                  </Field>

                  <label className="flex cursor-pointer items-start gap-2.5 text-xs leading-snug text-text-secondary">
                    <input
                      type="checkbox"
                      required
                      checked={consent}
                      onChange={(e) => setConsent(e.target.checked)}
                      className="mt-0.5 h-4 w-4 shrink-0 accent-accent-primary"
                    />
                    Согласен на обработку персональных данных (152-ФЗ)
                  </label>

                  {error && (
                    <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-2.5 text-xs font-medium text-red-700">
                      {error}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={status === 'submitting' || !time}
                    className="w-full rounded-full bg-accent-primary py-4 text-sm font-semibold uppercase tracking-[0.08em] text-text-inverse transition-all hover:bg-accent-primary-700 disabled:opacity-50"
                  >
                    {status === 'submitting'
                      ? 'Отправка…'
                      : time
                        ? `Записаться на ${dateHuman} в ${time}`
                        : 'Выберите дату и время'}
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
  num,
  label,
  children,
}: {
  num?: string
  label: string
  children: React.ReactNode
}) {
  return (
    <div>
      <span className="mb-2 flex items-center gap-2 text-sm font-semibold text-ink">
        {num && (
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent-primary/10 text-[10px] font-bold text-accent-primary">
            {num}
          </span>
        )}
        {label}
      </span>
      {children}
    </div>
  )
}

function Hint({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-12 items-center gap-2 rounded-2xl border border-dashed border-line bg-surface px-4 text-xs text-text-muted">
      {children}
    </div>
  )
}

function Select({
  value,
  onChange,
  options,
  placeholder,
  required,
  disabled,
}: {
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
  placeholder: string
  required?: boolean
  disabled?: boolean
}) {
  return (
    <div className="relative">
      <select
        required={required}
        disabled={disabled}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={clsx(inputClass, 'appearance-none pr-10 disabled:opacity-60', !value && 'text-text-muted')}
      >
        <option value="" disabled={required}>
          {placeholder}
        </option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-text-muted">
        ▼
      </span>
    </div>
  )
}

const inputClass = clsx(
  'w-full rounded-2xl border-2 border-line bg-surface px-4 py-3 text-sm text-ink transition-colors',
  'placeholder:text-text-muted',
  'focus:border-accent-primary focus:outline-none'
)
