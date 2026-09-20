'use client'

import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from 'framer-motion'

interface BeforeAfterCanvasProps {
  beforeSrc: string
  afterSrc: string
  alt: string
  brushRadius?: number
}

export function BeforeAfterCanvas({
  beforeSrc,
  afterSrc,
  alt,
  brushRadius = 120,
}: BeforeAfterCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const maskRef = useRef<HTMLCanvasElement | null>(null)
  const beforeImg = useRef<HTMLImageElement | null>(null)
  const afterImg = useRef<HTMLImageElement | null>(null)
  const [loaded, setLoaded] = useState(false)
  const reduceMotion = useReducedMotion()
  const [isTouch, setIsTouch] = useState(false)

  // Detect touch device once.
  useEffect(() => {
    const onTouch = () => setIsTouch(true)
    window.addEventListener('touchstart', onTouch, { passive: true, once: true })
    return () => window.removeEventListener('touchstart', onTouch)
  }, [])

  // Load images.
  useEffect(() => {
    const before = new Image()
    const after = new Image()
    before.crossOrigin = 'anonymous'
    after.crossOrigin = 'anonymous'
    let loadedCount = 0
    const onLoad = () => {
      loadedCount += 1
      if (loadedCount === 2) {
        beforeImg.current = before
        afterImg.current = after
        setLoaded(true)
      }
    }
    before.onload = onLoad
    after.onload = onLoad
    before.src = beforeSrc
    after.src = afterSrc
  }, [beforeSrc, afterSrc])

  // Set up canvas sizes and mask.
  useEffect(() => {
    if (!loaded || !canvasRef.current || !containerRef.current) return
    const canvas = canvasRef.current
    const rect = containerRef.current.getBoundingClientRect()
    const dpr = Math.min(window.devicePixelRatio, 2)
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    canvas.style.width = `${rect.width}px`
    canvas.style.height = `${rect.height}px`
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.scale(dpr, dpr)

    const mask = document.createElement('canvas')
    mask.width = canvas.width
    mask.height = canvas.height
    maskRef.current = mask
    draw(ctx, rect.width, rect.height)
  }, [loaded])

  const draw = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    drawBefore = true
  ) => {
    ctx.clearRect(0, 0, width, height)
    if (afterImg.current) {
      ctx.drawImage(afterImg.current, 0, 0, width, height)
    }
    if (drawBefore && beforeImg.current && maskRef.current) {
      ctx.save()
      ctx.drawImage(beforeImg.current, 0, 0, width, height)
      ctx.globalCompositeOperation = 'destination-in'
      ctx.drawImage(maskRef.current, 0, 0, width, height)
      ctx.restore()
    }
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !maskRef.current || reduceMotion || isTouch) return
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const maskCtx = maskRef.current.getContext('2d')
    if (!maskCtx) return
    const dpr = Math.min(window.devicePixelRatio, 2)
    maskCtx.save()
    maskCtx.scale(dpr, dpr)
    const gradient = maskCtx.createRadialGradient(
      x,
      y,
      0,
      x,
      y,
      brushRadius
    )
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)')
    gradient.addColorStop(0.6, 'rgba(255, 255, 255, 0.82)')
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)')
    maskCtx.beginPath()
    maskCtx.arc(x, y, brushRadius, 0, Math.PI * 2)
    maskCtx.fillStyle = gradient
    maskCtx.fill()
    maskCtx.restore()

    const ctx = canvas.getContext('2d')
    if (!ctx) return
    draw(ctx, rect.width, rect.height)
  }

  const isStatic = reduceMotion || isTouch

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden rounded-b-radius-card"
      aria-label={alt}
    >
      {!loaded ? (
        <div className="h-full w-full bg-bg-tertiary" />
      ) : isStatic ? (
        <img
          src={afterSrc}
          alt={alt}
          className="h-full w-full object-cover"
          loading="eager"
        />
      ) : (
        <canvas
          ref={canvasRef}
          onPointerMove={handlePointerMove}
          onPointerEnter={handlePointerMove}
          className="h-full w-full cursor-none touch-none"
        />
      )}
    </div>
  )
}
