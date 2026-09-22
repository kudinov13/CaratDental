import 'dotenv/config'
import { DatabaseSync } from 'node:sqlite'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { randomBytes, scryptSync } from 'node:crypto'
import { seedDoctors } from './seedData.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const db = new DatabaseSync(join(__dirname, 'karat.db'))

db.exec(`
PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS branches (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  short_name TEXT NOT NULL,
  address TEXT NOT NULL,
  phone TEXT NOT NULL,
  hours TEXT NOT NULL,
  map_url TEXT DEFAULT ''
);

CREATE TABLE IF NOT EXISTS doctors (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  photo TEXT DEFAULT '',
  img_class TEXT DEFAULT '',
  chief INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS doctor_branches (
  doctor_id TEXT NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  branch_id TEXT NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  PRIMARY KEY (doctor_id, branch_id)
);

CREATE TABLE IF NOT EXISTS services (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  doctor_id TEXT NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price INTEGER NOT NULL,
  duration_min INTEGER DEFAULT 30
);

CREATE TABLE IF NOT EXISTS schedules (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  doctor_id TEXT NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  weekday INTEGER NOT NULL, -- 0=вс .. 6=сб
  start_min INTEGER NOT NULL DEFAULT 540,
  end_min INTEGER NOT NULL DEFAULT 1140,
  off INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS bookings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  branch_id TEXT REFERENCES branches(id),
  doctor_id TEXT REFERENCES doctors(id),
  service TEXT DEFAULT '',
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  comment TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'new',
  created_at TEXT DEFAULT (datetime('now', 'localtime'))
);

CREATE TABLE IF NOT EXISTS admins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  login TEXT UNIQUE NOT NULL,
  pass_hash TEXT NOT NULL,
  salt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
`)

const count = db.prepare('SELECT COUNT(*) AS c FROM branches').get().c

if (count === 0) {
  const insBranch = db.prepare(
    'INSERT INTO branches (id, name, short_name, address, phone, hours, map_url) VALUES (?,?,?,?,?,?,?)'
  )
  insBranch.run('m7a', 'Карат', '7а мкр.', 'Тобольск, мкр. 7а, д. 7а, 1 этаж', '+7 (912) 388-78-12', '9:00–21:00, по предварительной записи', 'https://2gis.ru/tobolsk/geo/70000001046770706')
  insBranch.run('m9', 'Карат', '9-й мкр.', 'Тобольск, 9-й мкр., д. 11', '+7 (982) 971-81-97', '9:00–21:00, по предварительной записи', 'https://2gis.ru/tobolsk/geo/70000001087488201')
  insBranch.run('m15', 'Карат', '15-й мкр. (детская)', 'Тобольск, 15-й мкр., д. 18', '+7 (922) 268-80-09', '9:00–21:00, по предварительной записи', 'https://2gis.ru/tobolsk/geo/70000001110932596')

  const insDoc = db.prepare('INSERT INTO doctors (id, name, role, photo, img_class, chief) VALUES (?,?,?,?,?,?)')
  const insDB = db.prepare('INSERT INTO doctor_branches (doctor_id, branch_id) VALUES (?,?)')
  const insSvc = db.prepare('INSERT INTO services (doctor_id, name, price, duration_min) VALUES (?,?,?,?)')

  for (const doc of seedDoctors) {
    insDoc.run(doc.id, doc.name, doc.role, doc.photo, doc.imgClass || '', doc.chief ? 1 : 0)
    for (const branchId of doc.branchIds) insDB.run(doc.id, branchId)
    for (const s of doc.services) insSvc.run(doc.id, s.name, s.price, s.durationMin)
  }

  const insSched = db.prepare('INSERT INTO schedules (doctor_id, weekday, start_min, end_min, off) VALUES (?,?,?,?,0)')
  // Пн–Пт 9:00–19:00 у всех, сб 10:00–17:00, вс — выходной (нет строки)
  for (const doc of seedDoctors) {
    for (let d = 1; d <= 5; d++) insSched.run(doc.id, d, 540, 1140)
    insSched.run(doc.id, 6, 600, 1020)
  }

  const insSet = db.prepare('INSERT INTO settings (key, value) VALUES (?,?)')
  insSet.run('min_lead_hours', '2')
  insSet.run('slot_minutes', '30')
}

// Админ по умолчанию: логин admin, пароль из ADMIN_PASSWORD или случайный
if (db.prepare('SELECT COUNT(*) AS c FROM admins').get().c === 0) {
  const rawPassword = process.env.ADMIN_PASSWORD
  const generated = !rawPassword
  const password = rawPassword || randomBytes(12).toString('hex')
  const login = process.env.ADMIN_LOGIN || 'admin'
  const salt = randomBytes(16).toString('hex')
  const hash = scryptSync(password, salt, 64).toString('hex')
  db.prepare('INSERT INTO admins (login, pass_hash, salt) VALUES (?,?,?)').run(login, hash, salt)
  if (generated) {
    console.warn(`[WARN] ADMIN_PASSWORD не задан. Создан временный пароль для ${login}: ${password}`)
    console.warn('[WARN] Обязательно задайте ADMIN_PASSWORD в .env и пересоздайте БД перед production-запуском.')
  }
}

export default db
