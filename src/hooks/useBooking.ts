import { useOutletContext } from 'react-router-dom'

export interface LayoutContext {
  openBooking: (doctorId?: string) => void
}

export function useBooking() {
  return useOutletContext<LayoutContext>()
}
