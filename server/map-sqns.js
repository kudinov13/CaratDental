// Одноразовый скрипт: прописывает SQNS employeeId врачам в локальной БД.
// Запуск: node server/map-sqns.js
// ID сотрудников берутся из SQNS (app3.sqns.ru → Сотрудники) или из
// GET /api/v2/employee CRM Exchange API.

import 'dotenv/config'
import { DatabaseSync } from 'node:sqlite'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const db = new DatabaseSync(join(__dirname, 'karat.db'))

// doctorId на сайте → employeeId в SQNS
const MAPPING = {
  suhanova: '1',     // Суханова Марина Николаевна
  sukhorukova: '6',  // Сухорукова Регина Рафисовна
  irisbekov: '12',   // Ырысбеков Эгем Ныязалиевич
  rabadanov: '16',   // Рабаданов Багомед Рабаданович
  amonatzoda: '17',  // Амонатзода Салмон Рахимович
  // konovalova: ''  // Коновалова — найти её id в SQNS и дописать
}

// На случай старой БД без колонки
const cols = db.prepare('PRAGMA table_info(doctors)').all().map((c) => c.name)
if (!cols.includes('sqns_employee_id')) {
  db.exec('ALTER TABLE doctors ADD COLUMN sqns_employee_id TEXT')
}

for (const [doctorId, employeeId] of Object.entries(MAPPING)) {
  const r = db.prepare('UPDATE doctors SET sqns_employee_id = ? WHERE id = ?').run(employeeId, doctorId)
  console.log(`${doctorId} → SQNS ${employeeId}: ${r.changes ? 'ok' : 'врач не найден'}`)
}
console.log('Готово. Текущее состояние:')
console.log(db.prepare('SELECT id, name, sqns_employee_id FROM doctors').all())
