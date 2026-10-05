interface LogoProps {
  className?: string
}

export function Logo({ className }: LogoProps) {
  return (
    <img
      src="/images/logo-header.png"
      alt="KARAT TITAN — стоматология"
      className={`h-16 w-auto lg:h-[72px] ${className ?? ''}`}
    />
  )
}
