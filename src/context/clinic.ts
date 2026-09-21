import { createContext, useContext } from 'react'
import { branches as staticBranches, doctors as staticDoctors } from '../data/clinic'
import type { Branch, Doctor } from '../data/clinic'

export interface ClinicData {
  branches: Branch[]
  doctors: Doctor[]
}

export const ClinicContext = createContext<ClinicData>({
  branches: staticBranches,
  doctors: staticDoctors,
})

export function useClinic() {
  return useContext(ClinicContext)
}
