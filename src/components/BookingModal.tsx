'use client'

import { useEffect, useMemo, useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { X, Check, MapPin } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLenis } from '../hooks/useLenis'
import { useBranch } from '../context/branch'
import { useClinic } from '../context/clinic'
import { formatPrice, getTimeSlots, type TimeSlot } from '../data/clinic'
import { clsx } from 'clsx'

interface BookingModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

function todayStr() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function BookingModal({ open, onOpenChange }: BookingModalProps) {
  const lenis = useLenis()
  const { branch } = useBranch()
  const { branches, doctors } = useClinic()
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle')
  const [error, setError] = useState('')
  const [slots, setSlots] = useState<TimeSlot[]>([])

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
      setBranchId(branch === 'all' ? branches[0].id : branch)
      setDoctorId('')
      setService('')
      setDate('')
      setTime('')
      setConsent(false)
      setError('')
      setSlots([])
    } else {
      lenis?.start()
    }
    return () => {
      lenis?.start()
    }
  }, [open, lenis, branch, branches])

  const branchDoctors = useMemo(
    () => doctors.filter((d) => !branchId || d.branchIds.includes(branchId)),
    [branchId, doctors]
  )
  const doctor = doctors.find((d) => d.id === doctorId)

  useEffect(() => {
    if (!doctorId || !date) {
      setSlots([])
      return
    }
    let cancelled = false
    fetch(`/api/slots?doctor=${doctorId}&date=${date}${service ? `&service=${encodeURIComponent(service)}` : ''}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((json) => {
        if (!cancelled) setSlots(json.slots ?? [])
      })
      .catch(() => {
        if (!cancelled) setSlots(getTimeSlots(doctorId, new Date(`${date}T12:00:00`)))
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
            className="fixed left-1/2 top-1/2 z-[101] max-h-[92dvh] w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-radius-card bg-surface p-6 shadow-lg md:p-10"
          >
            <div className="mb-6 flex items-start justify-between">
              <div>
                <Dialog.Title className="font-display text-2xl font-semibold text-ink md:text-3xl">
                  Записаться на приём
                </Dialog.Title>
                <Dialog.Description className="mt-1 text-sm text-text-secondary">
                  Выберите филиал, врача и удобное время.
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
                  <p className="mt-2 max-w-[32ch] text-text-secondary">
                    Администратор филиала свяжется с вами для подтверждения записи.
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
                  <Field label="Филиал">
                    <div className="grid grid-cols-3 gap-2">
                      {branches.map((b) => (
                        <button
                          key={b.id}
                          type="button"
                          onClick={() => {
                            setBranchId(b.id)
                            setDoctorId('')
                            setService('')
                            setTime('')
                          }}
                          className={clsx(
                            'cursor-pointer rounded-radius-control border px-3 py-2.5 text-left text-xs font-medium transition-colors',
                            branchId === b.id
                              ? 'border-accent-primary bg-accent-primary/10 text-ink'
                              : 'border-line bg-bg-primary text-text-secondary hover:border-accent-primary/50'
                          )}
                        >
                          <span className="mb-0.5 flex items-center gap-1 font-semibold">
                            <MapPin size={11} aria-hidden="true" className="text-accent-primary" />
                            {b.shortName}
                          </span>
                          <span className="block text-[10px] leading-tight text-text-muted">{b.address.split(', ').slice(1).join(', ')}</span>
                        </button>
                      ))}
                    </div>
                  </Field>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field label="Врач">
                      <Select
                        value={doctorId}
                        onChange={(v) => {
                          setDoctorId(v)
                          setService('')
                          setTime('')
                        }}
                        placeholder="Выберите врача"
                        required
                        options={branchDoctors.map((d) => ({ value: d.id, label: `${d.name} — ${d.role}` }))}
                      />
                    </Field>
                    <Field label="Услуга (необязательно)">
                      <Select
                        value={service}
                        onChange={setService}
                        placeholder={doctor ? 'Любая услуга' : 'Сначала выберите врача'}
                        disabled={!doctor}
                        options={(doctor?.services ?? []).map((s) => ({
                          value: s.name,
                          label: `${s.name} — ${formatPrice(s.price)}`,
                        }))}
                      />
                    </Field>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field label="Дата">
                      <input
                        name="date"
                        required
                        type="date"
                        min={todayStr()}
                        value={date}
                        disabled={!doctorId}
                        onChange={(e) => {
                          setDate(e.target.value)
                          setTime('')
                        }}
                        className={inputClass}
                      />
                    </Field>
                    <Field label="Время">
                      {date && slots.length > 0 ? (
                        <div className="grid max-h-36 grid-cols-4 gap-1.5 overflow-y-auto rounded-radius-control border border-line bg-bg-primary p-2">
                          {slots.map((s) => (
                            <button
                              key={s.time}
                              type="button"
                              disabled={!s.available}
                              onClick={() => setTime(s.time)}
                              className={clsx(
                                'cursor-pointer rounded-lg px-1 py-1.5 text-xs font-medium transition-colors',
                                time === s.time
                                  ? 'bg-accent-primary text-text-inverse'
                                  : s.available
                                    ? 'bg-surface text-ink hover:bg-accent-primary/10'
                                    : 'cursor-not-allowed text-text-muted/40 line-through'
                              )}
                            >
                              {s.time}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="flex min-h-12 items-center rounded-radius-control border border-dashed border-line bg-bg-primary px-4 text-xs text-text-muted">
                          {!doctorId ? 'Сначала выберите врача' : !date ? 'Сначала выберите дату' : 'В этот день врач не принимает'}
                        </div>
                      )}
                    </Field>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
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
                      placeholder="Расскажите, что вас беспокоит"
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
                    <p className="rounded-radius-control border border-red-300 bg-red-50 px-4 py-2.5 text-xs font-medium text-red-700">
                      {error}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={status === 'submitting' || !time}
                    className="w-full rounded-radius-pill bg-ink py-3.5 text-sm font-medium text-text-inverse transition-transform hover:bg-text-primary disabled:opacity-60"
                  >
                    {status === 'submitting'
                      ? 'Отправка…'
                      : time
                        ? `Записаться на ${date.split('-').reverse().join('.')} в ${time}`
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
      <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-text-muted">
        ▼
      </span>
    </div>
  )
}

const inputClass = clsx(
  'w-full rounded-radius-control border border-line bg-bg-primary px-4 py-3 text-sm text-ink',
  'placeholder:text-text-muted',
  'focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/20'
)
