import { DatabaseSync } from 'node:sqlite'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const db = new DatabaseSync(join(__dirname, 'karat.db'))

// Периодонтит 3к.к, этап с кальцием (длительность 90 мин): 5000 → 5300 по новому прайсу
const r = db.prepare(
  "UPDATE services SET price = 5300 WHERE name LIKE 'Периодонтит%3к.к%' AND price = 5000 AND duration_min = 90"
).run()
console.log('Обновлено услуг:', r.changes)
