import { useOutletContext } from 'react-router-dom'

export interface LayoutContext {
  openBooking: () => void
}

export function useBooking() {
  return useOutletContext<LayoutContext>()
}
