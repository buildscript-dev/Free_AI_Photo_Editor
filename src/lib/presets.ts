// Context presets = the PDF's "auto actions" table expressed as numeric adjustments.
// These are deterministic, free, offline. Ported to Dart, these numbers stay identical.

export type Context =
  | 'food'
  | 'portrait'
  | 'product'
  | 'landscape'
  | 'document'
  | 'event'
  | 'unknown'

export interface Adjust {
  brightness: number // 1 = none
  contrast: number // 1 = none
  saturation: number // 1 = none, 0 = grayscale
  warmth: number // -1..1, + = warmer
  sharpen: number // 0..1
  vignette: number // 0..1
}

export const NEUTRAL: Adjust = {
  brightness: 1,
  contrast: 1,
  saturation: 1,
  warmth: 0,
  sharpen: 0,
  vignette: 0,
}

export const PRESETS: Record<Context, Adjust> = {
  food: { brightness: 1.12, contrast: 1.08, saturation: 1.2, warmth: 0.35, sharpen: 0.4, vignette: 0 },
  portrait: { brightness: 1.08, contrast: 1.02, saturation: 1.05, warmth: 0.15, sharpen: 0.15, vignette: 0.05 },
  product: { brightness: 1.05, contrast: 1.12, saturation: 1.15, warmth: 0, sharpen: 0.6, vignette: 0 },
  landscape: { brightness: 1.02, contrast: 1.18, saturation: 1.25, warmth: 0.05, sharpen: 0.3, vignette: 0.1 },
  document: { brightness: 1.1, contrast: 1.5, saturation: 0, warmth: 0, sharpen: 0.7, vignette: 0 },
  event: { brightness: 1.05, contrast: 1.1, saturation: 1.3, warmth: 0.1, sharpen: 0.2, vignette: 0.2 },
  unknown: { brightness: 1.05, contrast: 1.05, saturation: 1.1, warmth: 0.05, sharpen: 0.25, vignette: 0 },
}

export const CONTEXT_META: Record<Context, { label: string; theme: string; emoji: string }> = {
  food: { label: 'Food / Recipe', theme: 'Warm & Appetising', emoji: '🍔' },
  portrait: { label: 'Portrait / Selfie', theme: 'Clean & Professional', emoji: '🧑' },
  product: { label: 'Product / Item', theme: 'E-commerce Ready', emoji: '📦' },
  landscape: { label: 'Landscape / Travel', theme: 'Vivid & Cinematic', emoji: '🏔️' },
  document: { label: 'Text / Document', theme: 'Clear & Readable', emoji: '📄' },
  event: { label: 'Event / Party', theme: 'Fun & Energetic', emoji: '🎉' },
  unknown: { label: 'Auto Best-Fit', theme: 'Balanced', emoji: '✨' },
}
