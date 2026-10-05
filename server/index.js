import 'dotenv/config'
import express from 'express'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import { readFileSync } from 'node:fs'
import db from './db.js'
import * as sqns from './sqns.js'
import * as gigachat from './gigachat.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const app = express()
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      // HTTP-деплой: upgrade-insecure-requests ломает загрузку ассетов до выпуска SSL
      'upgrade-insecure-requests': null,
    },
  },
}))
app.use(express.json({ limit: '32kb' }))

// ---------- Security / Rate limits ----------

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Слишком много запросов. Попробуйте позже.' },
})

const bookingLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Слишком много попыток записи. Попробуйте позже.' },
})

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Слишком много попыток входа. Попробуйте позже.' },
})

app.use('/api/', apiLimiter)

// ---------- Auth ----------

const SECRET = process.env.KARAT_SECRET
if (!SECRET) {
  console.error('[ERROR] KARAT_SECRET не задан. Задайте KARAT_SECRET в .env перед запуском.')
  process.exit(1)
}
const tokens = new Map() // token -> { login, exp }

function signToken(login) {
  const payload = `${login}.${Date.now() + 1000 * 60 * 60 * 12}`
  const sig = crypto.createHmac('sha256', SECRET).update(payload).digest('hex')
  return `${payload}.${sig}`
}

function verifyToken(token) {
  if (!token) return null
  const parts = token.split('.')
  if (parts.length !== 3) return null
  const [login, exp, sig] = parts
  const expected = crypto.createHmac('sha256', SECRET).update(`${login}.${exp}`).digest('hex')
  if (sig !== expected || Number(exp) < Date.now()) return null
  return login
}

function auth(req, res, next) {
  const token = (req.headers.authorization || '').replace('Bearer ', '')
  if (!verifyToken(token)) return res.status(401).json({ error: 'unauthorized' })
  next()
}

app.post('/api/login', loginLimiter, (req, res) => {
  const { login, password } = req.body || {}
  const cleanLogin = String(login || '').trim().slice(0, 50)
  const cleanPassword = String(password || '').slice(0, 100)
  if (!cleanLogin || !cleanPassword) {
    return res.status(400).json({ error: 'Логин и пароль обязательны' })
  }
  const row = db.prepare('SELECT * FROM admins WHERE login = ?').get(cleanLogin)
  const ok = row && crypto.scryptSync(cleanPassword, row.salt, 64).toString('hex') === row.pass_hash
  if (!ok) return res.status(401).json({ error: 'Неверный логин или пароль' })
  const token = signToken(row.login)
  tokens.set(token, { login: row.login })
  res.json({ token })
})

// ---------- Helpers ----------

const getSetting = (key, fallback) => db.prepare('SELECT value FROM settings WHERE key = ?').get(key)?.value ?? fallback

function clinicData() {
  const branches = db.prepare("SELECT * FROM branches WHERE id != 'm9'").all()
  const doctorRows = db.prepare('SELECT * FROM doctors').all()
  const doctorBranches = db.prepare('SELECT * FROM doctor_branches').all()
  const services = db.prepare('SELECT * FROM services').all()
  const doctors = doctorRows.map((d) => ({
    id: d.id,
    name: d.name,
    role: d.role,
    photo: d.photo,
    imgClass: d.img_class || undefined,
    chief: !!d.chief,
    branchIds: doctorBranches.filter((x) => x.doctor_id === d.id).map((x) => x.branch_id),
    sqnsEmployeeId: d.sqns_employee_id || undefined,
    services: services
      .filter((s) => s.doctor_id === d.id)
      .map((s) => ({ id: s.id, name: s.name, price: s.price, durationMin: s.duration_min, sqnsServiceId: s.sqns_service_id || undefined })),
  }))
  return {
    branches: branches.map((b) => ({
      id: b.id, name: b.name, shortName: b.short_name, address: b.address,
      phone: b.phone, hours: b.hours, mapUrl: b.map_url,
    })),
    doctors,
  }
}

// ---------- Public API ----------

app.get('/api/clinic', (req, res) => res.json(clinicData()))

// SQNS: какой serviceIds[] слать в МИС. В SQNS serviceIds работают как "И" —
// слот должен вместить все услуги, поэтому шлём ровно одну: выбранную, либо самую короткую.
async function sqnsServiceIdsFor(doctorId, sqnsEmployeeId, serviceName) {
  if (serviceName) {
    const row = db.prepare('SELECT sqns_service_id FROM services WHERE doctor_id = ? AND name = ?').get(doctorId, serviceName)
    if (row?.sqns_service_id) return [Number(row.sqns_service_id)]
  }
  const mapped = db.prepare(
    'SELECT sqns_service_id, duration_min FROM services WHERE doctor_id = ? AND sqns_service_id IS NOT NULL ORDER BY duration_min ASC'
  ).all(doctorId)
  if (mapped.length) return [Number(mapped[0].sqns_service_id)]
  // Маппинг услуг не настроен — самая короткая услуга SQNS этого врача
  const j = await sqns.listBookingServices()
  const mine = (j.services || []).filter((s) => (s.resources || []).some((r) => String(r.id) === String(sqnsEmployeeId)))
  mine.sort((a, b) => (a.durationSeconds || 0) - (b.durationSeconds || 0))
  return mine.length ? [Number(mine[0].id)] : []
}

// Вычисление слотов для даты. Используется маршрутом /api/slots и функцией бота.
async function computeSlots(doctorId, date, service) {
  const d = new Date(`${date}T12:00:00`)
  if (Number.isNaN(d.getTime())) return { slots: [], error: 'bad date' }

  const weekday = d.getDay()
  const sched = db.prepare('SELECT * FROM schedules WHERE doctor_id = ? AND weekday = ? AND off = 0').get(doctorId, weekday)
  if (!sched) return { slots: [] }

  const slotMin = Number(getSetting('slot_minutes', '30'))
  const leadH = Number(getSetting('min_lead_hours', '2'))
  const now = new Date()
  const isToday = date === `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  const minMinutes = now.getHours() * 60 + now.getMinutes() + leadH * 60

  const taken = new Set(
    db.prepare("SELECT time FROM bookings WHERE doctor_id = ? AND date = ? AND status != 'cancelled'")
      .all(doctorId, date).map((r) => r.time)
  )

  const slots = []
  for (let m = sched.start_min; m + slotMin <= sched.end_min; m += slotMin) {
    const time = `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`
    const available = !taken.has(time) && !(isToday && m < minMinutes)
    slots.push({ time, available })
  }

  // SQNS: если врач замаплен — занятость берём из МИС (занятое на ресепшене = занято на сайте)
  const doc = db.prepare('SELECT sqns_employee_id FROM doctors WHERE id = ?').get(doctorId)
  if (sqns.sqnsEnabled && doc?.sqns_employee_id) {
    try {
      const serviceIds = await sqnsServiceIdsFor(doctorId, doc.sqns_employee_id, service)
      if (serviceIds.length) {
        const times = await sqns.availableTimes(doc.sqns_employee_id, serviceIds, date)
        const freeSet = new Set(times.map((t) => t.slice(11, 16)))
        for (const s of slots) if (s.available) s.available = freeSet.has(s.time)
      }
    } catch (e) {
      console.error('[SQNS] slots fallback to local:', e.message)
    }
  }

  return { slots }
}

app.get('/api/slots', async (req, res) => {
  const { doctor, date, service } = req.query
  if (!doctor || !date) return res.status(400).json({ error: 'doctor and date required' })
  res.json(await computeSlots(doctor, date, service))
})

function cleanBookingInput(body) {
  const str = (v, max) => String(v ?? '').trim().slice(0, max)
  return {
    branchId: str(body.branchId, 32),
    doctorId: str(body.doctorId, 32),
    service: str(body.service, 200),
    date: str(body.date, 10),
    time: str(body.time, 5),
    name: str(body.name, 100),
    phone: str(body.phone, 30),
    comment: str(body.comment, 500),
  }
}

const dateRe = /^\d{4}-\d{2}-\d{2}$/
const timeRe = /^([01]\d|2[0-3]):([0-5]\d)$/

const todayStr = () => {
  const n = new Date()
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}-${String(n.getDate()).padStart(2, '0')}`
}

// Создание записи. Используется маршрутом /api/bookings и функцией бота.
// Возвращает { status, body } — статус HTTP и JSON-ответ.
async function createBooking(input) {
  const { branchId, doctorId, service, date, time, name, phone, comment } = cleanBookingInput(input || {})
  if (!branchId || !doctorId || !date || !time || !name || !phone)
    return { status: 400, body: { error: 'Заполните обязательные поля' } }
  if (!dateRe.test(date)) return { status: 400, body: { error: 'Некорректная дата' } }
  if (!timeRe.test(time)) return { status: 400, body: { error: 'Некорректное время' } }
  if (date <= todayStr())
    return { status: 400, body: { error: 'Онлайн-запись доступна только на завтра и позже' } }

  const branch = db.prepare("SELECT id FROM branches WHERE id = ? AND id != 'm9'").get(branchId)
  const doctor = db.prepare('SELECT id, sqns_employee_id FROM doctors WHERE id = ?').get(doctorId)
  if (!branch || !doctor) return { status: 400, body: { error: 'Неверный филиал или врач' } }

  const clash = db.prepare(
    "SELECT id FROM bookings WHERE doctor_id = ? AND date = ? AND time = ? AND status != 'cancelled'"
  ).get(doctorId, date, time)
  if (clash) return { status: 409, body: { error: 'Это время уже занято' } }

  // Создаём запись в МИС SQNS (Тобольск — UTC+5)
  let sqnsVisitId = null
  if (sqns.sqnsEnabled && doctor.sqns_employee_id) {
    try {
      const serviceIds = await sqnsServiceIdsFor(doctorId, doctor.sqns_employee_id, service)
      const visit = await sqns.createVisit({
        name,
        phone,
        datetime: `${date}T${time}:00+05:00`,
        serviceIds,
      })
      sqnsVisitId = visit.visit?.id ? String(visit.visit.id) : null
    } catch (e) {
      console.error('[SQNS] createVisit failed:', e.message)
      if (e.status === 422 || e.status === 409)
        return { status: 409, body: { error: 'Это время только что заняли — выберите другое' } }
    }
  }

  const info = db.prepare(
    'INSERT INTO bookings (branch_id, doctor_id, service, date, time, name, phone, comment, sqns_visit_id) VALUES (?,?,?,?,?,?,?,?,?)'
  ).run(branchId, doctorId, service, date, time, name, phone, comment, sqnsVisitId)

  return { status: 200, body: { ok: true, id: info.lastInsertRowid, sqnsVisitId } }
}

app.post('/api/bookings', bookingLimiter, async (req, res) => {
  const r = await createBooking(req.body)
  res.status(r.status).json(r.body)
})

// ---------- Admin API ----------

app.get('/api/admin/bookings', auth, (req, res) => {
  const { date, doctor, branch, status } = req.query
  let sql = `SELECT b.*, d.name AS doctor_name, br.short_name AS branch_name
             FROM bookings b
             LEFT JOIN doctors d ON d.id = b.doctor_id
             LEFT JOIN branches br ON br.id = b.branch_id WHERE 1=1`
  const args = []
  if (date) { sql += ' AND b.date = ?'; args.push(date) }
  if (doctor) { sql += ' AND b.doctor_id = ?'; args.push(doctor) }
  if (branch) { sql += ' AND b.branch_id = ?'; args.push(branch) }
  if (status) { sql += ' AND b.status = ?'; args.push(status) }
  sql += ' ORDER BY b.date DESC, b.time DESC'
  res.json({ bookings: db.prepare(sql).all(...args) })
})

app.post('/api/admin/bookings', auth, (req, res) => {
  const { branchId, doctorId, service, date, time, name, phone, comment } = req.body || {}
  if (!doctorId || !date || !time || !name || !phone)
    return res.status(400).json({ error: 'Заполните обязательные поля' })
  const info = db.prepare(
    'INSERT INTO bookings (branch_id, doctor_id, service, date, time, name, phone, comment, status) VALUES (?,?,?,?,?,?,?,?,?)'
  ).run(branchId || null, doctorId, service || '', date, time, name, phone, comment || '', 'confirmed')
  res.json({ ok: true, id: info.lastInsertRowid })
})

app.patch('/api/admin/bookings/:id', auth, async (req, res) => {
  const { status } = req.body || {}
  const allowed = ['new', 'confirmed', 'cancelled', 'moved', 'done']
  if (!allowed.includes(status)) return res.status(400).json({ error: 'bad status' })
  db.prepare('UPDATE bookings SET status = ? WHERE id = ?').run(status, req.params.id)

  // Отмена/подтверждение пробрасываем в SQNS, если запись была создана там
  const row = db.prepare('SELECT sqns_visit_id FROM bookings WHERE id = ?').get(req.params.id)
  if (sqns.sqnsEnabled && row?.sqns_visit_id) {
    const sqnsStatus = { cancelled: 'cancel', confirmed: 'confirmed', done: 'showedUp', new: 'new' }[status]
    if (sqnsStatus) {
      try { await sqns.setVisitStatus(row.sqns_visit_id, sqnsStatus) }
      catch (e) { console.error('[SQNS] setVisitStatus failed:', e.message) }
    }
  }
  res.json({ ok: true })
})

app.delete('/api/admin/bookings/:id', auth, (req, res) => {
  db.prepare('DELETE FROM bookings WHERE id = ?').run(req.params.id)
  res.json({ ok: true })
})

// Branches CRUD
app.put('/api/admin/branches/:id', auth, (req, res) => {
  const { name, shortName, address, phone, hours, mapUrl } = req.body || {}
  db.prepare('UPDATE branches SET name=?, short_name=?, address=?, phone=?, hours=?, map_url=? WHERE id=?')
    .run(name, shortName, address, phone, hours, mapUrl || '', req.params.id)
  res.json({ ok: true })
})

app.post('/api/admin/branches', auth, (req, res) => {
  const { name, shortName, address, phone, hours, mapUrl } = req.body || {}
  const id = `b${Date.now()}`
  db.prepare('INSERT INTO branches (id, name, short_name, address, phone, hours, map_url) VALUES (?,?,?,?,?,?,?)')
    .run(id, name, shortName, address, phone, hours, mapUrl || '')
  res.json({ ok: true, id })
})

app.delete('/api/admin/branches/:id', auth, (req, res) => {
  db.prepare('DELETE FROM branches WHERE id = ?').run(req.params.id)
  res.json({ ok: true })
})

// Doctors CRUD (с услугами и филиалами)
app.post('/api/admin/doctors', auth, (req, res) => {
  const d = req.body || {}
  const id = `d${Date.now()}`
  db.prepare('INSERT INTO doctors (id, name, role, photo, img_class, chief) VALUES (?,?,?,?,?,?)')
    .run(id, d.name, d.role, d.photo || '', d.imgClass || '', d.chief ? 1 : 0)
  saveDoctorRelations(id, d)
  res.json({ ok: true, id })
})

app.put('/api/admin/doctors/:id', auth, (req, res) => {
  const d = req.body || {}
  db.prepare('UPDATE doctors SET name=?, role=?, photo=?, img_class=?, chief=?, sqns_employee_id=? WHERE id=?')
    .run(d.name, d.role, d.photo || '', d.imgClass || '', d.chief ? 1 : 0, d.sqnsEmployeeId || null, req.params.id)
  saveDoctorRelations(req.params.id, d)
  res.json({ ok: true })
})

app.delete('/api/admin/doctors/:id', auth, (req, res) => {
  db.prepare('DELETE FROM doctors WHERE id = ?').run(req.params.id)
  res.json({ ok: true })
})

function saveDoctorRelations(doctorId, d) {
  db.prepare('DELETE FROM doctor_branches WHERE doctor_id = ?').run(doctorId)
  const insB = db.prepare('INSERT OR IGNORE INTO doctor_branches (doctor_id, branch_id) VALUES (?,?)')
  for (const b of d.branchIds || []) insB.run(doctorId, b)
  db.prepare('DELETE FROM services WHERE doctor_id = ?').run(doctorId)
  const insS = db.prepare('INSERT INTO services (doctor_id, name, price, duration_min, sqns_service_id) VALUES (?,?,?,?,?)')
  for (const s of d.services || []) insS.run(doctorId, s.name, Number(s.price) || 0, Number(s.durationMin) || 30, s.sqnsServiceId || null)
}

// Schedule
app.get('/api/admin/schedules', auth, (req, res) => {
  res.json({ schedules: db.prepare('SELECT * FROM schedules').all() })
})

app.put('/api/admin/schedules', auth, (req, res) => {
  const { doctorId, weekday, startMin, endMin, off } = req.body || {}
  db.prepare('DELETE FROM schedules WHERE doctor_id = ? AND weekday = ?').run(doctorId, weekday)
  db.prepare('INSERT INTO schedules (doctor_id, weekday, start_min, end_min, off) VALUES (?,?,?,?,?)')
    .run(doctorId, weekday, startMin, endMin, off ? 1 : 0)
  res.json({ ok: true })
})

// Settings
app.get('/api/admin/settings', auth, (req, res) => {
  res.json({ settings: db.prepare('SELECT * FROM settings').all() })
})

app.put('/api/admin/settings', auth, (req, res) => {
  const upsert = db.prepare('INSERT INTO settings (key, value) VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value')
  for (const [key, value] of Object.entries(req.body || {})) upsert.run(key, String(value))
  res.json({ ok: true })
})

// SQNS: справочники для маппинга
app.get('/api/admin/sqns/employees', auth, async (req, res) => {
  if (!sqns.sqnsEnabled) return res.status(503).json({ error: 'SQNS не настроен (SQNS_ENABLED/SQNS_EMAIL/SQNS_PASSWORD в .env)' })
  try { res.json(await sqns.listEmployees()) } catch (e) { res.status(502).json({ error: e.message }) }
})

app.get('/api/admin/sqns/services', auth, async (req, res) => {
  if (!sqns.sqnsEnabled) return res.status(503).json({ error: 'SQNS не настроен' })
  try { res.json(await sqns.listBookingServices()) } catch (e) { res.status(502).json({ error: e.message }) }
})

// Stats
app.get('/api/admin/stats', auth, (req, res) => {
  const total = db.prepare('SELECT COUNT(*) AS c FROM bookings').get().c
  const byStatus = db.prepare('SELECT status, COUNT(*) AS c FROM bookings GROUP BY status').all()
  const byDoctor = db.prepare(
    'SELECT d.name, COUNT(*) AS c FROM bookings b LEFT JOIN doctors d ON d.id=b.doctor_id GROUP BY b.doctor_id'
  ).all()
  const byBranch = db.prepare(
    'SELECT br.short_name AS name, COUNT(*) AS c FROM bookings b LEFT JOIN branches br ON br.id=b.branch_id GROUP BY b.branch_id'
  ).all()
  res.json({ total, byStatus, byDoctor, byBranch })
})

// ---------- Chat bot (GigaChat + записи) ----------

const chatLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Слишком много сообщений. Попробуйте позже.' },
})

let knowledgeCache = ''
function botKnowledge() {
  if (!knowledgeCache) {
    try { knowledgeCache = readFileSync(join(__dirname, '..', 'bot-knowledge.md'), 'utf8') }
    catch { knowledgeCache = '' }
  }
  return knowledgeCache
}

function systemPrompt() {
  const { branches, doctors } = clinicData()
  const docList = doctors.map((d) =>
    `- ${d.name} (${d.role}), филиалы: ${d.branchIds.join(', ')}, услуги: ${d.services.slice(0, 12).map((s) => s.name).join('; ')}`
  ).join('\n')
  return `Ты — помощник стоматологической клиники «Карат Титан» в Тобольске на сайте клиники.
Сегодня: ${todayStr()} (формат YYYY-MM-DD). Записывать можно только на завтра и позже.

ВАЖНО:
- Никогда не упоминай, что ты GigaChat, ИИ, нейросеть, языковая модель или бот на технологии.
  Ты — «помощник клиники Карат Титан».
- Не знаешь ответа или вопрос нестандартный → ответь: «Это лучше уточнить у администратора:
  +7 (912) 388-78-12 или +7 (922) 268-80-09. Либо оставьте номер телефона — вам перезвонят».
- Не давай медицинских рекомендаций сверх раздела «Первая помощь до приёма».
- Ответы короткие, дружелюбные, по-русски. Без markdown-заголовков.

ЗАПИСЬ НА ПРИЁМ:
- Если пациент хочет записаться — используй функции get_branches, get_doctors, get_slots, create_booking.
- Последовательность: уточни жалобу/услугу → предложи подходящего врача и филиал → спроси дату →
  покажи свободное время (get_slots) → спроси ФИО и телефон → создай запись (create_booking).
- На сегодня не записывай — только завтра и дальше. Если срочно/сильная боль — телефон администратора.
- Отмена и перенос — только по телефону администратора.
- После успешной записи подтверди: врач, дата, время, адрес филиала. Запись действует сразу —
  ждать звонка не нужно.

Филиалы: ${branches.map((b) => `${b.id} — ${b.address}, ${b.phone}`).join('; ')}

Врачи:
${docList}

БАЗА ЗНАНИЙ КЛИНИКИ:
${botKnowledge()}`
}

const chatFunctions = [
  {
    name: 'get_branches',
    description: 'Список филиалов клиники с адресами и телефонами',
    parameters: { type: 'object', properties: {}, required: [] },
  },
  {
    name: 'get_doctors',
    description: 'Список врачей, можно фильтровать по филиалу',
    parameters: {
      type: 'object',
      properties: { branch_id: { type: 'string', description: 'id филиала (m7a или m15), необязательно' } },
      required: [],
    },
  },
  {
    name: 'get_slots',
    description: 'Свободное время врача на дату (YYYY-MM-DD). Записывать можно только на завтра и позже.',
    parameters: {
      type: 'object',
      properties: {
        doctor_id: { type: 'string' },
        date: { type: 'string', description: 'YYYY-MM-DD' },
        service: { type: 'string', description: 'название услуги, необязательно' },
      },
      required: ['doctor_id', 'date'],
    },
  },
  {
    name: 'create_booking',
    description: 'Создать запись на приём. Перед вызовом нужны: doctor_id, date, time, name (ФИО), phone.',
    parameters: {
      type: 'object',
      properties: {
        doctor_id: { type: 'string' },
        date: { type: 'string', description: 'YYYY-MM-DD' },
        time: { type: 'string', description: 'HH:MM' },
        name: { type: 'string', description: 'ФИО пациента' },
        phone: { type: 'string', description: 'Телефон пациента' },
        service: { type: 'string', description: 'название услуги, необязательно' },
      },
      required: ['doctor_id', 'date', 'time', 'name', 'phone'],
    },
  },
]

async function runChatTool(name, args) {
  const { branches, doctors } = clinicData()
  if (name === 'get_branches')
    return { branches: branches.map((b) => ({ id: b.id, address: b.address, phone: b.phone, hours: b.hours })) }
  if (name === 'get_doctors')
    return {
      doctors: doctors
        .filter((d) => !args.branch_id || d.branchIds.includes(args.branch_id))
        .map((d) => ({ id: d.id, name: d.name, role: d.role, branches: d.branchIds })),
    }
  if (name === 'get_slots') {
    const doctor = doctors.find((d) => d.id === args.doctor_id)
    if (!doctor) return { error: 'Врач не найден' }
    if (String(args.date) <= todayStr())
      return { error: 'Запись доступна только на завтра и позже. Предложи ближайшие даты.' }
    const { slots } = await computeSlots(args.doctor_id, args.date, args.service)
    return { doctor: doctor.name, date: args.date, free: slots.filter((s) => s.available).map((s) => s.time) }
  }
  if (name === 'create_booking') {
    const doctor = doctors.find((d) => d.id === args.doctor_id)
    if (!doctor) return { error: 'Врач не найден' }
    const r = await createBooking({ ...args, branchId: doctor.branchIds[0] })
    if (r.body.ok) {
      const branch = branches.find((b) => b.id === doctor.branchIds[0])
      return {
        ok: true,
        booking: {
          doctor: doctor.name, date: args.date, time: args.time,
          address: branch?.address || '', phone: branch?.phone || '',
        },
      }
    }
    return { error: r.body.error || 'Не удалось создать запись' }
  }
  return { error: 'unknown function' }
}

app.post('/api/chat', chatLimiter, async (req, res) => {
  if (!gigachat.gigachatEnabled)
    return res.status(503).json({ error: 'Чат не настроен' })

  const history = Array.isArray(req.body?.messages) ? req.body.messages.slice(-20) : []
  const messages = [{ role: 'system', content: systemPrompt() }]
  for (const m of history) {
    if (m.role === 'user' || m.role === 'assistant')
      messages.push({ role: m.role, content: String(m.content || '').slice(0, 2000) })
  }

  try {
    let booking = null
    for (let i = 0; i < 6; i++) {
      const reply = await gigachat.chat(messages, chatFunctions)
      if (!reply.function_call) {
        return res.json({ reply: reply.content || 'Подскажите, пожалуйста, подробнее?', booking })
      }
      const { name, arguments: rawArgs } = reply.function_call
      let args = {}
      try { args = rawArgs ? JSON.parse(rawArgs) : {} } catch { args = {} }
      const result = await runChatTool(name, args)
      if (result?.booking) booking = result.booking
      messages.push({ role: 'assistant', content: null, function_call: reply.function_call })
      messages.push({ role: 'function', name, content: JSON.stringify(result) })
    }
    res.json({ reply: 'Уточните, пожалуйста, детали — или оставьте номер, администратор перезвонит.', booking })
  } catch (e) {
    console.error('[GigaChat]', e.message)
    res.status(502).json({ error: 'assistant unavailable' })
  }
})

// ---------- Static SPA ----------

const distDir = join(__dirname, '..', 'dist')
app.use(express.static(distDir))
app.use((req, res, next) => {
  if (req.method !== 'GET' || req.path.startsWith('/api/')) return next()
  res.sendFile(join(distDir, 'index.html'), (err) => { if (err) next() })
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => console.log(`KARAT TITAN API → http://localhost:${PORT}`))
