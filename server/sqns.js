// Адаптер CRM Exchange API (SQNS / 1Дента)
// Документация: https://crmexchange.1denta.ru/docs/swagger/
// Включается через SQNS_ENABLED=1 + SQNS_EMAIL/SQNS_PASSWORD в .env

const BASE = process.env.SQNS_BASE || 'https://crmexchange.1denta.ru'
const EMAIL = process.env.SQNS_EMAIL || ''
const PASSWORD = process.env.SQNS_PASSWORD || ''

export const sqnsEnabled = process.env.SQNS_ENABLED === '1' && !!EMAIL && !!PASSWORD

let token = null
let tokenPromise = null
export let webhookSecret = null

async function login() {
  const r = await fetch(`${BASE}/api/v2/auth`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  })
  const j = await r.json()
  if (!r.ok || !j.token) throw new Error(`SQNS auth failed: ${r.status} ${JSON.stringify(j)}`)
  token = j.token
  webhookSecret = j.webhookSecret || null
  return token
}

async function getToken() {
  if (!tokenPromise) {
    tokenPromise = login().finally(() => { tokenPromise = null })
  }
  return tokenPromise
}

async function api(path, { method = 'GET', body, retry = true } = {}) {
  const t = token || (await getToken())
  const r = await fetch(`${BASE}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', authorization: `Bearer ${t}` },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (r.status === 401 && retry) {
    token = null
    return api(path, { method, body, retry: false })
  }
  const j = await r.json().catch(() => ({}))
  if (!r.ok) {
    const err = new Error(j.message || `SQNS ${r.status}`)
    err.status = r.status
    err.payload = j
    throw err
  }
  return j
}

// ---------- Данные ----------

/** Все сотрудники (врачи/админы/ассистенты) */
export const listEmployees = () => api('/api/v2/employee?perPage=200')

/** Услуги, доступные для онлайн-записи, с привязкой resources (врачей) */
export const listBookingServices = () => api('/api/v2/booking/service?perPage=200')

/** Свободные даты врача по услуге */
export async function availableDates(employeeId, serviceIds, from, to) {
  const q = serviceIds.map((id) => `serviceIds[]=${id}`).join('&')
  const j = await api(`/api/v2/resource/${employeeId}/date?${q}&from=${from}&to=${to}`)
  return (j.availableDates || []).map((d) => d.date)
}

/** Свободное время врача на дату (занятое в МИС уже исключено) */
export async function availableTimes(employeeId, serviceIds, date) {
  const q = serviceIds.map((id) => `serviceIds[]=${id}`).join('&')
  const j = await api(`/api/v2/resource/${employeeId}/time?${q}&date=${date}`)
  return (j.availableTimeSlots || []).map((s) => s.datetime)
}

/** Создать запись в МИС. Ответ: { visit: { id, resourceId, datetime, ... } } */
export const createVisit = ({ name, phone, datetime, serviceIds }) =>
  api('/api/v2/visit', {
    method: 'POST',
    body: { visit: { user: { name, phone }, appointment: { datetime, serviceIds } } },
  })

/** Статус записи: new | confirmed | showedUp | cancel */
export const setVisitStatus = (visitId, status) =>
  api(`/api/v2/visit/${visitId}/status`, { method: 'PUT', body: { status } })

export const moveVisit = (visitId, datetime, comment) =>
  api(`/api/v2/visit/${visitId}`, { method: 'PUT', body: { datetime, comment } })

export const deleteVisit = (visitId) => api(`/api/v2/visit/${visitId}`, { method: 'DELETE' })

export const listVisits = (dateFrom, dateTill, page = 1) =>
  api(`/api/v2/visit?perPage=100&page=${page}&dateFrom=${dateFrom}&dateTill=${dateTill}`)

/** Найти клиента по телефону */
export const findClientByPhone = (phone) =>
  api(`/api/v2/client/phone/${encodeURIComponent(phone)}`).catch(() => null)

/** Зарегистрировать вебхуки (SQNS будет дёргать наш сервер при изменениях) */
export const setHooks = (urls) => api('/api/v2/hook_settings', { method: 'POST', body: { urls } })
