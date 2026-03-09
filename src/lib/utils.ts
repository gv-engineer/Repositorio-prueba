import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, formatDistanceToNow, parseISO } from "date-fns"
import { es } from "date-fns/locale"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Date formatting utilities
export function formatDate(date: Date | string, formatStr: string = "PPP"): string {
  const d = typeof date === "string" ? parseISO(date) : date
  return format(d, formatStr, { locale: es })
}

export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === "string" ? parseISO(date) : date
  return formatDistanceToNow(d, { addSuffix: true, locale: es })
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === "string" ? parseISO(date) : date
  return format(d, "PPP p", { locale: es })
}

// Magnitude formatting
export function formatMagnitude(magnitude: number): string {
  return magnitude.toFixed(1)
}

export function getMagnitudeColor(magnitude: number): string {
  if (magnitude < 3) return "#22c55e" // green-500
  if (magnitude < 5) return "#eab308" // yellow-500
  if (magnitude < 6) return "#f97316" // orange-500
  if (magnitude < 7) return "#ef4444" // red-500
  if (magnitude < 8) return "#dc2626" // red-600
  return "#991b1b" // red-800
}

export function getMagnitudeClass(magnitude: number): string {
  if (magnitude < 3) return "magnitude-low"
  if (magnitude < 5) return "magnitude-moderate"
  if (magnitude < 6) return "magnitude-strong"
  if (magnitude < 7) return "magnitude-major"
  if (magnitude < 8) return "magnitude-great"
  return "magnitude-extreme"
}

// Depth formatting
export function formatDepth(depth: number): string {
  return `${Math.round(depth)} km`
}

export function getDepthClass(depth: number): string {
  if (depth < 70) return "shallow"
  if (depth < 300) return "intermediate"
  return "deep"
}

// Number formatting
export function formatNumber(num: number): string {
  return new Intl.NumberFormat("es-PE").format(num)
}

export function formatScientific(num: number): string {
  if (num < 1000) return num.toFixed(2)
  return num.toExponential(2)
}

// Energy formatting
export function formatEnergy(joules: number): string {
  if (joules >= 1e18) return `${(joules / 1e18).toFixed(2)} EJ`
  if (joules >= 1e15) return `${(joules / 1e15).toFixed(2)} PJ`
  if (joules >= 1e12) return `${(joules / 1e12).toFixed(2)} TJ`
  if (joules >= 1e9) return `${(joules / 1e9).toFixed(2)} GJ`
  if (joules >= 1e6) return `${(joules / 1e6).toFixed(2)} MJ`
  return `${joules.toFixed(2)} J`
}

// Coordinates formatting
export function formatCoordinates(lat: number, lng: number): string {
  const latDir = lat >= 0 ? "N" : "S"
  const lngDir = lng >= 0 ? "E" : "W"
  return `${Math.abs(lat).toFixed(4)}°${latDir}, ${Math.abs(lng).toFixed(4)}°${lngDir}`
}

// Alert level utilities
export function getAlertColor(alert: string | null): string {
  switch (alert) {
    case "green": return "#22c55e"
    case "yellow": return "#eab308"
    case "orange": return "#f97316"
    case "red": return "#ef4444"
    default: return "#6b7280"
  }
}

export function getAlertLabel(alert: string | null): string {
  switch (alert) {
    case "green": return "Menor"
    case "yellow": return "Moderado"
    case "orange": return "Significativo"
    case "red": return "Mayor"
    default: return "Sin alerta"
  }
}

// Debounce utility
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// Throttle utility
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => { inThrottle = false }, limit)
    }
  }
}

// Array utilities
export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((result, item) => {
    const group = String(item[key])
    if (!result[group]) result[group] = []
    result[group].push(item)
    return result
  }, {} as Record<string, T[]>)
}

export function sortBy<T>(array: T[], key: keyof T, order: "asc" | "desc" = "asc"): T[] {
  return [...array].sort((a, b) => {
    const aVal = a[key]
    const bVal = b[key]
    if (aVal < bVal) return order === "asc" ? -1 : 1
    if (aVal > bVal) return order === "asc" ? 1 : -1
    return 0
  })
}

// Color utilities
export function interpolateColor(color1: string, color2: string, factor: number): string {
  const hex = (c: string) => parseInt(c, 16)
  const r1 = hex(color1.slice(1, 3))
  const g1 = hex(color1.slice(3, 5))
  const b1 = hex(color1.slice(5, 7))
  const r2 = hex(color2.slice(1, 3))
  const g2 = hex(color2.slice(3, 5))
  const b2 = hex(color2.slice(5, 7))
  
  const r = Math.round(r1 + factor * (r2 - r1))
  const g = Math.round(g1 + factor * (g2 - g1))
  const b = Math.round(b1 + factor * (b2 - b1))
  
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`
}

// ID generation
export function generateId(): string {
  return Math.random().toString(36).substring(2, 15)
}

// Safe parse JSON
export function safeParseJSON<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json) as T
  } catch {
    return fallback
  }
}

// Local storage utilities
export function getFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback
  const stored = localStorage.getItem(key)
  if (!stored) return fallback
  return safeParseJSON(stored, fallback)
}

export function setToStorage<T>(key: string, value: T): void {
  if (typeof window === "undefined") return
  localStorage.setItem(key, JSON.stringify(value))
}

// Range generator
export function range(start: number, end: number, step: number = 1): number[] {
  const result: number[] = []
  for (let i = start; i <= end; i += step) {
    result.push(i)
  }
  return result
}

// Clamp number
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

// Linear interpolation
export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t
}
