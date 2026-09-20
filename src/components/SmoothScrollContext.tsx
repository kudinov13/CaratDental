import { createContext } from 'react'
import type Lenis from 'lenis'

interface SmoothScrollContextValue {
  lenis: Lenis | null
}

export const SmoothScrollContext = createContext<SmoothScrollContextValue>({
  lenis: null,
})
