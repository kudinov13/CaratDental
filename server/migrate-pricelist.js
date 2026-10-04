// Миграция: приводит услуги в существующей БД к актуальному прайсу
// и переименовывает клинику в «Карат Титан». Идемпотентна —
// можно запускать повторно. Запуск: node server/migrate-pricelist.js

import { DatabaseSync } from 'node:sqlite'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const db = new DatabaseSync(join(__dirname, 'karat.db'))

// Ребрендинг названия клиники у филиалов
db.prepare("UPDATE branches SET name = ? WHERE name = ?").run('Карат Титан', 'Карат')

// Правки цен/названий по новому прайсу
const fixes = [
  ["UPDATE services SET price = 6000 WHERE name = ? AND price = 8000", 'Сложное удаление резцов, клыков, первого/второго примоляра'],
  ["UPDATE services SET name = ?, price = 3500 WHERE name = ?", 'Лечение перикоронтита', 'Лечение перекоронтита'],
  ["UPDATE services SET price = 3500 WHERE name = ? AND price = 3000", 'Лечение перикоронтита'],
  ["UPDATE services SET price = 3500 WHERE name = ? AND price = 3000", 'Коагуляция десны'],
  ["UPDATE services SET price = 3500 WHERE name = ? AND price = 2500", 'Отсроченный кюретаж лунки ранее удаленного зуба'],
  ["UPDATE services SET name = ? WHERE name = ?", 'Установка ретейнера (одна челюсть)', 'Установка ретейнера:'],
  ["UPDATE services SET name = ? WHERE name = ?", 'Смена дуги на одну челюсть', 'Смена дуги на одну челюсть:'],
  ["UPDATE services SET name = ?, duration_min = 30 WHERE name = ?", 'Сдача ретенционной каппы / съемного аппарата', 'Сдача ретенционной каппы,'],
  ["UPDATE services SET name = ? WHERE name = ?", 'Активация пластинки (коррекция)', 'Активация пластинки:'],
]
for (const [sql, ...params] of fixes) db.prepare(sql).run(...params)

// Новые услуги — добавляем только если таких ещё нет у врача
const ins = db.prepare(
  `INSERT INTO services (doctor_id, name, price, duration_min)
   SELECT ?, ?, ?, ? WHERE NOT EXISTS
   (SELECT 1 FROM services WHERE doctor_id = ? AND name = ?)`
)
const add = (doctorId, name, price, durationMin) =>
  ins.run(doctorId, name, price, durationMin, doctorId, name)

// Пульпит — терапевты (постоянные зубы)
for (const doctorId of ['amonatzoda', 'irisbekov', 'rabadanov', 'suhanova']) {
  add(doctorId, 'Пульпит постоянного зуба 1к.к К040', 10000, 90)
  add(doctorId, 'Пульпит постоянного зуба 2к.к К040', 13000, 90)
  add(doctorId, 'Пульпит постоянного зуба 3к.к К040', 15500, 90)
  add(doctorId, 'Пульпит постоянного зуба 4к.к К040', 18000, 90)
}

// Ортодонтия — Коновалова
add('konovalova', 'Снятие брекет-системы (одна челюсть, ретейнер включен)', 17700, 60)
add('konovalova', 'Снятие брекет-системы (две челюсти, ретейнер включен)', 35400, 90)
add('konovalova', 'Установка ретейнера (один зуб)', 1200, 30)
add('konovalova', 'Снятие ретейнера (один зуб)', 550, 30)

console.log('Миграция прайса выполнена.')
console.log(db.prepare('SELECT id, name FROM branches').all())
console.log(`Услуг в БД: ${db.prepare('SELECT COUNT(*) AS c FROM services').get().c}`)
