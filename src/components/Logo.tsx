import { Gem } from 'lucide-react'

interface LogoProps {
  className?: string
}

export function Logo({ className }: LogoProps) {
  return (
    <span className={`inline-flex items-center gap-2.5 text-ink ${className ?? ''}`}>
      <span className="flex h-10 w-10 items-center justify-center rounded-full border border-accent-secondary/70 text-accent-primary">
        <Gem className="h-5 w-5" aria-hidden="true" />
      </span>
      <span className="flex flex-col items-start leading-none">
        <span className="font-display text-xl font-semibold tracking-[0.08em]">KARAT</span>
        <span className="mt-1 text-[9px] font-semibold uppercase tracking-[0.2em] text-text-secondary">
          стоматология
        </span>
      </span>
    </span>
  )
}
