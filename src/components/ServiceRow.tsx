'use client'

import { ArrowRight } from 'lucide-react'

interface ServiceRowProps {
  index: string
  title: string
  description: string
  image: string
}

export function ServiceRow({ index, title, description, image }: ServiceRowProps) {
  return (
    <article className="group relative border-b border-line py-6 transition-colors duration-300 hover:bg-bg-secondary md:py-8">
      <div className="shell flex items-start justify-between gap-6">
        <div className="flex items-start gap-4 transition-all duration-300 group-hover:pl-4 md:gap-8">
          <span className="font-display text-sm text-text-muted md:text-base">
            {index}
          </span>
          <div>
            <h3 className="font-display text-xl font-medium text-ink md:text-2xl">
              {title}
            </h3>
            <p className="mt-2 max-w-[50ch] text-sm text-text-secondary md:text-base">
              {description}
            </p>
          </div>
        </div>
        <ArrowRight
          className="mt-2 h-5 w-5 shrink-0 text-text-muted transition-transform duration-300 group-hover:translate-x-2 group-hover:text-ink md:h-6 md:w-6"
          aria-hidden="true"
        />
      </div>
      <div
        className="pointer-events-none absolute right-[10%] top-1/2 z-10 hidden h-32 w-44 -translate-y-1/2 overflow-hidden rounded-radius-card-sm opacity-0 shadow-md transition-opacity duration-300 group-hover:opacity-100 lg:block"
        aria-hidden="true"
      >
        <img
          src={image}
          alt=""
          loading="lazy"
          className="h-full w-full object-cover"
        />
      </div>
    </article>
  )
}
