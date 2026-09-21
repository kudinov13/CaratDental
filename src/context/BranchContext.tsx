'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { BranchContext, type BranchId } from './branch'

const STORAGE_KEY = 'karat-branch'

export function BranchProvider({ children }: { children: ReactNode }) {
  const [branch, setBranchState] = useState<BranchId>('all')

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) setBranchState(saved)
  }, [])

  const setBranch = (id: BranchId) => {
    setBranchState(id)
    localStorage.setItem(STORAGE_KEY, id)
  }

  return (
    <BranchContext.Provider value={{ branch, setBranch }}>
      {children}
    </BranchContext.Provider>
  )
}
