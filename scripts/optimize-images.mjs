// One-off image optimizer: public/images/**/*.{jpg,jpeg,png} → .webp
// Originals are kept on disk (doctor .jpg paths are still referenced by
// server/seedData.js and possibly the production database; Hero_One.jpg is
// the og:image). Run: node scripts/optimize-images.mjs

import { readdirSync, statSync } from 'node:fs'
import { join, extname, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const imagesDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'images')

// max width by location/name
const RULES = [
  { test: /Hero_One|technology-hero/, width: 1600 },
  { test: /team\.(jpg|png)$/i, width: 1400 },
  { test: /doctors\//, width: 800 },
  { test: /cases\//, width: 1000 },
  { test: /equipment\//, width: 1000 },
  { test: /logo-header\.png$/i, width: 512, keepAlpha: true },
]
const DEFAULT_WIDTH = 1200
const QUALITY = 78

function* walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) yield* walk(p)
    else if (/\.(jpe?g|png)$/i.test(name)) yield p
  }
}

for (const file of walk(imagesDir)) {
  const rel = file.slice(imagesDir.length + 1).replace(/\\/g, '/')
  const rule = RULES.find((r) => r.test.test(rel)) || {}
  const width = rule.width ?? DEFAULT_WIDTH
  const out = file.replace(/\.(jpe?g|png)$/i, '.webp')

  let img = sharp(file)
  const meta = await img.metadata()
  if ((meta.width ?? 0) > width) img = img.resize({ width })
  await img.webp({ quality: QUALITY, alphaQuality: 90 }).toFile(out)
  console.log(`${rel} -> ${rel.replace(/\.(jpe?g|png)$/i, '.webp')} (${meta.width}px -> ${Math.min(meta.width ?? width, width)}px)`)
}
