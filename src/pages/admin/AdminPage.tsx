'use client'

import { useCallback, useEffect, useState } from 'react'
import { useClinic } from '../../context/clinic'
import { formatPrice } from '../../data/clinic'
import { clsx } from 'clsx'

const API = '/api/admin'
const STATUS_LABELS: Record<string, string> = {
  new: 'Новая',
  confirmed: 'Подтверждена',
  moved: 'Перенесена',
  cancelled: 'Отменена',
  done: 'Завершена',
}
const WEEKDAYS = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']

interface Booking {
  id: number
  branch_id: string
  doctor_id: string
  service: string
  date: string
  time: string
  name: string
  phone: string
  comment: string
  status: string
  created_at: string
  doctor_name?: string
  branch_name?: string
}

async function api(path: string, token: string, options: RequestInit = {}) {
  const r = await fetch(`${API}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
  })
  if (r.status === 401) throw new Error('unauthorized')
  return r.json()
}

export function AdminPage() {
  const [token, setToken] = useState(() => sessionStorage.getItem('karat-admin-token') || '')
  const [login, setLogin] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [tab, setTab] = useState('bookings')

  const doLogin = (e: React.FormEvent) => {
    e.preventDefault()
    fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ login, password }),
    })
      .then(async (r) => {
        const j = await r.json()
        if (!r.ok) throw new Error(j.error)
        sessionStorage.setItem('karat-admin-token', j.token)
        setToken(j.token)
        setError('')
      })
      .catch((err) => setError(err.message || 'Ошибка входа'))
  }

  if (!token) {
    return (
      <main className="flex min-h-[70dvh] items-center justify-center bg-bg-primary px-4 pt-[72px] lg:pt-20">
        <form onSubmit={doLogin} className="w-full max-w-sm rounded-[1.35rem] border border-line bg-surface p-7">
          <h1 className="font-display text-2xl font-semibold text-ink">Панель управления</h1>
          <p className="mt-1 text-sm text-text-secondary">Вход для администратора</p>
          <input
            value={login}
            onChange={(e) => setLogin(e.target.value)}
            placeholder="Логин"
            className="mt-5 w-full rounded-radius-control border border-line bg-bg-primary px-4 py-3 text-sm focus:border-accent-primary focus:outline-none"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Пароль"
            className="mt-3 w-full rounded-radius-control border border-line bg-bg-primary px-4 py-3 text-sm focus:border-accent-primary focus:outline-none"
          />
          {error && <p className="mt-3 text-xs font-medium text-red-600">{error}</p>}
          <button type="submit" className="mt-5 w-full cursor-pointer rounded-radius-pill bg-ink py-3 text-sm font-semibold text-text-inverse hover:bg-text-primary">
            Войти
          </button>
        </form>
      </main>
    )
  }

  const tabs = [
    ['bookings', 'Записи'],
    ['doctors', 'Врачи и цены'],
    ['branches', 'Филиалы'],
    ['schedule', 'Расписание'],
    ['stats', 'Статистика'],
    ['settings', 'Настройки'],
  ] as const

  return (
    <main id="main-content" className="bg-bg-primary pt-[72px] lg:pt-20">
      <div className="shell py-8">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-2xl font-semibold text-ink md:text-3xl">Панель управления</h1>
          <button
            type="button"
            onClick={() => { sessionStorage.removeItem('karat-admin-token'); setToken('') }}
            className="cursor-pointer text-sm text-text-muted hover:text-ink"
          >
            Выйти
          </button>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {tabs.map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={clsx(
                'cursor-pointer rounded-full border px-4 py-2 text-sm font-medium transition-colors',
                tab === id ? 'border-accent-primary bg-accent-primary text-text-inverse' : 'border-line bg-surface text-text-secondary hover:border-accent-primary/50'
              )}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="mt-6">
          {tab === 'bookings' && <BookingsTab token={token} />}
          {tab === 'doctors' && <DoctorsTab token={token} />}
          {tab === 'branches' && <BranchesTab token={token} />}
          {tab === 'schedule' && <ScheduleTab token={token} />}
          {tab === 'stats' && <StatsTab token={token} />}
          {tab === 'settings' && <SettingsTab token={token} />}
        </div>
      </div>
    </main>
  )
}

/* ---------- Записи ---------- */

function BookingsTab({ token }: { token: string }) {
  const { doctors, branches } = useClinic()
  const [list, setList] = useState<Booking[]>([])
  const [filters, setFilters] = useState({ date: '', doctor: '', branch: '', status: '' })

  const load = useCallback(() => {
    const q = new URLSearchParams(Object.entries(filters).filter(([, v]) => v) as [string, string][])
    api(`/bookings?${q}`, token).then((j) => setList(j.bookings ?? [])).catch(() => {})
  }, [token, filters])

  useEffect(load, [load])

  const setStatus = (id: number, status: string) =>
    api(`/bookings/${id}`, token, { method: 'PATCH', body: JSON.stringify({ status }) }).then(load)

  const exportCsv = () => {
    const rows = [
      ['Дата', 'Время', 'Пациент', 'Телефон', 'Врач', 'Филиал', 'Услуга', 'Статус'],
      ...list.map((b) => [b.date, b.time, b.name, b.phone, b.doctor_name ?? '', b.branch_name ?? '', b.service, STATUS_LABELS[b.status] ?? b.status]),
    ]
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(';')).join('\n')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([`﻿${csv}`], { type: 'text/csv' }))
    a.download = `zapisi-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <input type="date" value={filters.date} onChange={(e) => setFilters({ ...filters, date: e.target.value })} className={miniInput} />
        <select value={filters.doctor} onChange={(e) => setFilters({ ...filters, doctor: e.target.value })} className={miniInput}>
          <option value="">Все врачи</option>
          {doctors.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
        <select value={filters.branch} onChange={(e) => setFilters({ ...filters, branch: e.target.value })} className={miniInput}>
          <option value="">Все филиалы</option>
          {branches.map((b) => <option key={b.id} value={b.id}>{b.shortName}</option>)}
        </select>
        <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })} className={miniInput}>
          <option value="">Все статусы</option>
          {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <button type="button" onClick={exportCsv} className="cursor-pointer rounded-radius-control border border-line px-3 py-2 text-xs font-semibold text-ink hover:bg-bg-secondary">
          Выгрузить CSV
        </button>
      </div>

      <div className="mt-4 overflow-x-auto rounded-[1.15rem] border border-line bg-surface">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead>
            <tr className="border-b border-line text-xs text-text-muted">
              <th className="px-4 py-3">Дата</th>
              <th className="px-4 py-3">Пациент</th>
              <th className="px-4 py-3">Врач</th>
              <th className="px-4 py-3">Филиал</th>
              <th className="px-4 py-3">Услуга</th>
              <th className="px-4 py-3">Статус</th>
            </tr>
          </thead>
          <tbody>
            {list.map((b) => (
              <tr key={b.id} className="border-b border-line last:border-0">
                <td className="px-4 py-3 whitespace-nowrap">{b.date.split('-').reverse().join('.')} {b.time}</td>
                <td className="px-4 py-3">
                  <strong className="block">{b.name}</strong>
                  <span className="text-xs text-text-muted">{b.phone}</span>
                </td>
                <td className="px-4 py-3">{b.doctor_name}</td>
                <td className="px-4 py-3">{b.branch_name}</td>
                <td className="px-4 py-3 text-xs">{b.service || '—'}</td>
                <td className="px-4 py-3">
                  <select
                    value={b.status}
                    onChange={(e) => setStatus(b.id, e.target.value)}
                    className="cursor-pointer rounded-lg border border-line bg-bg-primary px-2 py-1.5 text-xs"
                  >
                    {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </td>
              </tr>
            ))}
            {list.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-text-muted">Записей пока нет</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/* ---------- Врачи и цены ---------- */

function DoctorsTab({ token }: { token: string }) {
  const { doctors, branches } = useClinic()
  const [edit, setEdit] = useState<any | null>(null)

  const save = () => {
    const method = edit.id?.startsWith('d') && doctors.some((d) => d.id === edit.id) ? 'PUT' : 'POST'
    const url = method === 'PUT' ? `/doctors/${edit.id}` : '/doctors'
    api(url, token, { method, body: JSON.stringify(edit) }).then(() => { setEdit(null); location.reload() })
  }

  const remove = (id: string) => {
    if (!confirm('Удалить врача и его прайс?')) return
    api(`/doctors/${id}`, token, { method: 'DELETE' }).then(() => location.reload())
  }

  return (
    <div>
      <div className="grid gap-4 md:grid-cols-2">
        {doctors.map((d) => (
          <div key={d.id} className="rounded-[1.15rem] border border-line bg-surface p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <strong className="font-display text-ink">{d.name}</strong>
                <span className="block text-xs text-text-secondary">{d.role}</span>
                <span className="mt-1 block text-[11px] text-text-muted">
                  {d.branchIds.map((id) => branches.find((b) => b.id === id)?.shortName).join(' · ')}
                </span>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => setEdit({ ...d })} className="cursor-pointer rounded-lg border border-line px-3 py-1.5 text-xs font-medium hover:bg-bg-secondary">Изменить</button>
                <button type="button" onClick={() => remove(d.id)} className="cursor-pointer rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50">Удалить</button>
              </div>
            </div>
            <ul className="mt-3 space-y-1.5 text-xs">
              {d.services.map((s) => (
                <li key={s.name} className="flex justify-between"><span>{s.name}</span><b>{formatPrice(s.price)}</b></li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => setEdit({ name: '', role: '', photo: '', imgClass: '', chief: false, branchIds: [], services: [] })}
        className="mt-4 cursor-pointer rounded-radius-control bg-accent-primary px-5 py-2.5 text-sm font-semibold text-text-inverse hover:bg-accent-primary-700"
      >
        + Добавить врача
      </button>

      {edit && (
        <div className="fixed inset-0 z-[95] flex items-center justify-center bg-ink/30 p-4 backdrop-blur-sm" onClick={() => setEdit(null)}>
          <div className="max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-[1.35rem] bg-surface p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-display text-xl font-semibold text-ink">{doctors.some((d) => d.id === edit.id) ? 'Редактировать врача' : 'Новый врач'}</h3>

            <div className="mt-4 space-y-3">
              <input value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} placeholder="ФИО" className={miniInput + ' w-full'} />
              <input value={edit.role} onChange={(e) => setEdit({ ...edit, role: e.target.value })} placeholder="Специализация" className={miniInput + ' w-full'} />
              <input value={edit.photo} onChange={(e) => setEdit({ ...edit, photo: e.target.value })} placeholder="Фото (/images/doctors/...)" className={miniInput + ' w-full'} />
              <input value={edit.sqnsEmployeeId ?? ''} onChange={(e) => setEdit({ ...edit, sqnsEmployeeId: e.target.value })} placeholder="ID врача в SQNS (employeeId)" className={miniInput + ' w-full'} />
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!!edit.chief} onChange={(e) => setEdit({ ...edit, chief: e.target.checked })} className="accent-accent-primary" /> Главный врач</label>

              <div>
                <span className="mb-1.5 block text-xs font-semibold text-text-secondary">Филиалы</span>
                <div className="flex flex-wrap gap-2">
                  {branches.map((b) => (
                    <label key={b.id} className="flex items-center gap-1.5 rounded-lg border border-line px-2.5 py-1.5 text-xs">
                      <input
                        type="checkbox"
                        checked={edit.branchIds.includes(b.id)}
                        onChange={(e) => setEdit({ ...edit, branchIds: e.target.checked ? [...edit.branchIds, b.id] : edit.branchIds.filter((x: string) => x !== b.id) })}
                        className="accent-accent-primary"
                      />
                      {b.shortName}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <span className="mb-1.5 block text-xs font-semibold text-text-secondary">Услуги и цены</span>
                {edit.services.map((s: any, i: number) => (
                  <div key={i} className="mb-2 flex gap-2">
                    <input value={s.name} onChange={(e) => { const ss = [...edit.services]; ss[i] = { ...s, name: e.target.value }; setEdit({ ...edit, services: ss }) }} placeholder="Услуга" className={miniInput + ' flex-1'} />
                    <input value={s.price} type="number" onChange={(e) => { const ss = [...edit.services]; ss[i] = { ...s, price: Number(e.target.value) }; setEdit({ ...edit, services: ss }) }} placeholder="₽" className={miniInput + ' w-20'} />
                    <input value={s.durationMin} type="number" onChange={(e) => { const ss = [...edit.services]; ss[i] = { ...s, durationMin: Number(e.target.value) }; setEdit({ ...edit, services: ss }) }} placeholder="мин" className={miniInput + ' w-16'} />
                    <input value={s.sqnsServiceId ?? ''} onChange={(e) => { const ss = [...edit.services]; ss[i] = { ...s, sqnsServiceId: e.target.value || undefined }; setEdit({ ...edit, services: ss }) }} placeholder="SQNS id" className={miniInput + ' w-20'} />
                  </div>
                ))}
                <button type="button" onClick={() => setEdit({ ...edit, services: [...edit.services, { name: '', price: 0, durationMin: 30 }] })} className="cursor-pointer text-xs font-semibold text-accent-primary hover:underline">
                  + Услуга
                </button>
              </div>
            </div>

            <div className="mt-5 flex gap-2">
              <button type="button" onClick={save} className="flex-1 cursor-pointer rounded-radius-control bg-accent-primary py-2.5 text-sm font-semibold text-text-inverse">Сохранить</button>
              <button type="button" onClick={() => setEdit(null)} className="flex-1 cursor-pointer rounded-radius-control border border-line py-2.5 text-sm font-semibold text-ink">Отмена</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ---------- Филиалы ---------- */

function BranchesTab({ token }: { token: string }) {
  const { branches } = useClinic()
  const [edit, setEdit] = useState<any | null>(null)

  const save = () => {
    const exists = branches.some((b) => b.id === edit.id)
    api(exists ? `/branches/${edit.id}` : '/branches', token, {
      method: exists ? 'PUT' : 'POST',
      body: JSON.stringify(edit),
    }).then(() => { setEdit(null); location.reload() })
  }

  const remove = (id: string) => {
    if (!confirm('Удалить филиал?')) return
    api(`/branches/${id}`, token, { method: 'DELETE' }).then(() => location.reload())
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {branches.map((b) => (
        <div key={b.id} className="rounded-[1.15rem] border border-line bg-surface p-5">
          <strong className="font-display text-ink">{b.name}</strong>
          <p className="mt-1 text-xs text-text-secondary">{b.address}</p>
          <p className="mt-1 text-xs text-text-muted">{b.phone} · {b.hours}</p>
          <div className="mt-3 flex gap-2">
            <button type="button" onClick={() => setEdit({ ...b })} className="cursor-pointer rounded-lg border border-line px-3 py-1.5 text-xs font-medium hover:bg-bg-secondary">Изменить</button>
            <button type="button" onClick={() => remove(b.id)} className="cursor-pointer rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50">Удалить</button>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={() => setEdit({ name: '', shortName: '', address: '', phone: '', hours: '', mapUrl: '' })}
        className="cursor-pointer rounded-[1.15rem] border border-dashed border-line p-5 text-sm font-semibold text-text-muted hover:border-accent-primary hover:text-ink"
      >
        + Добавить филиал
      </button>

      {edit && (
        <div className="fixed inset-0 z-[95] flex items-center justify-center bg-ink/30 p-4 backdrop-blur-sm" onClick={() => setEdit(null)}>
          <div className="w-full max-w-md rounded-[1.35rem] bg-surface p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-display text-xl font-semibold text-ink">Филиал</h3>
            <div className="mt-4 space-y-3">
              {(['name', 'shortName', 'address', 'phone', 'hours', 'mapUrl'] as const).map((f) => (
                <input
                  key={f}
                  value={edit[f] ?? ''}
                  onChange={(e) => setEdit({ ...edit, [f]: e.target.value })}
                  placeholder={{ name: 'Название', shortName: 'Короткое (7а мкр.)', address: 'Адрес', phone: 'Телефон', hours: 'Часы работы', mapUrl: 'Ссылка на карту' }[f]}
                  className={miniInput + ' w-full'}
                />
              ))}
            </div>
            <div className="mt-5 flex gap-2">
              <button type="button" onClick={save} className="flex-1 cursor-pointer rounded-radius-control bg-accent-primary py-2.5 text-sm font-semibold text-text-inverse">Сохранить</button>
              <button type="button" onClick={() => setEdit(null)} className="flex-1 cursor-pointer rounded-radius-control border border-line py-2.5 text-sm font-semibold text-ink">Отмена</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ---------- Расписание ---------- */

function ScheduleTab({ token }: { token: string }) {
  const { doctors } = useClinic()
  const [doctorId, setDoctorId] = useState('')
  const [rows, setRows] = useState<Record<number, { start: string; end: string; off: boolean }>>({})
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!doctorId && doctors.length) setDoctorId(doctors[0].id)
  }, [doctors, doctorId])

  useEffect(() => {
    if (!doctorId) return
    api('/schedules', token).then((j) => {
      const mine = (j.schedules ?? []).filter((s: any) => s.doctor_id === doctorId)
      const map: Record<number, { start: string; end: string; off: boolean }> = {}
      for (let d = 0; d < 7; d++) {
        const s = mine.find((x: any) => x.weekday === d)
        map[d] = s
          ? { start: toTime(s.start_min), end: toTime(s.end_min), off: !!s.off }
          : { start: '09:00', end: '19:00', off: true }
      }
      setRows(map)
    })
  }, [doctorId, token])

  const toTime = (min: number) => `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`
  const toMin = (t: string) => { const [h, m] = t.split(':').map(Number); return h * 60 + m }

  const save = async () => {
    for (let d = 0; d < 7; d++) {
      const r = rows[d]
      await api('/schedules', token, {
        method: 'PUT',
        body: JSON.stringify({ doctorId, weekday: d, startMin: toMin(r.start), endMin: toMin(r.end), off: r.off }),
      })
    }
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="max-w-lg">
      <select value={doctorId} onChange={(e) => setDoctorId(e.target.value)} className={miniInput + ' w-full'}>
        {doctors.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
      </select>

      <div className="mt-4 space-y-2">
        {[1, 2, 3, 4, 5, 6, 0].map((d) => (
          <div key={d} className="flex items-center gap-3 rounded-xl border border-line bg-surface px-4 py-2.5">
            <span className="w-8 text-sm font-semibold text-ink">{WEEKDAYS[d]}</span>
            <label className="flex items-center gap-1.5 text-xs text-text-muted">
              <input type="checkbox" checked={!rows[d]?.off} onChange={(e) => setRows({ ...rows, [d]: { ...rows[d], off: !e.target.checked } })} className="accent-accent-primary" />
              работает
            </label>
            <input type="time" value={rows[d]?.start ?? '09:00'} disabled={rows[d]?.off} onChange={(e) => setRows({ ...rows, [d]: { ...rows[d], start: e.target.value } })} className={miniInput + ' disabled:opacity-40'} />
            <span className="text-text-muted">—</span>
            <input type="time" value={rows[d]?.end ?? '19:00'} disabled={rows[d]?.off} onChange={(e) => setRows({ ...rows, [d]: { ...rows[d], end: e.target.value } })} className={miniInput + ' disabled:opacity-40'} />
          </div>
        ))}
      </div>

      <button type="button" onClick={save} className="mt-4 cursor-pointer rounded-radius-control bg-accent-primary px-5 py-2.5 text-sm font-semibold text-text-inverse">
        {saved ? 'Сохранено ✓' : 'Сохранить расписание'}
      </button>
    </div>
  )
}

/* ---------- Статистика ---------- */

function StatsTab({ token }: { token: string }) {
  const [stats, setStats] = useState<any>(null)

  useEffect(() => {
    api('/stats', token).then(setStats).catch(() => {})
  }, [token])

  if (!stats) return <p className="text-sm text-text-muted">Загрузка…</p>

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard title="Всего записей" value={stats.total} />
      {stats.byStatus?.map((s: any) => (
        <StatCard key={s.status} title={STATUS_LABELS[s.status] ?? s.status} value={s.c} />
      ))}
      <div className="rounded-[1.15rem] border border-line bg-surface p-5 sm:col-span-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">По врачам</span>
        <ul className="mt-2 space-y-1 text-sm">
          {stats.byDoctor?.map((d: any, i: number) => <li key={i} className="flex justify-between"><span>{d.name || '—'}</span><b>{d.c}</b></li>)}
        </ul>
      </div>
      <div className="rounded-[1.15rem] border border-line bg-surface p-5 sm:col-span-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">По филиалам</span>
        <ul className="mt-2 space-y-1 text-sm">
          {stats.byBranch?.map((b: any, i: number) => <li key={i} className="flex justify-between"><span>{b.name || '—'}</span><b>{b.c}</b></li>)}
        </ul>
      </div>
    </div>
  )
}

function StatCard({ title, value }: { title: string; value: number }) {
  return (
    <div className="rounded-[1.15rem] border border-line bg-surface p-5">
      <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">{title}</span>
      <p className="mt-2 font-display text-3xl font-semibold text-ink">{value}</p>
    </div>
  )
}

/* ---------- Настройки ---------- */

function SettingsTab({ token }: { token: string }) {
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    api('/settings', token).then((j) => {
      const map: Record<string, string> = {}
      for (const s of j.settings ?? []) map[s.key] = s.value
      setSettings(map)
    })
  }, [token])

  const save = () => {
    api('/settings', token, { method: 'PUT', body: JSON.stringify(settings) }).then(() => {
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    })
  }

  return (
    <div className="max-w-md space-y-4">
      <label className="block">
        <span className="mb-1.5 block text-xs font-semibold text-text-secondary">Минимальное время до записи (часов)</span>
        <input type="number" value={settings.min_lead_hours ?? '2'} onChange={(e) => setSettings({ ...settings, min_lead_hours: e.target.value })} className={miniInput + ' w-full'} />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-xs font-semibold text-text-secondary">Длительность слота (минут)</span>
        <input type="number" value={settings.slot_minutes ?? '30'} onChange={(e) => setSettings({ ...settings, slot_minutes: e.target.value })} className={miniInput + ' w-full'} />
      </label>
      <button type="button" onClick={save} className="cursor-pointer rounded-radius-control bg-accent-primary px-5 py-2.5 text-sm font-semibold text-text-inverse">
        {saved ? 'Сохранено ✓' : 'Сохранить'}
      </button>
    </div>
  )
}

const miniInput = 'rounded-radius-control border border-line bg-bg-primary px-3 py-2 text-sm text-ink focus:border-accent-primary focus:outline-none'
