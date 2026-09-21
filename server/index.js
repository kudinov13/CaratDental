import express from 'express'
import crypto from 'node:crypto'
import db from './db.js'

const app = express()
app.use(express.json())

// ---------- Auth ----------

const SECRET = process.env.KARAT_SECRET || 'karat-dev-secret-change-me'
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

app.post('/api/login', (req, res) => {
  const { login, password } = req.body || {}
  const row = db.prepare('SELECT * FROM admins WHERE login = ?').get(String(login || ''))
  const ok = row && crypto.scryptSync(String(password || ''), row.salt, 64).toString('hex') === row.pass_hash
  if (!ok) return res.status(401).json({ error: 'Неверный логин или пароль' })
  const token = signToken(row.login)
  tokens.set(token, { login: row.login })
  res.json({ token })
})

// ---------- Helpers ----------

const getSetting = (key, fallback) => db.prepare('SELECT value FROM settings WHERE key = ?').get(key)?.value ?? fallback

function clinicData() {
  const branches = db.prepare('SELECT * FROM branches').all()
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
    services: services
      .filter((s) => s.doctor_id === d.id)
      .map((s) => ({ id: s.id, name: s.name, price: s.price, durationMin: s.duration_min })),
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

app.get('/api/slots', (req, res) => {
  const { doctor, date } = req.query
  if (!doctor || !date) return res.status(400).json({ error: 'doctor and date required' })

  const d = new Date(`${date}T12:00:00`)
  if (Number.isNaN(d.getTime())) return res.status(400).json({ error: 'bad date' })

  const weekday = d.getDay()
  const sched = db.prepare('SELECT * FROM schedules WHERE doctor_id = ? AND weekday = ? AND off = 0').get(doctor, weekday)
  if (!sched) return res.json({ slots: [] })

  const slotMin = Number(getSetting('slot_minutes', '30'))
  const leadH = Number(getSetting('min_lead_hours', '2'))
  const now = new Date()
  const isToday = date === `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  const minMinutes = now.getHours() * 60 + now.getMinutes() + leadH * 60

  const taken = new Set(
    db.prepare("SELECT time FROM bookings WHERE doctor_id = ? AND date = ? AND status != 'cancelled'")
      .all(doctor, date).map((r) => r.time)
  )

  const slots = []
  for (let m = sched.start_min; m + slotMin <= sched.end_min; m += slotMin) {
    const time = `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`
    const available = !taken.has(time) && !(isToday && m < minMinutes)
    slots.push({ time, available })
  }
  res.json({ slots })
})

app.post('/api/bookings', (req, res) => {
  const { branchId, doctorId, service, date, time, name, phone, comment } = req.body || {}
  if (!branchId || !doctorId || !date || !time || !name || !phone)
    return res.status(400).json({ error: 'Заполните обязательные поля' })

  const clash = db.prepare(
    "SELECT id FROM bookings WHERE doctor_id = ? AND date = ? AND time = ? AND status != 'cancelled'"
  ).get(doctorId, date, time)
  if (clash) return res.status(409).json({ error: 'Это время уже занято' })

  const info = db.prepare(
    'INSERT INTO bookings (branch_id, doctor_id, service, date, time, name, phone, comment) VALUES (?,?,?,?,?,?,?,?)'
  ).run(branchId, doctorId, service || '', date, time, name, phone, comment || '')

  res.json({ ok: true, id: info.lastInsertRowid })
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

app.patch('/api/admin/bookings/:id', auth, (req, res) => {
  const { status } = req.body || {}
  const allowed = ['new', 'confirmed', 'cancelled', 'moved', 'done']
  if (!allowed.includes(status)) return res.status(400).json({ error: 'bad status' })
  db.prepare('UPDATE bookings SET status = ? WHERE id = ?').run(status, req.params.id)
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
  db.prepare('UPDATE doctors SET name=?, role=?, photo=?, img_class=?, chief=? WHERE id=?')
    .run(d.name, d.role, d.photo || '', d.imgClass || '', d.chief ? 1 : 0, req.params.id)
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
  const insS = db.prepare('INSERT INTO services (doctor_id, name, price, duration_min) VALUES (?,?,?,?)')
  for (const s of d.services || []) insS.run(doctorId, s.name, Number(s.price) || 0, Number(s.durationMin) || 30)
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

const PORT = process.env.PORT || 3001
app.listen(PORT, () => console.log(`KARAT API → http://localhost:${PORT}`))
