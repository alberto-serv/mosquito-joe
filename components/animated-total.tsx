"use client"

import { useEffect, useRef, useState } from "react"

/**
 * Counts from the previous value to the next one whenever `value` changes.
 * Skips the animation on first paint and under reduced-motion.
 */
export function useAnimatedNumber(value: number, duration = 620) {
  const [display, setDisplay] = useState(value)
  const from = useRef(value)
  const frame = useRef<number>()
  const mounted = useRef(false)

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true
      from.current = value
      setDisplay(value)
      return
    }
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (reduced || from.current === value) {
      from.current = value
      setDisplay(value)
      return
    }

    const start = performance.now()
    const origin = from.current
    const delta = value - origin

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration)
      // easeOutQuint — fast commit, soft landing
      const eased = 1 - Math.pow(1 - t, 5)
      setDisplay(origin + delta * eased)
      if (t < 1) frame.current = requestAnimationFrame(tick)
      else from.current = value
    }
    frame.current = requestAnimationFrame(tick)
    return () => {
      if (frame.current) cancelAnimationFrame(frame.current)
      from.current = value
    }
  }, [value, duration])

  return display
}

export function AnimatedTotal({
  value,
  className = "",
  prefix = "$",
}: {
  value: number
  className?: string
  prefix?: string
}) {
  const display = useAnimatedNumber(value)
  return (
    <span className={`tabular ${className}`}>
      {prefix}
      {Math.round(display).toLocaleString("en-US")}
    </span>
  )
}
