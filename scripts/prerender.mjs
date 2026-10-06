// Build-time prerender: bakes per-route meta, canonical, JSON-LD and a
// visually-hidden semantic block into dist/<route>/index.html.
// Runs after `vite build` (see package.json "build" script).

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { build } from 'vite'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const distDir = join(root, 'dist')

// 1. SSR bundle with route meta + clinic data (no React inside)
await build({
  root,
  logLevel: 'warn',
  build: {
    ssr: 'src/seo/prerender-entry.ts',
    outDir: 'dist-ssr',
    emptyOutDir: true,
  },
})

const entry = await import(pathToFileURL(join(root, 'dist-ssr', 'prerender-entry.js')).href)
const { ROUTE_META, SITE_URL, buildJsonLd, renderSeoStatic } = entry

const template = readFileSync(join(distDir, 'index.html'), 'utf8')
const OG_IMAGE = `${SITE_URL}/images/Hero_One.jpg`

const esc = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')

function setMeta(html, attr, key, content) {
  const re = new RegExp(`<meta ${attr}="${key}" content="[^"]*" ?/?>`)
  const tag = `<meta ${attr}="${key}" content="${esc(content)}" />`
  return re.test(html) ? html.replace(re, tag) : html.replace('</head>', `    ${tag}\n  </head>`)
}

function renderPage(path) {
  const meta = ROUTE_META[path]
  const canonical = `${SITE_URL}${path}`
  const robots = meta.noindex ? 'noindex, nofollow' : 'index, follow'

  let html = template
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${esc(meta.title)}</title>`)
  html = setMeta(html, 'name', 'description', meta.description)
  html = setMeta(html, 'name', 'robots', robots)
  html = setMeta(html, 'property', 'og:title', meta.title)
  html = setMeta(html, 'property', 'og:description', meta.description)
  html = setMeta(html, 'property', 'og:url', canonical)
  html = setMeta(html, 'property', 'og:image', OG_IMAGE)
  html = setMeta(html, 'name', 'twitter:title', meta.title)
  html = setMeta(html, 'name', 'twitter:description', meta.description)
  html = setMeta(html, 'name', 'twitter:image', OG_IMAGE)

  // canonical
  const canonicalTag = `<link rel="canonical" href="${canonical}" />`
  html = /<link rel="canonical"/.test(html)
    ? html.replace(/<link rel="canonical"[^>]*>/, canonicalTag)
    : html.replace('</head>', `    ${canonicalTag}\n  </head>`)

  // JSON-LD
  const ld = buildJsonLd(path)
    .map((obj) => `    <script type="application/ld+json">${JSON.stringify(obj)}</script>`)
    .join('\n')
  html = html.replace('</head>', `${ld}\n  </head>`)

  // static semantic block (visually hidden; replaced by React on mount)
  html = html.replace('<div id="root"></div>', `<div id="root">${renderSeoStatic(path)}</div>`)

  return html
}

for (const path of Object.keys(ROUTE_META)) {
  const html = renderPage(path)
  if (path === '/') {
    writeFileSync(join(distDir, 'index.html'), html)
  } else {
    const dir = join(distDir, path)
    mkdirSync(dir, { recursive: true })
    writeFileSync(join(dir, 'index.html'), html)
  }
  console.log(`prerendered ${path}`)
}

// sitemap.xml — indexable routes only
const lastmod = new Date().toISOString().slice(0, 10)
const urls = Object.keys(ROUTE_META)
  .filter((p) => !ROUTE_META[p].noindex)
  .map(
    (p) =>
      `  <url><loc>${SITE_URL}${p === '/' ? '/' : p}</loc><lastmod>${lastmod}</lastmod><priority>${p === '/' ? '1.0' : '0.8'}</priority></url>`
  )
  .join('\n')
writeFileSync(
  join(distDir, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`
)
console.log('sitemap.xml written')
