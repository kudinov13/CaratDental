import { DatabaseSync } from 'node:sqlite'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { randomBytes, scryptSync } from 'node:crypto'

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
  insBranch.run('m7a', 'Филиал на 7а микрорайоне', '7а мкр.', 'Тобольск, мкр. 7а, д. 7а, 1 этаж', '+7 (912) 388-78-12', 'Пн–Пт 9:00–20:00, Сб 10:00–18:00', 'https://2gis.ru/tobolsk/geo/70000001046770706')
  insBranch.run('m9', 'Филиал на 9 микрорайоне', '9-й мкр.', 'Тобольск, 9-й мкр., д. 11', '+7 (982) 971-81-97', 'Пн–Пт 9:00–20:00, Сб 10:00–18:00', 'https://2gis.ru/tobolsk/geo/70000001087488201')
  insBranch.run('m15', 'Детская стоматология на 15 микрорайоне', '15-й мкр. (детская)', 'Тобольск, 15-й мкр., д. 18', '+7 (922) 268-80-09', 'Ежедневно до 21:00', 'https://2gis.ru/tobolsk/geo/70000001110932596')

  const insDoc = db.prepare('INSERT INTO doctors (id, name, role, photo, img_class, chief) VALUES (?,?,?,?,?,?)')
  insDoc.run('green', 'Мари Грин', 'Стоматолог-терапевт, ортопед', '/images/doctors/Karina.jpg', 'scale-[1.35]', 1)
  insDoc.run('amonatzoda', 'Амонатзода С. Р.', 'Стоматолог-терапевт', '/images/doctors/Amonatzoda.jpg', '', 0)
  insDoc.run('irisbekov', 'Ырысбеков Э. Н.', 'Терапевт, хирург, ортопед', '/images/doctors/Irisbekov.jpg', '', 0)
  insDoc.run('rabadanov', 'Рабаданов Б. Р.', 'Стоматолог-терапевт', '/images/doctors/Rabadanov.jpg', 'scale-[1.8]', 0)

  const insDB = db.prepare('INSERT INTO doctor_branches (doctor_id, branch_id) VALUES (?,?)')
  insDB.run('green', 'm7a'); insDB.run('green', 'm9')
  insDB.run('amonatzoda', 'm7a')
  insDB.run('irisbekov', 'm9'); insDB.run('irisbekov', 'm15')
  insDB.run('rabadanov', 'm15')

  const insSvc = db.prepare('INSERT INTO services (doctor_id, name, price, duration_min) VALUES (?,?,?,?)')
  const svc = [
    ['green', 'Первичный приём', 300, 30], ['green', 'Приём ортопеда', 600, 30],
    ['green', 'Лечение кариеса', 2100, 60], ['green', 'Профессиональная чистка', 4900, 60],
    ['amonatzoda', 'Первичный приём', 300, 30], ['amonatzoda', 'Лечение кариеса', 2100, 60],
    ['amonatzoda', 'Лечение каналов', 3500, 90], ['amonatzoda', 'Эстетическая реставрация', 4000, 90],
    ['irisbekov', 'Первичный приём', 300, 30], ['irisbekov', 'Удаление зуба', 2000, 40],
    ['irisbekov', 'Имплантация', 25000, 90], ['irisbekov', 'Протезирование', 15000, 90],
    ['rabadanov', 'Первичный приём', 300, 30], ['rabadanov', 'Приём ортодонта', 500, 30],
    ['rabadanov', 'Лечение кариеса', 2100, 60], ['rabadanov', 'Профессиональная чистка', 4500, 60],
  ]
  for (const s of svc) insSvc.run(...s)

  const insSched = db.prepare('INSERT INTO schedules (doctor_id, weekday, start_min, end_min, off) VALUES (?,?,?,?,0)')
  // Пн–Пт 9:00–19:00 у всех, сб 10:00–17:00, вс — выходной (нет строки)
  for (const doc of ['green', 'amonatzoda', 'irisbekov', 'rabadanov']) {
    for (let d = 1; d <= 5; d++) insSched.run(doc, d, 540, 1140)
    insSched.run(doc, 6, 600, 1020)
  }

  const insSet = db.prepare('INSERT INTO settings (key, value) VALUES (?,?)')
  insSet.run('min_lead_hours', '2')
  insSet.run('slot_minutes', '30')
}

// Админ по умолчанию: admin / karat2026 (сменить после первого входа)
if (db.prepare('SELECT COUNT(*) AS c FROM admins').get().c === 0) {
  const salt = randomBytes(16).toString('hex')
  const hash = scryptSync('karat2026', salt, 64).toString('hex')
  db.prepare('INSERT INTO admins (login, pass_hash, salt) VALUES (?,?,?)').run('admin', hash, salt)
}

export default db
