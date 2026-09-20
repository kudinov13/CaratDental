import { useContext } from 'react'
import { SmoothScrollContext } from '../components/SmoothScrollContext'

export function useLenis() {
  return useContext(SmoothScrollContext).lenis
}
