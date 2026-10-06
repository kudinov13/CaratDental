// SSR-only entry: pure data + HTML/JSON-LD builders. No React imports —
// this file is bundled with `vite build --ssr` and executed in node
// by scripts/prerender.mjs.

import { ROUTE_META, SITE_URL } from './routes'
import { branches, formatPrice } from '../data/clinic'
import { doctors } from '../data/doctors'
import { priceCategories } from '../data/prices'
import { serviceCategories } from '../data/services'
import { clinicCases } from '../data/cases'
import { reviews } from '../data/reviews'
import { faq } from '../data/faq'

export { ROUTE_META, SITE_URL }

const OG_IMAGE = `${SITE_URL}/images/Hero_One.jpg`

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

const tel = (phone: string) => `tel:${phone.replace(/[^+\d]/g, '')}`

// ---------- JSON-LD ----------

const org = {
  '@type': 'MedicalOrganization',
  '@id': `${SITE_URL}/#org`,
  name: 'Стоматология KARAT TITAN',
  legalName: 'ООО «Карат-Титан»',
  taxID: '7224094294',
  url: SITE_URL,
  logo: `${SITE_URL}/images/logo-header.png`,
  sameAs: ['https://vk.ru/publickarat'],
  telephone: '+7 (912) 388-78-12',
}

const openingHours = {
  '@type': 'OpeningHoursSpecification',
  dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
  opens: '09:00',
  closes: '21:00',
}

const branchEntities = [
  {
    '@type': 'Dentist',
    '@id': `${SITE_URL}/#m7a`,
    name: 'Стоматология KARAT TITAN — 7а микрорайон',
    parentOrganization: { '@id': `${SITE_URL}/#org` },
    image: OG_IMAGE,
    priceRange: '₽₽',
    telephone: '+7 (912) 388-78-12',
    url: SITE_URL,
    openingHoursSpecification: openingHours,
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'мкр. 7а, д. 7а',
      addressLocality: 'Тобольск',
      addressRegion: 'Тюменская область',
      postalCode: '626157',
      addressCountry: 'RU',
    },
    geo: { '@type': 'GeoCoordinates', latitude: 58.23454, longitude: 68.27473 },
  },
  {
    '@type': 'Dentist',
    '@id': `${SITE_URL}/#m15`,
    name: 'Стоматология KARAT TITAN — детская стоматология, 15-й микрорайон',
    parentOrganization: { '@id': `${SITE_URL}/#org` },
    image: OG_IMAGE,
    priceRange: '₽₽',
    telephone: '+7 (922) 268-80-09',
    url: SITE_URL,
    openingHoursSpecification: openingHours,
    address: {
      '@type': 'PostalAddress',
      streetAddress: '15-й мкр., д. 18',
      addressLocality: 'Тобольск',
      addressRegion: 'Тюменская область',
      postalCode: '626158',
      addressCountry: 'RU',
    },
    geo: { '@type': 'GeoCoordinates', latitude: 58.22598, longitude: 68.30531 },
  },
]

const PAGE_NAMES: Record<string, string> = {
  '/uslugi': 'Услуги',
  '/vrachi': 'Врачи',
  '/tseny': 'Цены',
  '/kejsy': 'Кейсы',
  '/otzyvy': 'Отзывы',
  '/kontakty': 'Контакты',
  '/politika-konfidencialnosti': 'Политика конфиденциальности',
}

export function buildJsonLd(path: string): object[] {
  const graph: object[] = [org, ...branchEntities]

  if (path !== '/' && PAGE_NAMES[path]) {
    graph.push({
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Главная', item: `${SITE_URL}/` },
        { '@type': 'ListItem', position: 2, name: PAGE_NAMES[path], item: `${SITE_URL}${path}` },
      ],
    })
  }

  if (path === '/vrachi') {
    for (const d of doctors) {
      graph.push({
        '@type': 'Physician',
        name: d.name,
        medicalSpecialty: 'Dentistry',
        description: d.role,
        ...(d.photo ? { image: `${SITE_URL}${d.photo}` } : {}),
        worksFor: d.branchIds.map((id) => ({ '@id': `${SITE_URL}/#${id}` })),
      })
    }
  }

  if (path === '/') {
    graph.push({
      '@type': 'FAQPage',
      mainEntity: faq.map((f) => ({
        '@type': 'Question',
        name: f.question,
        acceptedAnswer: { '@type': 'Answer', text: f.answer },
      })),
    })
  }

  return [{ '@context': 'https://schema.org', '@graph': graph }]
}

// ---------- Static SEO content (inside <div id="root">, replaced by React) ----------

const NAV: [string, string][] = [
  ['/', 'Главная'],
  ['/uslugi', 'Услуги'],
  ['/vrachi', 'Врачи'],
  ['/tseny', 'Цены'],
  ['/kejsy', 'Кейсы'],
  ['/otzyvy', 'Отзывы'],
  ['/kontakty', 'Контакты'],
]

function navHtml(): string {
  return `<nav aria-label="Карта сайта"><ul>${NAV.map(
    ([href, label]) => `<li><a href="${href}">${label}</a></li>`
  ).join('')}</ul></nav>`
}

function branchesHtml(): string {
  return `<section><h2>Филиалы</h2><ul>${branches
    .map(
      (b) =>
        `<li><strong>${esc(b.name)} — ${esc(b.shortName)}</strong>: ${esc(b.address)}, ` +
        `<a href="${tel(b.phone)}">${esc(b.phone)}</a>, ${esc(b.hours)}</li>`
    )
    .join('')}</ul></section>`
}

function doctorsHtml(): string {
  const branchName = (id: string) => branches.find((b) => b.id === id)?.shortName ?? id
  return `<section><h2>Врачи</h2><ul>${doctors
    .map(
      (d) =>
        `<li><strong>${esc(d.name)}</strong> — ${esc(d.role)}. ` +
        `Принимает: ${d.branchIds.map(branchName).join(', ')}.</li>`
    )
    .join('')}</ul></section>`
}

function servicesHtml(): string {
  return `<section><h2>Услуги</h2><ul>${serviceCategories
    .map((c) => `<li><strong>${esc(c.title)}</strong> — ${esc(c.description)}</li>`)
    .join('')}</ul></section>`
}

function pricesHtml(): string {
  return `<section><h2>Прайс-лист</h2>${priceCategories
    .map(
      (c) =>
        `<h3>${esc(c.title)}</h3><ul>${c.services
          .map((s) => `<li>${esc(s.name)} — ${formatPrice(s.price)}</li>`)
          .join('')}</ul>`
    )
    .join('')}</section>`
}

export function renderSeoStatic(path: string): string {
  const meta = ROUTE_META[path]
  const h1 = esc(meta?.h1 ?? meta?.title ?? 'KARAT TITAN')
  const intro = esc(meta?.description ?? '')

  let body = ''
  switch (path) {
    case '/':
      body = servicesHtml() + doctorsHtml() + branchesHtml()
      break
    case '/uslugi':
      body = servicesHtml()
      break
    case '/vrachi':
      body = doctorsHtml()
      break
    case '/tseny':
      body = pricesHtml()
      break
    case '/kejsy':
      body =
        `<section><h2>Кейсы</h2><ul>${clinicCases
          .map((c) => `<li><strong>${esc(c.title)}</strong> — ${esc(c.description)}</li>`)
          .join('')}</ul></section>`
      break
    case '/otzyvy':
      body =
        `<section><h2>Отзывы пациентов</h2>${reviews
          .map(
            (r) =>
              `<blockquote><p>${esc(r.text)}</p><footer>${esc(r.name)} — ${esc(r.tag)}</footer></blockquote>`
          )
          .join('')}</section>`
      break
    case '/kontakty':
      body = branchesHtml()
      break
    default:
      body = ''
  }

  return `<div class="seo-static"><h1>${h1}</h1><p>${intro}</p>${body}${navHtml()}</div>`
}
