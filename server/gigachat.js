// GigaChat API (Сбер): OAuth + chat/completions с function calling.
// Ключ авторизации — GIGACHAT_CREDENTIALS (base64) в .env, не коммитить.
// API использует российский УЦ Минцифры — поэтому rejectUnauthorized=false
// применяется только к хостам Сбера, не глобально.

import https from 'node:https'
import crypto from 'node:crypto'

const CREDS = process.env.GIGACHAT_CREDENTIALS || ''
const SCOPE = process.env.GIGACHAT_SCOPE || 'GIGACHAT_API_PERS'
const MODEL = process.env.GIGACHAT_MODEL || 'GigaChat'
const OAUTH_URL = 'https://ngw.devices.sberbank.ru:9443/api/v2/oauth'
const CHAT_URL = 'https://gigachat.devices.sberbank.ru/api/v1/chat/completions'

export const gigachatEnabled = !!CREDS

const agent = new https.Agent({ rejectUnauthorized: false })

let tokenCache = { token: null, expiresAt: 0 }

function post(url, { headers = {}, body, form } = {}) {
  return new Promise((resolve, reject) => {
    const u = new URL(url)
    const payload = form ? form : body ? JSON.stringify(body) : ''
    const req = https.request(
      {
        hostname: u.hostname,
        port: u.port || 443,
        path: u.pathname + u.search,
        method: 'POST',
        agent,
        timeout: 30000,
        headers: {
          'Content-Type': form ? 'application/x-www-form-urlencoded' : 'application/json',
          Accept: 'application/json',
          ...headers,
        },
      },
      (res) => {
        let data = ''
        res.on('data', (c) => (data += c))
        res.on('end', () => {
          try {
            const json = JSON.parse(data)
            if (res.statusCode >= 400) {
              const err = new Error(`GigaChat HTTP ${res.statusCode}: ${data.slice(0, 300)}`)
              err.status = res.statusCode
              reject(err)
            } else resolve(json)
          } catch {
            reject(new Error(`GigaChat bad response ${res.statusCode}: ${data.slice(0, 200)}`))
          }
        })
      }
    )
    req.on('timeout', () => req.destroy(new Error('GigaChat timeout')))
    req.on('error', reject)
    if (payload) req.write(payload)
    req.end()
  })
}

async function getToken() {
  if (tokenCache.token && Date.now() < tokenCache.expiresAt - 60_000) return tokenCache.token
  const r = await post(OAUTH_URL, {
    headers: {
      Authorization: `Basic ${CREDS}`,
      RqUID: crypto.randomUUID(),
    },
    form: `scope=${SCOPE}`,
  })
  tokenCache = { token: r.access_token, expiresAt: r.expires_at * 1000 || Date.now() + 29 * 60_000 }
  return tokenCache.token
}

/**
 * Один вызов chat/completions.
 * messages: [{role:'system'|'user'|'assistant'|'function', content, ...}]
 * functions: массив описаний функций (OpenAI-стиль, GigaChat совместим).
 * Возвращает message: { content?, function_call?: {name, arguments} }
 */
export async function chat(messages, functions = null) {
  const token = await getToken()
  const payload = { model: MODEL, messages, temperature: 0.3, max_tokens: 1024 }
  if (functions?.length) {
    payload.functions = functions
    payload.function_call = 'auto'
  }
  const r = await post(CHAT_URL, {
    headers: { Authorization: `Bearer ${token}` },
    body: payload,
  })
  return r.choices?.[0]?.message || { content: '' }
}
