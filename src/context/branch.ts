import { createContext, useContext } from 'react'

export type BranchId = string | 'all'

export interface BranchContextValue {
  branch: BranchId
  setBranch: (id: BranchId) => void
}

export const BranchContext = createContext<BranchContextValue>({
  branch: 'all',
  setBranch: () => {},
})

export function useBranch() {
  return useContext(BranchContext)
}
