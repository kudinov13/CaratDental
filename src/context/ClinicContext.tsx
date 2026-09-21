'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { ClinicContext } from './clinic'
import { branches as staticBranches, doctors as staticDoctors } from '../data/clinic'
import type { Branch, Doctor } from '../data/clinic'

export interface ClinicData {
  branches: Branch[]
  doctors: Doctor[]
}

export function ClinicProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<ClinicData>({ branches: staticBranches, doctors: staticDoctors })

  useEffect(() => {
    fetch('/api/clinic')
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        if (json?.branches?.length) setData(json)
      })
      .catch(() => {})
  }, [])

  return <ClinicContext.Provider value={data}>{children}</ClinicContext.Provider>
}
