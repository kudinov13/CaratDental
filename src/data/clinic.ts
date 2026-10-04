export interface Branch {
  id: string
  name: string
  shortName: string
  address: string
  phone: string
  hours: string
  mapUrl: string
}

export interface DoctorService {
  name: string
  price: number
  durationMin: number
}

export interface Doctor {
  id: string
  name: string
  role: string
  photo: string
  imgClass?: string
  chief?: boolean
  branchIds: string[]
  services: DoctorService[]
}

export const branches: Branch[] = [
  {
    id: 'm7a',
    name: 'Карат',
    shortName: '7а мкр.',
    address: 'Тобольск, мкр. 7а, д. 7а, 1 этаж',
    phone: '+7 (912) 388-78-12',
    hours: '9:00–21:00, по предварительной записи',
    mapUrl: 'https://2gis.ru/tobolsk/geo/70000001046770706',
  },
  {
    id: 'm15',
    name: 'Карат',
    shortName: '15-й мкр. (детская)',
    address: 'Тобольск, 15-й мкр., д. 18',
    phone: '+7 (922) 268-80-09',
    hours: '9:00–21:00, по предварительной записи',
    mapUrl: 'https://2gis.ru/tobolsk/geo/70000001110932596',
  },
]

export { doctors } from './doctors'

// --- Расписание (заглушка до интеграции с МИС SQNS) ---

export const WORK_START_HOUR = 9
export const WORK_END_HOUR = 19
export const SLOT_MINUTES = 30
export const MIN_LEAD_HOURS = 2

function hashCode(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) | 0
  }
  return Math.abs(hash)
}

/** Врач работает в этот день недели (заглушка: Пн–Сб, вс — выходной) */
export function isWorkingDay(doctorId: string, date: Date): boolean {
  const day = date.getDay()
  if (day === 0) return false
  // Чередуем субботы у врачей, чтобы было реалистично
  if (day === 6 && hashCode(doctorId) % 3 === 0) return false
  return true
}

export interface TimeSlot {
  time: string
  available: boolean
}

/** Слоты на дату. Занятые — детерминированная заглушка, позже заменится на SQNS API */
export function getTimeSlots(doctorId: string, date: Date): TimeSlot[] {
  if (!isWorkingDay(doctorId, date)) return []

  const slots: TimeSlot[] = []
  const now = new Date()
  const isToday = date.toDateString() === now.toDateString()
  const minMinutes = now.getHours() * 60 + now.getMinutes() + MIN_LEAD_HOURS * 60
  const dayHash = hashCode(`${doctorId}:${date.toDateString()}`)

  for (let m = WORK_START_HOUR * 60; m < WORK_END_HOUR * 60; m += SLOT_MINUTES) {
    const h = Math.floor(m / 60)
    const min = m % 60
    const time = `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`

    if (isToday && m < minMinutes) {
      slots.push({ time, available: false })
      continue
    }

    // Псевдо-занятость ~30% слотов (заглушка до SQNS)
    const occupied = hashCode(`${dayHash}:${time}`) % 10 < 3
    slots.push({ time, available: !occupied })
  }
  return slots
}

export function formatPrice(price: number): string {
  return price === 0 ? '0 ₽' : `${price.toLocaleString('ru-RU')} ₽`
}
