export interface ClinicCase {
  before: string
  after: string
  title: string
  description: string
}

export const clinicCases: ClinicCase[] = [
  { before: '/images/cases/case-1-before.webp', after: '/images/cases/case-1-after.webp', title: 'Отбеливание зубов', description: 'Профессиональное отбеливание, результат за один визит' },
  { before: '/images/cases/case-2-before.webp', after: '/images/cases/case-2-after.webp', title: 'Эстетические виниры', description: 'Установка керамических виниров на передние зубы' },
  { before: '/images/cases/case-3-before.webp', after: '/images/cases/case-3-after.webp', title: 'Исправление прикуса', description: 'Ортодонтическое лечение, срок 14 месяцев' },
]
