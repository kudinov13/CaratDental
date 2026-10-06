import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { ROUTE_META, SITE_URL } from './routes'

const DEFAULT_TITLE = 'Стоматология KARAT TITAN в Тобольске'
const DEFAULT_DESCRIPTION =
  'Стоматология KARAT TITAN в Тобольске — 2 филиала, лечение без боли, имплантация, ортодонтия, детская стоматология. Онлайн-запись к врачу.'
const OG_IMAGE = `${SITE_URL}/images/Hero_One.jpg`

function setMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.content = content
}

function setCanonical(href: string) {
  let el = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  if (!el) {
    el = document.createElement('link')
    el.rel = 'canonical'
    document.head.appendChild(el)
  }
  el.href = href
}

export function usePageMeta() {
  const { pathname } = useLocation()

  useEffect(() => {
    const meta = ROUTE_META[pathname]
    const title = meta?.title ?? DEFAULT_TITLE
    const description = meta?.description ?? DEFAULT_DESCRIPTION
    const canonical = `${SITE_URL}${pathname}`
    const robots = meta?.noindex || !meta ? 'noindex, nofollow' : 'index, follow'

    document.title = title
    setMeta('name', 'description', description)
    setMeta('name', 'robots', robots)
    setCanonical(canonical)
    setMeta('property', 'og:type', 'website')
    setMeta('property', 'og:title', title)
    setMeta('property', 'og:description', description)
    setMeta('property', 'og:url', canonical)
    setMeta('property', 'og:image', OG_IMAGE)
    setMeta('property', 'og:locale', 'ru_RU')
    setMeta('name', 'twitter:card', 'summary_large_image')
    setMeta('name', 'twitter:title', title)
    setMeta('name', 'twitter:description', description)
    setMeta('name', 'twitter:image', OG_IMAGE)
  }, [pathname])
}
