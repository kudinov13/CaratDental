import { DatabaseSync } from 'node:sqlite'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const db = new DatabaseSync(join(__dirname, 'karat.db'))

// 1. Филиалы по ответам админа:
//    Ырысбеков → 15-й мкр., Амонатзода → 7а мкр.
db.prepare("UPDATE doctor_branches SET branch_id = 'm15' WHERE doctor_id = 'irisbekov' AND branch_id = 'm7a'").run()
db.prepare("UPDATE doctor_branches SET branch_id = 'm7a' WHERE doctor_id = 'amonatzoda' AND branch_id = 'm15'").run()

// 2. Новый врач: Мельгазиев Муса Курманалиевич, имплантолог, 15-й мкр.
if (!db.prepare("SELECT id FROM doctors WHERE id = 'melgaziev'").get()) {
  db.prepare('INSERT INTO doctors (id, name, role, photo, img_class, chief) VALUES (?,?,?,?,?,?)')
    .run('melgaziev', 'Мельгазиев Муса Курманалиевич', 'Имплантолог', '', null, 0)
  db.prepare('INSERT INTO doctor_branches (doctor_id, branch_id) VALUES (?,?)').run('melgaziev', 'm15')

  const insS = db.prepare('INSERT INTO services (doctor_id, name, price, duration_min) VALUES (?,?,?,?)')
  for (const s of [
    ['Первичная консультация', 1200, 30],
    ['Имплант (имплант + формирователь)', 45000, 90],
    ['Костная пластика (1 г кости + 1 г кости)', 50000, 120],
    ['Пин', 5000, 30],
    ['Несъемный протез на имплантатах (Candulor)', 90000, 120],
    ['Несъемный протез на имплантатах с металлокерамикой', 280000, 120],
    ['Несъемный протез на имплантатах с диоксидом циркония', 390000, 120],
    ['Операция синус-лифтинг', 80000, 120],
    ['+1 г костной ткани', 10000, 30],
    ['All-on-4', 290000, 180],
    ['All-on-6', 390000, 180],
    ['All-on-8', 490000, 180],
    ['Металлокерамическая коронка на имплантате', 43000, 60],
    ['Диоксид-циркониевая коронка на имплантате', 45000, 60],
    ['Временная коронка на имплантате', 10000, 60],
  ]) insS.run('melgaziev', s[0], s[1], s[2])

  // Работает по воскресеньям 9:00–21:00 (обед 13:00–14:00 учитывается в МИС)
  db.prepare('INSERT INTO schedules (doctor_id, weekday, start_min, end_min, off) VALUES (?,?,?,?,?)')
    .run('melgaziev', 0, 9 * 60, 21 * 60, 0)
  console.log('Добавлен врач Мельгазиев (вс 9:00–21:00, 15-й мкр.)')
}

// 3. Актуальные расписания остальных врачей (локальный фолбэк; SQNS даёт реальные слоты)
const schedules = {
  suhanova:    { days: [1, 2, 3, 4, 5], start: 9 * 60, end: 18 * 60 },        // будни 9–18
  sukhorukova: { days: [1, 2, 3, 4, 5, 6, 0], start: 9 * 60, end: 21 * 60 },  // как в программе
  irisbekov:   { days: [1, 2, 3, 4, 5, 6, 0], start: 9 * 60, end: 21 * 60 },  // 9–21
  konovalova:  { days: [1, 2, 3, 4, 5, 6, 0], start: 9 * 60, end: 19 * 60 },  // 9–19
  rabadanov:   { days: [2, 3, 4, 5, 6, 0], start: 9 * 60, end: 21 * 60 },     // вт–вс
  amonatzoda:  { days: [1, 2, 3, 4, 6, 0], start: 9 * 60, end: 21 * 60 },     // пн–чт, сб, вс
}
const del = db.prepare('DELETE FROM schedules WHERE doctor_id = ?')
const ins = db.prepare('INSERT INTO schedules (doctor_id, weekday, start_min, end_min, off) VALUES (?,?,?,?,0)')
for (const [id, s] of Object.entries(schedules)) {
  del.run(id)
  for (const wd of s.days) ins.run(id, wd, s.start, s.end)
}

console.log('Филиалы и расписания обновлены')
console.log(db.prepare('SELECT doctor_id, branch_id FROM doctor_branches').all())
